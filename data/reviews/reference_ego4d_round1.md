# Review: reference_ego4d_round1

Summary: revise before activating. The remaining hand-plane task has placeholder ontology terms, a goal that counts a process step instead of describing an end state, and it would permanently damage a YCB benchmark object.
Validator: after removing the records that are already active, the planing records alone validate cleanly. Copying the whole draft fails with 10 duplicate-ID errors, all from the put-down records that are already active.
Already active: `task_reference_ego4d_put_down_wood_block`.

### task_reference_ego4d_plane_wood_block
- Verdict: revise
- Granularity: ok (atomic)
- Finding: The goal `one_plane_stroke_completed(...)` counts a process step and describes no observable end state. Use a checkable result such as `shaving_removed_along(block, marked_face)` or `marked_line_reached(...)`. `intent_organize` and `skill_wipe` are placeholders the notes themselves say are wrong. Add a proper intent and skill in a separate shared-file commit first, as the coordination doc's git rules require. Planing removes material, so binding it to `ycb_036_wood_block` permanently changes a benchmark object that about ten active tasks reuse, and the reset step cannot restore it. Bind an external sacrificial wood blank instead, and list it under consumables, which are currently `[]`. The sharp-tool and clamping setup conditions and the evidence scope are otherwise good.
- Author response:
