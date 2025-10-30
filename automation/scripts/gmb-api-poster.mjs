#!/usr/bin/env node

/**
 * Automated GMB API Poster
 * 
 * Automatically posts to Google My Business using the Google My Business API
 * Reads generated GMB posts and publishes them directly to your GMB profile
 * 
 * Setup Required:
 * 1. Enable Google My Business API in Google Cloud Console
 * 2. Create OAuth 2.0 credentials
 * 3. Get your GMB account ID and location ID
 * 4. Run oauth setup to get refresh token
 * 
 * Usage:
 *   node gmb-api-poster.mjs --setup    # First-time OAuth setup
 *   node gmb-api-poster.mjs --post     # Post all pending GMB posts
 *   node gmb-api-poster.mjs --dry-run  # Test without posting
 */

import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

const GMB_POSTS_DIR = path.join(projectRoot, 'automation/generated/gbp-posts');
const BLOG_SYNCED_DIR = path.join(GMB_POSTS_DIR, 'blog-synced');
const TOKEN_PATH = path.join(projectRoot, 'automation/data/gmb-tokens.json');

// OAuth2 setup
const SCOPES = ['https://www.googleapis.com/auth/business.manage'];
const REDIRECT_URI = 'http://localhost'; // For local OAuth flow

/**
 * Create OAuth2 client
 */
function getOAuth2Client() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('❌ Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET');
    console.log('\n📋 Setup Steps:');
    console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
    console.log('2. Create OAuth 2.0 Client ID (Desktop app)');
    console.log('3. Add to environment variables:');
    console.log('   export GOOGLE_CLIENT_ID="..."');
    console.log('   export GOOGLE_CLIENT_SECRET="..."');
    process.exit(1);
  }

  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );
}

/**
 * Get authorization URL for first-time setup
 */
function getAuthUrl(oauth2Client) {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Force to get refresh token
  });
}

/**
 * Get user input from command line
 */
function getUserInput(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * First-time OAuth setup
 */
async function setupOAuth() {
  console.log('🔐 GMB API OAuth Setup\n');
  
  const oauth2Client = getOAuth2Client();
  const authUrl = getAuthUrl(oauth2Client);
  
  console.log('1. Open this URL in your browser:');
  console.log(`\n${authUrl}\n`);
  console.log('2. Authorize the application');
  console.log('3. Copy the authorization code\n');
  
  const code = await getUserInput('Enter the authorization code: ');
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    // Save tokens
    await fs.mkdir(path.dirname(TOKEN_PATH), { recursive: true });
    await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    
    console.log('\n✅ OAuth setup complete!');
    console.log(`📁 Tokens saved to: ${TOKEN_PATH}`);
    console.log('\n💡 Next steps:');
    console.log('1. Get your GMB account ID and location ID');
    console.log('2. Add to environment:');
    console.log('   export GMB_ACCOUNT_ID="..."');
    console.log('   export GMB_LOCATION_ID="..."');
    console.log('3. Run: node gmb-api-poster.mjs --post');
    
  } catch (error) {
    console.error('❌ OAuth error:', error.message);
    process.exit(1);
  }
}

/**
 * Load saved tokens
 */
async function loadTokens() {
  try {
    const data = await fs.readFile(TOKEN_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    console.error('❌ No saved tokens found. Run with --setup first.');
    process.exit(1);
  }
}

/**
 * Get authenticated OAuth client
 */
async function getAuthClient() {
  const oauth2Client = getOAuth2Client();
  const tokens = await loadTokens();
  
  oauth2Client.setCredentials(tokens);
  
  // Refresh token if needed
  oauth2Client.on('tokens', async (newTokens) => {
    if (newTokens.refresh_token) {
      tokens.refresh_token = newTokens.refresh_token;
      await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    }
  });
  
  return oauth2Client;
}

/**
 * Get all pending GMB posts
 */
async function getPendingPosts() {
  const posts = [];
  
  // Check blog-synced directory
  try {
    const files = await fs.readdir(BLOG_SYNCED_DIR);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filepath = path.join(BLOG_SYNCED_DIR, file);
        const data = JSON.parse(await fs.readFile(filepath, 'utf-8'));
        if (data.status === 'pending') {
          posts.push({ ...data, filepath });
        }
      }
    }
  } catch (error) {
    // Directory might not exist yet
  }
  
  // Check bulk posts directory
  try {
    const files = await fs.readdir(GMB_POSTS_DIR);
    for (const file of files) {
      if (file.startsWith('gbp-posts-') && file.endsWith('.json')) {
        const filepath = path.join(GMB_POSTS_DIR, file);
        const data = JSON.parse(await fs.readFile(filepath, 'utf-8'));
        
        // Bulk files contain array of posts
        if (Array.isArray(data)) {
          for (const post of data) {
            if (post.status === 'pending' || post.status === 'draft') {
              posts.push({ ...post, filepath, isBulk: true });
            }
          }
        }
      }
    }
  } catch (error) {
    // Directory might not exist
  }
  
  return posts;
}

