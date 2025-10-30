#!/usr/bin/env node

/**
 * Automated Link Building Outreach
 * Finds link opportunities and generates personalized outreach emails
 *
 * IMPROVEMENTS:
 * - Environment validation at startup
 * - Rate limiting with automatic retry
 * - Structured logging with file output
 * - API usage and cost tracking
 * - Better error handling with classification
 * - Dry-run mode support
 * - External target configuration file
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
  .optional('OUTPUT_DIR', 'Output directory for outreach emails', './automation/generated/link-outreach')
  .validate();

// Initialize utilities
const logger = new Logger('link-outreach');
const errorHandler = new ErrorHandler('link-outreach');
const rateLimiter = new AnthropicRateLimiter(50, { verbose: false });
const usageTracker = new UsageTracker();

const CONFIG = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  outputDir: process.env.OUTPUT_DIR || './automation/generated/link-outreach',
  isDryRun: process.argv.includes('--dry-run'),

  // Target websites (you'll populate this)
  targetWebsites: [
    {
      url: 'https://dynamicbusiness.com',
      name: 'Dynamic Business',
      type: 'publication',
      contact: 'editor@dynamicbusiness.com',
      acceptsGuestPosts: true,
      topics: ['small business', 'marketing', 'entrepreneurship'],
    },
    {
      url: 'https://smartcompany.com.au',
      name: 'SmartCompany',
      type: 'publication',
      contact: 'contribute@smartcompany.com.au',
      acceptsGuestPosts: true,
      topics: ['business', 'marketing', 'technology'],
    },
    {
      url: 'https://flyingsolo.com.au',
      name: 'Flying Solo',
      type: 'community',
      contact: 'via contact form',
      acceptsGuestPosts: true,
      topics: ['solopreneurs', 'freelance', 'small business'],
    },
    // Add more targets here
  ],

  // Your content assets (for outreach)
  contentAssets: [
    {
      title: 'Ultimate Guide to Sydney Local SEO in 2025',
      url: 'https://theprofitplatform.com.au/blog/local-seo-checklist',
      type: 'guide',
      value: 'Comprehensive 47-step checklist',
    },
    {
      title: '2025 Sydney Digital Marketing Benchmarks Report',
      url: 'https://theprofitplatform.com.au/blog/benchmarks',
      type: 'data/research',
      value: 'Original industry data',
    },
  ],

  yourInfo: {
    name: 'Avi',
    company: 'The Profit Platform',
    title: 'Founder',
    website: 'https://theprofitplatform.com.au',
    expertise: 'Local SEO and digital marketing for Sydney small businesses',
  },
};

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
 * Generate personalized outreach email
 */
async function generateOutreachEmail(target, strategy) {
  logger.debug(`Generating outreach email for ${target.name}`);

  if (CONFIG.isDryRun) {
    return {
      subject: `[DRY RUN] Outreach subject for ${target.name}`,
      body: '[DRY RUN] Email body would be generated here',
    };
  }
  const prompt = `You are an expert at writing link building outreach emails that get responses.

Write a personalized, non-salesy outreach email for the following scenario:

TARGET WEBSITE: ${target.name} (${target.url})
WEBSITE TYPE: ${target.type}
TOPICS THEY COVER: ${target.topics.join(', ')}
ACCEPTS GUEST POSTS: ${target.acceptsGuestPosts ? 'Yes' : 'No'}

YOUR INFO:
Name: ${CONFIG.yourInfo.name}
Company: ${CONFIG.yourInfo.company}
Title: ${CONFIG.yourInfo.title}
Expertise: ${CONFIG.yourInfo.expertise}

OUTREACH STRATEGY: ${strategy}

REQUIREMENTS:
- Keep it under 150 words (short and scannable)
- Personalize with specific observation about their site
- Lead with value, not ask
- Be genuine and conversational
- Include ONE clear call-to-action
- Subject line: Make it intriguing but not clickbait
- NO templates, NO generic phrases, NO "I hope this email finds you well"
- Sound like a human reaching out to another human
- Mention Sydney/local angle if relevant

Return in this format:
SUBJECT: [subject line]

[email body]

Best,
${CONFIG.yourInfo.name}
${CONFIG.yourInfo.title}, ${CONFIG.yourInfo.company}`;

  // Use rate limiter to prevent API errors
  const message = await rateLimiter.withRetry(async () => {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Track API usage
    await usageTracker.track('link-outreach', response.usage);

    return response;
  });

  const fullText = message.content[0].text;
  const [subject, ...bodyParts] = fullText.split('\n\n');

  return {
    subject: subject.replace('SUBJECT: ', '').trim(),
    body: bodyParts.join('\n\n').trim(),
  };
}

