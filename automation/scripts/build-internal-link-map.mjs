#!/usr/bin/env node

/**
 * Internal Link Map Builder
 * Creates a map of all blog posts for internal linking suggestions
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const BLOG_DIR = path.join(projectRoot, 'src/content/blog');
const OUTPUT_FILE = path.join(projectRoot, 'automation/internal-link-map.json');

console.log('🔗 Building Internal Link Map...\n');

/**
 * Extract frontmatter from markdown
 */
function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]+?)\n---/);
  if (!match) return null;

  const frontmatter = {};
  const lines = match[1].split('\n');

  lines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();

      // Handle arrays
      if (value.startsWith('[')) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Keep as string if parse fails
        }
      } else {
        // Remove quotes
        value = value.replace(/^["']|["']$/g, '');
      }

      frontmatter[key] = value;
    }
  });

  return frontmatter;
}

/**
 * Build link map
 */
async function buildLinkMap() {
  try {
    const files = await fs.readdir(BLOG_DIR);
    const mdFiles = files.filter(f => f.endsWith('.md') && f !== 'TEMPLATE.md');

    const linkMap = [];

    for (const file of mdFiles) {
      const content = await fs.readFile(path.join(BLOG_DIR, file), 'utf-8');
      const frontmatter = extractFrontmatter(content);

      if (!frontmatter) continue;

      // Extract slug from filename
      const slug = file
        .replace(/^\d{4}-\d{2}-\d{2}-/, '')
        .replace(/\.md$/, '');

      const entry = {
        slug,
        title: frontmatter.title || '',
        category: frontmatter.category || '',
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        url: `/blog/${slug}/`,
        pubDate: frontmatter.pubDate || ''
      };

      linkMap.push(entry);
    }

    // Sort by date (newest first)
    linkMap.sort((a, b) => b.pubDate.localeCompare(a.pubDate));

    // Ensure output directory exists
    await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });

    // Save link map
    await fs.writeFile(
      OUTPUT_FILE,
      JSON.stringify({ posts: linkMap, generatedAt: new Date().toISOString() }, null, 2)
    );

    console.log(`✅ Link map created with ${linkMap.length} posts`);
    console.log(`📄 Saved to: ${OUTPUT_FILE}\n`);

    return true;

  } catch (error) {
    console.error('❌ Error building link map:', error.message);
    return false;
  }
}

buildLinkMap()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
