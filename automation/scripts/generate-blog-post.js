#!/usr/bin/env node

/**
 * Simple Blog Post Generator
 * Generates a blog post from the topic queue using Claude AI
 */

import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getUniqueImage, formatImageForFrontmatter } from './unsplash-fetcher.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Load environment variables
dotenv.config({ path: path.join(projectRoot, '.env.local') });

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY
});

const TOPIC_QUEUE_PATH = path.join(projectRoot, 'automation/topic-queue.json');
const BLOG_DIR = path.join(projectRoot, 'src/content/blog');

/**
 * Assign author based on category
 */
function assignAuthor(category) {
  const authors = {
    'SEO': 'Abhishek Maharjan',
    'Google Ads': 'Aayush Shrestha',
    'Web Design': 'Finjo Sherpa',
    'Digital Marketing': 'Abhilekh Maharjan',
    'Content Marketing': 'Abhishek Maharjan',
    'Marketing Strategy': 'Avi'
  };

  return authors[category] || 'TPP Team';
}

/**
 * Get next topic from queue
 */
async function getNextTopic(topicId = null) {
  const queueData = JSON.parse(await fs.readFile(TOPIC_QUEUE_PATH, 'utf-8'));

  let topic;
  if (topicId) {
    topic = queueData.queue.find(t => t.id === parseInt(topicId) && t.status === 'pending');
  } else {
    // Get highest priority pending topic
    const pending = queueData.queue.filter(t => t.status === 'pending');
    pending.sort((a, b) => a.priority - b.priority || a.id - b.id);
    topic = pending[0];
  }

  if (!topic) {
    throw new Error(topicId ? `Topic ID ${topicId} not found or not pending` : 'No pending topics in queue');
  }

  return { topic, queueData };
}

/**
 * Mark topic as completed
 */
async function markTopicCompleted(topicId) {
  const queueData = JSON.parse(await fs.readFile(TOPIC_QUEUE_PATH, 'utf-8'));
  const topic = queueData.queue.find(t => t.id === topicId);

  if (topic) {
    topic.status = 'completed';
    topic.publishedDate = new Date().toISOString().split('T')[0];
    await fs.writeFile(TOPIC_QUEUE_PATH, JSON.stringify(queueData, null, 2));
  }
}

/**
 * Generate blog post using Claude
 */
async function generateBlogContent(topic) {
  console.log('🤖 Generating blog post with Claude AI...\n');

  const prompt = `You are an expert SEO content writer for The Profit Platform, a Sydney-based digital marketing agency.

Write a comprehensive, SEO-optimized blog post with the following specifications:

**Topic**: ${topic.title}
**Category**: ${topic.category}
**Target Keyword**: ${topic.targetKeyword}
**Search Intent**: ${topic.searchIntent}
**Tags**: ${topic.tags.join(', ')}

**SEO Requirements** (CRITICAL):
1. **Meta Description**: Write a 140-160 character meta description. DO NOT use markdown formatting (**, *, etc.) in the meta description.
2. **Keyword Density**: Target keyword should appear 0.5-1.0% of content (15-30 times for 3,000 words). Use naturally in:
   - First paragraph (2-3 times)
   - H2/H3 headings (5-8 times)
   - Throughout body naturally
   - Conclusion (2-3 times)
3. **LSI Keywords**: Include semantic variations (e.g., "local search optimization", "Google Maps SEO" for local SEO topics)
4. **FAQ Section**: Include an "FAQ" or "Frequently Asked Questions" section with 6-8 Q&A pairs using H3 headings

**Content Requirements**:
1. **Length**: 2,500-3,500 words (comprehensive and in-depth)
2. **Tone**: Professional but conversational, helpful, authoritative
3. **Location**: Sydney-specific examples, suburbs, landmarks, and context throughout
4. **Target Audience**: Sydney small business owners (10-50 employees), tech-savvy
5. **Structure**:
   - Clear H2 sections (10-15 major sections)
   - H3 subsections within each H2
   - Short paragraphs (3-4 sentences max)
   - Bullet points and numbered lists for scannability
6. **Value**:
   - Actionable advice with step-by-step instructions
   - Real Sydney examples (suburbs, businesses, scenarios)
   - Practical tips that can be implemented immediately
   - Data and statistics where relevant
7. **Conclusion**: Strong conclusion with summary and clear next steps

**Important Format Rules**:
- Write in markdown format
- Use ## for H2 headings, ### for H3 headings
- Include bullet points and numbered lists where appropriate
- DO NOT include title in body (will be added from frontmatter)
- DO NOT include author or date (handled separately)
- Focus on quality, depth, and natural language
- Avoid keyword stuffing - prioritize readability

**Post-processing will add**:
- Internal links to related TPP content
- External links to authority sources
- 3 strategic CTAs
- Image placeholders
- Table of Contents

Generate the complete blog post now:`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    temperature: 0.9,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  return response.content[0].text;
}

