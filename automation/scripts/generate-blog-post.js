import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchAndSaveFeaturedImage } from './unsplash-fetcher.js';
import { retryWithBackoff, RateLimiter } from '../utils/api-helpers.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Load .env.local for local development
dotenv.config({ path: path.join(projectRoot, '.env.local') });

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY
});

// Rate limiter: 5 requests per minute (Claude tier limits)
const rateLimiter = new RateLimiter(5, 5 / 60); // 5 tokens, refill 5 per 60 seconds

/**
 * Assign author based on topic expertise and category
 * @param {string} category - Blog post category
 * @param {Array<string>} tags - Post tags
 * @returns {string} Author name
 */
function assignAuthorByExpertise(category, tags = []) {
  // Avi Sharma - Founder & SEO Strategist
  // Expertise: SEO, Local SEO, Technical SEO, Strategy
  const aviExpertise = {
    categories: ['SEO', 'Analytics', 'Marketing Strategy'],
    tags: ['Local SEO', 'Technical SEO', 'SEO Tools', 'Keyword Research',
           'Link Building', 'Schema Markup', 'Voice Search', 'Multi-Location SEO',
           'SEO', 'Rankings', 'Google Business Profile', 'Local Search']
  };

  // TPP Team - Digital Marketing Experts
  // Expertise: Google Ads, PPC, Web Design, Paid Advertising
  const tppExpertise = {
    categories: ['Google Ads', 'Web Design', 'Digital Marketing', 'Content Marketing'],
    tags: ['PPC', 'Google Ads', 'Ad Copywriting', 'CPC', 'Quality Score',
           'Bidding Strategies', 'Remarketing', 'Landing Pages', 'Web Design',
           'CRO', 'Conversions', 'Page Speed', 'Mobile Design', 'Accessibility']
  };

  // Check category match first (higher weight)
  if (aviExpertise.categories.some(cat => category.toLowerCase().includes(cat.toLowerCase()))) {
    return 'Avi';
  }
  if (tppExpertise.categories.some(cat => category.toLowerCase().includes(cat.toLowerCase()))) {
    return 'TPP Team';
  }

  // Check tag overlap (count matches)
  const aviTagMatches = tags.filter(tag =>
    aviExpertise.tags.some(expertTag =>
      tag.toLowerCase().includes(expertTag.toLowerCase()) ||
      expertTag.toLowerCase().includes(tag.toLowerCase())
    )
  ).length;

  const tppTagMatches = tags.filter(tag =>
    tppExpertise.tags.some(expertTag =>
      tag.toLowerCase().includes(expertTag.toLowerCase()) ||
      expertTag.toLowerCase().includes(tag.toLowerCase())
    )
  ).length;

  // Assign based on tag matches
  if (aviTagMatches > tppTagMatches) {
    return 'Avi';
  } else if (tppTagMatches > aviTagMatches) {
    return 'TPP Team';
  }

  // Default to Avi for general content (founder adds more E-E-A-T weight)
  return 'Avi';
}

/**
 * Main blog post generation function
 */
async function generateBlogPost() {
  try {
    console.log('🤖 Starting blog post generation...\n');

    // 1. Load topic queue
    const queuePath = path.join(projectRoot, 'automation/topic-queue.json');
    const queue = JSON.parse(await fs.readFile(queuePath, 'utf-8'));

    // 2. Select next topic (by priority or manual topic ID)
    const topicId = process.env.TOPIC_ID;
    let topic;

    if (topicId) {
      topic = queue.queue.find(t => t.id === parseInt(topicId));
      console.log(`📌 Manual topic selection: ID ${topicId}`);
    } else {
      // Get next pending topic by priority
      const pending = queue.queue.filter(t => t.status === 'pending');
      if (pending.length === 0) {
        throw new Error('❌ No pending topics in queue');
      }
      topic = pending.sort((a, b) => a.priority - b.priority)[0];
      console.log(`📌 Auto-selected topic by priority`);
    }

    if (!topic) {
      throw new Error('❌ Topic not found');
    }

    console.log(`📝 Topic: ${topic.title}`);
    console.log(`🎯 Keyword: ${topic.targetKeyword}`);
    console.log(`📁 Category: ${topic.category}\n`);

    // 3. Fetch featured image from Unsplash
    let imageData = null;
    try {
      const slug = topic.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      imageData = await fetchAndSaveFeaturedImage(
        topic.targetKeyword,
        topic.category,
        slug
      );
    } catch (error) {
      console.warn('⚠️  Failed to fetch image, continuing without:', error.message);
    }

    // 4. Load brand guidelines and template
    const brandGuidelines = await fs.readFile(
      path.join(projectRoot, 'automation/brand-guidelines.md'),
      'utf-8'
    );

    const template = await fs.readFile(
      path.join(projectRoot, 'automation/prompt-templates/blog-post.txt'),
      'utf-8'
    );

    // 4.5 Load internal link map for intelligent linking
    let relatedPosts = [];
    try {
      const linkMapPath = path.join(projectRoot, 'automation/internal-link-map.json');
      const linkMap = JSON.parse(await fs.readFile(linkMapPath, 'utf-8'));

      // Find posts related to this topic's category/tags
      const relevantPosts = Object.values(linkMap)
        .filter(post =>
          post.category === topic.category ||
          post.tags.some(tag => topic.tags.includes(tag))
        )
        .slice(0, 5);

      relatedPosts = relevantPosts.map(p => ({
        title: p.title,
        url: p.url,
        category: p.category
      }));

      if (relatedPosts.length > 0) {
        console.log(`🔗 Found ${relatedPosts.length} related posts for internal linking`);
      }
    } catch (error) {
      console.warn('⚠️  Internal link map not found, skipping intelligent linking');
    }

    // 5. Build prompt with caching
    const systemPrompt = `You are an expert digital marketing content writer for The Profit Platform, a Sydney-based agency.

BRAND GUIDELINES:
${brandGuidelines}

Follow these guidelines strictly to maintain brand voice and quality standards.`;

    // Add related posts for internal linking
    let relatedPostsSection = '';
    if (relatedPosts.length > 0) {
      relatedPostsSection = `\n\nRELATED POSTS FOR INTERNAL LINKING:
Include 2-3 contextual internal links to these related blog posts:

${relatedPosts.map(p => `- [${p.title}](${p.url}) - ${p.category}`).join('\n')}

Link to these posts naturally where relevant in the content. Use contextual anchor text, not "click here".`;
    }

    const userPrompt = template
      .replace('{brand_guidelines}', '(see system context)')
      .replace('{title}', topic.title)
      .replace('{target_keyword}', topic.targetKeyword)
      .replace('{category}', topic.category)
      .replace('{tags}', topic.tags.join(', '))
      .replace('{search_intent}', topic.searchIntent)
      + relatedPostsSection;

    // 6. Generate content with Claude (with retry + rate limiting)
    console.log('🧠 Generating content with Claude API...');

    const message = await rateLimiter.execute(() =>
      retryWithBackoff(
        async () => {
          return await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 8000,
            system: [
              {
                type: 'text',
                text: systemPrompt,
                cache_control: { type: 'ephemeral' } // Cache brand guidelines
              }
            ],
            messages: [
              {
                role: 'user',
                content: userPrompt
              }
            ]
          });
        },
        {
          maxRetries: 3,
          initialDelay: 2000,
          maxDelay: 30000,
          backoffMultiplier: 2
        }
      )
    );

    const content = message.content[0].text;
    console.log(`✅ Content generated (${content.split(/\s+/).length} words)\n`);

    // 7. Generate SEO meta description (with retry + rate limiting)
    console.log('🔍 Generating SEO meta description...');

    const metaMessage = await rateLimiter.execute(() =>
      retryWithBackoff(
        async () => {
          return await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 200,
            messages: [
              {
                role: 'user',
                content: `Write a compelling meta description (150-160 characters) for this blog post.

Title: ${topic.title}
Target Keyword: ${topic.targetKeyword}

Content preview:
${content.substring(0, 800)}

Requirements:
- Include target keyword naturally
- Action-oriented and compelling
- Exactly 150-160 characters
- No quotation marks

Return only the meta description text.`
              }
            ]
          });
        },
        {
          maxRetries: 3,
          initialDelay: 2000,
          maxDelay: 30000,
          backoffMultiplier: 2
        }
      )
    );

    const metaDescription = metaMessage.content[0].text
      .trim()
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .substring(0, 160);

    console.log(`✅ Meta description: ${metaDescription.length} chars\n`);

    // 8. Add internal links
    console.log('🔗 Adding internal links...');
    const contentWithLinks = await addInternalLinks(content);

    // 9. Calculate read time
    const wordCount = content.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200); // Average reading speed: 200 wpm

    // 10. Generate slug
    const slug = topic.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // 11. Determine author based on topic expertise
    const author = assignAuthorByExpertise(topic.category, topic.tags);

    // 12. Create frontmatter with image data
    const today = new Date().toISOString().split('T')[0];
    let frontmatter = `---
title: "${topic.title}"
description: "${metaDescription}"
author: "${author}"
publishDate: ${today}
category: "${topic.category}"
tags: ${JSON.stringify(topic.tags)}
featured: false
draft: false
readTime: "${readTime} min"`;

    // Add image data if available
    if (imageData) {
      frontmatter += `
coverImage: "${imageData.coverImage}"
coverImageAlt: "${imageData.coverImageAlt}"
coverImageCredit:
  name: "${imageData.coverImageCredit.name}"
  link: "${imageData.coverImageCredit.link}"`;
    }

    frontmatter += `
seo:
  title: "${topic.title} | The Profit Platform"
  description: "${metaDescription}"
  keywords: ${JSON.stringify([topic.targetKeyword, ...topic.tags.slice(0, 3)])}
---

`;

    // 13. Combine and save
    const fullContent = frontmatter + contentWithLinks;
    const filename = `${today}-${slug}.md`;
    const filepath = path.join(projectRoot, 'src/content/blog', filename);

    await fs.writeFile(filepath, fullContent, 'utf-8');

    // 14. Update queue (mark as published)
    topic.status = 'published';
    topic.publishedDate = today;
    topic.publishedSlug = slug;
    topic.wordCount = wordCount;
    topic.author = author;

    queue.published.push(topic);
    queue.queue = queue.queue.filter(t => t.id !== topic.id);

    await fs.writeFile(queuePath, JSON.stringify(queue, null, 2));

    // 15. Output for GitHub Actions (special format for workflow)
    if (process.env.GITHUB_OUTPUT) {
      await fs.appendFile(
        process.env.GITHUB_OUTPUT,
        `title=${topic.title}\n` +
        `url=https://theprofitplatform.com.au/blog/${slug}\n` +
        `filepath=${filepath}\n` +
        `slug=${slug}\n` +
        `wordcount=${wordCount}\n`
      );
    }

    // 16. Success summary
    console.log('\n✅ Blog post generated successfully!');
    console.log(`📄 File: ${filename}`);
    console.log(`📊 Stats:
   - Word count: ${wordCount}
   - Read time: ${readTime} min
   - Author: ${author}
   - Category: ${topic.category}
   - Tags: ${topic.tags.join(', ')}`);
    console.log(`🔗 URL: https://theprofitplatform.com.au/blog/${slug}`);
    console.log(`\n📋 Remaining topics in queue: ${queue.queue.length}`);

    return {
      success: true,
      topic,
      filepath,
      slug,
      wordCount,
      author
    };

  } catch (error) {
    console.error('\n❌ Error generating blog post:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

/**
 * Add internal links to relevant service pages
 */
async function addInternalLinks(content) {
  const linkMap = {
    // SEO links
    'local seo': '/seo',
    'search engine optimization': '/seo',
    'seo strategy': '/seo',
    'seo services': '/seo',

    // Google Ads links
    'google ads': '/google-ads',
    'ppc campaign': '/google-ads',
    'paid advertising': '/google-ads',

    // Web Design links
    'web design': '/web-design',
    'website design': '/web-design',
    'responsive design': '/web-design',

    // General services
    'digital marketing': '/services',
    'marketing strategy': '/services',

    // Tools (if mentioned)
    'seo audit': '/tools/seo-audit',
    'keyword research': '/tools/keyword-research',
    'speed test': '/tools/speed-test'
  };

  let linkedContent = content;
  let linksAdded = 0;
  const maxLinks = 3;
  const linkedPhrases = new Set();

  // Find first occurrence of each keyword and add link
  for (const [keyword, url] of Object.entries(linkMap)) {
    if (linksAdded >= maxLinks) break;

    // Skip if already linked
    if (linkedPhrases.has(keyword)) continue;

    // Find first occurrence of keyword (case-insensitive, not already linked)
    const regex = new RegExp(
      `(?<!\\[)\\b(${keyword})\\b(?!\\]|\\()`,
      'i'
    );
    const match = linkedContent.match(regex);

    if (match) {
      const matchedText = match[1];
      linkedContent = linkedContent.replace(
        regex,
        `[${matchedText}](${url})`
      );
      linkedPhrases.add(keyword);
      linksAdded++;
      console.log(`   ✓ Added link: "${matchedText}" → ${url}`);
    }
  }

  console.log(`   Total internal links: ${linksAdded}`);
  return linkedContent;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateBlogPost();
}

export { generateBlogPost };
