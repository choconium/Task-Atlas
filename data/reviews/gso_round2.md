# Review: gso_round2

Summary: ready after small revisions. 16 accept, 8 revise, 0 reject. The draft validates against the active seeds (`npm run check:draft`: 0 errors; 12 atomic, 10 compound, 2 workflow). Claims follow the contract, and no task duplicates an active task. The atomic labels hold up: most atomic tasks are one placement or closure with pose qualifiers, which is acceptable. The exception is the drying mat, which stacks a shape change on top of a relocation. The recurring problem is "declared tolerance" in success criteria with no value given.
Not checked: Lane A's `reference_gso_round1` is not in this worktree. The draft note says the curl-cream model was swapped for this reason; re-run the case-insensitive model-name check from the main checkout before activation.

### task_gso_r2_square_plates_stack_with_protectors
- Verdict: revise
- Granularity: ok (compound)
- Finding: The anchor `gso_object_square_dinner_plate` appears in no initial or goal predicate. It is only folded into `gso_resource_square_dinner_plate_set_of_four`, so the scanned object does not take part in the task graph. Name it explicitly, for example `stacked_on(gso_object_square_dinner_plate, gso_resource_dish_cabinet_shelf)` as the bottom plate, with a resource for the three matching plates. "Corners aligned within the declared tolerance" needs a value (for example "within 5 mm").
- Author response: Changed. The scanned plate is now its own participant: `stacked_on(gso_object_square_dinner_plate, gso_resource_dish_cabinet_shelf)` as the bottom plate, and a new resource `gso_resource_matching_square_dinner_plates_three` (it replaces `..._set_of_four`) is `stacked_on` the scanned plate. The protector, alignment, and accounting goals name both, and the initial state places and dries both in the drainer. The template roles and goals were updated to match. The success criterion now reads "each corner within 5 mm of the bottom plate" on the front and side photographs, which are taken against a millimetre scale.
### task_gso_r2_ramekins_portion_on_porcelain_tray
- Verdict: revise
- Granularity: ok (compound)
- Finding: "Spilled beyond the declared tolerance" has no value. State it, for example "no more than 2 g outside the ramekins, by weighing the tray before and after". Also state the order that `in_a_row` expects (rice, lentil, sugar, left to right). Tray fit is correctly left as an unverified condition. The round-1 tray-carry task depends on the same fit question, so record the tray's measured interior once and reuse it in both tasks.
- Author response: Changed. The spill criterion is now "no more than 2 g outside the ramekins, by weighing the tray and a counter spill sheet before and after", with matching setup and quality-check steps. The success criterion and task note state the row order: rice, lentil, sugar, left to right from the counter front. The tray fit stays unverified. Its condition and a new setup step say the tray interior is measured once in mm and recorded in the trial log for reuse by `task_gso_r1_tray_carry_mugs_sugar_bowl`. The round-1 task itself is not edited here, because gso_round1 is being fixed separately.
### task_gso_r2_pet_water_bowl_refresh
- Verdict: revise
- Granularity: ok (workflow: sink and feeding-area destinations)
- Finding: `dry(gso_resource_pet_feeding_mat)` has no operational test. Define one, for example "no visible droplets, and a dry paper towel pressed for 3 s shows no wet mark". The fill-line tolerance also needs a value (for example ±5 mm). The task carries water across the kitchen floor, but unlike the THOR water tasks it does not declare a robot splash-protection condition; add `robot_electronics_splash_protected`. The name says "empty", but emptiness is not a goal predicate; that is fine, since `rinsed` and `filled_to` imply it, but say so in the note.
- Author response: Changed. The mat dryness test now appears in the success criterion, the quality check, and the task note: "no visible droplets, and a dry paper towel pressed for 3 s shows no wet mark". Paper towels were added as a consumable. The fill tolerance is now "within 5 mm above or below the fill line" on the side photo. Added the condition `robot_electronics_splash_protected`. The note now says emptying is implied by `rinsed` and `filled_to`.
### task_gso_r2_slide_sandal_on_bath_mat
- Verdict: revise
- Granularity: ok (atomic; heading is a pose qualifier, `stable` is a consequence)
- Finding: The task note and draft notes say it reuses `template_ycb_transport_orient_object`, but `template_id` is the new `template_gso_transport_orient_item`. Either point the task at the existing YCB template, as the note intends and as the rubric's "reuse existing templates" goal favours, or correct both notes and justify the new template.
- Author response: Changed (notes corrected; template kept). The task note and draft note now say the task uses `template_gso_transport_orient_item`, and they give the reason. That template copies the roles, preconditions, and goals of `template_ycb_transport_orient_object`. The YCB template is not used because its `compatible_scenes` list only YCB scenes, and it sits in Lane A's active seed. The GSO template declares the bathroom and entryway. The two can be merged in a later consolidation. While in the section, the heading arc also got a value (±15°).
### task_gso_r2_drying_mat_lay_flat_by_sink
- Verdict: revise
- Granularity: should be compound, or change the start state
- Finding: This stacks two independent changes: a shape change (rolled to flat, with deformable unrolling) and a relocation into the sink-side zone with an alignment. Either start the mat flat (or folded once) away from the zone, which makes it a single placement with a parallel pose qualifier, or relabel it `compound`. Round-2 part B already has three other atomic tasks, so the quota does not depend on this one.
- Author response: Changed: kept atomic, start state simplified. The mat now starts flat on the counter at least 30 cm from the zone (`lying_flat_on(..., gso_resource_kitchen_counter)`, `outside(..., zone)`). `rolled()` is removed, so only the move into the zone and the parallel qualifier remain. I updated the template precondition (`rolled_or_folded` became `lying_flat`, `outside`), the procedure, the setup, the reset, the task note, and the draft note. The alignment tolerance now has a value: at most 5° to the counter edge.
### task_gso_r2_rubber_gloves_hang_to_drain
- Verdict: revise
- Granularity: ok (compound)
- Finding: The gloves start wet at the sink and are hung above the basin, but no robot splash or water-protection condition is declared. Add `robot_electronics_splash_protected`, matching the THOR water tasks. The object note should also say whether the GSO scan shows loose gloves or a pair on a retail header card; the candidate list does not settle this.
- Author response: Changed. Added the condition `robot_electronics_splash_protected`. I checked the Gazebo Fuel thumbnails for `Clorox_Premium_Choice_Gloves_SM_1_pair`: they show two loose gloves lying flat side by side, with no header card or packaging, scanned together as one rigid mesh. The object note now says so.
### task_gso_r2_crayons_refill_box_into_fabric_cube
- Verdict: revise
- Granularity: ok (compound; the 24 insertions repeat one skill loop)
- Finding: The success criterion requires "tips up", but no goal predicate states it. Either add `all_tips_up(gso_resource_24_loose_crayons)` to the goal or drop it from the criterion. "Tucked flap" on a paperboard box is deformable handling, which is already declared.
- Author response: Changed. Added `all_tips_up(gso_resource_24_loose_crayons)` to the goal state and `all_tips_up(contents)` to `template_gso_refill_box_and_bin`. The note now counts four goal predicates.
### task_gso_r2_headset_coil_tie_hang
- Verdict: revise
- Granularity: ok (compound)
- Finding: `cool(gso_object_headset_kraken_pro)` in the initial state is a meaningless predicate that is only there to satisfy the shared template's precondition. Drop it and make `cool(theme)` a heat-source-only precondition, or add a note on the template. The note says the template's `compatible_scenes` must gain `scene_home_office_desk` when round 1 activates; round 1 is active and already lists it, so delete that stale sentence. This task and `task_gso_r1_hair_dryer_hang_on_hook` are template twins on different objects. That is acceptable, not a duplicate.
- Author response: Changed in part. `cool(gso_object_headset_kraken_pro)` is removed from the initial state, and `state_room_temperature` from `state_ids`. The stale sentence about `compatible_scenes` is deleted from the task note and the draft note, and the task note records the template-twin relation to the hair-dryer task. Not changed here: making `cool(theme)` a heat-source-only precondition. That is an edit to `template_gso_hang_corded_appliance` in the active gso_round1 seed, which is outside this bundle. The task note flags it for the gso_round1 fix.
Accepted (no changes required):
- task_gso_r2_frypan_hang_on_pot_rack_hook
- task_gso_r2_mug_hang_on_cup_hook
- task_gso_r2_instant_coffee_jar_screw_lid
- task_gso_r2_can_opener_stow_in_drawer_slot
- task_gso_r2_butter_dish_cover_refrigerate
- task_gso_r2_hand_towel_hang_on_ring
- task_gso_r2_conditioner_stand_in_organizer
- task_gso_r2_boat_shoe_wipe_tree_rack
- task_gso_r2_cleanser_unbox_order_on_tray
- task_gso_r2_kitchen_towels_swap_for_fresh_pack
- task_gso_r2_monopoly_box_seat_lid (same goal pattern as active `task_ycb_069_box_lid`, but a different object and box type, so not a duplicate)
- task_gso_r2_handheld_console_close_hinge
- task_gso_r2_lunch_box_latch_lid
- task_gso_r2_gaffer_tape_hang_on_rod
- task_gso_r2_drawer_organizer_sort_and_close
- task_gso_r2_fabric_cube_collapse_stand_by_bookend
