#!/usr/bin/env node

/**
 * Send notifications about blog post generation results
 * Supports: Slack, Gmail, Email
 */

import nodemailer from 'nodemailer';

const STATUS = process.env.STATUS || 'unknown';
const POST_TITLE = process.env.POST_TITLE || 'Unknown Post';
const POST_URL = process.env.POST_URL || '';
const SLUG = process.env.SLUG || '';
const WORD_COUNT = process.env.WORD_COUNT || '0';
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || '';
const GITHUB_RUN_ID = process.env.GITHUB_RUN_ID || '';
const GITHUB_SERVER_URL = process.env.GITHUB_SERVER_URL || 'https://github.com';

async function sendNotification() {
  try {
    console.log('\n📣 Sending notifications...\n');

    const workflowUrl = GITHUB_REPOSITORY && GITHUB_RUN_ID
      ? `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`
      : '';

    // Send to Discord
    if (process.env.DISCORD_WEBHOOK_URL) {
      await sendDiscordNotification(workflowUrl);
    } else {
      console.log('⚠️  No DISCORD_WEBHOOK_URL configured, skipping Discord notification');
    }

    // Send to Slack
    if (process.env.SLACK_WEBHOOK_URL) {
      await sendSlackNotification(workflowUrl);
    } else {
      console.log('⚠️  No SLACK_WEBHOOK_URL configured, skipping Slack notification');
    }

    // Send Email notifications
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      await sendEmailNotification(workflowUrl);
    } else {
      console.log('⚠️  Gmail credentials not configured, skipping email notification');
    }

    console.log('✅ Notifications sent\n');

  } catch (error) {
    console.error('❌ Failed to send notification:', error.message);
    // Don't fail the workflow if notifications fail
    console.warn('⚠️  Continuing anyway (notifications are non-critical)\n');
  }
}

/**
 * Send Discord notification with rich embed
 */
async function sendDiscordNotification(workflowUrl) {
  const webhook = process.env.DISCORD_WEBHOOK_URL;

  if (!webhook) return;

  console.log('📤 Sending Discord notification...');

  const embed = STATUS === 'success'
    ? {
        title: '✅ New Blog Post Published!',
        description: POST_TITLE,
        color: 0x3b82f6, // Blue
        fields: [
          {
            name: '📊 Word Count',
            value: `${WORD_COUNT} words`,
            inline: true
          },
          {
            name: '📂 Category',
            value: SLUG.split('-').slice(0, 2).join(' ').toUpperCase(),
            inline: true
          },
          {
            name: '⏱️ Status',
            value: '🔄 Building on Cloudflare...',
            inline: true
          },
          {
            name: '🔗 URL',
            value: POST_URL,
            inline: false
          }
        ],
        footer: {
          text: '🤖 Blog Automation Bot'
        },
        timestamp: new Date().toISOString()
      }
    : {
        title: '❌ Blog Post Generation Failed',
        description: POST_TITLE && POST_TITLE !== 'Unknown Post' ? `Failed to generate: ${POST_TITLE}` : 'Blog post generation workflow failed',
        color: 0xef4444, // Red
        fields: workflowUrl ? [
          {
            name: '🔍 Action Required',
            value: `[View Workflow Logs](${workflowUrl})`,
            inline: false
          }
        ] : [],
        footer: {
          text: '🤖 Blog Automation Alert'
        },
        timestamp: new Date().toISOString()
      };

  const payload = {
    username: 'Blog Bot',
    avatar_url: 'https://cdn-icons-png.flaticon.com/512/6134/6134346.png',
    embeds: [embed]
  };

  const response = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Discord API error: ${response.statusText}`);
  }

  console.log('   ✓ Discord notification sent');
}

/**
 * Send Slack notification with rich formatting
 */
async function sendSlackNotification(workflowUrl) {
  const webhook = process.env.SLACK_WEBHOOK_URL;

  if (!webhook) return;

  console.log('📤 Sending Slack notification...');

  const payload = STATUS === 'success'
    ? buildSuccessMessage(workflowUrl)
    : buildErrorMessage(workflowUrl);

  const response = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Slack API error: ${response.statusText}`);
  }

  console.log('   ✓ Slack notification sent');
}

/**
 * Build success message for Slack
 */
function buildSuccessMessage(workflowUrl) {
  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '✅ New Blog Post Published!',
          emoji: true
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Title:*\n${POST_TITLE}`
          },
          {
            type: 'mrkdwn',
            text: `*Word Count:*\n${WORD_COUNT} words`
          },
          {
            type: 'mrkdwn',
            text: `*Slug:*\n\`${SLUG}\``
          },
          {
            type: 'mrkdwn',
            text: `*Status:*\n:hourglass: Building...`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*URL:* ${POST_URL}\n\n:information_source: Post will be live in ~5 minutes after Cloudflare Pages completes the build.`
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Post',
              emoji: true
            },
            url: POST_URL,
            style: 'primary'
          },
          ...(workflowUrl ? [{
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Workflow',
              emoji: true
            },
            url: workflowUrl
          }] : [])
        ]
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `:robot_face: Generated by automated blog system • ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}`
          }
        ]
      }
    ]
  };
}

/**
 * Build error message for Slack
 */
function buildErrorMessage(workflowUrl) {
  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '❌ Blog Post Generation Failed',
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `:warning: *Blog post generation workflow failed*\n\nPlease check the workflow logs to see what went wrong.`
        }
      },
      ...(POST_TITLE && POST_TITLE !== 'Unknown Post' ? [{
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Attempted Topic:*\n${POST_TITLE}`
          }
        ]
      }] : []),
      {
        type: 'actions',
        elements: [
          ...(workflowUrl ? [{
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Logs',
              emoji: true
            },
            url: workflowUrl,
            style: 'danger'
          }] : [])
        ]
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `:robot_face: Automated blog system alert • ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}`
          }
        ]
      }
    ]
  };
}

