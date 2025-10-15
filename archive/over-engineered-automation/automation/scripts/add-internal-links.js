#!/usr/bin/env node

/**
 * Add Internal Links to Blog Posts
 * Automatically adds 5-8 relevant internal links to each blog post
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Internal link opportunities (phrase -> URL mapping)
const LINK_MAP = {
  // SEO pages
  'seo': '/seo',
  'local seo': '/seo',
  'search engine optimization': '/seo',
  'search engine optimisation': '/seo',

  // Google Ads pages
  'google ads': '/google-ads',
  'ppc': '/google-ads',
  'pay per click': '/google-ads',

  // Web Design pages
  'web design': '/web-design',
  'website design': '/web-design',
  'responsive design': '/web-design',

  // Services
  'digital marketing': '/services',
  'marketing services': '/services',

  // Tools
  'keyword research': '/tools/keyword-research',
  'seo audit': '/tools/seo-audit',
  'competitor analysis': '/tools/competitor-analysis',

  // Contact
  'contact us': '/contact',
  'get in touch': '/contact',
  'book a consultation': '/contact',
};

// Blog post link opportunities (keyword -> slug mapping)
const BLOG_LINK_MAP = {
  'google business profile': 'how-to-optimise-your-google-business-profile-for-sydney-local-search-in-2025',
  'google my business': 'how-to-optimise-your-google-business-profile-for-sydney-local-search-in-2025',
  'local seo checklist': 'local-seo-checklist-47-steps-to-dominate-sydney-suburb-search-results',
  'multi-location seo': 'complete-guide-to-multi-location-seo-for-sydney-business-owners',
  'multi location seo': 'complete-guide-to-multi-location-seo-for-sydney-business-owners',
  'negative keywords': 'negative-keywords-how-to-stop-wasting-money-on-google-ads',
  'google ads mistakes': '7-google-ads-mistakes-costing-sydney-businesses-thousands-every-month',
};

/**
 * Parse markdown frontmatter and content
 */
function parseMarkdown(content) {
  const parts = content.split('---');
  if (parts.length < 3) return { frontmatter: '', content };

  return {
    frontmatter: parts[1],
    content: parts.slice(2).join('---')
  };
}

/**
 * Add internal links to content
 */
function addInternalLinks(content, currentSlug) {
  let modifiedContent = content;
  const linkedPhrases = new Set();
  let linksAdded = 0;
  const maxLinks = 8;

  // Combine all link opportunities
  const allLinks = { ...LINK_MAP };

  // Add blog links (but not to the current post)
  for (const [keyword, slug] of Object.entries(BLOG_LINK_MAP)) {
    if (!currentSlug.includes(slug)) {
      allLinks[keyword] = `/blog/${slug}`;
    }
  }

  // Sort by keyword length (longest first) to avoid partial matches
  const sortedLinks = Object.entries(allLinks).sort((a, b) => b[0].length - a[0].length);

  for (const [keyword, url] of sortedLinks) {
    if (linksAdded >= maxLinks) break;
    if (linkedPhrases.has(keyword)) continue;

    // Check if already linked
    if (modifiedContent.includes(`](${url})`)) continue;

    // Find first occurrence (case-insensitive, not already linked)
    const regex = new RegExp(
      `(?<!\\[)\\b(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b(?!\\]|\\()`,
      'i'
    );
    const match = modifiedContent.match(regex);

    if (match) {
      const matchedText = match[1];
      modifiedContent = modifiedContent.replace(
        regex,
        `[${matchedText}](${url})`
      );
      linkedPhrases.add(keyword);
      linksAdded++;
      console.log(`   ✓ Added link: "${matchedText}" → ${url}`);
    }
  }

  console.log(`   📊 Total links added: ${linksAdded}`);
  return { content: modifiedContent, linksAdded };
}

/**
 * Process a single blog post
 */
async function processBlogPost(filepath) {
  const filename = path.basename(filepath);
  const slug = filename.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');

  console.log(`\n📝 Processing: ${filename}`);

  const content = await fs.readFile(filepath, 'utf-8');
  const { frontmatter, content: body } = parseMarkdown(content);

  // Count existing internal links
  const existingLinks = (body.match(/\]\(\//g) || []).length;
  console.log(`   📊 Existing internal links: ${existingLinks}`);

  if (existingLinks >= 8) {
    console.log(`   ✅ Already has sufficient links (${existingLinks})`);
    return { processed: false, linksAdded: 0 };
  }

  // Add internal links
  const { content: newBody, linksAdded } = addInternalLinks(body, slug);

  if (linksAdded === 0) {
    console.log(`   ℹ️  No new links added`);
    return { processed: false, linksAdded: 0 };
  }

  // Rebuild file
  const newContent = `---${frontmatter}---${newBody}`;
  await fs.writeFile(filepath, newContent, 'utf-8');

  console.log(`   ✅ Updated! (${existingLinks} → ${existingLinks + linksAdded} links)`);
  return { processed: true, linksAdded };
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('\n🔗 Adding Internal Links to Blog Posts...\n');

    const blogDir = path.join(projectRoot, 'src/content/blog');
    const files = await fs.readdir(blogDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));

    console.log(`📚 Found ${mdFiles.length} blog posts\n`);

    let totalProcessed = 0;
    let totalLinksAdded = 0;

    for (const file of mdFiles) {
      const filepath = path.join(blogDir, file);
      const { processed, linksAdded } = await processBlogPost(filepath);

      if (processed) {
        totalProcessed++;
        totalLinksAdded += linksAdded;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log('='.repeat(60));
    console.log(`✅ Posts updated: ${totalProcessed}/${mdFiles.length}`);
    console.log(`🔗 Total links added: ${totalLinksAdded}`);
    console.log(`📈 Average links per updated post: ${totalProcessed > 0 ? (totalLinksAdded / totalProcessed).toFixed(1) : 0}`);
    console.log('='.repeat(60) + '\n');

    if (totalProcessed > 0) {
      console.log('✨ Internal linking complete! Run git diff to review changes.\n');
    } else {
      console.log('ℹ️  All posts already have sufficient internal links.\n');
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

export { addInternalLinks };
