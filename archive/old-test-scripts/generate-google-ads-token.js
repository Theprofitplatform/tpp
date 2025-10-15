/**
 * Generate Google Ads API Refresh Token
 * Run: node scripts/generate-google-ads-token.js
 */

const readline = require('readline');
const { google } = require('googleapis');

// Load from environment or replace with your values
const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID || 'YOUR_CLIENT_ID';
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET || 'YOUR_CLIENT_SECRET';

if (CLIENT_ID === 'YOUR_CLIENT_ID' || CLIENT_SECRET === 'YOUR_CLIENT_SECRET') {
  console.error('❌ Error: Please set GOOGLE_ADS_CLIENT_ID and GOOGLE_ADS_CLIENT_SECRET');
  console.error('Either:');
  console.error('  1. Set environment variables');
  console.error('  2. Edit this file and replace the values');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob' // Desktop app redirect
);

// Generate authorization URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: 'https://www.googleapis.com/auth/adwords',
  prompt: 'consent', // Force to get refresh token
});

console.log('═══════════════════════════════════════════════════════════════');
console.log('🔐 Google Ads API - Refresh Token Generator');
console.log('═══════════════════════════════════════════════════════════════\n');
console.log('Step 1: Authorize this app by visiting this URL:\n');
console.log(authUrl);
console.log('\n');
console.log('Step 2: After authorization, copy the code from the browser');
console.log('Step 3: Paste it below and press Enter\n');
console.log('═══════════════════════════════════════════════════════════════\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the authorization code: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);

    console.log('\n✅ Success! Tokens generated:\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('Add these to your .env.local file:\n');
    console.log(`GOOGLE_ADS_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('\nFull configuration:');
    console.log(`GOOGLE_ADS_CLIENT_ID=${CLIENT_ID}`);
    console.log(`GOOGLE_ADS_CLIENT_SECRET=${CLIENT_SECRET}`);
    console.log(`GOOGLE_ADS_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('GOOGLE_ADS_DEVELOPER_TOKEN=YOUR_DEVELOPER_TOKEN');
    console.log('GOOGLE_ADS_CUSTOMER_ID=1234567890');
    console.log('GOOGLE_ADS_LOGIN_CUSTOMER_ID=1234567890');
    console.log('═══════════════════════════════════════════════════════════════\n');
  } catch (err) {
    console.error('❌ Error getting tokens:', err.message);
    if (err.response) {
      console.error('Response:', err.response.data);
    }
  }
  rl.close();
});
