#!/usr/bin/env node
/**
 * Visual Quality Agent - CLI Interface
 */

import { Command } from 'commander';
import cron from 'node-cron';
import chalk from 'chalk';
import { VisualQualityAgent } from './index.js';
import { loadConfig } from './utils/configLoader.js';
import { logger } from './utils/logger.js';

const program = new Command();

program
  .name('visual-agent')
  .description('Autonomous visual quality monitoring and improvement agent')
  .version('1.0.0');

program
  .command('inspect')
  .description('Run a single inspection')
  .option('-u, --url <url>', 'URL to inspect')
  .option('-c, --config <path>', 'Config file path', './config/config.json')
  .option('--auto-fix', 'Automatically apply high-confidence fixes')
  .action(async (options) => {
    try {
      const config = await loadConfig(options.config);
      if (options.url) config.url = options.url;

      const agent = new VisualQualityAgent(config);
      await agent.initialize();

      const results = await agent.runInspection();

      if (options.autoFix && results.fixes.length > 0) {
        await agent.applyFixes(results, { autoApply: true });
      }

      await agent.shutdown();

      console.log(chalk.green('\n✓ Inspection complete!'));
      console.log(chalk.blue(`  Issues found: ${results.issues.length}`));
      console.log(chalk.blue(`  Fixes generated: ${results.fixes.length}`));
      console.log(chalk.gray(`  Report: ${config.paths.reports}/summary.md`));

    } catch (error) {
      logger.error('Inspection failed:', error);
      process.exit(1);
    }
  });

program
  .command('watch')
  .description('Start continuous monitoring')
  .option('-u, --url <url>', 'URL to monitor')
  .option('-c, --config <path>', 'Config file path', './config/config.json')
  .option('-i, --interval <cron>', 'Cron interval (default: */15 * * * *)')
  .option('--auto-fix', 'Automatically apply high-confidence fixes')
  .action(async (options) => {
    try {
      const config = await loadConfig(options.config);
      if (options.url) config.url = options.url;

      const interval = options.interval || config.monitoring.interval;
      const autoFix = options.autoFix || config.monitoring.autoFix;

      console.log(chalk.blue('🤖 Visual Quality Agent - Continuous Monitoring'));
      console.log(chalk.gray(`   URL: ${config.url}`));
      console.log(chalk.gray(`   Interval: ${interval}`));
      console.log(chalk.gray(`   Auto-fix: ${autoFix ? 'enabled' : 'disabled'}`));
      console.log();

      const agent = new VisualQualityAgent(config);
      await agent.initialize();

      // Run immediately on start
      logger.info('Running initial inspection...');
      const initialResults = await agent.runInspection();

      if (autoFix && initialResults.fixes.length > 0) {
        await agent.applyFixes(initialResults, { autoApply: true });
      }

      // Schedule recurring inspections
      cron.schedule(interval, async () => {
        logger.info('Scheduled inspection starting...');
        try {
          const results = await agent.runInspection();

          if (autoFix && results.fixes.length > 0) {
            await agent.applyFixes(results, { autoApply: true });
          }
        } catch (error) {
          logger.error('Scheduled inspection failed:', error);
        }
      });

      logger.success('Continuous monitoring started. Press Ctrl+C to stop.');

      // Handle graceful shutdown
      process.on('SIGINT', async () => {
        console.log(chalk.yellow('\n\nShutting down...'));
        await agent.shutdown();
        process.exit(0);
      });

    } catch (error) {
      logger.error('Failed to start monitoring:', error);
      process.exit(1);
    }
  });

program
  .command('apply-fixes')
  .description('Apply generated fixes from a previous run')
  .option('-r, --run-id <id>', 'Run ID to apply fixes from')
  .option('-f, --fix-ids <ids>', 'Comma-separated fix IDs to apply')
  .option('-c, --config <path>', 'Config file path', './config/config.json')
  .action(async (options) => {
    try {
      const config = await loadConfig(options.config);

      // Load results from previous run
      const resultsPath = `${config.paths.reports}/${options.runId}/results.json`;
      const results = JSON.parse(await fs.readFile(resultsPath, 'utf-8'));

      const agent = new VisualQualityAgent(config);

      const fixIds = options.fixIds ? options.fixIds.split(',') : null;
      await agent.applyFixes(results, { autoApply: true, fixIds });

      console.log(chalk.green('✓ Fixes applied successfully!'));

    } catch (error) {
      logger.error('Failed to apply fixes:', error);
      process.exit(1);
    }
  });

program
  .command('report')
  .description('Generate report from previous run')
  .option('-r, --run-id <id>', 'Run ID to generate report for')
  .option('-c, --config <path>', 'Config file path', './config/config.json')
  .action(async (options) => {
    try {
      const config = await loadConfig(options.config);
      const resultsPath = `${config.paths.reports}/${options.runId}/results.json`;
      const results = JSON.parse(await fs.readFile(resultsPath, 'utf-8'));

      const ReportGenerator = (await import('./reporters/ReportGenerator.js')).ReportGenerator;
      const reporter = new ReportGenerator(config);
      await reporter.generateReports(results);

      console.log(chalk.green('✓ Report generated successfully!'));
      console.log(chalk.gray(`  Location: ${config.paths.reports}/summary.md`));

    } catch (error) {
      logger.error('Failed to generate report:', error);
      process.exit(1);
    }
  });

program.parse();
