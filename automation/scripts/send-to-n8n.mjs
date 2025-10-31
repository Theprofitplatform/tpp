#!/usr/bin/env node

/**
 * Send GMB Posts to n8n Webhook
 *
 * Sends your generated GMB posts to your self-hosted n8n instance
 * for automated scheduling and posting to Google Business Profile.
 *
 * Usage:
 *   # Set webhook URL first:
 *   export N8N_WEBHOOK_URL=http://your-vps.com:5678/webhook/gmb-posts
 *
 *   # Send latest posts
 *   node automation/scripts/send-to-n8n.mjs
 *
 *   # Send specific file
 *   node automation/scripts/send-to-n8n.mjs automation/generated/gbp-posts/gbp-posts-2025-10-31.json
 *
 *   # Test with single post
 *   node automation/scripts/send-to-n8n.mjs --test
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

/**
 * Get latest GMB posts file
 */
async function getLatestPostsFile() {
  const postsDir = path.join(projectRoot, 'automation/generated/gbp-posts');
  const files = await fs.readdir(postsDir);

  const jsonFiles = files
    .filter(f => f.startsWith('gbp-posts-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (jsonFiles.length === 0) {
    throw new Error('No GMB posts files found');
  }

  return path.join(postsDir, jsonFiles[0]);
}

/**
 * Send test post
 */
async function sendTestPost() {
  const testPost = [{
    postNumber: 1,
    type: "test",
    content: "🧪 Test post from n8n automation! If you see this in your GMB, everything is working perfectly. Call 0487 286 451 #TestPost",
    scheduledDate: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
    actionButton: "Learn more",
    actionUrl: "https://theprofitplatform.com.au/contact"
  }];

  return testPost;
}

/**
 * Send posts to n8n webhook
 */
async function sendToN8n(posts) {
  if (!WEBHOOK_URL) {
    throw new Error(`
❌ N8N_WEBHOOK_URL not set!

Set it first:
  export N8N_WEBHOOK_URL=http://your-vps.com:5678/webhook/gmb-posts

Or add to .env.local:
  N8N_WEBHOOK_URL=http://your-vps.com:5678/webhook/gmb-posts
`);
  }

  console.log(`📤 Sending ${posts.length} posts to n8n...`);
  console.log(`📡 Webhook: ${WEBHOOK_URL}`);

  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(posts)
  });

  if (!response.ok) {
    throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  return result;
}

/**
 * Main execution
 */
async function main() {
  try {
    const isTest = process.argv.includes('--test');

    let posts;

    if (isTest) {
      console.log('🧪 TEST MODE - Sending test post\n');
      posts = await sendTestPost();
      console.log('📋 Test post details:');
      console.log(`   Content: "${posts[0].content.substring(0, 60)}..."`);
      console.log(`   Scheduled: ${posts[0].scheduledDate}`);
      console.log(`   URL: ${posts[0].actionUrl}\n`);
    } else {
      // Get input file
      const inputFile = process.argv[2] || await getLatestPostsFile();
      console.log(`📄 Reading posts from: ${inputFile}\n`);

      // Read posts
      const postsData = await fs.readFile(inputFile, 'utf-8');
      posts = JSON.parse(postsData);

      if (!Array.isArray(posts) || posts.length === 0) {
        throw new Error('No posts found in file');
      }

      console.log(`✅ Found ${posts.length} posts\n`);
    }

    // Send to n8n
    const result = await sendToN8n(posts);

    console.log('\n✅ Posts sent successfully to n8n!');
    console.log(`\n📋 n8n Response:`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Message: ${result.message}`);
    console.log('\n📋 What happens next:');
    console.log('1. n8n receives your posts');
    console.log('2. Schedules each post for its date/time');
    console.log('3. Automatically posts to GMB on schedule');
    console.log('\n🔍 Check n8n dashboard to verify:');
    console.log(`   ${WEBHOOK_URL.replace('/webhook/gmb-posts', '')} → Executions\n`);

    if (isTest) {
      console.log('🧪 Test post scheduled for 1 minute from now');
      console.log('   Check your GMB in a few moments!\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);

    if (error.message.includes('N8N_WEBHOOK_URL')) {
      console.log('\n💡 Setup instructions:');
      console.log('   1. Open your n8n instance');
      console.log('   2. Import n8n-gmb-workflow.json');
      console.log('   3. Activate the webhook');
      console.log('   4. Copy webhook URL');
      console.log('   5. Set: export N8N_WEBHOOK_URL=your_webhook_url');
      console.log('   6. Run this script again\n');
      console.log('   📖 Full guide: N8N-GMB-AUTOMATION.md\n');
    }

    process.exit(1);
  }
}

main();
