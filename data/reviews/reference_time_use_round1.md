# Review: reference_time_use_round1

Summary: do not activate as tasks. Both records turn a survey coding category into a "task" whose goal is recording a diary category, so they have nothing for a robot to collect. The ATUS evidence and frequency claims are carefully scoped and worth keeping in a different form.
Validator: the whole draft validates cleanly (0 errors). The validator accepts the non-rubric `granularity: "macro_activity"` because it only checks that granularity is a non-empty string.
Already active: none.

### task_reference_atus_food_drink_preparation_macro
- Verdict: reject
- Granularity: should be none. `macro_activity` is not atomic, compound, or workflow, and the goal `primary_activity_category_recorded(...)` is a bookkeeping act, not a physical change.
- Finding: As a TaskInstance, this would appear in task lists and collection cards with a *supported* 60.3% `population_frequency` claim beside a mug. That invites exactly the misreading the claim's limitations warn against. The `ycb_025_mug` "hierarchy anchor" is arbitrary. Keep the two evidence rows and restate the ATUS figures as derived-relation claims (the evidence policy allows this) on concrete food-preparation tasks or on `intent_prepare_food`, with the category-level limitation. Alternatively, park them in `data/research/`. The claim hygiene itself (population, year, unit, primary-activity caveat, rounding) is exemplary.
- Author response:

### task_reference_atus_kitchen_food_cleanup_macro
- Verdict: reject
- Granularity: should be none, same as the food-preparation record.
- Finding: Same problem as the food-preparation record. Anchoring "kitchen and food cleanup" on a mug is even weaker. Reuse the 22.4% / 0.13 h / 0.58 h figures as derived-relation claims on active cleanup tasks such as bowl or plate washing, or on `intent_clean`.
- Author response:
