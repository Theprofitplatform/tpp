/**
 * Facebook Scheduler
 * Automated scheduling system for Facebook posts
 *
 * Features:
 * - Cron-based scheduling
 * - Automated posting at optimal times
 * - Queue management
 * - Conflict detection
 * - Error handling and notifications
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { FacebookAutomation } from './facebook-automation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

/**
 * Facebook Scheduler Class
 */
class FacebookScheduler {
  constructor() {
    this.automation = new FacebookAutomation();
    this.isRunning = false;
    this.checkInterval = null;
    this.lastCheck = null;
  }

  /**
   * Start the scheduler
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️  Scheduler already running');
      return;
    }

    console.log('🚀 Starting Facebook scheduler...');
    this.isRunning = true;

    // Initial status check
    await this.checkAndPost();

    // Set up interval checking (every 5 minutes)
    this.checkInterval = setInterval(async () => {
      await this.checkAndPost();
    }, 5 * 60 * 1000); // 5 minutes

    console.log('✅ Scheduler started (checking every 5 minutes)');
    console.log('💡 Press Ctrl+C to stop the scheduler');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Stopping scheduler...');
      await this.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Stopping scheduler...');
      await this.stop();
      process.exit(0);
    });
  }

  /**
   * Stop the scheduler
   */
  async stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('✅ Scheduler stopped');
  }

  /**
   * Check if it's time to post and execute
   */
  async checkAndPost() {
    const now = new Date();
    this.lastCheck = now.toISOString();

    console.log(`\n⏰ Scheduler check: ${now.toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}`);

    try {
      const result = await this.automation.runAutomatedCheck();

      if (result.success) {
        console.log('✅ Automated posting completed successfully');

        // Send notification if configured
        await this.sendNotification('success', result);
      } else if (result.error === 'Not scheduled') {
        // Normal - not scheduled for posting
        console.log('ℹ️  Not scheduled for posting at this time');
      } else {
        console.warn('⚠️  Automated check completed with issues:', result.error);

        // Send error notification
        await this.sendNotification('error', result);
      }

    } catch (error) {
      console.error('❌ Scheduler check failed:', error.message);
      await this.sendNotification('error', { error: error.message });
    }
  }

  /**
   * Send notification about posting results
   */
  async sendNotification(type, data) {
    try {
      // Check if Discord webhook is configured
      if (!process.env.DISCORD_WEBHOOK_URL) {
        return;
      }

      let message = '';
      let color = 0x00ff00; // Green

      if (type === 'success') {
        message = `✅ Facebook post published successfully!\n`;
        message += `📝 Post ID: ${data.postId || 'Manual'}\n`;
        message += `⏰ Time: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}\n`;
        if (data.manual) {
          message += `📋 **Manual posting required** - Content saved to file`;
        }
      } else {
        color = 0xff0000; // Red
        message = `❌ Facebook automation error\n`;
        message += `⏰ Time: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}\n`;
        message += `📝 Error: ${data.error || 'Unknown error'}`;
      }

      const payload = {
        embeds: [{
          title: 'Facebook Automation',
          description: message,
          color: color,
          timestamp: new Date().toISOString(),
          footer: {
            text: 'The Profit Platform Automation'
          }
        }]
      };

      await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

    } catch (error) {
      console.warn('⚠️  Failed to send notification:', error.message);
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastCheck: this.lastCheck,
      automationStatus: this.automation.getStatus()
    };
  }

  /**
   * Force immediate posting check
   */
  async forceCheck() {
    console.log('🔧 Forcing immediate scheduler check...');
    await this.checkAndPost();
  }
}

/**
 * CLI execution
 */
async function main() {
  const args = process.argv.slice(2);
  const scheduler = new FacebookScheduler();

  if (args.length === 0 || args.includes('--help')) {
    console.log(`
📘 FACEBOOK SCHEDULER
==================================================

Commands:
  node facebook-scheduler.js start      Start the scheduler
  node facebook-scheduler.js stop       Stop the scheduler
  node facebook-scheduler.js status     Show scheduler status
  node facebook-scheduler.js force      Force immediate check
  node facebook-scheduler.js --help     Show this help

Features:
  ✅ Automated posting at scheduled times
  ✅ 5-minute interval checks
  ✅ Discord notifications
  ✅ Error handling and recovery
  ✅ Graceful shutdown

Schedule:
  Monday: 09:30 AEST
  Wednesday: 14:00 AEST
  Friday: 11:00 AEST

==================================================
    `);
    return;
  }

  const command = args[0];

  switch (command) {
    case 'start':
      await scheduler.start();
      break;

    case 'stop':
      await scheduler.stop();
      break;

    case 'status':
      const status = scheduler.getStatus();
      console.log('\n📊 Facebook Scheduler Status');
      console.log('='.repeat(40));
      console.log(`Running: ${status.isRunning ? '✅ Yes' : '❌ No'}`);
      console.log(`Last check: ${status.lastCheck || 'Never'}`);
      console.log(`Posts this week: ${status.automationStatus.postsThisWeek}/${status.automationStatus.maxPostsPerWeek}`);
      console.log('='.repeat(40));
      break;

    case 'force':
      await scheduler.forceCheck();
      break;

    default:
      console.error('❌ Unknown command. Use --help for usage information.');
      process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { FacebookScheduler };
export default FacebookScheduler;