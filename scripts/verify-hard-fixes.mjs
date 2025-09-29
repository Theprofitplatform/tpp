// Verify all hard fixes are working correctly
import { fetch } from "undici";
import * as cheerio from "cheerio";

const DEPLOY_URL = "https://f5cbbbdd.tpp.pages.dev/";

console.log("🔧 [HARD FIXES VERIFICATION] Testing all fixes...");

async function verifyFixes(url) {
  console.log(`\n🌐 Testing ${url}...`);

  try {
    const html = await fetch(url).then(r => r.text());
    const $ = cheerio.load(html);

    const results = {
      // 1. Counter fixes
      counterScript: html.includes('document.addEventListener("DOMContentLoaded",()=>{') && html.includes('querySelectorAll(".counter")'),
      counterElements: $(".counter[data-target]").length,

      // 2. Title + Canonical
      title: $("title").text(),
      canonical: $('link[rel="canonical"]').attr("href"),

      // 3. Navigation semantics
      navToggle: $("#nav-toggle").length > 0,
      primaryNav: $("#primary-nav").length > 0,
      mobileNav: $("#mobileNav").length > 0,

      // 4. Contact links
      telLinks: $('a[href^="tel:+61487286451"]').length,
      emailLinks: $('a[href^="mailto:avi@theprofitplatform.com.au"]').length,

      // 5. Social links
      facebookLinks: $('a[href*="facebook.com/profile.php?id=61574707582255"]').length,
      instagramLinks: $('a[href*="instagram.com/theprofitplatformau"]').length,
      linkedinLinks: $('a[href*="linkedin.com/company/theprofitplatform"]').length,

      // 6. Structured data
      jsonLdScripts: $('script[type="application/ld+json"]').length,
      localBusinessSchema: html.includes('"@type": "LocalBusiness"'),
      faqSchema: html.includes('"@type": "FAQPage"'),

      // 7. Scripts order
      vendorJs: html.includes('src="/js/vendor.js"'),
      pluginsJs: html.includes('src="/js/plugins.js"'),
      mainJs: html.includes('src="/js/main.js"'),

      // 8. Headers
      headersFile: null, // Will check separately

      // Additional checks
      ogTags: $('meta[property^="og:"]').length,
      twitterTags: $('meta[property^="twitter:"]').length,
      metaTags: $('meta').length
    };

    return results;

  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return null;
  }
}

// Test the deployment
const results = await verifyFixes(DEPLOY_URL);

if (results) {
  console.log("\n" + "=".repeat(60));
  console.log("🔧 HARD FIXES VERIFICATION RESULTS");
  console.log("=".repeat(60));

  let passCount = 0;
  let totalChecks = 0;

  function check(condition, description, critical = false) {
    totalChecks++;
    const status = condition ? "✅" : (critical ? "❌" : "⚠️");
    const criticalLabel = critical ? " [CRITICAL]" : "";

    if (condition) passCount++;

    console.log(`${status} ${description}${criticalLabel}`);
    return condition;
  }

  // 1. Counter fixes (CRITICAL)
  console.log("\n🎯 1. COUNTER FIXES:");
  check(results.counterScript, "Counter animation script present", true);
  check(results.counterElements === 6, `Counter elements (${results.counterElements}/6)`, true);

  // 2. Title + Canonical (CRITICAL)
  console.log("\n📋 2. TITLE + CANONICAL:");
  const correctTitle = results.title === "The Profit Platform — Sydney Digital Marketing Expert";
  check(correctTitle, `Title: "${results.title}"`, true);
  const correctCanonical = results.canonical === "https://theprofitplatform.com.au/";
  check(correctCanonical, `Canonical: "${results.canonical}"`, true);

  // 3. Navigation semantics
  console.log("\n🧭 3. NAVIGATION SEMANTICS:");
  check(results.navToggle > 0, "nav-toggle button present");
  check(results.primaryNav > 0, "primary-nav element present");
  check(results.mobileNav > 0, "Mobile navigation present");

  // 4. Contact links
  console.log("\n📞 4. CONTACT LINKS:");
  check(results.telLinks >= 3, `Tel links (${results.telLinks} found)`);
  check(results.emailLinks >= 1, `Email links (${results.emailLinks} found)`);

  // 5. Social links
  console.log("\n📱 5. SOCIAL LINKS:");
  check(results.facebookLinks >= 1, `Facebook links (${results.facebookLinks} found)`);
  check(results.instagramLinks >= 1, `Instagram links (${results.instagramLinks} found)`);
  check(results.linkedinLinks >= 1, `LinkedIn links (${results.linkedinLinks} found)`);

  // 6. Structured data
  console.log("\n🏢 6. STRUCTURED DATA:");
  check(results.jsonLdScripts >= 2, `JSON-LD scripts (${results.jsonLdScripts} found)`);
  check(results.localBusinessSchema, "LocalBusiness schema present");
  check(results.faqSchema, "FAQ schema present");

  // 7. Script order
  console.log("\n📜 7. SCRIPT ORDER:");
  check(results.vendorJs, "vendor.js loaded");
  check(results.pluginsJs, "plugins.js loaded");
  check(results.mainJs, "main.js loaded");

  // 8. SEO & Meta
  console.log("\n🔍 8. SEO & META:");
  check(results.ogTags >= 8, `Open Graph tags (${results.ogTags} found)`);
  check(results.twitterTags >= 5, `Twitter tags (${results.twitterTags} found)`);
  check(results.metaTags >= 20, `Meta tags (${results.metaTags} found)`);

  // Final score
  const percentage = Math.round((passCount / totalChecks) * 100);

  console.log("\n" + "=".repeat(60));
  console.log(`🏆 FINAL SCORE: ${passCount}/${totalChecks} (${percentage}%)`);
  console.log("=".repeat(60));

  if (percentage >= 95) {
    console.log("🎉 EXCELLENT! All hard fixes implemented successfully!");
    console.log("✅ Ready for production use!");
  } else if (percentage >= 85) {
    console.log("👍 GOOD! Most fixes working correctly.");
    console.log("⚠️  Minor issues detected - see above.");
  } else {
    console.log("⚠️  NEEDS ATTENTION! Some fixes may not be working.");
    console.log("🔧 Check critical issues above.");
  }

  // Specific recommendations
  console.log("\n🔧 VERIFICATION SUMMARY:");
  console.log(`🌐 Deployment URL: ${DEPLOY_URL}`);
  console.log("📋 Test manually:");
  console.log("   • Counters animate when scrolled into view");
  console.log("   • Navigation toggle works on mobile");
  console.log("   • Tel/mailto links are clickable");
  console.log("   • No 404 errors in browser console");
  console.log("   • Page loads quickly with proper caching");

} else {
  console.log("❌ Could not complete verification - deployment may have issues");
}

console.log("\n✅ [HARD FIXES VERIFICATION] Complete!");