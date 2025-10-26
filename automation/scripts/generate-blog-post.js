#!/usr/bin/env node

/**
 * Hybrid Blog Post Generator
 * Primary: Perplexity (research) + Gemini (generation)
 * Fallback: Gemini only
 */

import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Perplexity from '@perplexity-ai/perplexity_ai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { getUniqueImage, formatImageForFrontmatter } from './unsplash-fetcher.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Load environment variables
dotenv.config({ path: path.join(projectRoot, '.env.local') });

// Initialize APIs
const geminiApiKey = process.env.GEMINI_API_KEY;
const perplexityApiKey = process.env.PERPLEXITY_API_KEY;

const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;
const perplexity = perplexityApiKey ? new Perplexity({ apiKey: perplexityApiKey }) : null;

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
 * Research topic using Perplexity
 */
async function researchWithPerplexity(topic) {
  if (!perplexity) {
    console.log('⚠️  Perplexity API key not found, skipping research phase\n');
    return null;
  }

  try {
    console.log('🔍 Researching with Perplexity AI...\n');

    const researchQuery = `Research comprehensive information about "${topic.targetKeyword}" for Sydney businesses. Include:
- Latest trends and statistics for 2025
- Common challenges Sydney businesses face
- Best practices and actionable strategies
- Local Sydney examples and case studies
- Industry data and expert insights

Focus on practical, actionable information for small business owners in Sydney.`;

    const response = await perplexity.chat.completions.create({
      model: 'sonar',
      messages: [{
        role: 'user',
        content: researchQuery
      }],
      max_tokens: 2000,
      temperature: 0.7,
      return_related_questions: true
    });

    const research = response.choices[0].message.content;
    const relatedQuestions = response.related_questions || [];

    console.log('✅ Research completed successfully');
    console.log(`   Gathered ${research.length} characters of research`);
    console.log(`   Related questions: ${relatedQuestions.length}\n`);

    return {
      research,
      relatedQuestions,
      citations: response.citations || []
    };

  } catch (error) {
    console.log(`⚠️  Perplexity research failed: ${error.message}`);
    console.log('   Falling back to Gemini-only mode\n');
    return null;
  }
}

/**
 * Generate blog post using Gemini
 */
async function generateWithGemini(topic, researchData = null) {
  if (!genAI) {
    throw new Error('GEMINI_API_KEY not found in environment');
  }

  console.log('🤖 Generating blog post with Google Gemini...\n');

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  // Build prompt with or without research
  let prompt = `You are an expert SEO content writer for The Profit Platform, a Sydney-based digital marketing agency.

Write a comprehensive, SEO-optimized blog post with the following specifications:

**Topic**: ${topic.title}
**Category**: ${topic.category}
**Target Keyword**: ${topic.targetKeyword}
**Search Intent**: ${topic.searchIntent}
**Tags**: ${topic.tags.join(', ')}`;

  // Add research insights if available
  if (researchData) {
    prompt += `

**RESEARCH INSIGHTS** (use this to make the content more accurate and up-to-date):
${researchData.research}

**Related Questions** (consider incorporating these):
${researchData.relatedQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
`;
  }

  prompt += `

**SEO Requirements** (CRITICAL):
1. **Meta Description**: Write a 140-160 character meta description. DO NOT use markdown formatting (**, *, etc.) in the meta description.
2. **Keyword Density**: Target keyword should appear 0.5-1.0% of content (15-30 times for 3,000 words). Use naturally in:
   - First paragraph (2-3 times)
   - H2/H3 headings (5-8 times)
   - Throughout body naturally
   - Conclusion (2-3 times)
3. **LSI Keywords**: Include semantic variations naturally
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
   - Data and statistics where relevant (especially from research insights if provided)
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

  const result = await model.generateContent(prompt);
  const response = await result.response;
  let content = response.text();

  // Clean up any markdown code fences that Gemini might add
  content = content.replace(/^```markdown\s*/gm, '');
  content = content.replace(/^```\s*$/gm, '');
  content = content.trim();

  return content;
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

  // Fetch unique hero image (tries Unsplash first, then Pexels)
  console.log('🖼️  Fetching unique hero image...');
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
  const pexelsKey = process.env.PEXELS_API_KEY;
  const imageData = await getUniqueImage(topic.category, topic.title, unsplashKey, pexelsKey);
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
    console.log('🚀 Hybrid Blog Post Generator Starting...\n');
    console.log('   Mode: Perplexity Research → Gemini Generation');
    console.log('   Fallback: Gemini Only\n');

    // Check API keys
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not found in environment (required)');
    }

    if (!perplexityApiKey) {
      console.log('⚠️  PERPLEXITY_API_KEY not found (optional, will use Gemini-only mode)\n');
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

    // Research phase (with Perplexity if available)
    const researchData = await researchWithPerplexity(topic);

    // Generation phase (with Gemini)
    const content = await generateWithGemini(topic, researchData);

    // Save blog post
    const result = await saveBlogPost(topic, content);

    console.log('\n✅ Blog post generated successfully!');
    console.log(`   File: ${result.filename}`);
    console.log(`   Words: ${result.wordCount}`);
    console.log(`   Slug: ${result.slug}`);
    console.log(`   Hero Image: ${result.hasImage ? '✅ Unique Unsplash image' : '⚠️  Using default SVG'}`);
    console.log(`   Research: ${researchData ? '✅ Enhanced with Perplexity insights' : '⚠️  Gemini-only mode'}\n`);

    // Mark topic as completed
    await markTopicCompleted(topic.id);
    console.log('✅ Topic marked as completed in queue\n');

    // Output for GitHub Actions
    if (process.env.GITHUB_OUTPUT) {
      const output = `title=${topic.title}
slug=${result.slug}
url=https://theprofitplatform.com.au/blog/${result.slug}/
wordcount=${result.wordCount}
mode=${researchData ? 'perplexity+gemini' : 'gemini-only'}`;
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
