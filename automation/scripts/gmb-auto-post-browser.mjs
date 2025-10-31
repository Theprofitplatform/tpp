#!/usr/bin/env node

/**
 * GMB Browser Automation - 100% FREE!
 * 
 * Automatically posts to GMB using browser automation (Playwright)
 * Works around deprecated API by automating the browser
 * 
 * Features:
 * - Auto-login with saved session
 * - Reads pending posts from generated files
 * - Posts directly to GMB dashboard
 * - Marks posts as completed
 * - 100% free, no API required
 * 
 * Usage:
 *   node gmb-auto-post-browser.mjs --setup    # First-time login
 *   node gmb-auto-post-browser.mjs --post     # Auto-post all pending
 *   node gmb-auto-post-browser.mjs --headless # Run in background
 */

import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

const GMB_POSTS_DIR = path.join(projectRoot, 'automation/generated/gbp-posts');
const BLOG_SYNCED_DIR = path.join(GMB_POSTS_DIR, 'blog-synced');
const SESSION_FILE = path.join(projectRoot, 'automation/data/gmb-session.json');
const GMB_URL = 'https://business.google.com/posts/l/7746589328258597070';

/**
 * Get all pending posts
 */
async function getPendingPosts() {
  const posts = [];
  
  // Blog-synced posts
  try {
    const files = await fs.readdir(BLOG_SYNCED_DIR);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filepath = path.join(BLOG_SYNCED_DIR, file);
        const data = JSON.parse(await fs.readFile(filepath, 'utf-8'));
        if (data.status === 'pending') {
          posts.push({ ...data, filepath, type: 'blog' });
        }
      }
    }
  } catch (error) {
    // Directory might not exist
  }
  
  // Bulk posts
  try {
    const files = await fs.readdir(GMB_POSTS_DIR);
    const jsonFiles = files
      .filter(f => f.startsWith('gbp-posts-') && f.endsWith('.json'))
      .sort()
      .reverse();
    
    if (jsonFiles.length > 0) {
      const latestFile = path.join(GMB_POSTS_DIR, jsonFiles[0]);
      const data = JSON.parse(await fs.readFile(latestFile, 'utf-8'));
      
      if (Array.isArray(data)) {
        for (const post of data) {
          if (post.status === 'pending' || post.status === 'draft') {
            posts.push({ ...post, filepath: latestFile, type: 'bulk' });
          }
        }
      }
    }
  } catch (error) {
    // Ignore
  }
  
  return posts.slice(0, 5); // Post max 5 at a time to avoid rate limits
}

/**
 * Save browser session for auto-login
 */
async function saveSession(context) {
  const cookies = await context.cookies();
  const storage = await context.storageState();
  
  await fs.mkdir(path.dirname(SESSION_FILE), { recursive: true });
  await fs.writeFile(SESSION_FILE, JSON.stringify(storage, null, 2));
  
  console.log('✅ Session saved for future auto-login');
}

/**
 * Load saved session
 */
async function loadSession() {
  try {
    const data = await fs.readFile(SESSION_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * Setup: First-time login and save session
 */
async function setup() {
  console.log('🔐 GMB Browser Setup\n');
  console.log('This will open a browser for you to log into GMB.');
  console.log('After logging in, the session will be saved for automatic posting.\n');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('🌐 Opening GMB dashboard...');
  await page.goto(GMB_URL);
  
  console.log('\n📋 Instructions:');
  console.log('1. Log into your Google account');
  console.log('2. Navigate to your GMB posts page');
  console.log('3. Once you see "Add update" button, press ENTER here...\n');
  
  // Wait for user to press Enter
  await new Promise((resolve) => {
    process.stdin.once('data', resolve);
  });
  
  // Save session
  await saveSession(context);
  
  await browser.close();
  
  console.log('\n✅ Setup complete!');
  console.log('   Now run: node gmb-auto-post-browser.mjs --post');
}

/**
 * Post to GMB automatically
 */
async function autoPost(headless = true) {
  console.log('🤖 GMB Automated Posting\n');
  
  const posts = await getPendingPosts();
  
  if (posts.length === 0) {
    console.log('✅ No pending posts to publish!');
    return;
  }
  
  console.log(`📄 Found ${posts.length} post(s) to publish\n`);
  
  // Load saved session
  const session = await loadSession();
  if (!session) {
    console.error('❌ No saved session found. Run with --setup first.');
    process.exit(1);
  }
  
  const browser = await chromium.launch({ 
    headless,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const context = await browser.newContext({
    ...session,
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  console.log('🌐 Opening GMB dashboard...');
  await page.goto(GMB_URL, { waitUntil: 'networkidle' });
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const content = post.gmbContent || post.content;
    const title = post.blogTitle || `Post ${post.postNumber || i + 1}`;
    
    console.log(`\n📤 Posting ${i + 1}/${posts.length}: ${title}`);
    console.log(`   Content: "${content.substring(0, 50)}..."`);
    
    try {
      // Wait for page to be ready
      await page.waitForTimeout(2000);
      
      // Click "Add update" button
      const addButton = await page.locator('button:has-text("Add update"), button:has-text("Create post")').first();
      if (await addButton.isVisible({ timeout: 5000 })) {
        await addButton.click();
        await page.waitForTimeout(1000);
      }
      
      // Find text area
      const textArea = await page.locator('textarea, div[contenteditable="true"]').first();
      await textArea.waitFor({ timeout: 5000 });
      await textArea.click();
      await textArea.fill(content);
      await page.waitForTimeout(500);
      
      // Add call-to-action button (if available)
      try {
        const ctaButton = await page.locator('button:has-text("Add button"), button:has-text("Add call to action")').first();
        if (await ctaButton.isVisible({ timeout: 2000 })) {
          await ctaButton.click();
          await page.waitForTimeout(500);
          
          // Select CTA type
          const actionUrl = post.actionUrl || post.blogUrl;
          if (actionUrl) {
            const urlInput = await page.locator('input[type="url"], input[placeholder*="URL"]').first();
            if (await urlInput.isVisible({ timeout: 2000 })) {
              await urlInput.fill(actionUrl);
            }
          }
        }
      } catch {
        // CTA button not available, skip
      }
      
      // Click Publish
      const publishButton = await page.locator('button:has-text("Publish"), button:has-text("Post")').first();
      await publishButton.waitFor({ timeout: 5000 });
      await publishButton.click();
      
      // Wait for confirmation
      await page.waitForTimeout(2000);
      
      // Mark as posted
      await markAsPosted(post);
      
      console.log('   ✅ Posted successfully!');
      successCount++;
      
      // Wait between posts to avoid rate limits
      if (i < posts.length - 1) {
        console.log('   ⏳ Waiting 3 seconds before next post...');
        await page.waitForTimeout(3000);
      }
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      errorCount++;
    }
  }
  
  await browser.close();
  
  console.log('\n━'.repeat(35));
  console.log('📊 Summary:');
  console.log(`   ✅ Posted: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log('━'.repeat(35));
  
  if (successCount > 0) {
    console.log('\n🎉 Posts published to GMB!');
    console.log('   Check: https://business.google.com/posts');
  }
}

/**
 * Mark post as posted
 */
async function markAsPosted(post) {
  try {
    if (post.type === 'bulk') {
      const allPosts = JSON.parse(await fs.readFile(post.filepath, 'utf-8'));
      const updated = allPosts.map(p => {
        if (p.postNumber === post.postNumber) {
          return { ...p, status: 'posted', postedAt: new Date().toISOString() };
        }
        return p;
      });
      await fs.writeFile(post.filepath, JSON.stringify(updated, null, 2));
    } else {
      post.status = 'posted';
      post.postedAt = new Date().toISOString();
      const filepath = post.filepath;
      delete post.filepath;
      delete post.type;
      await fs.writeFile(filepath, JSON.stringify(post, null, 2));
    }
  } catch (error) {
    // Ignore marking errors
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--setup')) {
    await setup();
  } else if (args.includes('--post')) {
    const headless = args.includes('--headless');
    await autoPost(headless);
  } else {
    console.log('GMB Browser Automation - 100% FREE!\n');
    console.log('Usage:');
    console.log('  node gmb-auto-post-browser.mjs --setup      # First-time login');
    console.log('  node gmb-auto-post-browser.mjs --post       # Auto-post (watch browser)');
    console.log('  node gmb-auto-post-browser.mjs --post --headless  # Background mode\n');
    console.log('💡 Quick Start:');
    console.log('1. Run --setup to log in and save session');
    console.log('2. Run --post to automatically publish posts');
    console.log('3. Completely free, no API needed!');
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
