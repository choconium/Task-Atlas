# Review: context_round2 (by Codex, Lane A)

Reviewed the 24-task draft against the active atlas, the coordination rubric,
and its collection plans on 2026-10-04. `npm run check:draft --
data/drafts/context_round2.json` passes (9 atomic, 9 compound, 6 workflow).
`report:similar` found only generic lexical pairs for the badge/key return
actions and existing checkout tasks; their objects, destinations, and purposes
are distinct. The task/template validator passes with the binding-level goal
specialization used by this schema.

**Verdict: revise 2, accept 22, reject 0.** The two revisions are blockers for
activation: one formal goal omits a required result, and the live handover
needs a break-safe mug condition.

### task_ctx_r2_minibar_tick_charge_slip_then_restock_to_par
- Verdict: revise
- Granularity: ok
- Finding: The success criteria require that the other four charge-slip boxes remain blank, and an extra tick is a failure, but neither that preserved state nor its individual predicates is represented in the formal goal/template. Add the four `unticked(...)` predicates to the task and template goals, or describe those boxes only as an initial-state preservation check and remove the “exactly” result from the required outcome. The selected version must be reflected consistently in the collection criteria.
- Author response: (filled by the author)

### task_ctx_r2_mug_drink_handover_to_seat_2_customer
- Verdict: revise
- Granularity: ok
- Finding: The plan serves an open 200 ml drink in a porcelain GSO mug directly to a participant, but its conditions cover temperature and spills only. Add a break-safe physical stand-in (for example a polycarbonate mug of the scanned mug’s dimensions/handle geometry) or a positive control for the porcelain vessel and dropped-mug response; record it in the requirements and collection checks. The source scan can remain the object identity while the physical trial uses the declared surrogate.
- Author response: (filled by the author)

### Accepted IDs

- `task_ctx_r2_bath_towel_fold_display_trifold_on_bed_foot`
- `task_ctx_r2_toilet_roll_end_point_fold_for_next_guest`
- `task_ctx_r2_desk_bin_liner_lift_into_cart_trash_bag`
- `task_ctx_r2_amenities_tray_restock_to_standard_card`
- `task_ctx_r2_turndown_blinds_lamp_duvet_corner_slippers`
- `task_ctx_r2_bed_strip_linen_to_cart_remake_hotel_standard`
- `task_ctx_r2_forgotten_watch_bag_tag_to_lost_and_found`
- `task_ctx_r2_marker_worksheet_one_per_seated_desk_from_card`
- `task_ctx_r2_scissors_collect_count_into_class_caddy`
- `task_ctx_r2_book_face_out_on_reading_corner_ledge_slot`
- `task_ctx_r2_timer_balls_ruler_science_demo_tray_from_list`
- `task_ctx_r2_banana_takeaway_order_bag_to_pickup_slot`
- `task_ctx_r2_mustard_cap_down_in_condiment_station_well`
- `task_ctx_r2_square_plate_bus_table_to_dish_return_station`
- `task_ctx_r2_blank_card_visitor_badge_post_into_return_box`
- `task_ctx_r2_cyan_ink_pack_stock_printer_supply_bay`
- `task_ctx_r2_ringed_keys_pool_car_cabinet_pocket_by_tag`
- `task_ctx_r2_travelmate_laptop_hot_desk_clean_desk_locker`
- `task_ctx_r2_large_marker_meeting_table_set_from_booking_card`
- `task_ctx_r2_kingston_usb_loan_kit_repack_return_case`
- `task_ctx_r2_seagate_drive_internal_mail_round_three_drops`
- `task_ctx_r2_thor_box_archive_2025_folders_by_quarter`
