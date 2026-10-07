const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
  await p.goto("http://127.0.0.1:3123/"); await p.waitForSelector("#status.ok"); await p.waitForTimeout(800);
  await p.evaluate(() => { window.__lt = []; new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push(Math.round(e.duration)))).observe({ type: "longtask" }); });
  await p.fill("#search", "skill_grasp"); const t0 = Date.now(); await p.press("#search", "Enter");
  await p.waitForFunction(() => document.querySelectorAll("#graph .node").length > 500, null, { timeout: 90000 }).catch(() => console.log("timeout waiting for >500 nodes"));
  const n = await p.$$eval("#graph .node", (x) => x.length);
  console.log(`search skill_grasp -> ${n} nodes in ${Date.now() - t0} ms; long tasks:`, await p.evaluate(() => window.__lt));
  console.log("bbox height", await p.evaluate(() => Math.round(document.querySelector("#graph .graph-viewport").getBBox().height)), "px; crumbs:", await p.textContent("#crumbs"));
  await p.click("#zoom-fit"); console.log("fit:", await p.$eval("#zoom-level", (o) => o.value));
  // desktop object list scrollable?
  const sc = await p.$eval("#objects", (e) => ({ overflowY: getComputedStyle(e).overflowY, scrollH: e.scrollHeight, clientH: e.clientHeight }));
  console.log("desktop #objects:", sc);
  for (const [path, w] of [["/start.html", 390], ["/about.html", 390], ["/about.html", 1280]]) {
    await p.setViewportSize({ width: w, height: 900 }); await p.goto("http://127.0.0.1:3123" + path); await p.waitForTimeout(400);
    console.log(path, w, "scrollWidth", await p.evaluate(() => document.documentElement.scrollWidth), "| errors:", await p.evaluate(() => typeof window.onerror));
  }
  await b.close();
})();
