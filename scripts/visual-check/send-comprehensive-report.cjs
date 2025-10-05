#!/usr/bin/env node

/**
 * Comprehensive Visual Monitoring Report
 *
 * Sends detailed email report including:
 * 1. Test results summary
 * 2. Detailed failure analysis by category
 * 3. Specific improvement recommendations
 * 4. New pages discovered
 * 5. Actionable next steps
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Paths
const RESULTS_PATH = path.join(__dirname, 'test-results/results.json');
const ANALYSIS_PATH = path.join(__dirname, 'analysis-report.json');
const DISCOVERY_PATH = path.join(__dirname, 'discovered-pages.json');

// Load data
let testResults = null;
let analysis = null;
let discovery = null;

try {
  if (fs.existsSync(RESULTS_PATH)) {
    testResults = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
  }
  if (fs.existsSync(ANALYSIS_PATH)) {
    analysis = JSON.parse(fs.readFileSync(ANALYSIS_PATH, 'utf8'));
  }
  if (fs.existsSync(DISCOVERY_PATH)) {
    discovery = JSON.parse(fs.readFileSync(DISCOVERY_PATH, 'utf8'));
  }
} catch (err) {
  console.error('Error loading data:', err.message);
}

// Generate HTML email
function generateEmailHTML() {
  const timestamp = new Date().toLocaleString();
  const successRate = analysis?.summary?.successRate || 'N/A';
  const passed = analysis?.summary?.passed || 0;
  const failed = analysis?.summary?.failed || 0;
  const flaky = analysis?.summary?.flaky || 0;
  const duration = analysis?.summary?.duration ? (analysis.summary.duration / 1000).toFixed(2) + 's' : 'N/A';

  // Status emoji
  let statusEmoji = '✅';
  let statusColor = '#28a745';
  const rate = parseFloat(successRate);
  if (rate < 70) {
    statusEmoji = '🔴';
    statusColor = '#dc3545';
  } else if (rate < 85) {
    statusEmoji = '⚠️';
    statusColor = '#ffc107';
  }

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
    .header h1 { margin: 0; font-size: 28px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 30px; }
    .summary-card { background: white; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; text-align: center; }
    .summary-card .number { font-size: 32px; font-weight: bold; margin: 10px 0; }
    .summary-card .label { color: #6c757d; font-size: 14px; text-transform: uppercase; }
    .success-rate { background: ${statusColor}; color: white; }
    .section { background: white; border: 1px solid #e9ecef; border-radius: 8px; padding: 25px; margin-bottom: 20px; }
    .section h2 { margin-top: 0; color: #495057; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; }
    .critical { background: #fff5f5; border-left: 4px solid #dc3545; padding: 15px; margin: 10px 0; }
    .warning { background: #fffbeb; border-left: 4px solid #ffc107; padding: 15px; margin: 10px 0; }
    .info { background: #f0f9ff; border-left: 4px solid #0dcaf0; padding: 15px; margin: 10px 0; }
    .success { background: #f0fdf4; border-left: 4px solid #28a745; padding: 15px; margin: 10px 0; }
    .improvement { background: #f8f9fa; border-radius: 6px; padding: 15px; margin: 15px 0; border-left: 3px solid #0d6efd; }
    .improvement-header { font-weight: bold; color: #0d6efd; margin-bottom: 8px; }
    .priority-high { color: #dc3545; font-weight: bold; }
    .priority-medium { color: #ffc107; font-weight: bold; }
    .priority-low { color: #6c757d; font-weight: bold; }
    ul { margin: 10px 0; padding-left: 25px; }
    li { margin: 5px 0; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-left: 8px; }
    .badge-danger { background: #dc3545; color: white; }
    .badge-warning { background: #ffc107; color: #000; }
    .badge-success { background: #28a745; color: white; }
    .new-pages { background: #e7f3ff; border-radius: 6px; padding: 15px; margin: 15px 0; }
    .page-list { max-height: 200px; overflow-y: auto; background: white; padding: 10px; border-radius: 4px; margin-top: 10px; }
    .footer { text-align: center; color: #6c757d; padding: 20px; font-size: 14px; border-top: 1px solid #e9ecef; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${statusEmoji} Visual Monitoring Report</h1>
    <p>${timestamp}</p>
  </div>

  <div class="summary">
    <div class="summary-card success-rate">
      <div class="label">Success Rate</div>
      <div class="number">${successRate}</div>
    </div>
    <div class="summary-card">
      <div class="label">Passed</div>
      <div class="number" style="color: #28a745;">${passed}</div>
    </div>
    <div class="summary-card">
      <div class="label">Failed</div>
      <div class="number" style="color: #dc3545;">${failed}</div>
    </div>
    <div class="summary-card">
      <div class="label">Duration</div>
      <div class="number" style="color: #0dcaf0; font-size: 24px;">${duration}</div>
    </div>
  </div>
`;

  // Top Recommendations
  if (analysis?.recommendations?.length > 0) {
    html += `
  <div class="section">
    <h2>🎯 Priority Actions</h2>`;

    analysis.recommendations.slice(0, 5).forEach((rec, i) => {
      const alertClass = rec.includes('CRITICAL') ? 'critical' : rec.includes('WARNING') ? 'warning' : rec.includes('excellent') ? 'success' : 'info';
      html += `<div class="${alertClass}"><strong>${i + 1}.</strong> ${rec}</div>`;
    });

    html += `</div>`;
  }

  // Detailed Improvements
  if (analysis?.improvements?.length > 0) {
    html += `
  <div class="section">
    <h2>💡 Detailed Improvements Needed</h2>`;

    analysis.improvements.forEach(imp => {
      const priorityClass = `priority-${imp.priority.toLowerCase()}`;
      html += `
    <div class="improvement">
      <div class="improvement-header">
        ${imp.category}
        <span class="${priorityClass}">[${imp.priority} PRIORITY]</span>
      </div>
      <p><strong>Issue:</strong> ${imp.issue}</p>`;

      if (imp.affectedFiles && imp.affectedFiles.length > 0) {
        html += `<p><strong>Affected:</strong> ${imp.affectedFiles.slice(0, 5).join(', ')}${imp.affectedFiles.length > 5 ? ` +${imp.affectedFiles.length - 5} more` : ''}</p>`;
      }

      if (imp.affectedPages && imp.affectedPages.length > 0) {
        html += `<p><strong>Pages:</strong> ${imp.affectedPages.slice(0, 5).join(', ')}${imp.affectedPages.length > 5 ? ` +${imp.affectedPages.length - 5} more` : ''}</p>`;
      }

      if (imp.suggestions && imp.suggestions.length > 0) {
        html += `<p><strong>Suggestions:</strong></p><ul>`;
        imp.suggestions.forEach(sug => {
          html += `<li>${sug}</li>`;
        });
        html += `</ul>`;
      }

      html += `</div>`;
    });

    html += `</div>`;
  }

  // Failure Breakdown by Category
  if (analysis?.failures?.byCategory) {
    html += `
  <div class="section">
    <h2>📊 Failure Breakdown</h2>`;

    Object.keys(analysis.failures.byCategory).forEach(category => {
      const failures = analysis.failures.byCategory[category];
      if (failures.length > 0) {
        html += `<p><strong>${category}:</strong> <span class="badge badge-danger">${failures.length}</span> ${failures.length === 1 ? 'failure' : 'failures'}</p>`;
      }
    });

    html += `</div>`;
  }

  // New Pages Discovered
  if (discovery && discovery.newPages && discovery.newPages.length > 0) {
    html += `
  <div class="section">
    <h2>🆕 New Pages Discovered</h2>
    <div class="new-pages">
      <p><strong>${discovery.newPages.length} new pages</strong> found that are not currently being tested.</p>
      <p><strong>Total pages on site:</strong> ${discovery.totalDiscovered}</p>
      <p><strong>Currently testing:</strong> ${discovery.currentlyTested} pages</p>

      <div class="page-list">
        <strong>Sample of new pages:</strong>
        <ul>`;

    discovery.newPages.slice(0, 20).forEach(page => {
      html += `<li>${page}</li>`;
    });

    if (discovery.newPages.length > 20) {
      html += `<li><em>... and ${discovery.newPages.length - 20} more pages</em></li>`;
    }

    html += `
        </ul>
      </div>

      <p style="margin-top: 15px;"><strong>📝 Action Required:</strong> Review the discovered pages and update test configuration to include critical pages.</p>
    </div>
  </div>`;
  }

  // Quick Actions
  html += `
  <div class="section">
    <h2>⚡ Quick Actions</h2>
    <ol>
      <li>Review and fix critical failures (HTTP errors, missing elements)</li>
      <li>Verify CSS and JavaScript file deployments</li>
      <li>Add missing HTML semantic elements (&lt;h1&gt;, &lt;main&gt;)</li>
      <li>Update test configuration to include new pages</li>
      <li>Run tests again after fixes to verify improvements</li>
    </ol>
  </div>`;

  html += `
  <div class="footer">
    <p>Generated by Visual Monitoring Agent</p>
    <p>Workflow: n8n | Tests: Playwright | Site: theprofitplatform.com.au</p>
  </div>
</body>
</html>`;

  return html;
}

// Generate plain text version
function generatePlainText() {
  const timestamp = new Date().toLocaleString();
  const successRate = analysis?.summary?.successRate || 'N/A';
  const passed = analysis?.summary?.passed || 0;
  const failed = analysis?.summary?.failed || 0;
  const duration = analysis?.summary?.duration ? (analysis.summary.duration / 1000).toFixed(2) + 's' : 'N/A';

  let text = `
VISUAL MONITORING REPORT
${timestamp}

===================
SUMMARY
===================
Success Rate: ${successRate}
Passed: ${passed}
Failed: ${failed}
Duration: ${duration}

`;

  if (analysis?.recommendations?.length > 0) {
    text += `
===================
PRIORITY ACTIONS
===================
`;
    analysis.recommendations.slice(0, 5).forEach((rec, i) => {
      text += `${i + 1}. ${rec}\n`;
    });
  }

  if (discovery && discovery.newPages && discovery.newPages.length > 0) {
    text += `
===================
NEW PAGES DISCOVERED
===================
Found ${discovery.newPages.length} new pages not currently being tested.
Total pages: ${discovery.totalDiscovered}
Currently testing: ${discovery.currentlyTested}

Sample of new pages:
${discovery.newPages.slice(0, 10).join('\n')}
${discovery.newPages.length > 10 ? `... and ${discovery.newPages.length - 10} more` : ''}
`;
  }

  text += `
===================
Generated by Visual Monitoring Agent
Workflow: n8n | Tests: Playwright
Site: theprofitplatform.com.au
`;

  return text;
}

// Send email
async function sendEmail() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'abhishekmaharjan3737@gmail.com',
      pass: 'tmhnofephrxbdaik'
    }
  });

  const htmlContent = generateEmailHTML();
  const textContent = generatePlainText();

  const successRate = analysis?.summary?.successRate || 'N/A';
  const emoji = parseFloat(successRate) < 70 ? '🔴' : parseFloat(successRate) < 85 ? '⚠️' : '✅';

  try {
    const info = await transporter.sendMail({
      from: 'visual-agent@theprofitplatform.com.au',
      to: 'abhishekmaharjan3737@gmail.com',
      subject: `${emoji} Visual Monitoring - ${successRate} Success Rate - ${new Date().toLocaleString()}`,
      text: textContent,
      html: htmlContent
    });

    console.log('✅ Comprehensive email report sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📊 Success Rate:', successRate);
    console.log('📄 Report included:');
    console.log('   - Test results summary');
    console.log('   - Detailed failure analysis');
    console.log('   - Improvement recommendations');
    if (discovery?.newPages?.length > 0) {
      console.log(`   - ${discovery.newPages.length} new pages discovered`);
    }
    return true;
  } catch (err) {
    console.error('❌ Email failed:', err.message);
    return false;
  }
}

// Run if called directly
if (require.main === module) {
  sendEmail()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ Error:', err.message);
      process.exit(1);
    });
}

module.exports = { sendEmail };
