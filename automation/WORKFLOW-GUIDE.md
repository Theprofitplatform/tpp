# 🔄 Complete Automation Workflow Guide

**End-to-end guide showing how all automation pieces work together**

---

## 📚 Table of Contents

1. [System Overview](#system-overview)
2. [Daily Workflow](#daily-workflow)
3. [Weekly Workflow](#weekly-workflow)
4. [Monthly Workflow](#monthly-workflow)
5. [Complete Automation Flow](#complete-automation-flow)
6. [Script Dependencies](#script-dependencies)
7. [Troubleshooting Workflows](#troubleshooting-workflows)

---

## 🎯 System Overview

### Core Automation Scripts (5)
| Script | Frequency | Output | Requires API |
|--------|-----------|--------|--------------|
| `generate-suburb-pages` | Monthly | Location pages → `src/content/locations/` | ✅ Anthropic |
| `gbp-auto-poster` | Weekly | GBP posts → `automation/generated/gbp-posts/` | ✅ Anthropic |
| `review-automation` | Daily (M-F) | Review emails → `automation/generated/review-emails/` | ✅ Anthropic |
| `rank-tracker` | Weekly | Reports → `automation/reports/` | ✅ Google Search Console |
| `link-outreach` | Monthly | Outreach emails → `automation/generated/link-outreach/` | ✅ Anthropic |

### Support Scripts (7)
| Script | Purpose | When to Run |
|--------|---------|-------------|
| `automation-orchestrator` | Master scheduler | Daily (automated via cron) |
| `test-automation` | System verification | Before first use, after changes |
| `vps-monitor` | Health checks | Every 6 hours (cron) |
| `health-dashboard` | Visual health report | Weekly, on-demand |
| `check-topic-queue` | Blog topic monitoring | Weekly |
| `build-internal-link-map` | Blog linking | After new blog posts |
| `generate-topics` | Blog topic creation | When queue < 10 topics |

---

## 📅 Daily Workflow

### Morning Routine (9:00 AM, Mon-Fri)

**1. Check System Health**
```bash
npm run automation:monitor
```
**Expected:** All checks passing, health 90%+

**2. Review Automation Runs (If Scheduled)**
```bash
npm run automation:status
```
**Expected:** See last night's scheduled runs

**3. Check Review Requests (Automated)**
```bash
# This runs automatically via cron, but you can check:
ls -la automation/generated/review-emails/
```
**What to do:**
- Open latest review email file
- Copy personalized emails
- Send via your email client or automation tool
- Mark as sent in your CRM

**4. Check for Alerts**
```bash
cat automation/logs/alerts.log | tail -10
```
**Expected:** No critical alerts

### Real-World Example
```bash
# 9:00 AM - Monday morning routine

# 1. Quick health check
npm run automation:monitor
# ✓ All checks passed

# 2. Check what ran overnight
npm run automation:status
# Shows: review-automation, gbp-posts, rank-tracker all succeeded

# 3. Process GBP posts (Mondays only)
cat automation/generated/gbp-posts/gbp-posts-2025-10-20.md
# Copy 3 posts to GBP interface, schedule for week

# 4. Send review requests
cat automation/generated/review-emails/review-requests-2025-10-20.md
# 2 clients ready - send personalized emails

# Done in 15 minutes vs 1+ hour manual work
```

---

## 📊 Weekly Workflow

### Monday Morning (7:00-10:00 AM)

**Automated (via cron):**
- 7:00 AM: GBP posts generated (12 posts for the month)
- 8:00 AM: Rank tracker runs, generates HTML report
- 9:00 AM: Review requests checked/generated

**Your Manual Tasks:**

**1. Review GBP Posts**
```bash
# View generated posts
cat automation/generated/gbp-posts/gbp-posts-$(date +%Y-%m-%d).md

# Or open JSON for API integration
cat automation/generated/gbp-posts/gbp-posts-$(date +%Y-%m-%d).json
```
**Action Required:**
- Review 12 generated posts
- Schedule 3 posts per week in GBP interface
- Attach relevant images (suggestions provided)
- Set post dates/times

**2. Review Rank Report**
```bash
# Open HTML report in browser
open automation/reports/rank-report-$(date +%Y-%m-%d).html
# Or for Windows:
# start automation/reports/rank-report-$(date +%Y-%m-%d).html
```
**What to Look For:**
- Keywords moving up (celebrate! 🎉)
- Keywords dropping (investigate why)
- New ranking opportunities
- Competitor movements

**3. Generate Health Dashboard**
```bash
npm run automation:health
```
**Action Required:**
- Review overall health score
- Check for trends (disk usage, memory, failures)
- Address any warnings before they become critical

**4. Blog Content Check (Optional)**
```bash
npm run topics:check
```
**Action Required:**
- If pending topics < 10: `npm run topics:generate`
- Review next week's blog topics
- Ensure content pipeline is healthy

### Friday Afternoon (Review & Plan)

**1. Weekly Summary**
```bash
# Check week's automation runs
npm run automation:status

# Review all generated content
ls -la automation/generated/*/
```

**2. Plan Next Week**
- Review upcoming GBP posts (already scheduled)
- Check blog topic queue
- Update client list if needed for reviews
- Schedule any manual SEO tasks based on rank report

---

## 🗓️ Monthly Workflow

### 1st of the Month (9:00-11:00 AM)

**Automated (via cron):**
- 9:00 AM: Suburb pages generation (10 new pages)
- 10:00 AM: Link outreach emails generated

**Your Manual Tasks:**

**1. Review Suburb Pages**
```bash
# View newly generated pages
ls -lt src/content/locations/ | head -11
```
**Action Required:**
- Review 10 new suburb pages for accuracy
- Check local references are correct
- Verify schema markup
- Edit if needed
- Publish to website via:
  ```bash
  npm run build
  npm run deploy
  ```

**2. Review Link Outreach**
```bash
# View generated outreach emails
cat automation/generated/link-outreach/outreach-$(date +%Y-%m-%d).md
```
**Action Required:**
- Review personalized outreach templates
- Research target websites
- Add personal touches to each email
- Send via your email client (5-10 per day max)
- Track responses in spreadsheet/CRM

**3. Monthly Health Review**
```bash
# Generate fresh dashboard
npm run automation:health

# Review full month's logs
cat automation/logs/health-check.log | grep "Health Score" | tail -30
```
**What to Look For:**
- Health score trends (improving or declining?)
- Recurring issues
- Resource usage patterns
- Automation success rates

**4. Update Configurations (If Needed)**

**Update target suburbs:**
```bash
nano automation/scripts/generate-suburb-pages.mjs
# Add new suburbs to targetSuburbs array
```

**Update client list:**
```bash
nano automation/data/clients.json
# Add new clients, update project completion dates
```

**Update keywords to track:**
```bash
nano automation/scripts/rank-tracker.mjs
# Add/remove keywords in CONFIG.keywords array
```

---

## 🔄 Complete Automation Flow

### How Everything Works Together

```
┌─────────────────────────────────────────────────────┐
│           CRON JOB (Daily 6:00 AM)                  │
│   Runs: automation-orchestrator.mjs scheduled       │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│              ORCHESTRATOR                            │
│   Checks today's schedule & runs appropriate tasks  │
└─────┬───────┬────────┬──────────┬──────────┬────────┘
      │       │        │          │          │
      ▼       ▼        ▼          ▼          ▼
   ┌────┐ ┌─────┐ ┌────────┐ ┌──────┐  ┌────────┐
   │MON │ │TUE- │ │1st of  │ │MON  │  │1st of  │
   │7AM │ │FRI  │ │month   │ │8AM  │  │month   │
   │GBP │ │9AM  │ │9AM     │ │Rank │  │10AM    │
   └─┬──┘ └──┬──┘ └───┬────┘ └──┬───┘  └───┬────┘
     │       │        │         │          │
     │       │        │         │          │
     ▼       ▼        ▼         ▼          ▼
┌─────────────────────────────────────────────────────┐
│              ANTHROPIC API                           │
│         (Claude AI generates content)                │
└────┬───────┬────────┬──────────────────┬────────────┘
     │       │        │                  │
     ▼       ▼        ▼                  ▼
┌─────────┐ ┌──────┐ ┌────────┐ ┌────────────┐
│12 GBP   │ │Review│ │10 Sub- │ │Outreach    │
│Posts    │ │Emails│ │urb Pgs │ │Emails      │
└────┬────┘ └───┬──┘ └───┬────┘ └──────┬─────┘
     │          │        │             │
     ▼          ▼        ▼             ▼
┌─────────────────────────────────────────────────────┐
│              OUTPUT DIRECTORIES                      │
│  automation/generated/   &   src/content/locations/ │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
              ┌──────────────┐
              │   YOU REVIEW │
              │  & PUBLISH   │
              └──────────────┘
```

### Parallel Process: Monitoring

```
┌─────────────────────────────────────────┐
│    CRON JOB (Every 6 hours)             │
│    Runs: vps-monitor.sh                 │
└──────────────┬──────────────────────────┘
               │
               ▼
     ┌──────────────────┐
     │ 6 HEALTH CHECKS  │
     │ - Disk space     │
     │ - Memory         │
     │ - API keys       │
     │ - Directories    │
     │ - Last run       │
     │ - Failures       │
     └────────┬─────────┘
              │
              ▼
     ┌──────────────────┐
     │  LOGS & ALERTS   │
     │  health-check.log│
     │  alerts.log      │
     └────────┬─────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│    WEEKLY: health-dashboard.mjs         │
│    Generates HTML visual report         │
└─────────────────────────────────────────┘
```

---

## 🔗 Script Dependencies

### What Calls What

```
automation-orchestrator.mjs
├── generate-suburb-pages.mjs (monthly)
├── gbp-auto-poster.mjs (weekly Mon)
├── review-automation.mjs (daily M-F)
├── rank-tracker.mjs (weekly Mon)
└── link-outreach.mjs (monthly)

vps-monitor.sh
└── Reads: automation-status.json
    (Created by: automation-orchestrator.mjs)

health-dashboard.mjs
├── Reads: automation-status.json
├── Reads: health-check.log (from vps-monitor.sh)
└── Reads: alerts.log (from vps-monitor.sh)

Blog Automation (Separate):
generate-topics.mjs
└── Updates: topic-queue.json

check-topic-queue.mjs
└── Reads: topic-queue.json

build-internal-link-map.mjs
├── Reads: src/content/blog/*.md
└── Creates: internal-link-map.json
```

### Data Flow

```
User Sets API Key
      ↓
test-automation.mjs validates
      ↓
Cron runs automation-orchestrator.mjs
      ↓
Individual scripts run → Use Anthropic API
      ↓
Generate content → Save to files
      ↓
Update automation-status.json
      ↓
vps-monitor.sh reads status → Writes logs
      ↓
health-dashboard.mjs reads logs → Creates HTML
      ↓
User reviews dashboard → Publishes content
```

---

## 🔧 Troubleshooting Workflows

### Problem: "No content generated"

**Diagnostic Flow:**
```bash
# 1. Check API key
echo $ANTHROPIC_API_KEY
# Should show: sk-ant-...

# 2. Test system
npm run automation:test
# Should: 10/10 tests passed

# 3. Check logs
cat automation/logs/*.log | grep -i error

# 4. Test manually
npm run automation:suburb-pages
# Watch for errors

# 5. Check output directory
ls -la automation/generated/
ls -la src/content/locations/
```

**Common Fixes:**
- API key not set → `export ANTHROPIC_API_KEY=...`
- Directory missing → `mkdir -p automation/generated/{gbp-posts,review-emails,link-outreach}`
- Permission issue → `chmod +x automation/scripts/*.sh`

---

### Problem: "Automation not running on schedule"

**Diagnostic Flow:**
```bash
# 1. Check cron job exists
crontab -l | grep automation

# 2. Check cron is running
sudo service cron status

# 3. Check cron logs
cat automation/logs/cron.log | tail -50

# 4. Test manually
npm run automation:scheduled

# 5. Check status
npm run automation:status
```

**Common Fixes:**
- Cron not set up → Add to crontab
- Wrong path in cron → Use absolute paths
- Environment vars missing → Set in cron or script

---

### Problem: "Low health score"

**Diagnostic Flow:**
```bash
# 1. Run health check
npm run automation:monitor
# See which checks fail

# 2. Generate dashboard
npm run automation:health
# Visual breakdown of issues

# 3. Check specific issue:
# - High disk usage
df -h .
# Solution: Clean old files, logs

# - High memory
free -h
# Solution: Restart system, optimize scripts

# - Automation failures
npm run automation:status
# Solution: Check error logs, fix scripts

# 4. Fix and retest
npm run automation:monitor
```

---

## 📋 Quick Reference Checklists

### First-Time Setup
- [ ] Install dependencies: `npm install`
- [ ] Set API key: `export ANTHROPIC_API_KEY=...`
- [ ] Test system: `npm run automation:test`
- [ ] Configure clients: Edit `automation/data/clients.json`
- [ ] Set up cron: `crontab -e` + add schedule
- [ ] Run first automation: `npm run automation:suburb-pages`
- [ ] Review output: Check `src/content/locations/`
- [ ] Generate dashboard: `npm run automation:health`

### Daily Checklist (5 min)
- [ ] Run: `npm run automation:monitor`
- [ ] Check: `automation/logs/alerts.log`
- [ ] Review: Generated review emails (if any)
- [ ] Send: Review request emails

### Weekly Checklist (Mon, 30 min)
- [ ] Review: GBP posts (`automation/generated/gbp-posts/`)
- [ ] Schedule: 3 posts in GBP for the week
- [ ] Review: Rank report (`automation/reports/rank-report-*.html`)
- [ ] Generate: `npm run automation:health`
- [ ] Check: Blog topic queue: `npm run topics:check`

### Monthly Checklist (1st, 1-2 hours)
- [ ] Review: 10 new suburb pages
- [ ] Edit: Any inaccuracies
- [ ] Deploy: `npm run deploy`
- [ ] Review: Link outreach emails
- [ ] Send: 5-10 outreach emails (spread over month)
- [ ] Update: Client list, suburbs, keywords
- [ ] Review: Monthly health trends
- [ ] Optimize: Based on data

---

## 🎯 Success Metrics

### Track These Weekly
- GBP posts scheduled: Target 3/week
- Review requests sent: Target 5-10/week
- Keyword rankings improved: Track in rank report
- Health score: Target >90%
- Automation success rate: Target >95%

### Track These Monthly
- Suburb pages published: Target 5-10/month
- Backlinks acquired: Target 2-3/month
- Reviews collected: Target 3-5/month
- Organic traffic: Check Google Analytics
- ROI: Time saved vs cost

---

## 🚀 Optimization Tips

### Improve Automation Quality
1. **Tweak AI prompts** in script files
2. **Adjust temperature** for more/less creativity
3. **Increase max_tokens** for longer content
4. **Test with small batches** before full runs

### Reduce API Costs
1. **Lower max_tokens** where possible
2. **Skip optional generations** (e.g., every other week)
3. **Batch operations** to reduce overhead
4. **Use cache** where applicable

### Increase Efficiency
1. **Automate email sending** (integrate SendGrid/Mailchimp)
2. **Auto-publish GBP posts** (use GBP API)
3. **Auto-deploy suburb pages** (add to cron)
4. **Set up alerts** (email/Slack notifications)

---

**🔄 Complete workflow documented. Ready for full automation.**
