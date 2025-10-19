#!/usr/bin/env node

/**
 * Blog Post Processor
 * Performs basic SEO optimizations on the latest blog post
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const BLOG_DIR = path.join(projectRoot, 'src/content/blog');

/**
 * Get most recent blog post
 */
async function getLatestBlogPost() {
  const files = await fs.readdir(BLOG_DIR);
  const mdFiles = files.filter(f => f.endsWith('.md') && f !== 'TEMPLATE.md');

  // Sort by modification time to get truly latest file
  const filesWithStats = await Promise.all(
    mdFiles.map(async (file) => {
      const filepath = path.join(BLOG_DIR, file);
      const stat = await fs.stat(filepath);
      return { file, filepath, mtime: stat.mtime };
    })
  );

  filesWithStats.sort((a, b) => b.mtime - a.mtime);

  if (filesWithStats.length === 0) {
    throw new Error('No blog posts found');
  }

  const latest = filesWithStats[0];
  const content = await fs.readFile(latest.filepath, 'utf-8');

  return { filename: latest.file, filepath: latest.filepath, content };
}

/**
 * Add table of contents if missing
 */
function addTableOfContents(content) {
  if (content.includes('## Table of Contents') || content.includes('## Contents')) {
    return content;
  }

  // Extract H2 headings
  const headings = content.match(/^## (.+)$/gm);

  if (!headings || headings.length < 3) {
    return content; // Too few headings for TOC
  }

  const toc = headings
    .filter(h => !h.includes('Table of Contents') && !h.includes('Contents'))
    .map(h => {
      const title = h.replace(/^## /, '');
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return `- [${title}](#${slug})`;
    })
    .join('\n');

  const tocSection = `## Table of Contents\n\n${toc}\n\n`;

  // Insert TOC after frontmatter
  const match = content.match(/^---\n[\s\S]+?\n---\n\n/);
  if (match) {
    return content.replace(match[0], match[0] + tocSection);
  }

  return content;
}

/**
 * Ensure proper heading hierarchy
 */
function fixHeadingHierarchy(content) {
  // Check for H1 usage (should only be in title)
  const h1Count = (content.match(/^# [^#]/gm) || []).length;
  if (h1Count > 0) {
    console.log('⚠️  Found H1 headings in content - converting to H2');
    content = content.replace(/^# ([^#])/gm, '## $1');
  }

  return content;
}

/**
 * Add FAQ schema markup suggestion
 */
function addFAQSuggestion(content) {
  // Look for FAQ-like sections
  const hasFAQ = content.match(/##+ (FAQ|Frequently Asked Questions|Common Questions)/i);

  if (hasFAQ && !content.includes('<!-- FAQ Schema -->')) {
    console.log('💡 FAQ section detected - consider adding FAQ schema markup');
  }

  return content;
}

/**
 * Process blog post
 */
async function processBlogPost() {
  console.log('⚡ Post-Processing Blog Post...\n');

  const { filename, filepath, content } = await getLatestBlogPost();
  console.log(`📄 File: ${filename}\n`);

  let processed = content;

  // Apply processing
  processed = fixHeadingHierarchy(processed);
  processed = addTableOfContents(processed);
  processed = addFAQSuggestion(processed);

  // Save if changed
  if (processed !== content) {
    await fs.writeFile(filepath, processed, 'utf-8');
    console.log('✅ Post-processing complete - changes saved\n');
  } else {
    console.log('✅ Post-processing complete - no changes needed\n');
  }

  return true;
}

/**
 * Main execution
 */
async function main() {
  try {
    await processBlogPost();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
