#!/usr/bin/env node

/**
 * AI-Powered Topic Generator for Blog Queue
 * Generates 20-30 high-quality blog topics based on:
 * - Current successful topics
 * - SEO trends
 * - Sydney B2B/local business focus
 * - Content gaps
 *
 * IMPROVEMENTS:
 * - Environment validation at startup
 * - Rate limiting with automatic retry
 * - Structured logging with file output
 * - API usage and cost tracking
 * - Better error handling with classification
 * - Dry-run mode support
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { EnvValidator } from '../lib/env-validator.mjs';
import { AnthropicRateLimiter } from '../lib/rate-limiter.mjs';
import { Logger } from '../lib/logger.mjs';
import { ErrorHandler } from '../lib/error-handler.mjs';
import { UsageTracker } from '../lib/usage-tracker.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const TOPIC_QUEUE_PATH = path.join(PROJECT_ROOT, 'automation/topic-queue.json');
const BLOG_DIR = path.join(PROJECT_ROOT, 'src/content/blog');

// Load environment variables
dotenv.config({ path: path.join(PROJECT_ROOT, '.env.local') });

// Validate environment
const env = new EnvValidator({ silent: false })
  .require(
    'ANTHROPIC_API_KEY',
    'Claude API key from https://console.anthropic.com',
    (v) => v && v.startsWith('sk-ant-')
  )
  .validate();

// Initialize utilities
const logger = new Logger('topic-generator');
const errorHandler = new ErrorHandler('topic-generator');
const rateLimiter = new AnthropicRateLimiter(50, { verbose: false });
const usageTracker = new UsageTracker();

// Initialize Claude
let anthropic;
try {
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    maxRetries: 3,
  });
} catch (error) {
  logger.error('Failed to initialize Anthropic client', { error: error.message });
  process.exit(1);
}

/**
 * Analyze existing blog posts to understand patterns
 */
function analyzeExistingTopics() {
  logger.info('Analyzing existing topics and blog posts');

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

  const analysis = {
    totalTopics: allTopics.length,
    publishedCount: blogFiles.length,
    categories,
    recentTopics: allTopics.slice(-10),
  };

  logger.debug('Topic analysis complete', {
    totalTopics: analysis.totalTopics,
    publishedCount: analysis.publishedCount,
    categoryCount: Object.keys(categories).length,
  });

  return analysis;
}

/**
 * Generate new topics using Claude AI
 */
async function generateTopics(count = 25, isDryRun = false) {
  const analysis = analyzeExistingTopics();

  logger.info('Current Topic Analysis', {
    totalTopics: analysis.totalTopics,
    publishedPosts: analysis.publishedCount,
    categories: analysis.categories,
  });

  logger.info(`Generating ${count} new blog topics using Claude AI`);

  if (isDryRun) {
    logger.info('[DRY RUN] Would generate topics here');
    // Return mock topics for dry run
    return Array.from({ length: count }, (_, i) => ({
      title: `[DRY RUN] Topic ${i + 1}`,
      category: 'SEO',
      targetKeyword: 'test keyword',
      searchIntent: 'commercial',
      tags: ['test'],
      priority: 3,
    }));
  }

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
    // Use rate limiter to prevent API errors
    const response = await rateLimiter.withRetry(async () => {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        temperature: 1,
        messages: [{
          role: 'user',
          content: prompt,
        }],
      });

      // Track API usage
      await usageTracker.track('topic-generator', message.usage);

      return message;
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

    logger.success(`Generated ${topics.length} topics successfully`);

    return topics;
  } catch (error) {
    await errorHandler.handle(error, {
      operation: 'generateTopics',
      count,
    });
    throw error;
  }
}

/**
 * Add topics to queue
 */
function addTopicsToQueue(newTopics, isDryRun = false) {
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

  if (isDryRun) {
    logger.info('[DRY RUN] Would add topics to queue', {
      count: formattedTopics.length,
      firstId: formattedTopics[0]?.id,
      lastId: formattedTopics[formattedTopics.length - 1]?.id,
    });
    return formattedTopics;
  }

  // Add to queue
  queueData.queue.push(...formattedTopics);

  // Save back to file
  fs.writeFileSync(
    TOPIC_QUEUE_PATH,
    JSON.stringify(queueData, null, 2),
    'utf-8'
  );

  const pendingCount = queueData.queue.filter(t => t.status === 'pending').length;

  logger.success(`Added ${formattedTopics.length} topics to queue`, {
    added: formattedTopics.length,
    totalPending: pendingCount,
  });

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
  const startTime = Date.now();
  const args = process.argv.slice(2);
  const count = parseInt(args[0]) || 25;
  const isDryRun = args.includes('--dry-run');
  const isAuto = args.includes('--auto');

  logger.info('AI Topic Generator Starting', {
    count,
    isDryRun,
    isAuto,
  });

  try {
    // Generate topics
    const topics = await generateTopics(count, isDryRun);

    // Display summary
    displaySummary(topics);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    if (isDryRun) {
      console.log('\n⚠️  DRY RUN MODE - No topics were added to queue, no API calls made');
      logger.info('Dry run complete', { duration: `${duration}s` });
      return;
    }

    // In automated mode, auto-approve
    if (isAuto) {
      logger.info('Auto-approve mode enabled');
      const added = addTopicsToQueue(topics, isDryRun);

      // Show API usage stats
      console.log('\n💰 API Usage:');
      const stats = await usageTracker.getStats(1); // Last 1 day
      console.log(`  Total Cost: $${stats.totalCost.toFixed(4)}`);
      console.log(`  Total Tokens: ${stats.totalTokens.toLocaleString()}`);
      console.log(`  Requests: ${stats.requestCount}`);

      console.log('\n' + '═'.repeat(60));
      logger.success('Topic generation complete!', {
        generated: topics.length,
        added: added.length,
        duration: `${duration}s`,
      });
      return;
    }

    // Manual approval
    console.log('\n⚠️  Review the topics above.');
    console.log('Do you want to add these to the queue? (y/n)');

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question('', async (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        addTopicsToQueue(topics, isDryRun);

        // Show API usage stats
        console.log('\n💰 API Usage:');
        const stats = await usageTracker.getStats(1);
        console.log(`  Total Cost: $${stats.totalCost.toFixed(4)}`);
        console.log(`  Total Tokens: ${stats.totalTokens.toLocaleString()}`);
        console.log(`  Requests: ${stats.requestCount}`);

        logger.success('Topics added to queue successfully!', {
          count: topics.length,
          duration: `${duration}s`,
        });
      } else {
        logger.warn('Cancelled. Topics not added.');
      }
      readline.close();
    });

  } catch (error) {
    await errorHandler.handle(error, {
      operation: 'main',
      exitOnError: true,
    });
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(async (error) => {
    await errorHandler.handle(error, {
      operation: 'main-catch',
      exitOnError: true,
    });
  });
}

export { generateTopics, addTopicsToQueue };
