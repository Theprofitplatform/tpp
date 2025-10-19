# TPP Automation System - Architecture Diagram

> **Visual representation of all automations and data flows**

---

## 🏗️ Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          GITHUB ACTIONS (Cloud)                         │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────────┐   │
│  │  Daily Blog Post │  │      Deploy      │  │   Health Check     │   │
│  │                  │  │                  │  │    (Weekly) ⭐      │   │
│  │  Mon/Thu 9 AM    │  │  On push/main    │  │   Mon 9 AM UTC     │   │
│  │                  │  │                  │  │                    │   │
│  │  • Generate      │  │  • Build site    │  │  • Check GitHub    │   │
│  │  • Validate      │  │  • Deploy dist/  │  │  • Check topics    │   │
│  │  • Commit        │  │  • Run tests     │  │  • Check website   │   │
│  │  • Notify        │  │  • Comment PR    │  │  • Ping HC.io      │   │
│  └──────────────────┘  └──────────────────┘  └────────────────────┘   │
│                                                                         │
│  ┌──────────────────┐  ┌──────────────────┐                           │
│  │  Lighthouse CI   │  │   PR Automation  │                           │
│  │                  │  │                  │                           │
│  │  On push/PR      │  │  On PR/comment   │                           │
│  │                  │  │                  │                           │
│  │  • Audit 5 pages │  │  • /swarm review │                           │
│  │  • Post scores   │  │  • /swarm test   │                           │
│  │  • Track history │  │  • /swarm docs   │                           │
│  └──────────────────┘  └──────────────────┘                           │
│                                                                         │
│  Environment: Ubuntu Latest                                            │
│  Secrets: CLAUDE_API_KEY, CLOUDFLARE_API_TOKEN, HEALTHCHECK_PING_URL  │
│  Artifacts: Health reports, test results, Lighthouse scores            │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ git commits
                                  │ deployments
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         GITHUB REPOSITORY                               │
│                      github.com/YOUR-USER/tpp                           │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Source Code                                                    │   │
│  │  • src/pages/            (Astro pages)                          │   │
│  │  • src/components/       (React components)                     │   │
│  │  • src/content/blog/     (Blog posts - auto-generated)          │   │
│  │  • automation/           (Scripts & config)                     │   │
│  │  • .github/workflows/    (GitHub Actions)                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Automation Data                                                │   │
│  │  • automation/topic-queue.json       (22 topics)                │   │
│  │  • automation/internal-link-map.json (SEO links)                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ git pull
                                  │ rsync (optional)
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      VPS (tpp-vps server)                               │
│                   /home/avi/projects/tpp                                │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  CRON JOBS (Scheduled Tasks)                                    │   │
│  │                                                                 │   │
│  │  ┌────────────────────┐  ┌────────────────────┐                │   │
│  │  │ Topic Auto-Refill  │  │ Topic Health Check │                │   │
│  │  │ Monthly 1st @ 2 AM │  │ Weekly Mon @ 8 AM  │                │   │
│  │  │                    │  │                    │                │   │
│  │  │ • Generate 25-30   │  │ • Count pending    │                │   │
│  │  │ • Claude AI        │  │ • Alert if < 10    │                │   │
│  │  │ • Balanced cats    │  │ • List next 10     │                │   │
│  │  └────────────────────┘  └────────────────────┘                │   │
│  │                                                                 │   │
│  │  ┌────────────────────┐  ┌────────────────────┐                │   │
│  │  │  SEO Monitoring    │  │  Instagram Bot     │                │   │
│  │  │  Weekly Mon @ 9 AM │  │  3x daily          │                │   │
│  │  │                    │  │  7 AM, 12 PM, 6 PM │                │   │
│  │  │ • npm run monitor  │  │                    │                │   │
│  │  │ • npm run report   │  │ • Auto-post        │                │   │
│  │  └────────────────────┘  │ • Engage           │                │   │
│  │                           └────────────────────┘                │   │
│  │  ┌────────────────────┐  ┌────────────────────┐                │   │
│  │  │  Database Backups  │  │ Backup Monitoring  │                │   │
│  │  │  Daily @ 2:30 AM   │  │ Every 6 hours      │                │   │
│  │  │                    │  │                    │                │   │
│  │  │ • Supabase backup  │  │ • Verify backups   │                │   │
│  │  │ • Verify @ 3 AM    │  │ • Alert on fail    │                │   │
│  │  └────────────────────┘  └────────────────────┘                │   │
│  │                                                                 │   │
│  │  ┌────────────────────┐  (Optional)                            │   │
│  │  │  Health Check      │  Deployed via:                         │   │
│  │  │  Weekly Mon @ 9 AM │  npm run deploy-to-vps.sh              │   │
│  │  │                    │                                         │   │
│  │  │ • ./health-check-  │                                         │   │
│  │  │   with-ping.sh     │                                         │   │
│  │  └────────────────────┘                                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Environment: Ubuntu 22.04                                              │
│  Dependencies: jq, curl, Node.js, Claude API                            │
│  Logs: /tmp/tpp-health.log, /var/log/syslog                             │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Content deployed from GitHub
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        CLOUDFLARE PAGES                                 │
│                   theprofitplatform.com.au                              │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Production Website                                             │   │
│  │  • Static HTML/CSS/JS (from dist/)                              │   │
│  │  • Astro 5.x build output                                       │   │
│  │  • Optimized assets                                             │   │
│  │  • Schema.org markup                                            │   │
│  │  • Blog posts (auto-generated)                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Cloudflare Features                                            │   │
│  │  • Global CDN (edge caching)                                    │   │
│  │  • Auto HTTPS                                                   │   │
│  │  • Headers: dist/_headers                                       │   │
│  │  • Routing: dist/_routes.json                                   │   │
│  │  • Preview deployments                                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ monitored by
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        HEALTHCHECKS.IO ⭐                               │
│                    https://healthchecks.io                              │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Monitoring Dashboard                                           │   │
│  │  • Check: "TPP Health Monitor"                                  │   │
│  │  • Schedule: Weekly (every 7 days)                              │   │
│  │  • Ping URL: https://hc-ping.com/xxx-xxx-xxx                    │   │
│  │  • Status: ✅ Up / ❌ Down                                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Notifications                                                  │   │
│  │  • Email: you@example.com                                       │   │
│  │  • Slack: #automation-alerts (optional)                         │   │
│  │  • Discord, Telegram, etc. (optional)                           │   │
│  │                                                                 │   │
│  │  Alerts sent when:                                              │   │
│  │  • Check reports failure                                        │   │
│  │  • Check doesn't run (dead-man switch)                          │   │
│  │  • Check is late                                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  History & Logs                                                 │   │
│  │  • Last 30 days of pings                                        │   │
│  │  • Uptime percentage                                            │   │
│  │  • Response time graphs                                         │   │
│  │  • Incident timeline                                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

