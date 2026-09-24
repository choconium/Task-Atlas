# Review: thor_round3

Summary: revise before activation. 20 accept, 3 revise, 1 reject, plus one bundle-wide revise on conditions and draft notes. The draft validates (`npm run check:draft`: 0 errors; 9 atomic, 9 compound, 6 workflow). Every task has a proposed suitability claim that cites only `evidence_thor_task_design_round3`, and the other three claims are unknown with no sources. Preserved predicates are called preserved end-state constraints and are not counted as changes. Uncertain THOR mappings appear as both planning conditions and task-specific limitations. The safety handling is good: the bath is capped at 42 °C by a mixing valve, the robot attends the fill, and nobody is in the tub; the sandwich is simulation-only; the knife is a blunt trainer; the hob and toaster are isolated with dummy indicators; the handover declares consent, speed, and release on grip. The main problem is density. This round adds three more switch-off sweeps next to `task_thor_r1_house_lights_off_before_leaving`, and its grocery task duplicates the parallel GSO draft.

### thor_round3 (bundle-wide: conditions and draft notes)
- Verdict: revise
- Granularity: ok
- Finding: (1) Three conditions are success thresholds, not setup states, and each repeats a success criterion: `watering_band_200_300_g_saucer_max_30_ml` (plants), `clean_threshold_2mm_under_uv` (sink), and `switch_panel_lit_threshold_50_lux` (night light). This is the same kind of problem as round 2's `stage_checkpoint_photographs`. Delete them, or reword them as operator-checkable setup, for example "lux meter placed at the toilet-front spot". (2) `draft_notes` is three part summaries joined together ("thor_round3 kitchen set ...", "... bathroom and multi-room tasks"), each with its own counts, asset-check paragraph, and evidence paragraph. They mention "the skeleton data/drafts/thor_round3.json", which is drafting history. They also contradict each other on concepts: part A says "Concepts: all reused", while part C proposes `object_toiletry`, which no active object uses. Merge the notes into one. Either reuse an existing concept for Soap_Bar_1 or state once that `object_toiletry` is new.
- Author response: Applied. (1) Deleted the three threshold conditions `watering_band_200_300_g_saucer_max_30_ml`, `clean_threshold_2mm_under_uv`, and `switch_panel_lit_threshold_50_lux`; each threshold already appears in that task's success_criteria (200-300 g and 30 mL, 2 mm under 365 nm UV, 50 lux), and the lux-meter placement is already a setup step. (2) Replaced `draft_notes` with one set of 13 notes: counts stated once (23 tasks: 9 atomic, 9 compound, 5 workflow), one asset-check paragraph, one evidence paragraph, no "skeleton" or part history, and the review outcome recorded. Concepts are stated once: every object reuses an existing concept except Soap_Bar_1, which keeps `object_toiletry` and is declared as the one new concept (a soap bar is neither a container nor a tool).

### task_thor_r3_groceries_sort_fridge_or_pantry
- Verdict: reject
- Granularity: ok (workflow)
- Finding: This duplicates `task_gso_r4_fondant_groceries_by_temperature_zone` in the parallel draft: a grocery bag is sorted into cold storage and a pantry, and the bag ends empty. The GSO version is the stronger one (a freezer zone, timed per-zone checkpoints, and an anchor whose label must be read). This version adds only the carry from the front door, and nearly all its items are resources with no THOR type (`thor_has_no_grocery_item_or_shopping_bag_types`). There is also an identity error. The goal calls `ycb_002_master_chef_can` "canned soup", but YCB 002 is the Master Chef coffee can; the YCB soup can is `ycb_005_tomato_soup_can`, which the GSO task already uses. If a THOR grocery task is wanted, give it a goal the GSO task does not have, for example a fridge restock against a par list where Fridge_7's single isOpen flag is the point.
- Author response: Accepted. Removed the task, `planning_thor_r3_groceries_sort_fridge_or_pantry`, its four claims, `thor_object_fridge_7` (used by no other task) with `claim_thor_object_fridge_7_catalog_identity`, and `template_thor_r3a_sort_groceries_fridge_or_pantry`. The mistaken `ycb_002_master_chef_can` "canned soup" binding went with it. A grep of the draft finds no remaining reference to any removed ID; the only mention is the review-outcome note in `draft_notes`. A THOR fridge par-list restock is left for a later round.

### task_thor_r3_morning_alarm_off_lamp_off_blinds_up
- Verdict: revise
- Granularity: ok (compound)
- Finding: `thor_blinds_raised_pose_is_0_20_m_default_box` states as fact a mapping that the note calls "probably" and "unresolved". It also differs from the thor_round1 condition for the same asset, `thor_blinds_isopen_pose_confirmed_in_simulator`. Reuse the round-1 condition so that both blind tasks gate on the same check, and keep the bounding-box reasoning in the limitation. The alarm LED re-light test for snooze and the battery-only power policy are good.
- Author response: Applied. The planning condition is now round 1's `thor_blinds_isopen_pose_confirmed_in_simulator`, so both blind tasks gate on the same check. The task notes no longer state the inversion; they say the raised pose has no confirmed THOR value and name the shared condition. The bounding-box reasoning (0.20 m default box vs 1.47 m 'open' box) is kept in the asset_compatibility limitation and worded as unconfirmed.

