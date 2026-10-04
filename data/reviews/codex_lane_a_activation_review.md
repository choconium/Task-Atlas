# Lane A activation review — 2026-10-04

Scope: read-only pre-commit review of the seven proposed Lane A bundles. I checked task labels against `goal_state`, task-to-template goal agreement where a local template exists, independently achievable outcomes, unsupported source behavior, and semantic similarity. An independent licence audit is outside this review.

## Result

**Accepted after corrective review.** The 94 multi-outcome records have been reclassified as `compound`; the remaining single-outcome records remain `atomic`. `npm run check:draft -- <all seven bundles>` validates the JSON shape (145 tasks), and the GSO/RoboCasa template and binding repairs recorded below are now applied. The Kenney batch remains the 20-task all-atomic batch required by its source objective.

The prior comma-joined `report:similar --only` invocation was invalid evidence: that CLI accepts one prefix and matched no tasks. The corrected all-active-task analysis filtered the 827-task report to either endpoint among these 145 Lane A tasks and found 15 pairs at or above 0.6. All 15 are accepted as distinct object-specific tasks, distinct destinations, or distinct recovery/retrieval initial conditions; no exact-goal duplication blocks activation. The only same-object/same-destination pair is explicitly recorded below as an initial-condition variant.

| Bundle | Verdict | Findings and required disposition |
| --- | --- | --- |
| `reference_kenney_furniture_kit_round1.json` | **Accept** | All 20 tasks have one goal predicate and exactly match their local templates. The five exact archive members are pinned with archive and GLB hashes; source meshes are correctly limited to a separately reviewed virtual proxy for contact. Static assets do not claim key travel, blender use, or plant biology. |
| `reference_abo_home_props_round1.json` | **Accept** | The 16 multi-predicate records are now `compound`; four one-outcome records remain `atomic`. Exact GLBs are hash-pinned and runtime contact remains proposed. |
| `reference_gso_round1.json` | **Accept** | All 25 multi-outcome records are now `compound`. The eight invalid shared-template usages are now served by three source-local templates, and all repeated-suffix support IDs were normalized to their bindings. Converted mesh models still require runtime movable-body physics. |
| `reference_polyhaven_home_props_round1.json` | **Accept** | The 14 multi-predicate records are now `compound`; six single-outcome records remain `atomic`. Asset records pin glTF/buffer resources and exclude unsupported articulated functionality. |
| `reference_polypizza_household_props_round1.json` | **Accept** | The 12 multi-predicate records are now `compound`; eight single-outcome records remain `atomic`. Exact GLBs are hash-pinned and static-source restrictions remain clear. |
| `reference_robocasa_fixtures_round2.json` | **Accept** | The 15 multi-outcome records are now `compound`; five single-outcome records remain `atomic`. Tasks 10/12 now bind `support`, and task 18 now instantiates the visible/occluded-record template predicates. Fixture composition, collisions, and actuation remain explicit runtime gates. |
| `reference_smithsonian_3d_artifacts_round1.json` | **Accept** | The 12 multi-predicate records are now `compound`; eight single-outcome records remain `atomic`. Virtual display/proxy scope remains explicit. |

## Required follow-up before activation

1. Re-run the all-seven `check:draft` command and the all-active-task similarity report during final integration; filter Lane A endpoints after reporting, rather than passing multiple prefixes to `--only`.
2. Run the independent licence review before publishing any source bundle. This review checked identity/pinning and scope only.

The 15 reviewed high-similarity pairs do not constitute duplicate records. The `scene_home_bathroom` collision had already been resolved by the separate Lane A scene rename and is not a finding in these seven proposed files.

### Similarity-pair disposition (corrected)

The 15 pairs in `/tmp/task-atlas-lane-a-similarity.json` were reviewed by object, source condition, destination, and terminal predicate.

* Seven GSO tool pairs compare hammer, screwdriver, or spatula identities in the same broad storage/recovery family. Different object identities require separate manipulation and recovery coverage. The hammer/screwdriver caddy-to-workbench and floor-recovery pairs also differ by their source condition.
* `mug_store_drying_rack` and `plate_counter_to_drying_rack` share a rack-placement shape but have different object identities and bounded rack destinations. The adjacent plate tasks form a retrieval sequence: counter to rack, then rack to serving tray.
* The YCB soup-can shopping-cart task and GSO cereal-cart task retain distinct source objects, package geometries, and cart targets.
* Kenney keyboard, books, and blender outline-placement pairs are intentional object-specific milestones. Each uses a different exact verified GLB and object-specific support/orientation constraint; none duplicates a goal for the same object.
* `spatula_crock_to_prep_mat` and `spatula_rack_to_prep_mat` have the same terminal state for the same object, but represent two linked initial conditions: accessible utensil crock versus draining-rack slot. They remain distinct reset/retrieval variants and are explicitly linked in the GSO draft notes.

## Template-instantiation addendum

### GSO shared templates

The eleven external references are not all interchangeable instances of the shared templates in `data/seeds/task_templates.json`.

