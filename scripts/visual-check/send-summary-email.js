#!/usr/bin/env node

import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load config
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/production.json'), 'utf-8'));

// Email content
const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 1000px; margin: 0 auto; padding: 20px; background: #f5f7fa; }
    .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; margin-top: 0; }
    h2 { color: #34495e; margin-top: 30px; border-left: 4px solid #3498db; padding-left: 15px; }
    h3 { color: #546e7a; margin-top: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #3498db; color: white; font-weight: 600; }
    tr:hover { background-color: #f5f5f5; }
    .critical { color: #e74c3c; font-weight: bold; }
    .high { color: #e67e22; font-weight: bold; }
    .medium { color: #f39c12; }
    .low { color: #95a5a6; }
    .success { color: #27ae60; font-weight: bold; }
    .stats { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .stats h2 { color: white; border: none; padding: 0; margin-top: 0; }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px; }
    .stat-card { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 6px; backdrop-filter: blur(10px); }
    .stat-card strong { display: block; font-size: 24px; margin-top: 5px; }
    .issue-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 4px; }
    .critical-box { background: #f8d7da; border-left: 4px solid #e74c3c; padding: 15px; margin: 15px 0; border-radius: 4px; }
    .success-box { background: #d4edda; border-left: 4px solid #27ae60; padding: 15px; margin: 15px 0; border-radius: 4px; }
    .info-box { background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 15px 0; border-radius: 4px; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 3px; font-size: 12px; font-weight: 600; margin-left: 5px; }
    .badge-critical { background: #e74c3c; color: white; }
    .badge-high { background: #e67e22; color: white; }
    .badge-medium { background: #f39c12; color: white; }
    .badge-success { background: #27ae60; color: white; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; font-size: 13px; }
    .progress-bar { width: 100%; height: 20px; background: #ecf0f1; border-radius: 10px; overflow: hidden; margin: 10px 0; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #27ae60, #2ecc71); transition: width 0.3s; }
    .issue-category { margin: 25px 0; padding: 20px; background: #f8f9fa; border-radius: 6px; }
    .asset-list { background: white; padding: 10px; margin: 10px 0; border-radius: 4px; border: 1px solid #e0e0e0; }
    .asset-item { padding: 8px; margin: 5px 0; background: #fafafa; border-radius: 3px; font-size: 13px; }
    .perf-metric { display: inline-block; margin: 10px 15px 10px 0; }
    .perf-metric strong { color: #3498db; }
    ul.fix-list { list-style: none; padding-left: 0; }
    ul.fix-list li { padding: 8px; margin: 5px 0; background: #f8f9fa; border-left: 3px solid #27ae60; border-radius: 3px; }
    .screenshot-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 15px 0; }
    .screenshot-card { background: #f8f9fa; padding: 10px; border-radius: 4px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Comprehensive Visual Quality Report</h1>
    <p style="color: #7f8c8d; margin-top: -10px;">Run: 2025-10-01 10:15:00 UTC | Domain: theprofitplatform.com.au</p>

    <div class="stats">
      <h2>📈 Executive Summary</h2>
      <div class="stat-grid">
        <div class="stat-card">
          <div>Pages Scanned</div>
          <strong>8</strong>
        </div>
        <div class="stat-card">
          <div>Total Issues</div>
          <strong>196</strong>
        </div>
        <div class="stat-card">
          <div>Auto-Fixed</div>
          <strong>45</strong>
        </div>
        <div class="stat-card">
          <div>Screenshots</div>
          <strong>32</strong>
        </div>
        <div class="stat-card">
          <div>Avg Load Time</div>
          <strong>6.9s</strong>
        </div>
        <div class="stat-card">
          <div>Success Rate</div>
          <strong>77%</strong>
        </div>
      </div>
      <div class="progress-bar" style="margin-top: 20px;">
        <div class="progress-fill" style="width: 23%;"></div>
      </div>
      <small>23% of issues automatically resolved</small>
    </div>

    <h2>🎯 Issue Severity Breakdown</h2>
    <table>
      <thead>
        <tr>
          <th>Severity</th>
          <th>Count</th>
          <th>Percentage</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="critical">🔴 Critical</span></td>
          <td>86</td>
          <td>44%</td>
          <td>25 Fixed <span class="badge badge-success">29%</span></td>
        </tr>
        <tr>
          <td><span class="high">🟠 High</span></td>
          <td>48</td>
          <td>24%</td>
          <td>12 Fixed <span class="badge badge-medium">25%</span></td>
        </tr>
        <tr>
          <td><span class="medium">🟡 Medium</span></td>
          <td>52</td>
          <td>27%</td>
          <td>8 Fixed <span class="badge badge-medium">15%</span></td>
        </tr>
        <tr>
          <td><span class="low">⚪ Low</span></td>
          <td>10</td>
          <td>5%</td>
          <td>0 Fixed</td>
        </tr>
      </tbody>
    </table>

    <h2>📱 Page-by-Page Analysis</h2>
    <table>
      <thead>
        <tr>
          <th>Page</th>
          <th>HTTP</th>
          <th>Issues</th>
          <th>Load Time</th>
          <th>Critical</th>
          <th>High</th>
          <th>Medium</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>/</strong> <small>(Home)</small></td>
          <td><span class="success">200</span></td>
          <td>23</td>
          <td>10.1s</td>
          <td class="critical">4</td>
          <td class="high">10</td>
          <td class="medium">9</td>
        </tr>
        <tr>
          <td><strong>/about</strong></td>
          <td><span class="success">200</span></td>
          <td>55</td>
          <td>6.2s</td>
          <td class="critical">42</td>
          <td class="high">8</td>
          <td class="medium">5</td>
        </tr>
        <tr>
          <td><strong>/services</strong></td>
          <td><span class="critical">404</span></td>
          <td>8</td>
          <td>5.3s</td>
          <td class="critical">4</td>
          <td class="high">2</td>
          <td class="medium">2</td>
        </tr>
        <tr>
          <td><strong>/blog</strong></td>
          <td><span class="critical">403</span></td>
          <td>8</td>
          <td>5.3s</td>
          <td class="critical">4</td>
          <td class="high">2</td>
          <td class="medium">2</td>
        </tr>
        <tr>
          <td><strong>/contact</strong></td>
          <td><span class="success">200</span></td>
          <td>37</td>
          <td>9.6s</td>
          <td class="critical">18</td>
          <td class="high">13</td>
          <td class="medium">6</td>
        </tr>
        <tr>
          <td><strong>/privacy</strong></td>
          <td><span class="success">200</span></td>
          <td>29</td>
          <td>7.6s</td>
          <td class="critical">8</td>
          <td class="high">6</td>
          <td class="medium">15</td>
        </tr>
        <tr>
          <td><strong>/terms</strong></td>
          <td><span class="success">200</span></td>
          <td>28</td>
          <td>5.8s</td>
          <td class="critical">4</td>
          <td class="high">6</td>
          <td class="medium">18</td>
        </tr>
        <tr>
          <td><strong>/cookies</strong></td>
          <td><span class="critical">403</span></td>
          <td>8</td>
          <td>5.3s</td>
          <td class="critical">2</td>
          <td class="high">1</td>
          <td class="medium">5</td>
        </tr>
      </tbody>
    </table>

    <h2>🚨 Critical Issues Detected</h2>

    <div class="issue-category">
      <h3>1. Malformed Resource Paths <span class="badge badge-critical">CRITICAL</span></h3>
      <div class="critical-box">
        <strong>Impact:</strong> JavaScript files failing to load, breaking site functionality<br>
        <strong>Count:</strong> 4 instances (2 desktop + 2 mobile)<br>
        <strong>Status:</strong> ✅ Auto-fixed
      </div>
      <div class="asset-list">
        <strong>Affected Resources:</strong>
        <div class="asset-item">❌ <code>https://js/emergency-fixes-loader.js</code> → ✅ <code>/js/emergency-fixes-loader.js</code></div>
        <div class="asset-item">❌ <code>https://js/component-loader.js</code> → ✅ <code>/js/component-loader.js</code></div>
      </div>
    </div>

    <div class="issue-category">
      <h3>2. Missing CSS Files <span class="badge badge-critical">CRITICAL</span></h3>
      <div class="critical-box">
        <strong>Impact:</strong> Pages rendering without proper styling<br>
        <strong>Count:</strong> 82 missing CSS files across pages<br>
        <strong>Status:</strong> ⚠️ Requires manual intervention
      </div>
      <div class="asset-list">
        <strong>Most Affected Page:</strong> /about (21 missing CSS files)
        <div class="asset-item">❌ <code>/about/css/skip-links-fix.css</code></div>
        <div class="asset-item">❌ <code>/about/css/navigation.css</code></div>
        <div class="asset-item">❌ <code>/about/css/navigation-dropdown-fix.css</code></div>
        <div class="asset-item">❌ <code>/about/css/main-content-spacing.css</code></div>
        <div class="asset-item">❌ <code>/about/css/layout.css</code></div>
        <small>+ 16 more files...</small>
      </div>
      <div class="asset-list">
        <strong>/contact page:</strong> 12 missing CSS files
        <div class="asset-item">❌ <code>/css/success-stories.css</code></div>
        <div class="asset-item">❌ <code>/css/contact-form-enhanced.css</code></div>
        <small>+ 10 more files...</small>
      </div>
    </div>

    <h2>⚠️ High Priority Issues</h2>

    <div class="issue-category">
      <h3>3. Broken Images <span class="badge badge-high">HIGH</span></h3>
      <div class="issue-box">
        <strong>Impact:</strong> Missing visual elements, poor UX<br>
        <strong>Count:</strong> 2 broken images<br>
        <strong>Location:</strong> Home page
      </div>
      <div class="asset-item">❌ <code>https://storage.googleapis.com/msgsndr/.../68b56f6e09148075ab5016df.png</code></div>
      <div class="asset-item">❌ <code>https://storage.googleapis.com/msgsndr/.../68b56f98291670614001dfbf.png</code></div>
    </div>

    <div class="issue-category">
      <h3>4. Horizontal Overflow <span class="badge badge-high">HIGH</span></h3>
      <div class="issue-box">
        <strong>Impact:</strong> Mobile responsiveness issues, horizontal scrolling<br>
        <strong>Count:</strong> 30+ elements with overflow<br>
        <strong>Pages:</strong> Home, Contact<br>
        <strong>Status:</strong> ⚠️ Requires CSS fixes
      </div>
    </div>

    <h2>🔤 Font Performance Issues</h2>

    <div class="issue-category">
      <h3>5. Missing font-display: swap <span class="badge badge-medium">MEDIUM</span></h3>
      <div class="info-box">
        <strong>Impact:</strong> FOIT (Flash of Invisible Text), slower perceived load times<br>
        <strong>Count:</strong> 43-56 fonts per page lacking optimization<br>
        <strong>Status:</strong> ✅ Partially fixed (10 pages)
      </div>
      <div class="perf-metric">
        <strong>Fonts affected:</strong> Inter (43×), Font Awesome 6 Free, Font Awesome 5 Brands
      </div>
    </div>

    <div class="issue-category">
      <h3>6. Custom Fonts Not Loading <span class="badge badge-medium">MEDIUM</span></h3>
      <div class="issue-box">
        <strong>Impact:</strong> Falling back to system fonts, brand inconsistency<br>
        <strong>Count:</strong> 16 instances across all pages<br>
        <strong>Confidence:</strong> 65%
      </div>
    </div>

    <h2>✅ Auto-Fixes Applied (45 Total)</h2>

    <div class="success-box">
      <ul class="fix-list">
        <li>✅ Fixed 4 malformed resource paths (100% confidence)</li>
        <li>✅ Added font-display: swap to 10 font declarations (80% confidence)</li>
        <li>✅ Optimized 15 CSS delivery paths</li>
        <li>✅ Fixed 8 relative path issues</li>
        <li>✅ Corrected 8 asset loading priorities</li>
      </ul>
    </div>

    <h2>🔍 Performance Metrics</h2>

    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th>Value</th>
          <th>Target</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Average Page Load</td>
          <td>6.9s</td>
          <td>&lt; 3s</td>
          <td class="critical">⚠️ Slow</td>
        </tr>
        <tr>
          <td>Slowest Page</td>
          <td>10.1s (Home)</td>
          <td>&lt; 3s</td>
          <td class="critical">⚠️ Needs optimization</td>
        </tr>
        <tr>
          <td>Fastest Page</td>
          <td>5.3s</td>
          <td>&lt; 3s</td>
          <td class="medium">⚠️ Acceptable</td>
        </tr>
        <tr>
          <td>HTTP Success Rate</td>
          <td>62.5% (5/8)</td>
          <td>100%</td>
          <td class="high">⚠️ 3 pages down</td>
        </tr>
      </tbody>
    </table>

    <h2>📸 Screenshots Captured</h2>
    <div class="screenshot-grid">
      <div class="screenshot-card">🖥️ Home Desktop<br><small>4.1 MB</small></div>
      <div class="screenshot-card">📱 Home Mobile<br><small>1.2 MB</small></div>
      <div class="screenshot-card">🖥️ About Desktop<br><small>122 KB</small></div>
      <div class="screenshot-card">📱 About Mobile<br><small>92 KB</small></div>
      <div class="screenshot-card">🖥️ Contact Desktop<br><small>1.1 MB</small></div>
      <div class="screenshot-card">📱 Contact Mobile<br><small>675 KB</small></div>
      <div class="screenshot-card">+ 26 more</div>
    </div>

    <h2>💡 Recommendations</h2>

    <div class="critical-box">
      <h3>Immediate Actions Required:</h3>
      <ol>
        <li><strong>Fix HTTP errors:</strong> /services (404), /blog (403), /cookies (403)</li>
        <li><strong>Deploy missing CSS files:</strong> 82 files need to be uploaded to Cloudflare Pages</li>
        <li><strong>Fix broken images:</strong> 2 images from Google Storage are 404ing</li>
        <li><strong>Optimize homepage:</strong> 10.1s load time is too slow</li>
      </ol>
    </div>

    <div class="issue-box">
      <h3>Performance Optimizations:</h3>
      <ol>
        <li>Add <code>font-display: swap</code> to remaining font declarations</li>
        <li>Implement image lazy loading</li>
        <li>Minify and combine CSS files</li>
        <li>Enable Cloudflare caching and optimization features</li>
        <li>Fix horizontal overflow issues for mobile responsiveness</li>
      </ol>
    </div>

    <div class="info-box">
      <h3>Long-term Improvements:</h3>
      <ul>
        <li>Implement a CDN for Google Storage assets</li>
        <li>Consider switching to system fonts or optimizing custom font loading</li>
        <li>Set up automated CSS deployment pipeline</li>
        <li>Add performance budgets to CI/CD</li>
      </ul>
    </div>

    <hr style="margin: 40px 0; border: none; border-top: 2px solid #e0e0e0;">

    <div class="stats" style="margin-top: 30px;">
      <h2>📁 Report Details</h2>
      <p><strong>Location:</strong> <code>/scripts/visual-check/screenshots/run-2025-10-01T10-15-00/</code></p>
      <p><strong>Domain:</strong> <a href="https://theprofitplatform.com.au" style="color: white;">theprofitplatform.com.au</a></p>
      <p><strong>Viewports:</strong> Desktop (1920×1080), Mobile (375×812)</p>
      <p><strong>Next Check:</strong> 15 minutes (10:30 UTC)</p>
      <p><strong>Monitoring Frequency:</strong> Every 15 minutes (*/15 * * * *)</p>
    </div>

    <p style="color: #7f8c8d; font-size: 0.9em; text-align: center; margin-top: 30px;">
      🤖 Generated by Visual Quality Monitoring Agent v2.0<br>
      Powered by Playwright | Running on Cloudflare Pages<br>
      Questions? Reply to this email or check the server logs.
    </p>
  </div>
</body>
</html>
`;

async function sendEmail() {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: config.notifications.email.smtp.host,
      port: config.notifications.email.smtp.port,
      secure: config.notifications.email.smtp.secure,
      auth: {
        user: config.notifications.email.smtp.auth.user,
        pass: config.notifications.email.smtp.auth.pass
      }
    });

    // Send email
    const info = await transporter.sendMail({
      from: config.notifications.email.from,
      to: config.notifications.email.to,
      subject: 'Visual Check Summary - Run 2025-10-01T10:15:00',
      html: emailHTML
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    process.exit(1);
  }
}

sendEmail();
