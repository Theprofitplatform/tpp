# 🤖 SEO Automation System

**Complete AI-powered local SEO automation for Sydney businesses**

---

## ⚡ Quick Start (2 Commands)

```bash
# 1. Test everything works
npm run automation:test

# 2. Generate your first content
npm run automation:suburb-pages
```

**That's it!** Your first 10 suburb pages are being generated.

---

## 📋 What This System Does

### 1. **Suburb Landing Pages** (AI-Generated)
- Creates 10 unique suburb pages per run
- 600-800 words each, SEO-optimized
- Local business schema markup
- Nearby suburbs mapping
- **Cost:** ~$0.50/batch
- **Manual equivalent:** 8 hours

### 2. **Google Business Profile Posts**
- Generates 12 GBP posts (4 weeks worth)
- 4 post types (tips, offers, updates, case studies)
- Includes CTAs and scheduling
- **Cost:** ~$0.30/batch
- **Manual equivalent:** 3 hours

### 3. **Review Request Emails**
- Personalized client emails
- Smart timing (7 days post-project)
- Follow-up automation
- **Cost:** FREE
- **Manual equivalent:** 2 hours/month

### 4. **Keyword Rank Tracking**
- Tracks 20+ keywords via GSC API
- HTML + CSV reports
- Historical trend tracking
- **Cost:** FREE
- **Manual equivalent:** 2 hours/week

### 5. **Link Building Outreach**
- Personalized outreach templates
- Strategy-based customization
- Target website research
- **Cost:** ~$0.20/batch
- **Manual equivalent:** 4 hours

### 6. **Master Scheduler**
- Automates all above tasks
- Cron-compatible
- Status tracking
- Error logging

---

## 📁 Where Files Go

### Generated Content:
```
src/content/locations/*.md          # Suburb pages → publish to site
automation/generated/gbp-posts/     # GBP posts → copy to GBP
automation/generated/review-emails/ # Review emails → send via email
automation/generated/link-outreach/ # Outreach emails → personalize & send
```

### Reports:
```
automation/reports/rank-report-*.html  # Ranking reports → view in browser
automation/reports/rank-report-*.csv   # Ranking data → analyze
```

### Tracking:
```
automation/logs/*.log                      # Execution logs
automation/data/automation-status.json     # Run history
automation/data/rankings/                  # Historical rankings
```

---

## 💻 All Available Commands

### Content Generation:
```bash
npm run automation:suburb-pages    # Generate 10 suburb landing pages
npm run automation:gbp-posts       # Generate 12 GBP posts
npm run automation:reviews         # Generate review request emails
npm run automation:link-outreach   # Generate link outreach emails
```

### Tracking & Reporting:
```bash
npm run automation:rank-track      # Track keyword rankings (GSC API)
npm run automation:status          # Show automation run history
```

### System Management:
```bash
npm run automation:scheduled       # Run all scheduled tasks
npm run automation:run <script>    # Run specific automation
npm run automation:list            # List all automations
npm run automation:help            # Show help
npm run automation:test            # Verify system
npm run automation:setup           # Run setup script
npm run automation:health          # Generate health dashboard
npm run automation:monitor         # Run health checks
```

---

## ⏰ Recommended Schedule

| Task | Frequency | Day | Command |
|------|-----------|-----|---------|
| Suburb pages | Monthly | 1st | `automation:suburb-pages` |
| GBP posts | Weekly | Monday | `automation:gbp-posts` |
| Review emails | Daily | M-F | `automation:reviews` |
| Link outreach | Monthly | 1st | `automation:link-outreach` |
| Rank tracking | Weekly | Monday | `automation:rank-track` |

### Auto-schedule with cron:
```bash
# Weekly GBP posts
0 7 * * 1 cd /path/to/tpp && npm run automation:gbp-posts >> automation/logs/gbp.log 2>&1

# Weekly rank tracking
0 10 * * 1 cd /path/to/tpp && npm run automation:rank-track >> automation/logs/rank-track.log 2>&1

# Daily review requests (M-F)
0 9 * * 1-5 cd /path/to/tpp && npm run automation:reviews >> automation/logs/reviews.log 2>&1

# Monthly content generation (1st of month)
0 10 1 * * cd /path/to/tpp && npm run automation:suburb-pages >> automation/logs/suburb-pages.log 2>&1
0 11 1 * * cd /path/to/tpp && npm run automation:link-outreach >> automation/logs/link-outreach.log 2>&1
```

---

## 🔧 Configuration

### 1. API Key (Required)
```bash
# Set API key
export ANTHROPIC_API_KEY=sk-ant-xxxxx

# Make it permanent
echo 'export ANTHROPIC_API_KEY=sk-ant-xxxxx' >> ~/.bashrc
source ~/.bashrc
```

**Get your API key:** https://console.anthropic.com/

### 2. Client Data (For Review Automation)
**File:** `automation/data/clients.json`

```json
[
  {
    "id": "client-001",
    "name": "John Smith",
    "email": "john@example.com",
    "projectType": "Website Redesign",
    "projectCompletionDate": "2025-10-12",
    "status": "completed",
    "suburb": "Parramatta"
  }
]
```

### 3. Google Search Console (For Rank Tracking)
**Optional** - See `automation/AUTOMATION-SETUP-GUIDE.md` for full setup.