### Blog Post Generation Flow

```
┌──────────────┐
│ GitHub       │
│ Actions      │
│ (Mon/Thu 9AM)│
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────┐
│ 1. Fetch topic from topic-queue.json│
│    Status: "pending"                 │
│    Priority: Highest first           │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ 2. Generate post with Claude AI      │
│    Model: Sonnet 4                   │
│    Length: 2,500-3,500 words         │
│    Format: Markdown                  │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ 3. Build internal link map           │
│    Scan existing posts               │
│    Find related topics               │
│    Add contextual links              │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ 4. Post-process & optimize           │
│    Add table of contents             │
│    Optimize heading hierarchy        │
│    Format code blocks                │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ 5. Validate content                  │
│    ✓ Word count >= 2,500             │
│    ✓ Frontmatter complete            │
│    ✓ Headings H2-H6 only             │
│    ✓ Internal links present          │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ 6. Plagiarism check (optional)       │
│    Copyscape API                     │
│    Threshold: 95% unique             │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ 7. Commit to repository              │
│    File: src/content/blog/YYYY-MM... │
│    Update: topic-queue.json status   │
│    Message: "Add blog post: Title"   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ 8. Send notifications                │
│    Email: Success/failure            │
│    Slack: Link to post (optional)    │
└──────────────────────────────────────┘
```

### Health Check Flow

```
┌──────────────┐
│ Trigger      │
│ • GitHub     │
│ • VPS cron   │
│ • Manual     │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────┐
│ Health Check Script                     │
│ ./scripts/simple-health-check.sh        │
└──────┬──────────────────────────────────┘
       │
       ├─→ Check GitHub Actions
       │   • gh run list --limit 20
       │   • Count failures
       │   • ✅ 0 failures = good
       │   • ⚠️  1-2 failures = warning
       │   • ❌ 3+ failures = error
       │
       ├─→ Check Topic Queue
       │   • jq .queue | length
       │   • ✅ >= 15 topics = healthy
       │   • ⚠️  10-14 topics = ok
       │   • ❌ < 10 topics = critical
       │
       ├─→ Check Website
       │   • curl -I theprofitplatform.com.au
       │   • ✅ 200 OK = good
       │   • ❌ Other = error
       │   • Response time < 2s = good
       │
       ├─→ Check VPS (optional)
       │   • ssh avi@vps 'echo ok'
       │   • Check cron service
       │   • Check disk usage
       │   • ✅ < 80% = good
       │   • ⚠️  80-90% = warning
       │   • ❌ > 90% = critical
       │
       └─→ Generate Report
           • Summary: X errors, Y warnings
           • Details: Per-check results
           • Exit code: 0 = success, 1 = failure
           │
           ▼
       ┌─────────────────────────┐
       │ Ping Healthchecks.io    │
       │ • Success: /ping/uuid   │
       │ • Failure: /ping/uuid/fail
       └──────┬──────────────────┘
              │
              ▼
       ┌─────────────────────────┐
       │ Healthchecks.io Decides │
       │ • All good: No alert    │
       │ • Problem: Send email   │
       │ • Missed: Send email    │
       └─────────────────────────┘
```