/**
 * Send email notification via Gmail SMTP
 */
async function sendEmailNotification(workflowUrl) {
  console.log('📧 Sending Gmail notification...');

  try {
    // Create Gmail transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    const subject = STATUS === 'success'
      ? `✅ New Blog Post Published: ${POST_TITLE}`
      : `❌ Blog Post Generation Failed`;

    const htmlContent = STATUS === 'success'
      ? buildSuccessEmail(workflowUrl)
      : buildErrorEmail(workflowUrl);

    const textContent = STATUS === 'success'
      ? buildSuccessText(workflowUrl)
      : buildErrorText(workflowUrl);

    const mailOptions = {
      from: `"The Profit Platform Blog Bot" <${process.env.GMAIL_USER}>`,
      to: process.env.NOTIFICATION_EMAIL || process.env.GMAIL_USER,
      subject: subject,
      text: textContent,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log('   ✓ Gmail notification sent');

  } catch (error) {
    console.error('   ✗ Failed to send Gmail notification:', error.message);
    throw error;
  }
}

/**
 * Build success email HTML
 */
function buildSuccessEmail(workflowUrl) {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
    .button:hover { background: #2563eb; }
    .stats { background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; }
    .stat-item { display: inline-block; margin: 0 20px 10px 0; }
    .stat-label { color: #6b7280; font-size: 0.875rem; }
    .stat-value { font-weight: 600; font-size: 1.125rem; color: #1f2937; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">✅ New Blog Post Published!</h1>
    </div>
    <div class="content">
      <h2 style="color: #1f2937; margin-top: 0;">${POST_TITLE}</h2>

      <div class="stats">
        <div class="stat-item">
          <div class="stat-label">Word Count</div>
          <div class="stat-value">${WORD_COUNT} words</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Slug</div>
          <div class="stat-value">${SLUG}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Status</div>
          <div class="stat-value">⏳ Building...</div>
        </div>
      </div>

      <p><strong>URL:</strong> <a href="${POST_URL}" style="color: #3b82f6;">${POST_URL}</a></p>

      <p style="background: #dbeafe; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
        ℹ️ <strong>Note:</strong> Post will be live in ~5 minutes after Cloudflare Pages completes the build.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${POST_URL}" class="button">View Post</a>
        ${workflowUrl ? `<a href="${workflowUrl}" class="button" style="background: #6b7280;">View Workflow</a>` : ''}
      </div>
    </div>
    <div class="footer">
      🤖 Generated by automated blog system<br>
      ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney', dateStyle: 'full', timeStyle: 'short' })}
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Build error email HTML
 */
function buildErrorEmail(workflowUrl) {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
    .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
    .button:hover { background: #b91c1c; }
    .alert { background: #fef2f2; padding: 20px; border-radius: 6px; border-left: 4px solid #dc2626; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">❌ Blog Post Generation Failed</h1>
    </div>
    <div class="content">
      <div class="alert">
        <strong>⚠️ Warning:</strong> The blog post generation workflow failed.
      </div>

      ${POST_TITLE && POST_TITLE !== 'Unknown Post' ? `
      <p><strong>Attempted Topic:</strong><br>${POST_TITLE}</p>
      ` : ''}

      <p>Please check the workflow logs to see what went wrong and resolve the issue.</p>

      <div style="text-align: center; margin: 30px 0;">
        ${workflowUrl ? `<a href="${workflowUrl}" class="button">View Workflow Logs</a>` : ''}
      </div>
    </div>
    <div class="footer">
      🤖 Automated blog system alert<br>
      ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney', dateStyle: 'full', timeStyle: 'short' })}
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Build success email plain text version
 */
function buildSuccessText(workflowUrl) {
  return `
✅ NEW BLOG POST PUBLISHED!

Title: ${POST_TITLE}
Word Count: ${WORD_COUNT} words
Slug: ${SLUG}
Status: ⏳ Building...

URL: ${POST_URL}

ℹ️ Note: Post will be live in ~5 minutes after Cloudflare Pages completes the build.

View Post: ${POST_URL}
${workflowUrl ? `View Workflow: ${workflowUrl}` : ''}

---
🤖 Generated by automated blog system
${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney', dateStyle: 'full', timeStyle: 'short' })}
  `;
}

/**
 * Build error email plain text version
 */
function buildErrorText(workflowUrl) {
  return `
❌ BLOG POST GENERATION FAILED

⚠️ Warning: The blog post generation workflow failed.

${POST_TITLE && POST_TITLE !== 'Unknown Post' ? `Attempted Topic: ${POST_TITLE}` : ''}

Please check the workflow logs to see what went wrong and resolve the issue.

${workflowUrl ? `View Workflow Logs: ${workflowUrl}` : ''}

---
🤖 Automated blog system alert
${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney', dateStyle: 'full', timeStyle: 'short' })}
  `;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  sendNotification();
}

export { sendNotification };
