import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import axios from 'axios';
import { saveRankCheck, getRankHistory, getTrackedKeywords, getRankComparison } from './database.js';
import { runSpeedTest, getPerformanceGrade } from './speed-test.js';
import { researchKeywords } from './keyword-research.js';
import { analyzeCompetitors } from './competitor-analysis.js';
import { generateContent } from './content-generator.js';
import { generateMetaTags } from './meta-tag-generator.js';

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

// SEO Audit endpoint - Rate limited
const seoAuditLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 audits per minute
  message: { success: false, error: 'Too many audit requests. Please wait a minute before trying again.' }
});

app.post('/api/seo-audit', seoAuditLimiter, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    // Validate URL format
    let websiteUrl;
    try {
      websiteUrl = new URL(url);
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format. Must include protocol (http:// or https://)'
      });
    }

    console.log('🔍 Starting SEO audit for:', url);

    // Fetch the page content
    const pageResponse = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Accept redirects
      }
    });

    const html = pageResponse.data;
    const isHttps = websiteUrl.protocol === 'https:';

    // Parse HTML for analysis
    const auditResults = {
      url,
      timestamp: new Date().toISOString(),
      overallScore: 0,
      categoryScores: {},
      meta: {},
      performance: {},
      content: {},
      technical: {},
      mobile: {},
      actionItems: []
    };

    // ==========================================
    // META TAGS ANALYSIS
    // ==========================================

    // Title tag
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      const titleLength = titleMatch[1].trim().length;
      auditResults.meta.title = {
        value: titleMatch[1].trim(),
        status: titleLength >= 30 && titleLength <= 60 ? 'pass' : 'warning',
        message: titleLength < 30 ? 'Title is too short (min 30 chars)' :
                 titleLength > 60 ? 'Title is too long (max 60 chars)' :
                 `Perfect title length (${titleLength} chars)`
      };
      if (titleLength < 30 || titleLength > 60) {
        auditResults.actionItems.push({
          priority: 'high',
          title: 'Optimize Title Tag Length',
          description: `Your title tag is ${titleLength} characters. Ideal length is 30-60 characters for best SEO.`
        });
      }
    } else {
      auditResults.meta.title = {
        value: 'Missing',
        status: 'fail',
        message: 'No title tag found - critical for SEO!'
      };
      auditResults.actionItems.push({
        priority: 'high',
        title: 'Add Title Tag',
        description: 'Your page is missing a title tag. This is critical for SEO and search engine rankings.'
      });
    }

    // Meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    if (descMatch && descMatch[1]) {
      const descLength = descMatch[1].trim().length;
      auditResults.meta.description = {
        value: descMatch[1].trim(),
        status: descLength >= 120 && descLength <= 160 ? 'pass' : 'warning',
        message: descLength < 120 ? 'Description is too short (min 120 chars)' :
                 descLength > 160 ? 'Description is too long (max 160 chars)' :
                 `Perfect description length (${descLength} chars)`
      };
      if (descLength < 120 || descLength > 160) {
        auditResults.actionItems.push({
          priority: 'high',
          title: 'Optimize Meta Description',
          description: `Your meta description is ${descLength} characters. Ideal length is 120-160 characters.`
        });
      }
    } else {
      auditResults.meta.description = {
        value: 'Missing',
        status: 'fail',
        message: 'No meta description - this affects click-through rates'
      };
      auditResults.actionItems.push({
        priority: 'high',
        title: 'Add Meta Description',
        description: 'Add a compelling meta description (120-160 characters) to improve click-through rates from search results.'
      });
    }

    // Open Graph tags
    const ogTags = (html.match(/<meta[^>]*property=["']og:[^"']+["'][^>]*>/gi) || []).length;
    auditResults.meta.og = {
      count: ogTags,
      status: ogTags >= 4 ? 'pass' : ogTags > 0 ? 'warning' : 'fail',
      message: ogTags >= 4 ? `Found ${ogTags} Open Graph tags` :
               ogTags > 0 ? `Found ${ogTags} OG tags, recommend at least 4` :
               'No Open Graph tags found - poor social sharing'
    };
    if (ogTags < 4) {
      auditResults.actionItems.push({
        priority: 'medium',
        title: 'Add Open Graph Tags',
        description: 'Add og:title, og:description, og:image, and og:url tags for better social media sharing.'
      });
    }

    // Canonical URL
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
    auditResults.meta.canonical = {
      value: canonicalMatch ? canonicalMatch[1] : 'Missing',
      status: canonicalMatch ? 'pass' : 'warning',
      message: canonicalMatch ? 'Canonical URL set correctly' : 'No canonical URL - can cause duplicate content issues'
    };

    // ==========================================
    // CONTENT ANALYSIS
    // ==========================================

    // H1 tag
    const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
    auditResults.content.h1 = {
      value: h1Matches.length === 1 ? h1Matches[0].replace(/<[^>]+>/g, '') :
             h1Matches.length > 1 ? `${h1Matches.length} H1 tags (should be 1)` : 'Missing',
      status: h1Matches.length === 1 ? 'pass' : 'warning',
      message: h1Matches.length === 1 ? 'Perfect - one H1 tag found' :
               h1Matches.length > 1 ? 'Multiple H1 tags found - should only have one' :
               'No H1 tag found - add one for better SEO'
    };
    if (h1Matches.length !== 1) {
      auditResults.actionItems.push({
        priority: 'high',
        title: h1Matches.length > 1 ? 'Fix Multiple H1 Tags' : 'Add H1 Tag',
        description: h1Matches.length > 1 ?
          'You have multiple H1 tags. Use only one H1 per page for best SEO practices.' :
          'Add an H1 tag with your main keyword to improve SEO.'
      });
    }

    // Heading structure
    const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
    const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;
    auditResults.content.headings = {
      value: `H2: ${h2Count}, H3: ${h3Count}`,
      status: h2Count >= 2 ? 'pass' : 'warning',
      message: h2Count >= 2 ? 'Good heading structure' : 'Add more H2 headings for better structure'
    };

    // Word count
    const textContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                           .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                           .replace(/<[^>]+>/g, ' ')
                           .replace(/\s+/g, ' ')
                           .trim();
    const wordCount = textContent.split(/\s+/).length;
    auditResults.content.wordCount = {
      value: wordCount,
      status: wordCount >= 300 ? 'pass' : 'warning',
      message: wordCount >= 300 ? `Good content length (${wordCount} words)` :
               `Content is thin (${wordCount} words) - aim for 300+ words`
    };
    if (wordCount < 300) {
      auditResults.actionItems.push({
        priority: 'medium',
        title: 'Increase Content Length',
        description: `Your page has only ${wordCount} words. Add more quality content (aim for 300+ words) to rank better.`
      });
    }

    // Internal links
    const internalLinks = (html.match(/<a[^>]*href=["'][^"']*["'][^>]*>/gi) || [])
      .filter(link => !link.includes('http') || link.includes(websiteUrl.hostname)).length;
    auditResults.content.internalLinks = {
      value: internalLinks,
      status: internalLinks >= 3 ? 'pass' : 'warning',
      message: internalLinks >= 3 ? `Found ${internalLinks} internal links` :
               'Add more internal links to improve site structure'
    };

    // ==========================================
    // TECHNICAL SEO
    // ==========================================

    // HTTPS
    auditResults.technical.https = {
      value: isHttps ? 'Yes' : 'No',
      status: isHttps ? 'pass' : 'fail',
      message: isHttps ? 'Site uses HTTPS - secure' : 'Site is not using HTTPS - security risk!'
    };
    if (!isHttps) {
      auditResults.actionItems.push({
        priority: 'high',
        title: 'Enable HTTPS',
        description: 'Your site is not secure. Enable HTTPS with an SSL certificate to improve security and SEO.'
      });
    }

    // Robots.txt check
    try {
      const robotsUrl = `${websiteUrl.protocol}//${websiteUrl.hostname}/robots.txt`;
      const robotsResponse = await axios.get(robotsUrl, { timeout: 3000 });
      auditResults.technical.robots = {
        value: 'Found',
        status: 'pass',
        message: 'robots.txt file exists'
      };
    } catch (e) {
      auditResults.technical.robots = {
        value: 'Missing',
        status: 'warning',
        message: 'No robots.txt found - consider adding one'
      };
    }

    // Sitemap check
    try {
      const sitemapUrl = `${websiteUrl.protocol}//${websiteUrl.hostname}/sitemap.xml`;
      const sitemapResponse = await axios.get(sitemapUrl, { timeout: 3000 });
      auditResults.technical.sitemap = {
        value: 'Found',
        status: 'pass',
        message: 'XML sitemap exists'
      };
    } catch (e) {
      auditResults.technical.sitemap = {
        value: 'Missing',
        status: 'warning',
        message: 'No sitemap.xml found - helps search engines crawl your site'
      };
      auditResults.actionItems.push({
        priority: 'medium',
        title: 'Create XML Sitemap',
        description: 'Add an XML sitemap to help search engines discover and index your pages.'
      });
    }

    // Structured data
    const hasJsonLd = html.includes('application/ld+json');
    const hasMicrodata = html.includes('itemscope') || html.includes('itemtype');
    auditResults.technical.structuredData = {
      value: hasJsonLd || hasMicrodata ? 'Found' : 'None',
      status: hasJsonLd || hasMicrodata ? 'pass' : 'warning',
      message: hasJsonLd ? 'JSON-LD structured data found' :
               hasMicrodata ? 'Microdata found' :
               'No structured data - helps search engines understand content'
    };

    // ==========================================
    // MOBILE & ACCESSIBILITY
    // ==========================================

    // Viewport meta tag
    const viewportMatch = html.match(/<meta[^>]*name=["']viewport["'][^>]*>/i);
    auditResults.mobile.viewport = {
      value: viewportMatch ? 'Present' : 'Missing',
      status: viewportMatch ? 'pass' : 'fail',
      message: viewportMatch ? 'Mobile viewport configured' : 'Missing viewport tag - not mobile friendly!'
    };
    if (!viewportMatch) {
      auditResults.actionItems.push({
        priority: 'high',
        title: 'Add Viewport Meta Tag',
        description: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> for mobile optimization.'
      });
    }

    // Mobile friendly check
    const hasMobileClasses = html.includes('mobile') || html.includes('responsive');
    auditResults.mobile.friendly = {
      value: hasMobileClasses ? 'Likely' : 'Unknown',
      status: hasMobileClasses ? 'pass' : 'warning',
      message: hasMobileClasses ? 'Appears to be mobile-friendly' : 'Mobile-friendliness unclear'
    };

    // Alt tags
    const images = (html.match(/<img[^>]*>/gi) || []);
    const imagesWithAlt = images.filter(img => img.includes('alt=')).length;
    const altPercentage = images.length > 0 ? Math.round((imagesWithAlt / images.length) * 100) : 100;
    auditResults.mobile.altTags = {
      value: altPercentage,
      status: altPercentage === 100 ? 'pass' : altPercentage >= 80 ? 'warning' : 'fail',
      message: altPercentage === 100 ? 'All images have alt tags' :
               `${imagesWithAlt}/${images.length} images have alt tags`
    };
    if (altPercentage < 100) {
      auditResults.actionItems.push({
        priority: 'medium',
        title: 'Add Alt Tags to Images',
        description: `${images.length - imagesWithAlt} images are missing alt tags. Add descriptive alt text for accessibility and SEO.`
      });
    }

    // ==========================================
    // PERFORMANCE (Basic checks without Lighthouse)
    // ==========================================

    const pageSize = Buffer.byteLength(html, 'utf8') / 1024; // KB
    auditResults.performance.loadTime = {
      value: pageSize > 500 ? '>3s (estimated)' : '<3s (estimated)',
      status: pageSize > 500 ? 'warning' : 'pass',
      message: pageSize > 500 ? 'Large page size may slow loading' : 'Reasonable page size'
    };

    const totalImages = images.length;
    auditResults.performance.imagesOptimized = {
      value: totalImages > 20 ? 'Check needed' : 'Likely OK',
      status: totalImages > 20 ? 'warning' : 'pass',
      message: totalImages > 20 ? `${totalImages} images found - consider lazy loading` :
               `${totalImages} images found`
    };

    const hasMinifiedCss = html.includes('.min.css');
    const hasMinifiedJs = html.includes('.min.js');
    auditResults.performance.minified = {
      value: hasMinifiedCss && hasMinifiedJs ? 'Yes' : 'Partial',
      status: hasMinifiedCss && hasMinifiedJs ? 'pass' : 'warning',
      message: hasMinifiedCss && hasMinifiedJs ? 'Resources appear minified' :
               'Some resources may not be minified'
    };

    // ==========================================
    // CALCULATE SCORES
    // ==========================================

    // Category scores
    const metaScore = calculateCategoryScore([
      auditResults.meta.title?.status,
      auditResults.meta.description?.status,
      auditResults.meta.og?.status,
      auditResults.meta.canonical?.status
    ]);

    const contentScore = calculateCategoryScore([
      auditResults.content.h1?.status,
      auditResults.content.headings?.status,
      auditResults.content.wordCount?.status,
      auditResults.content.internalLinks?.status
    ]);

    const technicalScore = calculateCategoryScore([
      auditResults.technical.https?.status,
      auditResults.technical.robots?.status,
      auditResults.technical.sitemap?.status,
      auditResults.technical.structuredData?.status
    ]);

    const mobileScore = calculateCategoryScore([
      auditResults.mobile.viewport?.status,
      auditResults.mobile.friendly?.status,
      auditResults.mobile.altTags?.status
    ]);

    const performanceScore = calculateCategoryScore([
      auditResults.performance.loadTime?.status,
      auditResults.performance.imagesOptimized?.status,
      auditResults.performance.minified?.status
    ]);

    auditResults.categoryScores = {
      'Meta Tags': metaScore,
      'Content': contentScore,
      'Technical SEO': technicalScore,
      'Mobile': mobileScore,
      'Performance': performanceScore
    };

    // Overall score (weighted average)
    auditResults.overallScore = Math.round(
      (metaScore * 0.25) +
      (contentScore * 0.25) +
      (technicalScore * 0.2) +
      (mobileScore * 0.15) +
      (performanceScore * 0.15)
    );

    // Sort action items by priority
    auditResults.actionItems.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    console.log('✅ SEO audit completed:', {
      url,
      overallScore: auditResults.overallScore,
      actionItems: auditResults.actionItems.length
    });

    res.json({
      success: true,
      ...auditResults
    });

  } catch (error) {
    console.error('❌ SEO audit error:', error.message);

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return res.status(400).json({
        success: false,
        error: 'Unable to reach the website. Please check the URL and try again.'
      });
    }

    if (error.message.includes('timeout')) {
      return res.status(408).json({
        success: false,
        error: 'Request timed out. The website took too long to respond.'
      });
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. The website is blocking automated requests. This is common for sites with strict bot protection (Cloudflare, etc).'
      });
    }

    // Handle other HTTP errors
    if (error.response?.status) {
      return res.status(error.response.status).json({
        success: false,
        error: `Website returned error ${error.response.status}. The site may be temporarily unavailable or blocking requests.`
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to audit website. Please try again.'
    });
  }
});

