// Dynamic UI probe for Task Atlas. Usage: node ui_probe.js <baseUrl> <outDir>
const { chromium } = require("playwright");
const base = process.argv[2] || "http://127.0.0.1:3123";
const out = process.argv[3] || ".";
const findings = [];
const note = (sev, msg) => { findings.push({ sev, msg }); console.log(`[${sev}] ${msg}`); };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });
  page.on("response", (r) => { if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`); });

  await page.goto(base + "/");
  await page.waitForSelector("#status.ok", { timeout: 15000 }).catch(() => note("bug", "status never became ok"));
  await page.waitForTimeout(800);

  // 1. object count vs API total
  const uiCount = await page.textContent("#object-count");
  const apiTotal = await page.evaluate(async () => { const r = await (await fetch("/api/objects?limit=1000")).json(); return { shown: (await (await fetch("/api/objects")).json()).data.length, total: r.data.length, meta: Object.fromEntries(Object.entries(r).filter(([k]) => k !== "data")) }; });
  const listed = await page.$$eval("#objects .object, #objects button", (els) => els.length);
  console.log("object-count badge:", uiCount, "| listed buttons:", listed, "| api default:", apiTotal.shown, "| api limit=1000:", apiTotal.total, apiTotal.meta);
  if (listed < apiTotal.total) note("bug", `object index lists ${listed} of ${apiTotal.total} objects`);

  // 2. hero / assets for a few sources
  const pick = async (idSubstr) => {
    const handle = await page.$(`#objects [data-id*="${idSubstr}"], #objects [data-object-id*="${idSubstr}"]`);
    if (!handle) { note("info", `no object button matching ${idSubstr} in list`); return false; }
    await handle.click(); await page.waitForTimeout(700); return true;
  };
  const sources = ["thor_object_", "gso_object_", "replicacad_object_", "abo_", "behavior_object_", "kenney", "polyhaven"];
  for (const s of sources) {
    if (await pick(s)) {
      const title = await page.textContent("#hero-title");
      const assets = await page.$eval("#hero-assets", (el) => ({ text: el.innerText.slice(0, 160), links: [...el.querySelectorAll("a")].map((a) => [a.textContent.trim(), a.href, a.target, a.rel]) }));
      console.log(`-- ${s}: ${title} | assets: ${JSON.stringify(assets)}`);
      const bad = assets.links.filter(([, href]) => !/^https?:/.test(href));
      if (bad.length) note("bug", `non-http asset link for ${s}: ${JSON.stringify(bad)}`);
      const noNewTab = assets.links.filter(([, , t, rel]) => t === "_blank" && !/noopener/.test(rel));
      if (noNewTab.length) note("minor", `_blank without noopener: ${JSON.stringify(noNewTab)}`);
    }
  }

  // 3. language toggle: find untranslated English in JA mode
  await page.click("#language"); await page.waitForTimeout(600);
  const lang = await page.evaluate(() => document.documentElement.lang);
  const jaText = await page.evaluate(() => document.querySelector("main").innerText);
  const englishLines = jaText.split("\n").map((s) => s.trim()).filter((s) => s.length > 12 && /^[A-Za-z][A-Za-z ,.'’()-]+$/.test(s) && !/^[A-Z0-9 /_-]+$/.test(s));
  console.log("lang:", lang, "| English-looking lines in JA mode:", englishLines.length);
  englishLines.slice(0, 25).forEach((l) => console.log("   EN?", l));
  await page.click("#language"); await page.waitForTimeout(400);

  // 4. context changes -> task list updates, no errors
  const taskCount = async () => page.textContent("#task-count");
  await pick("ycb_006");
  const c0 = await taskCount();
  await page.selectOption("#contents", { index: 1 }).catch(() => note("bug", "contents select has no options"));
  await page.waitForTimeout(600);
  const c1 = await taskCount();
  await page.click('[data-mode="ready"]'); await page.waitForTimeout(600);
  const c2 = await taskCount();
  console.log("task counts explore/full/ready:", c0, c1, c2, "| mode note:", (await page.textContent("#mode-note")).slice(0, 80));
  await page.click('[data-mode="explore"]'); await page.waitForTimeout(300);

  // 5. task click -> inspector, download button, procedure select
  const firstTask = await page.$("#task-list button, #task-list .task");
  if (firstTask) { await firstTask.click(); await page.waitForTimeout(700); }
  const insp = await page.textContent("#inspector-type");
  const hasDownload = await page.$("#download");
  console.log("inspector type:", insp, "| download button:", !!hasDownload);
  if (hasDownload) {
    const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 5000 }).catch(() => null), page.click("#download")]);
    console.log("download:", dl ? await dl.suggestedFilename() : "NONE");
    if (!dl) note("bug", "collection card download did not start");
  }

  // 6. graph: node click, lens, back, zoom
  const nodes = await page.$$("#graph [data-id], #graph g.node, #graph circle");
  console.log("graph nodes:", nodes.length);
  const crumbs0 = await page.textContent("#crumbs");
  if (nodes.length > 1) { await nodes[1].click({ force: true }); await page.waitForTimeout(700); }
  const crumbs1 = await page.textContent("#crumbs");
  const backEnabled = await page.$eval("#back", (b) => !b.disabled);
  console.log("crumbs before/after:", crumbs0.slice(0, 60), "=>", crumbs1.slice(0, 60), "| back enabled:", backEnabled);
  if (nodes.length > 1 && !backEnabled) note("likely bug", "Back stays disabled after navigating a graph node");
  for (const lens of ["context", "goals", "execution", "all"]) { await page.click(`[data-lens="${lens}"]`); await page.waitForTimeout(400); }
  if (backEnabled) { await page.click("#back"); await page.waitForTimeout(500); }

  // zoom controls
  const zl = async () => page.textContent("#zoom-level");
  const z0 = await zl(); await page.click("#zoom-in"); await page.waitForTimeout(150); const z1 = await zl();
  for (let i = 0; i < 30; i++) await page.click("#zoom-in");
  const zmax = await zl(); await page.click("#zoom-reset"); const zr = await zl();
  for (let i = 0; i < 30; i++) await page.click("#zoom-out");
  const zmin = await zl(); await page.click("#zoom-fit"); await page.waitForTimeout(150); const zf = await zl();
  console.log("zoom: start", z0, "in", z1, "max", zmax, "reset", zr, "min", zmin, "fit", zf);
  // keyboard zoom while typing in search must NOT zoom
  await page.click("#zoom-reset");
  await page.click("#search"); await page.keyboard.type("+-0"); await page.waitForTimeout(100);
  const zAfterTyping = await zl(); const searchVal = await page.inputValue("#search");
  console.log("after typing +-0 in search: zoom", zAfterTyping, "search value", JSON.stringify(searchVal));
  if (zAfterTyping !== "100%") note("bug", "graph zoom keys fire while typing in the search box");
  await page.fill("#search", "");
  // keyboard on focused graph
  await page.focus("#graph"); await page.keyboard.press("+"); await page.waitForTimeout(100);
  console.log("zoom after + on focused graph:", await zl());
  // wheel over graph vs over page
  const scrollBefore = await page.evaluate(() => window.scrollY);
  const gbox = await page.$eval("#graph", (e) => e.getBoundingClientRect());
  await page.mouse.move(gbox.x + gbox.width / 2, gbox.y + gbox.height / 2); await page.mouse.wheel(0, 300); await page.waitForTimeout(150);
  console.log("wheel over graph: zoom", await zl(), "| page scrollY", scrollBefore, "->", await page.evaluate(() => window.scrollY));
  // drag then click: does a click after drag fire navigation?
  const transformBefore = await page.$eval("#graph", (s) => (s.querySelector("g") || {}).getAttribute ? s.querySelector("g").getAttribute("transform") : null);
  await page.mouse.move(gbox.x + 50, gbox.y + 50); await page.mouse.down(); await page.mouse.move(gbox.x + 150, gbox.y + 120, { steps: 5 }); await page.mouse.up();
  const transformAfter = await page.$eval("#graph", (s) => (s.querySelector("g") || {}).getAttribute ? s.querySelector("g").getAttribute("transform") : null);
  console.log("drag transform:", transformBefore, "->", transformAfter);
  if (transformBefore === transformAfter) note("likely bug", "dragging the graph did not pan it");

  // 7. search
  await page.fill("#search", "mustard"); await page.press("#search", "Enter"); await page.waitForTimeout(800);
  console.log("search mustard -> hero:", await page.textContent("#hero-title"), "| inspector:", await page.textContent("#inspector-type"));
  await page.fill("#search", "zzzqqq-nothing"); await page.press("#search", "Enter"); await page.waitForTimeout(600);
  console.log("search nonsense -> inspector text:", (await page.textContent("#inspector")).slice(0, 80), "| objects listed:", await page.$$eval("#objects button, #objects .object", (e) => e.length));
  await page.fill("#search", ""); await page.dispatchEvent("#search", "input"); await page.waitForTimeout(300);

  // 8. rapid object switching (race)
  const btns = await page.$$("#objects button, #objects .object");
  if (btns.length > 5) {
    await btns[2].click(); await btns[3].click(); await btns[4].click(); await page.waitForTimeout(1500);
    const title = await page.textContent("#hero-title"); const want = await btns[4].textContent();
    console.log("rapid switch -> hero:", title.trim(), "| last clicked:", want.trim().slice(0, 50));
    if (!want.includes(title.trim().split("\n")[0].trim().slice(0, 10))) note("likely bug", `race: hero shows "${title.trim()}" after clicking "${want.trim().slice(0, 40)}" last`);
  }

  // 9. mobile width
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(500);
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  if (sw > 390) note("bug", `horizontal overflow at 390px: scrollWidth ${sw}`);
  await page.screenshot({ path: `${out}/mobile.png`, fullPage: true });
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.screenshot({ path: `${out}/desktop.png`, fullPage: true });

  // 10. other pages
  for (const p of ["/start.html", "/about.html"]) {
    const r = await page.goto(base + p); await page.waitForTimeout(300);
    const links = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
    console.log(p, r.status(), "links:", links.join(" "));
  }

  console.log("\n== page errors ==\n" + (errors.length ? errors.join("\n") : "none"));
  console.log("\n== findings ==\n" + (findings.length ? findings.map((f) => `[${f.sev}] ${f.msg}`).join("\n") : "none"));
  await browser.close();
})();
