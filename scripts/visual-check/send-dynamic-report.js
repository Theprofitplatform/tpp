#!/usr/bin/env node

/**
 * Dynamic Visual Quality Report Email Sender
 *
 * Generates and sends real-time reports from actual run data
 * with validation, trend analysis, and accurate metrics
 *
 * Usage:
 *   node send-dynamic-report.js
 *   node send-dynamic-report.js --validate-http  (includes HTTP validation)
 */

import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getCompleteRunData } from './lib/dataReader.js';
import { validateUrls } from './lib/validator.js';
import { generateHtmlReport } from './lib/reportGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const validateHttp = args.includes('--validate-http');

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🔍 Fetching latest run data...');

    // Get complete run data
    const runData = getCompleteRunData();

    console.log(`✅ Latest run: ${runData.latestRun.timestamp}`);
    console.log(`📊 Total issues: ${runData.latestRun.totalIssues}`);
    console.log(`📸 Screenshots: ${runData.screenshotCount}`);
    console.log(`📱 Pages scanned: ${runData.pages.length}`);

    // Optional HTTP validation
    if (validateHttp) {
      console.log('🔍 Validating HTTP status codes...');
      const urls = runData.productionUrls.map(u => u.url);
      const validationResults = await validateUrls(urls);

      // Add validation data to run data
      runData.httpValidation = validationResults;

      // Log validation summary
      const errors = Object.values(validationResults).filter(r => r.isError);
      const redirects = Object.values(validationResults).filter(r => r.redirected);

      console.log(`  ✅ URLs checked: ${urls.length}`);
      console.log(`  ⚠️  Real errors: ${errors.length}`);
      console.log(`  🔄 Redirects: ${redirects.length}`);
    }

    // Generate HTML report
    console.log('📝 Generating HTML report...');
    const htmlReport = generateHtmlReport(runData);

    // Load email configuration
    const configPath = path.join(__dirname, 'config/production.json');
    if (!fs.existsSync(configPath)) {
      throw new Error('Email configuration not found at config/production.json');
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: config.notifications.email.smtp.host,
      port: config.notifications.email.smtp.port,
      secure: config.notifications.email.smtp.secure,
      auth: {
        user: config.notifications.email.smtp.auth.user,
        pass: config.notifications.email.smtp.auth.pass
      }
    });

    // Format subject with status indicator
    const statusEmoji = runData.latestRun.status === 'improved' ? '✅' :
                       runData.latestRun.status === 'degraded' ? '⚠️' : '📊';

    const subject = `${statusEmoji} Visual Check - ${runData.latestRun.totalIssues} issues (${runData.latestRun.status.toUpperCase()})`;

    // Send email
    console.log('📧 Sending email...');
    const info = await transporter.sendMail({
      from: config.notifications.email.from,
      to: config.notifications.email.to,
      subject: subject,
      html: htmlReport
    });

    console.log('✅ Email sent successfully!');
    console.log(`📬 Message ID: ${info.messageId}`);
    console.log(`📊 Status: ${runData.latestRun.status}`);
    console.log(`📈 Issues: ${runData.latestRun.totalIssues} (${runData.latestRun.issuesDelta >= 0 ? '+' : ''}${runData.latestRun.issuesDelta})`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run
main();
