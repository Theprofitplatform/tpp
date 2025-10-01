#!/usr/bin/env node

// Quick production verification test using Node.js built-in fetch
const PROD_URL = "https://theprofitplatform.com.au/";
const PREVIEW_URL = "https://tpp.pages.dev/";

async function fetchHTML(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error.message);
    return null;
  }
}

async function checkBasics(html, url) {
  if (!html) return { error: "Could not fetch HTML" };

  const checks = {
    hasTitle: html.includes('<title>'),
    hasDescription: html.includes('name="description"'),
    hasCanonical: html.includes('rel="canonical"'),
    hasLocalBusiness: html.includes('"LocalBusiness"'),
    hasFAQPage: html.includes('"FAQPage"'),
    hasTelLink: html.includes('href="tel:'),
    hasMailtoLink: html.includes('href="mailto:'),
    hasAriaExpanded: html.includes('aria-expanded'),
    hasCounters: html.includes('class="counter"') || html.includes('data-target='),
    title: (html.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1] || "Not found",
    description: (html.match(/name="description"[^>]*content="([^"]+)"/i) || [])[1] || "Not found"
  };

  return checks;
}

async function main() {
  console.log("🔍 Production Verification Test\n");

  console.log("Fetching production site...");
  const prodHTML = await fetchHTML(PROD_URL);
  const prodChecks = await checkBasics(prodHTML, PROD_URL);

  console.log("Fetching preview site...");
  const prevHTML = await fetchHTML(PREVIEW_URL);
  const prevChecks = await checkBasics(prevHTML, PREVIEW_URL);

  console.log("\n📊 PRODUCTION SITE RESULTS:");
  console.log("=" + "=".repeat(40));
  Object.entries(prodChecks).forEach(([key, value]) => {
    const status = typeof value === 'boolean' ? (value ? '✅' : '❌') : '📝';
    console.log(`${status} ${key}: ${value}`);
  });

  console.log("\n📊 PREVIEW SITE RESULTS:");
  console.log("=" + "=".repeat(40));
  Object.entries(prevChecks).forEach(([key, value]) => {
    const status = typeof value === 'boolean' ? (value ? '✅' : '❌') : '📝';
    console.log(`${status} ${key}: ${value}`);
  });

  // Basic parity check
  const titleMatch = prodChecks.title === prevChecks.title;
  const descMatch = prodChecks.description === prevChecks.description;

  console.log("\n🎯 PARITY CHECK:");
  console.log("=" + "=".repeat(40));
  console.log(`${titleMatch ? '✅' : '❌'} Title match: ${titleMatch}`);
  console.log(`${descMatch ? '✅' : '❌'} Description match: ${descMatch}`);

  const allGood = Object.values(prevChecks).filter(v => typeof v === 'boolean').every(v => v === true);

  console.log("\n🏆 FINAL RESULT:");
  console.log("=" + "=".repeat(40));
  console.log(`${allGood ? '🎉 ALL CHECKS PASSED!' : '⚠️  Some checks failed'}`);

  if (!allGood) {
    process.exit(1);
  }
}

main().catch(console.error);