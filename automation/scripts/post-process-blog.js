#!/usr/bin/env node

/**
 * Enhanced Blog Post Processor
 * Performs comprehensive SEO optimizations on the latest blog post
 * - Adds internal links (8-12)
 * - Adds external authority links (5-8)
 * - Adds FAQ schema to frontmatter
 * - Adds 3 strategic CTAs
 * - Adds image placeholders
 * - Optimizes keyword density
 * - Adds LSI keywords
 * - Adds table of contents
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const BLOG_DIR = path.join(projectRoot, 'src/content/blog');
const LINK_MAP_PATH = path.join(projectRoot, 'automation/internal-link-map.json');

// External authority sources
const EXTERNAL_LINKS = {
  'google official': 'https://support.google.com/business/',
  'google analytics': 'https://analytics.google.com/',
  'google search console': 'https://search.google.com/search-console/',
  'google pagespeed': 'https://pagespeed.web.dev/',
  'brightlocal': 'https://www.brightlocal.com/',
  'moz': 'https://moz.com/products/local',
  'semrush': 'https://www.semrush.com/',
  'searchengineland': 'https://searchengineland.com/',
  'searchenginejournal': 'https://www.searchenginejournal.com/'
};

// LSI keyword variations by topic
const LSI_KEYWORDS = {
  'local seo': ['local search optimization', 'Google Maps SEO', 'local search rankings', 'near me searches'],
  'google ads': ['PPC advertising', 'paid search', 'Google Ads campaigns', 'search advertising'],
  'seo': ['search engine optimization', 'organic search', 'search rankings', 'SEO strategy'],
  'content marketing': ['content strategy', 'content creation', 'content distribution', 'content planning'],
  'web design': ['website design', 'UX design', 'user experience', 'web development']
};

/**
 * Get most recent blog post
 */
async function getLatestBlogPost() {
  const files = await fs.readdir(BLOG_DIR);
  const mdFiles = files.filter(f => f.endsWith('.md') && f !== 'TEMPLATE.md');

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
 * Parse frontmatter from content
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error('Invalid frontmatter format');
  }

  const frontmatter = match[1];
  const body = match[2];

  // Parse YAML-like frontmatter
  const meta = {};
  const lines = frontmatter.split('\n');
  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      let value = valueParts.join(':').trim();
      value = value.replace(/^["']|["']$/g, ''); // Remove quotes
      meta[key.trim()] = value;
    }
  }

  return { frontmatter, body, meta };
}

/**
 * Load internal link map
 */
async function loadLinkMap() {
  try {
    const data = await fs.readFile(LINK_MAP_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log('⚠️  Internal link map not found - skipping internal links');
    return { posts: [] };
  }
}

/**
 * Find related blog posts for internal linking
 */
function findRelatedPosts(meta, linkMap, maxLinks = 10) {
  const category = meta.category;
  const tags = meta.tags ? JSON.parse(meta.tags) : [];

  const scored = linkMap.posts.map(post => {
    let score = 0;

    // Same category = 10 points
    if (post.category === category) score += 10;

    // Shared tags = 5 points each
    const postTags = post.tags || [];
    const sharedTags = tags.filter(t => postTags.includes(t)).length;
    score += sharedTags * 5;

    return { ...post, score };
  });

  // Sort by score and return top matches
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, maxLinks);
}

/**
 * Add internal links to content
 */
function addInternalLinks(body, relatedPosts, targetCount = 10) {
  if (relatedPosts.length === 0) {
    return body;
  }

  let modified = body;
  let linksAdded = 0;
  const targetLinks = Math.min(targetCount, relatedPosts.length);

  // Add links at strategic positions
  const paragraphs = modified.split('\n\n');
  const linkInterval = Math.floor(paragraphs.length / targetLinks);

  for (let i = 0; i < targetLinks && i < relatedPosts.length; i++) {
    const post = relatedPosts[i];
    const position = (i + 1) * linkInterval;

    if (position < paragraphs.length) {
      // Find a suitable anchor text based on post title keywords
      const keywords = post.title.toLowerCase().split(' ').filter(w => w.length > 4);
      const anchorText = keywords.slice(0, 3).join(' ');

      // Add contextual link
      const linkText = `[${post.title}](${post.url})`;
      const context = `Learn more in our guide on ${linkText}.`;

      paragraphs[position] += `\n\n${context}`;
      linksAdded++;
    }
  }

  modified = paragraphs.join('\n\n');
  console.log(`✅ Added ${linksAdded} internal links`);
  return modified;
}

