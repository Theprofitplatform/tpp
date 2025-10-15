/**
 * Test Google Ads API Connection
 * Run: node scripts/test-google-ads-connection.js
 */

require('dotenv').config({ path: '.env.local' });
const { GoogleAdsApi } = require('google-ads-api');

// Validate environment variables
const requiredVars = [
  'GOOGLE_ADS_CLIENT_ID',
  'GOOGLE_ADS_CLIENT_SECRET',
  'GOOGLE_ADS_DEVELOPER_TOKEN',
  'GOOGLE_ADS_REFRESH_TOKEN',
  'GOOGLE_ADS_CUSTOMER_ID',
];

const missing = requiredVars.filter(v => !process.env[v]);
if (missing.length > 0) {
  console.error('❌ Missing environment variables:');
  missing.forEach(v => console.error(`  - ${v}`));
  console.error('\nPlease add them to .env.local');
  process.exit(1);
}

// Initialize Google Ads API client
const client = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
});

const customer = client.Customer({
  customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
  refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
  login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || process.env.GOOGLE_ADS_CUSTOMER_ID,
});

async function testConnection() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🧪 Testing Google Ads API Connection');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('Configuration:');
  console.log(`  Customer ID: ${process.env.GOOGLE_ADS_CUSTOMER_ID}`);
  console.log(`  Login Customer ID: ${process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || process.env.GOOGLE_ADS_CUSTOMER_ID}`);
  console.log(`  Developer Token: ${process.env.GOOGLE_ADS_DEVELOPER_TOKEN.substring(0, 10)}...`);
  console.log('');

  try {
    console.log('📡 Requesting keyword ideas for "digital marketing Sydney"...\n');

    const request = {
      customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
      language: 'languageConstants/1000', // English
      geo_target_constants: ['geoTargetConstants/2036'], // Australia
      include_adult_keywords: false,
      keyword_seed: {
        keywords: ['digital marketing Sydney'],
      },
    };

    const ideas = await customer.keywordPlanIdeas.generateKeywordIdeas(request);

    console.log('✅ Connection successful!\n');
    console.log(`📊 Found ${ideas.length} keyword ideas\n`);

    if (ideas.length > 0) {
      console.log('Sample results (first 5):');
      console.log('─────────────────────────────────────────────────────────────');

      ideas.slice(0, 5).forEach((idea, index) => {
        const keyword = idea.text;
        const avgMonthlySearches = idea.keyword_idea_metrics?.avg_monthly_searches || 0;
        const competition = idea.keyword_idea_metrics?.competition || 'UNKNOWN';
        const lowTopPageBid = idea.keyword_idea_metrics?.low_top_of_page_bid_micros
          ? (idea.keyword_idea_metrics.low_top_of_page_bid_micros / 1000000).toFixed(2)
          : 'N/A';
        const highTopPageBid = idea.keyword_idea_metrics?.high_top_of_page_bid_micros
          ? (idea.keyword_idea_metrics.high_top_of_page_bid_micros / 1000000).toFixed(2)
          : 'N/A';

        console.log(`\n${index + 1}. ${keyword}`);
        console.log(`   Volume: ${avgMonthlySearches.toLocaleString()}/mo`);
        console.log(`   Competition: ${competition}`);
        console.log(`   CPC Range: $${lowTopPageBid} - $${highTopPageBid}`);
      });

      console.log('\n─────────────────────────────────────────────────────────────');
    }

    console.log('\n✅ Test completed successfully!');
    console.log('You can now use the API in production.\n');
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Connection failed!\n');
    console.error('Error:', error.message);

    if (error.errors) {
      console.error('\nDetailed errors:');
      error.errors.forEach((err, i) => {
        console.error(`  ${i + 1}. ${err.error_code?.authentication_error || err.message}`);
        if (err.message) console.error(`     ${err.message}`);
      });
    }

    console.error('\nTroubleshooting:');
    console.error('  1. Verify your developer token is approved');
    console.error('  2. Check customer ID is correct (no dashes)');
    console.error('  3. Ensure refresh token is valid');
    console.error('  4. Verify OAuth credentials match your project');
    console.error('  5. Check if billing is enabled in Google Ads account\n');
    console.error('═══════════════════════════════════════════════════════════════\n');
    process.exit(1);
  }
}

testConnection();