Quick steps:
1. Create Google Cloud project
2. Enable Search Console API
3. Create service account
4. Download credentials JSON
5. Add service account to GSC property
6. Set environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
   ```

### 4. Customize Targets

**Suburb list:** Edit `automation/scripts/generate-suburb-pages.mjs`
```javascript
targetSuburbs: [
  { name: 'YourSuburb', postcode: '2000', region: 'Sydney', ... },
]
```

**Keywords to track:** Edit `automation/scripts/rank-tracker.mjs`
```javascript
keywords: [
  'your keyword here',
  // Add more...
]
```

**Link targets:** Edit `automation/scripts/link-outreach.mjs`
```javascript
targetWebsites: [
  { url: 'https://example.com', type: 'publication', ... },
]
```

---

## 💰 Cost & ROI

### Monthly Costs:
- Anthropic API: $30-50
- Google Search Console: FREE
- **Total: $30-50/month**

### Time Saved:
- Content generation: 8 hrs/month
- GBP posts: 3 hrs/month
- Review emails: 2 hrs/month
- Rank tracking: 2 hrs/month
- Link outreach: 4 hrs/month
- **Total: 19 hours/month**

### ROI:
```
Time saved: 19 hours/month
Value (at $50/hr): $950/month
Cost: $30-50/month
Net benefit: $900-920/month
ROI: 1,800-3,067%
```

---

## 📚 Documentation

**Quick Guides:**
- `GETTING-STARTED-AUTOMATION.md` - 2-minute setup
- `AUTOMATION-QUICK-REFERENCE.md` - Daily commands
- `automation/README.md` - This file

**Complete Guides:**
- `automation/AUTOMATION-SETUP-GUIDE.md` - Full setup (15 min)
- `automation/INDEX.md` - Master index
- `AUTOMATION-FINAL-SUMMARY.md` - Delivery summary

**Templates:**
- `SUBURB-PAGE-TEMPLATE.md` - Content structure
- `automation/config/.env.example` - Environment variables
- `automation/data/clients.json.example` - Client data

**Integration:**
- `SEO-AUTOMATION-INTEGRATION-PLAN.md` - VPS/GitHub deployment

---

## 🆘 Troubleshooting

### "API key not set"
```bash
export ANTHROPIC_API_KEY=your_key_here
```

### "No pages generated"
- Check API key is set: `echo $ANTHROPIC_API_KEY`
- Run test: `npm run automation:test`
- Check logs: `cat automation/logs/*.log`

### "GSC API error"
- Verify service account is added to GSC
- Check credentials path
- See `automation/AUTOMATION-SETUP-GUIDE.md` → "Rank Tracker"

### Tests failing
```bash
npm run automation:test
# Fix issues shown in test output
```

### Generated content quality issues
- Review AI prompts in script files
- Adjust temperature/max_tokens
- Add more specific instructions
- Test with small batches first

---

## 📊 Monthly Workflow

### Week 1 (1st of month):
```bash
npm run automation:suburb-pages     # Generate 10 pages
npm run automation:link-outreach    # Generate outreach
# Review, personalize, publish/send
```

### Weekly (Mondays):
```bash
npm run automation:gbp-posts        # Generate 12 posts
npm run automation:rank-track       # Check rankings
# Review reports, publish GBP posts
```

### Daily (M-F):
```bash
npm run automation:reviews          # Check for new requests
# Send if any ready
```

### End of Month:
```bash
npm run automation:status           # Check what ran
# Review logs, reports, analytics
# Optimize based on data
```

---

## ⚠️ Important Reminders

### Always Review AI Content
✅ **Do:**
- Review suburb pages before publishing
- Personalize outreach emails
- Check GBP posts for accuracy
- Verify review request details

❌ **Don't:**
- Blindly publish AI content
- Send templated emails without personalization
- Mass-generate 50 pages at once
- Over-automate without quality control

### Avoid Google Penalties
- Stagger content (5-10 pages/month max)
- Make content genuinely useful
- Build real relationships
- Follow quality guidelines

### Email Deliverability
- Send max 5-10 emails/day
- Warm up your domain
- Use professional email service
- Personalize everything

---

## 🎯 Expected Results

### Month 1:
- 5-10 suburb pages published
- 12 GBP posts created
- 5-10 review requests sent
- Automation running smoothly

### Month 3:
- 15-25 suburb pages live
- 36 GBP posts created
- 15+ reviews collected
- 5+ backlinks acquired
- First ranking improvements

### Month 6:
- 30-50 suburb pages live
- 72 GBP posts created
- 30+ reviews collected
- Ranking for 10+ keywords
- 15+ quality backlinks
- 100%+ traffic increase

---

## 🚀 Next Steps

**Today:**
1. Run `npm run automation:test` (verify)
2. Set `export ANTHROPIC_API_KEY=your_key`
3. Generate first suburb pages
4. Review output quality

**This Week:**
1. Generate GBP posts
2. Publish 2-3 suburb pages
3. Read complete setup guide
4. Customize configurations

**This Month:**
1. Set up Google Search Console API (optional)
2. Add client data for reviews
3. Configure cron job for automation
4. Start tracking results

---

## 📞 Support

**Documentation:**
- Quick reference: `AUTOMATION-QUICK-REFERENCE.md`
- Complete guide: `automation/AUTOMATION-SETUP-GUIDE.md`
- Master index: `automation/INDEX.md`

**Commands:**
- Help: `npm run automation:help`
- Test: `npm run automation:test`
- Status: `npm run automation:status`

**Logs:**
- Check: `automation/logs/`
- Verify: `npm run automation:test`

---

**🤖 Complete automation. Complete documentation. Ready to dominate local SEO.**
