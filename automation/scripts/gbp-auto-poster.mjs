#!/usr/bin/env node

/**
 * Automated Google Business Profile Post Generator
 * Generates and schedules GBP posts using Claude AI
 * Can integrate with GBP API or output for manual posting
 *
 * IMPROVEMENTS:
 * - Environment validation at startup
 * - Rate limiting with automatic retry
 * - Structured logging with file output
 * - API usage and cost tracking
 * - Better error handling with classification
 * - Dry-run mode support
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { EnvValidator } from '../lib/env-validator.mjs';
import { AnthropicRateLimiter } from '../lib/rate-limiter.mjs';
import { Logger } from '../lib/logger.mjs';
import { ErrorHandler } from '../lib/error-handler.mjs';
import { UsageTracker } from '../lib/usage-tracker.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validate environment
const env = new EnvValidator({ silent: false })
  .require(
    'ANTHROPIC_API_KEY',
    'Claude API key from https://console.anthropic.com',
    (v) => v && v.startsWith('sk-ant-')
  )
  .optional('OUTPUT_DIR', 'Output directory for GBP posts', './automation/generated/gbp-posts')
  .optional('POSTS_PER_WEEK', 'Number of posts per week', '3')
  .optional('WEEKS_TO_GENERATE', 'Weeks to generate posts for', '4')
  .validate();

const CONFIG = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  outputDir: process.env.OUTPUT_DIR || './automation/generated/gbp-posts',
  postsPerWeek: parseInt(process.env.POSTS_PER_WEEK || '3'),
  weeksToGenerate: parseInt(process.env.WEEKS_TO_GENERATE || '4'),
  isDryRun: process.argv.includes('--dry-run'),

  // Post types rotation
  postTypes: [
    { type: 'tip', topic: 'Local SEO tips for Sydney businesses', cta: 'Learn more' },
    { type: 'case-study', topic: 'Client success story (Sydney-based)', cta: 'Get similar results' },
    { type: 'offer', topic: 'Limited-time promotion or free audit', cta: 'Claim offer' },
    { type: 'update', topic: 'Company news or industry update', cta: 'Read more' },
    { type: 'question', topic: 'Engage with question about their business', cta: 'Tell us' },
  ],

  // Your business info
  businessInfo: {
    name: 'The Profit Platform',
    services: ['SEO', 'Google Ads', 'Web Design', 'Digital Marketing'],
    location: 'Sydney, NSW',
    phone: '0487 286 451',
    url: 'https://theprofitplatform.com.au',
    focusAreas: ['Bondi', 'Parramatta', 'North Shore', 'Inner West', 'Western Sydney'],
  }
};

// Initialize utilities
const logger = new Logger('gbp-poster');
const errorHandler = new ErrorHandler('gbp-poster');
const rateLimiter = new AnthropicRateLimiter(50, { verbose: false });
const usageTracker = new UsageTracker();

// Initialize Anthropic client
let anthropic;
try {
  anthropic = new Anthropic({
    apiKey: CONFIG.anthropicApiKey,
    maxRetries: 3,
  });
} catch (error) {
  logger.error('Failed to initialize Anthropic client', { error: error.message });
  process.exit(1);
}

/**
 * Generate a single GBP post using Claude
 */
async function generatePost(postConfig, weekNumber, postNumber) {
  const { type, topic, cta } = postConfig;

  logger.debug(`Generating ${type} post for week ${weekNumber}`);

  const prompt = `Create a Google Business Profile post for a digital marketing agency in Sydney.

POST TYPE: ${type}
TOPIC: ${topic}
BUSINESS: The Profit Platform (SEO, Google Ads, Web Design for Sydney small businesses)
WEEK: ${weekNumber}, Post #${postNumber}

REQUIREMENTS:
- 150-300 characters (GBP limit is ~1,500 but shorter performs better)
- Engaging, conversational tone
- Include specific Sydney suburb/area if relevant
- Add 1-2 relevant emojis (not excessive)
- Include a clear call-to-action
- For case studies: Use realistic but impressive metrics (e.g., "142% increase in calls")
- For tips: Make it actionable and specific
- For offers: Create urgency but don't sound scammy
- End with relevant hashtag (1-2 max)

CTA OPTIONS: "${cta}", "Call 0487 286 451", "Visit [URL]", "Book consultation"

AVOID:
- Generic corporate speak
- Keyword stuffing
- Too many hashtags
- Excessive emojis
- Unrealistic claims

Return ONLY the post text, no quotes, no explanation.`;

  // Use rate limiter to prevent API errors
  const result = await rateLimiter.withRetry(async () => {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Track API usage
    await usageTracker.track('gbp-poster', message.usage);

    return message;
  });

  return result.content[0].text.trim();
}

