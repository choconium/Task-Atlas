# Catalog-wide YCB task proposals

The coverage target is every YCB `ObjectInstance` with a `ycb_id` in the shared object registry, including separately listed parts and variants. External objects such as BEHAVIOR assets can anchor their own tasks, but do not enter YCB catalog coverage. This is coverage of the repository catalog, not a claim that every YCB release or downloadable asset is represented.

Catalog-wide proposals are stored in `data/seeds/ycb_batches/`. Each JSON bundle contains `tasks`, `planning`, and `claims`, with optional `scenes`, `templates`, `external_objects`, and `evidence`. The runtime and validator share the same sorted bundle loader. External objects and evidence merge into the shared registries but remain outside YCB coverage unless an object carries a YCB ID. Existing mustard seeds and its three expansion loops remain separate.

## First coverage round

| Bundle | Catalog range | New tasks |
| --- | --- | ---: |
| Food | 001–018 | 18 |
| Kitchen | 019–034 | 16 |
| Tools | 035–052 | 18 |
| Shapes and task objects | 053–077 | 25 |

The first round covers all 77 catalog records. Parts such as pitcher lids and box lids have their own tasks; both catalog rope instances remain distinct. Each new task has one planning record and four claim records. Earlier mustard tasks are retained separately.

Examples include matching a lid to its container, grouping fasteners, preparing table settings, organizing construction pieces, and recovering an object into a defined collection area. Review corrected detached-lid fitting, table-cloth use, recovery end states, and undeclared template roles before accepting the batch.

## Generation and review

The second round adds another distinct goal for every catalog object: 77 additional
tasks, plans, and sets of four claims in the `*_round2.json` bundles. Across both
rounds this is 154 new proposed tasks; together with the 68 existing mustard tasks,
the first two rounds brought the atlas to 222 task definitions. These are collection proposals, not
demonstrations or measured successes.

The second round emphasizes inspection, alignment, assembly preparation, and
object-specific interactions: seating screwdriver tips, fitting a peg into a
checked hole, routing a rope, reading a timer, connecting compatible Duplo pieces,
and checking kitchen surfaces or packaging. Repeated goals across rounds are
rejected by the coverage test.

The third round adds 77 tasks in `*_round3.json`, bringing the catalog-wide
expansion to 231 proposals and the atlas to 299 task definitions, 299 planning
records, and 1,197 claim records. It focuses on multi-object preparation,
interrupted-work recovery, and closeout. Examples include recovering a bolt and
nut from an assembly fixture, preparing a pitcher-and-mug transfer, securing a
rope with a clamp, and clearing a place setting into separate destinations.

Every third-round task declares at least one other catalog object as an actual
required resource. Those links supplement shared scenes, intents, templates, and
skills; they do not impose a task order. Packing tasks require collection-time
fit checks, and catalog identity alone never establishes container capacity or
functional compatibility. Unconfirmed prerequisites keep tasks out of the
fully declared ready state.

The generation brief assigns disjoint object groups to `gpt-5.6-luna` workers with `max` reasoning effort. Each worker reads the historical handoff and current foundation contract, then proposes an object-specific goal with observable initial and success conditions. Records include English and Japanese names, required objects and capabilities, setup, reset, quality checks, failure modes, and unmeasured time estimates. A later round must introduce a different goal or context for the object, not merely paraphrase its first task.

Review checks object identity, reference validity, goal specificity, explicit prerequisites, collection reset, and concept-level connections. Fragile objects, sharp tools, powered tools, chemicals, and food replicas need appropriate declared setup conditions; a catalog model does not establish functional or material behavior. Procedures are optional, and skill lists are unordered capability inventories.

All new tasks remain `proposed`. The `evidence_ycb_task_design` source supports proposed design suitability only. Population frequency, robot execution, and asset compatibility remain separate unknown claims. No success rates, frequency rankings, or collection durations are inferred.

## Fourth coverage round

The fourth round adds 77 proposed tasks, covering every catalog object again. The atlas now contains 376 tasks, 376 planning records, and 1,505 claims. All objects remain connected through shared graph concepts; 39 fourth-round tasks also declare other catalog objects as required resources, with 47 explicit catalog dependencies.

New examples include weighing a closed mustard bottle on a tared scale, counting three cool surrogate pieces from a bowl to a plate, selecting a close-fitting cup for a baseball, and removing a price sticker from a sealed pudding box. These introduce object-specific goals and contexts for the covered records while remaining proposed collection designs.

Round 4 keeps task-suitability claims proposed and population-frequency, robot-execution, and asset-compatibility claims unknown. Catalog metadata, the design source, and shared graph connections do not establish human frequency, robot success, or asset compatibility.

Plans declare required catalog objects when an interaction needs them and may include collection fixtures. Those links are explicit collection prerequisites; shared scenes, intents, templates, skills, and resource edges continue to provide graph connectivity. They do not establish that every Round 4 task is a catalog-partner activity or that any such relationship was measured.

## Fifth coverage round

Round 5 adds 77 proposed tasks, one for each of the 77 catalog entries. Each task
has one planning record and four claim records, for 77 new tasks, 77 plans, and
308 claims. With Round 5 active, the five YCB coverage rounds and the original
mustard slice account for 453 tasks, 453 planning records, and 1,813 claims in the
YCB task series. Cross-source tasks anchored to YCB objects may appear in object
rows and `task_count` without entering the five coverage-round totals.

Round 5 task-suitability claims remain `proposed`; population-frequency,
robot-execution, and asset-compatibility claims remain `unknown`. All Round 5
time estimates are null until measured. Activating the bundles makes these
proposed designs available to the runtime and coverage report; it does not
establish physical feasibility or demonstrate robot execution.

## Graph connections

Tasks share scene, intent, skill, and template nodes. This supports paths such as object → task → intent → another task → another object, without imposing one hierarchy or claiming that tasks must occur in sequence. Graph neighborhoods support reverse traversal. The coverage regression checks connectivity using these concepts, excluding shared sources and claims so that provenance alone cannot make the graph appear connected.

Required objects also connect directly through `requires_resource` edges in the context lens. A lid-fitting task can connect its lid to the matching container. Additional fixtures such as trays and work surfaces appear as `resource:<id>` nodes, with reverse links to the tasks requiring them. These are declared collection resources, not additions to the YCB catalog.

## Validation

Run `npm run check` to validate references, schemas, planning, claims, catalog coverage, graph navigation, and collection-card access. Counts indicate catalog coverage only; they are not evidence of collected demonstrations or successful robot execution.

Run `npm run coverage:ycb` for a machine-readable inventory of each YCB object, its task IDs and titles, scenes, intents, and generation rounds. `task_count` and each object's task list include every task whose primary `object_id` resolves to a YCB object; `all_task_count` reports all task instances across all primary object types. `generation_rounds`, each object's `rounds` field, and `round_summary` include only the five `ycb_coverage_roundN` series. A cross-source task anchored to a YCB object remains visible in that object's task list and primary task count without being mistaken for a YCB coverage round. The report exits with a nonzero status if any YCB object has no task.

The report also lists `required_catalog_objects` for each task and summarizes
cross-object dependencies by round. These are explicit collection prerequisites
from planning records. Shared scene/skill links and fixture resources are not
counted as catalog-partner edges, and edge counts do not measure task quality.
