# Review: thor_round2

Summary: revise before activation. 21 accept, 3 revise, 0 reject, plus one bundle-wide revise on how planning conditions and notes are written. The draft validates (`npm run check:draft`: 0 errors; 9 atomic, 9 compound, 6 workflow). Claims follow the contract: every task has a proposed suitability claim citing only `evidence_thor_task_design_round2`, and the other three claims are unknown with no sources. No task duplicates an active task. The thor_round1 lessons were applied. Preserved predicates are called preserved end-state constraints and are not counted as goal changes. Every uncertain THOR mapping (fridge door count and shelves, egg crack action, kettle lid fill, pan cooking, box, book, and doorway `isOpen` poses, SoapBottle `isUsedUp` reset, and the missing charger, liner, and cloth models) appears as both a planning condition and an `asset_compatibility` limitation. Door states sit on the THOR object that carries `isOpen`. Egg and potato are simulation-only. The apple task uses a blunt training knife and a pre-scored surrogate. Water tasks declare splash protection. Powered devices use unplugged units with dummy indicators.

### thor_round2 (bundle-wide: conditions and notes)
- Verdict: revise
- Granularity: ok
- Finding: Some planning conditions are authoring instructions, not observable setup states. (1) `stage_checkpoint_photographs` (sofa and newspaper tasks) is a quality-check step that is already in `quality_checks`, so delete it from the conditions. (2) `mug_break_risk_declared` (coffee machine) and `unbreakable_dishes_or_break_risk_declared` (dining table) tell the author to "declare it" instead of stating the setup. Choose one, for example `unbreakable_mug_surrogate` or `ceramic_mug_break_risk_accepted`, so an operator can confirm it. (3) Task notes that say "part B of this round" or "part B's task_..." (dirty cloths, garbage bag) describe how the draft was split among authors. Refer to other tasks by ID only.
- Author response: Agreed and changed. Deleted the `stage_checkpoint_photographs` condition from the sofa and newspaper planning records; both already had "Stage photos ..." in `quality_checks` (the sofa entry is reworded to "Photos after the laptop, blanket, and pillow steps ..." since it is now compound). Replaced `mug_break_risk_declared` with `unbreakable_mug_surrogate` (a melamine or silicone mug the size of Mug_1) and `unbreakable_dishes_or_break_risk_declared` with `shatterproof_plate_and_cup` (melamine or polycarbonate). Removed the "part B" wording from the dirty-cloths and garbage-bag notes; other tasks are referred to by ID only. The `draft_notes` counts were updated to 9 atomic, 11 compound, 4 workflow, the stale "hamper stays a resource ... at merge" sentence was dropped from the part C draft note, and the merge note no longer says "part B's".

### task_thor_r2_potato_slice_pan_cook_burner_off
- Verdict: revise
- Granularity: should be compound
- Finding: Everything happens at one work zone (the cutting board beside the stove) in one sitting, and nothing is reset between stages. Checkpoints 1 and 3 are ordering and verification steps, and checkpoint 2 waits for a simulator flag. By the round-1 cast-iron precedent ("an ordering constraint, not a checkpointed stage") and by `task_thor_r1_pot_fill_water_back_burner` (compound), this is three net changes on one object plus a transient burner articulation. Relabel it `compound` and rewrite the note. The safety handling (simulation-only, guarded knife holder, knob pairing confirmed) is good.
- Author response: Agreed and changed. Relabelled `compound` (one work zone, one sitting, no reset; three net changes on the potato plus a transient burner articulation, as in `task_thor_r1_pot_fill_water_back_burner`). The note now calls the slice / load / burner-on / burner-off order an ordering constraint. The procedure's "Checkpoint 1/2/3" steps are now plain check, wait, and verify steps, the quality checks no longer refer to checkpoints, and the suitability claim says "task" instead of "workflow". The safety conditions are unchanged. Task ID unchanged.

