# 🤖 Full SEO Automation Setup Guide

## Overview

Your complete local SEO automation system that runs 80% of tasks on autopilot.

**What's Automated:**
1. ✅ Suburb landing page generation (AI-powered)
2. ✅ Google Business Profile post creation (12+ posts/month)
3. ✅ Review request emails (personalized, timed)
4. ✅ Keyword rank tracking (weekly reports)
5. ✅ Link building outreach (personalized emails)
6. ✅ Master orchestrator (runs everything on schedule)

**Time saved:** ~15-20 hours/month
**Cost:** ~$50-100/month (mostly Claude API usage)

---

## 🚀 Quick Start (15 Minutes)

### Step 1: Install Dependencies

```bash
cd /mnt/c/Users/abhis/projects/atpp/tpp

# Install required packages
npm install @anthropic-ai/sdk googleapis

# Or use the provided package.json additions
```

### Step 2: Set Up API Keys

```bash
# Create environment variables file
cp automation/config/.env.example automation/config/.env

# Edit and add your keys
nano automation/config/.env
```

Required API keys:
```
ANTHROPIC_API_KEY=your_claude_api_key_here
GOOGLE_APPLICATION_CREDENTIALS=./automation/config/gsc-credentials.json
```

### Step 3: Test Each System

```bash
# Test suburb page generator
npm run automation:suburb-pages

# Test GBP poster
npm run automation:gbp-posts

# Test review system
npm run automation:reviews

# Test rank tracker
npm run automation:rank-track

# Test link outreach
npm run automation:link-outreach
```

### Step 4: Set Up Cron Job (Fully Automated)

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 6 AM)
0 6 * * * cd /mnt/c/Users/abhis/projects/atpp/tpp && node automation/scripts/automation-orchestrator.mjs scheduled >> automation/logs/cron.log 2>&1
```

**Done!** Your SEO automation is now running on autopilot.

---

## 📦 Detailed Setup Instructions

### 1. Suburb Page Generator

**What it does:** Generates 10 unique, SEO-optimized suburb landing pages using Claude AI.

**Configuration:**
```javascript
// Edit automation/scripts/generate-suburb-pages.mjs

targetSuburbs: [
  { name: 'Bondi', postcode: '2026', lat: '-33.8915', lng: '151.2767' },
  // Add more suburbs...
]
```

**Usage:**
```bash
# Generate all suburb pages
npm run automation:suburb-pages

# Pages saved to: src/content/locations/
```

**Cost:** ~$0.50-1.00 per batch (10 pages)

**Output:**
- 10 markdown files with frontmatter
- Unique 600-800 word content per page
- Proper schema markup
- Internal linking suggestions

---

### 2. GBP Auto-Poster

**What it does:** Generates 12 Google Business Profile posts for the month (3/week).

**Configuration:**
```javascript
// Edit automation/scripts/gbp-auto-poster.mjs

postsPerWeek: 3,
weeksToGenerate: 4,
```

**Usage:**
```bash
# Generate posts
npm run automation:gbp-posts

# Output: automation/generated/gbp-posts/
```

**What you get:**
- JSON file (for API integration)
- CSV file (for import to Google Sheets → Zapier)
- Markdown file (for manual copy-paste)

**Posting options:**
1. **Manual:** Copy from markdown file, post to GBP interface
2. **Semi-automated:** CSV → Google Sheets → Zapier → GBP
3. **Fully automated:** Use GBP API (advanced, requires additional setup)

**Cost:** ~$0.30 per batch (12 posts)

---

### 3. Review Request Automation

**What it does:** Generates personalized review request emails based on client completion dates.

**Setup:**
1. Populate client database:
```bash
# Edit automation/data/clients.json
[
  {
    "id": 1,
    "name": "Sarah Johnson",
    "email": "sarah@example.com",
    "projectType": "SEO services",
    "projectCompletionDate": "2025-01-15",
    "status": "active"
  }
]
```

2. Get your Google Review link:
```
1. Go to google.com/business
2. Click "Get more reviews"
3. Copy short link (e.g., g.page/your-business/review)
4. Add to automation/scripts/review-automation.mjs
```

**Usage:**
```bash
# Generate review request queue
npm run automation:reviews

# Output: automation/generated/review-emails/
```

**Sending options:**
1. **Manual:** Copy emails from markdown file
2. **Gmail + Zapier:** Upload CSV → Google Sheets → Gmail automation
3. **SendGrid/Mailchimp:** Use commented-out sendEmail() function

**Schedule:**
- Initial request: 7 days after project completion
- Follow-up: 7 days after initial (if no response)
- Max follow-ups: 1

**Cost:** Free (or email service cost if automated)

---

### 4. Rank Tracker

**What it does:** Tracks keyword rankings using Google Search Console API, generates HTML/CSV reports.

**Setup (Google Search Console API):**

```bash
# Step 1: Create Google Cloud Project
https://console.cloud.google.com/

# Step 2: Enable Search Console API
https://console.cloud.google.com/apis/library/searchconsole.googleapis.com

