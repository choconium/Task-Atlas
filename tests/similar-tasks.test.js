const test = require("node:test");
const assert = require("node:assert/strict");
const { similarPairs } = require("../scripts/report_similar_tasks");

const task = (id, name, goals, intent = "intent_store", scene = "scene_home_kitchen") => ({
  id, name_en: name, goal_state: goals, intent_id: intent, scene_id: scene,
});

test("similar-task report ranks paraphrases above unrelated tasks", () => {
  const pairs = similarPairs(
    [
      task("task_a", "Hang the mug on the cup hook", ["hanging_on(mug, hook)"]),
      task("task_b", "Hang the clean mug on the marked cup hook", ["hanging_on(mug, hook)"]),
      task("task_c", "Switch off the television", ["switched_off(tv)"], "intent_set_device_state", "scene_home_living_room"),
    ],
    { min: 0.5 },
  );
  assert.deepEqual(pairs.map((pair) => [pair.left, pair.right]), [["task_a", "task_b"]]);
});
