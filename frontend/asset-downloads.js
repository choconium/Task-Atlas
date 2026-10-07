(() => {
  "use strict";

  const YCB_MODEL_CATALOG = "https://ycb-benchmarks.s3.amazonaws.com/index.html";
  // Every id below answered HTTP 200 on 2026-10-08 for
  // https://ycb-benchmarks.s3.amazonaws.com/data/berkeley/<id>/<id>_berkeley_meshes.tgz
  // (60 of the 77 catalogue ids; the other 17 return 404 and fall back to the catalogue).
  const YCB_ARCHIVE_IDS = new Set([
    "001_chips_can", "002_master_chef_can", "003_cracker_box", "004_sugar_box",
    "005_tomato_soup_can", "006_mustard_bottle", "007_tuna_fish_can", "008_pudding_box",
    "009_gelatin_box", "010_potted_meat_can", "011_banana", "012_strawberry", "013_apple",
    "014_lemon", "015_peach", "016_pear", "017_orange", "018_plum", "019_pitcher_base",
    "021_bleach_cleanser", "022_windex_bottle", "023_wine_glass", "024_bowl", "025_mug",
    "026_sponge", "027_skillet", "029_plate", "030_fork", "031_spoon", "032_knife",
    "033_spatula", "035_power_drill", "036_wood_block", "037_scissors", "038_padlock",
    "039_keys", "040_large_marker", "041_small_marker", "042_adjustable_wrench",
    "043_phillips_screwdriver", "044_flat_screwdriver", "046_plastic_bolt", "047_plastic_nut",
    "048_hammer", "049_small_clamp", "050_medium_clamp", "051_large_clamp",
    "052_extra_large_clamp", "053_mini_soccer_ball", "054_softball", "055_baseball",
    "056_tennis_ball", "057_racquetball", "058_golf_ball", "059_chain", "061_foam_brick",
    "062_dice", "071_nine_hole_peg_test", "076_timer", "077_rubiks_cube",
  ]);
  // The S3 archive folder for 039_keys is spelled in the singular.
  const YCB_ARCHIVE_ID_OVERRIDES = { "039_keys": "039_key" };
  const DIRECT_METADATA_KEYS = [
    ["official_download_uri", "archive"],
    ["download_uri", "direct_model"],
    ["official_glb_url", "direct_model"],
    ["official_glTF_url", "direct_model"],
  ];
  const MODEL_FILE_PATTERN = /\.(?:glb|gltf|obj|fbx|dae|stl|usd|usda|usdc|zip|tgz|tar\.gz)(?:[?#].*)?$/i;
  const SOURCE_FILE_PATTERN = /\.(?:glb|gltf|obj|fbx|dae|stl|usd|usda|usdc|urdf|xml|zip|tgz|tar\.gz)(?:[?#].*)?$/i;
  const ARCHIVE_PATTERN = /\.(?:zip|tgz|tar\.gz)(?:[?#].*)?$/i;
  const GSO_ARCHIVE_BASE = "https://fuel.gazebosim.org/1.0/GoogleResearch/models/";

  function httpUrl(value) {
    if (typeof value !== "string") return null;
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
    } catch {
      return null;
    }
  }

  function addLink(links, url, kind) {
    const safeUrl = httpUrl(url);
    if (!safeUrl) return;
    const existing = links.find((link) => link.url === safeUrl);
    if (existing) {
      const priority = {
        source_page: 0, source_file: 1, catalog: 1, model_page: 2, asset_collection: 2, direct_model: 3, archive: 3,
      };
      if ((priority[kind] ?? 0) > (priority[existing.kind] ?? 0)) existing.kind = kind;
      return;
    }
    links.push({ url: safeUrl, kind });
  }

  // `.json` manifests (ProcTHOR's asset-database.json, Habitat object configs, …)
  // describe assets rather than being model files, so they stay `source_page`.
  function sourceKind(url) {
    return SOURCE_FILE_PATTERN.test(url) ? "source_file" : "source_page";
  }

  function downloadKind(url, fallback = "direct_model") {
    return ARCHIVE_PATTERN.test(url) ? "archive" : fallback;
  }

  // Any GitHub `blob` link to a file inside a folder resolves to that folder's `tree` view,
  // e.g. https://github.com/o/r/blob/<rev>/models/foo/model.xml → https://github.com/o/r/tree/<rev>/models/foo
  function githubModelFolder(url) {
    const match = url.match(/^(https:\/\/github\.com\/[^/]+\/[^/]+)\/blob\/([^/]+)\/(.+)\/[^/]+$/);
    return match ? `${match[1]}/tree/${match[2]}/${match[3]}` : null;
  }

  // Hugging Face dataset `blob` link → the `tree` view of the file's containing folder.
  function replicaCollectionFolder(url) {
    const match = url.match(/^(https:\/\/huggingface\.co\/datasets\/[^/]+\/[^/]+)\/blob\/([^/]+)\/(.+)$/);
    if (!match) return null;
    const [, root, revision, filePath] = match;
    const slash = filePath.lastIndexOf("/");
    const directory = slash > 0 ? filePath.slice(0, slash) : "";
    return `${root}/tree/${revision}${directory ? `/${directory}` : ""}`;
  }

  function gsoArchiveUrl(object) {
    if (typeof object.asset_source_id !== "string" || !object.asset_source_id) return null;
    return `${GSO_ARCHIVE_BASE}${encodeURIComponent(object.asset_source_id)}.zip`;
  }

  function dependenciesFor(metadata) {
    return Array.isArray(metadata.asset_files)
      ? metadata.asset_files
        .filter((file) => file && file.role !== "gltf_json" && httpUrl(file.url))
        .map((file) => ({
          url: httpUrl(file.url),
          path: typeof file.relative_path === "string" ? file.relative_path : "",
          role: typeof file.role === "string" ? file.role : "asset_file",
        }))
      : [];
  }

  function licenseFor(metadata) {
    const text = metadata.media_license || metadata.asset_license || null;
    const url = httpUrl(metadata.license_url || metadata.license_policy_url);
    if (!text && !url) return null;
    // Never hand the UI an anchor without text: fall back to the licence host.
    return { text: text || new URL(url).host, url };
  }

  function modelLinks(object = {}) {
    const metadata = object.asset_metadata && typeof object.asset_metadata === "object"
      ? object.asset_metadata
      : {};
    const links = [];
    const notes = [];
    const dependencies = dependenciesFor(metadata);
    const isYcb = object.asset_source === "ycb" || (!object.asset_source && object.ycb_id);

    if (isYcb) {
      const archiveId = YCB_ARCHIVE_ID_OVERRIDES[object.ycb_id] || object.ycb_id;
      if (YCB_ARCHIVE_IDS.has(object.ycb_id)) {
        addLink(
          links,
          `https://ycb-benchmarks.s3.amazonaws.com/data/berkeley/${archiveId}/${archiveId}_berkeley_meshes.tgz`,
          "archive",
        );
      } else {
        notes.push("catalog_lookup");
      }
      // The YCB project publishes the authoritative per-object archive list here.
      // Multipart entries in Atlas deliberately use the catalogue instead of a guessed part.
      addLink(links, YCB_MODEL_CATALOG, "catalog");
      return {
        links,
        license: {
          text: "CC BY 4.0",
          url: "https://creativecommons.org/licenses/by/4.0/",
        },
        member: null,
        notes,
        dependencies: [],
        available: links.some((link) => ["direct_model", "archive"].includes(link.kind)),
      };
    }

    for (const [key, kind] of DIRECT_METADATA_KEYS) {
      const url = metadata[key];
      addLink(links, url, downloadKind(url, kind));
    }

    // Some datasets store the exact asset file as the source URL rather than metadata.
    const sourceUrl = httpUrl(object.asset_source_url);
    if (sourceUrl) {
      const kind = sourceKind(sourceUrl);
      if (kind === "source_file" && MODEL_FILE_PATTERN.test(sourceUrl)) {
        addLink(links, sourceUrl, "direct_model");
      } else if (object.asset_source === "google_scanned_objects") {
        addLink(links, sourceUrl, "model_page");
      } else if (object.asset_source === "ai2thor_procthor") {
        // The shared ProcTHOR asset database, not a per-object model file.
        addLink(links, sourceUrl, "source_page");
        notes.push("thor_database");
      } else {
        addLink(links, sourceUrl, kind);
      }
    }

    if (object.asset_source === "google_scanned_objects") {
      // Fuel serves the complete model (SDF, meshes, textures) as a zip next to the page.
      addLink(links, gsoArchiveUrl(object), "archive");
    }
    if (["mujoco_scanned_objects", "robocasa"].includes(object.asset_source) && sourceUrl) {
      addLink(links, githubModelFolder(sourceUrl), "model_page");
      notes.push("simulator_assets");
    }
    if (object.asset_source === "replicacad" && sourceUrl) {
      addLink(links, replicaCollectionFolder(sourceUrl), "asset_collection");
      notes.push("simulator_assets");
    }

    // An official model page can be more useful than an individual glTF manifest,
    // especially when textures and other dependent files are required.
    addLink(links, metadata.asset_pack_page_url, "model_page");
    addLink(links, metadata.official_model_page_url, "model_page");
    addLink(links, metadata.model_page_url, "model_page");
    addLink(links, metadata.smithsonian_object_page_url, "model_page");

    if (metadata.archive_member_path) {
      notes.push("archive_member");
    }
    if (metadata.official_glTF_url) {
      notes.push("gltf_dependencies");
    }
    if (object.asset_ready_in_source === false) {
      notes.push("source_not_ready");
    }
    const available = links.some((link) => ["direct_model", "archive", "model_page", "asset_collection"].includes(link.kind));
    if (!available) {
      notes.push("source_only");
    }

    return {
      links,
      license: licenseFor(metadata),
      member: typeof metadata.archive_member_path === "string" ? metadata.archive_member_path : null,
      notes,
      dependencies,
      available,
    };
  }

  const api = { modelLinks, httpUrl };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.AtlasAssets = api;
})();
