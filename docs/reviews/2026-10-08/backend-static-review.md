# Backend review — Physical AI Task Atlas (read-only)

Scope: `backend/server.js`, `backend/app/{store,assessment,seed-batches,worker-router}.js`, `backend/worker.mjs`, `wrangler.jsonc`, `scripts/*.js`, `tests/*.js`, `schemas/*.json`, against `docs/foundation-contract.md`.

Baseline: `npm run check` passes (validate + validate:research + 38 tests, 0 failures, ~115 s; the YCB reachability test alone is 44 s). `npx wrangler deploy --dry-run` succeeds: 58 modules, 10 080 KiB raw, **1 238 KiB gzip** (free-tier limit 3 MB gzip, OK). `wrangler dev --local` boots and serves every route (miniflare does not enforce CPU/startup limits, so the timings below come from Node).

Measured (Node, best of 3, 827 tasks / 3531 claims): `createStore` 263 ms (230 ms of it is read+`JSON.parse` of 10.0 MB seeds); `GET /api/tasks` (no filter) 36 ms CPU; `/api/nodes/scene_home_kitchen/neighbors` 18 ms; `/api/nodes/<evidence>/neighbors` 12.6 ms (771 nodes); `/api/nodes/skill_grasp/neighbors` 12.8 ms; JSON export 9.7 MB / 31 ms; CSV 13.5 ms.

---

## Ranked findings

### 1. [likely bug] `/api/tasks` and large neighbor graphs exceed the Workers free-tier CPU budget; 70% of the cost is `localeCompare` with options
- `backend/app/store.js:52-56` (`compareText`) calls `String.prototype.localeCompare(.., "en", {sensitivity:"base"})` per comparison. Sorting the 827 names this way costs **26 ms**; the same sort with a shared `new Intl.Collator("en",{sensitivity:"base"}).compare` costs **0.5 ms**. `assessRequirements` x827 is another 12 ms.
- Workers free plan allows 10 ms CPU per request (paid: 30 s). A bare `GET /api/tasks` (36 ms) or `/api/objects` sorted list would be killed with error 1102 on the free plan; on paid it is fine but wasteful.
- Repro: `node -e` timing above, or `time curl 'http://127.0.0.1:3000/api/tasks'`.
- Fix: hoist `const COLLATOR = new Intl.Collator("en", { sensitivity: "base" })` and use `COLLATOR.compare` in `compareText` (store.js:52) and in `assessment.js:300,309,312` (`deriveOptions` also uses `localeCompare`). Also see #3 for the other O(n²) paths.

### 2. [likely bug] Worker startup is ~230-260 ms of a 400 ms hard limit and grows with every bundle
- `backend/worker.mjs:14-21` builds the whole store at module scope. `createStore` does `fs.readFileSync` + `JSON.parse` of 50 Text modules (10.0 MB) = 231 ms in Node; workerd is not faster. Cloudflare terminates deploys whose global scope exceeds 400 ms CPU ("Script startup exceeded CPU time limit"), and the repo is adding ~1-2 MB of seeds per round (227 KB manifest-listed bundles were 5 MB a few rounds ago; now 9.9 MB).
- Note the `npm run worker:dry-run` does not catch this; only a real deploy or `wrangler dev` with `--test-scheduled`-style startup checks would.
- Fix options: (a) import the seed JSON as ES-module JSON (`import tasks from "../data/seeds/..."`) so esbuild inlines object literals and V8 parses them lazily instead of `JSON.parse` of strings at startup; (b) make the store lazy (`let store; async fetch(){ store ??= createStore(); }`) so parse time counts against the per-request limit (fine on paid, bad on free); (c) pre-merge bundles into one file at build time to cut per-file overhead. Also record the current startup CPU in docs so the next bundle author knows the budget.

