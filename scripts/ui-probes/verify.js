const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 900 } });
  await p.goto("http://127.0.0.1:3123/"); await p.waitForSelector("#status.ok"); await p.waitForTimeout(800);
  // #3 double click a node -> duplicate crumbs?
  const n = p.locator("#graph .node").nth(3);
  await n.dblclick({ force: true }); await p.waitForTimeout(1000);
  console.log("after dblclick crumbs:", JSON.stringify(await p.textContent("#crumbs")), "| back presses needed:", await p.$$eval("#crumbs button", (x) => x.length));
  // #5 collection card for task without planning
  await p.goto("http://127.0.0.1:3123/"); await p.waitForSelector("#status.ok"); await p.waitForTimeout(800);
  const r = await p.evaluate(async () => { const t = await (await fetch("/api/tasks?object_id=thor_object_microwave_1")).json(); const id = t.data[0].id; const c = await fetch(`/api/tasks/${id}/collection-card`); return { id, status: c.status, body: (await c.text()).slice(0, 120) }; });
  console.log("collection-card for THOR task:", r);
  // #12 uncheck last checkbox -> radios state
  await p.click("summary"); await p.waitForTimeout(200);
  const cb = p.locator('#checks fieldset[data-context-key="capabilities"] input[type=checkbox]').first();
  await cb.check(); await p.waitForTimeout(600); await cb.uncheck(); await p.waitForTimeout(600);
  console.log("after check/uncheck capability: radios checked =", await p.$$eval('#checks fieldset[data-context-key="capabilities"] input[type=radio]:checked', (x) => x.map((r) => r.value)), "| any box checked:", await p.$$eval('#checks fieldset[data-context-key="capabilities"] input[type=checkbox]:checked', (x) => x.length));
  // #7 group node label in graph
  const labels = await p.$$eval("#graph .node .node-label", (x) => x.map((t) => t.textContent.trim()).filter((s) => /Affordance|Task|Scene/.test(s)).slice(0, 5));
  const apiGroups = await p.evaluate(async () => (await (await fetch("/api/nodes/ycb_006_mustard_bottle/neighbors?lens=all")).json()).data.nodes.filter((n) => n.node_type === "Group").map((n) => [n.label, n.name_en, n.id]).slice(0, 3));
  console.log("group labels UI:", labels, "| API:", JSON.stringify(apiGroups));
  await b.close();
})();
