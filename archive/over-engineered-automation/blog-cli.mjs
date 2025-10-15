#!/usr/bin/env node

/**
 * Unified Blog Automation CLI
 *
 * Consolidates 20+ blog automation scripts into a single, maintainable CLI tool.
 * Maintains 100% backward compatibility with existing npm scripts.
 *
 * Usage:
 *   node tools/blog-cli.mjs <command> [options]
 *   npm run blog:<command>  (via package.json wrapper)
 *
 * Commands:
 *   generate              Generate new blog post from topic queue
 *   validate              Validate blog content structure and quality
 *   validate-schema       Validate JSON-LD schema markup
 *   validate-authors      Validate author profile data
 *   check-links           Check for broken internal/external links
 *   plagiarism            Check content for plagiarism
 *   images                Update and optimize blog images
 *   link-map              Build internal linking map
 *   performance           Track blog performance metrics
 *   insights              Generate SEO insights report
 *   optimize              Optimize existing content for SEO
 *   opportunities         Find SEO content opportunities
 *   competitor            Analyze competitor content
 *   calendar              Generate content calendar
 *   alerts                Monitor performance alerts
 *   keyword-research      Perform keyword research
 *   dashboard             Generate analytics dashboard
 *   ab-test               A/B test headline variations
 *   master                Run master automation workflow
 *   verify                Verify setup and API connections
 */

import { Command } from 'commander';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Lazy-load strategy: Only import script when command is executed
// This keeps CLI startup fast and reduces memory footprint

const SCRIPT_MAP = {
  generate: 'automation/scripts/generate-blog-post.js',
  validate: 'automation/scripts/validate-content.js',
  'validate-schema': 'automation/scripts/validate-schema.mjs',
  'validate-authors': 'automation/scripts/validate-author-profiles.mjs',
  'check-links': 'automation/scripts/check-broken-links.mjs',
  plagiarism: 'automation/scripts/plagiarism-check.js',
  images: 'automation/scripts/update-blog-images.mjs',
  'link-map': 'automation/scripts/build-internal-link-map.mjs',
  performance: 'automation/scripts/track-performance.mjs',
  insights: 'automation/scripts/generate-insights.mjs',
  optimize: 'automation/scripts/optimize-content.mjs',
  opportunities: 'automation/scripts/find-seo-opportunities.mjs',
  competitor: 'automation/scripts/analyze-competitor.mjs',
  calendar: 'automation/scripts/generate-content-calendar.mjs',
  alerts: 'automation/scripts/performance-alerts.mjs',
  'keyword-research': 'automation/scripts/keyword-research.mjs',
  dashboard: 'automation/scripts/generate-dashboard.mjs',
  'ab-test': 'automation/scripts/ab-test-headlines.mjs',
  master: 'automation/scripts/master-automation.mjs',
  verify: 'automation/scripts/verify-setup.mjs',
};

/**
 * Execute a blog automation script
 * @param {string} command - Command name
 * @param {object} options - Command options
 */
async function executeScript(command, options = {}) {
  const scriptPath = SCRIPT_MAP[command];

  if (!scriptPath) {
    console.error(`❌ Unknown command: ${command}`);
    console.error(`Available commands: ${Object.keys(SCRIPT_MAP).join(', ')}`);
    process.exit(1);
  }

  const fullPath = path.join(projectRoot, scriptPath);

  try {
    console.log(`🚀 Executing: ${command}`);
    console.log(`📄 Script: ${scriptPath}\n`);

    // Import and execute the script
    // Most scripts export a main function or execute on import
    const module = await import(fullPath);

    // If script exports a main/default function, execute it
    if (typeof module.default === 'function') {
      await module.default(options);
    } else if (typeof module.main === 'function') {
      await module.main(options);
    }
    // Otherwise script executed on import (side effects)

    console.log(`\n✅ Command completed: ${command}`);
  } catch (error) {
    console.error(`\n❌ Error executing ${command}:`, error.message);
    if (options.debug) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Create CLI program
const program = new Command();

program
  .name('blog-cli')
  .description('Unified Blog Automation CLI for The Profit Platform')
  .version('1.0.0')
  .option('-d, --debug', 'Enable debug output');

// Add all commands dynamically
Object.keys(SCRIPT_MAP).forEach(cmd => {
  program
    .command(cmd)
    .description(`Execute ${cmd} automation`)
    .action(async options => {
      const globalOpts = program.opts();
      await executeScript(cmd, { ...options, ...globalOpts });
    });
});

// Special compound commands
program
  .command('test')
  .description('Generate and validate blog post (compound command)')
  .action(async () => {
    console.log('🧪 Running blog test: generate + validate\n');
    await executeScript('generate');
    console.log('\n---\n');
    await executeScript('validate');
  });

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