// Helper function to calculate category score
function calculateCategoryScore(statuses) {
  const weights = { pass: 100, warning: 50, fail: 0 };
  const total = statuses.reduce((sum, status) => sum + (weights[status] || 0), 0);
  return Math.round(total / statuses.length);
}

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

// ==========================================
// KEYWORD RESEARCH API
// ==========================================
const keywordResearchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 keyword research per minute
  message: { success: false, error: 'Too many keyword research requests. Please wait a minute before trying again.' }
});

app.post('/api/keyword-research', keywordResearchLimiter, async (req, res) => {
  try {
    const { keyword, location, intent } = req.body;

    // Validation
    if (!keyword || keyword.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Keyword is required and must be at least 2 characters'
      });
    }

    if (!location) {
      return res.status(400).json({
        success: false,
        error: 'Location is required'
      });
    }

    console.log('🔑 Starting keyword research:', { keyword, location, intent });

    // Research keywords
    const results = researchKeywords(keyword, location, intent || 'all');

    console.log('✅ Keyword research completed:', {
      keyword,
      totalKeywords: results.keywords.length,
      clusters: results.clusters.length
    });

    res.json({
      success: true,
      ...results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Keyword research error:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to research keywords. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Rate limiter for competitor analysis - 10 per hour
const competitorAnalysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { success: false, error: 'Too many competitor analysis requests. Please wait an hour before trying again.' }
});

app.post('/api/competitor-analysis', competitorAnalysisLimiter, async (req, res) => {
  try {
    const { yourDomain, competitorDomain } = req.body;

    // Validation
    if (!yourDomain || !competitorDomain) {
      return res.status(400).json({
        success: false,
        error: 'Both your domain and competitor domain are required'
      });
    }

    // Basic domain validation - allow any reasonable domain format
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    const cleanYourDomain = yourDomain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    const cleanCompetitorDomain = competitorDomain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];

    if (!cleanYourDomain || !cleanCompetitorDomain) {
      return res.status(400).json({
        success: false,
        error: 'Both your domain and competitor domain are required'
      });
    }

    if (!domainRegex.test(cleanYourDomain) || !domainRegex.test(cleanCompetitorDomain)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid domain format. Please enter valid domain names.'
      });
    }

    console.log('🔍 Starting competitor analysis:', {
      yourDomain: cleanYourDomain,
      competitorDomain: cleanCompetitorDomain
    });

    // Analyze competitors
    const results = await analyzeCompetitors(yourDomain, competitorDomain);

    console.log('✅ Competitor analysis completed:', {
      yourDomain: results.yourDomain,
      competitorDomain: results.competitorDomain,
      opportunities: results.opportunities.length
    });

    res.json({
      ...results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Competitor analysis error:', error.message);

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze competitor. Please check the domains and try again.'
    });
  }
});

