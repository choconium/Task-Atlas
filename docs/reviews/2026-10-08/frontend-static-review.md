# Frontend review — Physical AI Task Atlas

Read-only review of `frontend/{index.html,app.js,asset-downloads.js,styles.css,start.html,start.js,about.html,about.js}` against `backend/server.js` and `backend/app/store.js`. Every API shape the frontend touches was checked against a live `createStore()` over the real seeds (299 objects), and every generated download URL was HEAD/GET-probed.

## Ranked findings

### Bugs

1. **asset-downloads.js:5-18 — `YCB_ARCHIVE_IDS` is stale; three objects with real archives are shown as "no download".**
   Probed all 77 YCB ids against `https://ycb-benchmarks.s3.amazonaws.com/data/berkeley/<id>/<id>_berkeley_meshes.tgz`. All 57 listed ids return 200, but `023_wine_glass`, `046_plastic_bolt`, `047_plastic_nut` ALSO return 200 and are missing from the set, so those three objects get only the catalogue link plus the "Choose the corresponding object…" note.
   Fix: add `"023_wine_glass", "046_plastic_bolt", "047_plastic_nut"` to the set. (The remaining 17 excluded ids genuinely 404, e.g. 020_pitcher_lid; `039_keys → 039_key` remap is correct.)

2. **app.js:1388-1393 + styles.css:601/933 — zoom/pan is wiped by the ResizeObserver whenever `#graph` height changes, and its height is `60dvh`.**
   On phones the viewport `dvh` changes as the browser chrome hides/shows during scroll, and when the virtual keyboard opens; each change re-runs `renderGraph({ reset: true })`, so the user's zoom and pan vanish mid-interaction. Also fires when the inspector reflows the grid on ≤1250px.
   Fix: on resize call `renderGraph()` (keep view) or `renderGraph({ reset: false })` and only reset when the centre id changed; alternatively size `#graph` with `svh` so it does not track browser chrome.

3. **app.js:1094-1105 — history is pushed before the fetch and never rolled back.**
   Repro: double-click any graph node. Both `loadGraph` calls see the same `state.graph.center_id`, so the previous centre is pushed twice → duplicate breadcrumbs and "Back" must be pressed twice. Same on a failed neighbours fetch: a crumb for the current centre is added while the graph never changed, so "Back" reloads the graph you are already on.
   Fix: move the `state.history.push(...)` after `if (version !== state.graphVersion) return;` (store `previous`/`previousNode` before the await), or guard with `state.history.at(-1)?.id !== previous`.

4. **app.js:1137-1140 — `navigateNode` overwrites the error from a failed `loadGraph`.**
   `loadGraph` catches and calls `renderError(elements.inspector, …)`, but `version === state.graphVersion` still holds, so `renderGraphNodeInspector` immediately replaces the error with "Explore this node's typed relationships…" while the graph still shows the old centre. The user never sees the 404.
   Fix: have `loadGraph` return `true/false` and only render the node inspector on `true`.

5. **app.js:1204-1222 — a collection-card error destroys the task inspector.**
   `/collection-card` returns 400 for every task without a planning record ("…cannot be exported as a collection card"). `renderError(elements.inspector, …)` replaces the whole inspector with that one line and sets `state.inspectorError`, so even toggling language keeps the error; the user must re-click the task. Also `URL.revokeObjectURL(link.href)` is called synchronously after `link.click()`, which can abort the download in Firefox.
   Fix: render the error into a `<p class="message">` placed after `#download` (do not touch `inspectorError`), and `setTimeout(() => URL.revokeObjectURL(url), 0)`.

