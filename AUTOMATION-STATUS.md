# TPP Automation Status Report

Last Updated: 2025-10-19

## Executive Summary

This document provides a comprehensive overview of all automations for The Profit Platform project, including active, disabled, and fixed automations.

## Active Automations

### GitHub Actions (`.github/workflows/`)

#### 1. Deploy to Cloudflare Pages (`deploy.yml`)
- **Status**: ✅ Active
- **Trigger**: Push to main, manual dispatch
- **Actions**:
  - Runs Playwright tests
  - Builds website
  - Deploys to Cloudflare Pages
- **Dependencies**: Node 20, Playwright, Wrangler

#### 2. Lighthouse CI (`lighthouse.yml`)
- **Status**: ✅ Active
- **Trigger**: Push to main, PRs, manual dispatch
- **Actions**: Performance audits on 5 key pages
- **Notes**: Results posted as PR comments

#### 3. PR Automation (`pr-automation.yml`)
- **Status**: ✅ Active
- **Trigger**: PR opened, issue comments
- **Actions**:
  - Welcomes new PRs
  - Responds to `/swarm` commands (review, test, optimize, docs, security)

#### 4. Daily Blog Post Generator (`daily-blog-post.yml`)
- **Status**: ✅ ACTIVE (Re-enabled 2025-10-19)
- **Schedule**: Monday & Thursday at 9:00 AM UTC (8:00 PM Sydney)
- **Manual Trigger**: Available via workflow_dispatch
- **Actions**:
  - Generates blog posts using Claude AI
  - Auto-optimizes SEO (TOC, headings, etc.)
  - Validates content quality
  - Commits to GitHub
  - Sends email/Slack notifications
- **Dependencies**: All scripts restored (simplified versions)

### VPS Cron Jobs (tpp-vps)

#### Topic Queue Management
1. **Topic Auto-Refill** (Monthly)
   - **Status**: ✅ Active
   - **Schedule**: 1st of each month at 2:00 AM
   - **Command**: `npm run topics:generate 30 -- --auto`
   - **Location**: `/home/avi/projects/tpp`
   - **Script**: `automation/scripts/generate-topics.mjs` ✅ Restored

2. **Topic Health Check** (Weekly)
   - **Status**: ✅ Active
   - **Schedule**: Monday at 8:00 AM
   - **Command**: `npm run topics:check`
   - **Location**: `/home/avi/projects/tpp`
   - **Script**: `automation/scripts/check-topic-queue.mjs` ✅ Restored
   - **Alert Thresholds**:
     - Critical: < 5 topics
     - Warning: < 10 topics

#### SEO Automation (`/home/avi/seo-automation/`)
- **Weekly Monitoring**: Monday 9 AM - `npm run monitor`
- **Weekly Reports**: Monday 5 PM - `npm run report`
- **Monthly Optimization**: First Sunday 10 AM - `npm run optimize-posts 10`

#### Other Active Cron Jobs
- **Instagram Bot**: 3x daily (7 AM, 12 PM, 6 PM)
- **Database Backups** (Supabase): Daily at 2:30 AM
- **Backup Verification**: Daily at 3:00 AM
- **Backup Monitoring**: Every 6 hours

## Disabled/Removed Automations

### 1. VPS Blog Automation
- **Status**: ⏸️ DISABLED (Oct 18, 2025)
- **Reason**: Git merge conflict with `.automation/config/workflows.yaml`
- **Backup**: `automation/scripts/vps-auto-blog.sh.backup`
- **Decision Needed**: Re-enable, delete, or replace with GitHub Actions?

### 2. Backend Health Monitor
- **Status**: ❌ REMOVED (Oct 19, 2025)
- **Reason**: No `tpp-backend` PM2 process exists
- **Was**: Running every 5 minutes, always failing
- **Script**: `/home/avi/projects/tpp-website/backend/monitor-backend.sh`
- **Decision**: Monitor removed from crontab to stop failure logs

### 3. VPS .automation Directory
- **Status**: ⏸️ BACKED UP (Oct 19, 2025)
- **Location**: `/home/avi/projects/tpp/.automation.backup-20251019`
- **Reason**: Caused git merge conflicts (not tracked in repository)
- **Contents**: Centralized workflow configs, monitoring scripts
- **Decision**: Added to `.gitignore` to prevent future conflicts

## Blog Automation Scripts (RESTORED)

### Simplified Blog Post Generation Pipeline
All blog automation scripts have been restored as simplified versions (2025-10-19):

**Location**: `automation/scripts/`

1. **`generate-blog-post.js`** (7.1 KB) - Main blog generation using Claude AI
   - Reads from topic queue
   - Generates 2,500-3,500 word posts
   - Assigns authors by expertise
   - Creates markdown with proper frontmatter
   - Marks topics as completed

2. **`post-process-blog.js`** (3.6 KB) - Basic SEO optimizations
   - Adds table of contents
   - Fixes heading hierarchy
   - Suggests FAQ schema

3. **`validate-content.js`** (4.6 KB) - Content quality checks
   - Validates frontmatter
   - Checks word count, headings, links
   - Reports warnings and errors

4. **`plagiarism-check.js`** (744 B) - Placeholder for Copyscape
   - Currently skipped (no API key)
   - Can be enabled with COPYSCAPE_API_KEY

5. **`send-notification.js`** (5.3 KB) - Email/Slack notifications
   - Sends success/failure notifications
   - Supports Gmail and Slack webhooks

6. **`build-internal-link-map.mjs`** (3.1 KB) - Internal linking database
   - Creates map of all blog posts
   - Used by npm run blog:link-map

**Status**: ✅ Active and deployed to both local and VPS

**Note**: These are simplified versions without the over-engineered features (charts, statistics enrichment, etc.) from the archived scripts. They focus on core functionality and reliability.

## Recent Fixes (2025-10-19)

### ✅ Phase 1: Critical Fixes
1. **Removed broken backend monitor** from VPS crontab
   - Monitor was running every 5 min, always failing (no PM2 process)
2. **Resolved VPS git conflicts**
   - Backed up `.automation/` → `.automation.backup-20251019`
   - Added `.automation/` to `.gitignore`
3. **Restored topic queue scripts** from archive:
   - `automation/scripts/generate-topics.mjs`
   - `automation/scripts/check-topic-queue.mjs`

### ✅ Phase 2: Blog Automation Restoration
1. **Created simplified blog automation scripts** (replaced over-engineered versions)
   - `generate-blog-post.js` (7.1 KB) - Core blog generation with Claude
   - `validate-content.js` (4.6 KB) - Quality checks
   - `post-process-blog.js` (3.6 KB) - SEO optimizations
   - `plagiarism-check.js` (744 B) - Copyscape placeholder
   - `send-notification.js` (5.3 KB) - Email/Slack alerts
   - `build-internal-link-map.mjs` (3.1 KB) - Internal linking map

2. **Added missing npm script**
   - `blog:link-map` added to package.json

3. **Re-enabled GitHub Actions workflow**
   - Schedule restored: Monday & Thursday 9 AM UTC
   - All dependencies now available

4. **Deployed scripts to VPS**
   - All automation scripts copied to `/home/avi/projects/tpp/automation/scripts/`

### 📝 Documentation Updates
- Created `AUTOMATION-STATUS.md` (this file)
- Updated `.github/workflows/daily-blog-post.yml` with status changes
- Updated package.json with new npm scripts

## PM2 Processes on VPS

Currently running PM2 processes:
```
sms-crm-api       - SMS CRM API service
sms-crm-worker    - SMS CRM background worker
```

**Note**: No TPP-related processes are running under PM2.

## Decisions Completed

### ✅ Blog Automation Strategy (RESOLVED)
- **Decision**: Chose GitHub Actions with simplified scripts
- **Rationale**: More reliable, easier to debug, better CI/CD integration
- **Status**: Implemented and active
- **Next Test**: Monday/Thursday at 9 AM UTC

2. **Backend Monitoring**
   - Should we deploy a TPP backend service?
   - If yes, configure PM2 and re-enable monitoring
   - If no, remove monitoring script entirely

### Medium Priority
3. **Archived Automation Scripts**
   - Review archived scripts (1.9M in `/archive/over-engineered-automation/`)
   - Identify which are still useful
   - Update for current codebase structure

4. **n8n Automation**
   - Multiple n8n setup scripts exist but service is not running
   - Decide if n8n automation is still desired
   - If yes, set up and configure; if no, archive completely

## Next Steps

### Immediate (This Week)
- [x] Fix broken backend monitor ✅
- [x] Resolve VPS git conflicts ✅
- [x] Restore blog automation scripts ✅
- [x] Re-enable GitHub Actions blog workflow ✅
- [ ] **Test blog workflow** - Wait for next scheduled run (Mon/Thu 9 AM UTC) or trigger manually
- [ ] Monitor first automated blog post generation

### Short-term (Next 2 Weeks)
- [ ] Configure optional services (Copyscape, Slack notifications)
- [ ] Set up monitoring/alerting for workflow failures
- [ ] Review and optimize first few automated posts
- [ ] Test topic queue generation on 1st of next month

### Long-term (Next Month)
- [ ] Add advanced features if needed (internal linking, FAQ schemas)
- [ ] Clean up archive directory (remove truly unused scripts)
- [ ] Optimize Claude prompts based on generated content quality
- [ ] Consider adding image generation/selection

## Files Changed in This Fix

### Local Repository
- `.github/workflows/daily-blog-post.yml` - Disabled schedule
- `.gitignore` - Added `.automation/` directory
- `automation/scripts/generate-topics.mjs` - Restored from archive
- `automation/scripts/check-topic-queue.mjs` - Restored from archive
- `AUTOMATION-STATUS.md` - Created (this file)

### VPS (`tpp-vps`)
- Removed backend monitor from crontab
- Backed up `.automation/` → `.automation.backup-20251019/`
- Restored topic queue scripts to `automation/scripts/`

## Support & Troubleshooting

### Check Automation Health
```bash
# Local
npm run topics:check

# VPS
ssh tpp-vps "cd /home/avi/projects/tpp && npm run topics:check"
```

### View Cron Jobs
```bash
ssh tpp-vps "crontab -l"
```

### Check PM2 Processes
```bash
ssh tpp-vps "pm2 list"
```

### View Recent Logs
```bash
# Topic generation logs
ssh tpp-vps "tail -50 /home/avi/projects/tpp/automation/logs/topic-generation.log"

# Topic check logs
ssh tpp-vps "tail -50 /home/avi/projects/tpp/automation/logs/topic-check.log"
```

## Contact

For questions about this automation system, see:
- GitHub Actions: `.github/workflows/` directory
- VPS Setup: Contact server admin
- Cloudflare Pages: `wrangler.toml` configuration

---

**Note**: This is a living document. Update as automations change.
