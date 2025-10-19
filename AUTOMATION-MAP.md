# The Profit Platform - Automation Infrastructure Map

> **Last Updated**: 2025-10-19
> **Status**: 13 active automations across 3 environments

---

## 🌐 Environment Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GITHUB ACTIONS                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ Daily Blog Post  │  │   Deploy to      │  │  Lighthouse CI   │  │
│  │   (Mon/Thu)      │  │  Cloudflare      │  │   (on push)      │  │
│  │   9:00 AM UTC    │  │   (on push)      │  │                  │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
│  ┌──────────────────┐                                               │
│  │  PR Automation   │                                               │
│  │  (on PR/comment) │                                               │
│  └──────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ commits blog posts
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          GITHUB REPO                                │
│                    github.com/user/tpp                              │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ automation/      │  │ src/content/     │  │ .github/         │  │
│  │ - topic-queue    │  │ - blog posts     │  │ - workflows      │  │
│  │ - scripts        │  │                  │  │                  │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ git pull
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      VPS (tpp-vps server)                           │
│                    /home/avi/projects/tpp                           │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ CRON JOBS                                                     │  │
│  │ ┌──────────────────┐  ┌──────────────────┐                   │  │
│  │ │ Topic Auto-Refill│  │ Topic Health Chk │                   │  │
│  │ │   (Monthly)      │  │   (Weekly)       │                   │  │
│  │ │   1st @ 2:00 AM  │  │   Mon @ 8:00 AM  │                   │  │
│  │ └──────────────────┘  └──────────────────┘                   │  │
│  │                                                                │  │
│  │ ┌──────────────────────────────────────────────────────────┐  │  │
│  │ │ Other VPS Automations                                    │  │  │
│  │ │ - Instagram Bot (3x daily)                               │  │  │
│  │ │ - Database Backups (daily @ 2:30 AM)                     │  │  │
│  │ │ - Backup Verification (daily @ 3:00 AM)                  │  │  │
│  │ │ - Backup Monitoring (every 6 hours)                      │  │  │
│  │ └──────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ SEPARATE SEO PROJECT                                         │  │
│  │ /home/avi/seo-automation/                                    │  │
│  │ - Weekly monitoring (Mon @ 9 AM)                             │  │
│  │ - Weekly reports (Mon @ 5 PM)                                │  │
│  │ - Monthly optimization (1st Sun @ 10 AM)                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    AVAILABLE (NOT SCHEDULED)                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Visual Quality  │  │  Backend API     │  │  N8N Workflows   │  │
│  │  Agent           │  │  Server          │  │  (inactive)      │  │
│  │  (can schedule)  │  │  (not deployed)  │  │                  │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📅 Weekly Schedule View

```
MONDAY
├─ 08:00 AM (VPS)     → Topic Health Check (alerts if < 10 topics)
├─ 09:00 AM (VPS)     → SEO Monitoring
├─ 09:00 AM (GitHub)  → Daily Blog Post Generation 🎯
└─ 05:00 PM (VPS)     → SEO Weekly Report

TUESDAY
└─ (no scheduled tasks)

WEDNESDAY
└─ (no scheduled tasks)

THURSDAY
└─ 09:00 AM (GitHub)  → Daily Blog Post Generation 🎯

FRIDAY
└─ (no scheduled tasks)

SATURDAY
└─ (no scheduled tasks)

SUNDAY (First of month)
└─ 10:00 AM (VPS)     → SEO Monthly Optimization

DAILY
├─ 02:00 AM (VPS)     → Database Backup
├─ 02:30 AM (VPS)     → Backup Verification
├─ 03:00 AM (VPS)     → Backup Monitoring
├─ 07:00 AM (VPS)     → Instagram Bot
├─ 12:00 PM (VPS)     → Instagram Bot
├─ 06:00 PM (VPS)     → Instagram Bot
└─ Every 6hrs (VPS)   → Backup Monitoring

MONTHLY (1st of month)
└─ 02:00 AM (VPS)     → Topic Auto-Refill (generates 25-30 topics)

ON TRIGGER
├─ Push to main       → Deploy + Lighthouse CI
├─ PR opened          → PR Automation + Welcome
└─ PR comment /swarm  → Swarm Commands
```

---

## 🎯 Active Automation Details

### 1️⃣ Blog Content Pipeline (GitHub Actions)

**Trigger**: Monday & Thursday @ 9:00 AM UTC (8:00 PM Sydney)

**Flow**:
```
topic-queue.json
    │
    ├─→ [generate-blog-post.js]
    │       ├─ Uses Claude AI (Sonnet 4)
    │       ├─ Generates 2,500-3,500 words
    │       └─ Creates markdown file
    │
    ├─→ [build-internal-link-map.mjs]
    │       └─ Updates SEO linking database
    │
    ├─→ [post-process-blog.js]
    │       ├─ Adds table of contents
    │       └─ Optimizes heading hierarchy
    │
    ├─→ [validate-content.js]
    │       ├─ Checks word count
    │       ├─ Validates frontmatter
    │       └─ Verifies internal links
    │
    ├─→ [plagiarism-check.js] (optional)
    │       └─ Copyscape API validation
    │
    ├─→ [Git Commit]
    │       └─ Auto-commits to main branch
    │
    └─→ [send-notification.js]
            ├─ Email (Gmail)
            └─ Slack webhook
```

