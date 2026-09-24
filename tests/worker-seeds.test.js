const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { createStore } = require("../backend/app/store");

const seedDirectory = path.join(__dirname, "..", "data", "seeds");
const batchDirectory = path.join(seedDirectory, "ycb_batches");
const batchManifest = JSON.parse(
  fs.readFileSync(path.join(seedDirectory, "ycb_batches_manifest.json"), "utf8"),
);

test("Worker bundle manifest covers every YCB batch and preserves Node seed counts", () => {
  const discoveredFiles = fs
    .readdirSync(batchDirectory)
    .filter((filename) => filename.endsWith(".json"))
    .sort();
  assert.deepEqual(batchManifest.files, discoveredFiles);

  const discoveredStore = createStore();
  const bundledStore = createStore({ seedBatchFiles: batchManifest.files });
  for (const key of ["objects", "taskTemplates", "tasks", "evidence"]) {
    assert.equal(bundledStore.data[key].length, discoveredStore.data[key].length, key);
  }
});
