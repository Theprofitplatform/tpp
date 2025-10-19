#!/usr/bin/env node

/**
 * Automated Review Request System
 * Sends personalized review requests via email
 * Tracks responses and follows up automatically
 */

import fs from 'fs/promises';
import path from 'path';

const CONFIG = {
  // Your Google Review Link
  googleReviewUrl: 'https://g.page/r/YOUR_PLACE_ID/review', // Replace with your actual link

  // Email settings (configure with your email service)
  emailSettings: {
    from: 'avi@theprofitplatform.com.au',
    replyTo: 'avi@theprofitplatform.com.au',
    signature: 'Avi & The Profit Platform Team'
  },

  // Timing
  daysAfterService: 7, // Send request 7 days after service completion
  followUpDays: 7, // Send follow-up if no response after 7 days
  maxFollowUps: 1, // Don't spam people

  // Tracking
  trackingFile: './automation/data/review-requests.json',
  clientsFile: './automation/data/clients.json', // Your client database
};

/**
 * Email templates
 */
const EMAIL_TEMPLATES = {
  initial: (clientName, projectType) => ({
    subject: `How was your experience with The Profit Platform?`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background: #f9f9f9; }
    .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌟 How did we do?</h1>
    </div>
    <div class="content">
      <p>Hi ${clientName},</p>

      <p>Thanks for trusting us with your ${projectType}. We hope you're seeing great results!</p>

      <p>If you have 60 seconds, we'd love to hear your feedback. Your honest review helps other Sydney businesses make informed decisions.</p>

      <p style="text-align: center;">
        <a href="${CONFIG.googleReviewUrl}" class="button">⭐ Leave a Google Review</a>
      </p>

      <p><strong>Why your review matters:</strong></p>
      <ul>
        <li>Helps other Sydney businesses find us</li>
        <li>We use feedback to improve our services</li>
        <li>Takes less than 60 seconds</li>
      </ul>

      <p><em>P.S. If anything wasn't up to standard, please reply to this email so we can make it right before you review.</em></p>

      <p>Thanks for your support!<br>
      ${CONFIG.emailSettings.signature}</p>
    </div>
    <div class="footer">
      <p>The Profit Platform | Sydney, NSW | 0487 286 451</p>
      <p><a href="https://theprofitplatform.com.au">theprofitplatform.com.au</a></p>
    </div>
  </div>
</body>
</html>
    `,
    text: `Hi ${clientName},

Thanks for trusting us with your ${projectType}. We hope you're seeing great results!

If you have 60 seconds, we'd love to hear your feedback:
${CONFIG.googleReviewUrl}

Your honest review helps other Sydney businesses make informed decisions.

P.S. If anything wasn't up to standard, please reply to this email so we can make it right.

Thanks for your support!
${CONFIG.emailSettings.signature}`
  }),

  followUp: (clientName) => ({
    subject: `Quick favor - your review would mean a lot`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { padding: 20px; }
    .button { display: inline-block; padding: 12px 25px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <p>Hi ${clientName},</p>

      <p>I know you're busy, so I'll keep this quick.</p>

      <p>If you had a positive experience with us, a brief Google review would mean the world to our small Sydney team.</p>

      <p style="text-align: center;">
        <a href="${CONFIG.googleReviewUrl}" class="button">Leave Review (60 seconds)</a>
      </p>

      <p>Thanks either way - we appreciate your business!</p>

      <p>${CONFIG.emailSettings.signature}</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `Hi ${clientName},

I know you're busy, so I'll keep this quick.

If you had a positive experience with us, a brief Google review would mean the world to our small Sydney team.

${CONFIG.googleReviewUrl}

Thanks either way - we appreciate your business!

${CONFIG.emailSettings.signature}`
  }),

  thankYou: (clientName, reviewSnippet) => ({
    subject: `Thank you for your review! 🙏`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .content { padding: 20px; }
    .quote { background: #f0f0f0; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; font-style: italic; }
  </style>
</head>
<body>
  <div class="container">
    <div class="content">
      <p>Hi ${clientName},</p>

      <p>Thanks so much for taking the time to leave us a review! It really means a lot to our small team.</p>

      <div class="quote">"${reviewSnippet}"</div>

      <p>We're committed to continuing to deliver great results for your business.</p>

      <p>If you ever need anything, you know where to find us!</p>

      <p>Warmest regards,<br>
      ${CONFIG.emailSettings.signature}</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `Hi ${clientName},

Thanks so much for taking the time to leave us a review! It really means a lot to our small team.

We're committed to continuing to deliver great results for your business.

If you ever need anything, you know where to find us!

Warmest regards,
${CONFIG.emailSettings.signature}`
  })
};

/**
 * Generate email queue based on client data
 */
async function generateEmailQueue() {
  console.log('📧 Generating Review Request Queue...\n');

  // Load clients (you'll need to populate this)
  let clients = [];
  try {
    const clientsData = await fs.readFile(CONFIG.clientsFile, 'utf-8');
    clients = JSON.parse(clientsData);
  } catch (error) {
    console.log('⚠️  No clients file found. Creating sample...');
    clients = [
      {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        projectType: 'SEO services',
        projectCompletionDate: '2025-01-15',
        status: 'active'
      },
      // Add more clients here
    ];
    await fs.mkdir(path.dirname(CONFIG.clientsFile), { recursive: true });
    await fs.writeFile(CONFIG.clientsFile, JSON.stringify(clients, null, 2));
  }

  // Load tracking data
  let tracking = [];
  try {
    const trackingData = await fs.readFile(CONFIG.trackingFile, 'utf-8');
    tracking = JSON.parse(trackingData);
  } catch (error) {
    console.log('⚠️  No tracking file found. Creating new...');
    await fs.mkdir(path.dirname(CONFIG.trackingFile), { recursive: true });
    tracking = [];
  }

  // Process clients
  const today = new Date();
  const emailQueue = [];

  for (const client of clients) {
    const completionDate = new Date(client.projectCompletionDate);
    const daysSinceCompletion = Math.floor((today - completionDate) / (1000 * 60 * 60 * 24));

    // Check if client already in tracking
    const existingRequest = tracking.find(t => t.clientId === client.id);

    if (!existingRequest && daysSinceCompletion >= CONFIG.daysAfterService) {
      // Send initial request
      emailQueue.push({
        clientId: client.id,
        clientName: client.name,
        clientEmail: client.email,
        emailType: 'initial',
        projectType: client.projectType,
        scheduledDate: today.toISOString().split('T')[0],
        status: 'pending'
      });

      // Add to tracking
      tracking.push({
        clientId: client.id,
        initialSentDate: today.toISOString().split('T')[0],
        followUpSentDate: null,
        reviewReceived: false,
        reviewDate: null,
        followUpCount: 0
      });

    } else if (existingRequest && !existingRequest.reviewReceived) {
      // Check if follow-up needed
      const initialSent = new Date(existingRequest.initialSentDate);
      const daysSinceInitial = Math.floor((today - initialSent) / (1000 * 60 * 60 * 24));

      if (daysSinceInitial >= CONFIG.followUpDays && existingRequest.followUpCount < CONFIG.maxFollowUps) {
        emailQueue.push({
          clientId: client.id,
          clientName: client.name,
          clientEmail: client.email,
          emailType: 'followUp',
          scheduledDate: today.toISOString().split('T')[0],
          status: 'pending'
        });

        // Update tracking
        existingRequest.followUpSentDate = today.toISOString().split('T')[0];
        existingRequest.followUpCount += 1;
      }
    }
  }

  // Save updated tracking
  await fs.writeFile(CONFIG.trackingFile, JSON.stringify(tracking, null, 2));

  return emailQueue;
}

/**
 * Generate email content for queue item
 */
function generateEmailContent(queueItem) {
  const template = queueItem.emailType === 'initial'
    ? EMAIL_TEMPLATES.initial(queueItem.clientName, queueItem.projectType || 'our services')
    : EMAIL_TEMPLATES.followUp(queueItem.clientName);

  return {
    to: queueItem.clientEmail,
    from: CONFIG.emailSettings.from,
    replyTo: CONFIG.emailSettings.replyTo,
    subject: template.subject,
    html: template.html,
    text: template.text
  };
}

/**
 * Export emails for manual sending or integration
 */
async function exportEmailQueue(queue) {
  const outputDir = './automation/generated/review-emails';
  await fs.mkdir(outputDir, { recursive: true });

  // Create individual email files
  for (const [index, item] of queue.entries()) {
    const emailContent = generateEmailContent(item);
    const filename = `${item.scheduledDate}-${item.emailType}-${item.clientId}.json`;
    const filepath = path.join(outputDir, filename);

    await fs.writeFile(filepath, JSON.stringify(emailContent, null, 2));
  }

  // Create CSV for import to email tool
  const csvHeaders = 'Client ID,Name,Email,Type,Subject,Scheduled Date,Status\n';
  const csvRows = queue.map(item => {
    const email = generateEmailContent(item);
    return `${item.clientId},"${item.clientName}","${item.clientEmail}","${item.emailType}","${email.subject}","${item.scheduledDate}","${item.status}"`;
  }).join('\n');

  const csvPath = path.join(outputDir, `review-email-queue-${new Date().toISOString().split('T')[0]}.csv`);
  await fs.writeFile(csvPath, csvHeaders + csvRows);

  // Create readable markdown
  let markdown = `# Review Request Email Queue\n\n`;
  markdown += `**Generated:** ${new Date().toLocaleString()}\n`;
  markdown += `**Total Emails:** ${queue.length}\n\n`;
  markdown += `---\n\n`;

  queue.forEach((item, idx) => {
    const email = generateEmailContent(item);
    markdown += `## ${idx + 1}. ${item.clientName} - ${item.emailType}\n\n`;
    markdown += `**To:** ${item.clientEmail}\n`;
    markdown += `**Subject:** ${email.subject}\n`;
    markdown += `**Scheduled:** ${item.scheduledDate}\n\n`;
    markdown += `**Email Content (Text Version):**\n`;
    markdown += `\`\`\`\n${email.text}\n\`\`\`\n\n`;
    markdown += `**Status:** [ ] Sent\n\n`;
    markdown += `---\n\n`;
  });

  const mdPath = path.join(outputDir, `review-email-queue-${new Date().toISOString().split('T')[0]}.md`);
  await fs.writeFile(mdPath, markdown);

  return { outputDir, csvPath, mdPath, count: queue.length };
}

/**
 * Integration guide
 */
function printIntegrationGuide() {
  console.log('\n📚 INTEGRATION OPTIONS:\n');

  console.log('OPTION 1: Manual (Copy-Paste)');
  console.log('  1. Open the generated Markdown file');
  console.log('  2. Copy each email when scheduled');
  console.log('  3. Send via your email client');
  console.log('  4. Check off when sent\n');

  console.log('OPTION 2: Gmail + Google Sheets + Zapier');
  console.log('  1. Upload CSV to Google Sheets');
  console.log('  2. Connect Sheets → Gmail via Zapier');
  console.log('  3. Trigger: New row in sheet');
  console.log('  4. Action: Send email from Gmail');
  console.log('  5. Filter by scheduled date\n');

  console.log('OPTION 3: Mailchimp/SendGrid/Postmark API');
  console.log('  1. Install email service package:');
  console.log('     npm install @sendgrid/mail');
  console.log('  2. Update this script with API key');
  console.log('  3. Uncomment sendEmail() function below');
  console.log('  4. Run as cron job daily\n');

  console.log('OPTION 4: Make.com Automation');
  console.log('  1. Connect Make.com to your CRM');
  console.log('  2. Set trigger: Project completion + 7 days');
  console.log('  3. Action: Send review request email');
  console.log('  4. Add follow-up after 7 days if no review\n');
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Review Request Automation\n');

  const queue = await generateEmailQueue();

  if (queue.length === 0) {
    console.log('✅ No emails to send today!');
    console.log('   All clients are either too recent or already requested.\n');
    return;
  }

  console.log(`📊 Found ${queue.length} emails to send:\n`);
  queue.forEach((item, idx) => {
    console.log(`   ${idx + 1}. ${item.clientName} (${item.emailType})`);
  });

  const files = await exportEmailQueue(queue);

  console.log(`\n💾 Exported to: ${files.outputDir}`);
  console.log(`📄 CSV: ${files.csvPath}`);
  console.log(`📄 Markdown: ${files.mdPath}`);

  printIntegrationGuide();

  console.log('\n🎉 Automation complete!');
  console.log(`📧 ${files.count} emails ready to send`);
}

main().catch(console.error);

/**
 * BONUS: Actual email sending function (commented out)
 * Uncomment and configure when ready to fully automate
 */

/*
import sgMail from '@sendgrid/mail';

async function sendEmailViaSendGrid(emailContent) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  try {
    await sgMail.send(emailContent);
    console.log(`✅ Sent email to ${emailContent.to}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Failed to send to ${emailContent.to}:`, error.message);
    return { success: false, error: error.message };
  }
}
*/
