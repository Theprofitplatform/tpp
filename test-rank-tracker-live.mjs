#!/usr/bin/env node

/**
 * Test Rank Tracker in Production
 * Verifies SERP API key is working
 */

const PRODUCTION_URL = 'https://theprofitplatform.com.au';

async function testRankTracker() {
  console.log('🧪 Testing Rank Tracker in Production...\n');

  const testData = {
    keyword: 'digital marketing Sydney',
    domain: 'theprofitplatform.com.au',
    location: 'Sydney, Australia'
  };

  console.log(`📊 Test Data:
  - Keyword: ${testData.keyword}
  - Domain: ${testData.domain}
  - Location: ${testData.location}
\n`);

  try {
    console.log('🌐 Calling API...');

    const response = await fetch(`${PRODUCTION_URL}/api/serp/rank-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log(`📡 Response Status: ${response.status}\n`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Response:', errorText);
      process.exit(1);
    }

    const result = await response.json();

    if (result.success && result.data) {
      const { rank, found, keyword, domain, location } = result.data;

      console.log('✅ SUCCESS! Rank Tracker is Working!\n');
      console.log('📈 Results:');
      console.log(`  - Keyword: "${keyword}"`);
      console.log(`  - Domain: ${domain}`);
      console.log(`  - Location: ${location}`);
      console.log(`  - Found: ${found ? 'Yes' : 'No'}`);
      console.log(`  - Rank: ${rank ? `#${rank}` : 'Not in top 100'}\n`);

      if (found && rank) {
        if (rank <= 3) {
          console.log('🎉 EXCELLENT! Top 3 ranking!');
        } else if (rank <= 10) {
          console.log('🎯 GREAT! First page ranking!');
        } else if (rank <= 20) {
          console.log('👍 GOOD! Second page ranking!');
        } else {
          console.log('📊 Ranking found in top 100');
        }
      } else {
        console.log('💡 Not ranking in top 100 for this keyword');
      }

      console.log('\n✨ SERP API Key is configured correctly!');
      console.log('✨ Rank Tracker is fully operational!\n');

    } else {
      console.error('❌ Unexpected response format:', result);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error testing rank tracker:', error.message);

    if (error.message.includes('fetch')) {
      console.error('\n💡 Possible causes:');
      console.error('  - Network connectivity issue');
      console.error('  - Production site is down');
      console.error('  - Cloudflare is blocking the request');
    } else if (error.message.includes('SERP_API_KEY')) {
      console.error('\n💡 Possible causes:');
      console.error('  - SERP_API_KEY not set in Cloudflare');
      console.error('  - API key is invalid');
      console.error('  - Need to redeploy after setting key');
    }

    process.exit(1);
  }
}

// Run test
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🧪 RANK TRACKER PRODUCTION TEST');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

testRankTracker();
