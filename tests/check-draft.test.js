const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { checkDrafts } = require("../scripts/check_draft");

const ACTIVE_BUNDLE = path.join(__dirname, "..", "data", "seeds", "ycb_batches", "reference_behavior_round1.json");

test("draft checker validates a bundle against active seeds and reports broken references", () => {
  const passing = checkDrafts([ACTIVE_BUNDLE]);
  assert.deepEqual(passing.errors, []);
  assert.equal(passing.drafted, 2);

  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "task-atlas-draft-test-"));
  try {
    const bundle = JSON.parse(fs.readFileSync(ACTIVE_BUNDLE, "utf8"));
    bundle.tasks[0].scene_id = "scene_does_not_exist";
    const broken = path.join(scratch, "reference_behavior_round1.json");
    fs.writeFileSync(broken, JSON.stringify(bundle));
    const failing = checkDrafts([broken]);
    assert.ok(failing.errors.some((error) => error.includes("scene_does_not_exist")));

    const unidentified = JSON.parse(fs.readFileSync(ACTIVE_BUNDLE, "utf8"));
    unidentified.claims = unidentified.claims.filter((claim) => claim.claim_type !== "catalog_identity");
    const missing = path.join(scratch, "unidentified.json");
    fs.writeFileSync(missing, JSON.stringify(unidentified));
    assert.ok(checkDrafts([missing]).errors.some((error) => error.includes("missing catalog_identity claim")));
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
});