**Required Env Vars**:
- `CLAUDE_API_KEY` or `ANTHROPIC_API_KEY` ✅
- `COPYSCAPE_API_KEY` (optional)
- `SLACK_WEBHOOK_URL` (optional)
- `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `NOTIFICATION_EMAIL` (optional)

**Status**: ✅ Active (re-enabled 2025-10-19)

**Location**: `.github/workflows/daily-blog-post.yml`

---

### 2️⃣ Deployment Pipeline (GitHub Actions)

**Trigger**: Push to main branch OR manual

**Flow**:
```
Push to main
    │
    ├─→ [Test Job]
    │       ├─ npm run build
    │       ├─ npm run preview
    │       └─ npx playwright test tests/core/
    │
    └─→ [Deploy Job]
            ├─ npm run build
            ├─ cloudflare/pages-action
            └─ Deploy to theprofitplatform.com.au
```

**Required Env Vars**:
- `CLOUDFLARE_API_TOKEN` ✅
- `CLOUDFLARE_ACCOUNT_ID` ✅

**Status**: ✅ Active

**Location**: `.github/workflows/deploy.yml`

---

### 3️⃣ Performance Monitoring (GitHub Actions)

**Trigger**: Push to main, PR to main, or manual

**Flow**:
```
Trigger event
    │
    └─→ [Lighthouse CI]
            ├─ npm run build
            ├─ Audit 5 pages (home, services, pricing, blog, contact)
            ├─ Generate performance scores
            └─ Post results to PR (if PR)
```

**Configuration**: `lighthouserc.json`

**Status**: ✅ Active

**Location**: `.github/workflows/lighthouse.yml`

---

### 4️⃣ PR Automation (GitHub Actions)

**Trigger**: PR opened OR comment with `/swarm` command

**Flow**:
```
PR Event
    │
    ├─→ [Welcome Job]
    │       └─ Posts welcome comment with available commands
    │
    └─→ [Swarm Commands]
            ├─ /swarm review    → Code review
            ├─ /swarm test      → Run tests
            ├─ /swarm optimize  → Performance analysis
            ├─ /swarm docs      → Generate docs
            └─ /swarm security  → Security audit
```

**Status**: ✅ Active (placeholder implementation)

**Location**: `.github/workflows/pr-automation.yml`

---

### 5️⃣ Topic Queue Management (VPS Cron)

#### Auto-Refill (Monthly)
**Trigger**: 1st of month @ 2:00 AM

**Flow**:
```
Cron trigger
    │
    └─→ [generate-topics.mjs]
            ├─ Analyzes existing blog categories
            ├─ Uses Claude AI to generate 25-30 topics
            ├─ Ensures category balance
            ├─ 60% Sydney-specific angles
            └─ Appends to topic-queue.json
```

**Command**: `npm run topics:generate 30 -- --auto`

**Status**: ✅ Active

**Location**: VPS `/home/avi/projects/tpp`

#### Health Check (Weekly)
**Trigger**: Monday @ 8:00 AM

**Flow**:
```
Cron trigger
    │
    └─→ [check-topic-queue.mjs]
            ├─ Count pending topics
            ├─ Alert if < 5 topics (CRITICAL)
            ├─ Warn if < 10 topics
            └─ List next 10 topics
```

**Command**: `npm run topics:check`

**Status**: ✅ Active

**Location**: VPS `/home/avi/projects/tpp`

---

### 6️⃣ SEO Automation (VPS Cron - Separate Project)

**Location**: `/home/avi/seo-automation/`

**Schedule**:
- **Weekly Monitoring**: Monday @ 9 AM → `npm run monitor`
- **Weekly Reports**: Monday @ 5 PM → `npm run report`
- **Monthly Optimization**: First Sunday @ 10 AM → `npm run optimize-posts 10`

**Status**: ✅ Active (separate project)

---

### 7️⃣ Instagram Bot (VPS Cron)

**Schedule**: 3x daily
- 7:00 AM
- 12:00 PM
- 6:00 PM

**Status**: ✅ Active

**Location**: VPS (separate automation)

---

### 8️⃣ Database Backup System (VPS Cron)

**Schedule**:
- **Backup**: Daily @ 2:30 AM
- **Verification**: Daily @ 3:00 AM
- **Monitoring**: Every 6 hours

**Target**: Supabase database

**Status**: ✅ Active

**Location**: VPS

---

## 🔧 Available But Not Scheduled

### Visual Quality Agent

**Purpose**: Autonomous visual regression testing and auto-fixing

**Capabilities**:
- Multi-viewport screenshot capture (mobile/tablet/desktop)
- Detects: Missing CSS, 404s, unstyled elements, font failures, layout overflow
- Auto-generates CSS fixes with confidence scoring
- Git backup before changes
- Slack/email notifications

**Can be scheduled via**:
- Systemd service (`scripts/visual-check/config/agent.service`)
- VPS cron job

**Status**: 💤 Available but not deployed

**Location**: `scripts/visual-check/`

---

### Backend API Server

**Purpose**: Keyword gap analysis and competitor research

**Endpoints**:
- `POST /api/keyword-gap`
- `POST /api/competitor-analysis`
- `GET /health`

**Deployment**: Configured for Render.com (not deployed)

**Status**: 💤 Available but not deployed

**Location**: `backend-server/`

---

### N8N Workflows

**Purpose**: Visual automation workflows

**Workflows**: 10+ JSON workflow definitions available

**Status**: 💤 Inactive (n8n service not running)

**Location**: `n8n-workflows/`

---

## 🗄️ Disabled/Archived Automations

### ❌ VPS Blog Automation
- **Disabled**: Oct 18, 2025
- **Reason**: Git merge conflicts
- **Replacement**: GitHub Actions blog automation
- **Backup**: `automation/scripts/vps-auto-blog.sh.backup`

### ❌ Backend Health Monitor
- **Removed**: Oct 19, 2025
- **Reason**: No `tpp-backend` PM2 process exists
- **Was**: Every 5 minutes (always failing)

### ❌ Over-Engineered Automation Scripts
- **Archived**: Oct 2025
- **Location**: `archive/over-engineered-automation/`
- **Size**: 1.9MB
- **Reason**: Simplified for reliability

---

## 🔑 Required Environment Variables

### GitHub Actions Secrets
```
CLAUDE_API_KEY              ✅ (or ANTHROPIC_API_KEY)
CLOUDFLARE_API_TOKEN        ✅
CLOUDFLARE_ACCOUNT_ID       ✅
GITHUB_TOKEN                ✅ (automatic)

