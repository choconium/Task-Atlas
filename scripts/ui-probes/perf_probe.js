const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
  await p.goto("http://127.0.0.1:3123/"); await p.waitForSelector("#status.ok"); await p.waitForTimeout(800);
  // select first task so skills appear in graph
  await p.click("#task-list button"); await p.waitForTimeout(900);
  const skillNode = await p.$('#graph .node[data-node-id="skill_grasp"]') || await p.$('#graph .node[data-node-id^="skill_"]');
  const id = await skillNode.getAttribute("data-node-id");
  await p.evaluate(() => { window.__longTasks = []; new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__longTasks.push(Math.round(e.duration)))).observe({ type: "longtask", buffered: true }); });
  const t0 = Date.now();
  await skillNode.click({ force: true });
  await p.waitForFunction((n) => document.querySelectorAll("#graph .node").length > 100, 100, { timeout: 60000 }).catch(() => console.log("render did not reach >100 nodes within 60s"));
  const t1 = Date.now();
  const n = await p.$$eval("#graph .node", (x) => x.length);
  const long = await p.evaluate(() => window.__longTasks);
  console.log(`click ${id} -> ${n} nodes rendered in ${t1 - t0} ms; long tasks (ms):`, long.slice(0, 10), "max", Math.max(0, ...long));
  const svgH = await p.$eval("#graph", (s) => s.getAttribute("viewBox"));
  const bounds = await p.evaluate(() => { const g = document.querySelector("#graph .graph-viewport").getBBox(); return { w: Math.round(g.width), h: Math.round(g.height) }; });
  console.log("viewBox", svgH, "| content bbox", bounds);
  const tf = Date.now(); await p.click("#zoom-fit"); await p.waitForTimeout(50);
  console.log("fit all ->", await p.$eval("#zoom-level", (o) => o.value), "in", Date.now() - tf, "ms");
  // how long does a lens switch take at this size
  const t2 = Date.now(); await p.click('[data-lens="context"]'); await p.waitForFunction(() => document.querySelectorAll("#graph .node").length < 600, null, { timeout: 30000 }).catch(() => {});
  console.log("lens switch ->", await p.$$eval("#graph .node", (x) => x.length), "nodes in", Date.now() - t2, "ms");
  await b.close();
})();