# Step 3: Create Service Account
1. Go to IAM & Admin → Service Accounts
2. Create service account (name: seo-automation)
3. Download JSON key
4. Save to: automation/config/gsc-credentials.json

# Step 4: Add Service Account to GSC
1. Go to Google Search Console
2. Settings → Users and permissions
3. Add user: service-account-email@project.iam.gserviceaccount.com
4. Permission: Full

# Step 5: Update config
Edit automation/scripts/rank-tracker.mjs:
siteUrl: 'https://theprofitplatform.com.au'
credentialsPath: './automation/config/gsc-credentials.json'
```

**Keywords tracked:** 20+ (configured in script)

**Usage:**
```bash
# Run rank tracker
npm run automation:rank-track

# Outputs:
# - automation/data/rankings/rankings-YYYY-MM-DD.json
# - automation/reports/rank-report-YYYY-MM-DD.html
# - automation/reports/rank-data-YYYY-MM-DD.csv
```

**Reports include:**
- Current position for each keyword
- Position changes (vs last check)
- Impressions, clicks, CTR
- Top 10 keyword count
- Trend indicators (📈📉➡️)

**Schedule:** Weekly (Mondays at 8 AM)

**Cost:** Free (uses GSC API)

---

### 5. Link Building Outreach

**What it does:** Generates personalized outreach emails for link building campaigns.

**Setup:**
```javascript
// Edit automation/scripts/link-outreach.mjs

targetWebsites: [
  {
    url: 'https://dynamicbusiness.com',
    name: 'Dynamic Business',
    type: 'publication',
    contact: 'editor@dynamicbusiness.com',
    acceptsGuestPosts: true,
    topics: ['small business', 'marketing'],
  },
  // Add more targets...
]
```

**Usage:**
```bash
# Generate outreach campaign
npm run automation:link-outreach

# Output: automation/generated/link-outreach/
```

**What you get:**
- Personalized subject lines
- Custom email body for each target
- Strategy notes (guest post vs resource link)
- Tracking checklist

**Best practices:**
- Send 3-5 emails per day (don't batch)
- Personalize each email before sending
- Follow up once if no response in 7 days
- Track response/acceptance rates

**Cost:** ~$0.20 per batch (10 emails)

**Schedule:** Monthly (1st of month)

---

## 🎛️ Master Orchestrator

**What it does:** Runs all automations on schedule, tracks results, generates logs.

**Commands:**

```bash
# Run scheduled automations for today
npm run automation:scheduled

# Run specific automation manually
npm run automation:run rank-tracker

# List all automations
npm run automation:list

# Check automation status
npm run automation:status

# Help
npm run automation:help
```

**Automation Schedule:**

| Frequency | Day | Time | Automation | Output |
|-----------|-----|------|------------|--------|
| Daily | Mon-Fri | 9:00 AM | Review requests | Emails |
| Weekly | Monday | 8:00 AM | Rank tracking | HTML report |
| Weekly | Monday | 7:00 AM | GBP posts | 12 posts |
| Monthly | 1st | 9:00 AM | Suburb pages | 10 pages |
| Monthly | 1st | 10:00 AM | Link outreach | Emails |

**Logs:**
- Stored in: `automation/logs/`
- Status file: `automation/data/automation-status.json`
- Cron log: `automation/logs/cron.log`

---

## 💰 Cost Breakdown

**Monthly Costs:**

| Item | Cost | Notes |
|------|------|-------|
| Claude API (Anthropic) | $30-50/mo | ~100k tokens/month |
| Google Search Console API | FREE | No cost |
| Email service (optional) | $0-50/mo | Free if manual |
| **Total** | **$30-100/mo** | Saves 15-20 hrs/month |

**ROI:** If your time is worth $50/hr, this saves $750-1,000/month.

---

## 📊 What Gets Automated (Summary)

### Content Creation (50% Automated)
- ✅ Suburb page content (100% automated)
- ✅ GBP posts (100% automated)
- ⚠️ Blog posts (not included, can be added)

### Outreach (70% Automated)
- ✅ Review request emails (100% automated)
- ✅ Link building emails (100% automated)
- ❌ Follow-ups (semi-manual, needs human review)

### Tracking & Reporting (90% Automated)
- ✅ Rank tracking (100% automated)
- ✅ Weekly reports (100% automated)
- ⚠️ Traffic reports (can add GA4 API)

### What Still Needs Human Input:
1. ❌ Reviewing generated content before publishing
2. ❌ Actually sending outreach emails (trust/deliverability)
3. ❌ Responding to review requests
4. ❌ Client communication
5. ❌ Strategy decisions

**Realistic automation:** 80% of repetitive tasks

---

## 🔧 Troubleshooting

### "ANTHROPIC_API_KEY not set"

```bash
# Solution: Export API key
export ANTHROPIC_API_KEY=your_key_here

# Or add to ~/.bashrc (permanent)
echo 'export ANTHROPIC_API_KEY=your_key_here' >> ~/.bashrc
source ~/.bashrc
```

### "GSC API Error"

**Common issues:**
1. Service account not added to GSC → Add to Settings → Users
2. Wrong site URL → Must match exactly (with https://)
3. API not enabled → Enable in Google Cloud Console

### "No emails generated"

**Check:**
1. Client data file exists: `automation/data/clients.json`
2. Clients have completion dates 7+ days ago
3. Clients not already requested (check tracking file)

### "Cron job not running"

```bash
# Check if cron is running
service cron status

