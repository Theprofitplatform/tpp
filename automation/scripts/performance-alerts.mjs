#!/usr/bin/env node
/**
 * Performance Alerts System
 * Monitors blog performance and sends alerts for milestones or issues
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Alert thresholds
const THRESHOLDS = {
  HIGH_TRAFFIC: 100,        // Alert when post gets 100+ views
  LOW_ENGAGEMENT: 40,       // Alert when engagement < 40%
  HIGH_BOUNCE: 60,          // Alert when bounce rate > 60%
  RANKING_OPPORTUNITY: 10,  // Alert when ranking 5-10
  VIRAL_POST: 500,          // Alert when post goes viral (500+ views)
  NO_TRAFFIC_DAYS: 30       // Alert when post has 0 views after 30 days
};

class AlertSystem {
  constructor() {
    this.alerts = [];
  }

  addAlert(type, severity, post, message, action) {
    this.alerts.push({
      type,
      severity, // 'critical', 'warning', 'success'
      post: post.slug,
      title: post.title,
      message,
      action,
      timestamp: new Date().toISOString()
    });
  }

  async checkPerformance() {
    console.log('\n🔔 Checking Performance Alerts...\n');
    console.log('━'.repeat(60));

    // Load performance data
    const reportPath = path.join(projectRoot, 'automation/performance-report.json');
    const report = JSON.parse(await fs.readFile(reportPath, 'utf-8'));

    // Check each post
    for (const post of report.posts) {
      // Success: High traffic
      if (post.analytics?.pageviews >= THRESHOLDS.VIRAL_POST) {
        this.addAlert(
          'VIRAL_POST',
          'success',
          post,
          `🚀 Post is going viral! ${post.analytics.pageviews} views!`,
          'Share on social media, add CTAs for lead capture, consider follow-up content'
        );
      } else if (post.analytics?.pageviews >= THRESHOLDS.HIGH_TRAFFIC) {
        this.addAlert(
          'HIGH_TRAFFIC',
          'success',
          post,
          `📈 Post reached ${post.analytics.pageviews} views`,
          'Optimize for conversions, add related content links, consider updating with fresh data'
        );
      }

      // Warning: Low engagement
      if (post.analytics?.hasData && post.analytics.engagementRate < THRESHOLDS.LOW_ENGAGEMENT) {
        this.addAlert(
          'LOW_ENGAGEMENT',
          'warning',
          post,
          `⚠️ Low engagement rate: ${post.analytics.engagementRate}%`,
          'Add CTAs, internal links, images, or interactive elements to boost engagement'
        );
      }

      // Warning: High bounce rate
      if (post.analytics?.bounceRate > THRESHOLDS.HIGH_BOUNCE && post.analytics?.pageviews > 5) {
        this.addAlert(
          'HIGH_BOUNCE',
          'warning',
          post,
          `⚠️ High bounce rate: ${post.analytics.bounceRate}%`,
          'Improve content introduction, add related posts section, check page load speed'
        );
      }

      // Critical: No traffic after 30 days
      if (post.daysSince >= THRESHOLDS.NO_TRAFFIC_DAYS &&
          (!post.analytics || post.analytics.pageviews === 0)) {
        this.addAlert(
          'NO_TRAFFIC',
          'critical',
          post,
          `🚨 Post has 0 views after ${post.daysSince} days`,
          'Check indexing, optimize title/meta, build backlinks, share on social media'
        );
      }

      // Opportunity: Good ranking potential
      if (post.searchConsole?.position > 5 &&
          post.searchConsole?.position <= THRESHOLDS.RANKING_OPPORTUNITY &&
          post.searchConsole?.impressions > 50) {
        this.addAlert(
          'RANKING_OPPORTUNITY',
          'success',
          post,
          `🎯 Ranking opportunity at position ${Math.round(post.searchConsole.position)}`,
          'Small optimizations could move this to page 1! Add internal links, expand content, improve title tag'
        );
      }

      // Warning: Quality issues
      if (post.wordCount < 1500) {
        this.addAlert(
          'LOW_WORD_COUNT',
          'warning',
          post,
          `📝 Low word count: ${post.wordCount} words`,
          'Expand to 1500+ words for better SEO performance'
        );
      }

      if (post.quality.internalLinks === 0) {
        this.addAlert(
          'NO_INTERNAL_LINKS',
          'warning',
          post,
          `🔗 No internal links`,
          'Add 3-5 relevant internal links to improve SEO and user engagement'
        );
      }
    }

    return this.alerts;
  }

  async sendEmailAlerts(alerts) {
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
      console.log('\n📧 Email not configured. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS in .env.local\n');
      return;
    }

    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const critical = alerts.filter(a => a.severity === 'critical');
    const warnings = alerts.filter(a => a.severity === 'warning');
    const successes = alerts.filter(a => a.severity === 'success');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .alert { margin: 20px 0; padding: 15px; border-radius: 5px; }
    .critical { background: #fee; border-left: 4px solid #c00; }
    .warning { background: #ffc; border-left: 4px solid #fa0; }
    .success { background: #efe; border-left: 4px solid #0a0; }
    .alert-title { font-weight: bold; margin-bottom: 5px; }
    .action { margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 3px; }
  </style>
</head>
<body>
  <h2>🔔 Blog Performance Alerts</h2>
  <p>Generated: ${new Date().toLocaleString()}</p>

  ${critical.length > 0 ? `
  <h3>🚨 Critical Issues (${critical.length})</h3>
  ${critical.map(a => `
    <div class="alert critical">
      <div class="alert-title">${a.message}</div>
      <div>Post: ${a.title}</div>
      <div class="action"><strong>Action:</strong> ${a.action}</div>
    </div>
  `).join('')}
  ` : ''}

  ${warnings.length > 0 ? `
  <h3>⚠️ Warnings (${warnings.length})</h3>
  ${warnings.map(a => `
    <div class="alert warning">
      <div class="alert-title">${a.message}</div>
      <div>Post: ${a.title}</div>
      <div class="action"><strong>Action:</strong> ${a.action}</div>
    </div>
  `).join('')}
  ` : ''}

  ${successes.length > 0 ? `
  <h3>🎉 Wins & Opportunities (${successes.length})</h3>
  ${successes.map(a => `
    <div class="alert success">
      <div class="alert-title">${a.message}</div>
      <div>Post: ${a.title}</div>
      <div class="action"><strong>Action:</strong> ${a.action}</div>
    </div>
  `).join('')}
  ` : ''}
</body>
</html>
    `;

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: process.env.EMAIL_TO || process.env.EMAIL_USER,
        subject: `Blog Performance: ${critical.length} Critical, ${warnings.length} Warnings, ${successes.length} Wins`,
        html
      });

      console.log('✅ Email alert sent successfully\n');
    } catch (err) {
      console.error('❌ Failed to send email:', err.message);
    }
  }

  async sendSlackAlert(alerts) {
    if (!process.env.SLACK_WEBHOOK_URL) {
      console.log('📱 Slack not configured. Set SLACK_WEBHOOK_URL in .env.local\n');
      return;
    }

    const critical = alerts.filter(a => a.severity === 'critical');
    const warnings = alerts.filter(a => a.severity === 'warning');
    const successes = alerts.filter(a => a.severity === 'success');

    const text = `*Blog Performance Alerts* 🔔

*Critical:* ${critical.length} | *Warnings:* ${warnings.length} | *Wins:* ${successes.length}

${critical.length > 0 ? `*🚨 Critical Issues:*\n${critical.map(a => `• ${a.message}\n  _${a.title}_\n  → ${a.action}`).join('\n\n')}` : ''}

${warnings.length > 0 ? `\n*⚠️ Warnings:*\n${warnings.slice(0, 3).map(a => `• ${a.message}\n  _${a.title}_`).join('\n\n')}` : ''}

${successes.length > 0 ? `\n*🎉 Wins:*\n${successes.slice(0, 3).map(a => `• ${a.message}\n  _${a.title}_`).join('\n\n')}` : ''}
`;

    try {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      console.log('✅ Slack alert sent successfully\n');
    } catch (err) {
      console.error('❌ Failed to send Slack alert:', err.message);
    }
  }

  printAlerts() {
    const critical = this.alerts.filter(a => a.severity === 'critical');
    const warnings = this.alerts.filter(a => a.severity === 'warning');
    const successes = this.alerts.filter(a => a.severity === 'success');

    if (critical.length > 0) {
      console.log('\n🚨 CRITICAL ALERTS\n');
      critical.forEach(a => {
        console.log(`   ${a.message}`);
        console.log(`   Post: ${a.title}`);
        console.log(`   Action: ${a.action}\n`);
      });
    }

    if (warnings.length > 0) {
      console.log('━'.repeat(60));
      console.log('\n⚠️  WARNINGS\n');
      warnings.forEach(a => {
        console.log(`   ${a.message}`);
        console.log(`   Post: ${a.title}`);
        console.log(`   Action: ${a.action}\n`);
      });
    }

    if (successes.length > 0) {
      console.log('━'.repeat(60));
      console.log('\n🎉 WINS & OPPORTUNITIES\n');
      successes.forEach(a => {
        console.log(`   ${a.message}`);
        console.log(`   Post: ${a.title}`);
        console.log(`   Action: ${a.action}\n`);
      });
    }

    if (this.alerts.length === 0) {
      console.log('\n✅ No alerts - everything looks good!\n');
    }

    console.log('━'.repeat(60));
    console.log(`\nTotal alerts: ${this.alerts.length} (${critical.length} critical, ${warnings.length} warnings, ${successes.length} wins)\n`);
  }

  async save() {
    const alertsPath = path.join(projectRoot, 'automation/performance-alerts.json');
    await fs.writeFile(alertsPath, JSON.stringify({
      generatedAt: new Date().toISOString(),
      summary: {
        total: this.alerts.length,
        critical: this.alerts.filter(a => a.severity === 'critical').length,
        warnings: this.alerts.filter(a => a.severity === 'warning').length,
        successes: this.alerts.filter(a => a.severity === 'success').length
      },
      alerts: this.alerts
    }, null, 2));

    console.log(`✅ Alerts saved to: automation/performance-alerts.json\n`);
  }
}

async function runAlerts() {
  const alertSystem = new AlertSystem();
  const alerts = await alertSystem.checkPerformance();

  alertSystem.printAlerts();
  await alertSystem.save();

  // Send notifications if configured
  if (process.env.EMAIL_HOST && alerts.length > 0) {
    await alertSystem.sendEmailAlerts(alerts);
  }

  if (process.env.SLACK_WEBHOOK_URL && alerts.length > 0) {
    await alertSystem.sendSlackAlert(alerts);
  }

  console.log('━'.repeat(60) + '\n');
}

runAlerts().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
