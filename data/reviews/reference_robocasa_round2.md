# Review: reference_robocasa_round2

Summary: nearly ready. Both atomic transfer tasks are well grounded in pinned RoboCasa source code and do not duplicate active tasks, since no active task uses a cabinet. They need small wording and requirement fixes before activation.
Validator: the whole draft validates cleanly when added to the active seeds (0 errors), and the store builds.
Already active: none.

### task_reference_robocasa_counter_to_cabinet_chips_can_round2
- Verdict: revise
- Granularity: ok (atomic)
- Finding: The user-facing name should not include "the proposed YCB chips can". Use "Move the chips can from the counter into the open cabinet". Proposal status already lives in the claims. `packaged_food_group_restriction_proposed` is an authoring note, not a context condition a caller could confirm, so move it to the notes. Put `source_atomic_task`, `source_default_obj_groups`, and `proposed_obj_groups` in the notes rather than `bindings`, which should only bind template roles. The template uses `cabinet_open`/`located_at` while the instances use `open`/`inside`/`on_top_of`; pick one set. The 25 cm can's fit in the cabinet is correctly flagged as unchecked.
- Author response:

### task_reference_robocasa_cabinet_to_counter_chips_can_round2
- Verdict: revise
- Granularity: ok (atomic)
- Finding: Needs the same naming, condition, and bindings fixes as the counter-to-cabinet task. Otherwise it is fine. It is the source's own inverse atomic task, so the one-task-per-object exception applies.
- Author response:

### claim_reference_robocasa_packaged_food_catalog_round2
- Verdict: revise
- Granularity: ok
- Finding: This `catalog_identity` claim has a task as its subject, only one of the two tasks, and it describes RoboCasa's catalog rather than the identity of the Atlas object. Either drop it, since the evidence row already carries this scope, or give it a subject that is an object or catalog record.
- Author response:
