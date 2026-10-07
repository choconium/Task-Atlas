const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const frontend = path.join(__dirname, "..", "frontend");
const read = (name) => fs.readFileSync(path.join(frontend, name), "utf8");
const html = read("index.html");
const css = read("styles.css");
const app = read("app.js");

function uiDictionary(source) {
  const start = source.indexOf("const UI = ");
  const end = source.indexOf("\n  };\n", start);
  assert.ok(start >= 0 && end > start, "UI dictionary literal not found");
  const literal = source.slice(start + "const UI = ".length, end + "\n  }".length);
  return vm.runInNewContext(`(${literal})`);
}

function functionBody(source, signature) {
  const start = source.indexOf(signature);
  assert.ok(start >= 0, `${signature} not found`);
  const next = source.indexOf("\n  function ", start + signature.length);
  const nextAsync = source.indexOf("\n  async function ", start + signature.length);
  const candidates = [next, nextAsync].filter((index) => index > start);
  return source.slice(start, candidates.length ? Math.min(...candidates) : undefined);
}

test("explorer shell keeps the markers the atlas tests rely on", () => {
  assert.match(html, /<title>Task Atlas<\/title>/);
  assert.match(html, /id="graph"/);
  assert.match(html, /RELATIONSHIP GRAPH/);
  assert.match(html, /href="\/start\.html"/);
  assert.doesNotMatch(html, /github\.com/);
});

test("every data-copy element carries both English and Japanese copy", () => {
  const elements = html.match(/<[^>]*\bdata-copy\b[^>]*>/g) || [];
  assert.ok(elements.length >= 34, `expected the translated elements, found ${elements.length}`);
  for (const element of elements) {
    assert.match(element, /data-copy-en="[^"]+"/, element);
    assert.match(element, /data-copy-ja="[^"]+"/, element);
  }
  assert.match(html, /id="empty"[^>]*data-copy-ja="隣接ノードはありません。"/);
  assert.match(html, /data-lens="all"[^>]*data-copy-ja="すべて"/);
  assert.match(html, /<p id="graph-note"[^>]*hidden>/);
});

test("the UI dictionary has the same keys in both languages, including the new strings", () => {
  const UI = uiDictionary(app);
  const en = Object.keys(UI.en).sort();
  const ja = Object.keys(UI.ja).sort();
  assert.deepEqual(ja, en);
  for (const key of [
    "status_ready",
    "status_needs_changes",
    "status_unknown",
    "status_blocked",
    "status_unverified",
    "status_proposed",
    "status_unsupported",
    "proposedProcedures",
    "timeEstimates",
    "seededTasks",
    "concept",
    "objectsReady",
    "offline",
    "connecting",
    "pageTitle",
    "graphCapped",
    "thor_database",
    "asset_collection",
  ]) {
    assert.ok(UI.en[key], `UI.en.${key}`);
    assert.ok(UI.ja[key], `UI.ja.${key}`);
    assert.notEqual(UI.en[key], UI.ja[key], `${key} is translated`);
  }
  assert.match(UI.en.graphCapped, /\{shown\}.*\{total\}/);
  assert.match(UI.ja.graphCapped, /\{total\}.*\{shown\}/);
});

test("the graph lets vertical touch gestures scroll the page", () => {
  const graphRule = css.slice(css.indexOf("\n#graph {"), css.indexOf("}", css.indexOf("\n#graph {")));
  assert.match(graphRule, /touch-action:\s*pan-y pinch-zoom;/);
  assert.doesNotMatch(css, /touch-action:\s*none/);
  assert.match(app, /drag\.pointerType === "touch" && Math\.abs\(dy\) > Math\.abs\(dx\)/);
  assert.match(app, /window\.addEventListener\("pointercancel", endGraphDrag\)/);
});

test("zoom floor is five percent and both view buttons share one style", () => {
  assert.match(app, /const MIN_SCALE = 0\.05;/);
  assert.doesNotMatch(app, /0\.001/);
  assert.match(css, /#zoom-reset,\n#zoom-fit \{/);
});

test("graph history is recorded only after a successful load and resizes keep the view", () => {
  const loadGraph = functionBody(app, "async function loadGraph(");
  const fetchIndex = loadGraph.indexOf("await api(");
  const pushIndex = loadGraph.indexOf("state.history.push(");
  const versionCheck = loadGraph.indexOf("if (version !== state.graphVersion) return false;");
  assert.ok(fetchIndex > 0 && pushIndex > versionCheck && versionCheck > fetchIndex);
  assert.match(loadGraph, /previous !== id/);
  assert.match(loadGraph, /return true;/);
  const navigateNode = functionBody(app, "async function navigateNode(");
  assert.match(navigateNode, /const loaded = await loadGraph\(id\);\s*if \(!loaded\) return;/);
  const observer = app.slice(app.indexOf("new ResizeObserver(() => {"), app.indexOf("}).observe(elements.graph);"));
  assert.match(observer, /renderGraph\(\);/);
  assert.doesNotMatch(observer, /reset: true/);
});

test("hub nodes are capped to a stable prefix with a localized notice", () => {
  assert.match(app, /const MAX_NEIGHBOURS = 120;/);
  const renderGraph = functionBody(app, "function renderGraph({ reset = false } = {}) {");
  assert.match(renderGraph, /neighbours\.slice\(0, MAX_NEIGHBOURS\)/);
  assert.match(renderGraph, /fill\(text\("graphCapped"\)/);
  assert.match(renderGraph, /if \(state\.graphDrag\) return;/);
});

test("statuses, scene names, and breadcrumbs are localized at render time", () => {
  assert.match(app, /const statusLabel = \(value\) =>/);
  assert.doesNotMatch(app, /readable\((activeAssessment|procedureAssessment|assessment)\.status\)/);
  assert.match(app, /state\.language === "ja" && task\.scene_name_ja/);
  assert.match(app, /label\(entry\.node \|\| \{ id: entry\.id \}\)/);
  const renderLanguage = functionBody(app, "function renderLanguage() {");
  assert.match(renderLanguage, /renderBreadcrumbs\(\);/);
  assert.doesNotMatch(app, /"Proposed procedures \(/);
  assert.doesNotMatch(app, /Time estimates: \$/);
  assert.doesNotMatch(app, /seeded task candidates`/);
});

test("context checks fall back to the none radio and the expansion panel is mustard-only", () => {
  assert.match(app, /input\[value="none"\]'\)\.checked =\s*state\.context\[key\]\.length === 0;/);
  assert.match(app, /state\.selectedObjectId !== "ycb_006_mustard_bottle"/);
  const download = functionBody(app, "async function downloadCollectionCard() {");
  assert.match(download, /setTimeout\(\(\) => URL\.revokeObjectURL\(url\), 0\)/);
  assert.doesNotMatch(download, /renderError\(elements\.inspector/);
  assert.match(download, /download-message/);
});
