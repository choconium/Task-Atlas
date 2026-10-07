const test = require("node:test");
const assert = require("node:assert/strict");
const { modelLinks, httpUrl } = require("../frontend/asset-downloads");

const PRIMARY_KINDS = ["direct_model", "archive", "model_page", "asset_collection"];

function kinds(result) {
  return result.links.map((link) => link.kind);
}

function linkOfKind(result, kind) {
  return result.links.find((link) => link.kind === kind) || null;
}

test("httpUrl accepts only http(s) URLs", () => {
  assert.equal(httpUrl("https://example.com/a b"), "https://example.com/a%20b");
  assert.equal(httpUrl("http://example.com"), "http://example.com/");
  assert.equal(httpUrl("javascript:alert(1)"), null);
  assert.equal(httpUrl("ftp://example.com/model.glb"), null);
  assert.equal(httpUrl("not a url"), null);
  assert.equal(httpUrl(null), null);
  assert.equal(httpUrl(42), null);
});

test("YCB object with a published archive gets the Berkeley meshes tarball", () => {
  const result = modelLinks({ asset_source: "ycb", ycb_id: "025_mug" });
  assert.deepEqual(result.links, [
    { url: "https://ycb-benchmarks.s3.amazonaws.com/data/berkeley/025_mug/025_mug_berkeley_meshes.tgz", kind: "archive" },
    { url: "https://ycb-benchmarks.s3.amazonaws.com/index.html", kind: "catalog" },
  ]);
  assert.equal(result.available, true);
  assert.deepEqual(result.notes, []);
  assert.deepEqual(result.license, { text: "CC BY 4.0", url: "https://creativecommons.org/licenses/by/4.0/" });
  assert.deepEqual(result.dependencies, []);
  assert.equal(result.member, null);
});

test("YCB ids verified against S3 (023, 046, 047) now resolve to archives", () => {
  for (const id of ["023_wine_glass", "046_plastic_bolt", "047_plastic_nut"]) {
    const result = modelLinks({ asset_source: "ycb", ycb_id: id });
    assert.equal(
      linkOfKind(result, "archive")?.url,
      `https://ycb-benchmarks.s3.amazonaws.com/data/berkeley/${id}/${id}_berkeley_meshes.tgz`,
      id,
    );
    assert.equal(result.available, true, id);
    assert.ok(!result.notes.includes("catalog_lookup"), id);
  }
});

test("YCB object without an archive falls back to the catalogue with a lookup note", () => {
  for (const id of ["020_pitcher_lid", "034_table_cloth", "065_cups", "073_lego_duplo"]) {
    const result = modelLinks({ asset_source: "ycb", ycb_id: id });
    assert.deepEqual(result.links, [{ url: "https://ycb-benchmarks.s3.amazonaws.com/index.html", kind: "catalog" }], id);
    assert.equal(result.available, false, id);
    assert.deepEqual(result.notes, ["catalog_lookup"], id);
  }
});

test("039_keys maps to the singular 039_key archive folder", () => {
  const result = modelLinks({ asset_source: "ycb", ycb_id: "039_keys" });
  assert.equal(
    linkOfKind(result, "archive")?.url,
    "https://ycb-benchmarks.s3.amazonaws.com/data/berkeley/039_key/039_key_berkeley_meshes.tgz",
  );
  assert.equal(result.available, true);
});

test("legacy YCB rows without asset_source but with ycb_id are treated as YCB", () => {
  const result = modelLinks({ ycb_id: "003_cracker_box" });
  assert.equal(linkOfKind(result, "archive")?.url.endsWith("/003_cracker_box_berkeley_meshes.tgz"), true);
});

test("Google Scanned Objects get the Fuel zip archive plus the model page", () => {
  const name = "Brisk_Iced_Tea_Lemon_12_12_fl_oz_355_ml_cans_144_fl_oz_426_lt";
  const result = modelLinks({
    asset_source: "google_scanned_objects",
    asset_source_id: name,
    asset_source_url: `https://app.gazebosim.org/GoogleResearch/fuel/models/${name}`,
    asset_metadata: { asset_license: "CC BY 4.0", license_url: "https://creativecommons.org/licenses/by/4.0/" },
  });
  assert.deepEqual(result.links, [
    { url: `https://app.gazebosim.org/GoogleResearch/fuel/models/${name}`, kind: "model_page" },
    { url: `https://fuel.gazebosim.org/1.0/GoogleResearch/models/${name}.zip`, kind: "archive" },
  ]);
  assert.equal(result.available, true);
  assert.ok(!result.notes.includes("source_only"));
  assert.deepEqual(result.license, { text: "CC BY 4.0", url: "https://creativecommons.org/licenses/by/4.0/" });
});

