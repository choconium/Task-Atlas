# Review: gso_round1

Summary: revise in place (the bundle is already active with review pending). 18 accept, 6 revise, 0 reject. Claims are clean: every task has proposed suitability citing only the design seed, and frequency, execution, and asset compatibility are unknown with no sources. Safety setup conditions are declared for the heat, cord, ink, choking-part, and fragile-porcelain items. No task duplicates an active task. Three tasks labelled `workflow` are really `compound`, and two anchor objects do not take part in their own goal.
Not checked: Lane A's `reference_gso_round1` is not in this worktree, so the shared-GSO model-name check against it still needs to be run from the main checkout.

### task_gso_r1_cast_iron_pan_dry_oil_shelve
- Verdict: revise
- Granularity: should be compound
- Finding: One object, three net changes (dry, film applied, on the liner), one sitting, and the destination shelf is next to the work zone. "Dry before coating" is an ordering constraint, not a checkpointed stage or a second destination. Relabel it `compound` and rewrite the note. Consider `intent_store` or keep `intent_clean`, but say which goal predicate the intent refers to. `on_top_of(liner, shelf)` is unchanged from the start state; mark it in the note as preserved.
- Author response: Changed: relabelled `compound` and rewrote the note. Kept `intent_clean` and said it refers to the `dry` and `film_applied` goal predicates, marked `on_top_of(liner, shelf)` as a preserved condition, and updated the suitability claim wording.
### task_gso_r1_dust_pan_sweep_crumbs
- Verdict: revise
- Granularity: ok (compound)
- Finding: The success criterion says "count at or below the stated tolerance", but no tolerance is stated anywhere. Put a number in setup (for example "at most 3 surrogate pieces left in the patch") so a reviewer can apply the check. Setup says the bin is "lined", but the initial state and conditions do not mention a liner; either add it or drop the word.
- Author response: Changed: setup now spreads 40 counted surrogate pieces in a 30 cm square, and success allows at most 3 pieces left in the patch and at most 2 on the floor outside the patch and bin. Added the liner as `gso_resource_trash_bin_liner` with an `inside(liner, bin)` initial predicate and a `trash_bin_lined_with_fresh_liner` condition.
### task_gso_r1_connect4_release_sort_box
- Verdict: revise
- Granularity: ok (workflow: grid-empty and sorted-count checkpoints with separate intermediate destinations)
- Finding: The anchor object `gso_object_connect4_launchers` does not appear in the initial or goal state. Every predicate uses `gso_resource_*` parts, including a separate `gso_resource_connect4_launchers` that shadows the anchor's name. Check whether the GSO mesh shows the retail box or the assembled game (the object note says this is unverified), then bind the anchor to that part. For example, if it is the box, use `inside(gso_resource_connect4_grid, gso_object_connect4_launchers)` and `closed(gso_object_connect4_launchers)`, and remove the duplicate launchers resource. Also confirm that the Launchers edition grid has the bottom release slider the task relies on.
- Author response: Changed: the Fuel thumbnail (checked 2026-09-25) shows the closed retail box, so `gso_object_connect4_launchers` is now the `box` binding, with `open(...)` in the initial state and `inside(grid/bins/launchers, ...)` plus `closed(...)` in the goal. I removed `gso_resource_connect4_game_box`, the catch tray, and the shadowing `gso_resource_connect4_launchers` (the launchers are now `gso_resource_connect4_launcher_pieces`), and renamed the object as a game-box model. The box art shows a peg grid that rings are launched onto, with no bottom release slider, so the slider stage and condition were replaced with lifting rings off the pegs; `workflow` stays (sort-count checkpoint, then packing into the box). Task ID unchanged.
### task_gso_r1_pencil_case_pack_and_stow
- Verdict: revise
- Granularity: should be compound
- Finding: Everything happens at one desk in one sitting. The backpack is within reach, and the case going into the pocket is a nested placement, not a second location. Relabel it `compound`. The note says "close the pocket if declared", but the goal state has no `closed(gso_resource_backpack_front_pocket)`, and the pocket starts closed, so the end state is ambiguous. Either add the closure to the goal and success criteria or say that the pocket is left open.
- Author response: Changed: relabelled `compound`, added `closed(gso_resource_backpack_front_pocket)` to the goal (and to the template goals) with a matching success criterion, and made setup and reset zip the pocket closed so the end state is unambiguous.
### task_gso_r1_bookends_four_books_upright
- Verdict: revise
- Granularity: ok (compound)
- Finding: "No book leans more than a declared small tolerance" has no value. Give one (for example "spine within 5 degrees of vertical"), or define the check as "each book touches its neighbour or a bookend along its full height". `upright` and `no_book_leaning` restate each other; keep only one of them.
- Author response: Changed: success now requires every spine to be within 5 degrees of vertical on the front photograph 5 s after release. I dropped `no_book_leaning` from the task and template goals and defined `upright` in the note, including the rule that each book touches its neighbour or a bookend.
### task_gso_r1_string_lights_wind_and_store
- Verdict: revise
- Granularity: should be compound
- Finding: The untangling, winding, tucking, and binning all happen at one closet work surface, and setup puts the open bin "beside it". There is no reset or separate destination, so this is a compound task with five predicates. For asset honesty, the object note says the scan may be the retail package. Until that is checked, the ObjectInstance name "LED mini string lights" may describe the wrong physical thing. Either verify the mesh, or state in the task note that the string is a real-object requirement and the scan anchors only the product identity. If the scan is the box, a "wind the string back into its retail box" goal would use the asset directly.
- Author response: Changed: relabelled `compound`. The Fuel thumbnail shows the retail box, so the object is renamed as a retail-box model (concept `object_receptacle`), and the light string is now a real-object resource `gso_resource_led_light_string`. The goal is now to wind the string and put the card back into the box (`inside(card, gso_object_led_string_lights)` and `closed(...)`), replacing the holiday bin, and a `wound_card_fits_retail_box` condition was added. Task ID unchanged.
Accepted (no changes required):
- task_gso_r1_layer_cake_pans_nest_slot
- task_gso_r1_pressure_cooker_lock_park
- task_gso_r1_teapot_table_service (eight predicates is at the top end of compound, but two or more objects in one sitting is within the rubric. Splitting off the cups and saucers is optional.)
- task_gso_r1_tray_carry_mugs_sugar_bowl
- task_gso_r1_coffee_bag_roll_clip_shelve
- task_gso_r1_cocoa_canister_close_scoop_mug
- task_gso_r1_iced_tea_carton_split_store
- task_gso_r1_waste_basket_replace_liner
- task_gso_r1_soap_dish_set_on_ledge
- task_gso_r1_toothbrush_replace_head
- task_gso_r1_hair_dryer_hang_on_hook
- task_gso_r1_tennis_shoe_rack_toe_in
- task_gso_r1_boot_brush_sole
- task_gso_r1_hat_hang_on_hook
- task_gso_r1_stacking_rings_size_order
- task_gso_r1_knob_puzzle_seat_all_pieces
- task_gso_r1_ink_cartridge_install_cyan
- task_gso_r1_fabric_cube_collect_plush_and_shelve
