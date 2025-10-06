#!/usr/bin/env node
/**
 * Broken Link Checker
 * Validates all internal and external links in blog posts
 */

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

/**
 * Extract all links from markdown content
 * @param {string} markdown
 * @returns {Array<{text, url, type}>}
 */
function extractLinks(markdown) {
  const links = [];

  // Match markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^\)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(markdown)) !== null) {
    const text = match[1];
    const url = match[2];

    let type;
    if (url.startsWith('/')) {
      type = 'internal';
    } else if (url.startsWith('http://') || url.startsWith('https://')) {
      type = 'external';
    } else if (url.startsWith('#')) {
      type = 'anchor';
    } else {
      type = 'relative';
    }

    links.push({ text, url, type });
  }

  return links;
}

/**
 * Check if an internal link exists in the project
 * @param {string} url - Internal URL (e.g., /seo, /blog/post-slug)
 * @returns {Promise<boolean>}
 */
async function checkInternalLink(url) {
  // Remove query params and hash
  const cleanUrl = url.split('?')[0].split('#')[0];

  // Check common patterns
  const possiblePaths = [];

  // Service pages
  if (cleanUrl === '/seo' || cleanUrl === '/google-ads' || cleanUrl === '/web-design' || cleanUrl === '/services') {
    possiblePaths.push(path.join(projectRoot, `src/pages${cleanUrl}.astro`));
    possiblePaths.push(path.join(projectRoot, `src/pages${cleanUrl}/index.astro`));
  }

  // Tool pages
  if (cleanUrl.startsWith('/tools/')) {
    const toolName = cleanUrl.replace('/tools/', '');
    possiblePaths.push(path.join(projectRoot, `src/pages/tools/${toolName}.astro`));
    possiblePaths.push(path.join(projectRoot, `src/pages/tools/${toolName}/index.astro`));
  }

  // Blog posts
  if (cleanUrl.startsWith('/blog/')) {
    const slug = cleanUrl.replace('/blog/', '');
    const blogDir = path.join(projectRoot, 'src/content/blog');

    try {
      const files = await fs.readdir(blogDir);
      const found = files.some(file => {
        return file.endsWith('.md') && file.includes(slug);
      });
      if (found) return true;
    } catch (e) {
      // Blog dir doesn't exist
    }
  }

  // Check if any possible path exists
  for (const p of possiblePaths) {
    try {
      await fs.access(p);
      return true;
    } catch (e) {
      // File doesn't exist
    }
  }

  return false;
}

/**
 * Check if an external link is valid (HEAD request)
 * @param {string} url
 * @returns {Promise<{valid: boolean, status?: number, error?: string}>}
 */
async function checkExternalLink(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Link-Checker/1.0)'
      }
    });

    clearTimeout(timeout);

    return {
      valid: response.ok,
      status: response.status
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { valid: false, error: 'Timeout' };
    }
    return { valid: false, error: error.message };
  }
}

/**
 * Check links in a blog post
 * @param {string} filepath
 * @returns {Promise<Object>}
 */
async function checkLinksInPost(filepath) {
  const fileContent = await fs.readFile(filepath, 'utf-8');
  const { content } = matter(fileContent);

  const links = extractLinks(content);
  const results = {
    total: links.length,
    internal: { total: 0, broken: [] },
    external: { total: 0, broken: [], timeout: [] },
    anchor: { total: 0 },
    relative: { total: 0 }
  };

  console.log(`\n📄 Checking links in: ${path.basename(filepath)}`);
  console.log(`   Total links found: ${links.length}`);

  for (const link of links) {
    if (link.type === 'internal') {
      results.internal.total++;
      const exists = await checkInternalLink(link.url);
      if (!exists) {
        results.internal.broken.push(link);
        console.log(`   ❌ Broken internal: ${link.url} ("${link.text}")`);
      }
    } else if (link.type === 'external') {
      results.external.total++;
      const check = await checkExternalLink(link.url);
      if (!check.valid) {
        if (check.error === 'Timeout') {
          results.external.timeout.push(link);
          console.log(`   ⏱️  Timeout external: ${link.url}`);
        } else {
          results.external.broken.push(link);
          console.log(`   ❌ Broken external: ${link.url} (${check.error || check.status})`);
        }
      }
    } else if (link.type === 'anchor') {
      results.anchor.total++;
    } else if (link.type === 'relative') {
      results.relative.total++;
      console.log(`   ⚠️  Relative link (may be broken): ${link.url}`);
    }
  }

  if (results.internal.broken.length === 0 && results.external.broken.length === 0) {
    console.log(`   ✅ All links valid!`);
  }

  return results;
}

/**
 * Main function
 */
async function main() {
  console.log('🔗 Broken Link Checker\n');
  console.log('━'.repeat(60));

  try {
    const blogDir = path.join(projectRoot, 'src/content/blog');
    const files = await fs.readdir(blogDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    console.log(`\n📄 Found ${mdFiles.length} blog posts`);

    const allResults = {
      totalLinks: 0,
      internalBroken: 0,
      externalBroken: 0,
      externalTimeout: 0,
      posts: []
    };

    for (const file of mdFiles) {
      const filepath = path.join(blogDir, file);
      const results = await checkLinksInPost(filepath);

      allResults.totalLinks += results.total;
      allResults.internalBroken += results.internal.broken.length;
      allResults.externalBroken += results.external.broken.length;
      allResults.externalTimeout += results.external.timeout.length;

      allResults.posts.push({
        file,
        results
      });
    }

    // Summary
    console.log('\n' + '━'.repeat(60));
    console.log('\n📊 SUMMARY:');
    console.log(`   Total links checked: ${allResults.totalLinks}`);
    console.log(`   Broken internal links: ${allResults.internalBroken}`);
    console.log(`   Broken external links: ${allResults.externalBroken}`);
    console.log(`   External timeouts: ${allResults.externalTimeout}`);

    if (allResults.internalBroken > 0 || allResults.externalBroken > 0) {
      console.log('\n⚠️  Action required: Fix broken links above');
      process.exit(1);
    } else {
      console.log('\n✅ All links valid!');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { checkLinksInPost, extractLinks };
