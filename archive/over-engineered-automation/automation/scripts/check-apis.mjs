#!/usr/bin/env node
/**
 * Check if Search Console API is enabled and service account has access
 */

import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

dotenv.config({ path: path.join(projectRoot, '.env.local') });

async function getAccessToken() {
  const keyPath = process.env.SEARCH_CONSOLE_SERVICE_ACCOUNT_KEY;
  const keyContent = await fs.readFile(keyPath, 'utf-8');
  const credentials = JSON.parse(keyContent);

  const now = Math.floor(Date.now() / 1000);
  const jwtClaim = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const token = jwt.sign(jwtClaim, credentials.private_key, {
    algorithm: 'RS256',
    header: { alg: 'RS256', typ: 'JWT' }
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${token}`
  });

  const data = await response.json();
  return data.access_token;
}

console.log('\n🔍 Checking Search Console API Status...\n');
console.log('━'.repeat(60));

try {
  const token = await getAccessToken();
  console.log('\n✅ Service account authentication: OK');

  // Try to list Search Console sites
  const response = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.ok) {
    const data = await response.json();
    console.log('✅ Search Console API: ENABLED\n');
    console.log('━'.repeat(60));
    console.log('\n📋 Search Console Properties Accessible:\n');
    if (data.siteEntry && data.siteEntry.length > 0) {
      data.siteEntry.forEach(site => {
        console.log(`   ✅ ${site.siteUrl}`);
        console.log(`      Permission: ${site.permissionLevel}\n`);
      });

      const configuredUrl = process.env.SEARCH_CONSOLE_SITE_URL;
      const hasAccess = data.siteEntry.some(s => s.siteUrl === configuredUrl);

      console.log('━'.repeat(60));
      console.log(`\n📝 Configured in .env.local: ${configuredUrl}`);
      if (hasAccess) {
        console.log('   ✅ Service account HAS access to this property!\n');
      } else {
        console.log('   ❌ Service account DOES NOT have access to this property!\n');
        console.log('   Action: Go to Search Console and add:');
        console.log(`   ${data.siteEntry[0]?.permissionLevel ? 'Re-add' : 'Add'} blog-analytics@robotic-goal-456009-r2.iam.gserviceaccount.com\n`);
      }
    } else {
      console.log('   ❌ NO properties accessible\n');
      console.log('━'.repeat(60));
      console.log('\n❌ Service account has NO access to ANY Search Console properties\n');
      console.log('   Action needed:');
      console.log('   1. Go to: https://search.google.com/search-console');
      console.log('   2. Settings → Users and permissions');
      console.log('   3. Add: blog-analytics@robotic-goal-456009-r2.iam.gserviceaccount.com');
      console.log('   4. Permission: Full\n');
    }
  } else {
    const error = await response.json();
    console.log('━'.repeat(60));
    if (error.error.code === 403) {
      if (error.error.message.includes('has not been used')) {
        console.log('\n❌ Search Console API: NOT ENABLED\n');
        console.log('   Enable it here:');
        console.log('   https://console.cloud.google.com/apis/library/searchconsole.googleapis.com?project=robotic-goal-456009-r2\n');
      } else {
        console.log('\n❌ Search Console API: Permission denied\n');
        console.log('   Service account has no access to any properties');
        console.log('   Add to Search Console first\n');
      }
    } else {
      console.log(`\n❌ Error: ${error.error.code} - ${error.error.message}\n`);
    }
  }
  console.log('━'.repeat(60) + '\n');
} catch (err) {
  console.error('\n❌ Error:', err.message, '\n');
  console.log('━'.repeat(60) + '\n');
}
