/**
 * Test Chart Generation
 * Isolate chart generation to debug
 */

import { generateCharts } from './chart-generator.js';

const testContent = `
## How Google Ads Extensions Improve Performance

Google Ads extensions can boost your click-through rate by 224% compared to standard ads. Our recent analysis of 150 Sydney businesses showed that companies using extensions saw their CTR increase from 2.1% to 6.8%.

When we A/B tested extensions for a Parramatta café, their conversion rate improved from 3.2% to 5.9% - a 84% improvement. The average cost per click dropped from $2.80 to $1.95, saving them over $850 monthly.

## Key Statistics

- Extensions increase CTR by 10-15% on average
- Businesses see 28% more clicks with sitelink extensions
- Call extensions boost phone inquiries by 47%
- Location extensions increase foot traffic by 32%

## Cost Savings

With proper extension optimization, Sydney businesses save an average of $1,200 monthly on ad spend while maintaining the same results.
`;

console.log('Testing chart generation...\n');

const result = await generateCharts(testContent, {
  title: 'Test Article',
  category: 'Google Ads',
  tags: ['testing']
});

console.log('\n=== RESULT ===');
console.log(`Success: ${result.success}`);
console.log(`Charts generated: ${result.charts.length}`);
console.log(`Statistics found: ${result.statisticsFound}`);
console.log(`Content length: ${result.content.length} (original: ${testContent.length})`);
console.log(`Content increased by: ${result.content.length - testContent.length} chars`);

// Check if charts are in content
const hasCharts = result.content.includes('<div class="chart-container"');
console.log(`\nCharts embedded in content: ${hasCharts}`);

if (hasCharts) {
  const chartMatches = result.content.match(/<div class="chart-container"/g);
  console.log(`Number of chart divs found: ${chartMatches?.length || 0}`);
} else {
  console.log('\n❌ Charts NOT found in content!');
  console.log('\nFirst 500 chars of returned content:');
  console.log(result.content.substring(0, 500));
}
