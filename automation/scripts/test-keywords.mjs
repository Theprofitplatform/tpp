#!/usr/bin/env node

/**
 * Test New Keyword Strategy
 */

const apiKey = 'tuwGL1GDRQt_rWT3XEyJbvd83mn0IUEGc_Q9VLM3Klo';

const testQueries = [
  'professional tradesman tools',
  'business growth chart',
  'professional office desk',
  'data analysis chart',
  'smartphone apps'
];

async function testQuery(query) {
  const url = new URL('https://api.unsplash.com/photos/random');
  url.searchParams.append('query', query);
  url.searchParams.append('orientation', 'landscape');
  url.searchParams.append('content_filter', 'high');

  const response = await fetch(url.toString(), {
    headers: { 'Authorization': `Client-ID ${apiKey}` }
  });

  if (!response.ok) {
    console.log(`❌ "${query}": API error ${response.status}`);
    return;
  }

  const data = await response.json();
  console.log(`✅ "${query}":`);
  console.log(`   Alt: ${data.alt_description || 'N/A'}`);
  console.log(`   Desc: ${data.description || 'N/A'}`);
  console.log(`   Photographer: ${data.user.name}\n`);
}

(async () => {
  console.log('🧪 Testing New Keyword Strategy\n');
  console.log('These are the broader, proven search terms replacing overly specific ones:\n');

  for (const query of testQueries) {
    await testQuery(query);
    await new Promise(r => setTimeout(r, 1500)); // Rate limit friendly
  }

  console.log('✨ Test complete! Review alt descriptions to verify relevance.\n');
})();
