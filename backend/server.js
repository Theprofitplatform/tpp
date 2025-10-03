import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import axios from 'axios';
import { saveRankCheck, getRankHistory, getTrackedKeywords, getRankComparison } from './database.js';
import { runSpeedTest, getPerformanceGrade } from './speed-test.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4321;

// Trust proxy (Cloudflare tunnel - trust first hop only)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3001',
    'https://theprofitplatform.com.au',
    'https://*.theprofitplatform.com.au'
  ]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - 5 submissions per 15 minutes per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many form submissions. Please try again in 15 minutes.' }
});

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verify email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Honeypot spam detection
const isSpam = (body) => {
  // Check honeypot field
  if (body._gotcha) {
    return true;
  }
  // Check for suspicious patterns
  if (body.message && body.message.includes('http') && body.message.length > 1000) {
    return true;
  }
  return false;
};

// Validation middleware
const validateContactForm = (req, res, next) => {
  const { name, email, service, message } = req.body;

  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required');
  }

  if (!service) {
    errors.push('Service selection is required');
  }

  if (!message || message.trim().length < 10) {
    errors.push('Message must be at least 10 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'TPP Backend API'
  });
});

// Contact form endpoint
app.post('/api/contact', contactLimiter, validateContactForm, async (req, res) => {
  try {
    const { name, email, phone, company, service, budget, message, consent } = req.body;

    // Spam detection
    if (isSpam(req.body)) {
      console.warn('🚨 Spam submission blocked:', email);
      return res.status(400).json({ success: false, error: 'Invalid submission' });
    }

    // Prepare email content
    const emailContent = `
New Contact Form Submission
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Contact Details:
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Company: ${company || 'Not provided'}

💼 Service Information:
Service: ${service}
Budget: ${budget || 'Not specified'}

📝 Message:
${message}

🔒 Consent: ${consent ? 'Yes' : 'No'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Submitted: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}
IP: ${req.ip}
    `.trim();

    // Send email to business
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL || 'avi@theprofitplatform.com.au',
      replyTo: email,
      subject: `🎯 New Lead: ${service} - ${name}`,
      text: emailContent,
      html: `<pre style="font-family: monospace; font-size: 14px;">${emailContent}</pre>`
    });

    // Send auto-reply to customer
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Thank you for contacting The Profit Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Thank you for your inquiry, ${name}!</h2>
          <p>We've received your message about <strong>${service}</strong> and will get back to you within 24 hours.</p>
          <p>In the meantime, feel free to:</p>
          <ul>
            <li>Call us at <a href="tel:+61487286451">0487 286 451</a></li>
            <li>Check out our <a href="https://theprofitplatform.com.au/portfolio">portfolio</a></li>
            <li>Read our <a href="https://theprofitplatform.com.au/blog">latest blog posts</a></li>
          </ul>
          <p>Best regards,<br>The Profit Platform Team</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="font-size: 12px; color: #6b7280;">
            This is an automated response. Please do not reply to this email.
          </p>
        </div>
      `
    });

    // Log successful submission
    console.log('✅ Contact form submission:', {
      name,
      email,
      service,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Thank you! Your message has been sent successfully.'
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message. Please try again or email us directly.'
    });
  }
});

// n8n Workflow Trigger endpoint - Rate limited
const n8nLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 workflow triggers per minute
  message: { success: false, error: 'Too many requests. Please try again in a minute.' }
});

app.post('/api/n8n/trigger', n8nLimiter, async (req, res) => {
  try {
    const { workflowId, password } = req.body;

    if (!workflowId) {
      return res.status(400).json({
        success: false,
        error: 'Workflow ID is required'
      });
    }

    // Optional password protection
    if (process.env.N8N_PAGE_PASSWORD && password !== process.env.N8N_PAGE_PASSWORD) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password'
      });
    }

    // Get webhook URL from environment
    const webhookUrl = process.env[`N8N_WORKFLOW_${workflowId}_WEBHOOK`];
    const workflowName = process.env[`N8N_WORKFLOW_${workflowId}_NAME`] || workflowId;

    if (!webhookUrl) {
      return res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

    // Trigger n8n webhook
    const response = await axios.post(webhookUrl, {
      triggeredBy: 'manual',
      timestamp: new Date().toISOString(),
      source: 'tpp-admin-panel'
    }, {
      timeout: 5000
    });

    console.log('✅ n8n workflow triggered:', { workflowId, workflowName, status: response.status });

    res.json({
      success: true,
      message: `Workflow "${workflowName}" triggered successfully`,
      workflowId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ n8n trigger error:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to trigger workflow. Please check n8n configuration.'
    });
  }
});

// Get available workflows
app.get('/api/n8n/workflows', async (req, res) => {
  try {
    const { password } = req.query;

    // Optional password protection
    if (process.env.N8N_PAGE_PASSWORD && password !== process.env.N8N_PAGE_PASSWORD) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password'
      });
    }

    // Parse workflow configurations from environment
    const workflows = [];
    let i = 1;

    while (process.env[`N8N_WORKFLOW_${i}_NAME`]) {
      workflows.push({
        id: i.toString(),
        name: process.env[`N8N_WORKFLOW_${i}_NAME`],
        icon: process.env[`N8N_WORKFLOW_${i}_ICON`] || '🤖'
      });
      i++;
    }

    res.json({
      success: true,
      workflows,
      requiresPassword: !!process.env.N8N_PAGE_PASSWORD
    });

  } catch (error) {
    console.error('❌ n8n workflows list error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to load workflows'
    });
  }
});

// SERP API endpoint - Rate limited
const serpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: { success: false, error: 'Too many requests. Please try again in a minute.' }
});

app.post('/api/serp/rank-check', serpLimiter, async (req, res) => {
  try {
    const { keyword, location = 'Australia', domain } = req.body;

    if (!keyword || !domain) {
      return res.status(400).json({
        success: false,
        error: 'Keyword and domain are required'
      });
    }

    if (!process.env.SERP_API_KEY) {
      console.error('❌ SERP_API_KEY not configured');
      return res.status(500).json({
        success: false,
        error: 'SERP API not configured'
      });
    }

    // Call SerpAPI
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        q: keyword,
        location: location,
        api_key: process.env.SERP_API_KEY,
        num: 100, // Get top 100 results
        engine: 'google'
      },
      timeout: 10000
    });

    const organicResults = response.data.organic_results || [];

    // Find domain rank
    let rank = null;
    let foundResult = null;

    for (let i = 0; i < organicResults.length; i++) {
      const result = organicResults[i];
      const resultDomain = new URL(result.link).hostname.replace('www.', '');
      const searchDomain = domain.replace('www.', '').replace('https://', '').replace('http://', '');

      if (resultDomain.includes(searchDomain) || searchDomain.includes(resultDomain)) {
        rank = result.position;
        foundResult = {
          position: result.position,
          title: result.title,
          link: result.link,
          snippet: result.snippet
        };
        break;
      }
    }

    console.log('✅ SERP check:', { keyword, domain, rank, location });

    // Save to database for historical tracking
    const responseData = {
      keyword,
      domain,
      location,
      rank,
      found: rank !== null,
      result: foundResult,
      totalResults: organicResults.length,
      timestamp: new Date().toISOString()
    };

    try {
      saveRankCheck(responseData);
      console.log('💾 Rank check saved to database');
    } catch (dbError) {
      console.error('❌ Database save error:', dbError.message);
      // Continue even if database save fails
    }

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('❌ SERP API error:', error.message);

    if (error.response?.status === 401) {
      return res.status(500).json({
        success: false,
        error: 'Invalid SERP API key'
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'SERP API rate limit exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to check ranking. Please try again.'
    });
  }
});

// Get rank history endpoint
app.get('/api/serp/history', async (req, res) => {
  try {
    const { domain, keyword, location, limit } = req.query;

    if (!domain || !keyword) {
      return res.status(400).json({
        success: false,
        error: 'Domain and keyword are required'
      });
    }

    const history = getRankHistory(
      domain,
      keyword,
      location || null,
      parseInt(limit) || 30
    );

    // Get comparison data if we have history
    let comparison = null;
    if (history.length > 1) {
      comparison = getRankComparison(domain, keyword, location || null);
    }

    res.json({
      success: true,
      data: {
        domain,
        keyword,
        location: location || 'Australia',
        history,
        comparison,
        count: history.length
      }
    });

  } catch (error) {
    console.error('❌ History fetch error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch history'
    });
  }
});

// Get tracked keywords for a domain
app.get('/api/serp/tracked-keywords', async (req, res) => {
  try {
    const { domain, limit } = req.query;

    if (!domain) {
      return res.status(400).json({
        success: false,
        error: 'Domain is required'
      });
    }

    const keywords = getTrackedKeywords(domain, parseInt(limit) || 50);

    res.json({
      success: true,
      data: {
        domain,
        keywords,
        count: keywords.length
      }
    });

  } catch (error) {
    console.error('❌ Tracked keywords error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tracked keywords'
    });
  }
});

// Speed Test endpoint - Rate limited (heavy operation)
const speedTestLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 2, // Only 2 speed tests per minute
  message: { success: false, error: 'Too many speed tests. Please wait a minute before testing again.' }
});

app.post('/api/speed-test', speedTestLimiter, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format. Must include protocol (http:// or https://)'
      });
    }

    console.log('🚀 Starting speed test for:', url);

    // Run Lighthouse test
    const results = await runSpeedTest(url);

    // Add performance grade
    const performanceGrade = getPerformanceGrade(results.scores.performance);
    results.performanceGrade = performanceGrade;

    console.log('✅ Speed test completed:', {
      url: results.url,
      performance: results.scores.performance,
      grade: performanceGrade.grade
    });

    res.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Speed test error:', error.message);

    // Handle specific error cases
    if (error.message.includes('net::ERR')) {
      return res.status(400).json({
        success: false,
        error: 'Unable to reach the website. Please check the URL and try again.'
      });
    }

    if (error.message.includes('timeout')) {
      return res.status(408).json({
        success: false,
        error: 'Speed test timed out. The website took too long to respond.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to run speed test. Please try again.'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 TPP Backend API Server Running
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
⏰ Started: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

export default app;
