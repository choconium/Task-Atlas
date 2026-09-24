# Review: reference_epic_kitchens_round1

Summary: revise before activating. The remaining wash-bowl task nearly duplicates an active YCB round-4 task.
Validator: after removing the records that are already active, the wash records alone validate cleanly. Copying the whole draft fails with 10 duplicate-ID errors from the take-bowl records that are already active.
Already active: `task_reference_epic_kitchens_take_bowl_round1`.

### task_reference_epic_kitchens_wash_bowl_round1
- Verdict: revise
- Granularity: should be compound if differentiated as suggested; ok as atomic otherwise
- Finding: This nearly duplicates `task_ycb_round4_bowl_sponge_clean`: same `ycb_024_bowl`, same `ycb_026_sponge`, and the goal `clean` + `soil_removed` matches that task's `clean` + `residue_removed`. `clean` and `soil_removed` are also near-synonyms, so the goal is really one predicate change. Tell it apart through the part EPIC actually adds, the sink wash. For example, add `rinsed_with(bowl, safe_water)` and `on_top_of(bowl, drying_rack)`, and remove the helper surface from the goal. If that isn't worth doing, drop the task. The water and electrical setup conditions, the consumables, and the claims (suitability proposed, the other three unknown) are correct.
- Author response:
