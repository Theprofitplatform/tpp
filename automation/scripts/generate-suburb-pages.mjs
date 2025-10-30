#!/usr/bin/env node

/**
 * Automated Suburb Page Generator
 * Generates unique, SEO-optimized suburb landing pages
 * Uses Claude API for content generation
 *
 * IMPROVEMENTS:
 * - Now loads suburbs from JSON file
 * - Uses rate limiter to prevent API errors
 * - Tracks API usage and costs
 * - Has dry-run mode
 * - Better error handling
 * - Environment validation
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
  .optional('OUTPUT_DIR', 'Output directory for suburb pages', './src/content/locations')
  .validate();

// Configuration
const CONFIG = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  outputDir: process.env.OUTPUT_DIR || './src/content/locations',
  suburbsFile: './automation/data/suburbs.json',
  isDryRun: process.argv.includes('--dry-run'),
};

// Initialize utilities
const logger = new Logger('suburb-pages');
const errorHandler = new ErrorHandler('suburb-pages');
const rateLimiter = new AnthropicRateLimiter(50, { verbose: true });
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
 * Load suburbs from JSON file
 */
async function loadSuburbs() {
  try {
    const content = await fs.readFile(CONFIG.suburbsFile, 'utf-8');
    const data = JSON.parse(content);
    return data.suburbs.filter(s => s.status === 'pending');
  } catch (error) {
    logger.error('Failed to load suburbs file', { error: error.message });
    throw new Error(`Could not load ${CONFIG.suburbsFile}. Make sure the file exists.`);
  }
}

/**
 * Save updated suburbs data
 */
async function saveSuburbs(suburbs) {
  try {
    const content = await fs.readFile(CONFIG.suburbsFile, 'utf-8');
    const data = JSON.parse(content);

    // Update suburbs in data
    suburbs.forEach(updatedSuburb => {
      const index = data.suburbs.findIndex(s => s.name === updatedSuburb.name);
      if (index !== -1) {
        data.suburbs[index] = updatedSuburb;
      }
    });

    // Update metadata
    data.metadata.lastUpdated = new Date().toISOString().split('T')[0];
    data.metadata.generated = data.suburbs.filter(s => s.status === 'generated').length;
    data.metadata.pendingGeneration = data.suburbs.filter(s => s.status === 'pending').length;

    await fs.writeFile(CONFIG.suburbsFile, JSON.stringify(data, null, 2));
  } catch (error) {
    logger.error('Failed to save suburbs file', { error: error.message });
  }
}

/**
 * Generate unique suburb page content using Claude
 */
async function generateSuburbContent(suburb) {
  logger.info(`Generating content for ${suburb.name}`);

  const prompt = `You are an expert local SEO content writer creating a suburb landing page for a digital marketing agency in Sydney.

SUBURB: ${suburb.name}, ${suburb.region}
POSTCODE: ${suburb.postcode}
COMPANY: The Profit Platform (digital marketing agency - SEO, Google Ads, web design)

Write a unique, high-quality suburb landing page (EXACTLY 600-800 words) that:
1. Opens with a compelling hook specific to ${suburb.name}'s business landscape
2. Addresses local business challenges unique to ${suburb.name}
3. Explains our services in context of ${suburb.name} market
4. Includes 1 brief case study (can be hypothetical if needed)
5. Lists relevant industries in ${suburb.name}
6. Adds 3 local FAQs
7. Uses natural language, avoids keyword stuffing
8. Sounds human, not AI-generated

IMPORTANT:
- Research actual characteristics of ${suburb.name} (demographics, business types, local culture)
- Be specific and local (mention landmarks, local challenges, community aspects)
- Write in active voice, conversational tone
- Include the suburb name naturally 5-7 times throughout
- NO generic templates or obvious AI patterns
- Make it sound like a local expert wrote it
- Word count MUST be between 600-800 words

Return ONLY the markdown content, starting with the H1 heading. No frontmatter, no metadata.`;

  // Use rate limiter to prevent API errors
  const result = await rateLimiter.withRetry(async () => {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    // Track API usage
    await usageTracker.track('suburb-pages', message.usage);

    return message;
  });

  return result.content[0].text;
}

/**
 * Create complete suburb page file with frontmatter
 */