// ==========================================
// CONTENT GENERATOR API
// ==========================================
const contentGeneratorLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 content generations per minute
  message: { success: false, error: 'Too many content generation requests. Please wait a minute before trying again.' }
});

app.post('/api/content-generator', contentGeneratorLimiter, async (req, res) => {
  try {
    const { contentType, topic, tone, length, targetAudience } = req.body;

    // Validation
    if (!contentType || !topic || !tone || !length) {
      return res.status(400).json({
        success: false,
        error: 'Content type, topic, tone, and length are required'
      });
    }

    // Validate content type
    const validContentTypes = ['blog_post', 'product_description', 'meta_description', 'social_media', 'email', 'landing_page', 'article'];
    if (!validContentTypes.includes(contentType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid content type'
      });
    }

    // Validate tone
    const validTones = ['professional', 'friendly', 'casual', 'formal', 'persuasive', 'informative'];
    if (!validTones.includes(tone)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid tone'
      });
    }

    // Validate length
    const validLengths = ['short', 'medium', 'long'];
    if (!validLengths.includes(length)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid length'
      });
    }

    console.log('🤖 Generating content:', { contentType, topic, tone, length, targetAudience });

    // Generate content
    const results = await generateContent(contentType, topic, tone, length, targetAudience);

    console.log('✅ Content generated:', {
      contentType,
      topic,
      wordCount: results.wordCount,
      seoScore: results.seoAnalysis.seoScore
    });

    res.json({
      ...results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Content generation error:', error.message);

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate content. Please try again.'
    });
  }
});