test("Google Scanned Objects archive name is URL-encoded", () => {
  const result = modelLinks({
    asset_source: "google_scanned_objects",
    asset_source_id: "Odd Name #1&2",
    asset_source_url: "https://app.gazebosim.org/GoogleResearch/fuel/models/Odd_Name",
  });
  assert.equal(
    linkOfKind(result, "archive")?.url,
    "https://fuel.gazebosim.org/1.0/GoogleResearch/models/Odd%20Name%20%231%262.zip",
  );
});

test("Google Scanned Objects without an asset_source_id only get the model page", () => {
  const result = modelLinks({
    asset_source: "google_scanned_objects",
    asset_source_url: "https://app.gazebosim.org/GoogleResearch/fuel/models/Something",
  });
  assert.deepEqual(kinds(result), ["model_page"]);
  assert.equal(result.available, true);
});

test("ReplicaCAD urdf blob links to the urdf folder on Hugging Face", () => {
  const root = "https://huggingface.co/datasets/ai-habitat/ReplicaCAD_dataset";
  const rev = "3e8c7fe5759f64bfcbc3882f9cdf6de97f82a06d";
  const result = modelLinks({
    asset_source: "replicacad",
    asset_source_url: `${root}/blob/${rev}/urdf/kitchen_counter/kitchenCounter.urdf`,
  });
  assert.deepEqual(result.links, [
    { url: `${root}/blob/${rev}/urdf/kitchen_counter/kitchenCounter.urdf`, kind: "source_file" },
    { url: `${root}/tree/${rev}/urdf/kitchen_counter`, kind: "asset_collection" },
  ]);
  assert.equal(result.available, true);
  assert.deepEqual(result.notes, ["simulator_assets"]);
});

test("ReplicaCAD object config links to its containing configs/objects folder, not the repo root", () => {
  const root = "https://huggingface.co/datasets/ai-habitat/ReplicaCAD_dataset";
  const rev = "3e8c7fe5759f64bfcbc3882f9cdf6de97f82a06d";
  const result = modelLinks({
    asset_source: "replicacad",
    asset_source_url: `${root}/blob/${rev}/configs/objects/frl_apartment_clock.object_config.json`,
  });
  assert.deepEqual(result.links, [
    { url: `${root}/blob/${rev}/configs/objects/frl_apartment_clock.object_config.json`, kind: "source_page" },
    { url: `${root}/tree/${rev}/configs/objects`, kind: "asset_collection" },
  ]);
  assert.equal(result.available, true);
  assert.deepEqual(result.notes, ["simulator_assets"]);
});

test("ReplicaCAD file at the dataset root resolves to the root tree", () => {
  const root = "https://huggingface.co/datasets/ai-habitat/ReplicaCAD_dataset";
  const result = modelLinks({ asset_source: "replicacad", asset_source_url: `${root}/blob/main/README.md` });
  assert.equal(linkOfKind(result, "asset_collection")?.url, `${root}/tree/main`);
});

test("AI2-THOR shared asset database is a source page with a thor_database note", () => {
  const database = "https://raw.githubusercontent.com/allenai/procthor/d4c4c6a9fdd9679c8b9343d771c510016cd310df/procthor/databases/asset-database.json";
  const result = modelLinks({
    asset_source: "ai2thor_procthor",
    asset_source_id: "Fridge_1",
    asset_source_url: database,
    asset_metadata: { asset_license: "Apache-2.0" },
  });
  assert.deepEqual(result.links, [{ url: database, kind: "source_page" }]);
  assert.equal(result.available, false);
  assert.deepEqual(result.notes, ["thor_database", "source_only"]);
  assert.deepEqual(result.license, { text: "Apache-2.0", url: null });
});

test(".json source URLs are never classified as asset source files", () => {
  const result = modelLinks({
    asset_source: "some_dataset",
    asset_source_url: "https://example.com/catalog/manifest.json?v=2",
  });
  assert.deepEqual(result.links, [{ url: "https://example.com/catalog/manifest.json?v=2", kind: "source_page" }]);
  assert.deepEqual(result.notes, ["source_only"]);
});

test("mujoco_scanned_objects model.xml links to the GitHub model folder", () => {
  const repo = "https://github.com/kevinzakka/mujoco_scanned_objects";
  const rev = "6ff8d275cebfd5b47e49685e3cfbe64b20e49a3c";
  const result = modelLinks({
    asset_source: "mujoco_scanned_objects",
    asset_source_url: `${repo}/blob/${rev}/models/ACE_Coffee_Mug_Kristen_16_oz_cup/model.xml`,
  });
  assert.deepEqual(result.links, [
    { url: `${repo}/blob/${rev}/models/ACE_Coffee_Mug_Kristen_16_oz_cup/model.xml`, kind: "source_file" },
    { url: `${repo}/tree/${rev}/models/ACE_Coffee_Mug_Kristen_16_oz_cup`, kind: "model_page" },
  ]);
  assert.equal(result.available, true);
  assert.deepEqual(result.notes, ["simulator_assets"]);
});

