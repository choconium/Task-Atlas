const { chromium } = require("playwright");
const base = process.argv[2] || "http://127.0.0.1:3123";
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + "/");
  await page.waitForSelector("#status.ok");
  await page.waitForTimeout(800);
  const snap = async (tag) => {
    const s = await page.evaluate(() => ({
      nodes: document.querySelectorAll("#graph .node").length,
      zoomIn: document.querySelector("#zoom-in").disabled,
      zoomOut: document.querySelector("#zoom-out").disabled,
      reset: document.querySelector("#zoom-reset").disabled,
      level: document.querySelector("#zoom-level").value,
      emptyShown: !document.querySelector("#empty").hidden,
      crumbs: document.querySelector("#crumbs").innerText,
      vp: (document.querySelector("#graph .graph-viewport") || {}).getAttribute?.("transform"),
    }));
    console.log(tag.padEnd(28), JSON.stringify(s));
    return s;
  };
  await snap("initial (mustard)");
  // click a non-root graph node
  const nodes = await page.$$("#graph .node");
  await nodes[1].click({ force: true }); await page.waitForTimeout(800);
  await snap("after node click");
  for (const lens of ["context", "goals", "execution", "all"]) {
    await page.click(`[data-lens="${lens}"]`); await page.waitForTimeout(700);
    await snap("lens " + lens);
  }
  await page.click("#back"); await page.waitForTimeout(800);
  await snap("after back");
  // rapid lens switching (race)
  for (const lens of ["context", "goals", "execution", "all"]) await page.click(`[data-lens="${lens}"]`);
  await page.waitForTimeout(1200);
  await snap("rapid lens -> all");
  // zoom behaviour
  const clickIf = async (sel, n = 1) => { for (let i = 0; i < n; i++) { if (!(await page.$eval(sel, (b) => b.disabled))) await page.click(sel); } };
  await clickIf("#zoom-in", 40); await snap("zoom-in x40");
  await clickIf("#zoom-reset"); await clickIf("#zoom-out", 60); await snap("zoom-out x60");
  await page.click("#zoom-fit"); await snap("fit");
  await page.click("#zoom-reset");
  // keyboard while typing in search
  await page.click("#search"); await page.keyboard.type("+-0"); await page.waitForTimeout(100);
  console.log("typed +-0 in search -> zoom", await page.$eval("#zoom-level", (o) => o.value), "search:", JSON.stringify(await page.inputValue("#search")));
  await page.fill("#search", ""); await page.dispatchEvent("#search", "input");
  await page.focus("#graph"); await page.keyboard.press("+"); await page.keyboard.press("ArrowLeft"); await page.waitForTimeout(100);
  await snap("graph focused + ArrowLeft");
  // wheel over graph: zoom and page scroll
  const gbox = await page.$eval("#graph", (e) => e.getBoundingClientRect());
  const sy0 = await page.evaluate(() => window.scrollY);
  await page.mouse.move(gbox.x + gbox.width / 2, gbox.y + gbox.height / 2); await page.mouse.wheel(0, 300); await page.waitForTimeout(150);
  console.log("wheel over graph: zoom", await page.$eval("#zoom-level", (o) => o.value), "scrollY", sy0, "->", await page.evaluate(() => window.scrollY));
  // drag then check click suppression
  await page.click("#zoom-reset");
  const before = await page.$eval("#graph .graph-viewport", (g) => g.getAttribute("transform"));
  const crumbsBefore = await page.textContent("#crumbs");
  const n1 = await page.$("#graph .node:nth-of-type(2)");
  const nb = await n1.boundingBox();
  await page.mouse.move(nb.x + 20, nb.y + 20); await page.mouse.down(); await page.mouse.move(nb.x + 120, nb.y + 90, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(400);
  const after = await page.$eval("#graph .graph-viewport", (g) => g.getAttribute("transform"));
  console.log("drag on node: transform", before, "->", after, "| crumbs changed:", (await page.textContent("#crumbs")) !== crumbsBefore);
  // click node after drag (no drag) should navigate
  const n2 = await page.$("#graph .node:nth-of-type(2)"); await n2.click({ force: true }); await page.waitForTimeout(700);
  console.log("plain click after drag: crumbs changed:", (await page.textContent("#crumbs")) !== crumbsBefore);
  // resize: does pan/zoom reset silently?
  await page.click("#zoom-in"); await page.click("#zoom-in");
  await page.setViewportSize({ width: 1200, height: 900 }); await page.waitForTimeout(500);
  await snap("after resize (was 156%)");
  console.log("errors:", errors.length ? errors : "none");
  await browser.close();
})();
