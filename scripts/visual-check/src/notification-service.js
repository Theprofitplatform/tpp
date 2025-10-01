/**
 * Notification Service
 *
 * Sends notifications via Slack, Email, or Webhooks
 * when issues are detected or status changes occur.
 */

import axios from 'axios';
import chalk from 'chalk';
import nodemailer from 'nodemailer';

export class NotificationService {
  constructor(config) {
    this.config = config;
  }

  /**
   * Send notification to all enabled channels
   */
  async send(data) {
    const promises = [];

    if (this.config.slack?.enabled) {
      promises.push(this.sendSlack(data));
    }

    if (this.config.webhook?.enabled) {
      promises.push(this.sendWebhook(data));
    }

    if (this.config.email?.enabled) {
      promises.push(this.sendEmail(data));
    }

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error(chalk.red('Notification error:'), error.message);
    }
  }

  /**
   * Send Slack notification
   */
  async sendSlack(data) {
    if (!this.config.slack.webhookUrl) return;

    const message = this.formatSlackMessage(data);

    try {
      await axios.post(this.config.slack.webhookUrl, message);
      console.log(chalk.gray('  📱 Slack notification sent'));
    } catch (error) {
      console.error(chalk.red('  ❌ Slack notification failed:'), error.message);
    }
  }

  /**
   * Send webhook notification
   */
  async sendWebhook(data) {
    if (!this.config.webhook.url) return;

    try {
      await axios.post(this.config.webhook.url, {
        event: 'visual_check',
        ...data
      });
      console.log(chalk.gray('  🔗 Webhook notification sent'));
    } catch (error) {
      console.error(chalk.red('  ❌ Webhook notification failed:'), error.message);
    }
  }

  /**
   * Send email notification
   */
  async sendEmail(data) {
    if (!this.config.email?.to) {
      console.log(chalk.yellow('  📧 Email notification skipped (no recipient)'));
      return;
    }

    try {
      // Create transporter
      const transporter = nodemailer.createTransport({
        host: this.config.email.smtp?.host || 'smtp.gmail.com',
        port: this.config.email.smtp?.port || 587,
        secure: this.config.email.smtp?.secure || false,
        auth: this.config.email.smtp?.auth?.user ? {
          user: this.config.email.smtp.auth.user,
          pass: this.config.email.smtp.auth.pass
        } : undefined
      });

      // Format email body
      const emailBody = this.formatEmailBody(data);

      // Send email
      await transporter.sendMail({
        from: this.config.email.from || 'visual-agent@theprofitplatform.com.au',
        to: this.config.email.to,
        subject: this.config.email.subject || `Visual Quality Alert - ${data.totalIssues} Issues Found`,
        text: emailBody.text,
        html: emailBody.html
      });

      console.log(chalk.green(`  ✅ Email sent to ${this.config.email.to}`));
    } catch (error) {
      console.error(chalk.red('  ❌ Email notification failed:'), error.message);
      console.error(chalk.gray('     Make sure SMTP credentials are configured'));
    }
  }

  /**
   * Format email body
   */
  formatEmailBody(data) {
    // Get issue summary by category
    const issuesByCategory = this.groupIssuesByCategory(data);
    const topFixes = this.getTopFixes(data);

    const text = `
Visual Quality Agent Report
===========================

URL: ${data.url}
Timestamp: ${data.timestamp}
Issues Found: ${data.totalIssues}
Fixes Generated: ${data.fixes || 0}

${data.comparison ? `
Status Change: ${data.comparison.status}
Issue Delta: ${data.comparison.issuesDelta > 0 ? '+' : ''}${data.comparison.issuesDelta}
` : ''}

ISSUES SUMMARY:
${this.formatIssuesSummaryText(issuesByCategory)}

TOP RECOMMENDED FIXES:
${this.formatTopFixesText(topFixes)}

Report Location: ${data.reportPath}

---
This is an automated message from Visual Quality Agent
Running on: ${data.url}
`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 8px; text-align: center; }
    .header h2 { margin: 0; font-size: 24px; }
    .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .stats { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .stat-row { display: flex; justify-content: space-between; margin: 12px 0; padding: 8px 0; border-bottom: 1px solid #e0e0e0; }
    .stat-row:last-child { border-bottom: none; }
    .section { margin: 25px 0; }
    .section-title { background: #e9ecef; padding: 12px; border-radius: 6px; font-weight: bold; color: #495057; margin-bottom: 15px; }
    .issue-item { background: #fff; border-left: 4px solid #dc3545; padding: 12px; margin: 10px 0; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .fix-item { background: #fff; border-left: 4px solid #28a745; padding: 12px; margin: 10px 0; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
    .badge-critical { background: #dc3545; color: white; }
    .badge-high { background: #fd7e14; color: white; }
    .badge-medium { background: #ffc107; color: #333; }
    .badge-low { background: #6c757d; color: white; }
    .confidence { float: right; font-weight: bold; }
    .confidence-high { color: #28a745; }
    .confidence-medium { color: #ffc107; }
    .confidence-low { color: #dc3545; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0; color: #666; font-size: 12px; text-align: center; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>⚠️ Visual Quality Alert</h2>
      <p style="margin: 10px 0 0 0;">Issues detected on your website</p>
    </div>

    <div class="alert">
      <strong>🌐 URL:</strong> ${data.url}<br>
      <strong>🕒 Timestamp:</strong> ${new Date(data.timestamp).toLocaleString()}
    </div>

    <div class="stats">
      <div class="stat-row">
        <strong>Issues Found:</strong>
        <span style="color: ${data.totalIssues > 0 ? '#dc3545' : '#28a745'}; font-size: 20px; font-weight: bold;">${data.totalIssues}</span>
      </div>
      <div class="stat-row">
        <strong>Fixes Generated:</strong>
        <span style="color: #007bff; font-size: 20px; font-weight: bold;">${data.fixes || 0}</span>
      </div>
      ${data.comparison ? `
      <div class="stat-row">
        <strong>Status:</strong>
        <span style="text-transform: capitalize; font-weight: bold;">${data.comparison.status}</span>
      </div>
      <div class="stat-row">
        <strong>Issue Delta:</strong>
        <span style="color: ${data.comparison.issuesDelta > 0 ? '#dc3545' : '#28a745'}; font-weight: bold;">
          ${data.comparison.issuesDelta > 0 ? '+' : ''}${data.comparison.issuesDelta}
        </span>
      </div>
      ` : ''}
    </div>

    ${this.formatIssuesSummaryHTML(issuesByCategory)}

    ${this.formatTopFixesHTML(topFixes)}

    <div class="section">
      <p style="text-align: center; margin: 25px 0;">
        <strong>📁 Full Report:</strong><br>
        <code style="background: #f8f9fa; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-top: 8px;">${data.reportPath}</code>
      </p>
    </div>

    <div class="footer">
      <p><strong>🤖 Visual Quality Agent</strong></p>
      <p>Autonomous monitoring for ${data.url}</p>
      <p style="margin-top: 15px; color: #999;">This is an automated message • Next check in 15 minutes</p>
    </div>
  </div>
</body>
</html>
`;

    return { text, html };
  }

  /**
   * Group issues by page and category
   */
  groupIssuesByCategory(data) {
    if (!data.issueDetails || data.issueDetails.length === 0) {
      return [];
    }

    // First group by page
    const byPage = {};
    data.issueDetails.forEach(issue => {
      const page = issue.page || issue.fullUrl || '/';
      if (!byPage[page]) {
        byPage[page] = {};
      }

      const category = issue.category || 'Other';
      if (!byPage[page][category]) {
        byPage[page][category] = [];
      }
      byPage[page][category].push(issue);
    });

    // Convert to array format
    return Object.entries(byPage).map(([page, categories]) => ({
      page,
      categories: Object.entries(categories).map(([category, issues]) => ({
        category,
        count: issues.length,
        issues: issues // Show ALL issues
      }))
    }));
  }

  /**
   * Get all fixes sorted by priority
   */
  getTopFixes(data) {
    if (!data.fixDetails || data.fixDetails.length === 0) {
      return [];
    }

    return data.fixDetails
      .sort((a, b) => {
        // Sort by priority (critical > high > medium > low) then confidence
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = (priorityOrder[a.priority] || 999) - (priorityOrder[b.priority] || 999);
        if (priorityDiff !== 0) return priorityDiff;
        return (b.confidence || 0) - (a.confidence || 0);
      }); // Show ALL fixes sorted by priority
  }

  /**
   * Format issues summary for text email
   */
  formatIssuesSummaryText(issuesByPage) {
    if (issuesByPage.length === 0) {
      return '  No issues found!';
    }

    let text = '';
    issuesByPage.forEach(({ page, categories }) => {
      text += `\n📄 ${page}:\n`;
      categories.forEach(({ category, count, issues }) => {
        text += `  ${category.toUpperCase()} (${count} issues):\n`;
        issues.forEach(issue => {
          text += `    • ${issue.description || issue.type}\n`;
        });
      });
    });
    return text;
  }

  /**
   * Format top fixes for text email
   */
  formatTopFixesText(topFixes) {
    if (topFixes.length === 0) {
      return '  No fixes available';
    }

    let text = '';
    topFixes.forEach((fix, idx) => {
      text += `\n${idx + 1}. ${fix.description}\n`;
      text += `   Priority: ${fix.priority} | Confidence: ${fix.confidence}%\n`;
    });
    return text;
  }

  /**
   * Format issues summary for HTML email
   */
  formatIssuesSummaryHTML(issuesByPage) {
    if (issuesByPage.length === 0) {
      return '<div class="section"><p style="text-align: center; color: #28a745;">✅ No issues found!</p></div>';
    }

    let html = '<div class="section"><div class="section-title">📋 Issues Summary by Page</div>';

    issuesByPage.forEach(({ page, categories }) => {
      html += `<div style="margin-bottom: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
        <h3 style="margin: 0 0 15px 0; color: #007bff; font-size: 18px;">📄 ${page}</h3>`;

      categories.forEach(({ category, count, issues }) => {
        html += `<div style="margin-bottom: 15px;">
          <h4 style="margin: 10px 0; color: #495057;">${category} <span style="color: #6c757d; font-size: 14px;">(${count} total)</span></h4>`;

        issues.forEach(issue => {
          const priority = issue.priority || issue.severity || 'medium';
          html += `<div class="issue-item">
            <span class="badge badge-${priority}">${priority}</span>
            <div style="margin-top: 8px;">${issue.description || issue.message || issue.type}</div>
          </div>`;
        });

        html += '</div>';
      });

      html += '</div>';
    });

    html += '</div>';
    return html;
  }

  /**
   * Format top fixes for HTML email
   */
  formatTopFixesHTML(topFixes) {
    if (topFixes.length === 0) {
      return '';
    }

    let html = '<div class="section"><div class="section-title">💡 All Recommended Fixes</div>';

    topFixes.forEach((fix, idx) => {
      const confidenceClass = fix.confidence >= 80 ? 'high' : fix.confidence >= 60 ? 'medium' : 'low';
      html += `<div class="fix-item">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="badge badge-${fix.priority}">${fix.priority}</span>
          <span class="confidence confidence-${confidenceClass}">${fix.confidence}% confidence</span>
        </div>
        <div style="margin-top: 10px;">
          <strong>${idx + 1}. ${fix.description}</strong>
        </div>
        ${fix.instructions ? `
        <div style="margin-top: 8px; font-size: 13px; color: #6c757d;">
          ${Array.isArray(fix.instructions) ? fix.instructions[0] : fix.instructions}
        </div>
        ` : ''}
      </div>`;
    });

    html += '</div>';
    return html;
  }

  /**
   * Format Slack message
   */
  formatSlackMessage(data) {
    const emoji = data.type === 'issues_found' ? '⚠️' :
                  data.type === 'error' ? '❌' : 'ℹ️';

    let text = `${emoji} *Visual Quality Agent Report*\n\n`;

    if (data.type === 'issues_found') {
      text += `*URL:* ${data.url}\n`;
      text += `*Issues Found:* ${data.totalIssues}\n`;
      text += `*Fixes Generated:* ${data.fixes}\n`;

      if (data.comparison) {
        const statusEmoji = data.comparison.status === 'improved' ? '✅' :
                          data.comparison.status === 'degraded' ? '⚠️' : '➡️';
        text += `*Status:* ${statusEmoji} ${data.comparison.status}\n`;
        text += `*Issue Delta:* ${data.comparison.issuesDelta > 0 ? '+' : ''}${data.comparison.issuesDelta}\n`;
      }

      text += `\n_${data.timestamp}_`;
    } else if (data.type === 'error') {
      text += `*Error:* ${data.error}\n`;
      text += `_${data.timestamp}_`;
    }

    return {
      text,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text
          }
        }
      ]
    };
  }
}