#!/usr/bin/env node

/**
 * Fix Duplicate Hero Images in Blog Posts
 * Replaces duplicate images with unique ones from Unsplash
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
  const coverImageMatch = frontmatter.match(/coverImage:\s*["'](.+?)["']/);
  const titleMatch = frontmatter.match(/title:\s*["'](.+?)["']/);
  const categoryMatch = frontmatter.match(/category:\s*["'](.+?)["']/);

  return {
    frontmatter: frontmatter,
    body: match[2],
    coverImage: coverImageMatch ? coverImageMatch[1] : null,
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
 * Update single blog post with new image
 */
async function updateBlogPostImage(filepath, unsplashKey) {
  const filename = path.basename(filepath);
  const content = await fs.readFile(filepath, 'utf-8');

  const parsed = parseFrontmatter(content);
  if (!parsed) {
    console.log(`  ⏭️  Skipping ${filename} - couldn't parse frontmatter`);
    return { updated: false, reason: 'parse-error' };
  }

  console.log(`  🔄 Updating: ${filename}`);
  console.log(`     Old image: ${parsed.coverImage.substring(0, 60)}...`);

  // Fetch new unique image
  const imageData = await getUniqueImage(parsed.category, parsed.title, unsplashKey);
  if (!imageData) {
    console.log(`  ⚠️  No image found for ${filename}`);
    return { updated: false, reason: 'no-image' };
  }

  const imageFields = formatImageForFrontmatter(imageData);

  // Update frontmatter
  const updatedFrontmatter = replaceImageFields(parsed.frontmatter, imageFields);
  const updatedContent = `---\n${updatedFrontmatter}\n---\n${parsed.body}`;

  // Write back to file
  await fs.writeFile(filepath, updatedContent, 'utf-8');

  console.log(`  ✅ Updated with image by ${imageData.photographer.name}`);
  console.log(`     New image: ${imageFields.coverImage.substring(0, 60)}...\n`);

  return {
    updated: true,
    photographer: imageData.photographer.name,
    filename,
    oldUrl: parsed.coverImage,
    newUrl: imageFields.coverImage
  };
}

/**
 * Find duplicate images
 */
async function findDuplicates() {
  const files = await fs.readdir(BLOG_DIR);
  const mdFiles = files.filter(f => f.endsWith('.md'));

  const imageMap = new Map();

  for (const filename of mdFiles) {
    const filepath = path.join(BLOG_DIR, filename);
    const content = await fs.readFile(filepath, 'utf-8');
    const parsed = parseFrontmatter(content);

    if (parsed && parsed.coverImage) {
      const url = parsed.coverImage;
      if (!imageMap.has(url)) {
        imageMap.set(url, []);
      }
      imageMap.get(url).push(filename);
    }
  }

  // Find duplicates (keep first, update rest)
  const toUpdate = [];
  for (const [url, filenames] of imageMap.entries()) {
    if (filenames.length > 1) {
      // Skip first file, update the rest
      for (let i = 1; i < filenames.length; i++) {
        toUpdate.push(filenames[i]);
      }
    }
  }

  return toUpdate;
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🔧 Fixing Duplicate Hero Images\n');

    // Check API key
    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!unsplashKey) {
      throw new Error('UNSPLASH_ACCESS_KEY not found in environment');
    }

    // Find duplicates
    console.log('🔍 Finding duplicate images...\n');
    const toUpdate = await findDuplicates();

    if (toUpdate.length === 0) {
      console.log('✅ No duplicate images found! All posts have unique images.\n');
      process.exit(0);
    }

    console.log(`Found ${toUpdate.length} posts with duplicate images to update:\n`);
    toUpdate.forEach(f => console.log(`   - ${f}`));
    console.log('\n' + '='.repeat(80) + '\n');

    // Process each file
    const results = {
      updated: [],
      errors: []
    };

    for (const filename of toUpdate) {
      const filepath = path.join(BLOG_DIR, filename);

      try {
        const result = await updateBlogPostImage(filepath, unsplashKey);

        if (result.updated) {
          results.updated.push(result);
        }

        // Small delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`  ❌ Error processing ${filename}: ${error.message}\n`);
        results.errors.push({ filename, error: error.message });
      }
    }

    // Summary
    console.log('='.repeat(80));
    console.log('📊 Summary:');
    console.log('='.repeat(80));
    console.log(`✅ Updated: ${results.updated.length} posts`);
    console.log(`❌ Errors: ${results.errors.length} posts`);

    if (results.updated.length > 0) {
      console.log('\n✅ Updated Posts:');
      results.updated.forEach(r => {
        console.log(`   - ${r.filename}`);
        console.log(`     Photographer: ${r.photographer}`);
      });
    }

    if (results.errors.length > 0) {
      console.log('\n❌ Errors:');
      results.errors.forEach(e => {
        console.log(`   - ${e.filename}: ${e.error}`);
      });
    }

    console.log('\n🎉 Done! All duplicate images have been replaced with unique ones.\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