* `transport_object` is a valid role binding for `plate_rack_to_serving_tray`, `plate_clear_table_to_counter`, and `spatula_rack_to_prep_mat`: each binds `theme`, `source`, and `destination`, and its core result is `on_top_of(theme, destination)` plus stability. The plate and spatula rack records should remove the second invented `*_slot_slot_slot...` initial support predicate, which conflicts with their bound source.
* `mug_retrieve_cupboard_shelf`, `bowl_cupboard_to_table`, `cereal_cart_to_checkout`, and `spatula_crock_to_prep_mat` bind the right nouns but start `inside(theme, source)`. They do not satisfy the shared template's formal `on_top_of(theme, source)` precondition. The smallest sound bundle-local repair is a `retrieve_from_container_round1` template with the same destination goal and an `inside(theme, source)` precondition, then point these four tasks to it.
* The three `recover_dropped_object` records do not instantiate their shared template. Its formal outcome requires `held_by(theme, robot)` and `safe(theme)`, whereas the task explicitly ends after release on a named support; its `on_floor` start also differs from the formal `fallen(theme)` precondition. Add one local `recover_floor_object_round1` template with the exact floor/start and supported-after-release semantics, and retarget the three tasks. Do not add `held_by` to a task whose terminal state is released.
* `cereal_face_front_shelf` is also a genuine formal mismatch: the shared template uses `on_shelf` and requires stability, while the record uses `on_top_of` and only labels the front. Create a local facing template or harmonize all three predicates and the initial-state vocabulary.

The preservation predicates (`empty`, `upright`, `clean`, `dry`) are still independently testable outcomes in the present task records. Changing the affected tasks to `compound` preserves the authored scope; making them atomic later requires moving those predicates to an invariant or check rather than keeping them in `goal_state`.

### RoboCasa local templates

Most RoboCasa differences are valid semantic specialization, not a broken template mapping. The concrete cabinet hinge, drawer limit, and record predicates bind the supplied `theme`/`record` roles and refine the generic template outcomes. The task labels should become `compound` where they retain the additional stability, fixture-state, or preserved-object outcomes.

Two genuine role/goal gaps need the following minimal edits:

1. Tasks 10 and 12 (`hammer_head_to_arrow`, `screwdriver_rotate_tip_away_on_mat`) use `template_orient_object_on_counter_round2`, whose formal role is `support`, but bind only `destination`. Add `"support": "counter_tool_mat"` and `"support": "counter_tip_orientation_mat"` respectively, or rename the template role to `destination` consistently. Keep their target bindings. Prefer the former because these are orientation-in-place tasks.
2. Task 18's `visible_opening_path_assessment_recorded(...)` is broader than, but does not formally instantiate, `visible_regions_recorded(record)`. Replace it with `visible_regions_recorded(opening_path_record)` or add a documented template predicate whose parameterization explicitly maps the fixture assessment to visible regions. Its existing `occluded_regions_recorded(robocasa_counter_with_opening, opening_path_record)` should likewise use the template's record form, or the template must be specialized locally.

All other RoboCasa records have bounded role bindings after parameter substitution. The remaining differences are expected concrete predicate names or intentional added outcomes, and do not independently block source-bundle integration once their granularity labels are corrected.

### GSO binding/goal identifier blockers

Four repeated-suffix identifier defects must be fixed independently of the granularity change. They describe different supports than their declared bindings, so an executor cannot identify the intended target unambiguously.

1. `mug_store_drying_rack` binds `destination: drying_rack_slot`, but its goal and one clear precondition use `drying_rack_slot_slot_slot`. Replace both suffixed references with `drying_rack_slot`.
2. `plate_counter_to_drying_rack` binds `destination: plate_drying_rack_slot`, but its goal and one clear precondition use `plate_drying_rack_slot_slot_slot_slot_slot`. Replace the suffixed references with the bound destination. `plate_rack_to_serving_tray` must also remove its duplicate suffixed initial support predicate and retain the bound source only.
3. `bottle_store_organizer` binds `destination: bathroom_organizer_compartment`, while the goal and two clear predicates use `bathroom_organizer_compartment_compartment` and `..._compartment_compartment`. Replace all with the declared destination, retaining one clear predicate.
4. `spatula_rack_to_prep_mat` binds `source: utensil_drying_rack_slot` but also declares the invented `utensil_drying_rack_slot_slot_slot_slot_slot` initial support. Remove the latter.

These corrections are local GSO bundle edits. They also make the task bindings, planning requirements, setup text, and formal state predicates refer to the same scene resource.

## Author response and closure

The reviewed corrections are applied in the two source bundles: GSO now has 10 local templates, including container retrieval, floor recovery, and shelf-facing templates used by the eight formerly invalid shared-template references. Its remaining three shared `transport_object` references retain compatible on-surface starts and destination bindings. All accidental repeated support suffixes were removed or normalized to the declared binding.

RoboCasa tasks 10 and 12 now supply the template's `support` role. Task 18 now records `visible_regions_recorded(opening_path_record)` and `occluded_regions_recorded(opening_path_record)`, which instantiate its local template. `npm run check:draft -- data/seeds/ycb_batches/reference_gso_round1.json data/seeds/ycb_batches/reference_robocasa_fixtures_round2.json` passed with 45 tasks (`compound`: 40, `atomic`: 5). Both bundles are accepted for integration, subject to the independent licence audit and final repository-level validation.

## Final integration — 2026-10-05

All-seven draft validation passed 145 tasks (51 atomic / 94 compound) after the
repairs. Independent official-source licensing review is accepted in
`codex_source_licensing_review.md`. `npm run check` passes seed/research
validation and all 38 tests, including Worker manifest parity and complete
YCB graph coverage. Worker dry-run bundling also passes. Source bundles and
the sorted manifest are committed in `0e9fff7`. The required integration gates
above are complete; Claude cross-lane review remains tracked separately.
