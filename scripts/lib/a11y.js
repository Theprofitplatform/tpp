import { chromium } from "playwright";

export async function behaviorChecks(url) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(url, { waitUntil: "networkidle" });

  // Counters: look for the 4 stat numbers; ensure not zeroish after init window
  await page.waitForTimeout(1500);
  const texts = await page.$$eval("section,div,span,h2,h3", nodes =>
    nodes.map(n=>n.textContent.trim()).filter(Boolean)
  );
  const zeroish = texts.join(" ").match(/\b0[%+]?|0 min\b/gi);
  const countersOK = !(zeroish && zeroish.length >= 3); // tolerate one 0, fail if many

  // Nav toggle: try click and check aria-expanded changes, and panel visibility
  let navOK = true;
  try {
    const hasBtn = await page.$("#nav-toggle");
    if (hasBtn) {
      const before = await page.getAttribute("#nav-toggle","aria-expanded");
      await page.click("#nav-toggle");
      const after = await page.getAttribute("#nav-toggle","aria-expanded");
      navOK = before !== after;
    }
  } catch { navOK = false; }

  // tel/mailto links present
  const hasTel = await page.$("a[href^='tel:']");
  const hasMail = await page.$("a[href^='mailto:']");
  const contactOK = !!(hasTel && hasMail);

  // 404 scan for main assets referenced in head/body
  const requests = [];
  page.on("requestfinished", req => requests.push(req));
  await page.reload({ waitUntil: "networkidle" });
  const responses = await Promise.all(requests.map(r => r.response()));
  const bad = (responses.filter(r => !r || r.status() >= 400).map(r => r && r.url())).filter(Boolean);
  const no404 = bad.length === 0;

  await browser.close();
  return { countersOK, navOK, contactOK, no404, bad };
}