/**
 * Generate image suggestion for post
 */
function suggestImage(postType) {
  const suggestions = {
    'tip': 'Screenshot of tip as infographic, or laptop with analytics',
    'case-study': 'Graph showing results, or dashboard screenshot',
    'offer': 'Eye-catching graphic with offer details',
    'update': 'Team photo or relevant stock image',
    'question': 'Question mark graphic or engaged business owner',
  };

  return suggestions[postType] || 'Relevant branded image';
}

/**
 * Generate posting schedule
 */
function generateSchedule(totalPosts) {
  const schedule = [];
  const startDate = new Date();
  const daysOfWeek = [1, 3, 5]; // Monday, Wednesday, Friday

  let postIndex = 0;
  let weekOffset = 0;

  while (postIndex < totalPosts) {
    const dayOffset = daysOfWeek[postIndex % daysOfWeek.length];
    const postDate = new Date(startDate);
    postDate.setDate(startDate.getDate() + (weekOffset * 7) + dayOffset);

    schedule.push({
      date: postDate.toISOString().split('T')[0],
      dayName: postDate.toLocaleDateString('en-US', { weekday: 'long' }),
      time: '09:00 AM' // Optimal posting time
    });

    postIndex++;
    if (postIndex % daysOfWeek.length === 0) {
      weekOffset++;
    }
  }

  return schedule;
}

/**
 * Generate all posts
 */
async function generateAllPosts() {
  logger.info('Starting GBP Post Generation', {
    isDryRun: CONFIG.isDryRun,
    postsPerWeek: CONFIG.postsPerWeek,
    weeksToGenerate: CONFIG.weeksToGenerate,
  });

  await fs.mkdir(CONFIG.outputDir, { recursive: true });

  const totalPosts = CONFIG.postsPerWeek * CONFIG.weeksToGenerate;
  const schedule = generateSchedule(totalPosts);
  const posts = [];

  logger.info(`Generating ${totalPosts} posts for ${CONFIG.weeksToGenerate} weeks`);

  for (let i = 0; i < totalPosts; i++) {
    const weekNumber = Math.floor(i / CONFIG.postsPerWeek) + 1;
    const postNumber = (i % CONFIG.postsPerWeek) + 1;
    const postType = CONFIG.postTypes[i % CONFIG.postTypes.length];

    logger.info(`Generating Post ${i + 1}/${totalPosts} (Week ${weekNumber}, ${postType.type})`);

    try {
      const content = CONFIG.isDryRun
        ? `[DRY RUN] ${postType.type} post content would be generated here`
        : await generatePost(postType, weekNumber, postNumber);

      const imageSuggestion = suggestImage(postType.type);

      posts.push({
        postNumber: i + 1,
        week: weekNumber,
        type: postType.type,
        scheduledDate: schedule[i].date,
        scheduledDay: schedule[i].dayName,
        scheduledTime: schedule[i].time,
        content: content,
        imageSuggestion: imageSuggestion,
        actionButton: postType.cta,
        actionUrl: CONFIG.businessInfo.url + '/contact',
        status: 'draft'
      });

      logger.success(`Post ${i + 1} generated successfully`, {
        type: postType.type,
        length: content.length,
      });

    } catch (error) {
      const errorInfo = await errorHandler.handle(error, {
        postNumber: i + 1,
        postType: postType.type,
      });

      logger.error(`Failed to generate post ${i + 1}`, errorInfo);
    }
  }

  return posts;
}

/**
 * Save posts in multiple formats
 */
