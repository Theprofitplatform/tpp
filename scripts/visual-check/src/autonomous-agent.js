#!/usr/bin/env node

/**
 * Autonomous Visual Quality Agent
 *
 * Continuously monitors, detects issues, generates fixes, and improves
 * the visual quality of web pages.
 */

import { chromium } from '@playwright/test';
import cron from 'node-cron';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkUrl, CONFIG as BASE_CONFIG } from '../visualCheck.js';
import { FixGenerator } from './fix-generator.js';
import { NotificationService } from './notification-service.js';
import { VersionControl } from './version-control.js';
import { ComparisonEngine } from './comparison-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class AutonomousAgent {
  constructor(config) {
    this.config = config;
    this.fixGenerator = new FixGenerator(config);
    this.notifier = new NotificationService(config.notifications);
    this.versionControl = new VersionControl(config.paths.webRoot);
    this.comparisonEngine = new ComparisonEngine();
    this.browser = null;
    this.isRunning = false;
    this.runHistory = [];
    this.cronJob = null;
  }

  /**
   * Start the autonomous monitoring loop
   */
  async start() {
    console.log(chalk.bold.cyan('\n🤖 Autonomous Visual Quality Agent Starting...\n'));
    console.log(chalk.gray(`URL: ${this.config.url}`));
    console.log(chalk.gray(`Schedule: ${this.config.interval}`));
    console.log(chalk.gray(`Auto-fix: ${this.config.autoFix.enabled ? 'Enabled' : 'Disabled'}\n`));

    this.isRunning = true;

    // Launch browser once and reuse
    this.browser = await chromium.launch({
      headless: true
    });

    // Run initial check immediately
    await this.runCheck();

    // Schedule recurring checks
    if (this.config.interval) {
      this.cronJob = cron.schedule(this.config.interval, async () => {
        await this.runCheck();
      });

      console.log(chalk.green('✅ Autonomous agent is now running'));
      console.log(chalk.gray('Press Ctrl+C to stop\n'));
    }
  }

  /**
   * Stop the agent
   */
  async stop() {
    console.log(chalk.yellow('\n⏹️  Stopping autonomous agent...'));
    this.isRunning = false;

    if (this.cronJob) {
      this.cronJob.stop();
    }

    if (this.browser) {
      await this.browser.close();
    }

    console.log(chalk.green('✅ Agent stopped'));
  }

  /**
   * Run a single check cycle
   */
  async runCheck() {
    const runId = Date.now();
    const timestamp = new Date().toISOString();

    console.log(chalk.bold.blue(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`));
    console.log(chalk.bold.blue(`🔍 Check Run #${this.runHistory.length + 1} - ${timestamp}`));
    console.log(chalk.bold.blue(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`));

    try {
      // Create run directory
      const runFolder = path.join(
        this.config.paths.screenshots,
        `run-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)}`
      );
      await fs.mkdir(runFolder, { recursive: true });

      // Get viewports
      const viewports = Object.entries(this.config.viewports)
        .filter(([_, vp]) => vp.enabled)
        .map(([name, vp]) => ({
          name,
          width: vp.width,
          height: vp.height
        }));

      // Run visual check
      const urlInfo = {
        url: this.config.url,
        name: new URL(this.config.url).hostname
      };

      const result = await checkUrl(this.browser, urlInfo, viewports, runFolder);

      // Count issues
      const totalIssues = result.viewportResults.reduce((sum, vr) => {
        return sum + (vr.issues ? Object.values(vr.issues).flat().length : 0);
      }, 0);

      // Compare with previous run
      let comparison = null;
      if (this.runHistory.length > 0) {
        const previousRun = this.runHistory[this.runHistory.length - 1];
        comparison = await this.comparisonEngine.compare(previousRun.result, result);

        console.log(chalk.cyan('\n📊 Comparison with previous run:'));
        console.log(chalk.gray(`  Issues: ${previousRun.totalIssues} → ${totalIssues} (${comparison.issuesDelta > 0 ? '+' : ''}${comparison.issuesDelta})`));
        console.log(chalk.gray(`  Status: ${comparison.status}\n`));
      }

      // Generate fixes if issues found
      let fixes = [];
      if (totalIssues > 0) {
        console.log(chalk.yellow(`⚠️  ${totalIssues} issue(s) detected. Analyzing...\n`));

        fixes = await this.fixGenerator.generateFixes(result);

        if (fixes.length > 0) {
          console.log(chalk.cyan(`💡 Generated ${fixes.length} potential fix(es):\n`));

          fixes.forEach((fix, idx) => {
            console.log(chalk.gray(`  ${idx + 1}. ${fix.description}`));
            console.log(chalk.gray(`     Priority: ${fix.priority}, Confidence: ${fix.confidence}%`));
          });

          // Save fixes
          const fixesFile = path.join(this.config.paths.fixes, `fixes-${runId}.json`);
          await fs.mkdir(this.config.paths.fixes, { recursive: true });
          await fs.writeFile(fixesFile, JSON.stringify(fixes, null, 2));
          console.log(chalk.gray(`\n📄 Fixes saved to: ${fixesFile}\n`));

          // Apply fixes if auto-fix is enabled
          if (this.config.autoFix.enabled) {
            if (this.config.autoFix.backupBeforeFix) {
              await this.versionControl.createBackup(`auto-backup-${runId}`);
            }

            const applied = await this.applyFixes(fixes, runId);
            console.log(chalk.green(`✅ Applied ${applied.length} fix(es)`));

            // Re-run check to verify fixes
            if (applied.length > 0) {
              console.log(chalk.cyan('\n🔄 Re-checking after fixes...\n'));
              await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for changes
              // TODO: Implement re-check logic
            }
          }
        } else {
          console.log(chalk.gray('No automated fixes available for detected issues\n'));
        }
      } else {
        console.log(chalk.green('✅ No issues detected!\n'));
      }

      // Send notifications
      if (totalIssues > 0 || (comparison && comparison.status === 'degraded')) {
        await this.notifier.send({
          type: totalIssues > 0 ? 'issues_found' : 'status_change',
          runId,
          timestamp,
          url: this.config.url,
          totalIssues,
          fixes: fixes.length,
          comparison,
          reportPath: runFolder
        });
      }

      // Save run history
      const runData = {
        runId,
        timestamp,
        result,
        totalIssues,
        fixes: fixes.length,
        comparison,
        runFolder
      };

      this.runHistory.push(runData);

      // Keep only last 50 runs in memory
      if (this.runHistory.length > 50) {
        this.runHistory.shift();
      }

      // Save summary
      await this.saveSummary(runData);

      console.log(chalk.gray(`\n📁 Results: ${runFolder}`));
      console.log(chalk.gray(`Next check: ${this.getNextRunTime()}\n`));

      return runData;

    } catch (error) {
      console.error(chalk.red('\n❌ Error during check:'), error.message);
      console.error(error.stack);

      await this.notifier.send({
        type: 'error',
        timestamp,
        error: error.message
      });

      throw error;
    }
  }

  /**
   * Apply generated fixes
   */
  async applyFixes(fixes, runId) {
    const applied = [];

    for (const fix of fixes) {
      // Skip low-confidence fixes if requireApproval is true
      if (this.config.autoFix.requireApproval && fix.confidence < 70) {
        console.log(chalk.yellow(`  ⏭️  Skipping low-confidence fix: ${fix.description}`));
        continue;
      }

      try {
        console.log(chalk.cyan(`  🔧 Applying: ${fix.description}...`));

        await this.fixGenerator.applyFix(fix);
        applied.push(fix);

        console.log(chalk.green(`  ✅ Applied successfully`));
      } catch (error) {
        console.error(chalk.red(`  ❌ Failed to apply fix: ${error.message}`));
      }
    }

    return applied;
  }

  /**
   * Save run summary to file
   */
  async saveSummary(runData) {
    const summaryFile = path.join(this.config.paths.logs, 'summary.json');

    try {
      let summary = [];
      try {
        const content = await fs.readFile(summaryFile, 'utf-8');
        summary = JSON.parse(content);
      } catch (err) {
        // File doesn't exist yet
      }

      summary.push({
        runId: runData.runId,
        timestamp: runData.timestamp,
        totalIssues: runData.totalIssues,
        fixesGenerated: runData.fixes,
        status: runData.comparison?.status || 'initial',
        issuesDelta: runData.comparison?.issuesDelta || 0
      });

      // Keep only last 100 runs
      if (summary.length > 100) {
        summary = summary.slice(-100);
      }

      await fs.mkdir(this.config.paths.logs, { recursive: true });
      await fs.writeFile(summaryFile, JSON.stringify(summary, null, 2));
    } catch (error) {
      console.error(chalk.red('Failed to save summary:'), error.message);
    }
  }

  /**
   * Get next scheduled run time
   */
  getNextRunTime() {
    if (!this.cronJob) return 'Manual mode';

    // Simple estimation based on cron pattern
    const pattern = this.config.interval;

    if (pattern.startsWith('*/15')) return 'in 15 minutes';
    if (pattern.startsWith('*/30')) return 'in 30 minutes';
    if (pattern.startsWith('0 *')) return 'in 1 hour';
    if (pattern.startsWith('0 */6')) return 'in 6 hours';
    if (pattern.startsWith('0 0')) return 'tomorrow';

    return 'see cron schedule';
  }

  /**
   * Get status report
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      totalRuns: this.runHistory.length,
      lastRun: this.runHistory[this.runHistory.length - 1],
      config: {
        url: this.config.url,
        interval: this.config.interval,
        autoFix: this.config.autoFix.enabled
      }
    };
  }
}