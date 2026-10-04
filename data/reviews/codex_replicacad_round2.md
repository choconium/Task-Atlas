# Review: replicacad_round2 (by Codex, Lane A)

Reviewed the 16-task draft against the active ReplicaCAD and cross-source
bundles, the coordination rubric, and the collection plans on 2026-10-04.
`npm run check:draft -- data/drafts/replicacad_round2.json` passes (6 atomic,
6 compound, 4 workflow). The similarity report correctly flags related
drawer, cupboard, and sweep tasks; the draft records distinct fixtures,
objects, or multi-stage purposes for each. The task/template validator passes
with the binding-level goal specialization used by this schema.

**Verdict: revise 1, accept 15, reject 0.** The revision is a blocker because
the source scene does not establish the target support surface.

### task_rcad_r2_shoebox_01_chair_seat_back_up_on_entry_shelf
- Verdict: revise
- Granularity: ok
- Finding: The object notes and task both say the apt_0 shoebox support is unknown (“chest top or wall shelf”), while the goal, placement tolerance, and instructions call it a definite shelf spot. Resolve the exact supporting surface and create a named resource tied to it before activation, with its bounds/load surface checked in simulation. If the scene cannot establish it, state that the task uses a newly staged shelf surface rather than presenting the target as the apt_0 home.
- Author response: (filled by the author)

### Accepted IDs

- `task_rcad_r2_clock_toppled_face_down_stood_upright_on_shelf_row`
- `task_rcad_r2_bin_03_back_beside_side_table_out_of_walkway`
- `task_rcad_r2_setupbox_knocked_on_edge_laid_flat_on_desk_mark`
- `task_rcad_r2_ycb_sponge_seated_in_sponge_dish_on_counter`
- `task_rcad_r2_tv_object_centred_below_screen_front_to_sofa`
- `task_rcad_r2_two_cans_out_through_doorwhole_1r_leaf_1l_unopened`
- `task_rcad_r2_two_chopping_boards_flat_in_counter_middle_middle_drawer`
- `task_rcad_r2_bowls_03_06_nested_in_counter_right_bottom_drawer`
- `task_rcad_r2_camera_02_desk_mat_into_chest_mid_left_drawer_lens_up`
- `task_rcad_r2_book_06_from_cabinet_right_bay_to_dining_table_flat`
- `task_rcad_r2_dining_lamps_both_to_cabinet_top_clear_of_door_fronts`
- `task_rcad_r2_dishes_put_away_three_cupboard_columns_one_pair_open_at_a_time`
- `task_rcad_r2_hall_chest_sort_mixed_tray_into_five_drawers_by_label_card`
- `task_rcad_r2_coffee_table_cleared_books_shelf_remotes_stand_bowl_sink`
- `task_rcad_r2_leave_apartment_sweep_close_seven_open_of_24_closures`
