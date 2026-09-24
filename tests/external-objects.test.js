const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { createStore } = require("../backend/app/store");
const { parseContext } = require("../backend/app/assessment");
const { buildReport } = require("../scripts/report_ycb_coverage");
const { defaultData, validateData } = require("../scripts/validate_seed_data");

const ROOT = path.resolve(__dirname, "..");
const SEED_DIR = path.join(ROOT, "data", "seeds");

function behaviorObject(id, sourceId, categoryId, synsetId, parentSynsetIds = []) {
  return {
    id,
    node_type: "ObjectInstance",
    canonical_name: categoryId,
    name_en: categoryId,
    name_ja: categoryId,
    category: "food",
    general_concept_id: `object_${categoryId}`,
    affordances: ["graspable"],
    review_status: "proposed",
    asset_source: "behavior",
    asset_source_version: "BEHAVIOR-1K-test-fixture",
    asset_source_id: sourceId,
    asset_source_url: `https://behavior.stanford.edu/behavior_components/${sourceId}`,
    source_taxonomy_url: `https://behavior.stanford.edu/behavior_components/${synsetId}`,
    asset_ready_in_source: true,
    source_taxonomy: {
      source: "behavior",
      category_id: categoryId,
      synset_id: synsetId,
      parent_synset_ids: parentSynsetIds,
    },
  };
}

function makeBundleTask(data, objectId) {
  const original = data.tasks.find((task) => task.id === "task_apply_mustard_hotdog");
  const originalPlan = data.planning.find((plan) => plan.task_id === original.id);
  const task = {
    ...structuredClone(original),
    id: "task_behavior_asset_apple_probe",
    name_en: "Place the BEHAVIOR apple in a tray",
    name_ja: "BEHAVIORのリンゴをトレイに置く",
    object_id: objectId,
    generation_version: "behavior_reference_round1",
    initial_state: [`on_top_of(${objectId}, kitchen_counter)`],
    goal_state: [`inside(${objectId}, ycb_068_clear_box)`],
    bindings: { object: objectId, container: "ycb_068_clear_box" },
  };
  const planning = {
    ...structuredClone(originalPlan),
    id: "planning_behavior_asset_apple_probe",
    task_id: task.id,
    requirements: [
      { key: "object", value: objectId, reason: "The BEHAVIOR apple is the primary task object." },
      { key: "object", value: "ycb_068_clear_box", reason: "The YCB box is a required collection resource." },
    ],
    procedures: [],
  };
  return { task, planning };
}

function makeTaskClaims(taskId, evidenceId) {
  const claimPrefix = `claim_${taskId.replace(/^task_/, "")}`;
  return [
    {
      id: `${claimPrefix}_task_suitability`,
      subject_id: taskId,
      claim_type: "task_suitability",
      statement: "This is a proposed collection-design candidate.",
      status: "proposed",
      value: null,
      unit: null,
      source_ids: [evidenceId],
      scope: "A synthetic fixture for external-object integration coverage.",
      limitations: "The fixture is not an observed task or execution result.",
    },
    ...[
      ["population_frequency", "Population frequency is unknown."],
      ["robot_execution", "Robot execution is unknown."],
      ["asset_compatibility", "Asset compatibility is unknown."],
    ].map(([claimType, statement]) => ({
      id: `${claimPrefix}_${claimType}`,
      subject_id: taskId,
      claim_type: claimType,
      statement,
      status: "unknown",
      value: null,
      unit: null,
      source_ids: [],
      scope: "No corresponding empirical source is attached.",
      limitations: "No frequency, execution, or asset-compatibility result is claimed.",
    })),
  ];
}

