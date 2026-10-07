#!/usr/bin/env node

// Validate draft bundles as if they were active, without touching data/seeds.
// Usage: node scripts/check_draft.js data/drafts/<bundle>.json [...]
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { defaultData, validateData, printWarnings } = require("./validate_seed_data");

const ROOT = path.resolve(__dirname, "..");
const SEED_DIR = path.join(ROOT, "data", "seeds");

class DraftInputError extends Error {}

// Keys loadTaskBatches requires / accepts as arrays in every bundle.
const REQUIRED_BUNDLE_ARRAYS = ["tasks", "planning", "claims"];
const OPTIONAL_BUNDLE_ARRAYS = ["scenes", "templates", "external_objects", "evidence"];

const normalize = (value) =>
  String(value || "").toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function readBundle(draftPath) {
  let raw;
  try {
    raw = fs.readFileSync(draftPath, "utf8");
  } catch (error) {
    throw new DraftInputError(
      `${draftPath}: cannot read draft (${error.code || error.message})`,
    );
  }
  let bundle;
  try {
    bundle = JSON.parse(raw);
  } catch (error) {
    throw new DraftInputError(`${draftPath}: invalid JSON (${error.message})`);
  }
  if (!bundle || typeof bundle !== "object" || Array.isArray(bundle))
    throw new DraftInputError(`${draftPath}: draft must be a JSON object bundle`);
  // Mirror the loader's shape rules up front so a malformed draft fails with a
  // clear message instead of a stack trace from inside loadTaskBatches.
  for (const key of REQUIRED_BUNDLE_ARRAYS)
    if (!Array.isArray(bundle[key]))
      throw new DraftInputError(`${draftPath}: ${key} must be an array`);
  for (const key of OPTIONAL_BUNDLE_ARRAYS)
    if (bundle[key] !== undefined && !Array.isArray(bundle[key]))
      throw new DraftInputError(`${draftPath}: ${key} must be an array when present`);
  return bundle;
}

function checkDrafts(draftPaths) {
  const bundles = draftPaths.map((draftPath) => [draftPath, readBundle(draftPath)]);
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "task-atlas-draft-"));
  try {
    fs.cpSync(SEED_DIR, scratch, { recursive: true });
    const activeTasks = defaultData(scratch).tasks;
    const draftTaskIds = new Set();
    const draftErrors = [];
    const notes = [];
    for (const [draftPath, bundle] of bundles) {
      for (const task of bundle.tasks)
        if (task && typeof task.id === "string") draftTaskIds.add(task.id);
      // New external objects must carry their own catalog identity claim.
      const identified = new Set(
        bundle.claims
          .filter((claim) => claim && claim.claim_type === "catalog_identity")
          .map((claim) => claim.subject_id),
      );
      for (const object of bundle.external_objects || [])
        if (object && !identified.has(object.id))
          draftErrors.push(`${object.id}: missing catalog_identity claim`);
      const target = path.join(scratch, "ycb_batches", path.basename(draftPath));
      if (fs.existsSync(target))
        notes.push(`replacing active bundle ${path.basename(draftPath)} with ${draftPath}`);
      fs.copyFileSync(draftPath, target);
    }
    const data = defaultData(scratch);
    const validation = validateData(data);
    const errors = [...draftErrors, ...validation.errors];
    const drafted = data.tasks.filter((task) => draftTaskIds.has(task.id));
    // Keep only warnings that name a draft task id as a whole token.
    const warnings = validation.warnings.filter((warning) =>
      warning.split(/[^a-z0-9_]+/).some((token) => draftTaskIds.has(token)),
    );

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

    return { errors, warnings, notes, drafted: drafted.length, granularity, duplicateNames };
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
  let result;
  try {
    result = checkDrafts(draftPaths);
  } catch (error) {
    if (error instanceof DraftInputError) {
      console.error(error.message);
      process.exitCode = 2;
      return;
    }
    throw error;
  }
  for (const note of result.notes) console.log(`Note: ${note}`);
  console.log(`Draft tasks: ${result.drafted}`);
  console.log(`Granularity: ${JSON.stringify(result.granularity)}`);
  for (const duplicate of result.duplicateNames)
    console.log(`Duplicate name: ${duplicate}`);
  if (result.warnings.length) {
    console.log(`Warnings touching draft tasks (${result.warnings.length}):`);
    printWarnings(result.warnings);
  }
  if (result.errors.length) {
    console.error(`Validation failed with ${result.errors.length} error(s):`);
    result.errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
    return;
  }
  console.log("Draft validation passed.");
}

if (require.main === module) run();
module.exports = { checkDrafts, DraftInputError };
