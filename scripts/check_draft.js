#!/usr/bin/env node

// Validate draft bundles as if they were active, without touching data/seeds.
// Usage: node scripts/check_draft.js data/drafts/<bundle>.json [...]
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { defaultData, validateData } = require("./validate_seed_data");

const ROOT = path.resolve(__dirname, "..");
const SEED_DIR = path.join(ROOT, "data", "seeds");

const normalize = (value) =>
  String(value || "").toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function checkDrafts(draftPaths) {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "task-atlas-draft-"));
  try {
    fs.cpSync(SEED_DIR, scratch, { recursive: true });
    const activeTasks = defaultData(scratch).tasks;
    const draftTaskIds = new Set();
    const draftErrors = [];
    for (const draftPath of draftPaths) {
      const bundle = JSON.parse(fs.readFileSync(draftPath, "utf8"));
      for (const task of bundle.tasks || []) draftTaskIds.add(task.id);
      // New external objects must carry their own catalog identity claim.
      const identified = new Set(
        (bundle.claims || [])
          .filter((claim) => claim.claim_type === "catalog_identity")
          .map((claim) => claim.subject_id),
      );
      for (const object of bundle.external_objects || [])
        if (!identified.has(object.id))
          draftErrors.push(`${object.id}: missing catalog_identity claim`);
      fs.copyFileSync(
        draftPath,
        path.join(scratch, "ycb_batches", path.basename(draftPath)),
      );
    }
    const data = defaultData(scratch);
    const errors = [...draftErrors, ...validateData(data).errors];
    const drafted = data.tasks.filter((task) => draftTaskIds.has(task.id));

    const activeNames = new Map(
      activeTasks
        .filter((task) => !draftTaskIds.has(task.id))
        .map((task) => [normalize(task.name_en), task.id]),
    );
    const duplicateNames = drafted
      .filter((task) => activeNames.has(normalize(task.name_en)))
      .map((task) => `${task.id} repeats ${activeNames.get(normalize(task.name_en))}`);

    const granularity = {};
    for (const task of drafted)
      granularity[task.granularity || "missing"] =
        (granularity[task.granularity || "missing"] || 0) + 1;

    return { errors, drafted: drafted.length, granularity, duplicateNames };
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
}

function run() {
  const draftPaths = process.argv.slice(2);
  if (draftPaths.length === 0) {
    console.error("Usage: node scripts/check_draft.js <draft.json> [...]");
    process.exitCode = 2;
    return;
  }
  const result = checkDrafts(draftPaths);
  console.log(`Draft tasks: ${result.drafted}`);
  console.log(`Granularity: ${JSON.stringify(result.granularity)}`);
  for (const duplicate of result.duplicateNames)
    console.log(`Duplicate name: ${duplicate}`);
  if (result.errors.length) {
    console.error(`Validation failed with ${result.errors.length} error(s):`);
    result.errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
    return;
  }
  console.log("Draft validation passed.");
}

if (require.main === module) run();
module.exports = { checkDrafts };