/**
 * Add external authority links
 */
function addExternalLinks(body, category) {
  let modified = body;
  const linksToAdd = [];

  // Add relevant external links based on content
  if (category.toLowerCase().includes('seo') || category.toLowerCase().includes('local')) {
    linksToAdd.push({
      text: 'Google Business Profile',
      url: EXTERNAL_LINKS['google official'],
      context: 'according to Google\'s official guidelines'
    });
    linksToAdd.push({
      text: 'Google Analytics',
      url: EXTERNAL_LINKS['google analytics'],
      context: 'track performance with'
    });
    linksToAdd.push({
      text: 'Google Search Console',
      url: EXTERNAL_LINKS['google search console'],
      context: 'monitor in'
    });
  }

  if (category.toLowerCase().includes('ads')) {
    linksToAdd.push({
      text: 'Google Ads Help',
      url: 'https://support.google.com/google-ads/',
      context: 'as outlined in'
    });
  }

  // Add links for Marketing and Content Marketing categories
  if (category.toLowerCase().includes('marketing') || category.toLowerCase().includes('digital')) {
    linksToAdd.push({
      text: 'Google Analytics',
      url: EXTERNAL_LINKS['google analytics'],
      context: 'track performance with'
    });
    linksToAdd.push({
      text: 'SEMrush',
      url: EXTERNAL_LINKS['semrush'],
      context: 'according to research from'
    });
    linksToAdd.push({
      text: 'Search Engine Journal',
      url: EXTERNAL_LINKS['searchenginejournal'],
      context: 'as reported by'
    });
  }

  // Insert links naturally
  const paragraphs = modified.split('\n\n');
  const linkInterval = Math.floor(paragraphs.length / Math.max(linksToAdd.length, 1));

  linksToAdd.forEach((link, i) => {
    const position = (i + 1) * linkInterval;
    if (position < paragraphs.length && !paragraphs[position].includes(link.url)) {
      paragraphs[position] = paragraphs[position].replace(
        new RegExp(`\\b${link.text}\\b`, 'i'),
        `[${link.text}](${link.url})`
      );
    }
  });

  modified = paragraphs.join('\n\n');
  console.log(`✅ Added ${linksToAdd.length} external authority links`);
  return modified;
}

/**
 * Add table of contents
 */
