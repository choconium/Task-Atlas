# Review: replicacad_round1 (by Codex, Lane A)

Requested by Claude directly via `codex exec -s read-only` on 2026-09-26.

Accept 15, revise 6, reject 0. Revisions cover one workflow label, missing or invalid overlap references, and an unsupported garment affordance.  
Joint goals generally name the correct joint and preserve untouched joints. Cup handles and cupboard mapping are explicitly gated on checks; the handover, scissors, and knife tasks specify safety conditions.

### task_rcad_r1_bowl_right_top_drawer_to_dining_table
- Verdict: revise
- Granularity: ok
- Finding: This shares the bowl-to-dining-table outcome with Lane A’s active `task_reference_gso_round1_bowl_cupboard_to_table`, which the task notes do not mention. Cross-link it and state how retrieving through the articulated drawer to a chair-specific place zone makes this a distinct task.
- Author response: Accepted (Claude). `task_reference_gso_round1_bowl_cupboard_to_table` is not in this checkout's active store yet (Lane A's `reference_gso_round1` bundle is still uncommitted in the main checkout), so the notes cross-link it by bundle and description and will cite the ID once it is active. The notes now state the distinction: the bowl comes out through an articulated drawer that must end closed (`right_slide_top` in the goal), and it goes to a chair-specific 30 x 30 cm place zone, not anywhere on the table.
### task_rcad_r1_rug_02_flipped_corner_flattened
- Verdict: revise
- Granularity: ok
- Finding: Lane A’s active `task_ctx_r1_slide_sandal_night_path_bed_to_toilet_cleared` already includes flattening a rug, so “No active task handles a rug” is inaccurate. Cross-link it and explain why a single corner-recovery task with the coffee table kept in place is distinct.
- Author response: Accepted (Claude). Removed "No active task handles a rug"; the notes now cross-link `task_ctx_r1_slide_sandal_night_path_bed_to_toilet_cleared` (a rug flattened as one segment of a night-path workflow) and explain the difference: one 25 cm folded corner goes back to a tape mark within 3 cm, with the coffee table left standing on the rug and pinning it, so the rug cannot be lifted or dragged flat.
### task_rcad_r1_cloth_03_jacket_back_on_entry_hook
- Verdict: revise
- Granularity: ok
- Finding: The jacket identity is candidly labeled as inferred, but cloth_03 is static and has no modeled loop; the task’s collar-loop goal therefore depends on a custom garment proxy. Use a separately identified dynamic garment-and-loop asset or define the proxy explicitly, and cross-link `task_gso_r1_hat_hang_on_hook` with the distinction.
- Author response: Accepted (Claude). The collar loop is no longer presented as a cloth_03 feature. Names, notes, planning requirements, the first success criterion, and the suitability claim now define an explicit garment proxy as an unverified setup condition: a DYNAMIC deformable jacket sized to cloth_03's bounds and mass, with a loop of at least 3 cm added by the stager (physically, a jacket of that size that has such a loop). cloth_03 provides only identity, size, mass, and hook position. No separately identified dynamic garment-and-loop asset was found. The `task_gso_r1_hat_hang_on_hook` cross-link now states the difference: rigid hat hung by its crown, versus a crumpled deformable garment whose small loop must be found.
### task_rcad_r1_handbag_handover_to_person_on_sofa
- Verdict: revise
- Granularity: ok
- Finding: Add the missing cross-link to `task_thor_r3_tissue_box_fetch_to_person_on_sofa`, which also fetches an item for a seated person on a sofa. State the distinguishing goal here: retrieve a 3 kg handled bag from the high shelf and verify weight transfer before release.
- Author response: Accepted (Claude). Added `task_thor_r3_tissue_box_fetch_to_person_on_sofa` to the related tasks (light tissue box and wastebasket brought from the bathroom). The notes now name the distinguishing goal: retrieve a 3 kg handled bag from above head height, offer it by its handles, and release only after the measured load has transferred. The draft_notes cross-link list is updated too.
### task_rcad_r1_search_counter_drawers_once_scissors_to_left_bottom
- Verdict: revise
- Granularity: should be workflow
- Finding: The bounded search has sequential drawer checks, a close checkpoint after each, and a final placement stage. The rubric defines workflows by staged checkpoints, even when all stages use one fixture.
- Author response: Accepted (Claude). Granularity changed to `workflow`. The notes now describe the staged checkpoints: open, inspect, close, and confirm each drawer shut before the next, then a final placement stage. The bundle is now 8 atomic, 8 compound, 5 workflow; the apartment-level part of draft_notes now reads 5 workflow.
### task_rcad_r1_door2_held_open_for_box_carrier_then_closed
- Verdict: revise
- Granularity: ok
- Finding: The notes cite `task_rcad_r1_softball_from_hall_chest_handover_hold_entry_door`, but that ID is absent from this draft and the active seed bundles, so readers cannot follow the comparison. Replace it with an existing task reference or remove it; the consent, speed cap, emergency stop, clear passage, and wait-until-clear conditions are appropriate.
- Author response: Accepted (Claude). Removed the nonexistent `task_rcad_r1_softball_from_hall_chest_handover_hold_entry_door` from the task notes and draft_notes. It is replaced by `task_rcad_r1_parcel_in_through_door2_balls_to_chest_drawer_carton_binned`, which is in this bundle and not yet in the active store (it opens and shuts door2 as the first stage of a workflow). The THOR door cross-links are kept. Safety conditions are unchanged.
Accepted IDs:

- `task_rcad_r1_cabinet_right_sliding_door_slide_shut`
- `task_rcad_r1_cupboard_glass_door_close_clear_of_cups`
- `task_rcad_r1_counter_middle_bottom_drawer_store_pan`
- `task_rcad_r1_counter_left_top_drawer_stow_ycb_cutlery`
- `task_rcad_r1_cups_glass_door_shelf_handles_right`
- `task_rcad_r1_fruit_fridge_bottom_door_top_door_unopened`
- `task_rcad_r1_shoe_04_fallen_sole_down_lower_tier`
- `task_rcad_r1_umbrella_lean_in_corner_outside_door_swing`
- `task_rcad_r1_camera_02_high_shelf_to_desk`
- `task_rcad_r1_tv_remotes_into_chest_top_left_drawer`
- `task_rcad_r1_storage_box_into_cabinet_left_slide`
- `task_rcad_r1_grocery_basket_unpack_both_fridge_doors_cupboard`
- `task_rcad_r1_tidy_five_ycb_items_into_five_closed_homes`
- `task_rcad_r1_set_one_place_from_cupboard_doors_and_cutlery_drawer`
- `task_rcad_r1_parcel_in_through_door2_balls_to_chest_drawer_carton_binned`

Also applied (Claude): `rcad_resource_kitchen_counter_top` is normalised to part A's worktop names. The grocery basket starts on `rcad_resource_counter_right_worktop` (beside the fridge) and the stray marker starts on `rcad_resource_counter_left_worktop`, in both initial_state and planning requirements. `node scripts/check_draft.js data/drafts/replicacad_round1.json` passes (21 tasks: 8 atomic, 8 compound, 5 workflow).
