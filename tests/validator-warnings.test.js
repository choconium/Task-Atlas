const test = require("node:test");
const assert = require("node:assert/strict");
const { validateData, defaultData, printWarnings, WARNING_PRINT_LIMIT } = require("../scripts/validate_seed_data");

const BASE = defaultData();
const clone = () => structuredClone(BASE);
const byId = (rows, id) => rows.find((row) => row.id === id);

// A task whose scene is currently inside its template's compatible_scenes,
// plus a known scene that is not: the warning must fire only after we move it.
function compliantTask(data) {
  for (const task of data.tasks) {
    const template = byId(data.templates, task.template_id);
    const scenes = template?.compatible_scenes || [];
    if (!scenes.includes(task.scene_id)) continue;
    const other = data.scenes.find((scene) => !scenes.includes(scene.id));
    if (other) return { task, template, other };
  }
  throw new Error("no compliant task found in seed data");
}

test("current seed data is valid and exposes a warnings array", () => {
  const result = validateData(BASE);
  assert.equal(result.valid, true, result.errors.slice(0, 5).join("\n"));
  assert.deepEqual(result.errors, []);
  assert.ok(Array.isArray(result.warnings));
  for (const warning of result.warnings) assert.equal(typeof warning, "string");
});

test("task scene outside template compatible_scenes is a warning, not an error", () => {
  const data = clone();
  const { task, template, other } = compliantTask(data);
  const before = validateData(data).warnings.filter((w) => w.startsWith(`${task.id}:`) && w.includes("compatible_scenes"));
  assert.deepEqual(before, []);
  task.scene_id = other.id;
  const result = validateData(data);
  assert.equal(result.valid, true);
  assert.ok(
    result.warnings.includes(`${task.id}: scene ${other.id} is not in compatible_scenes of ${template.id}`),
    result.warnings.filter((w) => w.startsWith(`${task.id}:`)).join("\n"),
  );
});

test("template with empty or missing compatible_scenes is a warning", () => {
  const data = clone();
  const { template } = compliantTask(data);
  template.compatible_scenes = [];
  let result = validateData(data);
  assert.equal(result.valid, true);
  assert.ok(result.warnings.includes(`${template.id}: template declares no compatible_scenes`));
  // An empty list also suppresses the per-task scene warning (nothing to compare against).
  assert.ok(!result.warnings.some((w) => w.includes(`compatible_scenes of ${template.id}`)));

  delete template.compatible_scenes;
  result = validateData(data);
  assert.ok(result.warnings.includes(`${template.id}: template declares no compatible_scenes`));
});

test("undeclared binding keys warn for non-YCB tasks and skip schema-declared keys", () => {
  const data = clone();
  const task = data.tasks.find((row) => !row.id.startsWith("task_ycb_") && byId(data.templates, row.template_id));
  assert.ok(task, "expected a non-YCB task");
  task.bindings = {
    ...(task.bindings || {}),
    stray_role_for_test: "value",
    execution_asset_manifest_id: "manifest_for_test",
    execution_proxy_required: true,
  };
  const result = validateData(data);
  assert.equal(result.valid, true, result.errors.join("\n"));
  assert.ok(result.warnings.includes(`${task.id}: binding stray_role_for_test is not a declared role of ${task.template_id}`));
  assert.ok(!result.warnings.some((w) => w.startsWith(`${task.id}:`) && w.includes("execution_asset_manifest_id")));
  assert.ok(!result.warnings.some((w) => w.startsWith(`${task.id}:`) && w.includes("execution_proxy_required")));
});

test("undeclared binding keys stay errors for task_ycb_* tasks", () => {
  const data = clone();
  const task = data.tasks.find((row) => row.id.startsWith("task_ycb_") && byId(data.templates, row.template_id));
  assert.ok(task, "expected a task_ycb_* task");
  task.bindings = { ...(task.bindings || {}), stray_role_for_test: "value", execution_proxy_required: false };
  const result = validateData(data);
  assert.ok(result.errors.includes(`${task.id}: undeclared template role stray_role_for_test`));
  assert.ok(!result.errors.some((e) => e.includes("execution_proxy_required")));
});

test("external object without a catalog_identity claim is a warning (error only in check_draft)", () => {
  const data = clone();
  const external = data.objects.find((object) => !Object.hasOwn(object, "ycb_id"));
  assert.ok(external, "expected an external object");
  data.claims = data.claims.filter(
    (claim) => !(claim.claim_type === "catalog_identity" && claim.subject_id === external.id),
  );
  const before = validateData(clone()).warnings.filter((w) => w.includes("missing catalog_identity claim"));
  assert.deepEqual(before, [], "current seed data has no unidentified external objects");
  const result = validateData(data);
  assert.equal(result.valid, true, result.errors.join("\n"));
  assert.ok(result.warnings.includes(`${external.id}: external object missing catalog_identity claim`));
});

test("generation_version mismatches between a task and its planning or claims are warnings", () => {
  const data = clone();
  const task = data.tasks.find((row) => typeof row.generation_version === "string");
  assert.ok(task, "expected a task with generation_version");
  const plan = data.planning.find((row) => row.task_id === task.id);
  const claim = data.claims.find((row) => row.subject_id === task.id);
  assert.ok(plan && claim);

  // Field present on only one side: no warning.
  let result = validateData(data);
  assert.ok(!result.warnings.some((w) => w.includes("generation_version") && w.includes(task.id)));

  // Matching values on both sides: no warning.
  plan.generation_version = task.generation_version;
  claim.generation_version = task.generation_version;
  result = validateData(data);
  assert.ok(!result.warnings.some((w) => w.includes("generation_version") && w.includes(task.id)));

  plan.generation_version = "other_version_for_test";
  claim.generation_version = "other_version_for_test";
  result = validateData(data);
  assert.equal(result.valid, true);
  assert.ok(result.warnings.includes(
    `${plan.id}: generation_version other_version_for_test differs from task ${task.id} (${task.generation_version})`,
  ));
  assert.ok(result.warnings.includes(
    `${claim.id}: generation_version other_version_for_test differs from task ${task.id} (${task.generation_version})`,
  ));
});

test("printWarnings caps the list and reports the remainder", () => {
  const lines = [];
  const warnings = Array.from({ length: WARNING_PRINT_LIMIT + 7 }, (_, i) => `w${i}`);
  printWarnings(warnings, (line) => lines.push(line));
  assert.equal(lines.length, WARNING_PRINT_LIMIT + 1);
  assert.equal(lines[0], "- w0");
  assert.equal(lines.at(-1), "... and 7 more");

  const few = [];
  printWarnings(["a", "b"], (line) => few.push(line));
  assert.deepEqual(few, ["- a", "- b"]);
});
