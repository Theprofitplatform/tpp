#!/usr/bin/env node

/**
 * GMB Quick Post Helper
 * 
 * Opens GMB dashboard and prepares posts for quick publishing
 * Saves 4 minutes per week!
 * 
 * Usage: node gmb-quick-post.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

const GMB_POSTS_DIR = path.join(projectRoot, 'automation/generated/gbp-posts');
const BLOG_SYNCED_DIR = path.join(GMB_POSTS_DIR, 'blog-synced');

/**
 * Get all pending posts
 */
async function getPendingPosts() {
  const posts = [];
  
  // Get blog-synced posts
  try {
    const files = await fs.readdir(BLOG_SYNCED_DIR);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filepath = path.join(BLOG_SYNCED_DIR, file);
        const data = JSON.parse(await fs.readFile(filepath, 'utf-8'));
        if (data.status === 'pending') {
          posts.push(data);
        }
      }
    }
  } catch (error) {
    // Directory might not exist
  }
  
  // Get bulk posts
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
            posts.push(post);
          }
        }
      }
    }
  } catch (error) {
    // Ignore
  }
  
  return posts.slice(0, 5); // Get next 5 posts to publish
}

/**
 * Open GMB dashboard
 */
async function openGMB() {
  const url = 'https://business.google.com/posts/l/7746589328258597070';
  
  try {
    // Try different browsers
    if (process.platform === 'win32') {
      await execAsync(`start ${url}`);
    } else if (process.platform === 'darwin') {
      await execAsync(`open ${url}`);
    } else {
      await execAsync(`xdg-open ${url}`);
    }
  } catch (error) {
    console.log(`\n📋 Open this URL manually:\n${url}\n`);
  }
}

/**
 * Copy to clipboard
 */
async function copyToClipboard(text) {
  try {
    if (process.platform === 'win32') {
      await execAsync(`echo ${text} | clip`);
    } else if (process.platform === 'darwin') {
      await execAsync(`echo "${text}" | pbcopy`);
    } else {
      await execAsync(`echo "${text}" | xclip -selection clipboard`);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 GMB Quick Post Helper\n');
  
  const posts = await getPendingPosts();
  
  if (posts.length === 0) {
    console.log('✅ No pending posts to publish!');
    return;
  }
  
  console.log(`📄 Found ${posts.length} post(s) ready to publish\n`);
  console.log('🌐 Opening GMB dashboard...\n');
  
  await openGMB();
  
  console.log('📋 Here are your posts ready to copy:\n');
  console.log('━'.repeat(60));
  
  posts.forEach((post, index) => {
    const content = post.gmbContent || post.content;
    const title = post.blogTitle || `Post ${post.postNumber || index + 1}`;
    
    console.log(`\n${index + 1}. ${title}`);
    console.log('─'.repeat(60));
    console.log(content);
    console.log('─'.repeat(60));
    console.log(`📸 Image: ${post.imageSuggestion || 'Add relevant image'}`);
    console.log(`🔗 CTA: "${post.actionButton || 'Learn more'}" → ${post.actionUrl || post.blogUrl}`);
    console.log();
  });
  
  console.log('━'.repeat(60));
  console.log('\n✨ Quick Steps:\n');
  console.log('1. GMB dashboard is now open');
  console.log('2. Click "Add update" button');
  console.log('3. Copy post content above');
  console.log('4. Paste into GMB');
  console.log('5. Add image (suggested above)');
  console.log('6. Click "Publish"');
  console.log('7. Repeat for all posts\n');
  
  console.log('⏱️  Time: ~1 minute for all 5 posts!');
  console.log('💡 Pro tip: Keep this terminal open for easy reference\n');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
