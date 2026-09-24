# Review: gso_round3

Summary: revise before activation. 21 accept, 3 revise, 0 reject, plus one bundle-wide revise that touches the asset_compatibility text of the eight part-A tasks. The draft validates (`npm run check:draft`: 0 errors; 9 atomic, 9 compound, 6 workflow). Claims follow the contract: every task has a proposed suitability claim citing only `evidence_gso_task_design_round3`, and population frequency, robot execution, and asset compatibility are unknown with no sources. No task duplicates an active task. None of the 24 GSO model names collides with Lane A's `reference_gso_round1` (read-only case-insensitive check against the main checkout). Heat, blade, chemical, lithium-battery, water, and fragile items all declare setup conditions. The one human-interaction task (bootie handover) declares consent, a speed limit near the person, and release only on a detected grip. The round-1 and round-2 problems (tolerances with no value, anchors missing from their own goals, a bare "clean" or "dry" with no test) do not recur.

### gso_round3 (bundle-wide: part-A asset_compatibility limitations)
- Verdict: revise
- Granularity: ok
- Finding: The eight part-A tasks (bundt pan through drying rack) all carry the same boilerplate limitation, "A rigid GSO scan cannot by itself represent the articulated, deformable, or material interactions this task needs". Parts B and C instead name the actual gap for each task. The boilerplate hides the most important asset-honesty point: the fruit-snacks, parchment, and cupcakes scans are closed retail cartons, but each task starts with `open(...)` and relies on flaps and contents the mesh does not have, and the sprinkles cap cover is fused in the scan. The object notes say this, but the claim that an assessment or collection card shows does not. Write a task-specific limitation for each of the eight, for example "the scan is the closed carton; the open start state, the flap, and the pouches are not represented" (fruit snacks), and "the scan has no water, mass, or drip behaviour" (bundt pan, drying rack).
- Author response: Changed. Each of the eight part-A asset_compatibility claims now names its own gap in `limitations`: the fruit-snacks, parchment, and cupcake scans are closed retail cartons with no open start state, flaps, or contents (pouches, sheet, sealed packs); the sprinkles scan has its cap cover fused closed; the bundt pan and drying-rack scans have no water, mass, or drip behaviour; the casserole scan has no mass or contents; the herring tin has no legible date and no contents. Status stays `unknown` with no sources. The draft notes no longer describe how the bundle was drafted and merged.
### task_gso_r3_cupcakes_pack_two_lunch_boxes_shelve_carton
- Verdict: revise
- Granularity: should be compound
- Finding: Both lunch boxes and the open carton sit in one packing zone, so the two lunch boxes are one location, not two destinations (the same reasoning as the round-1 pencil-case review). The pre-closure checkpoint is an ordering constraint: the lids are not sealed, so a reviewer can reopen them and check again, unlike the sealed shipping box in `task_gso_r3_portable_drive_pack_shipping_box`. That leaves one carry to the pantry shelf, which is a compound task with six predicates in one sitting. Relabel it `compound` and rewrite the note. If it stays `workflow`, add a real stage boundary, such as boxes carried to separate destinations like a school bag and the fridge.
- Author response: Changed; I agree. Granularity is now `compound` and the note says why: one packing zone, one carry to the shelf, and a pre-closure check that is an ordering constraint because the lids can be reopened. The suitability statement, procedure label, checkpoint step, and success-criterion wording no longer say workflow or checkpoint. Task ID unchanged; the draft now counts 9 atomic, 10 compound, 5 workflow.
### task_gso_r3_dish_towel_fold_to_drawer_template
- Verdict: revise
- Granularity: should be compound, or change the start state
- Finding: This repeats the round-2 drying-mat problem. The towel starts `outside(..., template)` and must end inside the outline after a three-fold sequence (thirds, thirds, half) that includes a lift, so the task stacks a shape change on a relocation. Putting both inside one `folded_to_template` predicate does not make it one change. Either start the unfolded towel with its centre over the outline, so the folds land in place and the outline checks only the footprint, or relabel it `compound` with `folded(...)` and `inside(..., template)` as separate goal predicates.
- Author response: Changed by moving the start state; the task stays `atomic`. The towel now starts `half_over(towel, template)`: unfolded, with its near half covering the outline (long centre line on the outline's long axis, mid-length line on one short edge). The thirds folds happen over the outline and the final fold lays the far half back onto it, so nothing is relocated and the outline checks only the folded footprint. The template precondition, setup, reset, procedure steps, instructions, and note are updated to match.
### task_gso_r3_square_pot_seat_in_saucer
- Verdict: revise
- Granularity: ok (atomic)
- Finding: The goal is a near-paraphrase of `task_thor_r2_houseplant_back_on_drip_saucer` in the parallel THOR draft: a pot set centred on its drip saucer, with centring and levelness tolerances. Neither note mentions the other. Keeping both is fine, since they use different objects and differ in load and start place (an empty pot with a faux plant carried from a side table, versus a 4 kg live plant lifted from the floor). Add a cross-link that states this difference, in the same way the headset and hair-dryer template twins are cross-linked. Also, `gso_resource_artificial_plant_in_dry_foam` is a required object but appears in no state predicate. Add `inside(gso_resource_artificial_plant_in_dry_foam, gso_object_ecoforms_quadra_square_pot)` to the initial state so the payload behind `potted_mass_within_payload_confirmed` is part of the task graph.
- Author response: Changed. The note now cross-links `task_thor_r2_houseplant_back_on_drip_saucer` as a twin with the same centred-on-saucer goal, and states the difference: that task lifts a live plant of up to 4 kg in a plastic pot off the mopped floor, while this one carries a light GSO pot holding a faux plant from a side table to a windowsill. `inside(gso_resource_artificial_plant_in_dry_foam, gso_object_ecoforms_quadra_square_pot)` is added to the initial state (with a `filler` binding and template role and precondition), so the load behind `potted_mass_within_payload_confirmed` is in the task graph. A success criterion now checks that the faux plant is still seated. The task stays atomic with one goal predicate.
Accepted (no changes required):
- task_gso_r3_bundt_pan_invert_drain_on_rack (see the bundle-wide limitation note)
- task_gso_r3_casserole_dish_set_on_table_trivet (see the bundle-wide limitation note)
- task_gso_r3_fruit_snacks_box_stand_in_kids_snack_bin (see the bundle-wide limitation note)
- task_gso_r3_herring_tin_rotate_behind_older_tuna_can (see the bundle-wide limitation note; the cross-link to `ycb_007_tuna_fish_can` is good)
- task_gso_r3_parchment_sheet_line_pan_return_box (see the bundle-wide limitation note)
- task_gso_r3_sprinkles_close_cap_return_to_caddy_slot (see the bundle-wide limitation note)
- task_gso_r3_drying_rack_unload_bowl_plate_spoons (workflow holds: three separate stores; see the bundle-wide limitation note)
- task_gso_r3_bath_towel_sort_laundry_by_colour
- task_gso_r3_washcloth_restock_travel_toiletry_kit
- task_gso_r3_jogger_pair_shoe_bag_suitcase
- task_gso_r3_scrap_collector_hook_and_sweep
- task_gso_r3_hair_straightener_cool_clip_drawer
- task_gso_r3_bootie_handover_seated_person (consent, speed, and release-on-grip conditions are declared)
- task_gso_r3_hair_colour_box_store_above_child_reach
- task_gso_r3_jenga_build_start_tower (the anchor is a one-mesh built tower that stands for the product and the target shape; this is disclosed in the note and in the limitation)
- task_gso_r3_shape_clock_hands_to_twelve
- task_gso_r3_alarm_clock_set_six_thirty
- task_gso_r3_file_sorter_folders_tab_order (optional: put `tabs_up_and_visible` on each folder instead of on the sorter)
- task_gso_r3_speaker_charging_station_cable_tidy
- task_gso_r3_storage_bins_sort_label_shelve
- task_gso_r3_portable_drive_pack_shipping_box (workflow holds: the tilt checkpoint cannot be repeated once the box is sealed, and the box then moves to the outgoing tray)
