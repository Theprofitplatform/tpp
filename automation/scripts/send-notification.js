#!/usr/bin/env node

/**
 * Notification Sender
 * Sends email/Slack notifications for blog automation
 */

import nodemailer from 'nodemailer';

const STATUS = process.env.STATUS || 'success';
const POST_TITLE = process.env.POST_TITLE || 'Unknown';
const POST_URL = process.env.POST_URL || '';
const WORD_COUNT = process.env.WORD_COUNT || 'Unknown';
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || '';
const GITHUB_RUN_ID = process.env.GITHUB_RUN_ID || '';
const GITHUB_SERVER_URL = process.env.GITHUB_SERVER_URL || 'https://github.com';

console.log(`📧 Sending ${STATUS} notification...\n`);

/**
 * Send email notification
 */
async function sendEmail() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD || !process.env.NOTIFICATION_EMAIL) {
    console.log('⚠️  Email credentials not configured - skipping email');
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    const subject = STATUS === 'success'
      ? `✅ Blog Post Published: ${POST_TITLE}`
      : `❌ Blog Automation Failed`;

    const htmlBody = STATUS === 'success' ? `
      <h2>Blog Post Published Successfully</h2>
      <p><strong>Title:</strong> ${POST_TITLE}</p>
      <p><strong>Word Count:</strong> ${WORD_COUNT}</p>
      <p><strong>URL:</strong> <a href="${POST_URL}">${POST_URL}</a></p>
      <p><strong>Status:</strong> Post will be live in ~5 minutes after Cloudflare build</p>
      <hr>
      <p><small>Workflow: <a href="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}">View Run</a></small></p>
    ` : `
      <h2>Blog Automation Failed</h2>
      <p><strong>Topic:</strong> ${POST_TITLE}</p>
      <p><strong>Status:</strong> Failed to generate or publish</p>
      <p><strong>Action Required:</strong> Check workflow logs</p>
      <hr>
      <p><small>Workflow: <a href="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}">View Run</a></small></p>
    `;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: process.env.NOTIFICATION_EMAIL,
      subject,
      html: htmlBody
    });

    console.log('✅ Email notification sent');
    return true;

  } catch (error) {
    console.error('❌ Email error:', error.message);
    return false;
  }
}

/**
 * Send Slack notification
 */
async function sendSlack() {
  if (!process.env.SLACK_WEBHOOK_URL) {
    console.log('⚠️  Slack webhook not configured - skipping Slack');
    return false;
  }

  try {
    const message = STATUS === 'success' ? {
      text: `✅ Blog Post Published`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "✅ Blog Post Published"
          }
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Title:*\n${POST_TITLE}` },
            { type: "mrkdwn", text: `*Word Count:*\n${WORD_COUNT}` }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*URL:* <${POST_URL}|View Post>`
          }
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `<${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}|View Workflow Run>`
            }
          ]
        }
      ]
    } : {
      text: `❌ Blog Automation Failed: ${POST_TITLE}`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "❌ Blog Automation Failed"
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Topic:* ${POST_TITLE}\n*Action Required:* Check workflow logs`
          }
        },
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `<${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}|View Workflow Run>`
            }
          ]
        }
      ]
    };

    const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });

    if (response.ok) {
      console.log('✅ Slack notification sent');
      return true;
    } else {
      console.error('❌ Slack error:', response.status);
      return false;
    }

  } catch (error) {
    console.error('❌ Slack error:', error.message);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  const results = await Promise.allSettled([
    sendEmail(),
    sendSlack()
  ]);

  const anySuccess = results.some(r => r.status === 'fulfilled' && r.value === true);

  if (anySuccess) {
    console.log('\n✅ Notifications sent successfully\n');
  } else {
    console.log('\n⚠️  No notifications sent (not configured)\n');
  }

  // Don't fail workflow if notifications fail
  process.exit(0);
}

main();
