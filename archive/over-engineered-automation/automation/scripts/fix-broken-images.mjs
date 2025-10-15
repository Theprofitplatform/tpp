#!/usr/bin/env node

/**
 * Fix Broken Unsplash Images
 * Re-fetches images for posts with invalid Unsplash URLs
 */

import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchAndSaveFeaturedImage } from './unsplash-fetcher.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');

const postsToFix = [
  {
    file: 'how-to-scale-local-seo.md',
    title: 'multi-location business scale', // Will match: franchise business map, multiple store locations, business expansion
    category: 'SEO'
  },
  {
    file: 'how-sydney-businesses-rank-number-1-google-2025.md',
    title: 'SEO ranking first place', // Will match: search results screen, analytics dashboard growth, first place podium
    category: 'SEO'
  },
  {
    file: 'google-ads-vs-seo-sydney-businesses.md',
    title: 'google ads strategy', // Will match: digital advertising laptop, marketing campaign dashboard
    category: 'Marketing'
  },
  {
    file: '15-free-digital-marketing-tools-sydney-business.md',
    title: 'marketing tools workspace', // Will match: workspace laptop tools, digital marketing office
    category: 'Marketing'
  },
  {
    file: 'parramatta-plumber-case-study.md',
    title: 'business growth case study', // Will match: business success meeting, growth chart presentation
    category: 'Business'
  }
];

async function fixPost(post) {
  console.log(`\n🔧 Fixing: ${post.file}`);

  const filePath = path.join(projectRoot, 'src/content/blog', post.file);

  // Fetch new image
  const imageData = await fetchAndSaveFeaturedImage(post.title, post.category, post.file);

  if (!imageData) {
    console.log(`   ❌ Could not fetch image`);
    return false;
  }

  // Read current file
  const content = await readFile(filePath, 'utf-8');

  // Remove old coverImage lines (handle both LF and CRLF line endings)
  let newContent = content.replace(/coverImage:.*\r?\n/g, '');
  newContent = newContent.replace(/coverImageAlt:.*\r?\n/g, '');
  newContent = newContent.replace(/coverImageCredit:\r?\n {2}name:.*\r?\n {2}link:.*\r?\n/g, '');

  // Add new image data after draft line (detect line ending style)
  const lineEndingMatch = content.match(/\r?\n/);
  const lineEnding = lineEndingMatch && lineEndingMatch[0].includes('\r') ? '\r\n' : '\n';

  const imageLine = `coverImage: "${imageData.coverImage}"`;
  const altLine = `coverImageAlt: "${imageData.coverImageAlt}"`;
  const creditLine = `coverImageCredit:${lineEnding}  name: "${imageData.coverImageCredit.name}"${lineEnding}  link: "${imageData.coverImageCredit.link}"`;

  newContent = newContent.replace(
    /(draft:.*)\r?\n/,
    `$1${lineEnding}${imageLine}${lineEnding}${altLine}${lineEnding}${creditLine}${lineEnding}`
  );

  // Write back
  await writeFile(filePath, newContent, 'utf-8');

  console.log(`   ✅ Fixed with new image: ${imageData.coverImage.substring(0, 80)}...`);
  return true;
}

async function main() {
  console.log('🔧 Fixing Broken Unsplash Images\n');
  console.log('━'.repeat(60));

  let fixed = 0;

  for (const post of postsToFix) {
    if (await fixPost(post)) {
      fixed++;
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n━'.repeat(60));
  console.log(`\n✅ Fixed ${fixed}/${postsToFix.length} posts\n`);
}

main();