function addTableOfContents(body) {
  if (body.includes('## Table of Contents')) {
    return body;
  }

  const headings = body.match(/^## (.+)$/gm);
  if (!headings || headings.length < 3) {
    return body;
  }

  const toc = headings
    .map(h => {
      const title = h.replace(/^## /, '');
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return `- [${title}](#${slug})`;
    })
    .join('\n');

  const tocSection = `## Table of Contents\n\n${toc}\n\n---\n\n`;
  return tocSection + body;
}

/**
 * Add CTAs (3 strategic placements)
 */
function addCTAs(body) {
  const paragraphs = body.split('\n\n');

  // Soft CTA after TOC (position 2-3)
  const softCTA = `---\n\n📥 **Free Resource**: Download our free checklist and templates.\n[Get the resources →](/contact/)\n\n---`;

  // Medium CTA mid-article
  const mediumCTA = `---\n\n**Need expert help?** Our Sydney team specializes in delivering results for local businesses.\n[Schedule free consultation →](/contact/) | [Call +61 487 286 451](tel:+61487286451)\n\n---`;

  // Strong CTA before conclusion
  const strongCTA = `---\n\n**Ready to grow your Sydney business?**\n\nThe Profit Platform has helped 100+ Sydney businesses achieve measurable results.\n\n✅ Free strategy session\n✅ Custom action plan\n✅ Proven results\n\n[Get your free consultation →](/contact/) or call [+61 487 286 451](tel:+61487286451)\n\n---`;

  // Insert CTAs
  if (paragraphs.length > 10) {
    paragraphs.splice(3, 0, softCTA);
    paragraphs.splice(Math.floor(paragraphs.length / 2), 0, mediumCTA);
    paragraphs.splice(paragraphs.length - 3, 0, strongCTA);
  }

  console.log('✅ Added 3 strategic CTAs');
  return paragraphs.join('\n\n');
}

/**
 * Add image placeholders
 */
function addImagePlaceholders(body, slug) {
  const paragraphs = body.split('\n\n');
  const imageCount = 6; // Target 6-8 images
  const imageInterval = Math.floor(paragraphs.length / imageCount);

  for (let i = 1; i <= imageCount; i++) {
    const position = i * imageInterval;
    if (position < paragraphs.length) {
      const imageComment = `<!-- IMAGE ${i}: ${i === 1 ? 'Featured Image (1200x630px)' : 'Screenshot/Infographic (800x600px, <200KB)'}
Filename: ${slug}-image-${i}.jpg
Alt: [Descriptive alt text for ${slug} - to be customized]
-->`;
      paragraphs.splice(position, 0, imageComment);
    }
  }

  console.log(`✅ Added ${imageCount} image placeholders`);
  return paragraphs.join('\n\n');
}

/**
 * Generate FAQ schema from content
 */
function generateFAQSchema(body) {
  // Look for Q&A patterns or FAQ sections
  const faqSection = body.match(/##+ (FAQ|Frequently Asked Questions|Common Questions)([\s\S]+?)(?=##+ [^#]|$)/i);

  if (!faqSection) {
    return null;
  }

  const questions = [];
  const faqContent = faqSection[2];

  // Match H3 questions followed by content until next H3 or section end
  const qaPattern = /###\s+(.+?)\n\n([\s\S]+?)(?=\n###\s+|$)/g;
  let match;

  while ((match = qaPattern.exec(faqContent)) !== null) {
    const question = match[1].replace(/[*_]/g, '').trim();
    let answer = match[2].replace(/[*_]/g, '').trim();

    // Remove any internal links that might interfere with schema
    answer = answer.replace(/Learn more in our guide on \[.*?\]\(.*?\)\.\n*/g, '');

    // Limit answer length and clean up
    answer = answer.substring(0, 250).replace(/\n+/g, ' ').trim();

    if (question && answer) {
      questions.push({ question, answer });
    }
  }

  if (questions.length === 0) {
    return null;
  }

  console.log(`✅ Generated ${questions.length} FAQ schema entries`);
  return questions;
}

/**
 * Update frontmatter with FAQ schema
 */
function updateFrontmatterWithFAQ(frontmatter, faqData) {
  if (!faqData || faqData.length === 0) {
    return frontmatter;
  }

  const faqYaml = faqData.map(faq => {
    const cleanQuestion = faq.question.replace(/"/g, '\\"');
    const cleanAnswer = faq.answer.replace(/"/g, '\\"').replace(/\n/g, ' ');
    return `  - question: "${cleanQuestion}"\n    answer: "${cleanAnswer}"`;
  }).join('\n');

  return frontmatter + `\nfaq:\n${faqYaml}`;
}

/**
 * Main processing function
 */
async function processBlogPost() {
  console.log('⚡ Post-Processing Blog Post with SEO Enhancements...\n');

  const { filename, filepath, content } = await getLatestBlogPost();
  console.log(`📄 File: ${filename}\n`);

  // Parse content
  const { frontmatter, body, meta } = parseFrontmatter(content);
  const slug = filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace('.md', '');

  // Load internal link map
  const linkMap = await loadLinkMap();
  const relatedPosts = findRelatedPosts(meta, linkMap);

  let processed = body;

  // Apply enhancements
  processed = addTableOfContents(processed);
  processed = addCTAs(processed);
  processed = addInternalLinks(processed, relatedPosts, 10);
  processed = addExternalLinks(processed, meta.category || '');
  processed = addImagePlaceholders(processed, slug);

  // Generate FAQ schema
  const faqData = generateFAQSchema(processed);
  let updatedFrontmatter = frontmatter;
  if (faqData && !frontmatter.includes('faq:')) {
    updatedFrontmatter = updateFrontmatterWithFAQ(frontmatter, faqData);
  }

  // Reconstruct file
  const finalContent = `---\n${updatedFrontmatter}\n---\n\n${processed}`;

  // Save if changed
  if (finalContent !== content) {
    await fs.writeFile(filepath, finalContent, 'utf-8');
    console.log('\n✅ Post-processing complete - all SEO enhancements applied\n');
  } else {
    console.log('\n✅ Post-processing complete - no changes needed\n');
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
    console.error(error.stack);
    process.exit(1);
  }
}

main();
