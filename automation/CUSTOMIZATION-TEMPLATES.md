# 🎨 Customization Templates & Examples

**Adapt the automation system to your specific business needs**

---

## 📋 Table of Contents

1. [Industry-Specific Prompts](#industry-specific-prompts)
2. [Brand Voice Templates](#brand-voice-templates)
3. [Configuration Templates](#configuration-templates)
4. [Custom Automation Workflows](#custom-automation-workflows)
5. [Output Format Templates](#output-format-templates)
6. [Integration Templates](#integration-templates)
7. [Advanced Customizations](#advanced-customizations)

---

## 🏭 Industry-Specific Prompts

### For Restaurants

**Suburb Page Template:**

Edit `automation/scripts/generate-suburb-pages.mjs`:

```javascript
const prompt = `You are an expert restaurant marketing writer specializing in local SEO.

Write a comprehensive landing page for ${suburb.name}, ${suburb.postcode}.

BUSINESS CONTEXT:
- Restaurant name: [Your Restaurant Name]
- Cuisine type: [e.g., Modern Australian, Italian, Asian Fusion]
- Service areas: Dine-in, takeaway, delivery
- Unique selling points: [e.g., farm-to-table, family recipes, chef background]

CONTENT REQUIREMENTS:
1. **Hero Section** (150 words)
   - Hook about ${suburb.name}'s dining culture
   - Mention we serve the best [cuisine type] in ${suburb.name}
   - Include: "Best restaurant in ${suburb.name}" naturally

2. **Our Story** (200 words)
   - Connection to ${suburb.name} community
   - Why locals choose us
   - Chef's background and philosophy

3. **Menu Highlights** (200 words)
   - 5-7 signature dishes
   - Local ingredients from ${suburb.region}
   - Dietary options (vegan, gluten-free, etc.)

4. **Local Delivery** (150 words)
   - Areas we deliver to (include nearby suburbs)
   - Delivery platforms (Uber Eats, DoorDash, etc.)
   - Pickup options

5. **Events & Catering** (100 words)
   - Private dining for ${suburb.name} residents
   - Corporate catering in ${suburb.region}

TARGET KEYWORDS:
- "restaurant ${suburb.name}"
- "${suburb.name} dining"
- "best [cuisine] ${suburb.name}"
- "food delivery ${suburb.name}"

TONE: Warm, welcoming, mouth-watering, community-focused
OUTPUT: Valid markdown with YAML frontmatter`;
```

**GBP Post Template:**

```javascript
const prompt = `Create a Google Business Profile post for a restaurant.

POST TYPE: ${postType}
BUSINESS: [Your Restaurant Name]
LOCATION: Sydney, Australia

CONTENT IDEAS:
${postType === 'tip' ? '- Today\'s chef special\n- Ingredient spotlight\n- Pairing recommendations' : ''}
${postType === 'offer' ? '- Lunch special pricing\n- Happy hour deals\n- Weekend brunch offers' : ''}
${postType === 'update' ? '- New menu items\n- Seasonal specials\n- Event announcements' : ''}

REQUIREMENTS:
- Mention specific dishes or ingredients
- Include pricing or value
- Food-focused imagery suggestions
- Compelling call-to-action
- 150-200 words
- 2-3 relevant hashtags

TONE: Appetizing, friendly, locally-focused`;
```

---

### For Law Firms

**Suburb Page Template:**

```javascript
const prompt = `You are an expert legal marketing writer specializing in local SEO.

Write a professional landing page for ${suburb.name}, ${suburb.postcode}.

BUSINESS CONTEXT:
- Law firm: [Your Firm Name]
- Practice areas: [e.g., Family Law, Property Law, Criminal Defense]
- Experience: [X] years serving ${suburb.region}
- Unique approach: [e.g., client-focused, no-win-no-fee, multilingual]

CONTENT REQUIREMENTS:
1. **Professional Introduction** (150 words)
   - Authority statement for ${suburb.name}
   - Practice areas overview
   - "Experienced lawyers in ${suburb.name}"

2. **Practice Areas** (250 words)
   - 4-5 main practice areas
   - How each relates to ${suburb.name} residents
   - Common legal issues in ${suburb.region}

3. **Why Choose Us** (200 words)
   - Local court experience (mention nearby courts)
   - Success stories (anonymized)
   - Client testimonials about ${suburb.name} service

4. **Free Consultation** (100 words)
   - Easy booking for ${suburb.name} residents
   - In-person, phone, or video options
   - What to expect in first meeting

5. **FAQ** (200 words)
   - 5 common legal questions from ${suburb.name} clients
   - Brief answers establishing authority

TARGET KEYWORDS:
- "lawyer ${suburb.name}"
- "${suburb.name} solicitor"
- "[practice area] lawyer ${suburb.name}"
- "legal advice ${suburb.name}"

TONE: Professional, trustworthy, approachable, empathetic
COMPLIANCE: Australian legal advertising standards
OUTPUT: Valid markdown with YAML frontmatter`;
```

---

### For Real Estate Agents

**Suburb Page Template:**

```javascript
const prompt = `You are an expert real estate copywriter specializing in local SEO.

Write a comprehensive suburb guide for ${suburb.name}, ${suburb.postcode}.

BUSINESS CONTEXT:
- Agency: [Your Agency Name]
- Principal agent: [Name]
- Years in ${suburb.name}: [X] years
- Sales volume: [e.g., $50M+ annually]

CONTENT REQUIREMENTS:
1. **Suburb Overview** (200 words)
   - ${suburb.name} market insights
   - Median property prices (current data)
   - Property types (houses, units, townhouses)
   - "Real estate ${suburb.name}" naturally included

2. **Living in ${suburb.name}** (250 words)
   - Lifestyle and demographics
   - Schools (name 3-4 top schools)
   - Parks and recreation
   - Shopping and dining precincts
   - Transport links

3. **Market Analysis** (200 words)
   - Recent sales data
   - Growth trends
   - Buyer demographics
   - Investment potential

4. **Why Choose Us** (150 words)
   - Local expertise in ${suburb.name}
   - Recent sales in ${suburb.name}
   - Agent credentials
   - Marketing approach

5. **Free Appraisal** (100 words)
   - CTA for ${suburb.name} property owners
   - What's included in appraisal
   - Booking process

TARGET KEYWORDS:
- "real estate ${suburb.name}"
- "${suburb.name} property for sale"
- "real estate agent ${suburb.name}"
- "${suburb.name} house prices"

TONE: Professional, knowledgeable, market-savvy, local expert
DATA: Use realistic ${suburb.name} data
OUTPUT: Valid markdown with YAML frontmatter`;
```

---

## 🎤 Brand Voice Templates

### Professional & Corporate

**Voice Characteristics:**
- Formal language
- Industry expertise
- Data-driven
- Credibility-focused

**Example Adjustments:**

```javascript
// In any automation script, add these constraints:

const brandVoiceGuidelines = `
BRAND VOICE: Professional & Corporate

LANGUAGE RULES:
- Use formal third-person perspective
- Avoid contractions (don't → do not)
- Include statistics and data points
- Reference industry credentials
- Use industry-specific terminology

AVOID:
- Casual language or slang
- Emoji or excessive punctuation
- First-person casual ("we're excited!")
- Overly promotional language

TONE WORDS: Authoritative, credible, expert, proven, established

EXAMPLE SENTENCE:
❌ "We're super excited to help you grow your business!"
✅ "Our firm has demonstrated proven results in business growth strategies since 2010."
`;

// Add to your prompt:
const prompt = `${basePrompt}\n\n${brandVoiceGuidelines}`;
```

---

### Friendly & Conversational

**Voice Characteristics:**
- Casual language
- Approachable tone
- Personal stories
- Relatable examples

**Example Adjustments:**

```javascript
const brandVoiceGuidelines = `
BRAND VOICE: Friendly & Conversational

LANGUAGE RULES:
- Use contractions naturally (we're, you'll, can't)
- Write like you're talking to a friend
- Include personal anecdotes
- Ask rhetorical questions
- Use "you" and "we" frequently

EMBRACE:
- Casual language and colloquialisms
- Relevant emoji (sparingly)
- Exclamation points for enthusiasm
- Storytelling and examples

TONE WORDS: Warm, approachable, helpful, genuine, friendly

EXAMPLE SENTENCE:
❌ "Our organization provides comprehensive business growth solutions."
✅ "We're genuinely excited to help you grow your business – we've helped hundreds of businesses just like yours!"
`;
```

---

### Bold & Direct

**Voice Characteristics:**
- Action-oriented
- No-nonsense
- Results-focused
- Confident

**Example Adjustments:**

```javascript
const brandVoiceGuidelines = `
BRAND VOICE: Bold & Direct

LANGUAGE RULES:
- Start with strong action verbs
- Short, punchy sentences
- Direct calls-to-action
- No fluff or filler words
- Focus on results, not process

EMBRACE:
- Imperative statements ("Book now", "Get started")
- Concrete numbers and guarantees
- Confident claims (backed by data)
- Urgency and scarcity

TONE WORDS: Confident, direct, powerful, action-driven, no-nonsense

EXAMPLE SENTENCE:
❌ "We might be able to help you possibly see some growth in your business."
✅ "We'll double your leads in 90 days or you don't pay. Guaranteed."
`;
```

---

## ⚙️ Configuration Templates

### Multi-Location Business

**File:** `automation/config/locations.json`

```json
{
  "business": {
    "name": "Your Business Name",
    "industry": "digital-marketing",
    "baseUrl": "https://yourbusiness.com"
  },
  "locations": [
    {
      "id": "syd-cbd",
      "name": "Sydney CBD Office",
      "phone": "+61 2 1234 5678",
      "email": "sydney@yourbusiness.com",
      "address": "Level 5, 123 George St, Sydney NSW 2000",
      "serviceArea": {
        "radius": 10,
        "suburbs": ["Sydney", "Surry Hills", "Darlinghurst", "Chippendale"]
      }
    },
    {
      "id": "mel-cbd",
      "name": "Melbourne CBD Office",
      "phone": "+61 3 1234 5678",
      "email": "melbourne@yourbusiness.com",
      "address": "Suite 200, 456 Collins St, Melbourne VIC 3000",
      "serviceArea": {
        "radius": 10,
        "suburbs": ["Melbourne", "Southbank", "Docklands", "Carlton"]
      }
    }
  ]
}
```

**Usage in Script:**

```javascript
import locations from './automation/config/locations.json' assert { type: 'json' };

// Generate pages for each location
for (const location of locations.locations) {
  const suburb = location.serviceArea.suburbs[0];
  const prompt = `
    Business: ${locations.business.name}
    Office: ${location.name}
    Phone: ${location.phone}
    Service area: ${location.serviceArea.suburbs.join(', ')}

    Create content for ${suburb}...
  `;
  // Generate content...
}
```

---

### Industry-Specific Configurations

**File:** `automation/config/industry-settings.json`

```json
{
  "restaurant": {
    "contentLength": "medium",
    "toneKeywords": ["welcoming", "appetizing", "community-focused"],
    "requiredSections": ["menu", "delivery", "events"],
    "ctaFocus": "reservations",
    "imageStyle": "food-photography",
    "updateFrequency": {
      "suburbPages": "quarterly",
      "gbpPosts": "daily",
      "reviews": "weekly"
    }
  },
  "legal": {
    "contentLength": "long",
    "toneKeywords": ["professional", "trustworthy", "authoritative"],
    "requiredSections": ["practice-areas", "qualifications", "free-consultation"],
    "ctaFocus": "consultation-booking",
    "imageStyle": "professional-headshots",
    "updateFrequency": {
      "suburbPages": "annually",
      "gbpPosts": "weekly",
      "reviews": "monthly"
    }
  },
  "realestate": {
    "contentLength": "long",
    "toneKeywords": ["knowledgeable", "market-savvy", "local-expert"],
    "requiredSections": ["market-data", "suburb-guide", "recent-sales"],
    "ctaFocus": "appraisal-request",
    "imageStyle": "property-listings",
    "updateFrequency": {
      "suburbPages": "quarterly",
      "gbpPosts": "daily",
      "reviews": "weekly"
    }
  }
}
```

---

## 🔄 Custom Automation Workflows

### Weekly Blog Post Generator

**File:** `automation/scripts/generate-blog-post.mjs`

```javascript
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const topicQueue = JSON.parse(
  await fs.readFile('automation/topic-queue.json', 'utf-8')
);

async function generateBlogPost() {
  const topic = topicQueue.topics.shift(); // Get next topic

  const prompt = `You are an expert blog writer for [Your Industry].

TOPIC: ${topic.title}
TARGET KEYWORD: ${topic.keyword}
AUDIENCE: ${topic.targetAudience}

Write a comprehensive blog post (1,200-1,500 words) with:

1. **Engaging Introduction** (150 words)
   - Hook that relates to ${topic.keyword}
   - Why this matters to readers
   - What they'll learn

2. **Main Content** (800-1,000 words)
   - 4-5 H2 sections covering ${topic.subtopics.join(', ')}
   - Practical examples and actionable tips
   - Include statistics or data points
   - Use "you" to address reader directly

3. **Conclusion** (150 words)
   - Summarize key takeaways
   - Strong call-to-action
   - Encourage comments/sharing

4. **SEO Elements**
   - Use ${topic.keyword} naturally 5-7 times
   - Include 3-4 related keywords: ${topic.relatedKeywords.join(', ')}
   - Optimize for featured snippets (use lists/tables)

FORMAT: Markdown with YAML frontmatter
TONE: ${topic.tone || 'Professional but conversational'}
INCLUDE: Meta description (150 chars)`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  const content = response.content[0].text;
  const filename = `${topic.slug || topic.title.toLowerCase().replace(/\s+/g, '-')}.md`;
  const filepath = path.join('src/content/blog', filename);

  await fs.writeFile(filepath, content);

  // Update topic queue
  await fs.writeFile(
    'automation/topic-queue.json',
    JSON.stringify(topicQueue, null, 2)
  );

  console.log(`✅ Blog post created: ${filepath}`);
  console.log(`📊 Remaining topics: ${topicQueue.topics.length}`);
}

generateBlogPost();
```

**Add to package.json:**

```json
{
  "scripts": {
    "automation:blog-post": "node automation/scripts/generate-blog-post.mjs"
  }
}
```

**Topic Queue Template (`automation/topic-queue.json`):**

```json
{
  "topics": [
    {
      "title": "10 Local SEO Strategies for 2025",
      "slug": "local-seo-strategies-2025",
      "keyword": "local SEO strategies",
      "relatedKeywords": ["local SEO tips", "local search optimization", "Google Business Profile"],
      "targetAudience": "small business owners",
      "subtopics": [
        "Google Business Profile optimization",
        "Local citations and directories",
        "Review management",
        "Local content creation",
        "Schema markup"
      ],
      "tone": "professional but conversational",
      "priority": "high",
      "dateAdded": "2025-01-15"
    }
  ]
}
```

---

### Social Media Caption Generator

**File:** `automation/scripts/generate-social-captions.mjs`

```javascript
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function generateSocialCaptions(contentTopic, platform = 'all') {
  const platformSpecs = {
    instagram: {
      length: '150-200 characters',
      hashtags: '8-12',
      emojis: 'encouraged',
      callToAction: 'engagement-focused'
    },
    facebook: {
      length: '100-150 characters',
      hashtags: '2-3',
      emojis: 'moderate',
      callToAction: 'link-focused'
    },
    linkedin: {
      length: '150-300 characters',
      hashtags: '3-5',
      emojis: 'minimal',
      callToAction: 'professional'
    },
    twitter: {
      length: '200-250 characters',
      hashtags: '1-2',
      emojis: 'minimal',
      callToAction: 'engagement or link'
    }
  };

  const platforms = platform === 'all'
    ? Object.keys(platformSpecs)
    : [platform];

  const captions = {};

  for (const p of platforms) {
    const spec = platformSpecs[p];

    const prompt = `Create a ${p.toUpperCase()} post caption.

TOPIC: ${contentTopic}
BUSINESS: [Your Business Name]

PLATFORM REQUIREMENTS:
- Length: ${spec.length}
- Hashtags: ${spec.hashtags}
- Emojis: ${spec.emojis}
- CTA style: ${spec.callToAction}

CONTENT GUIDELINES:
${p === 'instagram' ? '- Start with an attention-grabbing first line\n- Use line breaks for readability\n- Engage with questions' : ''}
${p === 'facebook' ? '- Include a link preview description\n- Focus on shareability' : ''}
${p === 'linkedin' ? '- Professional tone\n- Industry insights\n- Thought leadership angle' : ''}
${p === 'twitter' ? '- Punchy and concise\n- Encourage retweets\n- Use threads if needed' : ''}

OUTPUT: Just the caption text, ready to copy-paste`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    captions[p] = response.content[0].text;
  }

  const output = Object.entries(captions)
    .map(([platform, caption]) =>
      `## ${platform.toUpperCase()}\n\n${caption}\n\n---\n`
    )
    .join('\n');

  const filename = `social-captions-${Date.now()}.md`;
  await fs.writeFile(
    `automation/generated/social-captions/${filename}`,
    `# Social Media Captions\n\nTopic: ${contentTopic}\nGenerated: ${new Date().toISOString()}\n\n---\n\n${output}`
  );

  console.log(`✅ Social captions generated: ${filename}`);
  return captions;
}

// CLI usage
const topic = process.argv[2] || 'local SEO tips';
const platform = process.argv[3] || 'all';
generateSocialCaptions(topic, platform);
```

**Usage:**

```bash
# Generate for all platforms
npm run automation:social "New blog post about local SEO"

# Generate for specific platform
npm run automation:social "Spring promotion" instagram
```

---

## 📄 Output Format Templates

### Email Template (HTML)

**File:** `automation/templates/email-template.html`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: #0066cc;
      color: white;
      padding: 30px 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background: white;
      padding: 30px 20px;
      border: 1px solid #e0e0e0;
    }
    .cta-button {
      display: inline-block;
      background: #0066cc;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{BUSINESS_NAME}}</h1>
  </div>
  <div class="content">
    <p>Hi {{CLIENT_NAME}},</p>

    {{EMAIL_BODY}}

    <a href="{{CTA_LINK}}" class="cta-button">{{CTA_TEXT}}</a>

    <p>{{CLOSING}}</p>

    <p>
      Best regards,<br>
      {{SENDER_NAME}}<br>
      {{BUSINESS_NAME}}<br>
      {{PHONE}} | {{EMAIL}}
    </p>
  </div>
  <div class="footer">
    <p>{{BUSINESS_NAME}} | {{ADDRESS}}</p>
    <p><a href="{{UNSUBSCRIBE_LINK}}">Unsubscribe</a></p>
  </div>
</body>
</html>
```

**Usage in Script:**

```javascript
async function generateEmailHTML(data) {
  let template = await fs.readFile('automation/templates/email-template.html', 'utf-8');

  const replacements = {
    '{{BUSINESS_NAME}}': 'The Profit Platform',
    '{{CLIENT_NAME}}': data.clientName,
    '{{EMAIL_BODY}}': data.emailBody,
    '{{CTA_LINK}}': data.ctaLink,
    '{{CTA_TEXT}}': data.ctaText,
    '{{CLOSING}}': data.closing,
    '{{SENDER_NAME}}': 'Avi',
    '{{PHONE}}': '0487 286 451',
    '{{EMAIL}}': 'avi@theprofitplatform.com.au',
    '{{ADDRESS}}': 'Sydney, Australia',
    '{{UNSUBSCRIBE_LINK}}': `https://theprofitplatform.com.au/unsubscribe?email=${data.clientEmail}`
  };

  for (const [placeholder, value] of Object.entries(replacements)) {
    template = template.replace(new RegExp(placeholder, 'g'), value);
  }

  return template;
}
```

---

### PDF Report Template

**File:** `automation/scripts/generate-pdf-report.mjs`

```javascript
import puppeteer from 'puppeteer';
import fs from 'fs/promises';

async function generatePDFReport(data) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    @page { margin: 2cm; }
    body {
      font-family: -apple-system, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #0066cc;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .metric {
      display: inline-block;
      width: 30%;
      text-align: center;
      padding: 20px;
      margin: 10px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    .metric-value {
      font-size: 36px;
      font-weight: bold;
      color: #0066cc;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #0066cc;
      color: white;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${data.reportTitle}</h1>
    <p>${data.reportPeriod}</p>
  </div>

  <h2>Executive Summary</h2>

  <div class="metric">
    <div class="metric-value">${data.metrics.totalPages}</div>
    <div>Pages Created</div>
  </div>

  <div class="metric">
    <div class="metric-value">${data.metrics.totalPosts}</div>
    <div>GBP Posts</div>
  </div>

  <div class="metric">
    <div class="metric-value">${data.metrics.reviewsCollected}</div>
    <div>Reviews Collected</div>
  </div>

  <h2>Detailed Analytics</h2>

  <table>
    <thead>
      <tr>
        <th>Automation</th>
        <th>Runs</th>
        <th>Success Rate</th>
        <th>Time Saved</th>
      </tr>
    </thead>
    <tbody>
      ${data.automations.map(a => `
        <tr>
          <td>${a.name}</td>
          <td>${a.runs}</td>
          <td>${a.successRate}%</td>
          <td>${a.timeSaved}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
    <p>Generated by ${data.businessName} Automation System</p>
    <p>${new Date().toLocaleDateString()}</p>
  </div>
</body>
</html>
  `;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);

  const pdfPath = `automation/reports/${data.filename}.pdf`;
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true
  });

  await browser.close();
  console.log(`✅ PDF report generated: ${pdfPath}`);
  return pdfPath;
}

// Example usage
const reportData = {
  reportTitle: 'Monthly Automation Report',
  reportPeriod: 'January 2025',
  businessName: 'The Profit Platform',
  filename: `automation-report-${Date.now()}`,
  metrics: {
    totalPages: 10,
    totalPosts: 48,
    reviewsCollected: 12
  },
  automations: [
    { name: 'Suburb Pages', runs: 1, successRate: 100, timeSaved: '12h 30m' },
    { name: 'GBP Posts', runs: 4, successRate: 100, timeSaved: '12h' },
    { name: 'Reviews', runs: 4, successRate: 100, timeSaved: '5h' }
  ]
};

generatePDFReport(reportData);
```

---

## 🔌 Integration Templates

### SendGrid Email Integration

**File:** `automation/integrations/sendgrid.mjs`

```javascript
import sgMail from '@sendgrid/mail';
import fs from 'fs/promises';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendReviewRequest(client) {
  const emailTemplate = await fs.readFile(
    'automation/templates/review-request-email.html',
    'utf-8'
  );

  const personalizedEmail = emailTemplate
    .replace('{{CLIENT_NAME}}', client.name)
    .replace('{{PROJECT_TYPE}}', client.projectType)
    .replace('{{SUBURB}}', client.suburb);

  const msg = {
    to: client.email,
    from: 'avi@theprofitplatform.com.au',
    subject: `Quick favor - would love your feedback!`,
    html: personalizedEmail,
    text: emailTemplate.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true }
    }
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Review request sent to ${client.name}`);

    // Log the send
    await logEmailSend({
      clientId: client.id,
      emailType: 'review-request',
      sentAt: new Date().toISOString(),
      status: 'sent'
    });
  } catch (error) {
    console.error(`❌ Failed to send to ${client.name}:`, error.message);

    await logEmailSend({
      clientId: client.id,
      emailType: 'review-request',
      sentAt: new Date().toISOString(),
      status: 'failed',
      error: error.message
    });
  }
}

async function logEmailSend(data) {
  const logFile = 'automation/logs/email-sends.json';
  let logs = [];

  try {
    logs = JSON.parse(await fs.readFile(logFile, 'utf-8'));
  } catch {
    // File doesn't exist yet
  }

  logs.push(data);
  await fs.writeFile(logFile, JSON.stringify(logs, null, 2));
}

export { sendReviewRequest };
```

**Add to review-automation.mjs:**

```javascript
import { sendReviewRequest } from './integrations/sendgrid.mjs';

// After generating email content
if (process.env.SENDGRID_API_KEY && process.env.AUTO_SEND_EMAILS === 'true') {
  await sendReviewRequest(client);
}
```

---

### Slack Notifications

**File:** `automation/integrations/slack.mjs`

```javascript
async function sendSlackNotification(message, type = 'info') {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const emoji = {
    info: ':information_source:',
    success: ':white_check_mark:',
    warning: ':warning:',
    error: ':x:'
  }[type] || ':bell:';

  const color = {
    info: '#0066cc',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545'
  }[type] || '#0066cc';

  const payload = {
    text: `${emoji} Automation Update`,
    attachments: [{
      color: color,
      text: message,
      footer: 'SEO Automation System',
      ts: Math.floor(Date.now() / 1000)
    }]
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error('Failed to send Slack notification:', error);
  }
}

export { sendSlackNotification };
```

**Usage in Automations:**

```javascript
import { sendSlackNotification } from './integrations/slack.mjs';

// At end of suburb page generation
await sendSlackNotification(
  `✅ Suburb page generation complete!\n• Pages created: ${created.length}\n• Time: ${executionTime}s\n• Cost: $${estimatedCost}`,
  'success'
);

// On error
await sendSlackNotification(
  `❌ Automation failed: ${error.message}`,
  'error'
);
```

---

## 🚀 Advanced Customizations

### Dynamic Suburb Targeting

**File:** `automation/scripts/dynamic-suburb-selector.mjs`

```javascript
import fs from 'fs/promises';

// Automatically select suburbs based on criteria
async function selectTargetSuburbs(criteria = {}) {
  const allSuburbs = [
    { name: 'Bondi', population: 12000, medianIncome: 95000, competition: 'high' },
    { name: 'Parramatta', population: 30000, medianIncome: 72000, competition: 'medium' },
    { name: 'Penrith', population: 15000, medianIncome: 68000, competition: 'low' },
    // ... more suburbs
  ];

  let selected = allSuburbs;

  // Filter by population
  if (criteria.minPopulation) {
    selected = selected.filter(s => s.population >= criteria.minPopulation);
  }

  // Filter by competition
  if (criteria.maxCompetition) {
    const competitionLevels = { low: 1, medium: 2, high: 3 };
    const maxLevel = competitionLevels[criteria.maxCompetition];
    selected = selected.filter(s => competitionLevels[s.competition] <= maxLevel);
  }

  // Sort by priority
  if (criteria.prioritize === 'low-competition') {
    const competitionLevels = { low: 1, medium: 2, high: 3 };
    selected.sort((a, b) => competitionLevels[a.competition] - competitionLevels[b.competition]);
  } else if (criteria.prioritize === 'high-population') {
    selected.sort((a, b) => b.population - a.population);
  }

  // Limit to top N
  if (criteria.limit) {
    selected = selected.slice(0, criteria.limit);
  }

  return selected;
}

// Usage example
const targetSuburbs = await selectTargetSuburbs({
  minPopulation: 10000,
  maxCompetition: 'medium',
  prioritize: 'low-competition',
  limit: 10
});

console.log('Target suburbs:', targetSuburbs.map(s => s.name));
```

---

### A/B Test Prompt Variations

**File:** `automation/scripts/ab-test-prompts.mjs`

```javascript
async function generateWithABTest(suburb, variations = ['A', 'B']) {
  const prompts = {
    A: `Write a professional, data-driven suburb page for ${suburb.name}...`,
    B: `Write a friendly, story-driven suburb page for ${suburb.name}...`
  };

  const results = {};

  for (const variant of variations) {
    console.log(`🧪 Generating variant ${variant}...`);

    const content = await generateContent(prompts[variant]);

    results[variant] = {
      content: content,
      wordCount: content.split(/\s+/).length,
      readabilityScore: calculateReadability(content),
      keywordDensity: calculateKeywordDensity(content, suburb.name)
    };

    // Save for comparison
    await fs.writeFile(
      `automation/ab-tests/${suburb.name}-variant-${variant}.md`,
      content
    );
  }

  // Generate comparison report
  const report = `
# A/B Test Results: ${suburb.name}

| Metric | Variant A | Variant B | Winner |
|--------|-----------|-----------|--------|
| Word Count | ${results.A.wordCount} | ${results.B.wordCount} | ${results.A.wordCount > results.B.wordCount ? 'A' : 'B'} |
| Readability | ${results.A.readabilityScore} | ${results.B.readabilityScore} | ${results.A.readabilityScore > results.B.readabilityScore ? 'A' : 'B'} |
| Keyword Density | ${results.A.keywordDensity}% | ${results.B.keywordDensity}% | ${results.A.keywordDensity > results.B.keywordDensity ? 'A' : 'B'} |
  `;

  await fs.writeFile(
    `automation/ab-tests/${suburb.name}-comparison.md`,
    report
  );

  console.log('📊 A/B test complete. Check automation/ab-tests/');
}
```

---

## 📚 Template Library

### Quick Reference

**Access pre-built templates:**

```bash
# List available templates
ls automation/templates/

# Copy template for customization
cp automation/templates/industry-legal.mjs automation/scripts/my-custom-automation.mjs

# Edit your custom version
nano automation/scripts/my-custom-automation.mjs
```

**Available Templates:**
- `industry-restaurant.mjs` - Restaurant/hospitality prompts
- `industry-legal.mjs` - Law firm prompts
- `industry-realestate.mjs` - Real estate prompts
- `industry-healthcare.mjs` - Medical/dental prompts
- `industry-trades.mjs` - Plumbers, electricians, etc.
- `brand-voice-professional.mjs` - Corporate tone
- `brand-voice-casual.mjs` - Friendly tone
- `brand-voice-bold.mjs` - Direct, action-oriented tone
- `email-template-html.html` - Responsive email template
- `pdf-report-template.mjs` - PDF report generator

---

## 🎓 Customization Checklist

**Before customizing, ensure you have:**

- [ ] Backed up original scripts
- [ ] Read the script you're customizing
- [ ] Tested with a single item first
- [ ] Reviewed generated output quality
- [ ] Updated documentation with your changes
- [ ] Set up version control (git)

**When customizing:**

- [ ] Keep prompt instructions clear and specific
- [ ] Test with various inputs
- [ ] Monitor API costs (check token usage)
- [ ] Compare quality to manual work
- [ ] Document what you changed and why
- [ ] Share successful customizations with team

---

**🎨 Complete customization templates for adapting the automation system to your specific needs.**

**Use these templates as starting points, then make them your own!**

**Last Updated:** January 2025
**Version:** 2.0.0
