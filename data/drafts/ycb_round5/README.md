# Round 5 promotion record

The four Round 5 JSON bundles from this draft checkpoint have been promoted to `data/seeds/ycb_batches/` and are active seed data. They add 77 proposed tasks, one for each YCB catalog object: 18 food objects (001–018), 16 kitchen objects (019–034), 18 tool objects (035–052), and 25 shape/task objects (053–077). Each task has one planning record and four claim records. Provenance is recorded per task: newly written or materially revised records use gpt-6-luna/max, while untouched records retain their original provenance. Before promotion, all four bundles validated in memory against the default seed data.

The promoted tasks are included in active task counts, the API, and the YCB coverage report. The cross-round duplicate-goal review is complete and all flagged overlaps have been revised. Review and schema/reference validation do not establish physical feasibility or robot success.

## Post-promotion validation

The coverage documentation includes the active fifth round. Post-promotion validation passed:

- `npm run check`: seed validation passed with 453 tasks, 453 planning records, and 1,813 claims; research validation passed; all 24 Node tests passed.
- `npm run coverage:ycb`: all 77 catalog objects are covered by 453 tasks across five rounds, with zero missing objects. Round 5 covers 77/77 objects and has five tasks with direct catalog-partner requirements across five dependency edges.

The active catalog coverage now includes five complete rounds. Round 5 covers 77 of 77 objects (100% proposed coverage). All Round 5 task-suitability claims remain proposed; population-frequency, robot-execution, and asset-compatibility claims remain unknown with null values. All timing fields remain null, and physical feasibility and robot success have not been established.