function withBehaviorBundle(callback) {
  const seedDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "task-atlas-behavior-assets-"));
  try {
    fs.cpSync(SEED_DIR, seedDirectory, { recursive: true });
    const base = defaultData();
    const apple = behaviorObject(
      "behavior_asset_apple_probe",
      "test_apple.n.01",
      "apple",
      "apple.n.01",
      ["edible_fruit.n.01", "pome.n.01"],
    );
    const zucchini = behaviorObject(
      "behavior_asset_zucchini_probe",
      "test_zucchini.n.01",
      "zucchini",
      "zucchini.n.01",
      ["edible_vegetable.n.01"],
    );
    zucchini.asset_ready_in_source = false;
    const { task, planning } = makeBundleTask(base, apple.id);
    const evidence = {
      id: "evidence_behavior_asset_task_design_probe",
      source_name: "BEHAVIOR task design fixture",
      source_type: "design_seed",
      supported_claim_types: ["task_suitability"],
      source_version: "fixture",
      source_locator: "https://behavior.stanford.edu/behavior_components/behavior_knowledgebase.html",
      observed_count: null,
      scope: "A synthetic fixture used to test bundle evidence loading.",
      limitations: "It does not represent a real BEHAVIOR task mapping.",
      reviewer: null,
      reviewed_at: null,
      notes: "Test-only evidence record.",
    };
    const robocasaTask = {
      ...structuredClone(task),
      id: "task_reference_robocasa_probe_test",
      name_en: "Prepare a YCB mug with an unresolved RoboCasa fixture",
      name_ja: "未解決のRoboCasa備品を使ってYCBマグを準備する",
      object_id: "ycb_025_mug",
      generation_version: "reference_robocasa_probe_test",
      initial_state: ["on_top_of(ycb_025_mug, kitchen_counter)"],
      goal_state: ["inside(ycb_025_mug, robocasa_mug_fixture_probe)"],
      bindings: { object: "ycb_025_mug", fixture: "robocasa_mug_fixture_probe" },
    };
    const robocasaPlanning = {
      ...structuredClone(planning),
      id: "planning_reference_robocasa_probe_test",
      task_id: robocasaTask.id,
      requirements: [
        { key: "object", value: "ycb_025_mug", reason: "The mug is the primary YCB object." },
        { key: "object", value: "robocasa_mug_fixture_probe", reason: "This external fixture has not been confirmed in the scene." },
      ],
    };
    const bundle = {
      external_objects: [zucchini, apple],
      evidence: [evidence],
      tasks: [task, robocasaTask],
      planning: [planning, robocasaPlanning],
      claims: [
        ...makeTaskClaims(task.id, evidence.id),
        ...makeTaskClaims(robocasaTask.id, evidence.id),
      ],
    };
    fs.writeFileSync(
      path.join(seedDirectory, "ycb_batches", "zz_behavior_external_test.json"),
      `${JSON.stringify(bundle, null, 2)}\n`,
    );
    callback(seedDirectory, { apple, zucchini, task, evidence, robocasaTask });
  } finally {
    fs.rmSync(seedDirectory, { recursive: true, force: true });
  }
}

test("object validation accepts one external identity and rejects missing or mixed YCB identity", () => {
  const data = defaultData();
  const validExternal = behaviorObject(
    "behavior_asset_identity_probe",
    "apple.n.01",
    "apple",
    "apple.n.01",
    ["edible_fruit.n.01"],
  );
  const validResult = validateData({
    ...data,
    objects: [...data.objects, validExternal],
  });
  assert.equal(validResult.valid, true, validResult.errors.join("\n"));

  const missingIdentity = { ...validExternal, id: "behavior_asset_missing_identity" };
  delete missingIdentity.asset_source;
  delete missingIdentity.asset_source_version;
  delete missingIdentity.asset_source_id;
  delete missingIdentity.asset_source_url;
  delete missingIdentity.source_taxonomy_url;
  delete missingIdentity.asset_ready_in_source;
  delete missingIdentity.source_taxonomy;
  const missingResult = validateData({
    ...data,
    objects: [...data.objects, missingIdentity],
  });
  assert.ok(missingResult.errors.some((error) => error.includes("exactly one of ycb_id or external asset identity")));

  const mixedIdentity = { ...validExternal, id: "behavior_asset_mixed_identity", ycb_id: "001_fake_ycb_id" };
  const mixedResult = validateData({
    ...data,
    objects: [...data.objects, mixedIdentity],
  });
  assert.ok(mixedResult.errors.some((error) => error.includes("exactly one of ycb_id or external asset identity")));

  const invalidSourceMetadata = {
    ...validExternal,
    id: "behavior_asset_invalid_metadata",
    asset_ready_in_source: "ready",
    source_taxonomy_url: "not-a-url",
  };
  const invalidMetadataResult = validateData({
    ...data,
    objects: [...data.objects, invalidSourceMetadata],
  });
  assert.ok(invalidMetadataResult.errors.some((error) => error.includes("asset_ready_in_source: expected boolean")));
  assert.ok(invalidMetadataResult.errors.some((error) => error.includes("source_taxonomy_url: invalid format")));
});

