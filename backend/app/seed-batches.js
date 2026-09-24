const fs = require("node:fs");
const path = require("node:path");

// Sorted bundles keep independently authored catalog batches reproducible.
// Workers pass a statically bundled manifest because readdirSync is not
// available in the Workers runtime. Node keeps discovering bundles on disk.
function loadTaskBatches(seedDirectory, { filenames } = {}) {
  const directory = path.join(seedDirectory, "ycb_batches");
  const merged = {
    tasks: [],
    planning: [],
    claims: [],
    scenes: [],
    templates: [],
    external_objects: [],
    evidence: [],
  };
  const optionalArrays = new Set([
    "scenes",
    "templates",
    "external_objects",
    "evidence",
  ]);
  if (filenames === undefined && !fs.existsSync(directory)) return merged;
  const bundleFiles = filenames === undefined
    ? fs.readdirSync(directory).filter((name) => name.endsWith(".json")).sort()
    : [...filenames].sort();
  for (const filename of bundleFiles) {
    if (typeof filename !== "string" || path.basename(filename) !== filename || !filename.endsWith(".json"))
      throw new Error(`Invalid task bundle filename: ${filename}`);
    let bundle;
    try {
      bundle = JSON.parse(fs.readFileSync(path.join(directory, filename), "utf8"));
    } catch (error) {
      throw new Error(`${filename}: cannot load task bundle: ${error.message}`);
    }
    for (const key of Object.keys(merged)) {
      if (optionalArrays.has(key) && bundle[key] === undefined) continue;
      if (!Array.isArray(bundle[key])) throw new Error(`${filename}: ${key} must be an array`);
      merged[key].push(...bundle[key]);
    }
  }
  return merged;
}

module.exports = { loadTaskBatches };
