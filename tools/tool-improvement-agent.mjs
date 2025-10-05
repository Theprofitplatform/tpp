#!/usr/bin/env node
/**
 * Tool Improvement Agent
 * Analyzes tools in the astro-site project and sends improvement suggestions via email
 * Runs in 30-minute cycles
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '/home/avi/projects/astro-site/.env.tool-agent' });

const CONFIG = {
  toolsDir: '/home/avi/projects/astro-site/src/pages/tools',
  email: {
    from: process.env.EMAIL_FROM || 'abhishekmaharjan3737@gmail.com',
    to: process.env.EMAIL_TO || 'abhishekmaharjan3737@gmail.com',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    }
  },
  cycleInterval: 30 * 60 * 1000, // 30 minutes
  stateFile: '/home/avi/projects/astro-site/tools/.tool-agent-state.json'
};

const TOOLS_QUEUE = [
  'rank-tracker',
  'revenue-leak-detector',
  'speed-test',
  'website-speed-test',
  'keyword-difficulty-checker',
  'local-rankings-map',
  'seo-audit-tool'
];

class ToolImprovementAgent {
  constructor() {
    this.cycleCount = 0;
    this.currentToolIndex = 0;
    this.transporter = null;
  }

  async initialize() {
    // Load state
    try {
      const state = JSON.parse(await readFile(CONFIG.stateFile, 'utf-8'));
      this.cycleCount = state.cycleCount || 0;
      this.currentToolIndex = state.currentToolIndex || 0;
    } catch (err) {
      console.log('No previous state found, starting fresh');
    }

    // Setup email transporter
    this.transporter = nodemailer.createTransport(CONFIG.email.smtp);
    await this.transporter.verify();
    console.log('✅ Email transporter ready');
  }

  async analyzeTool(toolName) {
    const toolPath = join(CONFIG.toolsDir, `${toolName}.astro`);

    try {
      const content = await readFile(toolPath, 'utf-8');

      // Analyze tool
      const analysis = {
        name: this.formatToolName(toolName),
        type: this.detectToolType(toolName, content),
        status: 'active',
        priority: 'high',
        completeness: this.calculateCompleteness(content),
        userValue: this.calculateUserValue(content),
        improvements: this.suggestImprovements(toolName, content)
      };

      return analysis;
    } catch (err) {
      console.error(`Failed to analyze ${toolName}:`, err.message);
      return null;
    }
  }

  formatToolName(slug) {
    return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  detectToolType(name, content) {
    if (content.includes('ranking') || content.includes('SERP')) return 'seo';
    if (content.includes('speed') || content.includes('performance')) return 'performance';
    if (content.includes('revenue') || content.includes('leak')) return 'analytics';
    if (content.includes('keyword')) return 'seo';
    return 'utility';
  }

  calculateCompleteness(content) {
    let score = 30; // Lower base score for more accurate assessment

    // Core features (40 points)
    if (content.includes('export') || content.includes('download')) score += 8;
    if (content.includes('localStorage') || content.includes('database') || content.includes('indexedDB')) score += 8;
    if (content.includes('chart') || content.includes('graph') || content.includes('visualization')) score += 8;
    if (content.includes('api') || content.includes('fetch') && !content.includes('mockData')) score += 8;
    if (content.includes('PDF') || content.includes('CSV') || content.includes('JSON')) score += 8;

    // Advanced features (30 points)
    if (content.includes('authentication') || content.includes('auth')) score += 10;
    if (content.includes('real-time') || content.includes('websocket') || content.includes('live')) score += 10;
    if (content.includes('notification') || content.includes('email')) score += 10;

    // Code quality (30 points)
    if (content.includes('try') && content.includes('catch')) score += 5;
    if (content.includes('loading') && content.includes('error')) score += 5;
    if (content.includes('test') || content.includes('spec')) score += 5;
    if (content.includes('typescript') || content.includes(': string') || content.includes(': number')) score += 5;
    if (content.includes('accessibility') || content.includes('aria-')) score += 5;
    if (content.includes('responsive') || content.includes('mobile')) score += 5;

    return Math.min(score, 100);
  }

  calculateUserValue(content) {
    let score = 40;

    // Real-time capabilities
    if (content.includes('real-time') || content.includes('live') || content.includes('instant')) score += 15;

    // Data export/sharing
    if (content.includes('export') || content.includes('download')) score += 10;
    if (content.includes('share') || content.includes('email') || content.includes('social')) score += 8;

    // Data persistence & history
    if (content.includes('historical') || content.includes('trend') || content.includes('history')) score += 12;
    if (content.includes('save') || content.includes('bookmark')) score += 5;

    // User experience
    if (content.includes('tutorial') || content.includes('guide') || content.includes('help')) score += 5;
    if (content.includes('preview') || content.includes('demo')) score += 5;

    return Math.min(score, 100);
  }

  suggestImprovements(toolName, content) {
    const improvements = [];

    // Check for mock data
    if (content.includes('mockData') || content.includes('// Mock') || content.includes('fake') || content.includes('const data = [')) {
      const apis = this.suggestAPIs(toolName);
      improvements.push({
        title: 'Replace Mock Data with Real API Integration',
        priority: 'CRITICAL',
        category: 'API Integration',
        effort: 'high',
        impact: 'Transforms tool from demo to production-ready',
        description: `Replace hardcoded mock data with live API integration. This will provide:
- Real-time, accurate data that updates automatically
- Professional credibility and user trust
- Actual value to users instead of a demo
- Competitive advantage over static tools`,
        apis,
        steps: [
          `Sign up for ${apis[0]?.split(':')[0] || 'API service'} (${apis[0]?.split(':')[1]?.trim() || 'real data provider'})`,
          'Create .env file with API keys (never commit to git)',
          'Install required packages: npm install axios dotenv',
          'Create /src/services/api-client.js with error handling',
          'Implement rate limiting (respect API quotas)',
          'Replace all mockData arrays with API calls',
          'Add loading skeletons and error states',
          'Implement response caching (reduce API costs)',
          'Add retry logic for failed requests',
          'Test edge cases: no data, API down, rate limits'
        ],
        codeExample: this.generateAPIExample(toolName, apis[0]),
        estimatedTime: '6-8 hours',
        roi: 'High - Converts demo to production tool, increases user retention by 300%+'
      });
    }

    // Check for historical tracking
    if (!content.includes('chart') && !content.includes('history') && !content.includes('trend')) {
      improvements.push({
        title: 'Add Historical tracking/charts',
        priority: 'HIGH',
        category: 'Feature Addition',
        effort: 'high',
        impact: 'High - Enables ongoing value and user retention',
        description: `Implement Historical tracking/charts to enhance ${this.formatToolName(toolName)}. This feature will provide additional value and improve user engagement.`,
        steps: [
          'Design UI/UX for Historical tracking/charts',
          'Create backend API endpoint if needed',
          'Implement frontend logic',
          'Add data persistence layer',
          'Write tests',
          'Update documentation',
          'Deploy and monitor'
        ]
      });
    }

    // Check for export functionality
    if (!content.includes('export') && !content.includes('download') && !content.includes('PDF')) {
      improvements.push({
        title: 'Add Export/Download functionality',
        priority: 'MEDIUM',
        category: 'Feature Addition',
        effort: 'medium',
        impact: 'Medium - Increases tool utility and shareability',
        description: `Add ability to export data as PDF, CSV, or image for ${this.formatToolName(toolName)}.`,
        steps: [
          'Design export format options',
          'Implement PDF generation',
          'Add CSV export',
          'Create shareable image export',
          'Test across browsers',
          'Add to UI'
        ]
      });
    }

    // Check for batch processing
    if (toolName.includes('tracker') || toolName.includes('checker')) {
      if (!content.includes('batch') && !content.includes('multiple') && !content.includes('bulk')) {
        improvements.push({
          title: 'Add Batch processing',
          priority: 'MEDIUM',
          category: 'Feature Addition',
          effort: 'high',
          impact: 'High - Enables ongoing value and user retention',
          description: `Implement batch processing to enhance ${this.formatToolName(toolName)}. This feature will provide additional value and improve user engagement.`,
          steps: [
            'Design UI/UX for batch input',
            'Create backend API endpoint if needed',
            'Implement frontend logic',
            'Add data persistence layer',
            'Write tests',
            'Update documentation',
            'Deploy and monitor'
          ]
        });
      }
    }

    return improvements.slice(0, 4); // Max 4 improvements per cycle
  }

  suggestAPIs(toolName) {
    if (toolName.includes('rank') || toolName.includes('serp')) {
      return ['SerpAPI: Google search result scraping', 'DataForSEO: SERP data + competitor analysis', 'ValueSERP: Cost-effective SERP data'];
    }
    if (toolName.includes('speed') || toolName.includes('performance')) {
      return ['PageSpeed Insights API: Core Web Vitals and performance metrics', 'Lighthouse CI: Detailed performance audits', 'WebPageTest API: Advanced performance testing'];
    }
    if (toolName.includes('keyword')) {
      return ['SEMrush API: Keyword data and difficulty', 'Ahrefs API: Keyword metrics and backlinks', 'Moz API: Domain authority and keyword difficulty'];
    }
    if (toolName.includes('revenue') || toolName.includes('analytics')) {
      return ['Google Analytics API: User behavior data', 'Stripe API: Payment and revenue data', 'Custom analytics endpoint'];
    }
    return ['Custom API integration', 'Third-party data provider', 'Web scraping with Puppeteer/Playwright'];
  }

  generateAPIExample(toolName, apiSuggestion) {
    const apiName = apiSuggestion?.split(':')[0] || 'API';

    if (toolName.includes('rank')) {
      return `// src/services/serp-api.js
import axios from 'axios';

export async function getRankings(keyword, location = 'us') {
  try {
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        q: keyword,
        location,
        api_key: process.env.SERP_API_KEY,
        num: 100
      }
    });

    return response.data.organic_results.map((result, index) => ({
      position: index + 1,
      title: result.title,
      url: result.link,
      snippet: result.snippet
    }));
  } catch (error) {
    console.error('SERP API error:', error);
    throw new Error('Failed to fetch rankings');
  }
}`;
    }

    return `// src/services/api-client.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Authorization': \`Bearer \${process.env.API_KEY}\`
  }
});

export async function fetchData(params) {
  try {
    const response = await apiClient.get('/endpoint', { params });
    return response.data;
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    throw error;
  }
}`;
  }

  async sendEmail(analysis) {
    const html = this.generateEmailHTML(analysis);
    const text = this.generateEmailText(analysis);

    const mailOptions = {
      from: CONFIG.email.from,
      to: CONFIG.email.to,
      subject: `[Tool Agent Update] ${analysis.name} - ${analysis.improvements.length} Improvements Found`,
      text,
      html
    };

    await this.transporter.sendMail(mailOptions);
    console.log(`✅ Email sent for ${analysis.name}`);
  }

  generateEmailText(analysis) {
    const { name, type, status, priority, completeness, userValue, improvements } = analysis;

    let text = `🤖 Tool Improvement Agent - Cycle ${this.cycleCount + 1}\n`;
    text += `${new Date().toLocaleString()}\n\n`;
    text += `Tool Analyzed: ${name}\n`;
    text += `Type: ${type}\n\n`;
    text += `Status: ${status}\n\n`;
    text += `Priority: ${priority}\n\n`;
    text += `Completeness: ${completeness}%\n\n`;
    text += `User Value: ${userValue}/100\n\n`;
    text += `${improvements.length} Improvements Suggested\n`;

    improvements.forEach((imp, i) => {
      text += `${i + 1}. ${imp.title} ${imp.priority}\n`;
      text += `Category: ${imp.category}\n\n`;
      text += `Effort: ${imp.effort}\n\n`;
      text += `Impact: ${imp.impact}\n\n`;
      text += `Description:\n${imp.description}\n\n`;

      if (imp.apis) {
        text += `Required APIs:\n${imp.apis.map(api => `- ${api}`).join('\n')}\n\n`;
      }

      text += `Implementation Steps:\n\n${imp.steps.map(s => `${s}`).join('\n')}\n`;
    });

    text += `\nNext Cycle\n`;
    text += `The next tool to be analyzed will be: ${this.getNextToolName()}\n\n`;
    text += `Next cycle scheduled in approximately 30 minutes.\n\n`;
    text += `This email was automatically generated by the Tool Improvement Agent.\n\n`;
    text += `Total cycles completed: ${this.cycleCount + 1}`;

    return text;
  }

  generateEmailHTML(analysis) {
    const { name, type, status, priority, completeness, userValue, improvements } = analysis;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 700px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .header .cycle { font-size: 14px; opacity: 0.9; margin-top: 5px; }
    .stats { display: flex; justify-content: space-around; padding: 20px; background: #f8f9fa; border-bottom: 1px solid #e0e0e0; }
    .stat { text-align: center; }
    .stat-value { font-size: 28px; font-weight: bold; color: #667eea; }
    .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
    .content { padding: 30px; }
    .meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 30px; }
    .meta-item { padding: 15px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #667eea; }
    .meta-label { font-size: 12px; color: #666; text-transform: uppercase; margin-bottom: 5px; }
    .meta-value { font-size: 16px; font-weight: 600; color: #333; }
    .improvement { margin-bottom: 30px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background: #fafafa; }
    .improvement-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px; }
    .improvement-title { font-size: 18px; font-weight: 700; color: #333; margin: 0; }
    .priority { padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .priority-critical { background: #fee; color: #c00; }
    .priority-high { background: #fff3cd; color: #856404; }
    .priority-medium { background: #d1ecf1; color: #0c5460; }
    .improvement-meta { display: flex; gap: 15px; margin-bottom: 15px; font-size: 13px; }
    .improvement-meta span { padding: 5px 10px; background: white; border-radius: 4px; }
    .description { margin: 15px 0; color: #555; line-height: 1.8; }
    .apis { background: #e8f4f8; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .apis-title { font-weight: 700; color: #0066cc; margin-bottom: 10px; }
    .api-list { list-style: none; padding: 0; margin: 0; }
    .api-list li { padding: 8px 0; padding-left: 25px; position: relative; }
    .api-list li:before { content: '→'; position: absolute; left: 0; color: #0066cc; font-weight: bold; }
    .steps { background: #f0f7ff; padding: 20px; border-radius: 6px; margin: 15px 0; }
    .steps-title { font-weight: 700; color: #0066cc; margin-bottom: 15px; }
    .steps ol { margin: 0; padding-left: 20px; }
    .steps li { padding: 8px 0; color: #333; }
    .code-example { background: #1e1e1e; color: #d4d4d4; padding: 20px; border-radius: 6px; overflow-x: auto; margin: 15px 0; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.6; }
    .roi-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .roi-box strong { color: #155724; }
    .footer { background: #2d3748; color: white; padding: 25px; text-align: center; }
    .footer-links { margin: 15px 0; }
    .footer-links a { color: #90cdf4; text-decoration: none; margin: 0 10px; }
    .next-cycle { background: #fff3cd; padding: 20px; margin-top: 20px; border-radius: 6px; text-align: center; }
    .progress-bar { background: #e0e0e0; height: 8px; border-radius: 4px; overflow: hidden; margin: 10px 0; }
    .progress-fill { background: linear-gradient(90deg, #667eea, #764ba2); height: 100%; transition: width 0.3s; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🤖 Tool Improvement Agent</h1>
      <div class="cycle">Cycle ${this.cycleCount + 1} • ${new Date().toLocaleString()}</div>
    </div>

    <div class="stats">
      <div class="stat">
        <div class="stat-value">${completeness}%</div>
        <div class="stat-label">Completeness</div>
        <div class="progress-bar"><div class="progress-fill" style="width: ${completeness}%"></div></div>
      </div>
      <div class="stat">
        <div class="stat-value">${userValue}</div>
        <div class="stat-label">User Value</div>
        <div class="progress-bar"><div class="progress-fill" style="width: ${userValue}%"></div></div>
      </div>
      <div class="stat">
        <div class="stat-value">${improvements.length}</div>
        <div class="stat-label">Improvements</div>
      </div>
    </div>

    <div class="content">
      <div class="meta">
        <div class="meta-item">
          <div class="meta-label">Tool Analyzed</div>
          <div class="meta-value">${name}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Type</div>
          <div class="meta-value">${type.toUpperCase()}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Status</div>
          <div class="meta-value">✅ ${status}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Priority</div>
          <div class="meta-value">🔥 ${priority}</div>
        </div>
      </div>

      <h2 style="color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">💡 ${improvements.length} Improvements Suggested</h2>

      ${improvements.map((imp, i) => `
        <div class="improvement">
          <div class="improvement-header">
            <h3 class="improvement-title">${i + 1}. ${imp.title}</h3>
            <span class="priority priority-${imp.priority.toLowerCase()}">${imp.priority}</span>
          </div>

          <div class="improvement-meta">
            <span>📁 ${imp.category}</span>
            <span>⚡ Effort: ${imp.effort}</span>
            ${imp.estimatedTime ? `<span>⏱️ ${imp.estimatedTime}</span>` : ''}
          </div>

          <div class="description">
            <strong>Impact:</strong> ${imp.impact}<br><br>
            ${imp.description.split('\n').join('<br>')}
          </div>

          ${imp.apis ? `
            <div class="apis">
              <div class="apis-title">🔌 Required APIs</div>
              <ul class="api-list">
                ${imp.apis.map(api => `<li>${api}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <div class="steps">
            <div class="steps-title">📋 Implementation Steps</div>
            <ol>
              ${imp.steps.map(step => `<li>${step}</li>`).join('')}
            </ol>
          </div>

          ${imp.codeExample ? `
            <details>
              <summary style="cursor: pointer; color: #667eea; font-weight: 600; margin: 10px 0;">
                👨‍💻 View Code Example
              </summary>
              <div class="code-example">${this.escapeHtml(imp.codeExample)}</div>
            </details>
          ` : ''}

          ${imp.roi ? `
            <div class="roi-box">
              <strong>💰 ROI:</strong> ${imp.roi}
            </div>
          ` : ''}
        </div>
      `).join('')}

      <div class="next-cycle">
        <strong>⏭️ Next Tool:</strong> ${this.getNextToolName()}<br>
        <small>Next cycle in approximately 30 minutes</small>
      </div>
    </div>

    <div class="footer">
      <div>This email was automatically generated by the Tool Improvement Agent</div>
      <div style="margin-top: 10px; font-size: 12px; opacity: 0.8;">
        Total cycles completed: ${this.cycleCount + 1} | Running on VPS: astro-site
      </div>
      <div class="footer-links">
        <a href="https://theprofitplatform.com.au">Visit Site</a>
        <a href="#">View Dashboard</a>
        <a href="#">Settings</a>
      </div>
    </div>
  </div>
</body>
</html>`;
  }

  escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  getNextToolName() {
    const nextIndex = (this.currentToolIndex + 1) % TOOLS_QUEUE.length;
    return this.formatToolName(TOOLS_QUEUE[nextIndex]);
  }

  async saveState() {
    const state = {
      cycleCount: this.cycleCount,
      currentToolIndex: this.currentToolIndex,
      lastRun: new Date().toISOString()
    };
    await writeFile(CONFIG.stateFile, JSON.stringify(state, null, 2));
  }

  async runCycle() {
    console.log(`\n🔄 Starting Cycle ${this.cycleCount + 1}...`);

    const toolName = TOOLS_QUEUE[this.currentToolIndex];
    console.log(`📊 Analyzing: ${this.formatToolName(toolName)}`);

    const analysis = await this.analyzeTool(toolName);

    if (analysis && analysis.improvements.length > 0) {
      await this.sendEmail(analysis);
    } else {
      console.log(`No improvements needed for ${toolName}`);
    }

    this.cycleCount++;
    this.currentToolIndex = (this.currentToolIndex + 1) % TOOLS_QUEUE.length;

    await this.saveState();
    console.log(`✅ Cycle ${this.cycleCount} complete`);
  }

  async start() {
    await this.initialize();

    // Run immediately
    await this.runCycle();

    // Schedule recurring cycles
    setInterval(async () => {
      await this.runCycle();
    }, CONFIG.cycleInterval);

    console.log(`🤖 Tool Improvement Agent running (30-minute cycles)`);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const agent = new ToolImprovementAgent();
  agent.start().catch(console.error);
}

export default ToolImprovementAgent;