/**
 * Determine outreach strategy based on target
 */
function determineStrategy(target) {
  if (target.acceptsGuestPosts) {
    return 'Guest post pitch - offer to write valuable content for their audience';
  } else if (target.type === 'directory') {
    return 'Directory listing request - ask to be added to their curated list';
  } else if (target.type === 'blog') {
    return 'Resource suggestion - suggest your content as additional resource for their existing article';
  } else {
    return 'Value-first outreach - offer expertise or collaboration';
  }
}

/**
 * Generate all outreach emails
 */
async function generateAllOutreach() {
  logger.info('Generating Link Outreach Emails', {
    isDryRun: CONFIG.isDryRun,
    targetCount: CONFIG.targetWebsites.length,
  });

  await fs.mkdir(CONFIG.outputDir, { recursive: true });

  const outreachEmails = [];

  for (const [index, target] of CONFIG.targetWebsites.entries()) {
    logger.info(`${index + 1}/${CONFIG.targetWebsites.length}: ${target.name}`);

    const strategy = determineStrategy(target);

    try {
      const email = await generateOutreachEmail(target, strategy);

      outreachEmails.push({
        target: target.name,
        url: target.url,
        contact: target.contact,
        strategy,
        subject: email.subject,
        body: email.body,
        status: 'draft',
        sentDate: null,
        response: null,
      });

      logger.success(`Generated email for ${target.name}`, {
        strategy,
        subjectLength: email.subject.length,
        bodyLength: email.body.length,
      });

    } catch (error) {
      const errorInfo = await errorHandler.handle(error, {
        target: target.name,
        operation: 'generateOutreachEmail',
      });

      logger.error(`Failed to generate email for ${target.name}`, errorInfo);
    }
  }

  return outreachEmails;
}

/**
 * Save outreach emails
 */
async function saveOutreach(emails) {
  const dateStr = new Date().toISOString().split('T')[0];
  const jsonPath = path.join(CONFIG.outputDir, `outreach-${dateStr}.json`);
  const csvPath = path.join(CONFIG.outputDir, `outreach-${dateStr}.csv`);
  const mdPath = path.join(CONFIG.outputDir, `outreach-${dateStr}.md`);

  if (CONFIG.isDryRun) {
    logger.info('[DRY RUN] Would save files:', { jsonPath, csvPath, mdPath });
    return { jsonPath, csvPath, mdPath };
  }

  // JSON
  await fs.writeFile(jsonPath, JSON.stringify(emails, null, 2));
  logger.success(`Saved JSON: ${jsonPath}`);

  // CSV
  const csvHeaders = 'Target,URL,Contact,Strategy,Subject,Status\n';
  const csvRows = emails.map(e =>
    `"${e.target}","${e.url}","${e.contact}","${e.strategy}","${e.subject}","${e.status}"`
  ).join('\n');
  await fs.writeFile(csvPath, csvHeaders + csvRows);
  logger.success(`Saved CSV: ${csvPath}`);

  // Markdown (readable)
  let markdown = `# Link Building Outreach Campaign\n\n`;
  markdown += `**Generated:** ${new Date().toLocaleString()}\n`;
  markdown += `**Total Targets:** ${emails.length}\n\n`;
  markdown += `---\n\n`;

  emails.forEach((email, idx) => {
    markdown += `## ${idx + 1}. ${email.target}\n\n`;
    markdown += `**Website:** ${email.url}\n`;
    markdown += `**Contact:** ${email.contact}\n`;
    markdown += `**Strategy:** ${email.strategy}\n\n`;
    markdown += `**Subject Line:**\n\`\`\`\n${email.subject}\n\`\`\`\n\n`;
    markdown += `**Email Body:**\n\`\`\`\n${email.body}\n\`\`\`\n\n`;
    markdown += `**Checklist:**\n`;
    markdown += `- [ ] Personalized before sending\n`;
    markdown += `- [ ] Sent\n`;
    markdown += `- [ ] Follow-up (if no response in 7 days)\n`;
    markdown += `- [ ] Response received\n\n`;
    markdown += `**Notes:** _______________\n\n`;
    markdown += `---\n\n`;
  });

  await fs.writeFile(mdPath, markdown);
  logger.success(`Saved Markdown: ${mdPath}`);

  return { jsonPath, csvPath, mdPath };
}

