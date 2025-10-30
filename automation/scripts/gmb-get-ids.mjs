#!/usr/bin/env node

/**
 * Get GMB Account and Location IDs
 * 
 * This script helps you find your GMB account ID and location ID
 * needed for automated posting.
 * 
 * Usage: node gmb-get-ids.mjs
 */

import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const TOKEN_PATH = path.join(projectRoot, 'automation/data/gmb-tokens.json');

/**
 * Load OAuth tokens
 */
async function loadTokens() {
  try {
    const data = await fs.readFile(TOKEN_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    console.error('❌ No OAuth tokens found.');
    console.log('   Run: node gmb-api-poster.mjs --setup');
    process.exit(1);
  }
}

/**
 * Get OAuth2 client
 */
function getOAuth2Client() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('❌ Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env.local');
    process.exit(1);
  }

  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost'
  );
}

/**
 * List GMB accounts
 */
async function listAccounts(auth) {
  const mybusiness = google.mybusinessaccountmanagement({ version: 'v1', auth });
  
  try {
    const response = await mybusiness.accounts.list();
    return response.data.accounts || [];
  } catch (error) {
    console.error('❌ Error listing accounts:', error.message);
    return [];
  }
}

/**
 * List locations for an account
 */
async function listLocations(auth, accountName) {
  const mybusiness = google.mybusinessbusinessinformation({ version: 'v1', auth });
  
  try {
    const response = await mybusiness.accounts.locations.list({
      parent: accountName,
      readMask: 'name,title,storefrontAddress'
    });
    return response.data.locations || [];
  } catch (error) {
    console.error('❌ Error listing locations:', error.message);
    return [];
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Finding your GMB Account and Location IDs...\n');
  
  // Load tokens and set up auth
  const tokens = await loadTokens();
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);
  
  // List accounts
  console.log('📋 Your GMB Accounts:\n');
  const accounts = await listAccounts(oauth2Client);
  
  if (accounts.length === 0) {
    console.log('❌ No GMB accounts found.');
    console.log('   Make sure you have a verified Google Business Profile.');
    process.exit(1);
  }
  
  accounts.forEach((account, index) => {
    console.log(`${index + 1}. ${account.accountName || 'Unnamed Account'}`);
    console.log(`   Name: ${account.name}`);
    console.log(`   Type: ${account.type}`);
    console.log();
  });
  
  // For each account, list locations
  for (const account of accounts) {
    console.log(`📍 Locations for ${account.accountName || account.name}:\n`);
    
    const locations = await listLocations(oauth2Client, account.name);
    
    if (locations.length === 0) {
      console.log('   ⚠️  No locations found for this account.\n');
      continue;
    }
    
    locations.forEach((location, index) => {
      console.log(`${index + 1}. ${location.title || 'Unnamed Location'}`);
      console.log(`   Name: ${location.name}`);
      if (location.storefrontAddress) {
        const addr = location.storefrontAddress;
        console.log(`   Address: ${addr.addressLines?.join(', ')}, ${addr.locality}, ${addr.administrativeArea}`);
      }
      console.log();
    });
  }
  
  // Extract IDs from first account/location
  if (accounts.length > 0) {
    const accountName = accounts[0].name; // format: accounts/123456789
    const accountId = accountName.split('/')[1];
    
    const locations = await listLocations(oauth2Client, accountName);
    if (locations.length > 0) {
      const locationName = locations[0].name; // format: accounts/123/locations/456
      const locationId = locationName.split('/')[3];
      
      console.log('✅ Found your IDs!\n');
      console.log('📋 Add these to your .env.local:\n');
      console.log(`GMB_ACCOUNT_ID=${accountId}`);
      console.log(`GMB_LOCATION_ID=${locationId}`);
      console.log('\n💡 Copy the lines above and add them to your .env.local file');
    }
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