### 3. [likely bug] O(n²)/O(n·m) hot paths in store.js that scale with bundle count
- `store.js:124-127` `planningFor`: `maps.planning` is keyed by `plan.id` (always `planning_*`, never equals a task id — verified 0 hits), so the Map lookup never succeeds and every call falls through to `data.planning.find(...)` — a linear scan called once per task in `listTasks`, `neighbors`, `addResourceDependents` (827 × 827 per request). Fix: build `planningByTask = new Map(data.planning.map(p => [p.task_id, p]))`.
- `store.js:130-131` `claimsFor` is a linear scan of 3531 claims; `entityNeighborhood` (store.js:674-682) calls it **once per task inside the filter** (827 × 3531 ≈ 2.9 M comparisons, 27 ms) for *every* scene/skill/intent/template/claim neighbor query. Fix: `claimsBySubject` Map built once.
- `store.js:79-88` `addNode`/`addEdge` use `nodes.some(...)`/`edges.some(...)` → quadratic in graph size; evidence nodes with 771 neighbors cost 12.6 ms. Fix: carry a `Set` of ids alongside the arrays.
- `tasksToCsv` (store.js:1000) does `claims.find` per task (2.9 M comparisons); pre-index by `subject_id`.

### 4. [bug] Collection-card `provenance` mislabels 17 bundle tasks as `mustard_tasks.json`
- `store.js:132-136` `usesTaskBundle` is a heuristic on id prefix / `generation_version` prefix / object `asset_source`. All 17 `context_round1` tasks (`task_ctx_r1_*`, YCB objects, `generation_version: "context_round1"`) fail every branch, so `GET /api/tasks/task_ctx_r1_soup_shelf_label_slide_under_facing/collection-card` reports `provenance: { task_seed: "mustard_tasks.json", planning_seed: "task_planning.json", claims_seed: "claims.json" }` — wrong on all three.
- Fix: the loader already knows the origin; have `loadTaskBatches` tag rows (or return a `Set` of bundle task ids / a `Map task_id → filename`) and drop the heuristic. Bonus: provenance could then name the actual bundle file.

### 5. [bug] 500 responses leak `error.message` (filesystem paths) to clients
- `server.js:311-315` returns `{ error: "Internal server error", detail: serializeError(error) }`. Any `fs.statSync` failure in `serveStatic` (e.g. `ENAMETOOLONG`, `EACCES`, `ELOOP` on a symlink) or a thrown `TypeError` puts the absolute path / internal message into the body. Already logged server-side, so the client copy is pure leakage.
- Fix: drop `detail` (or only include it when `process.env.NODE_ENV !== "production"`).

