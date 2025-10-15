require('dotenv').config({ path: '.env.local' });

console.log('\n🔍 VPS Automation Configuration Summary\n');
console.log('Core APIs:');
console.log('  Anthropic:', process.env.ANTHROPIC_API_KEY ? '✅ Configured' : '❌ Missing');
console.log('  Perplexity:', process.env.PERPLEXITY_API_KEY ? '✅ Configured' : '❌ Missing');
console.log('  Unsplash:', process.env.UNSPLASH_ACCESS_KEY ? '✅ Configured' : '❌ Missing');
console.log('\nNotifications:');
console.log('  Discord:', process.env.DISCORD_WEBHOOK_URL ? '✅ Configured' : '❌ Missing');
console.log('  Email:', process.env.EMAIL_USER ? '✅ Configured' : '❌ Missing');
console.log('\nAnalytics:');
console.log('  GA4 Property:', process.env.GA4_PROPERTY_ID || '❌ Missing');
console.log('  GA4 Service Account:', process.env.GA4_SERVICE_ACCOUNT_KEY ? '✅ Configured' : '❌ Missing');
console.log('  Search Console:', process.env.SEARCH_CONSOLE_SITE_URL || '❌ Missing');
console.log('\nFeature Flags (default: enabled):');
console.log('  Readability Enhancement:', process.env.ENABLE_READABILITY_ENHANCEMENT !== 'false' ? '✅ Enabled' : '❌ Disabled');
console.log('  Chart Generation:', process.env.ENABLE_CHART_GENERATION !== 'false' ? '✅ Enabled' : '❌ Disabled');
console.log('  Statistics Enrichment:', process.env.ENABLE_STATISTICS_ENRICHMENT !== 'false' ? '✅ Enabled' : '❌ Disabled');
