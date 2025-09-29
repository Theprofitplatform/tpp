// Behavior Parity Scanner - Comprehensive behavior verification
import { fetch } from "undici";
import * as cheerio from "cheerio";
import { readFile } from "node:fs/promises";

const PROD_URL = "https://theprofitplatform.com.au/";
const LOCAL_URL = "http://localhost:4321/";

console.log("🔍 [BEHAVIOR PARITY SCANNER] Starting comprehensive verification...");

async function scanSite(url, label) {
  console.log(`\n🌐 [${label}] Scanning ${url}...`);

  try {
    const html = await fetch(url).then(r => r.text());
    const $ = cheerio.load(html);

    const results = {
      // Counter Elements
      counterElements: $(".counter[data-target]").length,
      counterTargets: [],

      // Counter Animation Script
      hasCounterScript: html.includes('document.addEventListener("DOMContentLoaded",()=>{const c=document.querySelectorAll(".counter")'),

      // Script Order Analysis
      bodyScripts: [],
      inlineScripts: 0,
      externalScripts: 0,

      // Menu & Navigation
      menuToggle: $("#menuToggle, .menu-toggle").length,
      mobileNav: $("#mobileNav, .mobile-nav").length,
      navOverlay: $("#mobileNavOverlay, .mobile-nav-overlay").length,

      // Tel Links
      telLinks: $('a[href^="tel:"]').length,
      telHrefs: [],

      // JSON-LD Schema
      jsonLdScripts: $('script[type="application/ld+json"]').length,

      // Key Sections
      heroSection: $(".hero-modern, .hero").length,
      trustSection: $(".trust-signals-section, .trusted-by").length,
      pricingSection: $(".pricing").length,
      contactSection: $(".contact").length,

      // CSS and Assets
      cssLinks: $('link[rel="stylesheet"]').length,

      // Performance indicators
      title: $("title").text(),
      metaTags: $("meta").length
    };

    // Collect counter targets
    $(".counter[data-target]").each((_, el) => {
      const target = $(el).attr("data-target");
      const text = $(el).text().trim();
      results.counterTargets.push({ target, text });
    });

    // Collect tel links
    $('a[href^="tel:"]').each((_, el) => {
      results.telHrefs.push($(el).attr("href"));
    });

    // Analyze body scripts
    $("body script").each((_, el) => {
      const src = $(el).attr("src");
      const content = $(el).html();

      if (src) {
        results.externalScripts++;
        results.bodyScripts.push({ type: "external", src });
      } else if (content && content.trim()) {
        results.inlineScripts++;
        results.bodyScripts.push({
          type: "inline",
          preview: content.substring(0, 80).replace(/\n/g, ' ') + "..."
        });
      }
    });

    return results;

  } catch (error) {
    console.error(`❌ [${label}] Error: ${error.message}`);
    return null;
  }
}

// Scan both sites
const prodResults = await scanSite(PROD_URL, "PRODUCTION");
const localResults = await scanSite(LOCAL_URL, "LOCAL");

// Comparison and Analysis
console.log("\n" + "=".repeat(60));
console.log("📊 BEHAVIOR PARITY ANALYSIS");
console.log("=".repeat(60));

