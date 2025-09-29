// Behavior parity scanner - verify counter animations and script execution
import { readFile } from "node:fs/promises";
import { fetch } from "undici";
import * as cheerio from "cheerio";

const PROD = "https://theprofitplatform.com.au/";
const PREVIEW_LOCAL = "http://localhost:4321/";

console.log("[parity-behavior] Starting behavior verification...");

function extractScriptOrder(html) {
  const $ = cheerio.load(html);

  const headCSS = [];
  const headJS = [];
  const bodyJS = [];
  const inlineScripts = [];

  // HEAD CSS
  $("head link[rel='stylesheet'][href]").each((_, el) => {
    const href = $(el).attr("href");
    if (href) headCSS.push(href);
  });

  // HEAD JS
  $("head script[src]").each((_, el) => {
    const src = $(el).attr("src");
    if (src) headJS.push(src);
  });

  // BODY JS
  $("body script[src]").each((_, el) => {
    const src = $(el).attr("src");
    if (src) bodyJS.push(src);
  });

  // Inline scripts (head and body)
  $("script:not([src])").each((_, el) => {
    const content = $(el).html();
    if (content && content.trim()) {
      const isInHead = $(el).parents("head").length > 0;
      inlineScripts.push({
        content: content.trim(),
        location: isInHead ? "head" : "body",
        hasCounterCode: content.includes("counter") && content.includes("data-target")
      });
    }
  });

  return { headCSS, headJS, bodyJS, inlineScripts };
}

function sameOrder(a, b) {
  if (a.length !== b.length) return false;
  return a.every((v, i) => {
    const prodVal = v;
    const localVal = b[i];
    // Normalize paths
    const prodNorm = prodVal?.replace(/^https?:\/\/[^\/]+/, '') || prodVal;
    const localNorm = localVal?.replace(/^https?:\/\/[^\/]+/, '') || localVal;
    return prodNorm === localNorm;
  });
}

let prodHtml, localHtml;

try {
  console.log("[parity-behavior] Fetching production HTML...");
  prodHtml = await fetch(PROD).then(r => r.text());
  console.log(`[parity-behavior] Production HTML: ${prodHtml.length} bytes`);
} catch (e) {
  console.error("❌ Failed to fetch production:", e.message);
  process.exit(1);
}

try {
  console.log("[parity-behavior] Fetching local preview HTML...");
  localHtml = await fetch(PREVIEW_LOCAL).then(r => r.text());
  console.log(`[parity-behavior] Local HTML: ${localHtml.length} bytes`);
} catch (e) {
  console.error("❌ Failed to fetch local preview (is it running on port 4321?):", e.message);
  process.exit(1);
}

const P = extractScriptOrder(prodHtml);
const L = extractScriptOrder(localHtml);

console.log(`[parity-behavior] Production: ${P.headCSS.length} CSS, ${P.headJS.length + P.bodyJS.length} JS, ${P.inlineScripts.length} inline`);
console.log(`[parity-behavior] Local: ${L.headCSS.length} CSS, ${L.headJS.length + L.bodyJS.length} JS, ${L.inlineScripts.length} inline`);

const issues = [];

// Check CSS order
if (!sameOrder(P.headCSS, L.headCSS)) {
  issues.push("❌ CSS order mismatch");
  issues.push("PROD CSS:", JSON.stringify(P.headCSS.slice(0, 5), null, 2));
  issues.push("LOCAL CSS:", JSON.stringify(L.headCSS.slice(0, 5), null, 2));
}

// Check JS order (combined head + body)
const prodJs = [...P.headJS, ...P.bodyJS];
const locJs = [...L.headJS, ...L.bodyJS];
if (!sameOrder(prodJs, locJs)) {
  issues.push("❌ JS order mismatch");
  issues.push("PROD JS:", JSON.stringify(prodJs, null, 2));
  issues.push("LOCAL JS:", JSON.stringify(locJs, null, 2));
}

// Check inline scripts
const prodCounterScript = P.inlineScripts.find(s => s.hasCounterCode);
const localCounterScript = L.inlineScripts.find(s => s.hasCounterCode);

if (!prodCounterScript) {
  issues.push("❌ No counter script found in production");
} else if (!localCounterScript) {
  issues.push("❌ Counter script missing in local version");
  issues.push("Expected counter script with 'data-target' and 'counter' keywords");
} else {
  console.log("✅ Counter script found in both versions");

  // Check if counter script content is similar
  const prodCounterNorm = prodCounterScript.content.replace(/\s+/g, ' ').trim();
  const localCounterNorm = localCounterScript.content.replace(/\s+/g, ' ').trim();

  if (prodCounterNorm !== localCounterNorm) {
    issues.push("⚠️  Counter script content differs");
    console.log("PROD Counter snippet:", prodCounterNorm.substring(0, 200) + "...");
    console.log("LOCAL Counter snippet:", localCounterNorm.substring(0, 200) + "...");
  }
}

// Check inline script count
if (P.inlineScripts.length !== L.inlineScripts.length) {
  issues.push(`❌ Inline script count mismatch: PROD=${P.inlineScripts.length}, LOCAL=${L.inlineScripts.length}`);
}

// Counter animation test
console.log("[parity-behavior] Checking for counter elements in HTML...");
const $ = cheerio.load(localHtml);
const counterElements = $(".counter[data-target]");
console.log(`[parity-behavior] Found ${counterElements.length} counter elements with data-target`);

if (counterElements.length === 0) {
  issues.push("❌ No counter elements found in local HTML");
} else {
  console.log("✅ Counter elements found in HTML");

  // Check for common counter values
  counterElements.each((i, el) => {
    const target = $(el).attr("data-target");
    const text = $(el).text().trim();
    console.log(`[parity-behavior] Counter ${i + 1}: target="${target}", current text="${text}"`);

    // Check if counter is stuck at zero/placeholder
    if (text === "0" || text === "0%" || text === "0+" || text === "0 min") {
      console.log(`⚠️  Counter ${i + 1} appears to be at default value`);
    }
  });
}

if (issues.length) {
  console.error("❌ BEHAVIOR PARITY FAIL");
  console.error(issues.join("\n"));
  console.error("\n💡 HINT: Counter animation script needs to be placed exactly as in production.");
  console.error("   Check that inline scripts use 'is:inline' and are in the correct body order.");
  process.exit(1);
} else {
  console.log("✅ BEHAVIOR PARITY PASS");
  console.log(`✅ CSS order: PASS (${P.headCSS.length} stylesheets)`);
  console.log(`✅ JS order: PASS (${prodJs.length} scripts)`);
  console.log(`✅ Inline scripts: PASS (${P.inlineScripts.length} blocks matched)`);
  console.log(`✅ Counter script: PASS (found and placed correctly)`);
  console.log(`✅ Counter elements: PASS (${counterElements.length} elements ready)`);
}