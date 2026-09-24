const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const { defaultData } = require("../scripts/validate_seed_data");
const { buildReport } = require("../scripts/report_ycb_coverage");

const ROOT = path.resolve(__dirname, "..");
const REPORT_SCRIPT = path.join(ROOT, "scripts", "report_ycb_coverage.js");

function runReport() {
  return JSON.parse(
    execFileSync(process.execPath, [REPORT_SCRIPT], {
      cwd: ROOT,
      encoding: "utf8",
    }),
  );
}

function expectedReportData() {
  const data = defaultData();
  const catalogObjects = data.objects.filter((object) => object.ycb_id);
  const catalogIds = new Set(catalogObjects.map((object) => object.id));
  const catalogTasks = data.tasks.filter((task) => catalogIds.has(task.object_id));
  const catalogRoundTasks = catalogTasks.filter((task) =>
    /^ycb_coverage_round\d+$/.test(task.generation_version || ""),
  );
  const planning = new Map(data.planning.map((plan) => [plan.task_id, plan]));
  const rounds = [
    ...new Set(catalogRoundTasks.map((task) => task.generation_version)),
  ].sort();
  const requiredCatalogObjects = (task) => [
    ...new Set(
      (planning.get(task.id)?.requirements || [])
        .filter(
          (requirement) =>
            requirement.key === "object" &&
            requirement.value !== task.object_id &&
            catalogIds.has(requirement.value),
        )
        .map((requirement) => requirement.value),
    ),
  ];
  return { data, catalogObjects, catalogIds, catalogTasks, catalogRoundTasks, planning, rounds, requiredCatalogObjects };
}

test("YCB coverage CLI reconciles counts, catalog dependencies, and round summaries", () => {
  const report = runReport();
  const {
    data,
    catalogObjects,
    catalogIds,
    catalogTasks,
    catalogRoundTasks,
    planning,
    rounds,
    requiredCatalogObjects,
  } = expectedReportData();
  const tasksByObject = new Map();
  for (const task of catalogTasks) {
    if (!tasksByObject.has(task.object_id)) tasksByObject.set(task.object_id, []);
    tasksByObject.get(task.object_id).push(task);
  }

  assert.equal(report.catalog_objects, catalogObjects.length);
  assert.equal(
    report.covered_objects,
    catalogObjects.filter((object) => (tasksByObject.get(object.id) || []).length).length,
  );
  assert.equal(report.task_count, catalogTasks.length);
  assert.equal(report.all_task_count, data.tasks.length);
  assert.deepEqual(report.generation_rounds, rounds);
  assert.deepEqual(
    report.missing_objects,
    catalogObjects
      .filter((object) => !(tasksByObject.get(object.id) || []).length)
      .map((object) => object.id),
  );
  assert.equal(report.objects.length, catalogObjects.length);

  for (const [index, object] of catalogObjects.entries()) {
    const row = report.objects[index];
    const tasks = tasksByObject.get(object.id) || [];
    assert.equal(row.object_id, object.id);
    assert.equal(row.task_count, tasks.length);
    assert.deepEqual(
      row.rounds,
      Object.fromEntries(
        rounds.map((round) => [
          round,
          tasks.filter((task) => task.generation_version === round).length,
        ]),
      ),
    );
    assert.deepEqual(
      row.tasks.map((task) => task.id),
      tasks.map((task) => task.id),
    );

    for (const taskRow of row.tasks) {
      const task = catalogTasks.find((candidate) => candidate.id === taskRow.id);
      assert.ok(task, `${taskRow.id} must resolve to a seed task`);
      const expected = requiredCatalogObjects(task);
      assert.deepEqual(taskRow.required_catalog_objects, expected, task.id);
      assert.equal(
        new Set(taskRow.required_catalog_objects).size,
        taskRow.required_catalog_objects.length,
        `${task.id}: catalog dependencies must be deduplicated`,
      );
      assert.ok(
        taskRow.required_catalog_objects.every((id) => catalogIds.has(id)),
        `${task.id}: fixtures must not appear as catalog dependencies`,
      );
      assert.ok(
        !taskRow.required_catalog_objects.includes(task.object_id),
        `${task.id}: primary object must not appear as a catalog dependency`,
      );
      assert.ok(planning.has(task.id), `${task.id}: planning must resolve`);
    }
  }

  const partnerCase = report.objects
    .flatMap((row) => row.tasks)
    .find((task) => task.id === "task_ycb_round2_069_box_lid");
  assert.ok(partnerCase);
  assert.deepEqual(partnerCase.required_catalog_objects, ["ycb_068_clear_box"]);

  const expectedRoundSummary = rounds.map((round) => {
    const tasks = catalogRoundTasks.filter((task) => task.generation_version === round);
    const dependencies = tasks.map(requiredCatalogObjects);
    return {
      round,
      tasks: tasks.length,
      covered_objects: new Set(tasks.map((task) => task.object_id)).size,
      tasks_with_catalog_partners: dependencies.filter((items) => items.length > 0)
        .length,
      catalog_dependency_edges: dependencies.reduce(
        (count, items) => count + items.length,
        0,
      ),
    };
  });
  assert.deepEqual(report.round_summary, expectedRoundSummary);
});

test("external primary objects and their YCB resource requirements stay outside YCB round coverage", () => {
  const data = defaultData();
  const before = buildReport(data);
  const externalObject = {
    id: "behavior_asset_coverage_probe",
    node_type: "ObjectInstance",
    canonical_name: "coverage probe asset",
    name_en: "Coverage probe asset",
    name_ja: "カバレッジ確認アセット",
    category: "test asset",
    general_concept_id: "object_test_asset",
    affordances: [],
    review_status: "proposed",
    asset_source: "behavior",
    asset_source_version: "test-release",
    asset_source_id: "coverage-probe-001",
    asset_source_url: "https://example.invalid/behavior/coverage-probe-001",
    source_taxonomy: {
      source: "behavior",
      category_id: "test_asset",
      synset_id: "test_asset.n.01",
      parent_synset_ids: [],
    },
  };
  const externalTask = {
    id: "task_behavior_coverage_probe",
    object_id: externalObject.id,
    generation_version: "behavior_probe_round1",
  };
  data.objects.push(externalObject);
  data.tasks.push(externalTask);
  data.planning.push({
    task_id: externalTask.id,
    requirements: [
      { key: "object", value: externalObject.id },
      { key: "object", value: "ycb_068_clear_box" },
    ],
  });

  const after = buildReport(data);
  assert.equal(after.catalog_objects, before.catalog_objects);
  assert.equal(after.covered_objects, before.covered_objects);
  assert.deepEqual(after.generation_rounds, before.generation_rounds);
  assert.deepEqual(after.round_summary, before.round_summary);
  assert.deepEqual(after.missing_objects, before.missing_objects);
  assert.equal(after.task_count, before.task_count);
  assert.equal(after.all_task_count, before.all_task_count + 1);
});