if (prodResults && localResults) {
  let score = 0;
  let maxScore = 0;

  function checkParity(field, prodValue, localValue, description, critical = false) {
    maxScore += critical ? 20 : 10;
    const match = JSON.stringify(prodValue) === JSON.stringify(localValue);
    const points = match ? (critical ? 20 : 10) : 0;
    score += points;

    const status = match ? "✅" : (critical ? "❌" : "⚠️");
    const criticalLabel = critical ? " [CRITICAL]" : "";

    console.log(`${status} ${description}${criticalLabel}`);
    console.log(`   Production: ${JSON.stringify(prodValue)}`);
    console.log(`   Local: ${JSON.stringify(localValue)}`);
    if (!match && critical) {
      console.log(`   🚨 CRITICAL MISMATCH - This will break functionality!`);
    }
    console.log("");

    return match;
  }

  // Critical checks (behavior-breaking)
  const counterScriptMatch = checkParity(
    "counterScript",
    prodResults.hasCounterScript,
    localResults.hasCounterScript,
    "Counter Animation Script Present",
    true
  );

  const counterCountMatch = checkParity(
    "counterCount",
    prodResults.counterElements,
    localResults.counterElements,
    "Counter Elements Count",
    true
  );

  const menuElementsMatch = checkParity(
    "menuElements",
    [prodResults.menuToggle, prodResults.mobileNav, prodResults.navOverlay],
    [localResults.menuToggle, localResults.mobileNav, localResults.navOverlay],
    "Menu & Navigation Elements",
    true
  );

  // Important checks
  checkParity(
    "bodyScriptCount",
    prodResults.bodyScripts.length,
    localResults.bodyScripts.length,
    "Total Body Scripts"
  );

  checkParity(
    "inlineScripts",
    prodResults.inlineScripts,
    localResults.inlineScripts,
    "Inline Scripts Count"
  );

  checkParity(
    "externalScripts",
    prodResults.externalScripts,
    localResults.externalScripts,
    "External Scripts Count"
  );

  checkParity(
    "telLinks",
    prodResults.telLinks,
    localResults.telLinks,
    "Tel Links Count"
  );

  checkParity(
    "jsonLdScripts",
    prodResults.jsonLdScripts,
    localResults.jsonLdScripts,
    "JSON-LD Schema Scripts"
  );

  checkParity(
    "cssLinks",
    prodResults.cssLinks,
    localResults.cssLinks,
    "CSS Links Count"
  );

  checkParity(
    "keySections",
    [prodResults.heroSection, prodResults.trustSection, prodResults.pricingSection],
    [localResults.heroSection, localResults.trustSection, localResults.pricingSection],
    "Key Sections Present"
  );

  // Counter targets analysis
  console.log("🎯 COUNTER TARGETS ANALYSIS:");
  console.log("Production targets:", prodResults.counterTargets.map(c => `${c.target}(${c.text})`).join(", "));
  console.log("Local targets:", localResults.counterTargets.map(c => `${c.target}(${c.text})`).join(", "));

  const counterTargetsMatch = JSON.stringify(prodResults.counterTargets) === JSON.stringify(localResults.counterTargets);
  console.log(counterTargetsMatch ? "✅ Counter targets match" : "❌ Counter targets mismatch");
  console.log("");

  // Tel links analysis
  console.log("📞 TEL LINKS ANALYSIS:");
  console.log("Production tel links:", prodResults.telHrefs.join(", "));
  console.log("Local tel links:", localResults.telHrefs.join(", "));

  const telLinksMatch = JSON.stringify(prodResults.telHrefs) === JSON.stringify(localResults.telHrefs);
  console.log(telLinksMatch ? "✅ Tel links match" : "❌ Tel links mismatch");
  console.log("");

  // Final Score and Recommendation
  const percentage = Math.round((score / maxScore) * 100);

  console.log("=" .repeat(60));
  console.log(`🏆 FINAL PARITY SCORE: ${score}/${maxScore} (${percentage}%)`);
  console.log("=".repeat(60));

  if (percentage >= 95) {
    console.log("🎉 EXCELLENT! Near-perfect parity achieved.");
    console.log("✅ Ready for deployment!");
  } else if (percentage >= 85) {
    console.log("👍 GOOD! Minor differences detected.");
    console.log("⚠️  Review warnings above before deploying.");
  } else if (percentage >= 70) {
    console.log("⚠️  NEEDS WORK! Significant differences detected.");
    console.log("❌ Fix critical issues before deploying.");
  } else {
    console.log("❌ POOR! Major parity issues detected.");
    console.log("🚨 Requires significant fixes before deployment.");
  }

  // Specific recommendations
  if (!counterScriptMatch || !counterCountMatch) {
    console.log("\n🔧 COUNTER ANIMATION ISSUES:");
    console.log("   • Check BaseLayout.astro for exact counter script placement");
    console.log("   • Ensure counter elements have correct data-target attributes");
    console.log("   • Verify script execution order matches production");
  }

  if (!menuElementsMatch) {
    console.log("\n🔧 NAVIGATION ISSUES:");
    console.log("   • Check mobile menu toggle functionality");
    console.log("   • Verify menu overlay and navigation elements");
    console.log("   • Test menu open/close animations");
  }

  console.log(`\n🌐 Local URL: ${LOCAL_URL}`);
  console.log(`🌐 Production URL: ${PROD_URL}`);

} else {
  console.log("❌ Could not complete comparison - one or both sites failed to load");
}

console.log("\n✅ [BEHAVIOR PARITY SCANNER] Scan complete!");