### task_thor_r2_sofa_reset_pillows_blanket_laptop
- Verdict: revise
- Granularity: should be compound
- Finding: The coffee table, the right arm, and both sofa ends are all within reach of the sofa in one room, so they are not separate destinations in the rubric's sense. This is the same case as the round-1 pencil-case and string-lights relabels, and the eight-predicate teapot service was accepted as compound. The stage checkpoints are ordering (clear the laptop first), not gates. Relabel it `compound`. Also remove `stage_checkpoint_photographs` from its conditions (see the bundle-wide note). The pillow and blanket tolerances, and the physical-only disclosure for fold and drape, are good.
- Author response: Agreed and changed. Relabelled `compound`. The note now says all destinations are within reach of the sofa in one room and one sitting, and clearing the laptop first is an ordering constraint. The "Stage N" and "checkpoint" wording was removed from the procedure steps, `stage_checkpoint_photographs` was deleted from the conditions, the quality check was reworded, and the suitability claim says "task". Tolerances and the physical-only fold and drape disclosure are unchanged. Task ID unchanged.

### task_thor_r2_dirty_cloths_two_rooms_to_bedroom_hamper
- Verdict: revise
- Granularity: ok (workflow: three rooms, two pickups and a deposit)
- Finding: The note says "The hamper is a planning resource here; part B of this round declares thor_object_laundry_hamper_1_1 ..., which can be bound in its place at merge". That is a leftover merge note, and it contradicts the record: the binding, the goal state, and the object requirement already use `thor_object_laundry_hamper_1_1`. Delete the sentence. In the next sentence, replace "Part B's task_thor_r2_hamper_floor_clothes_lid_closed" with the task ID alone. The scope difference from that task and from `task_thor_r1_washing_machine_load_start` is well stated.
- Author response: Agreed and changed. Deleted the sentence "The hamper is a planning resource here; part B of this round declares ... at merge." and changed "Part B's task_thor_r2_hamper_floor_clothes_lid_closed" to the task ID alone. Bindings, goal state, and object requirement already use `thor_object_laundry_hamper_1_1` and are unchanged.

Accepted (no changes required):
- task_thor_r2_fridge_door_ajar_shut
- task_thor_r2_egg_crack_in_bowl
- task_thor_r2_coffee_machine_off_mug_stays (see the bundle-wide note on `mug_break_risk_declared`)
- task_thor_r2_lettuce_fridge_shelf_door_closed (same goal pattern as `task_ycb_round4_apple` and `task_gso_r2_butter_dish_cover_refrigerate`, but a different object and destination, so it is not a duplicate)
- task_thor_r2_kettle_fill_lid_shut_faucet_off
- task_thor_r2_apple_slice_into_bowl_knife_stowed
- task_thor_r2_dining_table_clear_to_sink_and_cabinet (workflow holds: sink and cabinet destinations 3 m apart; see the bundle-wide note on `unbreakable_dishes_or_break_risk_declared`)
- task_thor_r2_remote_cushions_into_basket
- task_thor_r2_cellphone_onto_charging_pad (the success criterion says the dummy indicator stands in for charging)
- task_thor_r2_houseplant_back_on_drip_saucer (a near-paraphrase of `task_gso_r3_square_pot_seat_in_saucer`; the cross-link is requested in the gso_round3 review, and adding it here as well would help). Author response: added. The note now names `task_gso_r3_square_pot_seat_in_saucer` and states the difference: a light pot with an artificial plant carried from a side table, with one `centred_in` goal, versus a heavy, top-heavy potted plant lifted off the mopped floor with `upright` preserved, which THOR can only push or teleport.
- task_thor_r2_box_pack_cd_cases_close_flaps (optional: bind `thor_resource_cd_case_b` and `_c` as well, since only case A is in `bindings`). Author response: not changed in this pass. The finding is optional, and the edit was limited to the revise findings.
- task_thor_r2_book_close_shelve_upright
- task_thor_r2_hamper_floor_clothes_lid_closed
- task_thor_r2_newspaper_bin_empty_to_kitchen_can (see the bundle-wide note on `stage_checkpoint_photographs`)
- task_thor_r2_bathroom_sink_faucet_drip_off
- task_thor_r2_bath_towel_hang_evenly_on_bar
- task_thor_r2_plunger_stow_in_holder_by_toilet
- task_thor_r2_toilet_paper_replace_spent_roll
- task_thor_r2_soap_bottle_refill_from_jug
- task_thor_r2_bathroom_close_left_open_items
- task_thor_r2_garbage_bag_collect_bins_to_front_door (see the bundle-wide note on "part B" wording)
