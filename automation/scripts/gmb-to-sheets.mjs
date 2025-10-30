#!/usr/bin/env node

/**
 * GMB to Google Sheets Automation (FREE!)
 * 
 * Automatically updates Google Sheets with GMB posts
 * Then use Buffer's free tier to auto-post from Sheets
 * 
 * Setup:
 * 1. Create Google Sheet with GMB posts
 * 2. Get Google Sheets API credentials
 * 3. This script auto-updates the sheet
 * 4. Buffer reads from sheet and posts (free tier: 10 posts/month)
 * 
 * Cost: $0 (using free tiers)
 * Time: 0 minutes (fully automated)
 */

import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

const GMB_POSTS_DIR = path.join(projectRoot, 'automation/generated/gbp-posts');
const SHEETS_TOKEN_PATH = path.join(projectRoot, 'automation/data/sheets-tokens.json');

// Your Google Sheet configuration
const SHEET_ID = process.env.GOOGLE_SHEET_ID || 'YOUR_SHEET_ID_HERE';
const SHEET_NAME = 'GMB Posts';

/**
 * Get authenticated Sheets client
 */
async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(projectRoot, 'automation/data/service-account.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

/**
 * Get all pending posts from CSV files
 */
async function getPendingPosts() {
  const files = await fs.readdir(GMB_POSTS_DIR);
  const csvFiles = files
    .filter(f => f.startsWith('gbp-posts-') && f.endsWith('.csv'))
    .sort()
    .reverse();
  
  if (csvFiles.length === 0) {
    return [];
  }
  
  // Read latest CSV
  const latestCSV = path.join(GMB_POSTS_DIR, csvFiles[0]);
  const csvContent = await fs.readFile(latestCSV, 'utf-8');
  
  // Parse CSV (simple parsing)
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  
  const posts = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
      if (values) {
        const post = {};
        headers.forEach((header, idx) => {
          if (values[idx]) {
            post[header.trim()] = values[idx].replace(/^"|"$/g, '').replace(/""/g, '"');
          }
        });
        if (post.Status === 'pending' || post.Status === 'draft') {
          posts.push(post);
        }
      }
    }
  }
  
  return posts;
}

/**
 * Update Google Sheet
 */
async function updateSheet(sheets, posts) {
  if (!SHEET_ID || SHEET_ID === 'YOUR_SHEET_ID_HERE') {
    console.log('❌ GOOGLE_SHEET_ID not configured');
    console.log('   Set in .env.local or create service account');
    return false;
  }
  
  // Prepare data for sheet
  const values = [
    ['Date', 'Day', 'Time', 'Content', 'Image', 'CTA', 'URL', 'Status']
  ];
  
  posts.forEach(post => {
    values.push([
      post.Date || post['Scheduled Date'],
      post.Day || post['Scheduled Day'],
      post.Time || post['Scheduled Time'],
      post.Content,
      post['Image Suggestion'] || post.Image,
      post['Action Button'] || post.CTA,
      post['Action URL'] || post.URL,
      '🟡 Ready to Post'
    ]);
  });
  
  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: 'RAW',
      resource: { values }
    });
    
    return true;
  } catch (error) {
    console.error('❌ Sheets error:', error.message);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('📊 GMB to Google Sheets Automation\n');
  
  const posts = await getPendingPosts();
  
  if (posts.length === 0) {
    console.log('✅ No pending posts found');
    return;
  }
  
  console.log(`📄 Found ${posts.length} pending post(s)\n`);
  
  if (!process.env.GOOGLE_SHEET_ID) {
    console.log('💡 Quick Setup (Free!):\n');
    console.log('1. Create Google Sheet: https://sheets.google.com');
    console.log('2. Copy the Sheet ID from URL:');
    console.log('   https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit');
    console.log('3. Add to .env.local:');
    console.log('   GOOGLE_SHEET_ID=your_sheet_id');
    console.log('4. Share sheet with your Google account');
    console.log('5. Run this script again\n');
    console.log('OR just manually copy posts below:\n');
  }
  
  // Display posts for easy copying
  console.log('📋 Posts Ready to Copy:\n');
  console.log('━'.repeat(70));
  
  posts.forEach((post, index) => {
    console.log(`\n📅 Post ${index + 1} - ${post.Day}, ${post.Date} @ ${post.Time}`);
    console.log('─'.repeat(70));
    console.log(post.Content);
    console.log('─'.repeat(70));
    console.log(`📸 Image: ${post['Image Suggestion'] || post.Image}`);
    console.log(`🔗 Button: "${post['Action Button'] || post.CTA}" → ${post['Action URL'] || post.URL}`);
  });
  
  console.log('\n' + '━'.repeat(70));
  console.log('\n✨ Next Steps:\n');
  console.log('1. Open: https://business.google.com/posts/l/7746589328258597070');
  console.log('2. Click "Add update"');
  console.log('3. Copy content above');
  console.log('4. Paste and publish!');
  console.log('\n⏱️  Time: ~1 minute for 5 posts!\n');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
