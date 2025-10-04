#!/usr/bin/env node

const tests = [
  {
    keyword: 'theprofitplatform',
    domain: 'theprofitplatform.com.au',
    location: 'Sydney, Australia',
    description: 'Brand keyword test'
  },
  {
    keyword: 'profit platform sydney',
    domain: 'theprofitplatform.com.au', 
    location: 'Sydney, Australia',
    description: 'Brand variation test'
  }
];

async function runTests() {
  console.log('🧪 Running final verification tests...\n');

  for (const test of tests) {
    console.log(`\n📊 ${test.description}`);
    console.log(`   Keyword: "${test.keyword}"`);
    
    try {
      const response = await fetch('https://theprofitplatform.com.au/api/serp/rank-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: test.keyword,
          domain: test.domain,
          location: test.location
        })
      });

      const result = await response.json();
      
      if (result.success && result.data.found) {
        console.log(`   ✅ Found at rank #${result.data.rank}`);
      } else {
        console.log(`   ℹ️  Not in top 100`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n✨ All tests complete!');
}

runTests();
