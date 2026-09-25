# Task expansion coordination

This file is the shared work board for the two agents expanding the atlas
beyond the five YCB coverage rounds: **Claude** (Claude Code) and **Codex**.
Read it before starting a round and update your own rows when a round changes
state. Keep it short; details belong in each bundle's `draft_notes` and in
review files.

## Goal

Grow the atlas outward from YCB into as many everyday tasks as the sources
support. Prefer sources whose objects are **freely available 3D assets**, so a
proposed task can later be staged in simulation. Every record keeps the
existing contract: tasks are goals, procedures are optional, and suitability,
frequency, asset compatibility, and robot execution stay separate claims.

## Lanes

Each lane owns its bundles. Do not edit another lane's bundle; write a review
instead.

| Lane | Owner | Sources | Bundle prefix |
| --- | --- | --- | --- |
| A | Codex | YCB wrap-up (rounds, gripper assessment), BEHAVIOR-1K, RoboCasa / Objaverse, activity datasets already drafted (Charades, Ego4D, EPIC-KITCHENS, VirtualHome, time use, ICF, functional access) | `reference_*`, `ycb_*` |
| B | Claude | Google Scanned Objects (CC BY 4.0, 1,033 scanned household models), PartNet-Mobility / SAPIEN (articulated objects), then ReplicaCAD, HSSD, AI2-THOR | `gso_*`, `partnet_*`, `replicacad_*`, `hssd_*`, `thor_*` |

**Shared GSO rule.** Both lanes draw on Google Scanned Objects: Lane A through
the MuJoCo conversion (`asset_source: mujoco_scanned_objects`), Lane B through
Gazebo Fuel (`asset_source: google_scanned_objects`). Before drafting a GSO
model, search both lanes' bundles for the same model name case-insensitively
and do not create a second ObjectInstance for a model the other lane uses;
reference the existing object instead.

**Licences.** `data/research/free_3d_sources.md` compares candidate sources.
PartNet-Mobility and HSSD are non-commercial; AI2-THOR (Apache-2.0),
ReplicaCAD (CC BY 4.0), Poly Haven (CC0), and ABO (CC BY 4.0) are not.

**Source split from 2026-09-26.** Lane A has started ABO, Poly Haven, Kenney,
Poly Pizza, and Smithsonian 3D bundles, so those sources belong to Lane A.
Lane B takes ReplicaCAD (CC BY 4.0 apartment scenes) and new task contexts built
on objects already in the atlas: retail staff work, workshop, garden, and
assistive care (medication handling uses surrogates only). PartNet-Mobility
stays unclaimed until the user decides on its non-commercial licence.

Unclaimed backlog (claim a row here before starting): OmniObject3D, HOPE,
ABO (CC BY-NC, check terms first), Objaverse-XL categories not covered by
RoboCasa, Habitat Synthetic Scenes objects, ManiSkill assets.

## Round workflow

1. **Brainstorm.** Write candidates to `data/research/<source>_candidates.json`:
   source asset IDs, category, and one or more scene/goal ideas each. Target at
   least three candidates per task you plan to draft.
2. **Draft.** Write `data/drafts/<bundle>.json` with the usual `tasks`,
   `planning`, `claims`, `evidence`, and optional `external_objects`, `scenes`,
   `templates`. Set `generation_version` to the bundle name and `model` to the
   model that generated the record.
3. **Self-check.** Run `npm run check:draft -- data/drafts/<bundle>.json`. It
   validates the draft against the active seeds in a temporary copy and
   reports granularity counts and task names that repeat active tasks.
   Run `npm run report:similar -- --min 0.5 --only task_<prefix> data/drafts/<bundle>.json`
   to list near-duplicate goals; cross-link or drop anything that restates an
   active task.
4. **Request review.** Set the row in the tracker to `in review`.
5. **Review.** The other lane writes `data/reviews/<bundle>.md` (see below).
6. **Fix and activate.** The author addresses each finding, moves the bundle to
   `data/seeds/ycb_batches/`, updates `ycb_batches_manifest.json`, runs
   `npm run check`, and marks the row `active`.

A round may be activated without review only if the other lane has not
responded after the author has finished its next draft; mark it
`active (review pending)` and keep the review obligation.

## Round goals

When a source has no natural end, set a small goal and repeat it:

- One round is **20–24 tasks** from one source, one task per object unless a
  second task introduces a clearly different goal.
- At least one third of a round is `compound` or `workflow`.
- Every round reuses existing intents, skills, states, and object concepts
  where they fit, so new tasks connect to the graph instead of forming islands.
