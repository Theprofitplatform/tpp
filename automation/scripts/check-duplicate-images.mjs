#!/usr/bin/env node

/**
 * Check Blog Posts for Duplicate Hero Images
 * Identifies posts using the same image URL
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
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

  return {
    coverImage: coverImageMatch ? coverImageMatch[1] : null,
    hasCoverImage: !!coverImageMatch
  };
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🔍 Checking Blog Posts for Duplicate Hero Images\n');

    // Get all blog post files
    const files = await fs.readdir(BLOG_DIR);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    console.log(`📝 Found ${mdFiles.length} blog posts\n`);

    // Map images to posts
    const imageMap = new Map(); // URL -> [filenames]
    const noCoverImage = [];

    for (const filename of mdFiles) {
      const filepath = path.join(BLOG_DIR, filename);
      const content = await fs.readFile(filepath, 'utf-8');
      const parsed = parseFrontmatter(content);

      if (!parsed) {
        console.log(`  ⚠️  Couldn't parse: ${filename}`);
        continue;
      }

      if (!parsed.hasCoverImage) {
        noCoverImage.push(filename);
        continue;
      }

      const url = parsed.coverImage;
      if (!imageMap.has(url)) {
        imageMap.set(url, []);
      }
      imageMap.get(url).push(filename);
    }

    // Find duplicates
    const duplicates = [];
    for (const [url, filenames] of imageMap.entries()) {
      if (filenames.length > 1) {
        duplicates.push({ url, filenames, count: filenames.length });
      }
    }

    // Report results
    console.log('='.repeat(80));
    console.log('📊 Results:');
    console.log('='.repeat(80));

    if (noCoverImage.length > 0) {
      console.log(`\n❌ Posts WITHOUT coverImage: ${noCoverImage.length}`);
      noCoverImage.forEach(f => console.log(`   - ${f}`));
    }

    if (duplicates.length > 0) {
      console.log(`\n⚠️  DUPLICATE IMAGES FOUND: ${duplicates.length} images used multiple times\n`);

      duplicates.forEach(({ url, filenames, count }) => {
        console.log(`\n🖼️  Image used ${count} times:`);
        console.log(`   URL: ${url.substring(0, 80)}...`);
        console.log(`   Posts:`);
        filenames.forEach(f => console.log(`      - ${f}`));
      });

      console.log(`\n\n💡 Total posts needing unique images: ${duplicates.reduce((sum, d) => sum + d.count - 1, 0)}`);
      console.log('   (Keeping one post per image, updating the rest)\n');
    } else {
      console.log('\n✅ No duplicate images found! All posts have unique hero images.\n');
    }

    // Summary
    const uniqueImages = imageMap.size;
    const totalWithImages = mdFiles.length - noCoverImage.length;

    console.log('='.repeat(80));
    console.log('Summary:');
    console.log('='.repeat(80));
    console.log(`Total posts: ${mdFiles.length}`);
    console.log(`Posts with images: ${totalWithImages}`);
    console.log(`Unique images: ${uniqueImages}`);
    console.log(`Duplicate images: ${duplicates.length}`);
    console.log('='.repeat(80));

    process.exit(duplicates.length > 0 ? 1 : 0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