### task_thor_r3_office_desk_power_down_evening
- Verdict: revise
- Granularity: ok (compound)
- Finding: `thor_object_desk_lamp_1` is already switched off in `task_thor_r1_desk_lamp_switch_off`, `task_thor_r1_house_lights_off_before_leaving`, and `task_thor_r1_desk_clear_for_night`, and in `task_gso_r4_laptop_video_call_corner_stand_cable_lamp_off` in the parallel draft. A fifth lamp-off adds nothing, and the "desk for the evening" framing is close to `task_thor_r1_desk_clear_for_night`. Drop the lamp, or replace it with a device no other task covers such as a monitor or a printer, and keep the new goals: the desktop off and the phone off and face down. The name also says "phone off", but the THOR mapping (CellPhone isToggled) is screen-off only. Either name the physical goal as powered off and say that THOR checks only the screen, or reduce the goal to screen off.
- Author response: Applied. Dropped `thor_object_desk_lamp_1` from bindings, states, planning, procedure, success criteria, reset, failure modes, template, and claims, with a note naming the three thor_round1 tasks that already switch it off. The phone goal is now `screen_off(thor_resource_desk_phone)` (initial `screen_lit`), which matches THOR's CellPhone isToggled screen flag. The name now says "the phone's screen off with the phone face down", and the dummy condition is now a single short side-button press (`phone_dummy_side_button_press_turns_screen_led_off`). The task stays compound: desktop off, phone screen off, phone face down.

### task_thor_r3_leave_house_check_doors_taps_light
- Verdict: revise
- Granularity: ok (workflow: three rooms)
- Finding: This is the third "before leaving" sweep, after `task_thor_r1_house_lights_off_before_leaving` and this round's `task_thor_r3_kitchen_burners_faucet_toaster_off_before_leaving`, and its kitchen tap overlaps that task's faucet-off. Neither round-3 note links to the other. Replace the kitchen tap with an item that no sweep covers (for example a window latched shut, or the balcony door), or fold the kitchen sweep in as this task's kitchen stage and drop the separate task. Cross-link the remaining sweeps and state what differs. The bounded scope (the front door is excluded), the rule that the bathroom light goes off last, and the pinch-zone condition are good.
- Author response: Applied. Dropped the kitchen tap (`thor_object_kitchen_faucet_1`). The list is now the bathroom tap, the bathroom light (switched off last), and the living-room patio double door latched, across two rooms with a checkpoint each and a final report. The task stays workflow. The notes cross-link `task_thor_r1_house_lights_off_before_leaving` (lights only), `task_thor_r2_bathroom_close_left_open_items` (bathroom openables only), and `task_thor_r3_kitchen_burners_faucet_toaster_off_before_leaving` (kitchen heat and water), and say what each covers. The kitchen sweep's notes now link back. The task ID is unchanged; the name, template, planning, and suitability claim were updated.

Accepted (no changes required):
- task_thor_r3_pan_wipe_clean_with_cloth (the cloth-contact limitation is honest)
- task_thor_r3_microwave_stop_empty_run
- task_thor_r3_knife_out_of_sink_edge_to_wall (blunt trainer, and nobody within 1 m)
- task_thor_r3_kitchen_burners_faucet_toaster_off_before_leaving (the whole-stove check is a real safety goal; see the leave-house finding for the cross-link)
- task_thor_r3_bread_lettuce_sandwich_on_plate (simulation-only knife steps)
- task_thor_r3_toaster_off_slice_onto_plate
- task_thor_r3_plate_bowl_cup_rinse_load_cabinet_rack (the workflow holds: table to sink 3 m, and a rinse reset gate. Optional: cross-link `task_gso_r4_dish_drainer_load_plates_cups_cutlery`, which is requested in the gso_round4 review)
- task_thor_r3_watch_under_sofa_into_trinket_dish
- task_thor_r3_statue_toppled_stand_upright_on_shelf
- task_thor_r3_wall_painting_straighten_level (the physical-only goal is disclosed)
- task_thor_r3_guest_bed_pillows_towel_lamp
- task_thor_r3_books_three_rooms_back_to_cube_shelf
- task_thor_r3_water_three_plants_one_fill_route (see the bundle-wide note on `watering_band_200_300_g_saucer_max_30_ml`; the watered definition fixes the round-1 saucer problem)
- task_thor_r3_bathroom_sink_wipe_toothpaste_spatter (see the bundle-wide note on `clean_threshold_2mm_under_uv`)
- task_thor_r3_bathroom_light_switch_on_for_night_visit (see the bundle-wide note on `switch_panel_lit_threshold_50_lux`)
- task_thor_r3_clothes_dryer_start_latched_load
- task_thor_r3_bathtub_fill_to_band_towel_ready (42 °C mixing-valve cap, robot attends the fill, nobody in or over the tub, non-slip mat. Optional: add to reset that the tub is drained before the room is left, so nobody finds a filled tub unattended)
- task_thor_r3_laundry_hamper_carry_bedroom_to_washer
- task_thor_r3_tissue_box_fetch_to_person_on_sofa (consent, 0.25 m/s cap, release on grip; the bin is set down before the handover)
- task_thor_r3_restock_vanity_cabinet_from_hall_closet (the workflow holds: count, then pick from another room, then put away)
