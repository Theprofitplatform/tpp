import { getHTML, head } from "./lib/http.js";
import { extractHeadInfo, sameOrder, hasJSONLD } from "./lib/dom.js";
import { screenshot, diff } from "./lib/visual.js";
import { behaviorChecks } from "./lib/a11y.js";
import fs from "node:fs";

const PROD = process.env.PROD_URL || "https://theprofitplatform.com.au/";
const PREVIEW = process.env.PREVIEW_URL || "https://tpp.pages.dev/";
const MODE = process.argv[2] || "cloudflare"; // local | cloudflare | prod-vs-preview

async function headParity(prodHtml, prevHtml) {
  const P = extractHeadInfo(prodHtml);
  const L = extractHeadInfo(prevHtml);
  const issues = [];
  const prodJs = [...P.jsHead, ...P.jsBody];
  const prevJs = [...L.jsHead, ...L.jsBody];
  if (!sameOrder(P.css, L.css)) issues.push({ kind:"css-order", prod:P.css, prev:L.css });
  if (!sameOrder(prodJs, prevJs)) issues.push({ kind:"js-order", prod:prodJs, prev:prevJs });
  // minimal SEO checks
  if (P.title !== L.title) issues.push({ kind:"title", prod:P.title, prev:L.title });
  if (P.desc && P.desc !== L.desc) issues.push({ kind:"description", prod:P.desc, prev:L.desc });
  if (P.canonical && P.canonical !== L.canonical) issues.push({ kind:"canonical", prod:P.canonical, prev:L.canonical });
  // JSON-LD presence (LocalBusiness + FAQPage expected)
  const jsonldOK = hasJSONLD(["LocalBusiness","FAQPage"], L.ld);
  return { issues, jsonldOK };
}

async function cacheHeaders(urls) {
  const out = [];
  for (const u of urls) {
    const h = await head(u);
    out.push({ u, ok: h.ok, status: h.status, cache: h.headers["cache-control"]||"" });
  }
  return out;
}

(async () => {
  const prodHtml = await getHTML(PROD);
  const prevHtml = await getHTML(PREVIEW);

  // 1) HEAD parity
  const { issues, jsonldOK } = await headParity(prodHtml, prevHtml);

  // 2) Behavior
  const behavior = await behaviorChecks(PREVIEW);

  // 3) Visual diff (one above-the-fold shot)
  await screenshot(PROD, "prod.png");
  await screenshot(PREVIEW, "prev.png");
  const mismatch = diff("prod.png", "prev.png", "diff.png", 0.1);

  // 4) Cache headers sample (update list as needed)
  const cache = await cacheHeaders([
    `${PREVIEW}_astro/`,
    `${PREVIEW}favicon.ico`,
    `${PREVIEW}assets/`
  ]);

  const pass =
    issues.length===0 &&
    jsonldOK &&
    behavior.countersOK &&
    behavior.navOK &&
    behavior.contactOK &&
    behavior.no404 &&
    mismatch < 500; // tweak threshold for your layout

  const report = {
    PASS: pass,
    issues,
    jsonldOK,
    behavior,
    visualMismatchPixels: mismatch,
    cache
  };
  console.log(JSON.stringify(report, null, 2));
  if (!pass) process.exit(1);
})();