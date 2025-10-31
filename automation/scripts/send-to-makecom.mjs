#!/usr/bin/env node

/**
 * Send GMB Posts to Make.com Webhook
 *
 * Sends your generated GMB posts to Make.com for automated scheduling
 * and posting to Google Business Profile.
 *
 * Usage:
 *   # Set webhook URL first:
 *   export MAKE_WEBHOOK_URL=https://hook.make.com/xxxxx
 *
 *   # Send latest posts
 *   node automation/scripts/send-to-makecom.mjs
 *
 *   # Send specific file
 *   node automation/scripts/send-to-makecom.mjs automation/generated/gbp-posts/gbp-posts-2025-10-31.json
 *
 *   # Test with single post
 *   node automation/scripts/send-to-makecom.mjs --test
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

const WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

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
    content: "🧪 Test post from Make.com automation! If you see this in your GMB, everything is working perfectly. Call 0487 286 451 #TestPost",
    scheduledDate: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
    actionButton: "Learn more",
    actionUrl: "https://theprofitplatform.com.au/contact"
  }];

  return testPost;
}

/**
 * Send posts to Make.com webhook
 */
async function sendToMakecom(posts) {
  if (!WEBHOOK_URL) {
    throw new Error(`
❌ MAKE_WEBHOOK_URL not set!

Set it first:
  export MAKE_WEBHOOK_URL=https://hook.make.com/xxxxx

Or add to .env.local:
  MAKE_WEBHOOK_URL=https://hook.make.com/xxxxx
`);
  }

  console.log(`📤 Sending ${posts.length} posts to Make.com...`);
  console.log(`📡 Webhook: ${WEBHOOK_URL.substring(0, 40)}...`);

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

  const result = await response.text();
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

    // Send to Make.com
    const result = await sendToMakecom(posts);

    console.log('\n✅ Posts sent successfully to Make.com!');
    console.log('\n📋 What happens next:');
    console.log('1. Make.com receives your posts');
    console.log('2. Schedules each post for its date/time');
    console.log('3. Automatically posts to GMB on schedule');
    console.log('\n🔍 Check Make.com dashboard to verify:');
    console.log('   https://www.make.com → Scenarios → History\n');

    if (isTest) {
      console.log('🧪 Test post scheduled for 1 minute from now');
      console.log('   Check your GMB in a few moments!\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);

    if (error.message.includes('MAKE_WEBHOOK_URL')) {
      console.log('\n💡 Setup instructions:');
      console.log('   1. Sign up: https://www.make.com/en/register');
      console.log('   2. Create webhook scenario (see MAKE-COM-FREE-SETUP.md)');
      console.log('   3. Copy webhook URL');
      console.log('   4. Set: export MAKE_WEBHOOK_URL=your_webhook_url');
      console.log('   5. Run this script again\n');
    }

    process.exit(1);
  }
}

main();