---

## 🔄 Automation Lifecycle

### New Topic → Published Post → Website

```
Day 1: Topic Auto-Refill (Monthly)
│
├─→ VPS Cron: 1st @ 2:00 AM
│   ├─ npm run topics:generate 30
│   ├─ Claude AI generates 25-30 topics
│   ├─ Balanced across categories
│   └─ Append to topic-queue.json
│
└─→ Result: 25-30 new "pending" topics

Day 7: Blog Post Generation (Mon/Thu)
│
├─→ GitHub Actions: Mon @ 9:00 AM UTC
│   ├─ Pick highest priority "pending" topic
│   ├─ Generate 2,500-3,500 word post
│   ├─ Validate content quality
│   ├─ Commit to src/content/blog/
│   └─ Update topic status → "completed"
│
└─→ Result: New blog post in repository

Day 7: Automatic Deployment
│
├─→ GitHub Actions: On commit (immediately after)
│   ├─ Trigger deploy.yml workflow
│   ├─ Build Astro site
│   ├─ Run Playwright tests
│   ├─ Deploy to Cloudflare Pages
│   └─ Run Lighthouse audit
│
└─→ Result: Blog post live on theprofitplatform.com.au

Day 8: Health Check (Weekly)
│
├─→ GitHub Actions: Next Mon @ 9:00 AM UTC
│   ├─ Check all automations
│   ├─ Verify blog post published
│   ├─ Check topic queue (still healthy?)
│   ├─ Ping Healthchecks.io
│   └─ Send email if issues
│
└─→ Result: Weekly health report email
```

---

## 🛡️ Reliability & Redundancy

### Multiple Monitoring Layers

```
Layer 1: Self-Monitoring
├─ GitHub Actions (weekly health check)
├─ VPS Cron (weekly topic check)
└─ Manual: npm run health

Layer 2: External Monitoring
├─ Healthchecks.io (dead-man switch)
├─ Cloudflare (uptime monitoring)
└─ Google Search Console (index status)

Layer 3: Alerts
├─ Email (via Healthchecks.io)
├─ Slack (optional webhook)
├─ GitHub Issues (on failure)
└─ Dashboard (Healthchecks.io UI)
```

### Failure Recovery

```
Automation Fails
    │
    ├─→ GitHub Actions sends notification
    │   └─ Creates GitHub issue with details
    │
    ├─→ Healthchecks.io sends email
    │   └─ "Check has failed" alert
    │
    └─→ Manual intervention
        ├─ Review GitHub Actions logs
        ├─ Check error details
        ├─ Fix issue
        └─ Re-run workflow (gh run rerun)
```

---

## 📈 Scaling Paths

### Current (13 automations)
```
Capacity: 13 active systems
Frequency: Daily to monthly
Monitoring: Weekly health checks
Maintenance: Zero (automated)
Cost: $0/month
```

### Phase 1: Add CLI Tool (if needed)
```
+ Terminal interface
+ Manual triggers
+ Enhanced logging
Time to build: 1-2 days
Maintenance: Low
```

### Phase 2: Add Web Dashboard (if needed)
```
+ Real-time web UI
+ Historical metrics
+ Custom alerts
Time to build: 3-5 days
Maintenance: Medium
```

### Phase 3: Enterprise Features (if needed)
```
+ AI insights
+ Predictive analytics
+ Mobile app
Time to build: 1-2 weeks
Maintenance: High
```

---

## 🔑 Key Design Principles

1. **Simple Over Complex**
   - 30-second health check > 20-hour dashboard
   - Bash script > Custom infrastructure

2. **Automated Setup**
   - One command: `npm run health:quick-setup`
   - No manual configuration
   - Guided prompts

3. **Zero Maintenance**
   - Works without intervention
   - Self-healing where possible
   - Alert only on real issues

4. **Use Existing Tools**
   - GitHub Actions (already have)
   - Healthchecks.io (free service)
   - Cloudflare (already using)

5. **Data-Driven Decisions**
   - Measure before building
   - Collect 1 month of data
   - Build only if needed

---

**This architecture enables**:
- ✅ 13 automations running 24/7
- ✅ 2-minute setup time
- ✅ Zero ongoing maintenance
- ✅ Complete visibility
- ✅ $0 monthly cost

See [AUTOMATED-SETUP.md](AUTOMATED-SETUP.md) to get started.
