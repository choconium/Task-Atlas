# Review: reference_ycb_gripper_assessment_round1

Summary: revise before activating. The source grounding (YCB P-GA-0.01, Appendix B.2) and the claims are careful. However, the bundle fails validation, and the two tasks are fragments of a single protocol trial, each starting from a mid-trial state.
Validator: fails with 2 errors: `task_reference_ycb_gripper_assessment_{lift,rotate}_hammer: unknown intent_id intent_assess_gripper`. The `intents` array in a bundle is ignored, because `loadTaskBatches` only merges tasks, planning, claims, scenes, templates, external objects, and evidence. The new intent must go into `data/seeds/intents.json` in a separate shared-file commit, or the tasks must reuse an existing intent such as `intent_inspect`.
Already active: none.

### task_reference_ycb_gripper_assessment_lift_hammer
- Verdict: revise
- Granularity: should be merged with the rotate task into one atomic task (see below)
- Finding: The task starts from `grasped_by(hammer, evaluated_gripper)`, and its goal is only lift and hold. That is the skill-level fragment the rubric warns about, and it can't be reset or collected on its own. Merge it with the rotate stage into one task covering the source's tool sequence: "At SP1, grasp the hammer, lift it, hold 3 s, rotate 90° about grid x, hold 3 s". The start state is the hammer at rest at SP1 and the goal is the held, rotated end state. It is one uninterrupted motion sequence, so it stays atomic. The ten condition requirements overlap and are spelled inconsistently: `sp1_is_offset_board_grid_origin_x0_y0` here, `sp1_offset_board_grid_origin_not_sp4_table_grid_origin` in the procedure. Collapse them into a few reusable IDs, such as `gripper_assessment_grid_setup` and `hammer_at_sp1_major_axis_x`. The drop-zone safety condition for the heavy hammer is appropriately declared.
- Author response:

### task_reference_ycb_gripper_assessment_rotate_hammer
- Verdict: revise
- Granularity: should be merged into the lift task
- Finding: The initial state includes the history predicate `held_for_seconds(hammer, 3)` and a mid-trial pose reference, so this task only exists as a continuation of the lift task. In the merged task, keep the baseline pose captured before rotation, the unsigned 90° target, and "no invented tolerance" as the merged task's success criteria. Those parts are good.
- Author response:

### intent_assess_gripper
- Verdict: revise
- Granularity: ok
- Finding: The definition is reasonable, but a bundle cannot declare an intent. Propose it through `intents.json` in a small separate commit, or reuse `intent_inspect`.
- Author response:
