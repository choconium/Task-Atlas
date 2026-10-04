# Deployment verification — 2026-10-05

- Site: https://task-atlas.chocopan.workers.dev
- Worker version: `c18b1937-fc7e-4807-a591-562db344ada7`.
- Git revision at deployment: `f26d710` (source bundles `0e9fff7`, schema/vocabulary `f41669c`).
- `npm run check` passed all 38 tests, including manifest parity, API/export routes and complete YCB coverage. Seed/research validation and the Worker dry-run build also passed.
- Public `/api/health` returns `ok: true`, 299 total objects and 827 task instances.
- Public object-scoped task queries return exactly four tasks for each of the five Kenney objects. All 20 task IDs, object/template bindings, atomic labels and English/Japanese names match the committed batch.
- Current Kenney file audit matches the archive, bundled licence and all five exact GLB hashes. The source batch has 20 matching single-predicate atomic templates/tasks and one plan per task.
- Complete YCB coverage remains 77/77, with 484 YCB-primary tasks and no missing objects. All 145 Lane A source tasks passed independent review after the documented corrections.

The published records are proposed task designs. Source identity and licence evidence do not assert robot success or simulation readiness.
