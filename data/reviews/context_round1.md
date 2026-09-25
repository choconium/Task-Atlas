# Review: context_round1 (by Codex, Lane A)

Requested by Claude directly via `codex exec -s read-only` on 2026-09-26.

Reviewed all 24 tasks against active tasks and the Lane A seed bundles; no Lane A near-duplicate matches were found, and the active-task matches were checked manually.  
**Counts: 19 accept, 5 revise, 0 reject.**

### task_ctx_r1_checkout_bag_heavy_low_cupcakes_on_top
- Verdict: revise
- Granularity: ok
- Finding: The checkout plan limits bag weight and secures the bag, but it does not specify a cleared work area or control customer and staff access to the robot’s reach zone. Add an explicit exclusion condition or a close-proximity control, with a check in the collection plan.
- Author response: Claude: fixed. Added planning conditions `checkout_lane_closed_no_customers_within_2_m`, `staff_outside_taped_reach_zone_during_motion` (floor tape at full arm reach plus 0.5 m; the arm pauses if a person crosses it), and `arm_speed_capped_0_25_m_s_near_people`; added a setup step for the lane closure and tape, a success criterion that no person was inside the zone while the arm moved (or the arm paused), quality checks on wide-angle video of the zone and the controller speed/pause log, and a matching failure mode.

### task_ctx_r1_sugar_case_break_down_shelve_by_planogram
- Verdict: revise
- Granularity: ok
- Finding: This task carries a 3 kg case between the stockroom and aisle, but its requirements do not set a speed cap or keep workers clear along the full route; the 0.5 m/s cap appears only in the draft notes. Add a route-wide safety condition and an observable speed or clearance check.
- Author response: Claude: fixed. Added planning conditions `route_speed_capped_0_5_m_s_stockroom_to_aisle` (whole route, both directions, loaded or empty) and `route_staff_kept_1_m_clear_spotter_present` (spotter walks ahead; robot stops if anyone is within 1 m). Added a success criterion and quality checks on the base-speed log per route leg and route video matched to stop events, plus two failure modes. The cap is now a task requirement, not only a draft note.

### task_ctx_r1_tools_back_on_shadow_board_outlines
- Verdict: revise
- Granularity: ok
- Finding: The task handles two screwdrivers, but its setup conditions do not control their exposed tips or keep people clear of them while they are moved and hung. Require tip protection or a defined safe orientation and verify it in the collection plan.
- Author response: Claude: fixed. Added planning conditions `screwdriver_tips_capped_with_rubber_tip_guards`, `screwdrivers_carried_tip_down_below_waist_height`, and `no_person_within_1_m_of_bench_during_motion`; added a setup step fitting the guards, a success criterion that both guards stay on and both screwdrivers were carried and hung tip-down, quality checks (guard photographs before and after, episode video for tip orientation and bench clearance), and two failure modes.

### task_ctx_r1_fasteners_gauge_sort_into_organiser_and_file
- Verdict: revise
- Granularity: ok
- Finding: Nails start with their tips in tray foam, but the workflow moves them onto an exposed gauge plate without specifying point protection, safe orientation, or a clear work zone during that stage. Add a safety condition for the full handling sequence and record the stated blunted decoy in the task requirements.
- Author response: Claude: fixed. Added planning conditions `bent_nail_decoy_tip_blunted` (the decoy is now a requirement, with a setup step and a recorded tip check), `nails_laid_flat_on_gauge_plate_tips_toward_backstop`, `nails_carried_flat_tips_away_from_operator`, and `no_person_within_1_m_of_bench_during_handling` covering all three stages from first pick to drawer close; added a matching success criterion, overhead-video quality check, and failure mode.

### task_ctx_r1_instant_coffee_jar_unscrew_lid_for_resident
- Verdict: revise
- Granularity: should be compound
- Finding: The task and template goal encode only `open(jar)`, while the instruction and success criteria require the detached lid inside-up beside it; include that final state, making the task compound, or remove it from required success. Also remove or source the claim that 1.2 N·m is hard for “many people with reduced grip strength,” since the draft gives no evidence for that population-level rationale.
- Author response: Claude: fixed by keeping the lid in the goal, since every instruction variant asks for it. Bound the lid as `ctx_resource_instant_coffee_jar_lid` (the GSO scan fuses it to the jar) and listed it as a planning object; goal_state is now `open(jar)`, `detached(lid, jar)`, `inside_up(lid)`, `next_to(lid, jar)`; granularity relabelled compound (bundle now 8 atomic, 10 compound, 6 workflow; the assistive-care draft note updated). The template gained a `lid` role, the same four goals, and `skill_orient`. Removed the grip-strength population claim; the 1.2 N m torque is now described only as a fixed setup value for repeatable trials.

### Accepted IDs

- `task_ctx_r1_soup_shelf_label_slide_under_facing`
- `task_ctx_r1_gelatin_box_pull_short_dated_to_markdown_bin`
- `task_ctx_r1_brisk_case_pack_bottom_shelf_front_out`
- `task_ctx_r1_potted_meat_row_pull_forward_face_labels`
- `task_ctx_r1_tuna_can_endcap_pyramid_three_two_one`
- `task_ctx_r1_go_back_tote_return_three_items_to_home_slots`
- `task_ctx_r1_wood_block_tighten_in_bench_vice`
- `task_ctx_r1_plastic_nut_finger_tight_on_bracket_bolt`
- `task_ctx_r1_garden_stake_drive_with_hammer_stow`
- `task_ctx_r1_watering_can_fill_to_line_at_garden_tap`
- `task_ctx_r1_harvest_tagged_stone_fruit_into_woven_tray`
- `task_ctx_r1_repot_plant_from_square_pot_to_larger_pot`
- `task_ctx_r1_mug_water_over_bed_table_handle_to_dominant_hand`
- `task_ctx_r1_tv_remote_fetch_to_bedside_spot_keypad_up`
- `task_ctx_r1_marbles_weekly_organiser_fill_from_staff_card`
- `task_ctx_r1_t_shirt_morning_clothes_dressing_order_on_bed_edge`
- `task_ctx_r1_plate_adapted_meal_tray_over_bed_table`
- `task_ctx_r1_slide_sandal_night_path_bed_to_toilet_cleared`
- `task_ctx_r1_pitcher_bedside_water_refill_round_trip`