test("robocasa model.xml nested deep in the repo also links to its folder", () => {
  const repo = "https://github.com/robocasa/robocasa";
  const rev = "4f8a2980def75a55dff96b990745b83540425f09";
  const folder = "robocasa/models/assets/fixtures/accessories/light_switches/white_wide_switch";
  const result = modelLinks({
    asset_source: "robocasa",
    asset_source_id: `${folder}/model.xml`,
    asset_source_url: `${repo}/blob/${rev}/${folder}/model.xml`,
  });
  assert.deepEqual(result.links, [
    { url: `${repo}/blob/${rev}/${folder}/model.xml`, kind: "source_file" },
    { url: `${repo}/tree/${rev}/${folder}`, kind: "model_page" },
  ]);
  assert.equal(result.available, true);
  assert.deepEqual(result.notes, ["simulator_assets"]);
  assert.ok(!result.notes.includes("source_only"));
});

test("GitHub tree links that are not blobs do not produce a folder link", () => {
  const result = modelLinks({
    asset_source: "robocasa",
    asset_source_url: "https://github.com/robocasa/robocasa/tree/main/robocasa/models",
  });
  assert.deepEqual(kinds(result), ["source_page"]);
  assert.deepEqual(result.notes, ["simulator_assets", "source_only"]);
});

test("license with a URL but no text falls back to the URL host", () => {
  const result = modelLinks({
    asset_source: "poly_haven",
    asset_metadata: {
      official_glTF_url: "https://example.com/models/chair.gltf",
      license_url: "https://polyhaven.com/license",
    },
  });
  assert.deepEqual(result.license, { text: "polyhaven.com", url: "https://polyhaven.com/license" });
});

test("license with text only keeps a null URL; no license yields null", () => {
  assert.deepEqual(
    modelLinks({ asset_source: "x", asset_metadata: { media_license: "CC0" } }).license,
    { text: "CC0", url: null },
  );
  assert.equal(modelLinks({ asset_source: "x", asset_metadata: {} }).license, null);
  assert.equal(modelLinks({ asset_source: "x" }).license, null);
});

test("non-http URLs are dropped everywhere", () => {
  const result = modelLinks({
    asset_source: "kenney",
    asset_source_url: "javascript:alert(1)",
    asset_metadata: {
      official_download_uri: "ftp://kenney.nl/pack.zip",
      download_uri: "file:///tmp/model.glb",
      model_page_url: "data:text/html,hi",
      license_url: "javascript:void(0)",
      media_license: "CC0",
      asset_files: [
        { url: "javascript:alert(2)", relative_path: "a.bin", role: "buffer" },
        { url: "https://example.com/a.bin", relative_path: "a.bin", role: "buffer" },
      ],
    },
  });
  assert.deepEqual(result.links, []);
  assert.equal(result.available, false);
  assert.deepEqual(result.notes, ["source_only"]);
  assert.deepEqual(result.license, { text: "CC0", url: null });
  assert.deepEqual(result.dependencies, [{ url: "https://example.com/a.bin", path: "a.bin", role: "buffer" }]);
});

test("direct metadata keys classify archives and model files, deduplicating by URL", () => {
  const result = modelLinks({
    asset_source: "kenney",
    asset_source_url: "https://kenney.nl/assets/food-kit",
    asset_metadata: {
      official_download_uri: "https://kenney.nl/media/pages/assets/food-kit/kenney_food-kit.zip",
      official_glb_url: "https://example.com/models/apple.glb",
      asset_pack_page_url: "https://kenney.nl/assets/food-kit",
      archive_member_path: "Models/GLB format/apple.glb",
    },
  });
  assert.deepEqual(result.links, [
    { url: "https://kenney.nl/media/pages/assets/food-kit/kenney_food-kit.zip", kind: "archive" },
    { url: "https://example.com/models/apple.glb", kind: "direct_model" },
    { url: "https://kenney.nl/assets/food-kit", kind: "model_page" },
  ]);
  assert.equal(result.member, "Models/GLB format/apple.glb");
  assert.deepEqual(result.notes, ["archive_member"]);
  assert.equal(result.available, true);
  assert.ok(result.links.every((link) => PRIMARY_KINDS.includes(link.kind)));
});
