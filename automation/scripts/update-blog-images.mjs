#!/usr/bin/env node

/**
 * Update Old Blog Posts with Unique Hero Images
 * Adds Unsplash images to blog posts that don't have coverImage
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

  return {
    frontmatter: match[1],
    body: match[2],
    hasCoverImage: match[1].includes('coverImage:')
  };
}

/**
 * Extract metadata from frontmatter
 */
function extractMetadata(frontmatter) {
  const titleMatch = frontmatter.match(/title:\s*["'](.+?)["']/);
  const categoryMatch = frontmatter.match(/category:\s*["'](.+?)["']/);

  return {
    title: titleMatch ? titleMatch[1] : 'Blog Post',
    category: categoryMatch ? categoryMatch[1] : 'SEO'
  };
}

/**
 * Insert image fields into frontmatter
 */
function insertImageFields(frontmatter, imageFields) {
  // Find where to insert (after tags, before featured)
  const lines = frontmatter.split('\n');
  const insertIndex = lines.findIndex(line => line.includes('featured:'));

  if (insertIndex === -1) {
    // If no featured field, add at end
    return frontmatter + `\ncoverImage: "${imageFields.coverImage}"
coverImageAlt: "${imageFields.coverImageAlt}"
coverImageCredit:
  name: "${imageFields.coverImageCredit.name}"
  link: "${imageFields.coverImageCredit.link}"`;
  }

  // Insert before featured
  lines.splice(insertIndex, 0,
    `coverImage: "${imageFields.coverImage}"`,
    `coverImageAlt: "${imageFields.coverImageAlt}"`,
    `coverImageCredit:`,
    `  name: "${imageFields.coverImageCredit.name}"`,
    `  link: "${imageFields.coverImageCredit.link}"`
  );

  return lines.join('\n');
}

/**
 * Update single blog post with image
 */
async function updateBlogPost(filepath, unsplashKey) {
  const filename = path.basename(filepath);
  const content = await fs.readFile(filepath, 'utf-8');

  const parsed = parseFrontmatter(content);
  if (!parsed) {
    console.log(`  ⏭️  Skipping ${filename} - couldn't parse frontmatter`);
    return { updated: false, reason: 'parse-error' };
  }

  if (parsed.hasCoverImage) {
    console.log(`  ✓  Skipping ${filename} - already has image`);
    return { updated: false, reason: 'has-image' };
  }

  // Extract metadata
  const { title, category } = extractMetadata(parsed.frontmatter);

  console.log(`  🖼️  Fetching image for: ${title.substring(0, 50)}...`);

  // Fetch unique image
  const imageData = await getUniqueImage(category, title, unsplashKey);
  if (!imageData) {
    console.log(`  ⚠️  No image found for ${filename}`);
    return { updated: false, reason: 'no-image' };
  }

  const imageFields = formatImageForFrontmatter(imageData);

  // Update frontmatter
  const updatedFrontmatter = insertImageFields(parsed.frontmatter, imageFields);
  const updatedContent = `---\n${updatedFrontmatter}\n---\n${parsed.body}`;

  // Write back to file
  await fs.writeFile(filepath, updatedContent, 'utf-8');

  console.log(`  ✅ Updated ${filename} with image by ${imageData.photographer.name}`);
  return {
    updated: true,
    photographer: imageData.photographer.name,
    filename
  };
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🎨 Updating Old Blog Posts with Unique Hero Images\n');

    // Check API key
    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!unsplashKey) {
      throw new Error('UNSPLASH_ACCESS_KEY not found in environment');
    }

    // Get all blog post files
    const files = await fs.readdir(BLOG_DIR);
    const mdFiles = files.filter(f => f.endsWith('.md')).map(f => path.join(BLOG_DIR, f));

    console.log(`📝 Found ${mdFiles.length} blog posts\n`);

    // Process each file
    const results = {
      updated: [],
      skipped: [],
      errors: []
    };

    for (const filepath of mdFiles) {
      try {
        const result = await updateBlogPost(filepath, unsplashKey);

        if (result.updated) {
          results.updated.push(result);
        } else {
          results.skipped.push({ filename: path.basename(filepath), reason: result.reason });
        }

        // Small delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`  ❌ Error processing ${path.basename(filepath)}: ${error.message}`);
        results.errors.push({ filename: path.basename(filepath), error: error.message });
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Updated: ${results.updated.length} posts`);
    console.log(`⏭️  Skipped: ${results.skipped.length} posts (already had images or errors)`);
    console.log(`❌ Errors: ${results.errors.length} posts`);

    if (results.updated.length > 0) {
      console.log('\n✅ Updated Posts:');
      results.updated.forEach(r => {
        console.log(`   - ${r.filename} (Image by ${r.photographer})`);
      });
    }

    if (results.errors.length > 0) {
      console.log('\n❌ Errors:');
      results.errors.forEach(e => {
        console.log(`   - ${e.filename}: ${e.error}`);
      });
    }

    console.log('\n🎉 Done! All blog posts have been processed.\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
