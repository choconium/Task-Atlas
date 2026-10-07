# UI probes

Playwright scripts used for the 2026-10-08 review (`docs/reviews/2026-10-08/`).
They are not part of `npm run check`. To run one:

```bash
npm start &                      # or PORT=3123 node backend/server.js
npm i --no-save playwright@1 && npx playwright install chromium
node scripts/ui-probes/ui_probe.js http://127.0.0.1:3000 /tmp/out
```

| Script | What it exercises |
| --- | --- |
| `ui_probe.js` | Object index count, asset links per source, JA-mode English leftovers, context changes, task inspector and card download, graph click/lens/back, zoom controls, search, rapid switching, mobile overflow, sub-pages |
| `zoom_probe.js` | Zoom bounds, keyboard zoom while typing, wheel, drag vs click suppression, resize reset |
| `probe3.js` | Lens effectiveness, expansion section, long titles, search edge cases, race on rapid object switching, context change with a task selected, JA inspector, mobile touch scroll over the graph |
| `perf_probe.js`, `perf2.js` | Render time and layout height for hub nodes (skill_orient 210 nodes, skill_grasp 673 nodes) |
| `verify.js` | Re-checks of static-review findings (double-click crumbs, checkbox/radio state, group labels) |