### 6. [likely bug] `HEAD` and `OPTIONS` are rejected with 405, and export routes lack CORS/Cache-Control headers
- `server.js:106-116` and `:303-309`: any non-GET → 405 with `Allow: GET`. `HEAD /` and `HEAD /api/health` return 405 (verified) — breaks uptime checkers, `curl -I`, and CDN health probes. `OPTIONS` preflight → 405, so the `Access-Control-Allow-Origin: *` on JSON responses is useless for any cross-origin request that triggers preflight.
- `sendText` (`server.js:38-44`) omits `Access-Control-Allow-Origin` and `Cache-Control`, so `/api/export/tasks.json|csv` are the only API responses without CORS, and are cacheable by intermediaries (verified via `curl -I`-equivalent probe).
- Fix: treat HEAD like GET (Node's `http` does not strip the body automatically; set headers and `end()` without body), answer OPTIONS with 204 + `Allow`/CORS headers, and route export headers through the same header set as `sendJson`.

### 7. [minor] `meta.total` is the page size, not the total; `/api/objects` hard-caps at 500 and the frontend relies on it
- `server.js:124-131,154-164`: `total: objects.length` is computed after `.slice(0, limit)`, so `total` can never exceed `limit` and clients cannot detect truncation. `parseLimit` clamps to 500 (`server.js:63-67`); `frontend/app.js:1404` fetches `/api/objects?limit=500` to render the whole catalog. 299 objects today; the next ~200 external objects will be silently dropped from the UI with `total: 500`.
- Fix: compute `total` before slicing and expose `limit`/`truncated`; or allow `limit=0` = all.

### 8. [minor] Search has no ranking and truncates at 80 in seed order
- `store.js:903-941`: results are `[objects, tasks, scenes, states, intents, skills, claims]` filtered by substring then `.slice(0, 80)`. `search("task_ycb")` matches 385 tasks and returns the first 80 in file order; a scene/intent/skill whose name matches never appears once ≥80 objects+tasks match (e.g. `search("kitchen")`). Exact-id or prefix matches get no priority.
- Fix: score (exact id > prefix > name_en contains > other), stable sort, then slice; or at least return `meta.total_matches`.

### 9. [minor] Evidence graph nodes are labelled with their raw id
- `store.js:66-78` `nodeFromRecord` resolves `label` from `name_en || canonical_name || statement || id`; evidence records have `source_name` (none of the others), so every Evidence node in `/api/nodes/*/neighbors` shows e.g. `evidence_ycb_task_design` instead of the source name (verified). Add `record.source_name` to the fallback chain.

### 10. [minor] Claim nodes whose subject is an object are dead ends
- `store.js:674-682` only links claims to tasks (`claimsFor(task.id)...`), and the evidence branch (`:706`) only follows `getTask(claim.subject_id)`. The 223 `catalog_identity` claims (subject = object) render as center + evidence with no edge back to the object, and evidence → claim → object is never traversed. Add `maps.objects.get(claim.subject_id)` handling in both branches.

### 11. [minor] Global `blocked_conditions` block every task, including ones that never reference the condition
- `assessment.js:214-224`: any value in `blocked_conditions` that is not already a requirement-level blocker is appended as a `safety` reason to **every** task, so `blocked_conditions=food_safe` marks tool-workshop tasks `blocked`. The contract says explicit safety blockers produce `blocked`, and a test asserts cross-task application, so this may be intended — flagging because the UI "Blocked conditions" option list is derived from all conditions and a user is likely to expect per-task relevance. `SAFETY_CONDITIONS` (assessment.js:17-22) is defined and never used.

### 12. [minor] wrangler `find_additional_modules` + `base_dir: "."` sweeps `node_modules`
- Dry-run module list includes `node_modules/blake3-wasm/dist/wasm/{browser,nodejs,web}/blake3_js_bg.wasm` (3 × 33 KB) and `node_modules/miniflare/dist/local-explorer-ui/index.html`, plus `frontend/*.html` as Text modules (they are also uploaded as assets). Harmless today (~140 KB) but any dev dependency that ships `.txt/.html/.wasm/.bin` is uploaded with the Worker. The manifest is both inlined (esbuild JSON import, verified in `worker.js:1659`) and shipped as a Text module — duplicate but harmless.
- Fix: add `"fallthrough": false` to the Text rule (disables the default `**/*.txt`, `**/*.html` Text rule) and consider explicit `CompiledWasm`/`Data` rules with empty globs; or exclude via `.wranglerignore`-style globbing if/when supported.

### 13. [minor] Node store silently tolerates missing seed files
- `store.js:36-44` `readSeed(..., required=false)` returns `[]` for a missing base seed in Node (the Worker passes `requireSeedFiles: true`). A renamed `task_planning.json` would start the server with every task `unknown` and no error. Consider requiring files by default and only relaxing in tests.

### 14. [minor] Runtime duplicate ids are not detected
- `store.js:110-123` `asMap` lets a later duplicate overwrite the Map entry while `data.*` arrays keep both rows, so `/api/tasks` lists both and `/api/tasks/:id` returns the last one. The validator catches this, but `npm start`/the Worker never run it; a one-line duplicate check in `createStore` (or in `loadTaskBatches`) would fail fast.

---

## Validator / test gaps (all currently pass validation but are not checked)

| Gap | Evidence in current data | Where to add |
|---|---|---|
| Task `scene_id` not in template `compatible_scenes` | **74 tasks** (e.g. `task_inspect_mustard_leak` → `scene_kitchen_counter` not in `inspect_container_state`; all `task_mustard_l1_*`); 18 `template_ycb_round3_*` templates have no `compatible_scenes` at all | `validate_seed_data.js` task loop (~line 560) |
| Template roles vs `bindings` only checked for `task_ycb_*` ids | 426 undeclared bindings across other tasks, incl. mustard `shopping_cart`/`focus`; also `execution_asset_manifest_id`/`execution_proxy_required` are schema-declared binding keys but not template roles, so extending the check naively will fire on them | validator line ~573; exempt the two schema keys |
| Objects referenced in `goal_state`/`initial_state` but absent from planning `object` requirements | 2 tasks (`task_reference_robocasa_fixtures_round2_05_bowl_counter_to_cabinet`, `..._09_cereal_counter_to_cabinet` reference `robocasa_counter`) | new check tokenising predicates against `maps.objects` |
| `catalog_identity` claim for every external object | OK today (0 missing) — but only `check_draft.js` enforces it; the main validator does not. 76 YCB objects also lack one | move the check from `check_draft.js:27-34` into `validateData` |
| Case-insensitive duplicate `asset_source_id` | 0 today; validator compares exact strings and includes `asset_source_version` in the key, so the same GSO model listed with a different "accessed" string or casing passes | `validate_seed_data.js:~520` lower-case id, compare per `asset_source` without version |
| `generation_version` consistency | 32 distinct values; `gso_round4` has 23 tasks vs 24 in rounds 1-3, `thor_round3` 23 vs 24; bundle filename ≠ version for `reference_sources_round1.json` (contains 9 different `reference_*_round1/2` versions). No rule exists; suggest requiring every task in a bundle to carry a version equal to the bundle basename or a declared `bundle.generation_version` | loader/validator |
| Scenes have no schema | 12/55 scenes have `review_status: null`/missing; no `review_status` enum check for scenes; expansion check requires `proposed` only for loop scenes | add `schemas/scene.schema.json` |
| `review_status` enum for planning procedures | schema enforces it (`task_planning.schema.json`), OK |
| 25 groups of tasks share identical (template, object, scene, intent) | not necessarily wrong, but `check_draft.js` only catches exact normalised-name duplicates | optional warning |
| Validator performance | `validate_seed_data.js:~505` re-reads and parses the schema JSON **per row** (~6 000 reads). Hoist outside the loop |

## Script edge cases
- `scripts/check_draft.js`: nonexistent path or non-array `tasks` → uncaught exception with stack trace (exit 1, OK code but noisy). A draft whose basename equals an active bundle (`food.json`) silently *replaces* that bundle in the scratch copy — intended for re-validating an edited copy (the test relies on it), but a mis-named new draft then validates against a seed set missing the real bundle and reports confusing "unknown template" errors. Suggest printing "replacing active bundle X" when that happens.
- `scripts/report_similar_tasks.js`: `--min abc` → `NaN`, prints "0 pair(s) at or above NaN", exit 0; `--only` with no value → `undefined` (acts as no filter). Validate args and exit 2.
- `scripts/report_ycb_coverage.js`, `scripts/validate_research.js`: no issues found; exit codes correct.
- `node scripts/check_draft.js data/drafts/*.json` currently fails (duplicate planning across the untracked drafts) — informational, not a backend bug.

## Verified correct
- Static path traversal: `pathname` is not decoded before `path.resolve`, URL parser normalises `/../`; `..%2F`, `%2e%2e`, `%00` → 404; `startsWith(frontendDir + sep)` guard works. (`/index.html/` and `/app.js/../index.html` resolve to index.html — harmless.)
- Malformed percent-encoding in path segments → 400; invalid encoding in query is tolerated (URLSearchParams).
- `/api` and `/api/` → 404 JSON; unknown scene_id → 400; bad enums → 400; unknown task/object/node → 404; unknown `procedure_id` → 400; `limit=abc` → default; empty `available_objects=` is "provided, none" (contract unknown-vs-none semantics honoured, including `capabilities`/`confirmed_conditions`).
- Blocked > missing/conflict/unsupported > unknown precedence; `rigid_sim` profile blocks non-rigid capabilities; OR groups for role/contents/scene, AND for others — all consistent with the contract.
- `mode=ready` filters by assessment; generated proposals return `[]` in ready mode; `proposal_*` ids never enter `data.tasks`, so exports cannot contain them. No `proposal_<template>_<object>` id collision exists in current data (checked all 469×299 pairs). In production data every object already has seeded tasks, so `template_candidates` mode is effectively unreachable.
- CSV: every cell is quoted with `""` escaping; 133 cells contain commas/quotes/newlines and round-trip; no current cell starts with `= + - @` (no formula-injection guard exists, though).
- Manifest `data/seeds/ycb_batches_manifest.json` lists exactly the 38 bundles on disk; wrangler `rules` globs cover every seed and the manifest; `preserve_file_names` keeps the `/bundle/data/seeds/...` paths the store reads; esbuild inlines the manifest import correctly.
- `seed-batches.js` rejects path-like filenames and non-JSON; sort order matches between Node discovery and manifest.
- Worker router: `/api*` and all non-GET go to the Node adapter; static GETs go to ASSETS (confirmed under `wrangler dev`).
- Graph: object ↔ concept, object ↔ affordance, task ↔ resource/object, task ↔ scene/intent/skill/template are traversable in both directions; lens filters match the contract.
