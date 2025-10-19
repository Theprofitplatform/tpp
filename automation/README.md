# 🤖 SEO Automation System

**Full local SEO automation for The Profit Platform**

Automates 80% of repetitive SEO tasks:
- ✅ Content generation (suburb pages, GBP posts)
- ✅ Outreach (reviews, link building)
- ✅ Tracking & reporting (rankings, analytics)

**Time saved:** 15-20 hours/month
**Cost:** $30-100/month
**Setup time:** 15 minutes

---

## 🚀 Quick Start (5 Commands)

```bash
# 1. Set API key
export ANTHROPIC_API_KEY=your_key_here

# 2. Test suburb page generator
npm run automation:suburb-pages

# 3. Test GBP post generator
npm run automation:gbp-posts

# 4. Test review system
npm run automation:reviews

# 5. Run everything on schedule
npm run automation:scheduled
```

**That's it!** Your SEO automation is running.

---

## 📦 What's Included

### 1. **Suburb Page Generator** (`automation:suburb-pages`)
- Generates 10 unique suburb landing pages
- AI-powered with Claude
- SEO-optimized with proper schema
- Output: `src/content/locations/*.md`

### 2. **GBP Auto-Poster** (`automation:gbp-posts`)
- Creates 12 Google Business Profile posts
- 3 posts/week for 4 weeks
- Multiple formats (JSON, CSV, Markdown)
- Output: `automation/generated/gbp-posts/`

### 3. **Review Request System** (`automation:reviews`)
- Automated review request emails
- Personalized based on client data
- Smart timing (7 days after project)
- Output: `automation/generated/review-emails/`

### 4. **Rank Tracker** (`automation:rank-track`)
- Tracks 20+ keywords via Google Search Console
- Generates HTML + CSV reports
- Shows position changes & trends
- Output: `automation/reports/`

### 5. **Link Outreach** (`automation:link-outreach`)
- Personalized outreach emails
- AI-generated for each target
- Strategy-based (guest post, resource, etc.)
- Output: `automation/generated/link-outreach/`

### 6. **Master Orchestrator** (`automation:scheduled`)
- Runs all automations on schedule
- Daily, weekly, monthly tasks
- Logs & status tracking
- Cron job compatible

---

## 🎯 NPM Scripts

### Run Individual Automations:
```bash
npm run automation:suburb-pages    # Generate suburb pages
npm run automation:gbp-posts       # Generate GBP posts
npm run automation:reviews         # Generate review requests
npm run automation:rank-track      # Track keyword rankings
npm run automation:link-outreach   # Generate link outreach emails
```

### Master Orchestrator:
```bash
npm run automation:scheduled       # Run scheduled automations
npm run automation:run <script>    # Run specific automation manually
npm run automation:list            # List all automations
npm run automation:status          # Show automation status
npm run automation:help            # Help & documentation
```

---

## ⚙️ Configuration

### Required: API Keys

```bash
# Anthropic API (for AI content generation)
export ANTHROPIC_API_KEY=your_key_here

# Google Search Console (for rank tracking)
# See: automation/AUTOMATION-SETUP-GUIDE.md
```

### Optional: Customize Settings

Edit configuration in each script:
- `automation/scripts/generate-suburb-pages.mjs` - Target suburbs
- `automation/scripts/gbp-auto-poster.mjs` - Post frequency
- `automation/scripts/review-automation.mjs` - Email timing
- `automation/scripts/rank-tracker.mjs` - Keywords to track
- `automation/scripts/link-outreach.mjs` - Target websites

---

## 📅 Automation Schedule

When running via cron (`automation:scheduled`):

| Frequency | Task | Time | Output |
|-----------|------|------|--------|
| Daily (M-F) | Review requests | 9:00 AM | Emails |
| Weekly (Mon) | Rank tracking | 8:00 AM | HTML report |
| Weekly (Mon) | GBP posts | 7:00 AM | 12 posts |
| Monthly (1st) | Suburb pages | 9:00 AM | 10 pages |
| Monthly (1st) | Link outreach | 10:00 AM | Emails |

---

## 🛠️ Full Setup Guide

For complete setup instructions:

📖 **See: [AUTOMATION-SETUP-GUIDE.md](./AUTOMATION-SETUP-GUIDE.md)**

Includes:
- Detailed configuration
- Google Search Console API setup
- Email integration options
- Cron job setup
- Troubleshooting
- Optimization tips
- Cost breakdown

---

## 💡 Examples

### Generate 10 Suburb Pages:
```bash
npm run automation:suburb-pages
```
Output: `src/content/locations/bondi.md`, `parramatta.md`, etc.

### Generate Month of GBP Posts:
```bash
npm run automation:gbp-posts
```
Output: `automation/generated/gbp-posts/gbp-posts-2025-10-19.md`

### Track Rankings:
```bash
npm run automation:rank-track
```
Output: `automation/reports/rank-report-2025-10-19.html`

### Run Everything Scheduled for Today:
```bash
npm run automation:scheduled
```
Checks schedule, runs appropriate automations, logs results.

---

## 📊 Outputs

### Generated Content:
- `src/content/locations/` - Suburb landing pages (publish to site)
- `automation/generated/gbp-posts/` - GBP posts (copy to GBP)
- `automation/generated/review-emails/` - Review requests (send via email)
- `automation/generated/link-outreach/` - Outreach emails (send manually)

### Reports:
- `automation/reports/` - Rank reports (HTML + CSV)

### Tracking:
- `automation/data/rankings/` - Historical ranking data
- `automation/data/automation-status.json` - Automation run history
- `automation/logs/` - Execution logs

---

## 🚨 Important Notes

### Review Before Publishing
AI-generated content is good but not perfect:
- ✅ Review suburb pages before publishing
- ✅ Personalize outreach emails before sending
- ✅ Check GBP posts for accuracy
- ✅ Verify review request details

### Avoid Over-Automation
Don't automate everything:
- ❌ Don't mass-generate 50 pages at once
- ❌ Don't send 100 outreach emails in a day
- ❌ Don't blindly post AI content without review
- ✅ Stagger content creation (5-10 pages/month)
- ✅ Quality over quantity
- ✅ Human oversight required

### Google Penalties
Avoid these automation mistakes:
- Mass-generating thin content
- Duplicate/templated pages
- Unnatural link building
- Fake reviews
- Keyword stuffing

**Always review and personalize AI output before using.**

---

## 💰 Costs

### Monthly Operating Costs:
- **Anthropic API:** $30-50/month (~100k tokens)
- **Google Search Console:** FREE
- **Email service:** $0-50/month (optional)

**Total:** $30-100/month

### ROI:
- Time saved: 15-20 hours/month
- Value (at $50/hr): $750-1,000/month
- **ROI:** 750-3,300%

---

## 🆘 Troubleshooting

### "ANTHROPIC_API_KEY not set"
```bash
export ANTHROPIC_API_KEY=your_key_here
```

### "No emails generated"
Check: `automation/data/clients.json` exists and has clients with dates 7+ days ago

### "GSC API Error"
1. Enable API in Google Cloud
2. Create service account
3. Add service account to Google Search Console
4. Download credentials to `automation/config/gsc-credentials.json`

### Cron job not running
```bash
# Check cron status
service cron status

# Check logs
tail -f automation/logs/cron.log

# Test manually
npm run automation:scheduled
```

---

## 📚 Documentation

- **Setup Guide:** [AUTOMATION-SETUP-GUIDE.md](./AUTOMATION-SETUP-GUIDE.md)
- **Suburb Template:** [SUBURB-PAGE-TEMPLATE.md](../SUBURB-PAGE-TEMPLATE.md)
- **Scripts:** `automation/scripts/`

---

## 🎉 You're Done!

Your SEO automation is ready. Run these commands to get started:

```bash
# Test everything
npm run automation:list
npm run automation:suburb-pages
npm run automation:gbp-posts

# Set up cron (for full automation)
crontab -e
# Add: 0 6 * * * cd /path/to/project && npm run automation:scheduled >> automation/logs/cron.log 2>&1

# Monitor status
npm run automation:status
```

**Time saved: 15-20 hours/month. Tasks automated: 80%. Human oversight: Required.**

🤖 **Welcome to the future of local SEO.**
