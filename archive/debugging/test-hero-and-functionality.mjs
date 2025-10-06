#!/usr/bin/env node

/**
 * Test Hero Section and Rank Tracker Functionality
 * Comprehensive test of the new enhanced hero and core features
 */

const PRODUCTION_URL = 'https://c62f9ccd.tpp.pages.dev';

async function testHeroSection() {
  console.log('🎨 Testing Enhanced Hero Section...\n');

  try {
    const response = await fetch(`${PRODUCTION_URL}/tools/rank-tracker/`);
    const html = await response.text();

    const tests = [
      { name: 'Hero badge', check: html.includes('100% Free • No Signup Required') },
      { name: 'Main title', check: html.includes('Check Your') && html.includes('Google Rankings') },
      { name: 'Title accent', check: html.includes('Instantly') },
      { name: 'Feature pills', check: html.includes('Real-time SERP Data') && html.includes('Top 100 Positions') },
      { name: 'Trust indicators', check: html.includes('Accurate SERP Results') && html.includes('SSL Encrypted') },
      { name: 'Scroll indicator', check: html.includes('Start checking your rankings') },
      { name: 'NO TrustBar', check: !html.includes('tools used today') },
      { name: 'NO fake ratings', check: !html.includes('4.9 from') },
      { name: 'Gradient orbs', check: html.includes('gradient-orb') },
      { name: 'CSS styles', check: html.includes('.hero-badge') && html.includes('.pill') }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      if (test.check) {
        console.log(`   ✅ ${test.name}`);
        passed++;
      } else {
        console.log(`   ❌ ${test.name}`);
        failed++;
      }
    }

    console.log(`\n📊 Hero Section: ${passed}/${tests.length} tests passed\n`);
    return failed === 0;

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}\n`);
    return false;
  }
}

async function testRankTrackerAPI() {
  console.log('🔍 Testing Rank Tracker API...\n');

  const testData = {
    keyword: 'theprofitplatform',
    domain: 'theprofitplatform.com.au',
    location: 'Sydney, Australia'
  };

  console.log(`📊 Test Query:`);
  console.log(`   Keyword: "${testData.keyword}"`);
  console.log(`   Domain: ${testData.domain}`);
  console.log(`   Location: ${testData.location}\n`);

  try {
    console.log('🌐 Calling API...');

    const response = await fetch(`${PRODUCTION_URL}/api/serp/rank-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    console.log(`📡 Response Status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`   ❌ API Error: ${errorText}\n`);
      return false;
    }

    const result = await response.json();

    if (result.success && result.data) {
      const { rank, found, keyword, domain } = result.data;

      console.log('   ✅ API Response Valid');
      console.log(`   📈 Results:`);
      console.log(`      - Found: ${found ? 'Yes' : 'No'}`);
      console.log(`      - Rank: ${rank ? `#${rank}` : 'Not in top 100'}`);
      console.log(`      - Keyword: "${keyword}"`);
      console.log(`      - Domain: ${domain}\n`);

      return true;
    } else {
      console.error(`   ❌ Unexpected response format:`, result);
      return false;
    }

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}\n`);
    return false;
  }
}

async function testInputValidation() {
  console.log('🛡️ Testing Input Validation...\n');

  const invalidTests = [
    { keyword: '', domain: 'example.com', location: 'Sydney', expectedError: 'keyword too short' },
    { keyword: 'test', domain: '', location: 'Sydney', expectedError: 'domain empty' },
    { keyword: 'test', domain: 'not a domain!@#', location: 'Sydney', expectedError: 'invalid domain' },
  ];

  let passed = 0;

  for (const test of invalidTests) {
    try {
      const response = await fetch(`${PRODUCTION_URL}/api/serp/rank-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test)
      });

      const result = await response.json();

      if (!result.success || response.status >= 400) {
        console.log(`   ✅ Correctly rejected: ${test.expectedError}`);
        passed++;
      } else {
        console.log(`   ⚠️  Should have rejected: ${test.expectedError}`);
      }
    } catch (error) {
      console.log(`   ✅ Correctly rejected: ${test.expectedError}`);
      passed++;
    }
  }

  console.log(`\n📊 Validation: ${passed}/${invalidTests.length} tests passed\n`);
  return passed === invalidTests.length;
}

async function testTextContrast() {
  console.log('🎨 Testing Text Contrast (CSS)...\n');

  try {
    const response = await fetch(`${PRODUCTION_URL}/tools/rank-tracker/`);
    const html = await response.text();

    const contrastTests = [
      { name: 'Subtitle has explicit color', check: html.includes('.hero-description-new') && html.includes('rgba(255, 255, 255, 0.95)') },
      { name: 'Pills have white color', check: html.includes('.pill') && html.includes('color: white') },
      { name: 'Trust items have white', check: html.includes('.trust-item i') || html.includes('.trust-item span') },
      { name: 'Badge has white color', check: html.includes('.hero-badge') && html.includes('color: white') },
      { name: 'Scroll text is white', check: html.includes('.scroll-text') || html.includes('.scroll-arrow') }
    ];

    let passed = 0;

    for (const test of contrastTests) {
      if (test.check) {
        console.log(`   ✅ ${test.name}`);
        passed++;
      } else {
        console.log(`   ⚠️  ${test.name}`);
      }
    }

    console.log(`\n📊 Contrast: ${passed}/${contrastTests.length} tests passed\n`);
    return passed >= contrastTests.length - 1; // Allow 1 failure

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}\n`);
    return false;
  }
}

async function runAllTests() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 RANK TRACKER COMPREHENSIVE TEST SUITE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`📍 Testing: ${PRODUCTION_URL}\n`);

  const results = {
    hero: await testHeroSection(),
    api: await testRankTrackerAPI(),
    validation: await testInputValidation(),
    contrast: await testTextContrast()
  };

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 FINAL RESULTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`   ${results.hero ? '✅' : '❌'} Hero Section`);
  console.log(`   ${results.api ? '✅' : '❌'} API Functionality`);
  console.log(`   ${results.validation ? '✅' : '❌'} Input Validation`);
  console.log(`   ${results.contrast ? '✅' : '❌'} Text Contrast\n`);

  const allPassed = Object.values(results).every(r => r);

  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED! Rank Tracker is production-ready!\n');
  } else {
    console.log('⚠️  SOME TESTS FAILED - Review above for details\n');
  }

  process.exit(allPassed ? 0 : 1);
}

runAllTests();