// Meta Tag Generator endpoint - Rate limited
const metaTagLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: { success: false, error: 'Too many requests. Please try again in a minute.' }
});

app.post('/api/meta-tag-generator', metaTagLimiter, async (req, res) => {
  try {
    const {
      topic,
      businessName,
      location,
      pageType,
      includeYear,
      includeCTA,
      canonicalUrl,
      customTitle,
      customDescription
    } = req.body;

    // Validate required fields
    if (!topic && !customTitle) {
      return res.status(400).json({
        success: false,
        error: 'Topic or custom title is required'
      });
    }

    console.log('🏷️  Generating meta tags:', { topic, businessName, location, pageType });

    // Generate meta tags
    const results = await generateMetaTags({
      topic,
      businessName: businessName || '',
      location: location || '',
      pageType: pageType || 'general',
      includeYear: includeYear || false,
      includeCTA: includeCTA !== false, // default to true
      canonicalUrl: canonicalUrl || '',
      customTitle: customTitle || '',
      customDescription: customDescription || ''
    });

    console.log('✅ Meta tags generated:', {
      topic,
      titleLength: results.metaTags.title.length,
      descriptionLength: results.metaTags.description.length,
      overallScore: results.analysis.overallScore
    });

    res.json({
      ...results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Meta tag generation error:', error.message);

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate meta tags. Please try again.'
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
