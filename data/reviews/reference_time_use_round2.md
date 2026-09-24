# Review: reference_time_use_round2

Summary: do not activate the remaining macro record; the two primitives are already active. The draft has also drifted from the active data: the active primitives dropped `bindings.survey_macro_task_id` and add `evidence_japan_2021_sports_category_definition` to the suitability claims. Re-copying this draft would reverse those changes.
Validator: after removing the records that are already active, the macro records alone validate cleanly. Copying the whole draft fails with 19 duplicate-ID errors.
Already active: `task_reference_japan_sports_kickoff_place_soccer_ball`, `task_reference_japan_sports_softball_return_recovery`. The draft copies of both, and of their suitability claims, differ from the active copies.

### task_reference_japan_sports_macro
- Verdict: reject
- Granularity: should be none. `macro_activity` is not in the rubric, and the goal `sports_category_and_2021_population_average_recorded` is not a physical state.
- Finding: This has the same problem as the ATUS macro records in `reference_time_use_round1`. A "Represent the Sports category" task would show a *supported* 13-minute frequency next to a mini soccer ball. The new `scene_japan_2021_diary_record` is not a place, so drop it too. Keep `evidence_japan_2021_sports_daily_time`, which is well scoped and interprets the Hours.minutes value correctly. Its figure belongs in a derived-relation claim on an activity-level node or in `data/research/`, never on the primitives. The active primitives already avoid assigning it. Afterwards, remove the three activated records from the draft file.
- Author response:
