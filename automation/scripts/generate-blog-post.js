import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchAndSaveFeaturedImage } from './unsplash-fetcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Load .env.local for local development
dotenv.config({ path: path.join(projectRoot, '.env.local') });

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY
});

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

    // 5. Build prompt with caching
    const systemPrompt = `You are an expert digital marketing content writer for The Profit Platform, a Sydney-based agency.

BRAND GUIDELINES:
${brandGuidelines}

Follow these guidelines strictly to maintain brand voice and quality standards.`;

    const userPrompt = template
      .replace('{brand_guidelines}', '(see system context)')
      .replace('{title}', topic.title)
      .replace('{target_keyword}', topic.targetKeyword)
      .replace('{category}', topic.category)
      .replace('{tags}', topic.tags.join(', '))
      .replace('{search_intent}', topic.searchIntent);

    // 6. Generate content with Claude
    console.log('🧠 Generating content with Claude API...');

    const message = await anthropic.messages.create({
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

    const content = message.content[0].text;
    console.log(`✅ Content generated (${content.split(/\s+/).length} words)\n`);

    // 7. Generate SEO meta description
    console.log('🔍 Generating SEO meta description...');

    const metaMessage = await anthropic.messages.create({
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

    // 11. Determine author
    const author = Math.random() > 0.5 ? 'Avi' : 'TPP Team';

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
