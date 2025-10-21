#!/usr/bin/env node

/**
 * Refresh All Blog Post Hero Images
 * Replaces ALL existing images with new contextually relevant ones
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getUniqueImage, formatImageForFrontmatter } from './unsplash-fetcher.mjs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Load environment variables
dotenv.config({ path: path.join(projectRoot, '.env.local') });

const BLOG_DIR = path.join(projectRoot, 'src/content/blog');

/**
 * Parse frontmatter from blog post
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return null;
  }

  const frontmatter = match[1];
  const titleMatch = frontmatter.match(/title:\s*["'](.+?)["']/);
  const categoryMatch = frontmatter.match(/category:\s*["'](.+?)["']/);

  return {
    frontmatter: frontmatter,
    body: match[2],
    title: titleMatch ? titleMatch[1] : 'Blog Post',
    category: categoryMatch ? categoryMatch[1] : 'SEO'
  };
}

/**
 * Replace image fields in frontmatter
 */
function replaceImageFields(frontmatter, newImageFields) {
  // Remove old image fields
  let updated = frontmatter.replace(/coverImage:\s*["'].+?["']\n/, '');
  updated = updated.replace(/coverImageAlt:\s*["'].+?["']\n/, '');
  updated = updated.replace(/coverImageCredit:\n\s+name:\s*["'].+?["']\n\s+link:\s*["'].+?["']\n/, '');

  // Find where to insert (after tags, before featured)
  const lines = updated.split('\n');
  const insertIndex = lines.findIndex(line => line.includes('featured:'));

  if (insertIndex === -1) {
    // If no featured field, add at end
    return updated + `\ncoverImage: "${newImageFields.coverImage}"
coverImageAlt: "${newImageFields.coverImageAlt}"
coverImageCredit:
  name: "${newImageFields.coverImageCredit.name}"
  link: "${newImageFields.coverImageCredit.link}"`;
  }

  // Insert before featured
  lines.splice(insertIndex, 0,
    `coverImage: "${newImageFields.coverImage}"`,
    `coverImageAlt: "${newImageFields.coverImageAlt}"`,
    `coverImageCredit:`,
    `  name: "${newImageFields.coverImageCredit.name}"`,
    `  link: "${newImageFields.coverImageCredit.link}"`
  );

  return lines.join('\n');
}

/**
 * Update single blog post with new contextually relevant image
 */
async function updateBlogPostImage(filepath, unsplashKey, pexelsKey) {
  const filename = path.basename(filepath);
  const content = await fs.readFile(filepath, 'utf-8');

  const parsed = parseFrontmatter(content);
  if (!parsed) {
    console.log(`  ⏭️  Skipping ${filename} - couldn't parse frontmatter`);
    return { updated: false, reason: 'parse-error' };
  }

  console.log(`\n  🔄 ${filename}`);
  console.log(`     Title: "${parsed.title}"`);

  // Fetch new contextually relevant image (tries Unsplash first, then Pexels)
  const imageData = await getUniqueImage(parsed.category, parsed.title, unsplashKey, pexelsKey);
  if (!imageData) {
    console.log(`  ⚠️  No image found`);
    return { updated: false, reason: 'no-image' };
  }

  const imageFields = formatImageForFrontmatter(imageData);

  // Update frontmatter
  const updatedFrontmatter = replaceImageFields(parsed.frontmatter, imageFields);
  const updatedContent = `---\n${updatedFrontmatter}\n---\n${parsed.body}`;

  // Write back to file
  await fs.writeFile(filepath, updatedContent, 'utf-8');

  console.log(`  ✅ Updated with image by ${imageData.photographer.name}`);

  return {
    updated: true,
    photographer: imageData.photographer.name,
    filename,
    title: parsed.title,
    source: imageData.source
  };
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🎨 Refreshing ALL Blog Post Hero Images with Contextual Relevance\n');
    console.log('📡 Using dual-source strategy: Unsplash + Pexels fallback\n');

    // Check API keys
    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
    const pexelsKey = process.env.PEXELS_API_KEY;

    if (!unsplashKey && !pexelsKey) {
      throw new Error('At least one API key required: UNSPLASH_ACCESS_KEY or PEXELS_API_KEY');
    }

    if (unsplashKey) console.log('✅ Unsplash API key found');
    if (pexelsKey) console.log('✅ Pexels API key found');
    console.log('');

    // Get all blog post files
    const files = await fs.readdir(BLOG_DIR);
    const mdFiles = files
      .filter(f => f.endsWith('.md'))
      .map(f => path.join(BLOG_DIR, f));

    console.log(`📝 Found ${mdFiles.length} blog posts\n`);
    console.log('⚠️  This will replace ALL existing hero images with contextually relevant ones\n');
    console.log('='.repeat(80) + '\n');

    // Process each file
    const results = {
      updated: [],
      errors: []
    };

    for (const filepath of mdFiles) {
      try {
        const result = await updateBlogPostImage(filepath, unsplashKey, pexelsKey);

        if (result.updated) {
          results.updated.push(result);
        }

        // Delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`  ❌ Error: ${error.message}\n`);
        results.errors.push({ filename: path.basename(filepath), error: error.message });
      }
    }

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 Summary:');
    console.log('='.repeat(80));
    console.log(`✅ Updated: ${results.updated.length} posts`);
    console.log(`❌ Errors: ${results.errors.length} posts`);

    if (results.updated.length > 0) {
      console.log('\n✅ Updated Posts:');

      // Count by source
      const bySources = results.updated.reduce((acc, r) => {
        acc[r.source] = (acc[r.source] || 0) + 1;
        return acc;
      }, {});

      console.log(`\n   📊 Image Sources:`);
      Object.entries(bySources).forEach(([source, count]) => {
        console.log(`      ${source}: ${count} posts`);
      });

      console.log('\n   📝 Details:');
      results.updated.forEach(r => {
        console.log(`   - ${r.filename}`);
        console.log(`     "${r.title}"`);
        console.log(`     Photographer: ${r.photographer} (${r.source})`);
      });
    }

    if (results.errors.length > 0) {
      console.log('\n❌ Errors:');
      results.errors.forEach(e => {
        console.log(`   - ${e.filename}: ${e.error}`);
      });
    }

    console.log('\n🎉 Done! All blog posts now have contextually relevant hero images.\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
