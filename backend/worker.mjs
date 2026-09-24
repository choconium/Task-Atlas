import { httpServerHandler } from "cloudflare:node";
import batchManifest from "../data/seeds/ycb_batches_manifest.json";
import serverModule from "./server.js";
import storeModule from "./app/store.js";
import workerRouterModule from "./app/worker-router.js";

const { createServer } = serverModule;
const { createStore } = storeModule;
const { createWorkerFetch } = workerRouterModule;

// Wrangler bundles seed files into the Workers VFS at these preserved paths.
// The manifest avoids readdirSync, which is not implemented by Workers.
const store = createStore({
  root: "/bundle",
  seedDirectory: "/bundle/data/seeds",
  requireSeedFiles: true,
  seedBatchFiles: batchManifest.files,
});
const server = createServer({ store, frontendDir: "/bundle/frontend" });
server.listen(8787);

export default {
  fetch: createWorkerFetch(httpServerHandler({ port: 8787 })),
};
