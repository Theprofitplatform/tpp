#!/usr/bin/env node

const nodemailer = require('nodemailer');
const fs = require('fs');

// Read test results
let testOutput = 'No test results available';
try {
  const resultsPath = '/home/avi/projects/astro-site/scripts/visual-check/test-results/results.json';
  if (fs.existsSync(resultsPath)) {
    const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
    testOutput = `
Visual Quality Check Complete

Timestamp: ${new Date().toISOString()}

Test Results:
✅ Passed: ${results.stats.expected}
❌ Failed: ${results.stats.unexpected}
⚠️  Flaky: ${results.stats.flaky}
⏱️  Duration: ${(results.stats.duration / 1000).toFixed(2)}s

Started: ${results.stats.startTime}
`;
  }
} catch (err) {
  testOutput = `Error reading test results: ${err.message}`;
}

// Configure email
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'abhishekmaharjan3737@gmail.com',
    pass: 'tmhnofephrxbdaik'
  }
});

// Send email
transporter.sendMail({
  from: 'visual-agent@theprofitplatform.com.au',
  to: 'abhishekmaharjan3737@gmail.com',
  subject: '✅ Visual Monitoring - ' + new Date().toLocaleString(),
  text: testOutput,
  html: `<h2>Visual Quality Check Complete</h2><pre>${testOutput}</pre>`
})
.then(info => {
  console.log('Email sent successfully!');
  console.log('Message ID:', info.messageId);
  process.exit(0);
})
.catch(err => {
  console.error('Email failed:', err.message);
  process.exit(1);
});
