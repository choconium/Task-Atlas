#!/usr/bin/env node

// List task pairs whose goals look alike, to catch paraphrases before review.
// Usage: node scripts/report_similar_tasks.js [--min 0.6] [--only <task id prefix>] [draft.json ...]
const fs = require("node:fs");
const { defaultData } = require("./validate_seed_data");

const USAGE =
  "Usage: node scripts/report_similar_tasks.js [--min 0.6] [--only <task id prefix>] [draft.json ...]";

const STOPWORDS = new Set(
  "a an and the of to in on onto into from with for its it by at is are be as then".split(" "),
);

function goalPredicates(task) {
  return new Set(
    (task.goal_state || [])
      .map((goal) => /^\s*([a-z][a-z0-9_]*)/.exec(String(goal))?.[1])
      .filter(Boolean),
  );
}
function nameTokens(task) {
  return new Set(
    String(task.name_en || "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 2 && !STOPWORDS.has(word)),
  );
}
function jaccard(left, right) {
  if (left.size === 0 && right.size === 0) return 0;
  let shared = 0;
  for (const value of left) if (right.has(value)) shared += 1;
  return shared / (left.size + right.size - shared);
}

// Weighted mix: goal shape, wording, and shared context.
function similarity(left, right) {
  const goals = jaccard(left.goals, right.goals);
  const words = jaccard(left.words, right.words);
  const context =
    (left.task.intent_id === right.task.intent_id ? 0.5 : 0) +
    (left.task.scene_id === right.task.scene_id ? 0.5 : 0);
  return 0.45 * goals + 0.4 * words + 0.15 * context;
}

function similarPairs(tasks, { min = 0.6, only = null } = {}) {
  const profiles = tasks.map((task) => ({
    task,
    goals: goalPredicates(task),
    words: nameTokens(task),
  }));
  const pairs = [];
  for (let i = 0; i < profiles.length; i += 1)
    for (let j = i + 1; j < profiles.length; j += 1) {
      const [left, right] = [profiles[i], profiles[j]];
      if (only && !left.task.id.startsWith(only) && !right.task.id.startsWith(only)) continue;
      const score = similarity(left, right);
      if (score >= min)
        pairs.push({ score: Number(score.toFixed(3)), left: left.task.id, right: right.task.id });
    }
  return pairs.sort((a, b) => b.score - a.score);
}

class UsageError extends Error {}

// Parse CLI arguments; throws UsageError on malformed --min / --only.
function parseArgs(args) {
  const options = { min: 0.6, only: null };
  const drafts = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--min") {
      const raw = args[++i];
      const min = raw === undefined || raw.trim() === "" ? NaN : Number(raw);
      if (!Number.isFinite(min)) throw new UsageError(`--min expects a finite number, got ${JSON.stringify(raw ?? null)}`);
      options.min = min;
    } else if (args[i] === "--only") {
      const only = args[++i];
      if (only === undefined || only === "" || only.startsWith("--"))
        throw new UsageError("--only expects a task id prefix");
      options.only = only;
    } else if (args[i].startsWith("--")) {
      throw new UsageError(`unknown option ${args[i]}`);
    } else drafts.push(args[i]);
  }
  return { options, drafts };
}

function run() {
  let parsed;
  try {
    parsed = parseArgs(process.argv.slice(2));
  } catch (error) {
    if (!(error instanceof UsageError)) throw error;
    console.error(error.message);
    console.error(USAGE);
    process.exitCode = 2;
    return;
  }
  const { options, drafts } = parsed;
  const tasks = [...defaultData().tasks];
  for (const draft of drafts)
    tasks.push(...(JSON.parse(fs.readFileSync(draft, "utf8")).tasks || []));
  const pairs = similarPairs(tasks, options);
  const names = new Map(tasks.map((task) => [task.id, task.name_en]));
  for (const pair of pairs)
    console.log(`${pair.score}\t${pair.left} (${names.get(pair.left)})\t${pair.right} (${names.get(pair.right)})`);
  console.log(`${pairs.length} pair(s) at or above ${options.min}`);
}

if (require.main === module) run();
module.exports = { similarPairs, parseArgs, UsageError };