6. **i18n — strings that stay English in Japanese mode.**
   - index.html:121 `#empty` "No neighboring nodes are available." has no `data-copy`.
   - index.html:105 lens button "All" has no `data-copy` (its siblings translate).
   - app.js:670-671 `"${n} seeded task candidates"`, `"Concept: …"` hardcoded.
   - app.js:740 `Proposed procedures (${n})`; app.js:796 `Time estimates:`.
   - app.js:1417/1425 status pill "objects ready" / "Offline" / "Connecting" (never re-rendered on toggle).
   - app.js:617 task rows show `task.scene_name_en` in JA (scenes all have `name_ja`; the summary just doesn't carry it).
   - app.js:1101-1104/1078 breadcrumb labels are frozen in the language active when pushed; toggling language leaves old-language crumbs.
   Fix: add `data-copy` pairs for the two HTML strings; add UI keys for the four app.js literals; store `{id, node}` in history and call `label(node)` in `renderBreadcrumbs`.

### Likely bugs

7. **app.js:260-274 `label()` drops data the backend computed.**
   - Group nodes: store builds `label: "Affordance · 6"` but `label()` prefers `name_en` ("Affordance") in both languages, so counts never appear in the graph.
   - Expansion loops: `loop.title` ("Object interactions and meal preparation") is never read; EN shows just "Round 1", JA shows `ラウンド 1 — mustard_expansion_loop_1` (raw id via the `item.id` fallback).
   Fix: in `renderExpansionLoops` use `loop.title_ja || loop.title`; in `renderGraph` use `node.node_type === "Group" ? node.label : label(node)`.

8. **app.js:1253-1257 `search()` → non-object/task hit shows a raw id in the inspector.**
   `navigateNode(hit.id)` has no `knownNode` and `state.graph` is the old graph, so after the load the inspector heading is e.g. `scene_home_kitchen` with type "NODE", even though the freshly loaded graph contains the labelled node. Same path for expansion scenes if `node` lookup misses.
   Fix: in `navigateNode`, after a successful load, `const resolved = state.graph.nodes.find(n => n.id === id) || node || { id };`.

9. **asset-downloads.js:63-69 `replicaCollectionFolder` — 9 of 13 ReplicaCAD objects link to the repo root.**
   Only `urdf/` paths get a directory; `configs/objects/frl_apartment_*.object_config.json` yields `directory = ""`, so "Browse dataset model files" opens the dataset root instead of `objects/` where the referenced `.glb` lives (verified `…/tree/<rev>/objects` is 200).
   Fix: `const directory = filePath.startsWith("urdf/") ? dirname : filePath.startsWith("configs/objects/") ? "objects" : "";`.

10. **asset-downloads.js (THOR, 71 objects) — "Asset source file" points at a 1.5 MB `asset-database.json`.**
    `sourceKind()` classifies `.json` as `source_file`, so every THOR object gets a primary-looking secondary link labelled like mujoco's `model.xml`, but it is the whole ProcTHOR asset database, not a model. Misleading for the biggest non-YCB group.
    Fix: treat `.json` as `source_page` (or add a `asset_database` kind/label), keep the `source_only` note.

11. **app.js:1059-1069 focus handler fights the drag.**
    `pointerdown` on a node near the edge focuses it (tabindex=0) → focus handler recentres the view → first `pointermove` restores `drag.view` → visible jump at drag start. Clicking such a node also recentres for one frame before navigation.
    Fix: skip when `state.graphDrag` is set or only recentre when `node.matches(":focus-visible")`.

12. **app.js:452-473 — unchecking the last checkbox leaves the fieldset with no radio selected.**
    State becomes `[]` ("none confirmed", sent as `key=` in the query) but neither "Unknown" nor "None confirmed" is checked.
    Fix: after `checkedValues`, if empty, set `fieldset.querySelector('input[value="none"]').checked = true`.

### Minor

13. **asset-downloads.js robocasa (6 objects)** — only a `model.xml` blob link; meshes are siblings, but `githubModelFolder` is mujoco-only and its regex requires `models/<name>/<file>`. Generalise to "parent folder of the blob" so robocasa also gets a `model_page` link and loses the `source_only` note.
14. **GSO (95 objects)** — only the Fuel model page is offered. `https://fuel.gazebosim.org/1.0/GoogleResearch/models/<name>.zip` returns 200 (`application/zip`, verified on 6 names) and could be added as `archive`. (Note: `app.gazebosim.org/...` answers HTTP 404 for every path, real or bogus — it is an SPA shell, the page itself renders fine; do not "fix" it.)
15. **app.js:1323-1330 + styles.css:603** — wheel `preventDefault` whenever the graph has nodes and `touch-action: none` on `#graph`: a 420–640 px (55dvh on phones) band where the page cannot be scrolled by wheel or by one-finger swipe. Consider zoom only with Ctrl/Meta+wheel, and `touch-action: pan-y` with pan on two fingers or a drag handle.
16. **app.js:1157-1170 race** — object click while a graph-node click is in flight (or vice versa): `navigateNode`/lens/back do not bump `requestVersion`, so a slower `selectObject` later overwrites the newer node graph and inspector. Bump `requestVersion` in `loadGraph` callers that are user-initiated, or check `state.selectedNodeId` before applying.
17. **styles.css:437-440** — `#zoom-reset` is styled 12 px / `min-width:auto` but `#zoom-fit` is not, so "Reset view" and "Fit all" render at different sizes/weights. Use `#zoom-reset, #zoom-fit`.
18. **app.js:321-324 `renderError`** — EN mode shows the generic text, JA mode shows the raw English server message; looks inverted (JA users read "Task not found"). Either show `reason.message` in both or the generic text in both.
19. **a11y** — index.html:49 `aria-label` on a plain `<div>` is ignored (use `role="region"` / `<section>`); hero heading order jumps h1 → h3 (asset block); index.html:114 `<output aria-live="polite">` is redundant (`output` is implicitly live) and announces every wheel tick; `#crumbs` buttons lack `type` (harmless outside a form).
20. **app.js:564-565** — a license with `url` but null `text` renders an empty `<a>`; no seed currently hits it, but `licenseFor` can return `{ text: null, url }`.
21. **Backend label gap visible in the graph** — Evidence nodes show raw ids (`evidence_task_atlas_design`) because `nodeFromRecord` (store.js:66-69) ignores `source_name`. For the backend lane.
22. index.html `document.title` is not localised (start/about do it). Nit.

## Verified as correct (coverage)

- **Element ids**: every id in `elements` (app.js:191-226) and `byId("search-form"|"top"|"download"|"expansion-round-select")` exists in index.html; no duplicate ids.
- **API shapes vs store.js**: `/api/health.seed_counts.objects`; `/api/objects` (299 < limit 500); `/api/context-options` keys `roles/contents/profiles/resources/capabilities/conditions/blocked_conditions` (no `scenes` → `/api/scenes` fallback correct); `/api/objects/:id` → `object`, `related_task_count`, `general_concept.name_en`; `/api/tasks` rows → `assessment.{status,reasons[{kind,key,value,message}]}`, `scene_name_en`; `/api/tasks/:id` → `task`, `planning.collection.{success_criteria,setup,reset,quality_checks,consumables,time_estimates}`, `procedures[{id,label,review_status,steps[{skill_id,description}],assessment}]`, `claims{claim_type,status,statement,scope,limitations,source_ids}`, `evidence{source_name,source_locator,limitations}`, `skills[]` records; `/neighbors` → `center_id,nodes{id,node_type,label,name_en,name_ja},edges{source,target,relation}`; `/api/search` `result_type` object/task/lowercased type; `/api/expansion-loops` → `{loops[{iteration,title,nodes}],relations[{source,target,relation}]}`. `goal_state` items are strings; `time_estimates` values null-safe.
- **Procedure ids** are unique across all 827 planning records (429 distinct, 0 reused), so a stale `selectedProcedureId` cannot silently carry over to another task (guard at app.js:728 also covers it).
- **XSS**: every innerHTML interpolation passes through `escapeHtml`; all `href`s are gated by `safeHttpUrl`/`httpUrl` (http/https only, `URL.href`-normalised so the Japanese→"" fallback cannot blank a URL); `target="_blank" rel="noopener noreferrer"` on every external link; `aria-label`/`title`/`data-*` attributes escaped.
- **Pan/zoom math**: pointer-anchored zoom formula correct; scale clamped to [0.001, 4]; ±buttons disabled at bounds; `fitGraphView` caps at 100 % and centres; transform reset on each new graph (`renderGraph({reset:true})` from `loadGraph`); wheel listener `passive:false` and scoped to the svg; keyboard handler bound to the svg only, so typing in `#search` is unaffected; node Enter/Space `stopPropagation` prevents double handling; drag threshold 5 px, pointer capture set/released, click suppression cleared in `setTimeout(0)` after the synthetic click; multi-pointer does not throw.
- **No duplicate listeners**: every dynamic region is rebuilt via `innerHTML` before rebinding; window/document listeners bound once in `bindEvents`.
- **Version guards** present in `selectObject`, `selectTask`, `loadGraph`, `navigateNode`; `refreshContext` preserves the open task via `replaceGraph`.
- **i18n pairs**: all 32 `data-copy` elements in index.html have both `data-copy-en`/`-ja`; start.html/about.html select on `[data-copy-en]` and every such element has a `-ja`; `displayText` fallback only affects EN mode and no `name_en`/statement in the seeds contains Japanese (checked all objects, tasks, claims); all scenes/states/intents/skills/tasks/objects have `name_ja`.
- **Links/scripts**: `/`, `/start.html`, `/about.html`, `/styles.css`, `/app.js`, `/asset-downloads.js`, `/start.js`, `/about.js` all resolve through `serveStatic`; `start.js`/`about.js` reference existing ids (`language`, `page-description`) and run without error.
- **CSS**: `#empty[hidden] { display:none !important }` is required to beat `.graph-wrap > #empty { display:grid }`; `.graph-wrap { overflow:hidden }` contains the pan; `#expansion-loops[hidden]` works (no display rule on `.panel`); 1250 px (inspector static, full-width, scrollable) and 790 px (flex column, horizontal object strip, hidden task reasons) layouts are coherent; no light-mode fallback is attempted anywhere (dark-only by design).
- **Download URLs probed live**: YCB listed archives 57/57 → 200; `039_key` remap → 200; Smithsonian glb, Poly Haven gltf, Kenney zip, Poly Pizza glb, ABO glb → 200 with model/zip content types; mujoco `tree/` folder → 200; BEHAVIOR knowledgebase page → 200; HF ReplicaCAD `urdf/<dir>` folders → 200; `asset_ready_in_source === false` note path wired (all 4 BEHAVIOR seeds are `true`).
