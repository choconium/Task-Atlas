const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const path = require("node:path");
const { createServer, store } = require("../backend/server");
const { createWorkerFetch } = require("../backend/app/worker-router");

let server;
let baseUrl;
let brokenServer;
let brokenBaseUrl;

function request(method, pathname, base = baseUrl) {
  return new Promise((resolve, reject) => {
    const requestUrl = new URL(pathname, base);
    const client = http.request(
      requestUrl,
      { method, agent: false },
      (response) => {
        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () =>
          resolve({
            status: response.statusCode,
            headers: response.headers,
            body,
          }),
        );
      },
    );
    client.on("error", reject);
    client.end();
  });
}

function listen(httpServer) {
  return new Promise((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(0, "127.0.0.1", () => {
      httpServer.off("error", reject);
      resolve(`http://127.0.0.1:${httpServer.address().port}`);
    });
  });
}

function close(httpServer) {
  if (!httpServer?.listening) return Promise.resolve();
  return new Promise((resolve, reject) =>
    httpServer.close((error) => (error ? reject(error) : resolve())),
  );
}

// A store whose list routes throw with a filesystem-looking message, to
// check that 500 bodies never echo error details.
const LEAKY_MESSAGE = "ENOENT: /srv/secret/atlas/seeds/objects.json";
function brokenStore() {
  const counts = Object.fromEntries(
    [
      "objects",
      "scenes",
      "states",
      "intents",
      "skills",
      "taskTemplates",
      "tasks",
      "evidence",
      "expansionLoops",
      "expansionRelations",
    ].map((key) => [key, []]),
  );
  return {
    root: store.root,
    data: counts,
    maps: { scenes: new Map() },
    listObjects() {
      throw new Error(LEAKY_MESSAGE);
    },
    listTasks() {
      throw new TypeError(LEAKY_MESSAGE);
    },
  };
}

test.before(async () => {
  server = createServer();
  baseUrl = await listen(server);
  brokenServer = createServer({
    store: brokenStore(),
    frontendDir: path.join(store.root, "frontend"),
  });
  brokenBaseUrl = await listen(brokenServer);
});

test.after(async () => {
  await close(server);
  await close(brokenServer);
});

test("HEAD mirrors GET headers for static files and JSON routes without a body", async () => {
  for (const pathname of ["/", "/api/health", "/api/tasks?limit=2", "/api/export/tasks.csv"]) {
    const get = await request("GET", pathname);
    const head = await request("HEAD", pathname);
    assert.equal(get.status, 200, pathname);
    assert.equal(head.status, 200, pathname);
    assert.equal(head.body, "", `${pathname}: HEAD must not send a body`);
    assert.equal(
      head.headers["content-type"],
      get.headers["content-type"],
      pathname,
    );
    assert.equal(
      head.headers["content-length"],
      String(Buffer.byteLength(get.body)),
      `${pathname}: HEAD must report the GET body length`,
    );
  }
  const missing = await request("HEAD", "/no-such-file.txt");
  assert.equal(missing.status, 404);
  assert.equal(missing.body, "");
});

test("OPTIONS answers 204 with Allow and CORS headers on static and API paths", async () => {
  for (const pathname of ["/", "/styles.css", "/api/tasks", "/api/health"]) {
    const response = await request("OPTIONS", pathname);
    assert.equal(response.status, 204, pathname);
    assert.equal(response.body, "");
    assert.equal(response.headers.allow, "GET, HEAD, OPTIONS");
    assert.equal(response.headers["access-control-allow-origin"], "*");
    assert.equal(
      response.headers["access-control-allow-methods"],
      "GET, HEAD, OPTIONS",
    );
    assert.equal(
      response.headers["access-control-allow-headers"],
      "Accept, Content-Type",
    );
  }
});

test("write methods stay 405 and advertise the supported methods", async () => {
  for (const [method, pathname] of [
    ["POST", "/"],
    ["PUT", "/index.html"],
    ["POST", "/api/tasks"],
    ["DELETE", "/api/health"],
  ]) {
    const response = await request(method, pathname);
    assert.equal(response.status, 405, `${method} ${pathname}`);
    assert.equal(response.headers.allow, "GET, HEAD, OPTIONS");
    assert.match(response.headers["content-type"], /application\/json/);
    assert.ok(JSON.parse(response.body).error);
  }
});

test("export routes carry CORS and Cache-Control headers like JSON routes", async () => {
  for (const pathname of ["/api/export/tasks.json", "/api/export/tasks.csv"]) {
    const response = await request("GET", pathname);
    assert.equal(response.status, 200, pathname);
    assert.equal(response.headers["access-control-allow-origin"], "*");
    assert.equal(response.headers["cache-control"], "no-store");
    assert.match(response.headers["content-disposition"] || "", /attachment/);
  }
});

test("500 responses never include error details", async () => {
  for (const pathname of ["/api/objects", "/api/tasks"]) {
    const response = await request("GET", pathname, brokenBaseUrl);
    assert.equal(response.status, 500, pathname);
    assert.match(response.headers["content-type"], /application\/json/);
    const payload = JSON.parse(response.body);
    assert.deepEqual(payload, { error: "Internal server error" });
    assert.equal("detail" in payload, false);
    assert.doesNotMatch(response.body, /secret|ENOENT|TypeError/);
  }
  const head = await request("HEAD", "/api/objects", brokenBaseUrl);
  assert.equal(head.status, 500);
  assert.equal(head.body, "");
});

