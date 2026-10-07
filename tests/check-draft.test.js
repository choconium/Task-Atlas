const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { checkDrafts, DraftInputError } = require("../scripts/check_draft");

const ACTIVE_BUNDLE = path.join(__dirname, "..", "data", "seeds", "ycb_batches", "reference_behavior_round1.json");

test("draft checker validates a bundle against active seeds and reports broken references", () => {
  const passing = checkDrafts([ACTIVE_BUNDLE]);
  assert.deepEqual(passing.errors, []);
  assert.equal(passing.drafted, 2);
  assert.ok(Array.isArray(passing.warnings));
  assert.ok(passing.notes.some((note) => note.includes("replacing active bundle reference_behavior_round1.json")));

  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "task-atlas-draft-test-"));
  try {
    const bundle = JSON.parse(fs.readFileSync(ACTIVE_BUNDLE, "utf8"));
    bundle.tasks[0].scene_id = "scene_does_not_exist";
    const broken = path.join(scratch, "reference_behavior_round1.json");
    fs.writeFileSync(broken, JSON.stringify(bundle));
    const failing = checkDrafts([broken]);
    assert.ok(failing.errors.some((error) => error.includes("scene_does_not_exist")));

    const unidentified = JSON.parse(fs.readFileSync(ACTIVE_BUNDLE, "utf8"));
    unidentified.claims = unidentified.claims.filter((claim) => claim.claim_type !== "catalog_identity");
    const missing = path.join(scratch, "unidentified.json");
    fs.writeFileSync(missing, JSON.stringify(unidentified));
    assert.ok(checkDrafts([missing]).errors.some((error) => error.includes("missing catalog_identity claim")));
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
});

test("draft checker rejects a missing path with a clear error", () => {
  const ghost = path.join(os.tmpdir(), "task-atlas-no-such-draft-" + process.pid + ".json");
  assert.throws(
    () => checkDrafts([ghost]),
    (error) =>
      error instanceof DraftInputError &&
      error.message.includes(ghost) &&
      error.message.includes("cannot read draft") &&
      error.message.includes("ENOENT"),
  );
});

test("draft checker rejects unparsable JSON and a non-array tasks field", () => {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "task-atlas-draft-test-"));
  try {
    const garbage = path.join(scratch, "garbage.json");
    fs.writeFileSync(garbage, "{ not json");
    assert.throws(
      () => checkDrafts([garbage]),
      (error) => error instanceof DraftInputError && error.message.includes("invalid JSON"),
    );

    const list = path.join(scratch, "list.json");
    fs.writeFileSync(list, "[]");
    assert.throws(
      () => checkDrafts([list]),
      (error) => error instanceof DraftInputError && error.message.includes("JSON object bundle"),
    );

    const bundle = JSON.parse(fs.readFileSync(ACTIVE_BUNDLE, "utf8"));
    bundle.tasks = { not: "an array" };
    const badTasks = path.join(scratch, "bad_tasks.json");
    fs.writeFileSync(badTasks, JSON.stringify(bundle));
    assert.throws(
      () => checkDrafts([badTasks]),
      (error) =>
        error instanceof DraftInputError &&
        error.message.includes("bad_tasks.json") &&
        error.message.includes("tasks must be an array"),
    );

    const noTasks = JSON.parse(fs.readFileSync(ACTIVE_BUNDLE, "utf8"));
    delete noTasks.tasks;
    const missingTasks = path.join(scratch, "missing_tasks.json");
    fs.writeFileSync(missingTasks, JSON.stringify(noTasks));
    assert.throws(
      () => checkDrafts([missingTasks]),
      (error) => error instanceof DraftInputError && error.message.includes("tasks must be an array"),
    );
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
});

test("draft checker surfaces validator warnings that name draft tasks", () => {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "task-atlas-draft-test-"));
  try {
    const bundle = JSON.parse(fs.readFileSync(ACTIVE_BUNDLE, "utf8"));
    const task = bundle.tasks[0];
    task.bindings = { ...(task.bindings || {}), stray_binding_role: "x" };
    const draft = path.join(scratch, "reference_behavior_round1.json");
    fs.writeFileSync(draft, JSON.stringify(bundle));
    const result = checkDrafts([draft]);
    assert.deepEqual(result.errors, []);
    assert.ok(
      result.warnings.some((warning) => warning.startsWith(`${task.id}:`) && warning.includes("stray_binding_role")),
    );
    for (const warning of result.warnings)
      assert.ok(bundle.tasks.some((row) => warning.split(/[^a-z0-9_]+/).includes(row.id)), warning);
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
});