# Check cron log
tail -f automation/logs/cron.log

# Test cron command manually
cd /mnt/c/Users/abhis/projects/atpp/tpp && node automation/scripts/automation-orchestrator.mjs scheduled
```

---

## 📈 Optimization Tips

### 1. Improve Content Quality

The AI-generated content is good but can be better:
- Review and edit suburb pages before publishing
- Add real client testimonials/case studies
- Include actual local photos
- Update with current local events/news

### 2. Personalize Outreach

Before sending link building emails:
- Visit target website, read recent articles
- Comment on their content first
- Mention specific article in your email
- Build relationship before asking

### 3. Track What Works

Monitor these metrics:
- GBP post engagement (which posts get most clicks?)
- Review request response rate (which emails work best?)
- Outreach acceptance rate (which strategies convert?)
- Rank improvements (which suburbs gaining traction?)

**Use data to improve prompts and strategies.**

### 4. Scale Gradually

**Month 1:**
- Generate 3 suburb pages (test quality)
- Send 5 link outreach emails (test response rate)
- Run rank tracker weekly

**Month 2:**
- If quality good, generate 5 more suburb pages
- If outreach working, send 10 more emails
- Add automated GBP posting

**Month 3:**
- Full automation enabled
- Monitor and optimize
- Adjust based on results

---

## 🚨 Important Warnings

### 1. Google Penalties

**Don't:**
- ❌ Mass-generate 50 suburb pages in one day (looks spammy)
- ❌ Post identical GBP posts repeatedly
- ❌ Send 100 link outreach emails from same IP
- ❌ Buy backlinks or fake reviews
- ❌ Keyword stuff AI-generated content

**Do:**
- ✅ Review all AI content before publishing
- ✅ Stagger page creation (5-10 per month max)
- ✅ Personalize outreach emails
- ✅ Build real relationships
- ✅ Provide genuine value

### 2. Email Deliverability

Sending too many automated emails can hurt deliverability:
- Warm up email domain (send manually first)
- Use professional email service (not personal Gmail)
- Keep volume low (5-10 emails/day max)
- High-quality, personalized content only
- Monitor spam complaints

### 3. AI Content Detection

Google can detect low-quality AI content:
- Always review and edit AI output
- Add human insights, examples, data
- Make it genuinely useful
- Update regularly with fresh info

### 4. Over-Automation

Don't automate everything:
- Client relationships need human touch
- Strategy decisions need human judgment
- Some content needs creative human input
- Quality > quantity always

---

## ✅ Setup Checklist

Use this to track your setup progress:

**Week 1: Foundation**
- [ ] Install npm packages (@anthropic-ai/sdk, googleapis)
- [ ] Get Anthropic API key
- [ ] Test suburb page generator (generate 1 page)
- [ ] Test GBP poster (generate 12 posts)
- [ ] Review outputs for quality

**Week 2: Advanced Setup**
- [ ] Set up Google Cloud project
- [ ] Enable Search Console API
- [ ] Create service account + download JSON key
- [ ] Add service account to GSC
- [ ] Test rank tracker

**Week 3: Email Automation**
- [ ] Get Google Review link
- [ ] Populate clients.json with 3-5 test clients
- [ ] Test review automation
- [ ] Find 10 link outreach targets
- [ ] Test link outreach generator

**Week 4: Full Automation**
- [ ] Test master orchestrator
- [ ] Set up cron job
- [ ] Monitor logs for 1 week
- [ ] Adjust schedule as needed
- [ ] Create manual review process

**Ongoing:**
- [ ] Weekly: Review automation logs
- [ ] Monthly: Analyze what's working
- [ ] Quarterly: Optimize prompts and strategies
- [ ] Semi-annually: Audit all automated content

---

## 🆘 Support

**Issues?**
1. Check automation logs: `automation/logs/`
2. Check status file: `automation/data/automation-status.json`
3. Run manual test: `npm run automation:run <script-name>`
4. Check this guide's troubleshooting section

**Want to extend?**
- Add blog post automation
- Add social media posting
- Add Google Analytics API reporting
- Add citation building automation
- Add competitor tracking

All scripts are modular and can be extended!

---

## 📚 Additional Resources

**Claude AI:**
- API docs: https://docs.anthropic.com/
- Pricing: https://www.anthropic.com/pricing

**Google Search Console API:**
- Quickstart: https://developers.google.com/webmaster-tools/search-console-api-original/v3/quickstart

**Cron syntax:**
- Crontab guru: https://crontab.guru/

**Email automation:**
- Zapier: https://zapier.com/
- Make.com: https://www.make.com/
- SendGrid: https://sendgrid.com/

---

**🎉 You're now running a fully automated local SEO system!**

Time saved: 15-20 hours/month
Tasks automated: Content, outreach, tracking, reporting
Human oversight: Review quality, build relationships, make strategy decisions

**The future is automated. 🤖**
