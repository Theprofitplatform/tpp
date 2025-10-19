#!/usr/bin/env node

/**
 * AI-Powered Topic Generator for Blog Queue
 * Generates 20-30 high-quality blog topics based on:
 * - Current successful topics
 * - SEO trends
 * - Sydney B2B/local business focus
 * - Content gaps
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const TOPIC_QUEUE_PATH = path.join(PROJECT_ROOT, 'automation/topic-queue.json');
const BLOG_DIR = path.join(PROJECT_ROOT, 'src/content/blog');

// Load environment variables
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local') });

// Initialize Claude
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
});

/**
 * Analyze existing blog posts to understand patterns
 */
function analyzeExistingTopics() {
  const queueData = JSON.parse(fs.readFileSync(TOPIC_QUEUE_PATH, 'utf-8'));

  // Get all existing topics
  const allTopics = queueData.queue.map(t => ({
    title: t.title,
    category: t.category,
    keyword: t.targetKeyword,
  }));

  // Get blog file names to see what's been published
  const blogFiles = fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace('.md', ''));

  // Count categories
  const categories = {};
  queueData.queue.forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + 1;
  });

  return {
    totalTopics: allTopics.length,
    publishedCount: blogFiles.length,
    categories,
    recentTopics: allTopics.slice(-10),
  };
}

/**
 * Generate new topics using Claude AI
 */
async function generateTopics(count = 25) {
  const analysis = analyzeExistingTopics();

  console.log('📊 Current Topic Analysis:');
  console.log(`   Total topics: ${analysis.totalTopics}`);
  console.log(`   Published posts: ${analysis.publishedCount}`);
  console.log(`   Categories:`, analysis.categories);
  console.log('');
  console.log(`🤖 Generating ${count} new blog topics using Claude AI...\n`);

  const prompt = `You are an expert SEO content strategist for a Sydney-based digital marketing agency called "The Profit Platform" (TPP).

CONTEXT:
- Target audience: Sydney small business owners (10-50 employees)
- Focus areas: Google Ads, SEO, web design, local marketing
- Content style: Practical, actionable, Sydney-specific
- Average post: 2,500+ words with real examples

CURRENT TOPIC CATEGORIES:
${Object.entries(analysis.categories).map(([cat, count]) => `- ${cat}: ${count} topics`).join('\n')}

RECENT TOPICS (to avoid duplication):
${analysis.recentTopics.map(t => `- ${t.title}`).join('\n')}

TASK:
Generate ${count} new blog topic ideas that:
1. Are highly relevant to Sydney small businesses
2. Target commercial or transactional search intent
3. Include specific, searchable keywords
4. Cover a balanced mix of categories (Google Ads, SEO, Web Design, Content Marketing, Digital Marketing)
5. Are different from existing topics
6. Include Sydney-specific angles where possible

OUTPUT FORMAT (JSON array):
[
  {
    "title": "Exact blog post title with location (Sydney) if relevant",
    "category": "One of: Google Ads, SEO, Web Design, Content Marketing, Digital Marketing",
    "targetKeyword": "primary SEO keyword (2-4 words)",
    "searchIntent": "informational, commercial, or transactional",
    "tags": ["tag1", "tag2", "tag3", "tag4"],
    "priority": 3
  }
]

RULES:
- Every title must be unique and specific
- Keywords must be realistic search terms (not too generic)
- Balance categories (aim for ~5 topics per category)
- Include mix of broad topics and niche topics
- Sydney location should appear in 60% of titles
- Priority is always 3 (normal)

Generate ${count} topics now:`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 1,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const content = response.content[0].text;

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = content;
    if (content.includes('```json')) {
      jsonText = content.split('```json')[1].split('```')[0].trim();
    } else if (content.includes('```')) {
      jsonText = content.split('```')[1].split('```')[0].trim();
    }

    const topics = JSON.parse(jsonText);

    console.log(`✅ Generated ${topics.length} topics successfully!\n`);

    return topics;
  } catch (error) {
    console.error('❌ Error generating topics:', error.message);
    throw error;
  }
}

/**
 * Add topics to queue
 */
function addTopicsToQueue(newTopics) {
  const queueData = JSON.parse(fs.readFileSync(TOPIC_QUEUE_PATH, 'utf-8'));

  // Get next ID
  const maxId = Math.max(...queueData.queue.map(t => t.id), 0);
  let nextId = maxId + 1;

  // Add new topics with proper structure
  const formattedTopics = newTopics.map(topic => ({
    id: nextId++,
    title: topic.title,
    category: topic.category,
    tags: topic.tags || [],
    targetKeyword: topic.targetKeyword,
    searchIntent: topic.searchIntent || 'commercial',
    priority: topic.priority || 3,
    status: 'pending',
  }));

  // Add to queue
  queueData.queue.push(...formattedTopics);

  // Save back to file
  fs.writeFileSync(
    TOPIC_QUEUE_PATH,
    JSON.stringify(queueData, null, 2),
    'utf-8'
  );

  console.log(`📝 Added ${formattedTopics.length} topics to queue`);
  console.log(`📊 Total pending topics: ${queueData.queue.filter(t => t.status === 'pending').length}`);

  return formattedTopics;
}

/**
 * Display summary of generated topics
 */
function displaySummary(topics) {
  console.log('\n' + '='.repeat(60));
  console.log('📋 GENERATED TOPICS SUMMARY');
  console.log('='.repeat(60));

  // Group by category
  const byCategory = {};
  topics.forEach(topic => {
    if (!byCategory[topic.category]) {
      byCategory[topic.category] = [];
    }
    byCategory[topic.category].push(topic);
  });

  // Display by category
  Object.entries(byCategory).forEach(([category, categoryTopics]) => {
    console.log(`\n📁 ${category} (${categoryTopics.length} topics):`);
    categoryTopics.forEach((topic, i) => {
      console.log(`   ${i + 1}. ${topic.title}`);
      console.log(`      🎯 Keyword: "${topic.targetKeyword}"`);
    });
  });

  console.log('\n' + '='.repeat(60));
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const count = parseInt(args[0]) || 25;

  console.log('🚀 AI Topic Generator Starting...\n');

  try {
    // Check API key
    if (!process.env.ANTHROPIC_API_KEY && !process.env.CLAUDE_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY or CLAUDE_API_KEY not found in environment');
    }

    // Generate topics
    const topics = await generateTopics(count);

    // Display summary
    displaySummary(topics);

    // Ask for confirmation
    console.log('\n⚠️  Review the topics above.');
    console.log('Do you want to add these to the queue? (y/n)');

    // In automated mode, auto-approve
    if (args.includes('--auto')) {
      console.log('🤖 Auto-approve mode enabled');
      const added = addTopicsToQueue(topics);
      console.log('\n✅ Topic generation complete!');
      return;
    }

    // Manual approval
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question('', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        addTopicsToQueue(topics);
        console.log('\n✅ Topics added to queue successfully!');
      } else {
        console.log('\n❌ Cancelled. Topics not added.');
      }
      readline.close();
    });

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateTopics, addTopicsToQueue };
