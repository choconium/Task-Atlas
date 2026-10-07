const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");
const { createStore, tasksToCsv } = require("./app/store");
const { parseContext } = require("./app/assessment");

let defaultStore;
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";

function getDefaultStore() {
  if (!defaultStore) defaultStore = createStore();
  return defaultStore;
}

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

const ALLOWED_METHODS = "GET, HEAD, OPTIONS";
const CORS_HEADERS = Object.freeze({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": ALLOWED_METHODS,
  "Access-Control-Allow-Headers": "Accept, Content-Type",
});

function isHead(response) {
  return response.req?.method === "HEAD";
}

// HEAD responses carry the GET headers (including Content-Length) and no body.
function sendBody(response, status, body, headers) {
  response.writeHead(status, {
    "Content-Length": Buffer.byteLength(body),
    ...headers,
  });
  response.end(isHead(response) ? undefined : body);
}

function sendJson(response, status, payload, headers = {}) {
  sendBody(response, status, JSON.stringify(payload), {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...CORS_HEADERS,
    ...headers,
  });
}

function sendText(response, status, body, contentType, headers = {}) {
  sendBody(response, status, body, {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
    ...CORS_HEADERS,
    ...headers,
  });
}

function sendOptions(response) {
  response.writeHead(204, { Allow: ALLOWED_METHODS, ...CORS_HEADERS });
  response.end();
}

function methodNotAllowed(response, message = "Method not allowed") {
  sendJson(response, 405, { error: message }, { Allow: ALLOWED_METHODS });
}

function notFound(response, message = "Not found") {
  sendJson(response, 404, { error: message });
}

function badRequest(response, message) {
  sendJson(response, 400, { error: message });
}

function decodeSegment(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
}

function parseLimit(value, fallback = 200) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, 1), 500);
}

function apiHandler(request, response, url, store) {
  const pathname = url.pathname;
  if (request.method === "OPTIONS") return sendOptions(response);
  const segments = pathname.split("/").filter(Boolean).map(decodeSegment);
  if (segments.some((segment) => segment === null))
    return badRequest(response, "Invalid URL encoding");
  // HEAD is answered like GET; sendBody drops the payload.
  const method = request.method === "HEAD" ? "GET" : request.method;

  if (method === "GET" && pathname === "/api/health") {
    return sendJson(response, 200, {
      ok: true,
      service: "physical-ai-task-atlas",
      seed_counts: {
        objects: store.data.objects.length,
        scenes: store.data.scenes.length,
        states: store.data.states.length,
        intents: store.data.intents.length,
        skills: store.data.skills.length,
        task_templates: store.data.taskTemplates.length,
        task_instances: store.data.tasks.length,
        evidence: store.data.evidence.length,
        expansion_loops: store.data.expansionLoops.length,
        expansion_relations: store.data.expansionRelations.length,
        graph_store: process.env.GRAPH_STORE === "neo4j" ? "neo4j" : "json-compatible",
      },
    });
  }

  if (method !== "GET")
    return methodNotAllowed(
      response,
      "This MVP exposes read-only APIs. Proposal/review persistence is not implemented.",
    );

  let context;
  try {
    context = parseContext(url.searchParams);
  } catch (error) {
    return badRequest(response, error.message);
  }
  if (context.scene_id && !store.maps.scenes.has(context.scene_id))
    return badRequest(response, "Unknown scene_id");

  if (pathname === "/api/objects") {
    const query =
      url.searchParams.get("q") || url.searchParams.get("query") || "";
    const limit = parseLimit(url.searchParams.get("limit"), 200);
    const objects = store.listObjects(query);
    return sendJson(response, 200, {
      data: objects.slice(0, limit),
      meta: { total: objects.length, limit, query },
    });
  }

  if (
    segments[0] === "api" &&
    segments[1] === "objects" &&
    segments.length === 3
  ) {
    const detail = store.getObjectDetail(segments[2], context);
    return detail
      ? sendJson(response, 200, { data: detail })
      : notFound(response, "Object not found");
  }

  if (pathname === "/api/tasks/generate") {
    const objectId = url.searchParams.get("object_id");
    if (!objectId) return badRequest(response, "object_id is required");
    const generated = store.generateTasks(
      objectId,
      url.searchParams.get("scene_id") || undefined,
      context,
    );
    return generated
      ? sendJson(response, 200, { data: generated })
      : notFound(response, "Object not found");
  }

  if (pathname === "/api/tasks") {
    const filters = {
      q: url.searchParams.get("q") || "",
      object_id: url.searchParams.get("object_id") || "",
      intent_id: url.searchParams.get("intent_id") || "",
      skill_id: url.searchParams.get("skill_id") || "",
    };
    const limit = parseLimit(url.searchParams.get("limit"), 200);
    const tasks = store.listTasks(filters, context);
    return sendJson(response, 200, {
      data: tasks.slice(0, limit),
      meta: { total: tasks.length, limit, mode: context.mode },
    });
  }

  if (
    segments[0] === "api" &&
    segments[1] === "tasks" &&
    segments[3] === "collection-card" &&
    segments.length === 4
  ) {
    const card = store.collectionCard(
      segments[2],
      context,
      url.searchParams.get("procedure_id") || undefined,
    );
    if (card.error === "not_found") return notFound(response, "Task not found");
    if (card.error) return badRequest(response, card.message);
    return sendJson(response, 200, { data: card });
  }

  if (
    segments[0] === "api" &&
    segments[1] === "tasks" &&
    segments.length === 3
  ) {
    const detail = store.getTaskDetail(segments[2], context);
    return detail
      ? sendJson(response, 200, { data: detail })
      : notFound(response, "Task not found");
  }

  if (
    segments[0] === "api" &&
    segments[1] === "nodes" &&
    segments[3] === "neighbors" &&
    segments.length === 4
  ) {
    const lens = url.searchParams.get("lens") || "all";
    if (!["all", "context", "goals", "execution"].includes(lens))
      return badRequest(response, "Invalid lens");
    const graph = store.neighbors(segments[2], lens, context);
    return graph
      ? sendJson(response, 200, { data: graph })
      : notFound(response, "Node not found");
  }

  if (pathname === "/api/scenes")
    return sendJson(response, 200, { data: store.getScenes() });
  if (pathname === "/api/context-options")
    return sendJson(response, 200, { data: store.contextOptions() });
  if (pathname === "/api/states")
    return sendJson(response, 200, { data: store.getStates() });
  if (pathname === "/api/intents")
    return sendJson(response, 200, { data: store.getIntents() });
  if (pathname === "/api/skills")
    return sendJson(response, 200, { data: store.getSkills() });
  if (pathname === "/api/templates")
    return sendJson(response, 200, { data: store.getTemplates() });
  if (pathname === "/api/expansion-loops")
    return sendJson(response, 200, { data: store.getExpansionLoops() });

  if (pathname === "/api/search") {
    const query = url.searchParams.get("q") || "";
    return sendJson(response, 200, {
      data: store.search(query),
      meta: { query },
    });
  }

  if (pathname === "/api/export/tasks.json") {
    const body = JSON.stringify(
      {
        schema_version: "0.2",
        generated_at: new Date().toISOString(),
        review_note:
          "Task candidates, planning records, claims, and sources retain their review status. Proposed records are not confirmed observations, and claims are not globally ranked.",
        data: store.data.tasks,
        planning: store.data.planning,
        claims: store.data.claims,
        sources: store.data.evidence,
        scenes: store.data.scenes,
        task_templates: store.data.taskTemplates,
        expansion_loops: store.data.expansionLoops,
        expansion_relations: store.data.expansionRelations,
      },
      null,
      2,
    );
    return sendText(response, 200, body, "application/json; charset=utf-8", {
      "Content-Disposition":
        'attachment; filename="physical-ai-task-atlas-tasks.json"',
    });
  }

  if (pathname === "/api/export/tasks.csv") {
    const body = tasksToCsv(store.data.tasks, store.maps);
    return sendText(response, 200, body, "text/csv; charset=utf-8", {
      "Content-Disposition":
        'attachment; filename="physical-ai-task-atlas-tasks.csv"',
    });
  }

  return notFound(response, "API route not found");
}

