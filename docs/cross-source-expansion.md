# Cross-source task expansion

Cross-source tasks extend the atlas beyond its catalog-wide YCB coverage. A
source model can anchor a task even when it is not a YCB object; its own
identity and compatibility claims remain separate from the task proposal.

Independent review on 2026-10-04 corrected 94 multi-goal task labels from
`atomic` to `compound`, retaining their authored outcomes. Kenney follows its
explicit milestone of 20 single-predicate atomic tasks. These rounds establish
source-specific staging/inspection coverage; subsequent expansion should add
useful purposes and settings rather than repeat four task forms per model.

| Bundle | Atomic | Compound | Total |
| --- | ---: | ---: | ---: |
| Converted GSO round 1 | 0 | 25 | 25 |
| RoboCasa fixtures round 2 | 5 | 15 | 20 |
| ABO round 1 | 4 | 16 | 20 |
| Poly Haven round 1 | 6 | 14 | 20 |
| Poly Pizza round 1 | 8 | 12 | 20 |
| Smithsonian round 1 | 8 | 12 | 20 |
| Kenney round 1 | 20 | 0 | 20 |
| Total | 51 | 94 | 145 |

Current reviews are recorded in `data/reviews/codex_lane_a_activation_review.md`
and `data/reviews/codex_reference_kenney_furniture_kit_round1.md`. Cross-lane
review by Claude remains tracked separately.

## Round 1: converted Google Scanned Objects

`data/seeds/ycb_batches/reference_gso_round1.json` adds eight external model
records and 25 proposed compound task instances, each with one planning record and
four task claims. The objects are:

| Model family | Proposed task themes |
| --- | --- |
| ACE coffee mug | Rack-slot placement, cupboard retrieval, fallen-object recovery |
| Bradshaw plastic bowl | Open-top storage, cupboard-to-table transfer, recovery |
| Threshold dinner plate | Rack-slot placement, rack retrieval, table clearing |
| Marc Anthony curl-cream bottle | Upright shelf transfer, organizer storage, upright recovery |
| Vans cereal box | Shelf-facing, cart loading, cart-to-checkout transfer |
| Cole hammer | Caddy retrieval and storage, floor recovery |
| Craftsman Phillips screwdriver | Caddy retrieval and storage, floor recovery |
| OXO cookie spatula | Crock storage and retrieval, rack transfer, floor recovery |

