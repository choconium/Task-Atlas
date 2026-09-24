# Review: thor_round1

Summary: revise before activation. 17 accept, 7 revise, 0 reject. The draft validates (`npm run check:draft`: 0 errors; 10 atomic, 11 compound, 3 workflow). Claims follow the contract. Every task maps its Atlas predicates to THOR state names, and heat, knife, water, and flame are handled with unplugged, surrogate, or simulation-only setups. No task duplicates an active task.
Main issues: the blinds and shower-curtain `isOpen` inversion is disclosed only in notes, not in any requirement or claim that an assessment or collection card would surface; two tasks close a door resource instead of the THOR object that carries `isOpen`; and "watered" and "made" need firmer operational tests.

### thor_round1 (bundle-wide)
- Verdict: revise
- Granularity: ok
- Finding: Several compound notes count unchanged predicates as goal changes. For example, the microwave, faucet-cup, spray-bottle, and dresser tasks each have one net change (`inside` or `filled_with_water`); `closed` and `switched_off` hold at both start and end. The labels are still right, since two objects are involved and the task needs an open-and-close or on-and-off articulation that is not one uninterrupted motion. Rewrite those notes as "one net change plus a transient articulation that must be reversed" instead of "four goal predicates". Separately, lamp power policy is inconsistent. The floor lamp runs on live mains with an LED bulb and is judged by visible light, while the desk lamp and house switches are "never energised" and judged by a dummy indicator. Pick one policy for low-heat LED lamps, and where a dummy indicator is used, say in the success criterion that it stands in for the light.
- Author response: Changed. Rewrote the microwave, faucet-cup, spray-bottle, and dresser notes as "one net change plus a transient articulation that must be reversed"; `closed`, `switched_off`, `upright`, and `folded` are now called preserved end-state constraints. Lamp power policy is now the same everywhere: the floor lamp is unplugged with a battery dummy indicator on its own switch, or simulation-only (condition `low_heat_led_bulb` became `lamp_unplugged_or_simulation_only`, and the cord is coiled or runs along the wall). The floor-lamp, desk-lamp, desk-clear, and house-lights success criteria now say the dummy indicator stands in for the light. The bundle draft note states the policy.

### task_thor_r1_blinds_close
- Verdict: revise
- Granularity: should be atomic on one control (currently two changes)
- Finding: The possible THOR `isOpen` inversion appears only in the task, object, and draft notes, so the assessment and collection card will not show it. Add a condition such as `thor_blinds_isopen_pose_confirmed_in_simulator`, and add the inversion to the `asset_compatibility` limitations. The goal also stacks two independent changes. Lowering the blind to the sill and shutting the slats use separate controls on real blinds (lift cord or cordless rail versus tilt wand), while THOR has one boolean. Define `closed` as "lowered to the sill" and treat the slats as out of scope, or make tilting a separate task.
- Author response: Changed. Chose one scope: `closed` means lowered to the sill across the full window width, and slat tilt is out of scope (it stays at the tilt recorded at setup). Renamed to "Lower the living-room window blinds to the sill so the window is covered" with the ID kept. Instructions, procedure, success criteria (rail on the sill, gap no wider than 2 cm), setup, reset, and failure modes no longer mention shutting slats. Added the condition `thor_blinds_isopen_pose_confirmed_in_simulator`. The `asset_compatibility` limitation now states the possible inversion and says a simulated isOpen check is invalid until the pose is confirmed.

### task_thor_r1_shower_curtain_close
- Verdict: revise
- Granularity: ok (atomic)
- Finding: The same surfacing gap applies. The note that THOR `isOpen=true` probably means the drawn, tub-covering pose must become a planning condition (for example `thor_shower_curtain_isopen_pose_confirmed_in_simulator`) and an `asset_compatibility` limitation, so it is not lost when goals are checked in simulation. The physical goal and success criteria ("no gap wider than a hand") are good.
- Author response: Changed. Added the condition `thor_shower_curtain_isopen_pose_confirmed_in_simulator`. The `asset_compatibility` limitation now states the possible inversion and says a simulated isOpen check is invalid until the pose is confirmed. The task note points to both.

### task_thor_r1_watering_can_fill_water_plant_return
- Verdict: revise
- Granularity: ok (workflow)
- Finding: "Watered" is measured with a "saucer or scale reading". Water in the saucer means the soil was overwatered, and it conflicts with `no_water_outside_saucer` as the spill check. Define watered as a pot-mass increase within a band (for example 150–250 g on a scale under the pot) with the saucer staying below a set volume. In THOR, `HousePlant isFilledWithLiquid` can be set without the can ever tilting, so a simulated goal check cannot show that the can delivered the water; say this in the `asset_compatibility` limitation. `intent_transport` misdescribes the goal. Either propose `intent_tend_plant` or explain in the claim scope why transport was chosen.
- Author response: Changed. Watered is now a scale reading: the pot and saucer stand on a scale (new resource `thor_resource_plant_scale`) and must gain 150–250 g, read 60 s after pouring stops, with no more than 30 mL standing in the saucer (condition `watering_band_150_250_g_saucer_max_30_ml`). `no_water_outside_saucer` now covers only the floor, furniture, and route. The checkpoint, success criteria, setup, and quality checks were updated to match. The `asset_compatibility` limitation now says THOR can set HousePlant `isFilledWithLiquid` without the can ever tilting. Intent: kept `intent_transport`, because no plant-care intent exists in the seeds and adding one is outside this bundle. The reason is in the `task_suitability` claim scope, and `intent_tend_plant` is noted as a possible future replacement.