function serveStatic(response, pathname, frontendDir) {
  const requested =
    pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filepath = path.resolve(frontendDir, requested);
  if (
    filepath !== frontendDir &&
    !filepath.startsWith(`${frontendDir}${path.sep}`)
  ) {
    return notFound(response, "Invalid static path");
  }
  if (!fs.existsSync(filepath)) return notFound(response);
  const stats = fs.statSync(filepath);
  if (!stats.isFile()) return notFound(response);
  const extension = path.extname(filepath).toLocaleLowerCase();
  response.writeHead(200, {
    "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
    "Content-Length": stats.size,
    "Cache-Control": "no-cache",
  });
  if (isHead(response)) return response.end();
  fs.createReadStream(filepath).pipe(response);
}

function createServer({ store = getDefaultStore(), frontendDir } = {}) {
  const staticDirectory = frontendDir || path.join(store.root, "frontend");
  return http.createServer((request, response) => {
    const requestUrl = new URL(
      request.url,
      `http://${request.headers.host || "localhost"}`,
    );
    try {
      if (requestUrl.pathname === "/api" || requestUrl.pathname.startsWith("/api/"))
        return apiHandler(request, response, requestUrl, store);
      if (request.method === "OPTIONS") return sendOptions(response);
      if (request.method !== "GET" && request.method !== "HEAD")
        return methodNotAllowed(response);
      return serveStatic(response, requestUrl.pathname, staticDirectory);
    } catch (error) {
      // Logged server-side only: error messages can carry filesystem paths.
      console.error(error);
      if (response.headersSent) return response.end();
      return sendJson(response, 500, { error: "Internal server error" });
    }
  });
}

if (require.main === module) {
  const server = createServer();
  server.listen(PORT, HOST, () => {
    console.log(`Physical AI Task Atlas listening on http://${HOST}:${PORT}`);
  });
}

module.exports = { createServer, get store() { return getDefaultStore(); } };
