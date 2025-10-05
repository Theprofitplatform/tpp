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
    title: 'local SEO strategy',
    category: 'SEO'
  },
  {
    file: 'how-sydney-businesses-rank-number-1-google-2025.md',
    title: 'SEO ranking Google',
    category: 'SEO'
  },
  {
    file: 'google-ads-vs-seo-sydney-businesses.md',
    title: 'Google Ads vs SEO',
    category: 'Marketing'
  },
  {
    file: '15-free-digital-marketing-tools-sydney-business.md',
    title: 'digital marketing tools',
    category: 'Marketing'
  },
  {
    file: 'parramatta-plumber-case-study.md',
    title: 'business growth case study',
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

  // Remove old coverImage lines
  let newContent = content.replace(/coverImage:.*\n/g, '');
  newContent = newContent.replace(/coverImageAlt:.*\n/g, '');
  newContent = newContent.replace(/coverImageCredit:\n  name:.*\n  link:.*\n/g, '');

  // Add new image data after draft line
  const imageLine = `coverImage: "${imageData.coverImage}"`;
  const altLine = `coverImageAlt: "${imageData.coverImageAlt}"`;
  const creditLine = `coverImageCredit:\n  name: "${imageData.coverImageCredit.name}"\n  link: "${imageData.coverImageCredit.link}"`;

  newContent = newContent.replace(
    /(draft:.*)\n/,
    `$1\n${imageLine}\n${altLine}\n${creditLine}\n`
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
