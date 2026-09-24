const test = require("node:test");
const assert = require("node:assert/strict");
const { createWorkerFetch } = require("../backend/app/worker-router");

test("Worker routes API paths through the Node HTTP adapter", async () => {
  const request = new Request("https://atlas.test/api/health");
  const env = { ASSETS: { fetch: () => assert.fail("API must not use assets") } };
  const context = { waitUntil() {} };
  let received;
  const workerFetch = createWorkerFetch(async (...args) => {
    received = args;
    return new Response("api");
  });

  const response = await workerFetch(request, env, context);

  assert.equal(await response.text(), "api");
  assert.deepEqual(received, [request, env, context]);
});

test("Worker delegates static GET requests to the Assets binding", async () => {
  const request = new Request("https://atlas.test/styles.css");
  let received;
  const env = {
    ASSETS: {
      fetch(assetRequest) {
        received = assetRequest;
        return Promise.resolve(new Response("asset"));
      },
    },
  };
  const workerFetch = createWorkerFetch(() => assert.fail("Assets must serve static GETs"));

  const response = await workerFetch(request, env, {});

  assert.equal(received, request);
  assert.equal(await response.text(), "asset");
});

test("Worker routes non-GET static requests through the API adapter for the Node 405 response", async () => {
  const request = new Request("https://atlas.test/", { method: "POST" });
  let received;
  const env = { ASSETS: { fetch: () => assert.fail("POST must not use assets") } };
  const workerFetch = createWorkerFetch((apiRequest) => {
    received = apiRequest;
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  });

  const response = await workerFetch(request, env, {});

  assert.equal(received, request);
  assert.equal(response.status, 405);
  assert.deepEqual(await response.json(), { error: "Method not allowed" });
});
