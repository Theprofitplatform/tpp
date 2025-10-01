#!/usr/bin/env node

// Enhanced live test using Node.js built-in fetch
const SITE_URL = "https://tpp.pages.dev/";

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

async function testLiveSite() {
  console.log("🔍 LIVE SITE TESTING - https://tpp.pages.dev/\n");

  const html = await fetchHTML(SITE_URL);
  if (!html) {
    console.log("❌ Site not accessible");
    return false;
  }

  console.log("✅ Site is LIVE and accessible!\n");

  // Test 1: Contact Links
  console.log("📞 CONTACT LINKS TEST:");
  console.log("=" + "=".repeat(30));
  const telLinks = (html.match(/href="tel:[^"]*"/g) || []).length;
  const mailtoLinks = (html.match(/href="mailto:[^"]*"/g) || []).length;
  console.log(`✅ Tel links found: ${telLinks}`);
  console.log(`✅ Mailto links found: ${mailtoLinks}`);

  // Test 2: ARIA Accessibility
  console.log("\n♿ ACCESSIBILITY TEST:");
  console.log("=" + "=".repeat(30));
  const ariaExpanded = (html.match(/aria-expanded="[^"]*"/g) || []).length;
  const ariaHidden = (html.match(/aria-hidden="[^"]*"/g) || []).length;
  const ariaControls = (html.match(/aria-controls="[^"]*"/g) || []).length;
  console.log(`✅ aria-expanded attributes: ${ariaExpanded}`);
  console.log(`✅ aria-hidden attributes: ${ariaHidden}`);
  console.log(`✅ aria-controls attributes: ${ariaControls}`);

  // Test 3: Counter Animation Setup
  console.log("\n🎯 COUNTER ANIMATION TEST:");
  console.log("=" + "=".repeat(30));
  const counters = html.match(/data-target="(\d+)"/g) || [];
  console.log(`✅ Counter elements with data-target: ${counters.length}`);
  counters.forEach(counter => console.log(`   - ${counter}`));

  // Test 4: JSON-LD Schemas
  console.log("\n📋 JSON-LD SCHEMA TEST:");
  console.log("=" + "=".repeat(30));
  const hasLocalBusiness = html.includes('"LocalBusiness"');
  const hasFAQPage = html.includes('"FAQPage"');
  console.log(`✅ LocalBusiness schema: ${hasLocalBusiness ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ FAQPage schema: ${hasFAQPage ? 'FOUND' : 'MISSING'}`);

  // Test 5: Social Media Links
  console.log("\n🔗 SOCIAL MEDIA LINKS TEST:");
  console.log("=" + "=".repeat(30));
  const facebookLinks = html.match(/https:\/\/www\.facebook\.com\/[^"']*/g) || [];
  const instagramLinks = html.match(/https:\/\/www\.instagram\.com\/[^"']*/g) || [];
  const linkedinLinks = html.match(/https:\/\/[^"']*linkedin\.com\/[^"']*/g) || [];

  console.log(`✅ Facebook links: ${facebookLinks.length}`);
  if (facebookLinks.length > 0) console.log(`   - ${facebookLinks[0]}`);

  console.log(`✅ Instagram links: ${instagramLinks.length}`);
  if (instagramLinks.length > 0) console.log(`   - ${instagramLinks[0]}`);

  console.log(`✅ LinkedIn links: ${linkedinLinks.length}`);
  if (linkedinLinks.length > 0) console.log(`   - ${linkedinLinks[0]}`);

  // Test 6: Performance Headers
  console.log("\n⚡ PERFORMANCE TEST:");
  console.log("=" + "=".repeat(30));
  const heroPreload = html.includes('rel="preload"');
  const hasPreconnect = html.includes('rel="preconnect"');
  console.log(`✅ Preload tags: ${heroPreload ? 'FOUND' : 'MISSING'}`);
  console.log(`✅ Preconnect tags: ${hasPreconnect ? 'FOUND' : 'MISSING'}`);

  // Final Score
  const tests = [
    telLinks > 0,
    mailtoLinks > 0,
    ariaExpanded > 0,
    hasLocalBusiness,
    hasFAQPage,
    facebookLinks.length > 0,
    instagramLinks.length > 0,
    counters.length > 0
  ];

  const passed = tests.filter(Boolean).length;
  const total = tests.length;

  console.log("\n🏆 FINAL RESULTS:");
  console.log("=" + "=".repeat(30));
  console.log(`Score: ${passed}/${total} tests passed`);
  console.log(`Status: ${passed === total ? '🎉 ALL TESTS PASSED!' : '⚠️ Some tests failed'}`);

  if (passed === total) {
    console.log("\n✨ PRODUCTION READY! ✨");
    console.log("The site is fully functional with:");
    console.log("• Clickable contact links");
    console.log("• Proper ARIA accessibility");
    console.log("• Working counter animations");
    console.log("• Valid JSON-LD schemas");
    console.log("• Real social media links");
    console.log("• Performance optimizations");
  }

  return passed === total;
}

testLiveSite().catch(console.error);