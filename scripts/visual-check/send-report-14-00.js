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
    .improved { color: #27ae60; background: #d4edda; padding: 4px 8px; border-radius: 3px; font-weight: bold; }
    .stats { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .stats h2 { color: white; border: none; padding: 0; margin-top: 0; }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px; }
    .stat-card { background: rgba(255,255,255,0.1); padding: 15px; border-radius: 6px; backdrop-filter: blur(10px); }
    .stat-card strong { display: block; font-size: 24px; margin-top: 5px; }
    .trend-up { color: #27ae60; }
    .trend-down { color: #e74c3c; }
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
    .comparison { background: #e8f5e9; padding: 10px; border-radius: 4px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Comprehensive Visual Quality Report</h1>
    <p style="color: #7f8c8d; margin-top: -10px;">Run #19 | 2025-10-01 14:00:00 UTC | Domain: new.theprofitplatform.com.au</p>

    <div class="comparison">
      <strong>📈 Trend Analysis:</strong> <span class="improved">✓ IMPROVED</span> - Issues decreased from 202 → 200 (-2 issues)
    </div>

    <div class="stats">
      <h2>📈 Executive Summary</h2>
      <div class="stat-grid">
        <div class="stat-card">
          <div>Pages Scanned</div>
          <strong>8</strong>
        </div>
        <div class="stat-card">
          <div>Total Issues</div>
          <strong>200</strong>
          <small class="trend-up">↓ -2 from last run</small>
        </div>
        <div class="stat-card">
          <div>Fixes Generated</div>
          <strong>69</strong>
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
          <div>HTTP Success</div>
          <strong>62.5%</strong>
        </div>
      </div>
      <div class="progress-bar" style="margin-top: 20px;">
        <div class="progress-fill" style="width: 34.5%;"></div>
      </div>
      <small>34.5% of issues have automated fixes generated</small>
    </div>

    <h2>🎯 Issue Severity Breakdown</h2>
    <table>
      <thead>
        <tr>
          <th>Severity</th>
          <th>Count</th>
          <th>Percentage</th>
          <th>Examples</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="critical">🔴 Critical</span></td>
          <td>84</td>
          <td>42%</td>
          <td>Missing CSS files (79), Malformed paths (4), HTTP errors (1)</td>
        </tr>
        <tr>
          <td><span class="high">🟠 High</span></td>
          <td>54</td>
          <td>27%</td>
          <td>Missing elements (16), Broken images (2), Horizontal overflow (30), Unstyled pages (6)</td>
        </tr>
        <tr>
          <td><span class="medium">🟡 Medium</span></td>
          <td>52</td>
          <td>26%</td>
          <td>Font optimization (10), Custom fonts (16), Invisible elements (26)</td>
        </tr>
        <tr>
          <td><span class="low">⚪ Low</span></td>
          <td>10</td>
          <td>5%</td>
          <td>Minor layout issues</td>
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
          <th>Change</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>/</strong> <small>(Home)</small></td>
          <td><span class="success">200</span></td>
          <td>23</td>
          <td>12.0s</td>
          <td class="critical">4</td>
          <td class="high">10</td>
          <td class="medium">9</td>
          <td>→ Same</td>
        </tr>
        <tr>
          <td><strong>/about</strong></td>
          <td><span class="success">200</span></td>
          <td>52</td>
          <td>6.3s</td>
          <td class="critical">39</td>
          <td class="high">8</td>
          <td class="medium">5</td>
          <td class="trend-up">↓ -3</td>
        </tr>
        <tr>
          <td><strong>/services</strong></td>
          <td><span class="critical">404</span></td>
          <td>8</td>
          <td>5.3s</td>
          <td class="critical">4</td>
          <td class="high">2</td>
          <td class="medium">2</td>
          <td>→ Same</td>
        </tr>
        <tr>
          <td><strong>/blog</strong></td>
          <td><span class="critical">403</span></td>
          <td>8</td>
          <td>5.3s</td>
          <td class="critical">4</td>
          <td class="high">2</td>
          <td class="medium">2</td>
          <td>→ Same</td>
        </tr>
        <tr>
          <td><strong>/contact</strong></td>
          <td><span class="success">200</span></td>
          <td>37</td>
          <td>7.8s</td>
          <td class="critical">18</td>
          <td class="high">13</td>
          <td class="medium">6</td>
          <td>→ Same</td>
        </tr>
        <tr>
          <td><strong>/privacy</strong></td>
          <td><span class="success">200</span></td>
          <td>29</td>
          <td>7.6s</td>
          <td class="critical">8</td>
          <td class="high">6</td>
          <td class="medium">15</td>
          <td>→ Same</td>
        </tr>
        <tr>
          <td><strong>/terms</strong></td>
          <td><span class="success">200</span></td>
          <td>35</td>
          <td>5.8s</td>
          <td class="critical">4</td>
          <td class="high">13</td>
          <td class="medium">18</td>
          <td class="trend-down">↑ +7</td>
        </tr>
        <tr>
          <td><strong>/cookies</strong></td>
          <td><span class="critical">403</span></td>
          <td>8</td>
          <td>5.3s</td>
          <td class="critical">3</td>
          <td class="high">0</td>
          <td class="medium">5</td>
          <td>→ Same</td>
        </tr>
      </tbody>
    </table>

    <h2>🚨 Critical Issues Detected (84 Total)</h2>

    <div class="issue-category">
      <h3>1. Malformed Resource Paths <span class="badge badge-critical">CRITICAL</span></h3>
      <div class="critical-box">
        <strong>Impact:</strong> JavaScript files failing to load, breaking site functionality<br>
        <strong>Count:</strong> 4 instances (2 desktop + 2 mobile)<br>
        <strong>Status:</strong> ✅ Auto-fix instructions generated<br>
        <strong>Confidence:</strong> 100%
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
        <strong>Impact:</strong> Pages rendering without proper styling, poor user experience<br>
        <strong>Count:</strong> 79 missing CSS files across 8 pages<br>
        <strong>Status:</strong> ⚠️ Requires manual deployment<br>
        <strong>Confidence:</strong> 95%
      </div>
      <div class="asset-list">
        <strong>Breakdown by Page:</strong>
        <div class="asset-item"><strong>/about:</strong> 20 missing CSS files (navigation, layout, dropdown, spacing, etc.)</div>
        <div class="asset-item"><strong>/about (mobile):</strong> 19 missing CSS files</div>
        <div class="asset-item"><strong>/contact:</strong> 12 missing CSS files (contact-form, success-stories, FAQ, etc.)</div>
        <div class="asset-item"><strong>/contact (mobile):</strong> 12 missing CSS files</div>
        <div class="asset-item"><strong>/terms:</strong> 15 missing CSS files</div>
        <div class="asset-item"><strong>/services, /blog:</strong> 8 missing CSS files each</div>
      </div>
      <div class="info-box">
        <strong>Top Missing Files:</strong>
        <ul>
          <li><code>/about/css/skip-links-fix.css</code></li>
          <li><code>/about/css/navigation.css</code></li>
          <li><code>/about/css/navigation-dropdown-fix.css</code></li>
          <li><code>/about/css/main-content-spacing.css</code></li>
          <li><code>/about/css/layout.css</code></li>
          <li><code>/css/success-stories.css</code></li>
          <li><code>/css/contact-form-enhanced.css</code></li>
        </ul>
      </div>
    </div>

    <h2>⚠️ High Priority Issues (54 Total)</h2>

    <div class="issue-category">
      <h3>3. Missing Critical HTML Elements <span class="badge badge-high">HIGH</span></h3>
      <div class="issue-box">
        <strong>Impact:</strong> SEO penalties, accessibility issues, poor semantic structure<br>
        <strong>Count:</strong> 16 missing elements<br>
        <strong>Status:</strong> ⚠️ Requires template updates<br>
        <strong>Confidence:</strong> 85%
      </div>
      <table>
        <thead>
          <tr>
            <th>Element</th>
            <th>Pages Affected</th>
            <th>Count</th>
            <th>SEO Impact</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>&lt;main&gt;</code></td>
            <td>/services, /blog, /cookies</td>
            <td>8</td>
            <td class="critical">High</td>
          </tr>
          <tr>
            <td><code>&lt;h1&gt;</code></td>
            <td>/contact</td>
            <td>8</td>
            <td class="critical">Critical</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="issue-category">
      <h3>4. Broken Images <span class="badge badge-high">HIGH</span></h3>
      <div class="issue-box">
        <strong>Impact:</strong> Missing visual content, poor UX<br>
        <strong>Count:</strong> 2 broken images<br>
        <strong>Location:</strong> Home page (desktop & mobile)<br>
        <strong>Confidence:</strong> 90%
      </div>
      <div class="asset-item">❌ <code>https://storage.googleapis.com/msgsndr/El8AYzrtJG3nVg76QPpa/media/68b56f6e09148075ab5016df.png</code></div>
      <div class="asset-item">❌ <code>https://storage.googleapis.com/msgsndr/El8AYzrtJG3nVg76QPpa/media/68b56f98291670614001dfbf.png</code></div>
    </div>

    <div class="issue-category">
      <h3>5. Horizontal Overflow <span class="badge badge-high">HIGH</span></h3>
      <div class="issue-box">
        <strong>Impact:</strong> Mobile responsiveness issues, horizontal scrolling, poor mobile UX<br>
        <strong>Count:</strong> 30 elements with overflow<br>
        <strong>Pages:</strong> Home (20), Contact (10)<br>
        <strong>Confidence:</strong> 75%
      </div>
    </div>

    <div class="issue-category">
      <h3>6. Unstyled Pages <span class="badge badge-high">HIGH</span></h3>
      <div class="issue-box">
        <strong>Impact:</strong> Poor visual presentation, unprofessional appearance<br>
        <strong>Count:</strong> 6 pages appear unstyled<br>
        <strong>Pages:</strong> /services (404), /blog (403), /cookies (403)<br>
        <strong>Root Cause:</strong> Missing CSS files + HTTP errors<br>
        <strong>Confidence:</strong> 70%
      </div>
    </div>

    <h2>🔤 Font Performance Issues (52 Total)</h2>

    <div class="issue-category">
      <h3>7. Missing font-display: swap <span class="badge badge-medium">MEDIUM</span></h3>
      <div class="info-box">
        <strong>Impact:</strong> FOIT (Flash of Invisible Text), slower perceived load times, poor Core Web Vitals<br>
        <strong>Count:</strong> 43-56 fonts per page lacking optimization<br>
        <strong>Status:</strong> ✅ 10 fixes generated<br>
        <strong>Confidence:</strong> 80%
      </div>
      <div class="perf-metric">
        <strong>Affected Fonts:</strong> Inter (43-56 instances), Font Awesome 6 Free, Font Awesome 5 Brands, Font Awesome 5 Free, FontAwesome
      </div>
      <div class="success-box">
        <strong>Recommendation:</strong> Add <code>font-display: swap</code> to all @font-face declarations to prevent invisible text during load
      </div>
    </div>

    <div class="issue-category">
      <h3>8. Custom Fonts Not Loading <span class="badge badge-medium">MEDIUM</span></h3>
      <div class="issue-box">
        <strong>Impact:</strong> Falling back to system fonts, brand inconsistency, typography issues<br>
        <strong>Count:</strong> 16 instances across all pages<br>
        <strong>Confidence:</strong> 65%
      </div>
      <div class="asset-item">Only system fonts detected: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial</div>
    </div>

    <div class="issue-category">
      <h3>9. Invisible Elements <span class="badge badge-medium">MEDIUM</span></h3>
      <div class="issue-box">
        <strong>Impact:</strong> Hidden content, potential layout issues<br>
        <strong>Count:</strong> 72 invisible elements (10 per page average)<br>
        <strong>Confidence:</strong> 60% (low confidence, may be intentional)
      </div>
    </div>

    <h2>✅ Auto-Fixes Generated (69 Total)</h2>

    <div class="success-box">
      <ul class="fix-list">
        <li>✅ <strong>Critical (10):</strong> Malformed paths (4), Missing CSS path fixes (6)</li>
        <li>✅ <strong>High (26):</strong> Missing elements (16), Broken images (2), Horizontal overflow (3), Unstyled pages (5)</li>
        <li>✅ <strong>Medium (33):</strong> Font-display optimization (10), Custom font checks (16), Invisible elements (7)</li>
      </ul>
      <p><strong>Note:</strong> All fixes generated with detailed instructions. Manual intervention required for most critical issues.</p>
    </div>

    <h2>🔍 Performance Metrics</h2>

    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th>Value</th>
          <th>Target</th>
          <th>Status</th>
          <th>Change</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Average Page Load</td>
          <td>6.9s</td>
          <td>&lt; 3s</td>
          <td class="critical">⚠️ Slow</td>
          <td>→ Same</td>
        </tr>
        <tr>
          <td>Slowest Page</td>
          <td>12.0s (Home)</td>
          <td>&lt; 3s</td>
          <td class="critical">⚠️ Critical</td>
          <td class="trend-down">↑ +0.9s</td>
        </tr>
        <tr>
          <td>Fastest Page</td>
          <td>5.3s</td>
          <td>&lt; 3s</td>
          <td class="medium">⚠️ Acceptable</td>
          <td>→ Same</td>
        </tr>
        <tr>
          <td>HTTP Success Rate</td>
          <td>62.5% (5/8)</td>
          <td>100%</td>
          <td class="high">⚠️ 3 pages down</td>
          <td>→ Same</td>
        </tr>
        <tr>
          <td>Total Issues</td>
          <td>200</td>
          <td>&lt; 50</td>
          <td class="high">⚠️ High</td>
          <td class="trend-up">↓ -2</td>
        </tr>
      </tbody>
    </table>

    <h2>📸 Screenshots Captured (32 Total)</h2>
    <div class="screenshot-grid">
      <div class="screenshot-card">🖥️ Home Desktop<br><small>4.2 MB</small></div>
      <div class="screenshot-card">📱 Home Mobile<br><small>1.2 MB</small></div>
      <div class="screenshot-card">🖥️ About Desktop<br><small>124 KB</small></div>
      <div class="screenshot-card">📱 About Mobile<br><small>92 KB</small></div>
      <div class="screenshot-card">🖥️ Services Desktop<br><small>16 KB</small></div>
      <div class="screenshot-card">📱 Services Mobile<br><small>8 KB</small></div>
      <div class="screenshot-card">🖥️ Contact Desktop<br><small>1.1 MB</small></div>
      <div class="screenshot-card">📱 Contact Mobile<br><small>675 KB</small></div>
      <div class="screenshot-card">🖥️ Privacy Desktop<br><small>2.1 MB</small></div>
      <div class="screenshot-card">📱 Privacy Mobile<br><small>2.1 MB</small></div>
      <div class="screenshot-card">🖥️ Terms Desktop<br><small>84 KB</small></div>
      <div class="screenshot-card">+ 21 more</div>
    </div>

    <h2>💡 Actionable Recommendations</h2>

    <div class="critical-box">
      <h3>🔴 Immediate Actions Required (Priority 1):</h3>
      <ol>
        <li><strong>Fix HTTP errors:</strong>
          <ul>
            <li>/services - 404 (page doesn't exist or incorrect routing)</li>
            <li>/blog - 403 (access denied, check Cloudflare Pages settings)</li>
            <li>/cookies - 403 (access denied)</li>
          </ul>
        </li>
        <li><strong>Deploy 79 missing CSS files:</strong> Upload all CSS files to Cloudflare Pages. Most critical:
          <ul>
            <li>/about page: 20 CSS files (navigation, layout, dropdowns)</li>
            <li>/contact page: 12 CSS files (forms, success stories)</li>
            <li>/terms page: 15 CSS files</li>
          </ul>
        </li>
        <li><strong>Fix 4 malformed JavaScript paths:</strong> Update HTML to use correct paths:
          <ul>
            <li><code>https://js/emergency-fixes-loader.js</code> → <code>/js/emergency-fixes-loader.js</code></li>
            <li><code>https://js/component-loader.js</code> → <code>/js/component-loader.js</code></li>
          </ul>
        </li>
        <li><strong>Fix 2 broken images:</strong> Replace or fix Google Storage image URLs on homepage</li>
      </ol>
    </div>

    <div class="issue-box">
      <h3>🟠 High Priority (Priority 2):</h3>
      <ol>
        <li><strong>Add missing HTML elements:</strong>
          <ul>
            <li>Add <code>&lt;main&gt;</code> element to /services, /blog, /cookies pages (8 instances)</li>
            <li>Add <code>&lt;h1&gt;</code> element to /contact page (8 instances)</li>
          </ul>
        </li>
        <li><strong>Fix horizontal overflow:</strong> 30 elements causing mobile scrolling issues (Home: 20, Contact: 10)</li>
        <li><strong>Optimize homepage load time:</strong> Currently 12.0s, target &lt; 3s
          <ul>
            <li>Implement lazy loading for images</li>
            <li>Reduce initial bundle size</li>
            <li>Enable Cloudflare optimization features</li>
          </ul>
        </li>
      </ol>
    </div>

    <div class="info-box">
      <h3>🟡 Performance Optimizations (Priority 3):</h3>
      <ol>
        <li>Add <code>font-display: swap</code> to 43-56 font declarations per page</li>
        <li>Investigate why custom fonts (Inter, Font Awesome) aren't loading properly</li>
        <li>Review and fix 72 invisible elements (may be intentional, needs verification)</li>
        <li>Implement image optimization and WebP format</li>
        <li>Minify and combine CSS files</li>
        <li>Enable HTTP/2 push for critical CSS</li>
      </ol>
    </div>

    <div class="success-box">
      <h3>✅ Long-term Improvements:</h3>
      <ul>
        <li>Set up automated CSS deployment pipeline to prevent missing files</li>
        <li>Implement CDN or proper hosting for Google Storage assets</li>
        <li>Add performance budgets to CI/CD pipeline</li>
        <li>Create automated tests for critical page elements (&lt;main&gt;, &lt;h1&gt;)</li>
        <li>Set up Core Web Vitals monitoring</li>
        <li>Consider font subsetting to reduce font file sizes</li>
      </ul>
    </div>

    <h2>📊 Historical Trend (Last 5 Runs)</h2>
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Issues</th>
          <th>Fixes</th>
          <th>Status</th>
          <th>Delta</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>13:45</td>
          <td>202</td>
          <td>69</td>
          <td>Improved</td>
          <td class="trend-up">-3</td>
        </tr>
        <tr style="background: #e8f5e9;">
          <td><strong>14:00</strong></td>
          <td><strong>200</strong></td>
          <td><strong>69</strong></td>
          <td><strong>Improved</strong></td>
          <td class="trend-up"><strong>-2</strong></td>
        </tr>
        <tr>
          <td>14:15 (Next)</td>
          <td>-</td>
          <td>-</td>
          <td>Pending</td>
          <td>-</td>
        </tr>
      </tbody>
    </table>
    <p><small>Overall trend: Slowly improving. Issues decreased from 207 (peak at 10:30) to 200 (current).</small></p>

    <hr style="margin: 40px 0; border: none; border-top: 2px solid #e0e0e0;">

    <div class="stats" style="margin-top: 30px;">
      <h2>📁 Report Details</h2>
      <p><strong>Run ID:</strong> 1759327200689</p>
      <p><strong>Location:</strong> <code>/scripts/visual-check/screenshots/run-2025-10-01T14-00-00/</code></p>
      <p><strong>Domain:</strong> <a href="https://new.theprofitplatform.com.au" style="color: white;">new.theprofitplatform.com.au</a></p>
      <p><strong>Viewports:</strong> Desktop (1920×1080), Mobile (375×812)</p>
      <p><strong>Next Check:</strong> 14:15 UTC (in 15 minutes)</p>
      <p><strong>Monitoring Frequency:</strong> Every 15 minutes (*/15 * * * *)</p>
      <p><strong>Status:</strong> <span class="improved">✓ IMPROVED</span> compared to previous run</p>
    </div>

    <p style="color: #7f8c8d; font-size: 0.9em; text-align: center; margin-top: 30px;">
      🤖 Generated by Visual Quality Monitoring Agent v2.0<br>
      Powered by Playwright | Hosted on Cloudflare Pages<br>
      Questions? Reply to this email or check /var/log/visual-agent.log
    </p>
  </div>
</body>
</html>
`;

async function sendEmail() {
  try {
    const transporter = nodemailer.createTransport({
      host: config.notifications.email.smtp.host,
      port: config.notifications.email.smtp.port,
      secure: config.notifications.email.smtp.secure,
      auth: {
        user: config.notifications.email.smtp.auth.user,
        pass: config.notifications.email.smtp.auth.pass
      }
    });

    const info = await transporter.sendMail({
      from: config.notifications.email.from,
      to: config.notifications.email.to,
      subject: '📊 Visual Quality Report - Run 14:00 (IMPROVED ↓ -2 issues)',
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
