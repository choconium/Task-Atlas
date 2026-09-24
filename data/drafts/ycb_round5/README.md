# Round 5 task drafts

This checkpoint contains 77 proposed tasks, one for each YCB catalog object: 18 food objects (001–018), 16 kitchen objects (019–034), 18 tool objects (035–052), and 25 shape/task objects (053–077). Each task has one planning record and four claim records. Provenance is recorded per task: newly written or materially revised records use gpt-6-luna/max, while untouched records retain their original provenance. All four draft bundles validate in memory against the default seed data.

These files are outside the runtime seed loader. They are not included in active task counts, the API, or the YCB coverage report. The cross-round duplicate-goal review is complete and all flagged overlaps have been revised. Review and schema/reference validation do not establish physical feasibility or robot success.

## Remaining work

- Promote the reviewed draft bundles into data/seeds/ycb_batches and update the coverage documentation for the active fifth round.
- After promotion, run npm run check and npm run coverage:ycb to validate the active seed data and refreshed coverage report.

Current active coverage remains four complete catalog rounds. The fifth draft round covers 77 of 77 objects (100% proposed coverage) and is not active. Every task-suitability claim remains proposed; population-frequency, robot-execution, and asset-compatibility claims remain unknown with null values. All timing fields remain null, and physical feasibility and robot success have not been established.