async function createSuburbPage(suburb) {
  try {
    logger.info(`Creating suburb page for ${suburb.name}`);

    // Generate unique content
    const content = await generateSuburbContent(suburb);

    // Build nearby suburbs list from suburb data
    const nearbySuburbs = suburb.nearbySuburbs || [];

    // Create frontmatter
    const frontmatter = `---
title: "Digital Marketing Agency ${suburb.name}, Sydney | The Profit Platform"
description: "Leading digital marketing services in ${suburb.name}. Local SEO, Google Ads, and web design helping ${suburb.name} businesses grow. Free consultation available."
city: "${suburb.name}"
state: "NSW"
country: "Australia"
postcode: "${suburb.postcode}"
region: "${suburb.region}"
phone: "0487 286 451"
email: "avi@theprofitplatform.com.au"
serviceAreas: ${JSON.stringify([suburb.name, ...nearbySuburbs])}
coordinates:
  lat: ${suburb.coordinates.lat}
  lng: ${suburb.coordinates.lng}
draft: false
dateCreated: ${new Date().toISOString().split('T')[0]}
lastUpdated: ${new Date().toISOString().split('T')[0]}
---

`;

    // Combine frontmatter + content
    const fullContent = frontmatter + content;

    // Create filename (lowercase, hyphenated)
    const filename = `${suburb.name.toLowerCase().replace(/\s+/g, '-')}.md`;
    const filepath = path.join(CONFIG.outputDir, filename);

    // Dry-run mode: don't write file
    if (CONFIG.isDryRun) {
      logger.info(`[DRY RUN] Would create: ${filepath}`, {
        wordCount: content.split(/\s+/).length,
        size: fullContent.length
      });
      return { success: true, filepath, suburb: suburb.name, dryRun: true };
    }

    // Write file
    await fs.writeFile(filepath, fullContent, 'utf-8');

    logger.success(`Created: ${filepath}`, {
      wordCount: content.split(/\s+/).length,
      size: fullContent.length
    });

    return { success: true, filepath, suburb: suburb.name };

  } catch (error) {
    const errorInfo = await errorHandler.handle(error, {
      suburb: suburb.name,
      operation: 'createSuburbPage',
    });

    return { success: false, suburb: suburb.name, error: errorInfo.message };
  }
}

/**
 * Main execution
 */
async function main() {
  const startTime = Date.now();

  logger.info('Starting Automated Suburb Page Generation', {
    isDryRun: CONFIG.isDryRun,
    outputDir: CONFIG.outputDir,
  });

  try {
    // Ensure output directory exists
    await fs.mkdir(CONFIG.outputDir, { recursive: true });

    // Load suburbs from JSON file
    const suburbs = await loadSuburbs();

    if (suburbs.length === 0) {
      logger.warn('No pending suburbs found to generate');
      return;
    }

    logger.info(`Found ${suburbs.length} suburb(s) to generate`);

    // Process each suburb
    const results = [];
    const updatedSuburbs = [];

    for (const suburb of suburbs) {
      logger.info(`Processing ${suburb.name} (${suburbs.indexOf(suburb) + 1}/${suburbs.length})`);

      const result = await createSuburbPage(suburb);
      results.push(result);

      // Update suburb status
      if (result.success && !CONFIG.isDryRun) {
        suburb.status = 'generated';
        suburb.generatedDate = new Date().toISOString().split('T')[0];
        suburb.filepath = result.filepath;
        updatedSuburbs.push(suburb);
      }

      // Save progress after each suburb (checkpoint)
      if (updatedSuburbs.length > 0 && !CONFIG.isDryRun) {
        await saveSuburbs(updatedSuburbs);
      }

      // Rate limiting - no need to wait, rateLimiter handles this automatically
      // Just a small delay to show progress
      if (suburbs.indexOf(suburb) < suburbs.length - 1) {
        logger.debug('Moving to next suburb...');
      }
    }

    // Final summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log('\n' + '═'.repeat(60));
    console.log('📊 GENERATION SUMMARY');
    console.log('═'.repeat(60));
    console.log(`Duration: ${duration}s`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);

    if (CONFIG.isDryRun) {
      console.log('\n⚠️  DRY RUN MODE - No files were written');
    }

    if (failed > 0) {
      console.log('\n❌ Failed suburbs:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.suburb}: ${r.error}`);
      });
    }

    // Show API usage stats
    console.log('\n💰 API Usage:');
    const stats = await usageTracker.getStats(1); // Last 1 day
    console.log(`  Total Cost: $${stats.totalCost.toFixed(4)}`);
    console.log(`  Total Tokens: ${stats.totalTokens.toLocaleString()}`);
    console.log(`  Requests: ${stats.requestCount}`);

    console.log('\n' + '═'.repeat(60));
    logger.success('Automation complete!', {
      successful,
      failed,
      duration: `${duration}s`,
    });

    console.log(`\n📁 Pages saved to: ${CONFIG.outputDir}`);

    if (!CONFIG.isDryRun) {
      console.log(`📊 Updated: ${CONFIG.suburbsFile}`);
    }

  } catch (error) {
    await errorHandler.handle(error, {
      operation: 'main',
      exitOnError: true,
    });
  }
}

// Run
main().catch(async (error) => {
  await errorHandler.handle(error, {
    operation: 'main-catch',
    exitOnError: true,
  });
});
