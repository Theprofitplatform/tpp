/**
 * NotificationManager - Sends notifications via various channels
 */

import axios from 'axios';
import { logger } from '../utils/logger.js';

export class NotificationManager {
  constructor(config) {
    this.config = config;
  }

  async sendNotifications(results) {
    const notifications = this.config.notifications;

    if (!notifications.enabled) {
      return;
    }

    const message = this.formatMessage(results);

    const promises = [];

    if (notifications.channels.slack?.enabled) {
      promises.push(this.sendSlack(message, results));
    }

    if (notifications.channels.email?.enabled) {
      promises.push(this.sendEmail(message, results));
    }

    if (notifications.channels.webhook?.enabled) {
      promises.push(this.sendWebhook(message, results));
    }

    try {
      await Promise.all(promises);
      logger.success('Notifications sent successfully');
    } catch (error) {
      logger.error('Failed to send notifications:', error);
    }
  }

  formatMessage(results) {
    const status = results.summary.status === 'PASS' ? '✅' : '⚠️';

    return {
      title: `${status} Visual Quality Report - ${results.url}`,
      timestamp: results.timestamp,
      summary: {
        status: results.summary.status,
        totalIssues: results.summary.totalIssues,
        totalFixes: results.summary.totalFixes,
        issuesBySeverity: results.summary.issuesBySeverity,
        issuesByCategory: results.summary.issuesByCategory
      },
      url: results.url,
      runId: results.runId
    };
  }

  async sendSlack(message, results) {
    try {
      const webhookUrl = this.config.notifications.channels.slack.webhookUrl;

      const slackMessage = {
        text: message.title,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: message.title
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Status:*\n${message.summary.status}`
              },
              {
                type: 'mrkdwn',
                text: `*Total Issues:*\n${message.summary.totalIssues}`
              },
              {
                type: 'mrkdwn',
                text: `*Total Fixes:*\n${message.summary.totalFixes}`
              },
              {
                type: 'mrkdwn',
                text: `*Run ID:*\n${message.runId}`
              }
            ]
          }
        ]
      };

      if (message.summary.totalIssues > 0) {
        const severityText = Object.entries(message.summary.issuesBySeverity)
          .map(([sev, count]) => `${sev}: ${count}`)
          .join(' | ');

        slackMessage.blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Issues by Severity:*\n${severityText}`
          }
        });
      }

      await axios.post(webhookUrl, slackMessage);
      logger.debug('Slack notification sent');

    } catch (error) {
      logger.error('Slack notification failed:', error.message);
    }
  }

  async sendEmail(message, results) {
    try {
      // Note: This requires nodemailer to be installed
      // Placeholder for email implementation
      logger.warn('Email notifications not yet implemented');

      // const nodemailer = require('nodemailer');
      // const transporter = nodemailer.createTransporter(this.config.notifications.channels.email.smtp);
      // await transporter.sendMail({
      //   from: this.config.notifications.channels.email.from,
      //   to: this.config.notifications.channels.email.to,
      //   subject: message.title,
      //   html: this.generateEmailHtml(message, results)
      // });

    } catch (error) {
      logger.error('Email notification failed:', error.message);
    }
  }

  async sendWebhook(message, results) {
    try {
      const webhookUrl = this.config.notifications.channels.webhook.url;
      const method = this.config.notifications.channels.webhook.method || 'POST';

      await axios({
        method: method,
        url: webhookUrl,
        data: {
          message,
          results: {
            runId: results.runId,
            timestamp: results.timestamp,
            url: results.url,
            summary: results.summary,
            issues: results.issues,
            fixes: results.fixes
          }
        }
      });

      logger.debug('Webhook notification sent');

    } catch (error) {
      logger.error('Webhook notification failed:', error.message);
    }
  }
}