Object IDs are based on exact model-directory names in the pinned
[MuJoCo Scanned Objects repository](https://github.com/kevinzakka/mujoco_scanned_objects/tree/6ff8d275cebfd5b47e49685e3cfbe64b20e49a3c).
They identify conversion-repository assets and are not asserted as official
Google object IDs. The [Google Scanned Objects dataset description](https://research.google/blog/scanned-objects-by-google-research-a-dataset-of-3d-scanned-common-household-items/)
provides upstream collection context.

### Licensing and runtime limits

The pinned [conversion repository README](https://github.com/kevinzakka/mujoco_scanned_objects/blob/6ff8d275cebfd5b47e49685e3cfbe64b20e49a3c/README.md)
assigns CC BY 4.0 to OBJ/PNG geometry and texture assets and MIT to MJCF XML
files. The `asset_source_url` values in this
bundle point to each model's `model.xml`, so the bundle notes both licenses
separately. The inspected XML models are static: they do not define a free joint
or inertial properties. A simulator collection therefore needs a reviewed
movable-body configuration. The bundle marks grasping and placement as proposed
affordances; asset compatibility remains unknown.

The task designs do not assume model-specific grasp success, container fit,
contents, dispensing, washing, fastening, or striking behavior. Tasks that use
empty dishware, upright bottles, clean/dry utensils, or shelf-facing conditions
state those as initial or goal conditions. Setup and reset instructions include
the extra runtime physics configuration required for simulation use.

### Task sources and scope

The pinned RoboCasa [atomic pick-and-place implementation](https://github.com/robocasa/robocasa/blob/4f8a2980def75a55dff96b990745b83540425f09/robocasa/environments/kitchen/atomic/kitchen_pick_place.py)
defines kitchen object-transfer patterns such as counter-to-cabinet and
cabinet-to-counter. Ten kitchen transfer proposals cite that source as a task
pattern. The bathroom, retail, and woodworking setups are labeled as Task Atlas
extensions rather than RoboCasa scenes or source-derived task claims. Recovery
tasks remain Atlas design proposals.

All task-suitability claims remain `proposed`. Population-frequency,
robot-execution, and asset-compatibility claims remain `unknown`; the catalog
identity claims only identify the pinned converted model directories. Task
times remain null until measured.

### Granularity review and validation

Peer review confirmed one bounded object-state transition per task and found no
exact duplicate with the active reference tasks. The review also led to these
changes before promotion into the seed loader:

- Represent drying-rack destinations as marked support slots, rather than
  closed receptacles.
- Represent the shopping cart by an available basket region, and open-top
  holders by a clear interior.
- Add required empty, clean, dry, upright, tilted, and clear-area conditions to
  both task states and planning requirements where they affect collection.
- Keep source citations within scope; non-kitchen settings cite the design seed
  only.
- Separate OBJ/PNG and MJCF licenses and describe the XML as a static model.

Immediately after Round 1, `npm run validate` passed and the coverage report
showed 467 YCB-primary tasks and 496 tasks overall. GSO tasks contribute to
`all_task_count` without increasing YCB catalog coverage. Round 2 below adds a
further 20 tasks; current totals are 467 YCB-primary tasks and 516 tasks overall.

## Round 2: RoboCasa fixture components

`data/seeds/ycb_batches/reference_robocasa_fixtures_round2.json` adds six
repository-tracked fixture XML paths, one proposed composed kitchen scene, 16
task templates, and 20 proposed tasks with one planning record each. The
bundle has 86 claims: 80 task claims and six path-identity claims. Model paths
are pinned to [RoboCasa commit
4f8a2980def75a55dff96b990745b83540425f09](https://github.com/robocasa/robocasa/tree/4f8a2980def75a55dff96b990745b83540425f09):

| Fixture component | Tracked XML path |
| --- | --- |
| Counter | `robocasa/models/assets/fixtures/counters/counter/model.xml` |
| Counter with opening | `robocasa/models/assets/fixtures/counters/counter_with_opening/model.xml` |
| White wide switch | `robocasa/models/assets/fixtures/accessories/light_switches/white_wide_switch/model.xml` |
| Simple white outlet | `robocasa/models/assets/fixtures/accessories/outlets/simple_white/model.xml` |
| Single-cabinet hinge anchor | `robocasa/models/assets/fixtures/cabinets/cabinet_single.xml` |
| Drawer inner box | `robocasa/models/assets/fixtures/cabinets/drawer.xml` |

The tasks cover cabinet and drawer articulation, counter/cabinet transfers,
drawer storage and retrieval, object orientation and staging, visual switch and
outlet observations, calibrated geometry records, and proposed bowl passage
through a counter opening. Pinned RoboCasa [atomic task documentation](https://robocasa.ai/docs/build/html/tasks/atomic_tasks.html)
and implementations support the cabinet/drawer open-close and counter/cabinet
pick-place patterns used by tasks 1–6 and 9. Drawer pick-place in tasks 7–8,
object staging/orientation in tasks 10–12, observations and measurement in
tasks 13–18, and opening passage in tasks 19–20 are Task Atlas design
extensions; the RoboCasa source does not establish those exact task patterns,
asset fits, or execution success.

### Component composition and licensing limits

RoboCasa's [pinned README license section](https://github.com/robocasa/robocasa/blob/4f8a2980def75a55dff96b990745b83540425f09/README.md#license)
declares a project-level split of Code: MIT and Assets and Datasets: CC BY 4.0.
It does not classify each XML file or every referenced resource. The bundle
therefore records repository path identity only and does not label individual
XML files as free or assign them a per-file license.

The raw XML files are components rather than complete collection scenes. The
counter dimensions and pose are supplied through higher-level configuration;
the counter-with-opening XML does not contain the aperture geometry. The
cabinet XML defines an empty hinge anchor and outer-shell box geoms, but no door
panel, handle, shelf, or door-panel collision geometry. The drawer XML defines
an inner box with bottom, back, and side geoms plus a slide joint, but no front,
handle, or front collision geometry. Switch and outlet geoms are visual-only;
their collision geometry is marked TODO, so tasks 13–14 are noncontact visual
observations. Each composition requires recorded configuration and geometry
checks before collection.

All 20 task bindings point to an `execution_asset_manifest_round2` planning
artifact. Before collection it must record the fixture composition ID, source
config path/revision/hash, runtime version/config hash, and each executed
asset's Atlas identity, exact model or proxy identity, source path/revision,
body and mobility setup, collision configuration hash, and compatibility
review status. Ten object-manipulation tasks also require a distinct movable
proxy record because the pinned GSO model XMLs are static. The proxy remains a
runtime execution identity separate from the catalog object; compatibility
remains unknown until reviewed. Missing identifiers or hashes block collection.

Measurement and visual-observation plans declare typed JSON artifacts with
frame, calibration, units, uncertainty, visibility, or occlusion fields as
needed. The planning schema now supports these collection artifacts and the
`skill_measure` capability. These records do not turn a width estimate or
visible path into a 3D fit certificate. The two opening-passage proposals
require full aperture, object-envelope, receiver, gravity, collision, and
approach/release preflight.

The existing `data/drafts/reference_robocasa_round2.json` remains a separate,
unchanged draft and is not loaded by this bundle. Granularity review found no
exact duplicate against active seed tasks or that draft; it also led to
explicit persistent-door/drawer goal states, manifest requirements, and
corrected descriptions of the cabinet and drawer collision geometry.

## ABO household-prop tasks round 1

This batch adds **20 proposed tasks** using five household-product GLBs from the official [Amazon Berkeley Objects dataset](https://amazon-berkeley-objects.s3.amazonaws.com/index.html). The official index states the dataset-level **CC BY 4.0** license and requires credit to Amazon.com and the dataset builders. The current [AWS Open Data Registry entry](https://registry.opendata.aws/amazon-berkeley-objects/) notes that asset licensing changed from CC BY-NC to CC BY in 2023; stale license strings were not used.

The official S3 listing metadata and 3D model table were joined directly. For all five selected products, listing item_id equals 3dmodel_id; asset_source_id is the verified 3D model ID. Each exact path, title, raw extent triple, mesh/vertex/face counts, official GLB URL, and downloaded GLB SHA-256 is in the batch JSON.

| ABO item/model ID | Product | Official GLB path | Raw extent X/Y/Z |
| --- | --- | --- | --- |
| B07QB8L3L5 | Stone & Beam textured blue vase | 5/B07QB8L3L5.glb | 0.1162348688 / 0.2296594530 / 0.1162348539 |
| B07ML7J579 | Ravenna Home smooth ceramic table lamp | 9/B07ML7J579.glb | 0.2009279132 / 0.3529864550 / 0.2009278685 |
| B075HXSW3N | Rivet triangular wall-mount planter | N/B075HXSW3N.glb | 0.1497346014 / 0.1972260475 / 0.0604123907 |
| B075HR7LD2 | Stone & Beam stoneware candle holder | 2/B075HR7LD2.glb | 0.1095784158 / 0.2389470935 / 0.1095784158 |
| B07B8PXMTK | Rivet stag-head figurine | K/B07B8PXMTK.glb | 0.1744874045 / 0.3287588954 / 0.2239666358 |

The metadata schema does not state extent units or the model up-axis. Listing dimensions can disagree across title, bullet points, and structured fields, so they are product metadata, not execution calibration. All five downloaded models parse as glTF 2.0 and contain one mesh; none provides task-ready collision, mass, mobility, or grasp configuration.

The task set is model-specific: vase cradle/mapped surface-feature presentation/oblique capture/rim estimate; lamp base placement/brass-accent presentation/shade-clearance route/component visibility; custom planter cradle/triangle alignment/rear-hole presentation/visibility; empty candle-holder placement/speckled-region orientation/apparent opening estimate/rim-base visibility; figurine plinth/muzzle orientation/antler-clear route/silhouette record.

Granularity review found no exact duplicate against active seeds or unchanged user drafts, but warned about generic placement, camera alignment, transfer, and inspection near-duplicates. Peer review found no task pair requiring a split or merge; close-looking pairs have distinct feature or outcome definitions. Each model has its own supports, visible features, route constraints, risks, and output records. The seed avoids unsupported functionality: no vase water or watertightness; lamp power, cord, light, or heat; planter mounting, load, or contents; candle or flame; figurine strength or graspability. Suitability is proposed; compatibility, execution, and frequency remain unknown. Thirteen contact tasks require a separately reviewed execution proxy. The collection manifest records feature annotation IDs and configuration SHA-256 values where tasks depend on visual landmarks.

Batch file: [reference_abo_home_props_round1.json](../data/seeds/ycb_batches/reference_abo_home_props_round1.json). Sources: [official listing metadata](https://amazon-berkeley-objects.s3.amazonaws.com/listings/metadata/) and [official 3D model metadata](https://amazon-berkeley-objects.s3.amazonaws.com/3dmodels/metadata/3dmodels.csv.gz).

## Poly Haven household and work-surface props round 1

`data/seeds/ycb_batches/reference_polyhaven_home_props_round1.json` adds five
exact Poly Haven model IDs and 20 proposed tasks, each with a template
and plan. The bundle records 85 claims, one neutral staging-cell proposal, the
official model-page URL, API file-manifest hash, direct 1k glTF path, all
API-listed resource URLs and MD5s, and downloaded glTF/binary-buffer SHA-256
values. The five individual asset pages mark the models CC0, consistent with
Poly Haven's [license page](https://polyhaven.com/license), which describes its
assets as CC0. No attribution is required for these selected CC0 assets.

| Official model ID | Model | Poly Haven category | API dimensions X/Y/Z (mm) | Meshes / nodes |
| --- | --- | --- | --- | ---: |
| [`watering_can_metal_01`](https://polyhaven.com/a/watering_can_metal_01) | Watering can | Tools & Equipment / Garden Tools | 191.0 / 452.3 / 196.8 | 1 / 1 |
| [`brass_pot_01`](https://polyhaven.com/a/brass_pot_01) | Brass pot | Food & Kitchen / Cookware | 301.9 / 301.7 / 290.9 | 1 / 1 |
| [`wicker_basket_02`](https://polyhaven.com/a/wicker_basket_02) | Wicker basket | Containers & Storage / Baskets | 374.7 / 270.7 / 218.2 | 2 / 2 |
| [`vintage_stapler`](https://polyhaven.com/a/vintage_stapler) | Vintage stapler | Office & Stationery / Office Tools | 208.5 / 47.4 / 95.3 | 4 / 4 |
| [`CashRegister_01`](https://polyhaven.com/a/CashRegister_01) | Cash register | Electronics & Appliances / Retail Machines | 600.5 / 624.2 / 621.4 | 2 / 2 |

The task families use each model's visible shape: spout clearance and alignment;
pot knob/rim presentation and outer lid-rim visibility; basket support and
braided-rim orientation; stapler footprint, nose alignment, and image-space
measurement; register assembly placement and fixed-drawer clearance. The
remaining proposals record views or visibility. The source [Poly Haven API](https://api.polyhaven.com/)
provides the catalog, per-model info, and downloadable-file manifests; exact
API endpoints and raw values are retained in the batch for independent
rechecking.

The selected downloads are glTF 2.0 JSON manifests with separately addressed
binary buffers and PBR textures. The downloaded JSON and geometry buffers were
checked against API MD5 values and have SHA-256 values recorded in the batch;
texture URLs and MD5 values are also listed there. The catalog dimensions are
source metadata, not execution calibration or robot-frame transforms. These
models contain static visual geometry without task-ready collision, mass,
mobility, or articulation. In particular, the basket lid and register drawer
are treated as fixed parts of static multi-node meshes. Tasks do not assume
liquid flow, cooking, basket capacity, stapling, register power, sales, cash, or
drawer motion. Contact tasks need a separately reviewed proxy and scene/runtime
manifest; suitability is proposed, while execution and compatibility remain
unknown.

Peer review found no exact duplicate and no pair that needs a split or merge.
The reviewer recommended treating the cash-register body and drawer as one
static assembly, keeping the setting a neutral inspection cell, and excluding
checkout or drawer-operation semantics. Those limits are reflected in the
tasks and planning records.

Batch file: [reference_polyhaven_home_props_round1.json](../data/seeds/ycb_batches/reference_polyhaven_home_props_round1.json). Source: [Poly Haven model catalog](https://polyhaven.com/), [license](https://polyhaven.com/license), and [API](https://api.polyhaven.com/).

At Round 3, with both ABO and Poly Haven bundles active, the coverage report
showed 467 YCB-primary tasks and 556 tasks overall; external objects remained
outside the 77-object YCB coverage target. Round 4 below adds 20 tasks.

## Smithsonian Open Access digitized artifacts round 1

`data/seeds/ycb_batches/reference_smithsonian_3d_artifacts_round1.json` adds
five exact Smithsonian 3D package records and 20 proposed object-specific
tasks, with one plan per task. Smithsonian's [Open Access FAQ](https://www.si.edu/openaccess/faq)
explains reuse of CC0 material, including commercial reuse. Each selected
object page separately designates its 3D media as public domain and its
record/metadata as CC0. These individual designations are retained alongside
each package UUID in the batch. The source FAQ recommends basic
credit, although attribution is not required for CC0.

| Smithsonian object | Catalog record | 3D package UUID | GLB bytes | Downloaded GLB SHA-256 |
| --- | --- | --- | ---: | --- |
| [Morse-Vail Telegraph Key](https://3d.si.edu/object/3d/morse-vail-telegraph-key%3Aed99f44d-3c60-4111-b666-e2908e1b64ef) | `nmah_1096762` | `ed99f44d-3c60-4111-b666-e2908e1b64ef` | 1,344,184 | `8d76c81e7eeb8ac1b245d88e289318f5c95116896f59e9663f8013f9b27b7c5b` |
| [Beaker-shaped vase, from a five-piece garniture](https://3d.si.edu/object/3d/beaker-shaped-vase-five-piece-garniture%3Ad8c64b96-4ebc-11ea-b77f-2e728ce88125) | `fsg_F1980.194a-b` | `d8c64b96-4ebc-11ea-b77f-2e728ce88125` | 943,076 | `18436739bd9dba99898c8059899218f591467ba615b3797ff4962475ecd1016e` |
| [Side Chair](https://3d.si.edu/object/3d/side-chair%3Aff607e3c-3d88-4422-a246-3976aa4839dc) | `chndm_2006-5-1` | `ff607e3c-3d88-4422-a246-3976aa4839dc` | 1,461,828 | `da7d9b2066551993efd9f7afbc018e1379ee216a6ac9cf4d89c73cbe15708cc7` |
| [Tin for Madame C.J. Walker's Wonderful Hair Grower](https://3d.si.edu/object/3d/tin-madame-cj-walkers-wonderful-hair-grower%3A5e37d1c8-6dce-46d5-9324-871eddba4313) | `nmaahc_2011.159.6` | `5e37d1c8-6dce-46d5-9324-871eddba4313` | 944,716 | `bd1c7797e25796bc356fdf46baaf72be5fbcc7614ade7dd38054e98ddd352b5e` |
| [Letter Opener for the Black Star Line](https://3d.si.edu/object/3d/letter-opener-black-star-line%3A6a90207b-373e-401f-9abd-5778c1af46a3) | `nmaahc_2014.63.59` | `6a90207b-373e-401f-9abd-5778c1af46a3` | 721,488 | `c27d2e7d06f9a5e3013c8539b02fd19ec1048174719f9cb7851a7cf048e2a367` |

The direct Download3D GLB links, exact file-search API queries, API byte counts,
download dates, and hashes are pinned per object. The [Smithsonian 3D API
documentation](https://3d-api.si.edu/api-docs/) describes the file-search
endpoint used to resolve each package. All five downloaded files were
inspected as GLB 2.0: one mesh and one unnamed node, Draco-compressed, with no
animation or skin. Catalog dimensions describe the original museum items and
are not scale validation or execution calibration. Static scans do not supply
task-ready collision, mass, mobility, grasp, or robot configuration.

The four tasks for each model address distinct visible or geometric outcomes:
the telegraph key's marked display footprint, lever/contact presentation,
calibrated lever-span image measurement, and component visibility; the vase's
cradle support, cobalt-scene orientation, lip visibility, and panel pixel
width; the chair's marked four-foot placement, pierced-back orientation,
leg-clear route, and feature visibility; the tin's tray placement, label
orientation, label/portrait visibility, and label-panel pixel width; and the
letter opener's guarded-slot placement, handle orientation, protected-guide
route, and handle/inscription/blade visibility.

Museum artifacts are never execution targets. Every proposed contact task
requires a separately reviewed virtual proxy, collision/support review, and
runtime asset manifest. Static mesh details such as the telegraph lever, tin
lid/body relation, and opener blade are treated as fixed scan geometry. Tasks
do not imply telegraph signaling, vase capacity or contents, chair strength or
sitting safety, tin contents/seal/legibility, or opener sharpness/cutting.
Measurements remain in calibrated image pixels, and uncertain or occluded
features may remain unresolved.

Granularity review found no exact duplicates or task pair needing a split or
merge. It corrected one tin-orientation success condition: the static scan can
only preserve the source lid/body mesh relationship; it cannot establish that
the can is closed. No task presumes that physical closure can be tested.

Batch file: [reference_smithsonian_3d_artifacts_round1.json](../data/seeds/ycb_batches/reference_smithsonian_3d_artifacts_round1.json). Sources: the five linked object pages, the Smithsonian [Open Access FAQ](https://www.si.edu/openaccess/faq), and the [3D API](https://3d-api.si.edu/api-docs/).

At Round 4, the report remained at 467 YCB-primary tasks and showed 576 tasks
overall. Smithsonian records are external to the 77-object YCB coverage target.

## Poly Pizza household props round 1

`data/seeds/ycb_batches/reference_polypizza_household_props_round1.json` adds
five exact CreativeTrio model records and 20 proposed tasks, with one plan per
task. Poly Pizza marks each individual model [Public Domain
(CC0)](https://creativecommons.org/publicdomain/zero/1.0/) and supplies
downloadable FBX/GLTF formats. Its [Household Props 001 bundle page](https://poly.pizza/bundle/Household-Props-001-KsNBhP96PT)
lists these models and their CC0 status; creator attribution is optional.

| Model | Poly Pizza model ID | CC0 model page | GLB UUID | Bytes | Downloaded GLB SHA-256 |
| --- | --- | --- | --- | ---: | --- |
| Computer Mouse | `V2Ebx3pvo4` | [model page](https://poly.pizza/m/V2Ebx3pvo4) | `c0123ed1-38d1-4532-a711-3fccdc42fe25` | 16,280 | `75ed200f645b00c86ab4580aecf9d8c72af924e306c4c987bb8426e6d043b8ed` |
| Hair Dryer | `B5nWfdzHzO` | [model page](https://poly.pizza/m/B5nWfdzHzO) | `e406c510-e426-48d9-9e59-0f70f61445a1` | 43,084 | `f886eadb11ea5de74bc80931f9d8f4cc737b9a90fbf4577c9d10f8b87ff5ac9f` |
| Mailbox | `2olZ0G8iur` | [model page](https://poly.pizza/m/2olZ0G8iur) | `2077ee81-a657-45a1-9809-84890a3fdc34` | 25,264 | `cd8819e46fec234f1d0c68d3af92a4ec5ec4e607b06f91f6f9681e5eaf03a531` |
| Toolbox | `3ImQcIK0Gp` | [model page](https://poly.pizza/m/3ImQcIK0Gp) | `7c2b3946-0ee2-4626-b582-c280f1704dfc` | 18,656 | `7f0daa0eab14257aa6b6dac2e959289c5ce5b8fff88750b5644f97b6f29831fd` |
| Rubber Duck | `oH3dEdlDpB` | [model page](https://poly.pizza/m/oH3dEdlDpB) | `170c4be8-2462-4aa5-902f-5697b56a2fcd` | 56,764 | `edc81066f6ecfdbad45f32311228a2e3e00780360ff406bf12c49ca778126440` |

Each downloaded GLB is pinned to its direct `static.poly.pizza` URL and was
checked as GLB 2.0 with one static mesh, two nodes, one triangle-mode
primitive, and no animation or skin. The bundle records the mesh vertex/index counts, node
scale, raw local bounds, materials, file hash, and preview URL. These are
stylized low-poly models rather than scans or dimensional specifications;
their GLB scale has no declared physical unit. None provides task-ready
collision, mass, support, grasp, or robot configuration.

The four bounded tasks for each model use its visible geometry: mouse desk-bay
placement, nose/wheel alignment, pixel span, and button/wheel visibility;
hair-dryer handle support, nozzle-axis alignment, guarded gate passage, and
nozzle image measurement; mailbox post-sleeve placement, fixed-flag
orientation, post/body frame clearance, and face/flag/post visibility; toolbox
tray support, fixed-handle orientation, visible-mouth pixel measurement, and
handle/lid/interior-edge visibility; duck cradle support, bill orientation,
bill-to-eye pixel measurement, and eye/bill/tail visibility.

The source meshes are treated as static artwork. Contact proposals use
separately reviewed virtual proxies and require collision/support and
runtime-manifest review. They make no claim about mouse electronics or clicks,
dryer power/heat/airflow, mailbox operation or capacity, toolbox contents or
strength, or duck material, buoyancy, sound, or water safety. Image measurements
remain in pixels, and obscured features may remain unresolved.

Granularity review found no exact or near duplicates requiring split or merge;
task scopes differ by model landmarks, fixture contacts, route envelopes, and
recorded outcome. The low-poly source pages identify CC0 assets, but neither
the page nor the GLB establishes real-world dimensions or physical compatibility.

Batch file: [reference_polypizza_household_props_round1.json](../data/seeds/ycb_batches/reference_polypizza_household_props_round1.json). Sources: the five linked model pages, the [Household Props 001 bundle](https://poly.pizza/bundle/Household-Props-001-KsNBhP96PT), and the [CC0 legal code](https://creativecommons.org/publicdomain/zero/1.0/).

With Round 5 active, the report remains at 467 YCB-primary tasks and shows 596
tasks overall. Poly Pizza objects are external to the 77-object YCB coverage
target.

## Kenney Furniture Kit round 1

`reference_kenney_furniture_kit_round1.json` adds five exact GLB archive
members, one proposed staging scene, 20 templates, 20 tasks, and 85 claims.
The source is the official [Kenney Furniture Kit page](https://kenney.nl/assets/furniture-kit),
which labels the release `1.0 Released in 2018`; the included archive's
`License.txt` heading says `Furniture Kit (2.0)`. The batch records both labels
and pins the inspected ZIP by SHA-256
`e67652d0932cee41683f74711c03d3e192a2af9979ef8e6b237711f5482d46b0` rather than
asserting a normalized version. The page and bundled notice identify the pack
as [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/); the downloaded
`License.txt` also allows commercial use and says credit is optional. Its
SHA-256 is `bc0de1a0742cb490f9ed4bae0bd284286ebb27e23149b9917c7d8c0d590b8b29`.
License evidence is recorded at pack scope, with optional credit to Kenney.

| Model | Exact ZIP member | Bytes | Downloaded GLB SHA-256 |
| --- | --- | ---: | --- |
| Computer Keyboard | `Models/GLTF format/computerKeyboard.glb` | 3,476 | `9d9135789de2120e9f41ce3f0a56dd1b15f40adcc7888739bb842a2d820da322` |
| Books | `Models/GLTF format/books.glb` | 6,864 | `b8dc56e5d29f6fc1f4727fccb1b9642627fee9942c48060a00034e98df02701c` |
| Pillow | `Models/GLTF format/pillow.glb` | 5,044 | `6fae7c190d0b676ef3efd35e5178cef21dffb5c80e1257d8b537ad424da0e5f6` |
| Potted Plant | `Models/GLTF format/pottedPlant.glb` | 7,576 | `5b760eda2766f75fda36b2c5df652a1662f82981ef64cd8fa7fe7bcd386b3a15` |
| Kitchen Blender | `Models/GLTF format/kitchenBlender.glb` | 18,728 | `f471defb5b2b1cf3b949a1a8aaef0a8b727afe662b0815068cf4e963325a3c1f` |

The official ZIP was downloaded and reverified on 2026-10-04. Its archive hash,
all five member paths, byte counts, and GLB hashes match the batch metadata.
Each file parses as GLB 2.0 with no animation or skin; the assets contain one to
three meshes and do not declare physical units, real-world scale, collision,
mass, support, grasp, or articulation. The four tasks per model cover bounded
placement, feature orientation, calibrated image-space measurement, and
fixed-view visibility. The keyboard, book stack, pillow, potted plant, and
blender use their own mapped features and support/route conditions. These
proposals do not infer key function, separable or readable books, softness,
plant health or watering, or blender power and capacity.

The goal-specific Kenney batch contains 20 `atomic` tasks. Each task and its
matching template has exactly one goal predicate: one bounded placement,
orientation, calibrated pixel-measurement artifact, or visibility artifact.
Support/stability checks validate a placement or observation; mesh-preservation
checks protect source identity. They are not additional task goals. This
all-atomic batch follows the explicit Kenney objective and is a documented
exception to the general mixed-round ratio. Contact proposals still need
separately reviewed virtual proxies, fixtures, collision/support geometry, and
runtime manifests. The Kenney batch is external to the 77-object YCB coverage
target.
