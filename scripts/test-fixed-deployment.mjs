// Test the fixed deployment for counter behavior
import { fetch } from "undici";
import * as cheerio from "cheerio";

const PROD = "https://theprofitplatform.com.au/";
const FIXED_DEPLOY = "https://83691b44.tpp.pages.dev/";

console.log("[test-fixed-deployment] Testing behavior parity on fixed deployment...");

async function testCounters(url, label) {
  console.log(`\n[${label}] Fetching ${url}...`);

  try {
    const html = await fetch(url).then(r => r.text());
    const $ = cheerio.load(html);

    // Check for counter script
    const hasCounterScript = html.includes('document.addEventListener("DOMContentLoaded",()=>{const c=document.querySelectorAll(".counter")');
    console.log(`[${label}] Counter script present: ${hasCounterScript ? '✅' : '❌'}`);

    // Check counter elements
    const counterElements = $(".counter[data-target]");
    console.log(`[${label}] Counter elements found: ${counterElements.length}`);

    // List counters
    counterElements.each((i, el) => {
      const target = $(el).attr("data-target");
      const text = $(el).text().trim();
      const isZero = text === "0" || text === "0%" || text === "0+" || text === "0 min";
      console.log(`[${label}] Counter ${i + 1}: target="${target}", text="${text}" ${isZero ? '⚠️ ' : '✅'}`);
    });

    // Check script order
    const bodyScripts = [];
    $("body script[src]").each((_, el) => {
      const src = $(el).attr("src");
      if (src) bodyScripts.push(src);
    });

    console.log(`[${label}] Body scripts (${bodyScripts.length}):`);
    bodyScripts.slice(0, 3).forEach((script, i) => {
      console.log(`  ${i + 1}. ${script}`);
    });

    // Check for inline scripts
    let inlineCount = 0;
    $("script:not([src])").each((_, el) => {
      const content = $(el).html();
      if (content && content.trim()) {
        inlineCount++;
        if (content.includes("counter") && content.includes("data-target")) {
          console.log(`[${label}] ✅ Counter animation script found (inline #${inlineCount})`);
        }
      }
    });

    console.log(`[${label}] Total inline scripts: ${inlineCount}`);

    return {
      hasCounterScript,
      counterCount: counterElements.length,
      bodyScriptCount: bodyScripts.length,
      inlineCount
    };

  } catch (error) {
    console.error(`[${label}] ❌ Error: ${error.message}`);
    return null;
  }
}

// Test both sites
const prodResults = await testCounters(PROD, "PRODUCTION");
const fixedResults = await testCounters(FIXED_DEPLOY, "FIXED DEPLOY");

// Compare results
console.log("\n=== COMPARISON ===");
if (prodResults && fixedResults) {
  console.log(`Counter script: ${fixedResults.hasCounterScript ? '✅' : '❌'} (production: ${prodResults.hasCounterScript})`);
  console.log(`Counter elements: ${fixedResults.counterCount}/${prodResults.counterCount} ${fixedResults.counterCount === prodResults.counterCount ? '✅' : '❌'}`);
  console.log(`Body scripts: ${fixedResults.bodyScriptCount}/${prodResults.bodyScriptCount} ${fixedResults.bodyScriptCount === prodResults.bodyScriptCount ? '✅' : '❌'}`);
  console.log(`Inline scripts: ${fixedResults.inlineCount}/${prodResults.inlineCount} ${fixedResults.inlineCount === prodResults.inlineCount ? '✅' : '❌'}`);

  if (fixedResults.hasCounterScript && fixedResults.counterCount === prodResults.counterCount) {
    console.log("\n✅ FIXED DEPLOYMENT LOOKS GOOD!");
    console.log("🎯 Counter animations should now work correctly.");
    console.log(`🌐 Test it at: ${FIXED_DEPLOY}`);
  } else {
    console.log("\n❌ Issues remain - check script placement");
  }
} else {
  console.log("❌ Could not complete comparison");
}

console.log(`\n🔗 Fixed deployment URL: ${FIXED_DEPLOY}`);