#!/usr/bin/env node
/**
 * Interactive Analytics Setup
 * Helps configure GA4 and Search Console integration
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

console.log('\n🔧 Analytics Integration Setup\n');
console.log('━'.repeat(60));

console.log('\nThis wizard will help you set up GA4 and Search Console integration.');
console.log('You\'ll need access to:');
console.log('  - Google Cloud Console (console.cloud.google.com)');
console.log('  - Google Analytics 4 (analytics.google.com)');
console.log('  - Google Search Console (search.google.com/search-console)');
console.log('\n━'.repeat(60));

async function main() {
  // Check if .env.local exists
  const envPath = path.join(projectRoot, '.env.local');
  let envExists = false;
  let existingEnv = '';

  try {
    existingEnv = await fs.readFile(envPath, 'utf-8');
    envExists = true;
    console.log('\n✅ Found existing .env.local file');
  } catch (e) {
    console.log('\n📝 Will create new .env.local file');
  }

  console.log('\n' + '━'.repeat(60));
  console.log('\n📋 STEP 1: Google Cloud Console Setup');
  console.log('━'.repeat(60));

  console.log('\n1. Go to: https://console.cloud.google.com');
  console.log('2. Create a new project (or select existing)');
  console.log('3. Go to: APIs & Services → Library');
  console.log('4. Enable these two APIs:');
  console.log('   - "Google Analytics Data API"');
  console.log('   - "Google Search Console API"');
  console.log('\n5. Go to: APIs & Services → Credentials');
  console.log('6. Click: Create Credentials → Service Account');
  console.log('7. Fill in:');
  console.log('   - Name: "blog-analytics"');
  console.log('   - Role: "Viewer"');
  console.log('8. Click on the service account → Keys tab');
  console.log('9. Add Key → Create new key → JSON');
  console.log('10. Download the JSON file');

  const keyPath = await question('\n📁 Enter the full path to your downloaded JSON key file:\n   (e.g., /Users/you/Downloads/blog-analytics-key.json)\n   > ');

  // Verify file exists
  let serviceAccountKey;
  try {
    const keyContent = await fs.readFile(keyPath.trim(), 'utf-8');
    serviceAccountKey = JSON.parse(keyContent);
    console.log(`\n✅ Valid service account key found`);
    console.log(`   Email: ${serviceAccountKey.client_email}`);
  } catch (e) {
    console.log(`\n❌ Error reading key file: ${e.message}`);
    console.log('   Please check the path and try again.');
    rl.close();
    return;
  }

  console.log('\n' + '━'.repeat(60));
  console.log('\n📊 STEP 2: Google Analytics 4 Setup');
  console.log('━'.repeat(60));

  console.log('\n1. Go to: https://analytics.google.com');
  console.log('2. Select your property');
  console.log('3. Go to: Admin (bottom left) → Property Settings');
  console.log('4. Copy the Property ID (number only, e.g., 123456789)');

  const propertyId = await question('\n🔢 Enter your GA4 Property ID:\n   > ');

  const fullPropertyId = propertyId.trim().startsWith('properties/')
    ? propertyId.trim()
    : `properties/${propertyId.trim()}`;

  console.log(`\n   Full Property ID: ${fullPropertyId}`);

  console.log('\n5. Now grant access to the service account:');
  console.log('   - Still in Admin → Property Access Management');
  console.log('   - Click: Add users (+)');
  console.log(`   - Email: ${serviceAccountKey.client_email}`);
  console.log('   - Role: Viewer');
  console.log('   - Click: Add');

  await question('\n✋ Press ENTER once you\'ve granted access in GA4... ');
  console.log('✅ GA4 setup complete!');

  console.log('\n' + '━'.repeat(60));
  console.log('\n🔍 STEP 3: Google Search Console Setup');
  console.log('━'.repeat(60));

  console.log('\n1. Go to: https://search.google.com/search-console');
  console.log('2. Select your property');

  const siteUrl = await question('\n🌐 Enter your verified Search Console site URL:\n   (e.g., https://theprofitplatform.com.au)\n   > ');

  const cleanSiteUrl = siteUrl.trim().replace(/\/$/, ''); // Remove trailing slash

  console.log('\n3. Grant access to the service account:');
  console.log('   - Go to: Settings → Users and permissions');
  console.log('   - Click: Add user');
  console.log(`   - Email: ${serviceAccountKey.client_email}`);
  console.log('   - Permission: Full (or Restricted)');
  console.log('   - Click: Add');

  await question('\n✋ Press ENTER once you\'ve granted access in Search Console... ');
  console.log('✅ Search Console setup complete!');

  console.log('\n' + '━'.repeat(60));
  console.log('\n💾 STEP 4: Save Configuration');
  console.log('━'.repeat(60));

  // Prepare .env.local content
  const newEnvVars = `
# Google Analytics 4
GA4_PROPERTY_ID="${fullPropertyId}"
GA4_SERVICE_ACCOUNT_KEY="${keyPath.trim()}"

# Google Search Console
SEARCH_CONSOLE_SITE_URL="${cleanSiteUrl}"
SEARCH_CONSOLE_SERVICE_ACCOUNT_KEY="${keyPath.trim}"
`;

  if (envExists) {
    // Check if vars already exist
    if (existingEnv.includes('GA4_PROPERTY_ID')) {
      console.log('\n⚠️  GA4 variables already exist in .env.local');
      const overwrite = await question('   Overwrite? (y/n): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('\n   Skipping .env.local update. Manual configuration needed.');
        console.log('\n   Add these to your .env.local:');
        console.log(newEnvVars);
        rl.close();
        return;
      }
    }

    // Append to existing
    await fs.writeFile(envPath, existingEnv + '\n' + newEnvVars);
    console.log('\n✅ Updated .env.local');
  } else {
    // Create new
    await fs.writeFile(envPath, newEnvVars);
    console.log('\n✅ Created .env.local');
  }

  console.log('\n📝 Configuration saved:');
  console.log(`   GA4_PROPERTY_ID="${fullPropertyId}"`);
  console.log(`   GA4_SERVICE_ACCOUNT_KEY="${keyPath.trim()}"`);
  console.log(`   SEARCH_CONSOLE_SITE_URL="${cleanSiteUrl}"`);
  console.log(`   SEARCH_CONSOLE_SERVICE_ACCOUNT_KEY="${keyPath.trim()}"`);

  console.log('\n' + '━'.repeat(60));
  console.log('\n✅ SETUP COMPLETE!');
  console.log('━'.repeat(60));

  console.log('\n🧪 Test your integration by running:');
  console.log('   npm run blog:performance');

  console.log('\n📊 This will show:');
  console.log('   - GA4 pageviews, engagement rates');
  console.log('   - Search Console clicks, impressions, rankings');
  console.log('   - Top performing posts and keywords');

  console.log('\n💡 Tips:');
  console.log('   - It may take 24-48 hours for new data to appear');
  console.log('   - The service account needs "Viewer" access to both properties');
  console.log('   - Keep your JSON key file secure (don\'t commit to Git)');

  console.log('\n━'.repeat(60));
  console.log('');

  rl.close();
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  rl.close();
  process.exit(1);
});