test("list meta.total reports the full match count, not the page size", async () => {
  const tasks = JSON.parse((await request("GET", "/api/tasks?limit=1")).body);
  assert.equal(tasks.data.length, 1);
  assert.equal(tasks.meta.limit, 1);
  assert.equal(tasks.meta.total, store.data.tasks.length);
  assert.ok(tasks.meta.total > 1);

  const objects = JSON.parse((await request("GET", "/api/objects?limit=1")).body);
  assert.equal(objects.data.length, 1);
  assert.equal(objects.meta.limit, 1);
  assert.equal(objects.meta.total, store.data.objects.length);

  const filtered = JSON.parse(
    (await request("GET", "/api/objects?q=mustard&limit=1")).body,
  );
  assert.equal(filtered.meta.total, store.listObjects("mustard").length);

  const capped = JSON.parse((await request("GET", "/api/tasks?limit=9999")).body);
  assert.equal(capped.meta.limit, 500);
  assert.equal(capped.data.length, Math.min(500, capped.meta.total));
});

test("collection-card provenance names the bundle file that holds the task", async () => {
  const contextTask = store.data.tasks.find((task) =>
    task.id.startsWith("task_ctx_r1_"),
  );
  assert.ok(contextTask, "context_round1 bundle task must exist");
  const response = await request(
    "GET",
    `/api/tasks/${encodeURIComponent(contextTask.id)}/collection-card`,
  );
  assert.equal(response.status, 200);
  const { provenance } = JSON.parse(response.body).data;
  assert.equal(provenance.bundle, "context_round1.json");
  assert.equal(provenance.task_seed, "ycb_batches/");
  assert.equal(provenance.task_file, "ycb_batches/context_round1.json");
  assert.equal(provenance.planning_file, "ycb_batches/context_round1.json");
  assert.deepEqual(provenance.claims_files, ["ycb_batches/context_round1.json"]);

  const mustardTask = store.data.tasks.find((task) =>
    task.id.startsWith("task_mustard_"),
  );
  assert.ok(mustardTask, "base-seed mustard task must exist");
  const mustard = JSON.parse(
    (
      await request(
        "GET",
        `/api/tasks/${encodeURIComponent(mustardTask.id)}/collection-card`,
      )
    ).body,
  ).data.provenance;
  assert.equal(mustard.bundle, null);
  assert.equal(mustard.task_seed, "mustard_tasks.json");
  assert.equal(mustard.planning_seed, "task_planning.json");
  assert.equal(mustard.claims_seed, "claims.json");

  // Every bundle task must be attributed to a real bundle file, never guessed.
  const bundleTasks = store.data.tasks.filter(
    (task) => !mustardTaskIds().has(task.id),
  );
  const sample = bundleTasks.filter((_, index) => index % 50 === 0);
  for (const task of sample) {
    const card = store.collectionCard(task.id, parseDefaultContext());
    assert.match(card.provenance.bundle || "", /\.json$/, task.id);
    assert.equal(card.provenance.task_file, `ycb_batches/${card.provenance.bundle}`);
  }
});

function mustardTaskIds() {
  const { readFileSync } = require("node:fs");
  const rows = JSON.parse(
    readFileSync(path.join(store.root, "data", "seeds", "mustard_tasks.json"), "utf8"),
  );
  return new Set(rows.map((row) => row.id));
}

function parseDefaultContext() {
  const { parseContext } = require("../backend/app/assessment");
  return parseContext(new URLSearchParams());
}

test("task rows expose Japanese scene and intent names alongside English", async () => {
  const { data } = JSON.parse((await request("GET", "/api/tasks?limit=50")).body);
  assert.ok(data.length > 0);
  for (const task of data) {
    assert.equal(typeof task.scene_name_ja, "string", task.id);
    assert.ok(task.scene_name_ja.length > 0, task.id);
    assert.equal(typeof task.intent_name_ja, "string", task.id);
    assert.ok(task.intent_name_ja.length > 0, task.id);
    const scene = store.maps.scenes.get(task.scene_id);
    if (scene?.name_ja) assert.equal(task.scene_name_ja, scene.name_ja, task.id);
    const intent = store.maps.intents.get(task.intent_id);
    if (intent?.name_ja) assert.equal(task.intent_name_ja, intent.name_ja, task.id);
  }
});

test("evidence graph nodes are labelled with their source name", async () => {
  const evidence = store.data.evidence.find((item) => item.source_name);
  assert.ok(evidence, "evidence with a source_name must exist");
  const graph = JSON.parse(
    (
      await request(
        "GET",
        `/api/nodes/${encodeURIComponent(evidence.id)}/neighbors?lens=all`,
      )
    ).body,
  ).data;
  const center = graph.nodes.find((node) => node.id === evidence.id);
  assert.equal(center.label, evidence.source_name);
  assert.equal(center.name_en, evidence.source_name);
  for (const node of graph.nodes.filter((item) => item.node_type === "Evidence")) {
    const record = store.maps.evidence.get(node.id);
    assert.equal(node.label, record.source_name || record.id, node.id);
  }
});

test("Worker routes static HEAD to assets and OPTIONS through the Node adapter", async () => {
  const env = {
    ASSETS: {
      fetch(assetRequest) {
        return Promise.resolve(new Response(null, { status: 200, headers: { "x-served": assetRequest.method } }));
      },
    },
  };
  const workerFetch = createWorkerFetch((apiRequest) =>
    new Response(null, { status: 204, headers: { "x-served": `api:${apiRequest.method}` } }),
  );
  const head = await workerFetch(new Request("https://atlas.test/", { method: "HEAD" }), env, {});
  assert.equal(head.status, 200);
  assert.equal(head.headers.get("x-served"), "HEAD");
  const options = await workerFetch(new Request("https://atlas.test/", { method: "OPTIONS" }), env, {});
  assert.equal(options.headers.get("x-served"), "api:OPTIONS");
  const apiHead = await workerFetch(new Request("https://atlas.test/api/health", { method: "HEAD" }), env, {});
  assert.equal(apiHead.headers.get("x-served"), "api:HEAD");
});