/**
 * Print usage guide
 */
function printGuide() {
  console.log('\n📚 OUTREACH CAMPAIGN GUIDE:\n');

  console.log('STEP 1: Review & Personalize');
  console.log('  - Open the generated Markdown file');
  console.log('  - Read each email carefully');
  console.log('  - Add any website-specific details you noticed');
  console.log('  - Verify contact information is current\n');

  console.log('STEP 2: Send Emails');
  console.log('  - Send 3-5 emails per day (don\'t batch)');
  console.log('  - Send in business hours (9am-5pm Sydney time)');
  console.log('  - Track which ones you\'ve sent\n');

  console.log('STEP 3: Follow Up');
  console.log('  - If no response in 7 days, send ONE friendly follow-up');
  console.log('  - Keep it short: "Just bumping this up in your inbox"');
  console.log('  - After 2nd no-response, move on\n');

  console.log('STEP 4: Track Results');
  console.log('  - Response rate (aim for 15-30%)');
  console.log('  - Acceptance rate (aim for 5-15%)');
  console.log('  - Links acquired');
  console.log('  - Adjust strategy based on what works\n');

  console.log('AUTOMATION OPTIONS:');
  console.log('  1. Semi-automated: Use Gmail + Streak CRM');
  console.log('  2. Automated: Mailshake or Lemlist (paid tools)');
  console.log('  3. Manual: Best for quality, copy-paste from markdown\n');
}

/**
 * Main execution
 */
async function main() {
  const startTime = Date.now();

  try {
    const emails = await generateAllOutreach();
    const files = await saveOutreach(emails);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    if (!CONFIG.isDryRun) {
      console.log(`\n💾 Saved to: ${CONFIG.outputDir}`);
      console.log(`   JSON: ${files.jsonPath}`);
      console.log(`   CSV: ${files.csvPath}`);
      console.log(`   Markdown: ${files.mdPath}`);

      printGuide();
    }

    console.log('\n' + '═'.repeat(60));
    console.log('📊 GENERATION SUMMARY');
    console.log('═'.repeat(60));
    console.log(`Duration: ${duration}s`);
    console.log(`Total emails: ${emails.length}`);
    console.log(`Guest post pitches: ${emails.filter(e => e.strategy.includes('Guest post')).length}`);
    console.log(`Resource suggestions: ${emails.filter(e => e.strategy.includes('Resource')).length}`);
    console.log(`Other outreach: ${emails.filter(e => !e.strategy.includes('Guest post') && !e.strategy.includes('Resource')).length}`);

    if (CONFIG.isDryRun) {
      console.log('\n⚠️  DRY RUN MODE - No files were written, no API calls made');
    }

    // Show API usage stats
    if (!CONFIG.isDryRun) {
      console.log('\n💰 API Usage:');
      const stats = await usageTracker.getStats(1); // Last 1 day
      console.log(`  Total Cost: $${stats.totalCost.toFixed(4)}`);
      console.log(`  Total Tokens: ${stats.totalTokens.toLocaleString()}`);
      console.log(`  Requests: ${stats.requestCount}`);

      console.log('\n💡 PRO TIPS:');
      console.log('   1. Quality > Quantity: Better to send 5 great emails than 50 templates');
      console.log('   2. Build relationships: Comment on their content before reaching out');
      console.log('   3. Track everything: Know what subject lines and strategies work');
      console.log('   4. Be patient: Good links take time');
    }

    console.log('\n' + '═'.repeat(60));
    logger.success('Outreach campaign ready!', {
      emails: emails.length,
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