### task_thor_r1_bed_make_with_pillow
- Verdict: revise
- Granularity: ok (compound)
- Finding: `made(thor_object_bed_1)` is only the conjunction of the other goal predicates. Drop it from the goal and keep it as the THOR `isDirty=false` mapping in the note. `smooth` and "even side overhang" still point to a threshold "defined at setup". Put default numbers in the planning record (for example "no fold or bunch higher than 3 cm on the top surface; left and right overhang within 10 cm of each other") so different reviewers judge the same way.
- Author response: Changed. Dropped `made(thor_object_bed_1)` from the task goal and from the template goals. The note keeps made/unmade <-> `isDirty` false/true as the mapping for simulated checks. Replaced `smoothness_threshold_defined_at_setup` with `bed_tolerances_fold_3cm_overhang_10cm_edge_15cm`. The success criteria now use numbers: no fold higher than 3 cm, left and right overhang within 10 cm of each other, and the duvet top edge within 15 cm of the pillow's foot-side edge. The checkpoint and quality checks use the same numbers.

### task_thor_r1_safe_store_keychain_card
- Verdict: revise
- Granularity: ok (compound)
- Finding: The note maps open/closed to `isOpen` on the Safe object, but the goal uses `closed(thor_resource_safe_door)`, a planning resource with no THOR state. Use `closed(thor_object_safe_18_1)`, as the microwave task does, so that simulated goal checks read the right flag. Keep the door resource only as the grasp handle, if it is needed at all.
- Author response: Changed. Initial and goal states now use `open(thor_object_safe_18_1)` / `closed(thor_object_safe_18_1)`, and the template uses `open(theme)` / `closed(theme)`. `thor_resource_safe_door` stays only as the grasp handle; its requirement reason and the note say it carries no state.

### task_thor_r1_washing_machine_load_start
- Verdict: revise
- Granularity: ok (compound)
- Finding: The same door mismatch applies. `closed(thor_resource_washing_machine_door)` should be `closed(thor_object_washing_machine_1)` to match the stated `isOpen` mapping. `switched_on` on an unplugged machine with a dummy indicator is disclosed honestly. Add to the success criterion that the indicator stands in for starting a cycle, so the end state is not read as "washing started".
- Author response: Changed. Initial and goal states now use `open(thor_object_washing_machine_1)` / `closed(thor_object_washing_machine_1)`, and the template matches. The door resource is only the grasp handle. The success criterion now says the dummy power indicator stands in for pressing start and does not mean a wash cycle ran.

### task_thor_r1_house_lights_off_before_leaving
- Verdict: revise
- Granularity: ok (workflow: three rooms, four destinations)
- Finding: `in_room(robot, thor_resource_living_room)` puts robot pose in the goal state. It is not an environment end state, and other tasks do not use it. Move it to setup or reset, or to a quality check. The name "every light" is open-ended; rename it "Switch off the desk lamp and the bedroom, kitchen, and living-room lights before leaving" so the scope is the four listed lights. The desk lamp's `switched_off` also appears in `task_thor_r1_desk_lamp_switch_off` and `task_thor_r1_desk_clear_for_night`. That overlap is acceptable because each task has a different scope, but mention the relation in the notes.
- Author response: Changed. Removed `in_room(robot, …)` from both the initial and goal states. The start room is set in setup, and ending by the front-door switch is an optional end pose in the final procedure step. Removed robot position from the success criteria. Renamed the task to "Switch off the desk lamp and the bedroom, kitchen, and living-room lights before leaving", and updated name_ja, the instructions, the task_suitability statement, and the template name so the scope is these four lights. The note now mentions the overlap with `task_thor_r1_desk_lamp_switch_off` and `task_thor_r1_desk_clear_for_night` and why each has a different scope.

Accepted (no changes required):
- task_thor_r1_microwave_mug_inside_door_closed (see the bundle-wide note wording)
- task_thor_r1_toaster_bread_slice_switch_on
- task_thor_r1_faucet_fill_cup_then_off (see the bundle-wide note wording)
- task_thor_r1_pot_fill_water_back_burner
- task_thor_r1_bread_loaf_slice
- task_thor_r1_paper_towel_spent_roll_discard
- task_thor_r1_mug_living_room_rinse_return_cabinet
- task_thor_r1_tv_switch_off
- task_thor_r1_floor_lamp_switch_on
- task_thor_r1_candle_extinguish
- task_thor_r1_laptop_close_to_coffee_table
- task_thor_r1_shower_switch_off
- task_thor_r1_toilet_lid_close
- task_thor_r1_desk_lamp_switch_off (see the bundle-wide lamp power policy)
- task_thor_r1_dresser_store_folded_cloth (see the bundle-wide note wording)
- task_thor_r1_desk_clear_for_night (optional: bind the bundle's `thor_object_laptop_1` instead of `thor_resource_laptop`, as the task already does for the desk lamp)
- task_thor_r1_spray_bottle_return_under_sink (see the bundle-wide note wording)
