const { chromium, devices } = require("playwright");
const base = process.argv[2] || "http://127.0.0.1:3123";
const out = process.argv[3] || ".";
(async () => {
  const browser = await chromium.launch();
  // ---- desktop part
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });
  page.on("response", (r) => { if (r.status() >= 400) errors.push(`HTTP ${r.status()} ${r.url()}`); });
  await page.goto(base + "/"); await page.waitForSelector("#status.ok"); await page.waitForTimeout(800);


  // K. expansion section visible for non-mustard object?
  const thorBtn = await page.$('#objects [data-object-id^="thor_object_"]');
  await thorBtn.click(); await page.waitForTimeout(900);
  console.log("THOR selected; expansion section hidden?", await page.$eval("#expansion-loops", (e) => e.hidden), "| heading:", await page.$eval("#expansion-loops h2", (e) => e.textContent));
  // D. long ABO title in hero
  const abo = await page.$('#objects [data-object-id^="abo_"]');
  if (abo) { await abo.click(); await page.waitForTimeout(900); const r = await page.$eval(".hero", (e) => ({ w: e.scrollWidth, cw: e.clientWidth, title: e.querySelector("#hero-title").textContent.length })); console.log("ABO hero:", r); await page.screenshot({ path: `${out}/hero_abo.png`, clip: { x: 0, y: 0, width: 1400, height: 520 } }); }
  // C. search behaviours
  await page.fill("#search", "mustard"); await page.press("#search", "Enter"); await page.waitForTimeout(900);
  console.log("search 'mustard' -> hero:", await page.textContent("#hero-title"), "| objects shown:", await page.$$eval("#objects button", (e) => e.length), "| badge:", await page.textContent("#object-count"));
  await page.fill("#search", "Microwave_1"); await page.press("#search", "Enter"); await page.waitForTimeout(900);
  console.log("search 'Microwave_1' -> hero:", await page.textContent("#hero-title"));
  await page.fill("#search", "scene_home_kitchen"); await page.press("#search", "Enter"); await page.waitForTimeout(900);
  console.log("search scene id -> inspector type:", await page.textContent("#inspector-type"), "| crumbs:", await page.textContent("#crumbs"), "| hero:", await page.textContent("#hero-title"));
  await page.fill("#search", "zzzqqq"); await page.press("#search", "Enter"); await page.waitForTimeout(700);
  console.log("search nonsense -> inspector:", (await page.textContent("#inspector")).trim().slice(0, 60), "| objects shown:", await page.$$eval("#objects button, #objects .message", (e) => e.map((x) => x.className).join(",")).then((s) => s.slice(0, 40)));
  await page.fill("#search", ""); await page.dispatchEvent("#search", "input"); await page.waitForTimeout(300);
  // rapid object switching race
  const names = [];
  for (const i of [10, 40, 80]) { const b = page.locator("#objects button").nth(i); names.push((await b.locator("span").evaluate((s) => s.firstChild.textContent)).trim()); await b.click(); }
  await page.waitForTimeout(2000);
  console.log("rapid switch: hero =", (await page.textContent("#hero-title")).trim(), "| last clicked =", names[2], "| inspector:", (await page.textContent("#inspector h2").catch(() => "?")).trim(), "| crumbs:", await page.textContent("#crumbs"));
  // context change while a task is selected keeps task?
  const t = await page.$("#task-list button"); if (t) { await t.click(); await page.waitForTimeout(700); }
  const selTask = await page.$eval("#inspector small", (s) => s.textContent).catch(() => "?");
  await page.selectOption("#role", { index: 1 }); await page.waitForTimeout(900);
  console.log("after role change: inspector type", await page.textContent("#inspector-type"), "| task still", await page.$eval("#inspector small", (s) => s.textContent).catch(() => "?"), "(was", selTask + ")");
  // JA mode: inspector english leftovers
  await page.click("#language"); await page.waitForTimeout(600);
  const insp = await page.evaluate(() => document.querySelector("#inspector").innerText);
  const en = insp.split("\n").map((s) => s.trim()).filter((s) => /^[A-Za-z][A-Za-z (),.:0-9'’-]{10,}$/.test(s));
  console.log("JA inspector english lines:", en.length); en.slice(0, 12).forEach((l) => console.log("   ", l));
  const taskList = await page.evaluate(() => document.querySelector("#task-list").innerText);
  console.log("JA task list sample:", taskList.split("\n").slice(0, 6).join(" | "));
  await page.click("#language");
  await page.close();

  // ---- mobile touch part
  const ctx = await browser.newContext({ ...devices["Pixel 7"] });
  const m = await ctx.newPage();
  m.on("pageerror", (e) => errors.push("mobile pageerror: " + e.message));
  await m.goto(base + "/"); await m.waitForSelector("#status.ok"); await m.waitForTimeout(1000);
  const sw = await m.evaluate(() => document.documentElement.scrollWidth);
  console.log("mobile scrollWidth:", sw, "viewport", await m.evaluate(() => innerWidth));
  // scroll graph into view, then swipe over it
  await m.evaluate(() => document.querySelector("#graph").scrollIntoView({ block: "center" }));
  await m.waitForTimeout(300);
  const y0 = await m.evaluate(() => scrollY);
  const g = await m.$eval("#graph", (e) => e.getBoundingClientRect());
  const cdp = await ctx.newCDPSession(m);
  await cdp.send("Input.synthesizeScrollGesture", { x: Math.round(g.x + g.width / 2), y: Math.round(g.y + g.height / 2), yDistance: -300, speed: 800 });
  await m.waitForTimeout(600);
  const y1 = await m.evaluate(() => scrollY);
  const vp = await m.$eval("#graph .graph-viewport", (e) => e.getAttribute("transform"));
  console.log("mobile swipe over graph: scrollY", y0, "->", y1, "| graph transform:", vp);
  // swipe elsewhere (hero) for comparison
  await m.evaluate(() => scrollTo(0, 0)); await m.waitForTimeout(200);
  const h = await m.$eval(".hero", (e) => e.getBoundingClientRect());
  await cdp.send("Input.synthesizeScrollGesture", { x: Math.round(h.x + h.width / 2), y: Math.round(h.y + h.height / 2), yDistance: -300, speed: 800 });
  await m.waitForTimeout(600);
  console.log("mobile swipe over hero: scrollY 0 ->", await m.evaluate(() => scrollY));
  await m.screenshot({ path: `${out}/mobile_full.png`, fullPage: true });
  await ctx.close();
  for (const p of ["/start.html", "/about.html"]) {
    const pg = await browser.newPage(); const r = await pg.goto(base + p);
    const hrefs = await pg.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
    console.log(p, r.status(), hrefs.join(" "));
    await pg.close();
  }
  console.log("errors:", errors.length ? errors : "none");
  await browser.close();
})();