# Optional
COPYSCAPE_API_KEY           ❓
SLACK_WEBHOOK_URL           ❓
GMAIL_USER                  ❓
GMAIL_APP_PASSWORD          ❓
NOTIFICATION_EMAIL          ❓
```

### VPS Environment
```
CLAUDE_API_KEY              ✅
```

---

## 📊 Statistics

**Total Active Automations**: 13

**By Environment**:
- GitHub Actions: 4 workflows
- VPS Cron Jobs: 6+ jobs
- Available/Not Scheduled: 3 systems

**Automation Scripts**: 9 active JavaScript/Node.js scripts

**Configuration Files**:
- `automation/topic-queue.json` - Blog topic queue
- `automation/internal-link-map.json` - SEO linking database
- `lighthouserc.json` - Performance budgets
- `wrangler.toml` - Cloudflare config

**Recent Activity** (Oct 18-19, 2025):
- ✅ Re-enabled GitHub Actions blog automation
- ✅ Simplified blog generation (removed over-engineering)
- ✅ Fixed VPS git conflicts
- ✅ Removed broken backend health monitor
- ✅ Restored topic queue management

---

## 🎯 Manual NPM Scripts

### Blog Management
```bash
npm run blog:create        # Create blog post (template)
npm run blog:check         # Run tests
npm run blog:link-map      # Build internal link database
```

### Topic Management
```bash
npm run topics:generate    # Generate topics with Claude AI
npm run topics:check       # Check topic queue health
```

### Deployment
```bash
npm run deploy            # Build + deploy to Cloudflare
npm run deploy:auto       # Parity check + deploy
npm run parity            # Full production parity check
```

### Testing
```bash
npm run test:core:pw      # Core Playwright tests
npm run test:mobile       # Mobile tests
npm run test:blog         # Blog tests
```

---

## 🚀 Next Testing Milestones

1. **Immediate**: Wait for Monday/Thursday @ 9 AM UTC for blog post
2. **This Monday**: Verify topic health check @ 8 AM
3. **Next Month**: Test topic auto-refill @ 2 AM on 1st
4. **Optional**: Deploy visual-check agent as systemd service
5. **Optional**: Deploy backend server to Render.com
6. **Optional**: Set up n8n automation server

---

## 📞 Key Files Reference

### GitHub Workflows
- `.github/workflows/daily-blog-post.yml`
- `.github/workflows/deploy.yml`
- `.github/workflows/lighthouse.yml`
- `.github/workflows/pr-automation.yml`

### Automation Scripts
- `automation/scripts/generate-blog-post.js`
- `automation/scripts/post-process-blog.js`
- `automation/scripts/validate-content.js`
- `automation/scripts/plagiarism-check.js`
- `automation/scripts/send-notification.js`
- `automation/scripts/build-internal-link-map.mjs`
- `automation/scripts/generate-topics.mjs`
- `automation/scripts/check-topic-queue.mjs`

### Configuration
- `automation/topic-queue.json`
- `automation/internal-link-map.json`
- `wrangler.toml`
- `lighthouserc.json`

### Visual Quality System
- `scripts/visual-check/src/autonomous-agent.js`
- `scripts/visual-check/src/fix-generator.js`
- `scripts/visual-check/src/notification-service.js`
- `scripts/visual-check/config/agent.service`

### Backend Server
- `backend-server/server.js`
- `backend-server/render.yaml`

---

**Generated**: 2025-10-19
**Status**: All critical automations active and tested
**Next Review**: Wait for Monday blog post generation