test("bundle external objects and evidence resolve through tasks and graph without changing YCB coverage", () => {
  withBehaviorBundle((seedDirectory, { apple, zucchini, task, evidence, robocasaTask }) => {
    const data = defaultData(seedDirectory);
    assert.ok(data.objects.some((object) => object.id === apple.id));
    assert.ok(data.evidence.some((source) => source.id === evidence.id));
    const validation = validateData(data);
    assert.equal(validation.valid, true, validation.errors.join("\n"));

    const ycbOnlyData = structuredClone(data);
    ycbOnlyData.tasks = ycbOnlyData.tasks.filter((candidate) => candidate.id !== task.id);
    ycbOnlyData.planning = ycbOnlyData.planning.filter((plan) => plan.task_id !== task.id);
    ycbOnlyData.claims = ycbOnlyData.claims.filter((claim) => claim.subject_id !== task.id);
    const beforeExternalCoverage = buildReport(ycbOnlyData);
    const coverage = buildReport(data);
    const withoutAllTaskCount = ({ all_task_count, ...report }) => report;
    assert.deepEqual(withoutAllTaskCount(coverage), withoutAllTaskCount(beforeExternalCoverage));
    assert.equal(coverage.all_task_count, beforeExternalCoverage.all_task_count + 1);
    assert.deepEqual(coverage.generation_rounds, [
      "ycb_coverage_round1",
      "ycb_coverage_round2",
      "ycb_coverage_round3",
      "ycb_coverage_round4",
      "ycb_coverage_round5",
    ]);
    const mugRow = coverage.objects.find((row) => row.object_id === "ycb_025_mug");
    assert.ok(mugRow.tasks.some((row) => row.id === robocasaTask.id));
    assert.equal(mugRow.rounds.reference_robocasa_probe_test, undefined);

    const store = createStore({ seedDirectory });
    assert.equal(store.getObject(apple.id).asset_source_id, apple.asset_source_id);
    assert.deepEqual(
      store.listObjects("behavior")
        .map((object) => object.asset_source_id)
        .filter((assetId) => assetId.startsWith("test_")),
      ["test_apple.n.01", "test_zucchini.n.01"],
    );
    const detail = store.getTaskDetail(task.id, parseContext(new URLSearchParams()));
    assert.equal(detail.object.id, apple.id);
    assert.ok(detail.evidence.some((source) => source.id === evidence.id));
    assert.notEqual(detail.assessment.status, "ready");
    assert.equal(detail.assessment.execution_status, "unverified");

    const taskGraph = store.neighbors(task.id, "all", parseContext(new URLSearchParams()));
    assert.ok(taskGraph.edges.some((edge) => edge.source === task.id && edge.target === apple.id && edge.relation === "acts_on"));
    const objectGraph = store.neighbors(apple.id, "all", parseContext(new URLSearchParams()));
    assert.ok(objectGraph.nodes.some((node) => node.id === "concept:object_apple" && node.node_type === "ObjectClass"));
    assert.ok(objectGraph.edges.some((edge) => edge.source === apple.id && edge.target === "concept:object_apple" && edge.relation === "instance_of"));
    const taskToObject = taskGraph.edges.find((edge) => edge.source === task.id && edge.target === apple.id && edge.relation === "acts_on");
    const objectToConcept = objectGraph.edges.find((edge) => edge.source === apple.id && edge.target === "concept:object_apple" && edge.relation === "instance_of");
    assert.deepEqual(
      [taskToObject?.source, taskToObject?.target, taskToObject?.relation, objectToConcept?.source, objectToConcept?.target, objectToConcept?.relation],
      [task.id, apple.id, "acts_on", apple.id, "concept:object_apple", "instance_of"],
    );

    const robocasaDetail = store.getTaskDetail(robocasaTask.id, parseContext(new URLSearchParams()));
    assert.equal(robocasaDetail.object.id, "ycb_025_mug");
    assert.equal(store.maps.objects.has("robocasa_mug_fixture_probe"), false);
    assert.ok(robocasaDetail.assessment.reasons.some((reason) =>
      reason.kind === "unknown" &&
      reason.key === "object" &&
      reason.value.includes("robocasa_mug_fixture_probe"),
    ));
    const robocasaCard = store.collectionCard(robocasaTask.id, parseContext(new URLSearchParams()));
    assert.equal(robocasaCard.provenance.task_seed, "ycb_batches/");
    assert.ok(robocasaCard.unresolved_requirements.some((reason) =>
      reason.key === "object" && reason.value.includes("robocasa_mug_fixture_probe"),
    ));
  });
});

test("activity datasets and surveys support only their scoped claim types", () => {
  const data = defaultData();
  const source = (id, sourceType, supportedClaimTypes) => ({
    id,
    source_name: "Claim-source policy fixture",
    source_type: sourceType,
    supported_claim_types: supportedClaimTypes,
    source_version: "fixture",
    source_locator: "https://example.invalid/source",
    observed_count: null,
    scope: "A test of source-to-claim policy.",
    limitations: "This fixture supports only the listed claim types.",
    reviewer: null,
    reviewed_at: null,
    notes: "Test-only source.",
  });
  const accepted = {
    ...data,
    evidence: [
      ...data.evidence,
      source("evidence_activity_dataset_test", "dataset", ["task_suitability"]),
      source("evidence_activity_survey_test", "survey", ["population_frequency"]),
    ],
  };
  const acceptedResult = validateData(accepted);
  assert.equal(acceptedResult.valid, true, acceptedResult.errors.join("\n"));

  const datasetAsPrevalence = structuredClone(accepted);
  datasetAsPrevalence.evidence.find((item) => item.id === "evidence_activity_dataset_test").supported_claim_types.push("population_frequency");
  const datasetResult = validateData(datasetAsPrevalence);
  assert.ok(datasetResult.errors.some((error) => error.includes("evidence_activity_dataset_test: cannot support population_frequency")));

  const surveyAsExecution = structuredClone(accepted);
  surveyAsExecution.evidence.find((item) => item.id === "evidence_activity_survey_test").supported_claim_types.push("robot_execution", "asset_compatibility");
  const surveyResult = validateData(surveyAsExecution);
  assert.ok(surveyResult.errors.some((error) => error.includes("evidence_activity_survey_test: cannot support robot_execution")));
  assert.ok(surveyResult.errors.some((error) => error.includes("evidence_activity_survey_test: cannot support asset_compatibility")));
});
