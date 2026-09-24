#!/usr/bin/env node
const { defaultData } = require("./validate_seed_data");

function buildReport(data) {
  const catalogObjects = data.objects.filter((object) => object.ycb_id);
  const catalogIds = new Set(catalogObjects.map((object) => object.id));
  const catalogTasks = data.tasks.filter((task) => catalogIds.has(task.object_id));
  const catalogRoundTasks = catalogTasks.filter((task) =>
    /^ycb_coverage_round\d+$/.test(task.generation_version || ""),
  );
  const planning = new Map(data.planning.map((plan) => [plan.task_id, plan]));
  const requiredCatalogObjects = (task) => [...new Set(
    (planning.get(task.id)?.requirements || [])
      .filter((requirement) => requirement.key === "object" && requirement.value !== task.object_id && catalogIds.has(requirement.value))
      .map((requirement) => requirement.value),
  )];
  const rounds = [...new Set(catalogRoundTasks.map((task) => task.generation_version))].sort();
  const rows = catalogObjects.map((object) => {
    const tasks = catalogTasks.filter((task) => task.object_id === object.id);
    return {
      object_id: object.id,
      name: object.name_en,
      task_count: tasks.length,
      rounds: Object.fromEntries(rounds.map((round) => [round, tasks.filter((task) => task.generation_version === round).length])),
      tasks: tasks.map((task) => ({ id: task.id, name: task.name_en, scene: task.scene_id, intent: task.intent_id, required_catalog_objects: requiredCatalogObjects(task) })),
    };
  });
  const missing = rows.filter((row) => row.task_count === 0).map((row) => row.object_id);
  return {
    catalog_objects: rows.length,
    covered_objects: rows.length - missing.length,
    task_count: catalogTasks.length,
    all_task_count: data.tasks.length,
    generation_rounds: rounds,
    round_summary: rounds.map((round) => {
      const tasks = catalogRoundTasks.filter((task) => task.generation_version === round);
      return {
        round,
        tasks: tasks.length,
        covered_objects: new Set(tasks.map((task) => task.object_id)).size,
        tasks_with_catalog_partners: tasks.filter((task) => requiredCatalogObjects(task).length > 0).length,
        catalog_dependency_edges: tasks.reduce((count, task) => count + requiredCatalogObjects(task).length, 0),
      };
    }),
    missing_objects: missing,
    objects: rows,
  };
}

if (require.main === module) {
  const result = buildReport(defaultData());
  console.log(JSON.stringify(result, null, 2));
  if (result.missing_objects.length) process.exitCode = 1;
}

module.exports = { buildReport };