- A brainstorm pass produces at least 60 candidates before the first draft for
  a new source.

## Granularity rubric (for authors and reviewers)

| Granularity | Use when | Warning signs |
| --- | --- | --- |
| `atomic` | One object, one goal predicate change, a single uninterrupted motion sequence | Goal is only `located` or `grasped`; that is a skill, not a task |
| `compound` | Two to four goal predicates or two or more objects, still one sitting | Steps that only restate the skill list |
| `workflow` | Several stages with checkpoints, a reset between stages, or several destinations | Open-ended goals such as "tidy the house"; split them |

A reviewer also checks that a task is not a paraphrase of an existing goal
(search `/api/search` or the seed files), that the object identity matches the
cited asset, that fragile, sharp, hot, powered, or chemical items declare
setup conditions, and that no claim infers frequency or robot success.

## Review file format

`data/reviews/<bundle>.md`, one section per finding:

```
### <task id or record id>
- Verdict: accept | revise | reject
- Granularity: ok | should be atomic/compound/workflow
- Finding: one or two sentences
- Author response: (filled by the author)
```

## Git rules

Both agents share one repository and push to `origin/main`.

- Work in your own worktree or branch; rebase on `origin/main` before pushing.
- Stage explicit paths only. Never `git add -A`, `git reset --hard`, or
  `git checkout -- <file>` on files you did not write.
- Keep shared files (`ycb_batches_manifest.json`, validator, schemas, tests,
  `docs/`) in small separate commits so rebases stay easy.
- Never reintroduce links from the site pages to the source repository.

## Tracker

| Bundle | Lane | Tasks | Status | Reviewer |
| --- | --- | ---: | --- | --- |
| `gso_round1` | B | 24 (1 atomic, 18 compound, 5 workflow) | **active** — independent Claude review applied (`data/reviews/gso_round1.md`); Codex review pending | Codex |
| `gso_round2` | B | 24 (12 atomic, 10 compound, 2 workflow) | **active** — independent Claude review applied; Codex review pending | Codex |
| `gso_round3` | B | 24 (9 atomic, 10 compound, 5 workflow) | **active** — independent Claude review applied; Codex review pending | Codex |
| `thor_round2` | B | 24 (9 atomic, 11 compound, 4 workflow) | **active** — independent Claude review applied; Codex review pending | Codex |
| `gso_round4` | B | 23 (8 atomic, 9 compound, 6 workflow) | **active** — independent Claude review applied (1 rejected); Codex review pending | Codex |
| `thor_round3` | B | 23 (9 atomic, 9 compound, 5 workflow) | **active** — independent Claude review applied (1 rejected); Codex review pending | Codex |
| `reference_gso_round1` (MuJoCo-converted GSO, 8 models) | A | 25 | draft in main checkout, not yet committed | Claude |
| `thor_round1` (AI2-THOR / ProcTHOR, Apache-2.0) | B | 24 (10 atomic, 11 compound, 3 workflow) | **active** — independent Claude review applied; Codex review pending | Codex |
| Codex reference drafts in `data/drafts/` | A | see files | reviewed 2026-09-25: 4 revise, 2 time-use bundles not tasks, 7 already active (delete drafts); see `data/reviews/` | Claude |

## Status (paused 2026-09-25)

Lane B has 166 active tasks in seven reviewed rounds (`gso_round1`–`gso_round4`,
`thor_round1`–`thor_round3`); the atlas has 637 tasks. Next steps when work resumes:

1. Codex cross-lane review of the seven Lane B rounds (requested directly via
   `codex exec`); apply findings in place.
2. Lane A rebases its main checkout on `origin/main` (it is at `d083732`) and
   merges its uncommitted `skills.json`, manifest, and schema changes by keeping
   both sides.
3. Household GSO/THOR tasks are close to saturation (round-4 reviews rejected
   restated tasks). Lane B's next rounds move to new contexts (retail staff,
   workshop, garden, assistive care) and new sources (ReplicaCAD, ABO, Poly
   Haven); PartNet-Mobility awaits a licence decision.
4. Deploy the Worker once the user approves.

## Messages

Append-only notes between lanes; newest last. Claude reaches Codex with
`codex queue`/`codex exec`; Codex replies here (commit to `origin/main`).

- 2026-09-26 Claude → Codex: resumed. Please rebase on `origin/main`, commit
  your seven source bundles, and add tracker rows so Claude can review them.
  Codex's review of Lane B is saved in `data/reviews/codex_lane_b_review.md`;
  Claude will apply it this cycle.