/**
 * Post to GMB using direct API call
 */
async function postToGMB(authClient, post, isDryRun = false) {
  const accountId = process.env.GMB_ACCOUNT_ID;
  const locationId = process.env.GMB_LOCATION_ID;
  
  if (!accountId || !locationId) {
    throw new Error('GMB_ACCOUNT_ID and GMB_LOCATION_ID must be set');
  }
  
  const locationName = `accounts/${accountId}/locations/${locationId}`;
  
  const postData = {
    languageCode: 'en-AU',
    summary: post.gmbContent || post.content,
    callToAction: {
      actionType: post.actionButton?.toUpperCase().replace(/ /g, '_') || 'LEARN_MORE',
      url: post.actionUrl || post.blogUrl
    }
  };
  
  // Add topic type if available
  if (post.type) {
    const topicTypeMap = {
      'tip': 'STANDARD',
      'offer': 'OFFER',
      'update': 'STANDARD',
      'question': 'STANDARD',
      'case-study': 'STANDARD',
      'blog': 'STANDARD'
    };
    postData.topicType = topicTypeMap[post.type] || 'STANDARD';
  }
  
  if (isDryRun) {
    console.log('🧪 DRY RUN - Would post:');
    console.log(JSON.stringify(postData, null, 2));
    return { success: true, dryRun: true };
  }
  
  try {
    // Get access token
    const accessToken = (await authClient.getAccessToken()).token;
    
    // Use direct HTTP request since GMB API library is outdated
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(
      `https://mybusiness.googleapis.com/v4/${locationName}/localPosts`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Unknown error');
    }
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Mark post as posted
 */
async function markAsPosted(post) {
  if (post.isBulk) {
    // For bulk files, we need to update the entire array
    const allPosts = JSON.parse(await fs.readFile(post.filepath, 'utf-8'));
    const updated = allPosts.map(p => {
      if (p.postNumber === post.postNumber) {
        return { ...p, status: 'posted', postedAt: new Date().toISOString() };
      }
      return p;
    });
    await fs.writeFile(post.filepath, JSON.stringify(updated, null, 2));
  } else {
    // For individual files, just update the post
    post.status = 'posted';
    post.postedAt = new Date().toISOString();
    delete post.filepath;
    await fs.writeFile(post.filepath, JSON.stringify(post, null, 2));
  }
}

/**
 * Main posting function
 */
async function postAll(isDryRun = false) {
  console.log('📱 GMB Automated Posting\n');
  
  if (isDryRun) {
    console.log('🧪 DRY RUN MODE - No actual posts will be made\n');
  }
  
  const posts = await getPendingPosts();
  
  if (posts.length === 0) {
    console.log('✅ No pending posts to publish!');
    return;
  }
  
  console.log(`📄 Found ${posts.length} pending post(s)\n`);
  
  let authClient;
  if (!isDryRun) {
    authClient = await getAuthClient();
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const post of posts) {
    const title = post.blogTitle || `Post ${post.postNumber || 'N/A'}`;
    console.log(`\n📤 Posting: ${title}`);
    console.log(`   Content: "${(post.gmbContent || post.content).substring(0, 60)}..."`);
    
    const result = await postToGMB(authClient, post, isDryRun);
    
    if (result.success) {
      if (!isDryRun) {
        await markAsPosted(post);
      }
      console.log(`   ✅ ${isDryRun ? 'Would be posted' : 'Posted successfully'}`);
      successCount++;
    } else {
      console.log(`   ❌ Failed: ${result.error}`);
      errorCount++;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   ✅ ${isDryRun ? 'Would post' : 'Posted'}: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  
  if (!isDryRun && successCount > 0) {
    console.log('\n🎉 Posts published to Google My Business!');
    console.log('   Check your GMB dashboard: https://business.google.com');
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--setup')) {
    await setupOAuth();
  } else if (args.includes('--post')) {
    await postAll(false);
  } else if (args.includes('--dry-run')) {
    await postAll(true);
  } else {
    console.log('GMB API Automated Poster\n');
    console.log('Usage:');
    console.log('  node gmb-api-poster.mjs --setup    # First-time OAuth setup');
    console.log('  node gmb-api-poster.mjs --post     # Post all pending GMB posts');
    console.log('  node gmb-api-poster.mjs --dry-run  # Test without posting\n');
    console.log('📋 Quick Start:');
    console.log('1. Run --setup to authenticate');
    console.log('2. Get GMB account/location IDs');
    console.log('3. Add to environment variables');
    console.log('4. Run --post to publish posts');
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
