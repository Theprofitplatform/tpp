#!/usr/bin/env node

/**
 * Content Validator
 * Validates blog post quality and SEO requirements
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

  // Sort by date from filename (YYYY-MM-DD-title.md format) or use modification time
  const filesWithStats = await Promise.all(
    mdFiles.map(async (file) => {
      const stat = await fs.stat(path.join(BLOG_DIR, file));
      return { file, mtime: stat.mtime };
    })
  );

  filesWithStats.sort((a, b) => b.mtime - a.mtime);

  if (filesWithStats.length === 0) {
    throw new Error('No blog posts found');
  }

  const latestFile = filesWithStats[0].file;
  const content = await fs.readFile(path.join(BLOG_DIR, latestFile), 'utf-8');

  return { filename: latestFile, content };
}

/**
 * Extract frontmatter
 */
function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]+)$/);
  if (!match) {
    throw new Error('Invalid frontmatter format');
  }

  const frontmatter = {};
  const lines = match[1].split('\n');

  lines.forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      value = value.replace(/^["']|["']$/g, '');
      frontmatter[key] = value;
    }
  });

  return {
    frontmatter,
    body: match[2]
  };
}

/**
 * Validate content
 */
function validateContent(filename, content) {
  console.log('🔍 Validating Blog Post...\n');
  console.log(`📄 File: ${filename}\n`);

  const errors = [];
  const warnings = [];

  try {
    const { frontmatter, body } = extractFrontmatter(content);

    // Check required frontmatter fields
    const required = ['title', 'description', 'pubDate', 'author', 'category'];
    required.forEach(field => {
      if (!frontmatter[field]) {
        errors.push(`Missing required frontmatter field: ${field}`);
      }
    });

    // Validate description length
    if (frontmatter.description) {
      const descLen = frontmatter.description.length;
      if (descLen < 120) {
        warnings.push(`Description too short: ${descLen} chars (recommended: 150-160)`);
      } else if (descLen > 160) {
        warnings.push(`Description too long: ${descLen} chars (recommended: 150-160)`);
      }
    }

    // Content validation
    const wordCount = body.split(/\s+/).length;
    console.log(`📊 Word Count: ${wordCount}`);

    if (wordCount < 1500) {
      warnings.push(`Content is short: ${wordCount} words (recommended: 2500+)`);
    }

    // Check for headings
    const h2Count = (body.match(/^## /gm) || []).length;
    const h3Count = (body.match(/^### /gm) || []).length;

    console.log(`📑 Headings: ${h2Count} H2, ${h3Count} H3`);

    if (h2Count < 3) {
      warnings.push(`Few H2 headings: ${h2Count} (recommended: 5+)`);
    }

    // Check for lists
    const hasBullets = /^[-*] /m.test(body);
    const hasNumbers = /^\d+\. /m.test(body);

    if (!hasBullets && !hasNumbers) {
      warnings.push('No bullet points or numbered lists found');
    }

    // Check for links
    const linkCount = (body.match(/\[.+?\]\(.+?\)/g) || []).length;
    console.log(`🔗 Links: ${linkCount}`);

    if (linkCount === 0) {
      warnings.push('No links found (consider adding internal/external links)');
    }

    // Report results
    console.log('\n' + '='.repeat(60));

    if (errors.length === 0 && warnings.length === 0) {
      console.log('✅ VALIDATION PASSED - All checks successful!');
      return true;
    }

    if (errors.length > 0) {
      console.log('❌ VALIDATION FAILED\n');
      console.log('Errors:');
      errors.forEach(err => console.log(`  ❌ ${err}`));
    }

    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach(warn => console.log(`  ⚠️  ${warn}`));
    }

    console.log('='.repeat(60));

    return errors.length === 0;

  } catch (error) {
    console.error('❌ Validation Error:', error.message);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    const { filename, content } = await getLatestBlogPost();
    const isValid = validateContent(filename, content);

    process.exit(isValid ? 0 : 1);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
