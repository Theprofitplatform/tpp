#!/usr/bin/env node

/**
 * Update Blog Images Script
 * Automatically fetches and adds Unsplash images to blog posts without cover images
 */

import { readFile, writeFile, readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchAndSaveFeaturedImage } from './unsplash-fetcher.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');
const blogDir = path.join(projectRoot, 'src/content/blog');

/**
 * Parse frontmatter from markdown file
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const frontmatter = match[1];
  const body = content.slice(match[0].length);

  return { frontmatter, body, fullMatch: match[0] };
}

/**
 * Extract title and category from frontmatter
 */
function extractMetadata(frontmatter) {
  const titleMatch = frontmatter.match(/title:\s*["'](.+?)["']/);
  const categoryMatch = frontmatter.match(/category:\s*["'](.+?)["']/);
  const coverImageMatch = frontmatter.match(/coverImage:\s*["'](.+?)["']/);
  const commentedImageMatch = frontmatter.match(/# coverImage:/);

  return {
    title: titleMatch ? titleMatch[1] : null,
    category: categoryMatch ? categoryMatch[1] : null,
    hasCoverImage: !!coverImageMatch,
    hasCommentedImage: !!commentedImageMatch
  };
}

/**
 * Update blog post with Unsplash image
 */
async function updateBlogPost(filePath, slug) {
  const content = await readFile(filePath, 'utf-8');
  const parsed = parseFrontmatter(content);

  if (!parsed) {
    console.log(`⏭️  Skipping ${slug} - no frontmatter found`);
    return;
  }

  const metadata = extractMetadata(parsed.frontmatter);

  // Skip if already has an image (unless it's commented out)
  if (metadata.hasCoverImage && !metadata.hasCommentedImage) {
    console.log(`✓ ${slug} - already has cover image`);
    return;
  }

  if (!metadata.title || !metadata.category) {
    console.log(`⚠️  ${slug} - missing title or category`);
    return;
  }

  console.log(`\n📝 Processing: ${slug}`);
  console.log(`   Title: ${metadata.title}`);
  console.log(`   Category: ${metadata.category}`);

  // Fetch Unsplash image
  const imageData = await fetchAndSaveFeaturedImage(
    metadata.title,
    metadata.category,
    slug
  );

  if (!imageData) {
    console.log(`   ⚠️  No image found for ${slug}`);
    return;
  }

  // Build new frontmatter with image
  let newFrontmatter = parsed.frontmatter;

  // Remove commented coverImage line if it exists
  if (metadata.hasCommentedImage) {
    newFrontmatter = newFrontmatter.replace(/# coverImage:.*\r?\n?/g, '');
  }

  // Add coverImage, coverImageAlt, and coverImageCredit
  const imageLine = `coverImage: "${imageData.coverImage}"`;
  const altLine = `coverImageAlt: "${imageData.coverImageAlt}"`;
  const creditLine = `coverImageCredit:\n  name: "${imageData.coverImageCredit.name}"\n  link: "${imageData.coverImageCredit.link}"`;

  // Insert after draft line (or before seo section or at end)
  if (newFrontmatter.includes('draft:')) {
    newFrontmatter = newFrontmatter.replace(
      /(draft:.*)\r?\n/,
      `$1\n${imageLine}\n${altLine}\n${creditLine}\n`
    );
  } else if (newFrontmatter.includes('\nseo:') || newFrontmatter.includes('\r\nseo:')) {
    newFrontmatter = newFrontmatter.replace(
      /(\r?\n)(seo:)/,
      `$1${imageLine}\n${altLine}\n${creditLine}\n$2`
    );
  } else {
    // Append at the end
    newFrontmatter = newFrontmatter.trimEnd() + `\n${imageLine}\n${altLine}\n${creditLine}`;
  }

  // Rebuild the file
  const newContent = `---\n${newFrontmatter}\n---${parsed.body}`;

  // Write updated content
  await writeFile(filePath, newContent, 'utf-8');
  console.log(`   ✅ Updated ${slug} with Unsplash image`);
}

/**
 * Main function
 */
async function main() {
  console.log('🖼️  Blog Image Updater\n');
  console.log('━'.repeat(50));

  try {
    // Get all markdown files
    const files = await readdir(blogDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    console.log(`\nFound ${mdFiles.length} blog posts\n`);

    for (const file of mdFiles) {
      const filePath = path.join(blogDir, file);
      const slug = file.replace('.md', '');

      await updateBlogPost(filePath, slug);
    }

    console.log('\n━'.repeat(50));
    console.log('✅ All blog posts processed!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
