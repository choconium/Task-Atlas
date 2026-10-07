# Repository review, 2026-10-08

Full read of the repository at `fb43e2f` (827 tasks, 222 external objects), the
test suite, and a dynamic UI pass with Playwright against a local server and
the deployed Worker. Files in this directory:

- `README.md` (this file): summary of what was tested, what was found, and what
  was fixed in the follow-up commits.
- `frontend-static-review.md`: line-level review of `frontend/` (independent
  reviewer agent).
- `backend-static-review.md`: line-level review of `backend/`, `scripts/`,
  `tests/`, `schemas/`, and the Worker configuration (independent reviewer agent).
- Probe scripts: `scripts/ui-probes/` (Playwright; see its README).

## Test and deployment status

| Check | Result |
| --- | --- |
| `npm run check` | 38/38 tests pass; seed and research validation pass (~115 s, the YCB reachability test alone is 44 s) |
| `wrangler deploy --dry-run` | OK; 58 modules, 10,080 KiB raw / 1,238 KiB gzip (free-tier limit 3 MB gzip) |
| Deployed Worker | `/api/health` on the live site reports the same counts as local (827 tasks) |

## UI bugs reproduced in the browser

| # | Finding | Repro | Status |
| --- | --- | --- | --- |
| 1 | Phone users cannot scroll the page by swiping over the graph: `#graph` has `touch-action: none` and pointer drags pan the map, and the graph is 55 dvh tall | Pixel 7 emulation: swipe over graph, `scrollY` 2188 → 2188; swipe over hero 0 → 300 | fixed |
| 2 | Double-clicking a graph node pushes the previous centre twice; Back needs two presses | Double-click a node → crumbs `Mustard bottle / Mustard bottle` | fixed |
| 3 | Unchecking the last resource/capability/condition checkbox leaves no radio selected while the state is "none confirmed" | Open the details, check then uncheck a capability | fixed |
| 4 | Graph group nodes lose their counts (`Affordance · 6` → `Affordance`) because `label()` prefers `name_en` over `label` | Any object graph | fixed |
| 5 | `YCB_ARCHIVE_IDS` misses `023_wine_glass`, `046_plastic_bolt`, `047_plastic_nut` (archives exist, HTTP 200) | Select the wine glass | fixed |
| 6 | Any `#graph` resize re-renders with `reset: true`, wiping zoom/pan; on phones `dvh` changes while scrolling | Zoom, resize window | fixed |
| 7 | Hub nodes are unusable: `skill_grasp` returns 673 neighbours, rendering blocks for 1.3 s and lays out a 73,874 px tall column; Fit all → 0.7 % | Search `skill_grasp` | mitigated (neighbour cap with notice) |
| 8 | English remains in Japanese mode: task-row scene name (`scene_name_en` only), assessment status words, "Proposed procedures (n)", "Time estimates:", "seeded task candidates", "Concept:", status pill, `#empty`, lens "All", breadcrumb labels frozen in the pushed language | Toggle language | fixed (UI strings; backend reason messages remain English data) |

Minor UI items also fixed: ReplicaCAD object folder links for `configs/objects/*`, THOR "asset source file" pointing at the 1.5 MB asset database, GSO direct ZIP download, raw ids in the inspector after a search hit, zoom-out floor, `#zoom-fit` styling, collection-card error handling.

## Backend findings

| Finding | Status |
| --- | --- |
| 500 handler returns `error.message` (`detail`), exposing absolute paths for fs errors | fixed |
| `HEAD` and `OPTIONS` return 405; health probes and CORS preflight fail | fixed |
| Collection-card `provenance` wrong for the 17 `context_round1` tasks (reported as `mustard_tasks.json`) | fixed |
| `/api/tasks` spends ~36 ms CPU in per-comparison `localeCompare`; Workers free tier budgets ~10 ms | fixed (hoisted `Intl.Collator`) |
| `planningFor` and `claimsFor` are linear scans called per task; `addNode`/`addEdge` use `.some()` | fixed (indexes) |
| `meta.total` is the post-slice count; `parseLimit` caps at 500 and the frontend asks for 500 | fixed (true total + frontend paging guard) |
| Worker startup parses ~10 MB of JSON at module scope (~230 ms of the 400 ms limit) | open; grows with each bundle |
| Search has no ranking; >80 matches are cut in seed order | open |
| Evidence graph nodes show raw ids | fixed |

## Validator gaps (all pass today)

74 tasks use a `scene_id` outside their template's `compatible_scenes`; the
binding-vs-role check runs only for `task_ycb_*`; `catalog_identity` is required
only by `check_draft.js`; no `generation_version` consistency rule;
`check_draft.js` crashes on a missing path; `report:similar --min abc` exits 0
with `NaN`. The follow-up adds warnings/guards for these without changing data.

## Verified correct

HTML escaping and `safeHttpUrl` on every interpolation, `rel="noopener noreferrer"`
on external links, element ids, API response shapes, zoom math and clamping,
keyboard zoom isolated from the search box, drag-vs-click suppression, static
path-traversal guard, 400/404 semantics, CSV quoting, manifest and Wrangler
globs.

## Follow-up commits (same day)

- `frontend/app.js`, `index.html`, `styles.css`: items 1–8 above plus the minor
  items; neighbours are capped at 120 with a localized notice (`#graph-note`);
  zoom floor 5 %; breadcrumbs re-label on language toggle; expansion section
  only for the mustard bottle. Verified with `scripts/ui-probes/final_check.js`
  (vertical touch swipe over the graph now scrolls the page, 2188 → 2540).
- `frontend/asset-downloads.js`: YCB archive set re-probed (60 of 77 exist),
  GSO direct ZIP, ReplicaCAD folder for any path, THOR database note, GitHub
  folder links for mujoco and robocasa, license host fallback; 21 unit tests.
- `backend/`: 500 bodies carry no detail; HEAD mirrors GET, OPTIONS → 204 with
  CORS; provenance from bundle origins (`bundle`, `*_file` fields added;
  `*_seed` kept for compatibility with existing tests); hoisted collator and
  task/subject indexes (`/api/tasks` 27.7 → ~11 ms, `/api/objects` 11.3 →
  0.3 ms); `meta.total` is the pre-slice total; `scene_name_ja` /
  `intent_name_ja` on task rows; evidence nodes labelled by `source_name`.
  10 HTTP tests.
- `scripts/`: the validator returns `warnings` (278 on current data: 74 scene
  mismatches, 18 templates without `compatible_scenes`, 186 undeclared
  bindings) without failing; missing `catalog_identity` is a warning in
  `validate_seed_data.js` because `tests/external-objects.test.js` builds
  probe objects without claims, and stays an error in `check_draft.js`;
  `check_draft.js` and `report_similar_tasks.js` reject bad input with exit
  code 2. 16 tests.

Still open: Worker start-up time grows with each bundle (JSON parse at module
scope); search ranking; backend reason messages are English-only data; desktop
wheel over the graph zooms instead of scrolling the page (by design, noted).

