#!/usr/bin/env node

/**
 * Export GMB Posts to Buffer CSV Format
 *
 * Converts your generated GMB posts to Buffer-compatible CSV
 * for bulk upload to Buffer's scheduling interface.
 *
 * Usage:
 *   node automation/scripts/export-to-buffer-csv.mjs
 *   node automation/scripts/export-to-buffer-csv.mjs automation/generated/gbp-posts/gbp-posts-2025-10-31.json
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

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
 * Convert to Buffer CSV format
 *
 * Buffer CSV columns:
 * - Text (required): Post content
 * - Scheduled At (optional): ISO 8601 date/time
 * - Profile IDs (optional): Buffer profile IDs
 * - Media (optional): Image URLs
 */
function convertToBufferCSV(posts) {
  const rows = [
    // Header row
    'Text,Scheduled At,Media',
  ];

  for (const post of posts) {
    const text = (post.content || post.gmbContent || '')
      .replace(/"/g, '""') // Escape quotes
      .replace(/\n/g, ' '); // Remove newlines for CSV

    const scheduledAt = post.scheduledDate || '';
    const media = post.image || post.imageUrl || '';

    rows.push(`"${text}","${scheduledAt}","${media}"`);
  }

  return rows.join('\n');
}

/**
 * Main execution
 */
async function main() {
  try {
    // Get input file
    const inputFile = process.argv[2] || await getLatestPostsFile();
    console.log(`📄 Reading posts from: ${inputFile}`);

    // Read posts
    const postsData = await fs.readFile(inputFile, 'utf-8');
    const posts = JSON.parse(postsData);

    if (!Array.isArray(posts) || posts.length === 0) {
      throw new Error('No posts found in file');
    }

    console.log(`✅ Found ${posts.length} posts`);

    // Convert to CSV
    const csv = convertToBufferCSV(posts);

    // Output file
    const outputFile = inputFile.replace('.json', '-buffer.csv');
    await fs.writeFile(outputFile, csv);

    console.log(`\n✅ Buffer CSV created: ${outputFile}`);
    console.log(`\n📋 Next steps:`);
    console.log(`1. Go to: https://buffer.com`);
    console.log(`2. Click: Queue → Import from CSV`);
    console.log(`3. Upload: ${path.basename(outputFile)}`);
    console.log(`4. Select: Your Google Business Profile`);
    console.log(`5. Review & Confirm`);
    console.log(`\n🎉 Posts will auto-publish at scheduled times!`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