/**
 * Create blog post file
 */
async function saveBlogPost(topic, content) {
  const date = new Date().toISOString().split('T')[0];
  const slug = topic.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const filename = `${date}-${slug}.md`;
  const filepath = path.join(BLOG_DIR, filename);

  // Extract meta description from content if present
  let metaDescription = '';
  const descMatch = content.match(/meta description[:\s]+(.+)/i);
  if (descMatch) {
    metaDescription = descMatch[1].trim().replace(/[\"\']/g, '');
    // Remove "Meta Description:" prefix if present
    metaDescription = metaDescription.replace(/^meta description:?\s*/i, '');
    content = content.replace(/meta description[:\s]+.+/i, '').trim();
  }

  // Generate meta description if not found
  if (!metaDescription) {
    // Take first paragraph as description
    const firstPara = content.split('\n\n')[0].replace(/[#*]/g, '').trim();
    metaDescription = firstPara.substring(0, 157) + '...';
  }

  // Ensure no markdown formatting in meta description
  metaDescription = metaDescription.replace(/\*\*|\*|__|_/g, '');

  // Trim to max 160 chars
  if (metaDescription.length > 160) {
    metaDescription = metaDescription.substring(0, 157) + '...';
  }

  const author = assignAuthor(topic.category);

  // Fetch unique hero image from Unsplash
  console.log('🖼️  Fetching unique hero image...');
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
  const imageData = await getUniqueImage(topic.category, topic.title, unsplashKey);
  const imageFields = formatImageForFrontmatter(imageData);

  // Build frontmatter with conditional image fields
  let frontmatter = `---
title: "${topic.title}"
description: "${metaDescription}"
pubDate: ${date}
author: "${author}"
category: "${topic.category}"
tags: ${JSON.stringify(topic.tags)}`;

  // Add image fields if available
  if (imageFields) {
    frontmatter += `
coverImage: "${imageFields.coverImage}"
coverImageAlt: "${imageFields.coverImageAlt}"
coverImageCredit:
  name: "${imageFields.coverImageCredit.name}"
  link: "${imageFields.coverImageCredit.link}"`;
  }

  frontmatter += `
featured: false
draft: false
---

`;

  const fullContent = frontmatter + content;

  await fs.writeFile(filepath, fullContent, 'utf-8');

  return {
    filename,
    filepath,
    slug,
    wordCount: content.split(/\s+/).length,
    hasImage: !!imageFields
  };
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🚀 Blog Post Generator Starting...\n');

    // Check API key
    if (!process.env.CLAUDE_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      throw new Error('CLAUDE_API_KEY or ANTHROPIC_API_KEY not found in environment');
    }

    // Get topic ID from environment or CLI
    const topicId = process.env.TOPIC_ID || process.argv[2];

    // Get next topic
    const { topic } = await getNextTopic(topicId);
    console.log('📝 Selected Topic:');
    console.log(`   ID: ${topic.id}`);
    console.log(`   Title: ${topic.title}`);
    console.log(`   Category: ${topic.category}`);
    console.log(`   Keyword: ${topic.targetKeyword}\n`);

    // Generate content
    const content = await generateBlogContent(topic);

    // Save blog post
    const result = await saveBlogPost(topic, content);
    console.log('✅ Blog post generated successfully!');
    console.log(`   File: ${result.filename}`);
    console.log(`   Words: ${result.wordCount}`);
    console.log(`   Slug: ${result.slug}`);
    console.log(`   Hero Image: ${result.hasImage ? '✅ Unique Unsplash image' : '⚠️  Using default SVG'}\n`);

    // Mark topic as completed
    await markTopicCompleted(topic.id);
    console.log('✅ Topic marked as completed in queue\n');

    // Output for GitHub Actions
    if (process.env.GITHUB_OUTPUT) {
      const output = `title=${topic.title}
slug=${result.slug}
url=https://theprofitplatform.com.au/blog/${result.slug}/
wordcount=${result.wordCount}`;
      await fs.appendFile(process.env.GITHUB_OUTPUT, output + '\n');
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
