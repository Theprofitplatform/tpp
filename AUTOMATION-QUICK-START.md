# ⚡ Automation Quick Start Tutorial

**Get your first automation running in 10 minutes**

---

## 🎯 What You'll Learn

By the end of this tutorial, you'll have:
- ✅ Verified your automation system
- ✅ Generated your first suburb page
- ✅ Generated your first batch of GBP posts
- ✅ Created your first health dashboard
- ✅ Set up ongoing automation

**Time required:** 10-15 minutes

---

## 📋 Prerequisites

**Before starting, ensure you have:**
1. Node.js installed (v16+)
2. Anthropic API key (get from https://console.anthropic.com/)
3. This project installed with dependencies (`npm install`)

**Check your setup:**
```bash
# Check Node version
node --version
# Should show: v16.x.x or higher

# Check if in correct directory
pwd
# Should end with: /tpp

# Check dependencies installed
ls node_modules/@anthropic-ai/sdk
# Should exist (no error)
```

---

## Step 1: Verify System (2 minutes)

### Run the automated test suite

```bash
npm run automation:test
```

**Expected output:**
```
🧪 SEO Automation System Test
==================================================

Testing: Required directories exist... ✓ PASS
Testing: All automation scripts exist... ✓ PASS
Testing: Documentation files exist... ✓ PASS
Testing: Configuration files present... ✓ PASS
Testing: Node.js version compatible... ✓ PASS
Testing: Required npm packages installed... ✓ PASS
Testing: API key configuration present... ✓ PASS
Testing: Scripts have valid syntax... ✓ PASS
Testing: NPM automation scripts configured... ✓ PASS
Testing: Script files are executable... ✓ PASS

==================================================
Test Results:
✓ Passed: 10
==================================================

🎉 All tests passed! Automation system is ready.
```

**If you see API key error:**
```bash
# Set your API key
export ANTHROPIC_API_KEY=sk-ant-api03-YOUR-KEY-HERE

# Make it permanent (add to ~/.bashrc or ~/.zshrc)
echo 'export ANTHROPIC_API_KEY=sk-ant-api03-YOUR-KEY-HERE' >> ~/.bashrc
source ~/.bashrc

# Test again
npm run automation:test
```

✅ **Checkpoint:** All 10 tests passing before continuing

---

## Step 2: Generate Your First Suburb Page (3 minutes)

### Run the suburb page generator

```bash
npm run automation:suburb-pages
```

**What happens:**
1. Script connects to Claude API
2. Generates 10 unique suburb landing pages
3. Saves to `src/content/locations/*.md`
4. Each page is 600-800 words, SEO-optimized

**Expected output:**
```
🏙️  Generating Suburb Landing Pages
==================================================

Generating 10 suburb pages...

🤖 Generating content for Bondi...
✅ Created: src/content/locations/bondi.md

🤖 Generating content for Parramatta...
✅ Created: src/content/locations/parramatta.md

... (8 more suburbs)

==================================================
📊 Generation Summary:
✅ Successfully created: 10 pages
❌ Failed: 0
📁 Output directory: src/content/locations/
💰 Estimated cost: ~$0.50

⏱️  Total time: 45 seconds
```

### Review the generated pages

```bash
# List all generated pages
ls -la src/content/locations/

# View one of them
cat src/content/locations/bondi.md | head -50
```

**What you should see:**
```markdown
---
title: "Digital Marketing Services in Bondi | The Profit Platform"
description: "Expert SEO, Google Ads & web design for Bondi businesses..."
suburb: "Bondi"
postcode: "2026"
region: "Eastern Suburbs"
---

# Digital Marketing Services in Bondi

[Unique, locally-focused content about Bondi businesses...]
```

✅ **Checkpoint:** 10 suburb pages created in `src/content/locations/`

---

## Step 3: Generate GBP Posts (2 minutes)

### Run the GBP post generator

```bash
npm run automation:gbp-posts
```

**What happens:**
1. Generates 12 Google Business Profile posts (1 month worth)
2. Creates 3 output formats: JSON, CSV, Markdown
3. Saves to `automation/generated/gbp-posts/`

**Expected output:**
```
📱 Google Business Profile Post Generator
==================================================

Generating 12 GBP posts (3 per week for 4 weeks)...

Week 1:
🤖 Generating post 1/3 (tip)...
✅ Created post 1

🤖 Generating post 2/3 (case-study)...
✅ Created post 2

... (10 more posts)

==================================================
📊 Generation Summary:
✅ Successfully created: 12 posts
❌ Failed: 0

📁 Output files:
   - JSON: automation/generated/gbp-posts/gbp-posts-2025-10-19.json
   - CSV:  automation/generated/gbp-posts/gbp-posts-2025-10-19.csv
   - Markdown: automation/generated/gbp-posts/gbp-posts-2025-10-19.md

💰 Estimated cost: ~$0.30
⏱️  Total time: 30 seconds
```

### Review the posts

```bash
# View the markdown file (easiest to read)
cat automation/generated/gbp-posts/gbp-posts-$(date +%Y-%m-%d).md
```

**What you should see:**
```markdown
# Google Business Profile Posts - Generated 2025-10-19

## Week 1 (Oct 20-26)

### Post 1 - Monday (Tip)
🎯 Local SEO tip for Bondi businesses: Update your Google Business
Profile weekly with fresh photos and posts. We've seen this boost
local search visibility by 35%! Need help? Call 0487 286 451
#BondiBusinesses #LocalSEO

**Image suggestion:** Screenshot of Google Business Profile analytics
**Schedule for:** Monday, 9:00 AM

---

### Post 2 - Wednesday (Case Study)
📈 Success story: Helped a Parramatta cafe increase foot traffic by
127% through targeted Google Ads. Ready for similar results?
Book a free consultation today! #ParramattaLocal #GoogleAds

**Image suggestion:** Graph showing results
**Schedule for:** Wednesday, 11:00 AM

---

[... 10 more posts]
```

✅ **Checkpoint:** 12 GBP posts created with 3 formats

---

## Step 4: Generate Health Dashboard (1 minute)

### Create your first health dashboard

```bash
npm run automation:health
```

**Expected output:**
```
🏥 Generating health dashboard...

📊 Collecting system stats...
🤖 Analyzing automation status...
⚠️  Checking recent alerts...
🧮 Calculating health score...
📄 Generating HTML dashboard...
✅ HTML dashboard saved: ./automation/reports/health-dashboard.html
✅ JSON data saved: ./automation/reports/health-dashboard.json

==================================================
🏥 Health Score: 85/100 (Good)
💻 Disk: 57% | Memory: 40%
🤖 Automation Success Rate: 100%
⚠️  Issues: 0
==================================================

👉 View dashboard: file:///path/to/tpp/automation/reports/health-dashboard.html
```

### View the dashboard

```bash
# Open in your default browser (macOS)
open automation/reports/health-dashboard.html

# Or Windows
start automation/reports/health-dashboard.html

# Or Linux
xdg-open automation/reports/health-dashboard.html
```

**What you'll see:**
- 🎯 Large health score circle (85/100)
- 💻 System resources (disk, memory)
- 🤖 Automation statistics
- ⚙️ Configuration status
- 📋 Recent automation runs

✅ **Checkpoint:** Beautiful HTML dashboard opens in browser

---

## Step 5: Check System Health (1 minute)

### Run the VPS monitor

```bash
npm run automation:monitor
```

**Expected output:**
```
=========================================
  SEO Automation Health Monitor
=========================================

✓ Disk space OK (57%)
✓ Memory OK (40%)
✓ API key configured
✓ All required directories present
✓ Automation running regularly (last run: 0 days ago)
✓ No failures in last 7 days

✓ Overall Health: EXCELLENT (100%)

Full logs: /path/to/tpp/automation/logs/health-check.log
Alerts: /path/to/tpp/automation/logs/alerts.log
```

✅ **Checkpoint:** Health score 90%+ with all checks passing

---

## Step 6: Set Up Ongoing Automation (2 minutes)

### Option A: Run on schedule with cron (Linux/Mac)

```bash
# Edit your crontab
crontab -e

# Add these lines:
# Daily automation check at 6 AM
0 6 * * * cd /full/path/to/tpp && npm run automation:scheduled >> automation/logs/cron.log 2>&1

# Health monitoring every 6 hours
0 */6 * * * cd /full/path/to/tpp && npm run automation:monitor >> automation/logs/cron-monitor.log 2>&1

# Weekly dashboard generation (Mondays at 9 AM)
0 9 * * 1 cd /full/path/to/tpp && npm run automation:health >> automation/logs/cron.log 2>&1

# Save and exit (Ctrl+X, then Y, then Enter in nano)
```

### Option B: Run manually when needed

```bash
# Monday mornings (30 min):
npm run automation:gbp-posts          # Generate GBP posts
npm run automation:rank-track         # Check rankings (needs GSC setup)
npm run automation:health             # Generate dashboard

# 1st of month (1 hour):
npm run automation:suburb-pages       # Generate 10 suburb pages
npm run automation:link-outreach      # Generate outreach emails

# Daily (5 min):
npm run automation:reviews            # Check for review requests
npm run automation:monitor            # Quick health check
```

✅ **Checkpoint:** Cron configured OR manual schedule understood

---

## 🎉 Success! What You've Accomplished

### You've just:
1. ✅ Verified your automation system (10/10 tests)
2. ✅ Generated 10 suburb landing pages
3. ✅ Created 12 GBP posts for the month
4. ✅ Built a visual health dashboard
5. ✅ Checked system health
6. ✅ Set up ongoing automation

### Your automation system is now:
- 🟢 **Fully functional**
- 🟢 **Generating content**
- 🟢 **Monitored for health**
- 🟢 **Ready for production**

---

## 📊 What You Generated (Total Value)

| Item | Quantity | Manual Time | Automated Time | Time Saved |
|------|----------|-------------|----------------|------------|
| Suburb pages | 10 | 8 hours | 45 seconds | 7h 59min |
| GBP posts | 12 | 3 hours | 30 seconds | 2h 59min |
| Health checks | 1 | 30 min | 5 seconds | 30 min |
| **TOTAL** | **23 items** | **11.5 hours** | **1.5 minutes** | **11h 28min** |

**Value delivered:** ~$575 in time savings (at $50/hr)
**API cost:** ~$0.80
**ROI:** 71,775% 🚀

---

## 🎯 Next Steps

### This Week

**1. Review and publish generated content (30 min)**
```bash
# Review suburb pages
ls src/content/locations/

# Edit any that need tweaking
nano src/content/locations/bondi.md

# Deploy to website
npm run build
npm run deploy
```

**2. Schedule GBP posts (15 min)**
```bash
# Open your GBP posts
cat automation/generated/gbp-posts/gbp-posts-*.md

# In Google Business Profile:
# 1. Copy post 1 → Schedule for Monday
# 2. Copy post 2 → Schedule for Wednesday
# 3. Copy post 3 → Schedule for Friday
# Repeat for 4 weeks
```

**3. Explore other automations**
```bash
# See all available automations
npm run automation:list

# Try review request generator
npm run automation:reviews
# (Needs clients.json configured first)

# Try link outreach generator
npm run automation:link-outreach
```

### This Month

**1. Set up review automation**
```bash
# Edit client list
nano automation/data/clients.json

# Add your completed projects with dates
# Then run:
npm run automation:reviews
```

**2. Set up rank tracking (optional)**
- Follow Google Search Console API setup in `automation/AUTOMATION-SETUP-GUIDE.md`
- Once configured: `npm run automation:rank-track`

**3. Customize for your needs**
```bash
# Add your suburbs
nano automation/scripts/generate-suburb-pages.mjs

# Customize GBP post types
nano automation/scripts/gbp-auto-poster.mjs

# Update business info
nano automation/scripts/review-automation.mjs
```

---

## 🆘 Troubleshooting

### "API key not found"
```bash
# Set environment variable
export ANTHROPIC_API_KEY=sk-ant-your-key-here

# Make permanent
echo 'export ANTHROPIC_API_KEY=sk-ant-your-key-here' >> ~/.bashrc
source ~/.bashrc
```

### "No pages generated"
```bash
# Check API key is set
echo $ANTHROPIC_API_KEY

# Run test
npm run automation:test

# Check logs
cat automation/logs/*.log

# Try again
npm run automation:suburb-pages
```

### "Low health score"
```bash
# See detailed breakdown
npm run automation:monitor

# Generate dashboard to see issues
npm run automation:health

# Check logs
cat automation/logs/health-check.log
cat automation/logs/alerts.log
```

### "Cron not running"
```bash
# Check cron status
service cron status

# Check cron logs
cat automation/logs/cron.log

# Test manually
npm run automation:scheduled

# Verify crontab
crontab -l
```

---

## 📚 Learn More

**Quick References:**
- `automation/README.md` - System overview
- `automation/WORKFLOW-GUIDE.md` - Complete workflows
- `automation/MONITORING-GUIDE.md` - Health monitoring
- `automation/INDEX.md` - Master documentation index

**Setup Guides:**
- `automation/AUTOMATION-SETUP-GUIDE.md` - Full setup (15 min)
- `automation/SEO-AUTOMATION-README.md` - SEO-specific guide

**Commands:**
```bash
npm run automation:help     # Show all commands
npm run automation:list     # List automations
npm run automation:status   # Show run history
```

---

## 💡 Pro Tips

### Optimize AI Output
1. **Adjust prompts** in script files for better content
2. **Test small batches** before generating 10+ pages
3. **Review and edit** AI content before publishing
4. **Add local knowledge** to suburb pages

### Save API Costs
1. **Generate in batches** (don't run multiple times)
2. **Lower max_tokens** if content is too long
3. **Skip optional generations** when not needed
4. **Reuse good content** with minor edits

### Maximize Efficiency
1. **Set up cron** for fully automated workflow
2. **Create templates** for common edits
3. **Batch review** content weekly vs daily
4. **Track metrics** to prove ROI

---

## 🎊 Congratulations!

You've successfully:
- ✅ Set up complete automation system
- ✅ Generated real, usable content
- ✅ Saved 11+ hours of work
- ✅ Created $575+ in value
- ✅ Spent < $1 in API costs

**Your automation system is ready to run. Set it and (mostly) forget it!**

---

## 📞 Getting Help

**Quick diagnostics:**
```bash
npm run automation:test      # Test everything
npm run automation:monitor   # Health check
npm run automation:status    # Run history
npm run automation:help      # Show commands
```

**Check logs:**
```bash
cat automation/logs/health-check.log
cat automation/logs/alerts.log
cat automation/logs/cron.log
```

**Documentation:**
- Read: `automation/INDEX.md` (master index)
- Troubleshoot: `automation/WORKFLOW-GUIDE.md`
- Monitor: `automation/MONITORING-GUIDE.md`

---

**⚡ That's it! You're now running a professional-grade SEO automation system.**

**Time invested:** 10-15 minutes
**Time saved per month:** 15-20 hours
**ROI:** Infinite 🚀

Happy automating! 🤖
