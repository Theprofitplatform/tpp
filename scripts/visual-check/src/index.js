#!/usr/bin/env node

/**
 * Visual Quality Agent - Main Entry Point
 *
 * Autonomous agent for continuous visual quality monitoring and improvement
 *
 * Usage:
 *   node src/index.js --url "https://example.com" --watch
 *   node src/index.js --config config/production.json
 *   node src/index.js --run-once
 */

import { program } from 'commander';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { AutonomousAgent } from './autonomous-agent.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Load configuration
 */
async function loadConfig(configPath) {
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(chalk.red(`Failed to load config: ${configPath}`));
    throw error;
  }
}

/**
 * Merge configuration with CLI overrides
 */
function mergeConfig(baseConfig, cliOptions) {
  const config = { ...baseConfig };

  if (cliOptions.url) config.url = cliOptions.url;
  if (cliOptions.interval) config.interval = cliOptions.interval;
  if (cliOptions.autoFix !== undefined) config.autoFix.enabled = cliOptions.autoFix;

  return config;
}

/**
 * Main CLI
 */
async function main() {
  program
    .name('visual-agent')
    .description('Autonomous Visual Quality Agent for continuous monitoring and improvement')
    .version('1.0.0');

  program
    .option('-u, --url <url>', 'URL to monitor')
    .option('-c, --config <path>', 'Configuration file path', path.join(__dirname, '../config/default.json'))
    .option('-i, --interval <cron>', 'Cron schedule (e.g., "*/15 * * * *" for every 15 min)')
    .option('--watch', 'Run in continuous watch mode')
    .option('--run-once', 'Run a single check and exit')
    .option('--auto-fix', 'Enable automatic fix application')
    .option('--no-auto-fix', 'Disable automatic fix application')
    .option('--status', 'Show agent status and exit')
    .option('--stop', 'Stop running agent')
    .parse(process.argv);

  const options = program.opts();

  try {
    // Load configuration
    const baseConfig = await loadConfig(options.config);
    const config = mergeConfig(baseConfig, options);

    // Create agent
    const agent = new AutonomousAgent(config);

    // Handle different modes
    if (options.status) {
      // Show status
      const status = agent.getStatus();
      console.log(chalk.bold.cyan('\n🤖 Agent Status\n'));
      console.log(chalk.gray(`Running: ${status.isRunning ? 'Yes' : 'No'}`));
      console.log(chalk.gray(`Total Runs: ${status.totalRuns}`));
      if (status.lastRun) {
        console.log(chalk.gray(`Last Run: ${status.lastRun.timestamp}`));
        console.log(chalk.gray(`Last Issues: ${status.lastRun.totalIssues}`));
      }
      console.log();
      return;
    }

    if (options.stop) {
      // Stop agent
      await agent.stop();
      return;
    }

    if (options.runOnce) {
      // Single run mode
      console.log(chalk.bold.cyan('\n🤖 Running single check...\n'));
      const { chromium } = await import('@playwright/test');
      agent.browser = await chromium.launch({ headless: true });
      await agent.runCheck();
      await agent.browser.close();
      console.log(chalk.green('\n✅ Check completed\n'));
      return;
    }

    // Watch mode (default)
    if (!options.watch && !config.interval) {
      // No interval specified, run once
      console.log(chalk.yellow('⚠️  No interval specified. Running once. Use --watch for continuous mode.\n'));
      const { chromium } = await import('@playwright/test');
      agent.browser = await chromium.launch({ headless: true });
      await agent.runCheck();
      await agent.browser.close();
      return;
    }

    // Start continuous monitoring
    await agent.start();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log(chalk.yellow('\n\n⏹️  Received SIGINT, shutting down...'));
      await agent.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log(chalk.yellow('\n\n⏹️  Received SIGTERM, shutting down...'));
      await agent.stop();
      process.exit(0);
    });

    // Keep process alive
    await new Promise(() => {});

  } catch (error) {
    console.error(chalk.red('\n❌ Fatal error:'), error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main };