async function savePosts(posts) {
  const dateStr = new Date().toISOString().split('T')[0];

  // Save as JSON
  const jsonPath = path.join(CONFIG.outputDir, `gbp-posts-${dateStr}.json`);
  const csvPath = path.join(CONFIG.outputDir, `gbp-posts-${dateStr}.csv`);
  const mdPath = path.join(CONFIG.outputDir, `gbp-posts-${dateStr}.md`);

  if (CONFIG.isDryRun) {
    logger.info('[DRY RUN] Would save files:', { jsonPath, csvPath, mdPath });
    return { jsonPath, csvPath, mdPath };
  }

  // Save as JSON
  await fs.writeFile(jsonPath, JSON.stringify(posts, null, 2));
  logger.success(`Saved JSON: ${jsonPath}`, { posts: posts.length });

  // Save as CSV for easy import
  const csvHeaders = 'Post #,Week,Type,Date,Day,Time,Content,Image Suggestion,CTA,URL,Status\n';
  const csvRows = posts.map(p =>
    `${p.postNumber},${p.week},"${p.type}","${p.scheduledDate}","${p.scheduledDay}","${p.scheduledTime}","${p.content.replace(/"/g, '""')}","${p.imageSuggestion}","${p.actionButton}","${p.actionUrl}","${p.status}"`
  ).join('\n');

  await fs.writeFile(csvPath, csvHeaders + csvRows);
  logger.success(`Saved CSV: ${csvPath}`);

  // Save as readable Markdown checklist
  let markdown = `# Google Business Profile Posts - ${new Date().toLocaleDateString()}\n\n`;
  markdown += `**Total Posts:** ${posts.length}\n`;
  markdown += `**Duration:** ${CONFIG.weeksToGenerate} weeks\n\n`;
  markdown += `---\n\n`;

  posts.forEach((post, idx) => {
    markdown += `## Post ${post.postNumber} - ${post.scheduledDay}, ${post.scheduledDate}\n\n`;
    markdown += `**Type:** ${post.type}\n`;
    markdown += `**Time:** ${post.scheduledTime}\n\n`;
    markdown += `**Content:**\n`;
    markdown += `\`\`\`\n${post.content}\n\`\`\`\n\n`;
    markdown += `**Image:** ${post.imageSuggestion}\n\n`;
    markdown += `**Action Button:** "${post.actionButton}" → ${post.actionUrl}\n\n`;
    markdown += `**Status:** [ ] Posted\n\n`;
    markdown += `---\n\n`;
  });

  await fs.writeFile(mdPath, markdown);
  logger.success(`Saved Markdown: ${mdPath}`);

  return { jsonPath, csvPath, mdPath };
}

/**
 * Print posting instructions
 */
function printInstructions(files) {
  console.log('\n📋 POSTING INSTRUCTIONS:\n');
  console.log('OPTION 1: Manual Posting');
  console.log('1. Open the generated Markdown file for easy reading');
  console.log('2. Log into your Google Business Profile');
  console.log('3. Copy each post on its scheduled date');
  console.log('4. Add suggested image (create in Canva if needed)');
  console.log('5. Add action button with URL');
  console.log('6. Check off in the markdown file when posted\n');

  console.log('OPTION 2: Automated with Zapier/Make.com');
  console.log('1. Upload the CSV to Google Sheets');
  console.log('2. Connect Google Sheets → GBP via Zapier');
  console.log('3. Set up automation to post based on date/time');
  console.log('4. Monitor and adjust as needed\n');

  console.log('OPTION 3: Use GBP Scheduling (if available)');
  console.log('1. GBP interface may allow scheduling');
  console.log('2. Bulk upload posts with dates');
  console.log('3. Let them post automatically\n');

  console.log('📂 Your files:');
  console.log(`   JSON: ${files.jsonPath}`);
  console.log(`   CSV: ${files.csvPath}`);
  console.log(`   Markdown: ${files.mdPath}`);
}

/**
 * Main execution
 */
async function main() {
  const startTime = Date.now();

  try {
    const posts = await generateAllPosts();
    const files = await savePosts(posts);

    if (!CONFIG.isDryRun) {
      printInstructions(files);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('\n' + '═'.repeat(60));
    console.log('📊 GENERATION SUMMARY');
    console.log('═'.repeat(60));
    console.log(`Duration: ${duration}s`);
    console.log(`✅ Generated: ${posts.length} posts`);
    console.log(`📅 Covering: ${CONFIG.weeksToGenerate} weeks`);
    console.log(`📝 Frequency: ${CONFIG.postsPerWeek}x per week`);

    if (CONFIG.isDryRun) {
      console.log('\n⚠️  DRY RUN MODE - No files were written, no API calls made');
    }

    const typeBreakdown = posts.reduce((acc, p) => {
      acc[p.type] = (acc[p.type] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Post Types:');
    Object.entries(typeBreakdown).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} posts`);
    });

    // Show API usage stats
    if (!CONFIG.isDryRun) {
      console.log('\n💰 API Usage:');
      const stats = await usageTracker.getStats(1); // Last 1 day
      console.log(`  Total Cost: $${stats.totalCost.toFixed(4)}`);
      console.log(`  Total Tokens: ${stats.totalTokens.toLocaleString()}`);
      console.log(`  Requests: ${stats.requestCount}`);
    }

    console.log('\n' + '═'.repeat(60));
    logger.success('Automation complete!', {
      posts: posts.length,
      duration: `${duration}s`,
    });

  } catch (error) {
    await errorHandler.handle(error, {
      operation: 'main',
      exitOnError: true,
    });
  }
}

main().catch(async (error) => {
  await errorHandler.handle(error, {
    operation: 'main-catch',
    exitOnError: true,
  });
});
