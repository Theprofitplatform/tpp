#!/usr/bin/env node

/**
 * Download Production Assets
 *
 * Downloads critical assets from production for local testing
 * Currently just validates that assets are accessible
 */

import https from 'https';

const PROD_URL = 'https://theprofitplatform.com.au';

console.log('📦 Checking production assets...');

async function checkAsset(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        console.log(`  ✅ ${url} (${res.headers['content-length']} bytes)`);
        resolve(true);
      } else {
        console.log(`  ⚠️  ${url} - HTTP ${res.statusCode}`);
        resolve(false);
      }
      res.resume(); // Consume response data
    }).on('error', () => {
      console.log(`  ❌ ${url} - Failed to fetch`);
      resolve(false);
    });
  });
}

// Check key assets exist
const assets = [
  `${PROD_URL}/favicon.ico`,
  `${PROD_URL}/robots.txt`,
];

console.log('\nChecking assets:');

for (const asset of assets) {
  await checkAsset(asset);
}

console.log('\n✅ Asset check complete');
