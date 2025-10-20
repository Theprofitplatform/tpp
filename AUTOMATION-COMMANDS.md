# 🎮 Complete Automation Commands Reference

**Quick reference for all automation commands**

---

## 🚀 Setup & Getting Started

### Interactive Setup Wizard
```bash
npm run automation:wizard
```
**What it does:** Interactive setup wizard - guides you through configuration
**Time:** 5-10 minutes
**Use when:** First time setup, or reconfiguring

### System Test
```bash
npm run automation:test
```
**What it does:** Runs 10 automated tests to verify system health
**Time:** < 10 seconds
**Use when:** Before first use, after making changes, troubleshooting

### Setup Script (Bash)
```bash
npm run automation:setup
```
**What it does:** Runs bash setup script for directory creation
**Time:** < 5 seconds
**Use when:** Initial setup, fixing missing directories

---

## 📝 Content Generation

### Suburb Landing Pages
```bash
npm run automation:suburb-pages
```
**What it does:** Generates 10 unique suburb landing pages with Claude AI
**Output:** `src/content/locations/*.md`
**Time:** ~45 seconds
**Cost:** ~$0.50
**Use when:** Monthly (1st of month), when expanding to new areas

### Google Business Profile Posts
```bash
npm run automation:gbp-posts
```
**What it does:** Creates 12 GBP posts (3/week for 4 weeks)
**Output:** `automation/generated/gbp-posts/` (JSON, CSV, Markdown)
**Time:** ~30 seconds
**Cost:** ~$0.30
**Use when:** Weekly (Mondays), when scheduling social content

### Review Request Emails
```bash
npm run automation:reviews
```
**What it does:** Generates personalized review request emails for completed projects
**Output:** `automation/generated/review-emails/`
**Requires:** `automation/data/clients.json` configured
**Time:** ~10 seconds
**Cost:** FREE (or minimal if using email API)
**Use when:** Daily (M-F), after project completion

### Link Building Outreach
```bash
npm run automation:link-outreach
```
**What it does:** Creates personalized link building outreach emails
**Output:** `automation/generated/link-outreach/`
**Time:** ~20 seconds
**Cost:** ~$0.20
**Use when:** Monthly (1st of month), when building backlinks

---

## 📊 Tracking & Reporting

### Keyword Rank Tracker
```bash
npm run automation:rank-track
```
**What it does:** Tracks keyword rankings via Google Search Console API
**Output:** `automation/reports/rank-report-*.html` and `.csv`
**Requires:** Google Search Console API setup
**Time:** ~30 seconds
**Cost:** FREE
**Use when:** Weekly (Mondays), monitoring SEO performance

### Health Dashboard
```bash
npm run automation:health
```
**What it does:** Generates visual HTML health dashboard with system metrics
**Output:** `automation/reports/health-dashboard.html` and `.json`
**Time:** < 10 seconds
**Cost:** FREE
**Use when:** Weekly, after automation runs, troubleshooting

### System Monitor
```bash
npm run automation:monitor
```
**What it does:** Runs 6 health checks on system resources and automation status
**Output:** Terminal output + logs
**Time:** < 5 seconds
**Cost:** FREE
**Use when:** Every 6 hours (cron), before running automations, troubleshooting

---

## 🎛️ Orchestration & Management

### Scheduled Automations
```bash
npm run automation:scheduled
```
**What it does:** Master orchestrator - runs all automations scheduled for today
**Schedule:**
  - Daily (M-F): Review requests
  - Weekly (Mon): GBP posts, rank tracking
  - Monthly (1st): Suburb pages, link outreach
**Time:** Varies based on what's scheduled
**Use when:** Daily via cron, or manual testing

### Run Specific Automation
```bash
npm run automation:run <script-name>
```
**Examples:**
```bash
npm run automation:run generate-suburb-pages
npm run automation:run gbp-auto-poster
npm run automation:run review-automation
```
**What it does:** Runs a specific automation script manually
**Use when:** Testing, running out-of-schedule

### List All Automations
```bash
npm run automation:list
```
**What it does:** Shows all available automations with their schedules
**Output:** Terminal list with paths and schedules
**Use when:** Discovering features, checking schedules

### Show Automation Status
```bash
npm run automation:status
```
**What it does:** Displays recent automation run history
**Output:** Last 7 days of automation runs with success/failure status
**Use when:** Checking what ran, troubleshooting failures

### Get Help
```bash
npm run automation:help
```
**What it does:** Shows help message with all available commands
**Use when:** Learning commands, quick reference

---

## 📚 Blog & Content Support

### Generate Blog Topics
```bash
npm run topics:generate
```
**What it does:** Generates queue of blog post topics
**Output:** `automation/topic-queue.json`
**Use when:** Topic queue < 10, planning content calendar

### Check Topic Queue
```bash
npm run topics:check
```
**What it does:** Shows status of blog topic queue
**Output:** Count of pending topics + next topics list
**Use when:** Weekly content planning, before blog generation

### Build Internal Link Map
```bash
npm run blog:link-map
```
**What it does:** Creates map of all blog posts for internal linking
**Output:** `automation/internal-link-map.json`
**Use when:** After publishing new blog posts, monthly

---

## 🔧 Maintenance & Utilities

### Check Images
```bash
npm run image:check <file1> <file2> ...
npm run image:check-all
```
**What it does:** Validates image dimensions and file sizes
**Use when:** Before reading images, preventing API errors

### Health Check
```bash
npm run health
npm run health:check
```
**What it does:** Simple health check script
**Use when:** Quick system verification

---

## 📦 Combination Workflows

### Complete Monthly Setup
```bash
# 1st of the month workflow
npm run automation:suburb-pages    # Generate suburb pages
npm run automation:link-outreach   # Generate outreach
npm run automation:health          # Check system health
```

### Weekly Monday Routine
```bash
# Monday morning workflow
npm run automation:gbp-posts       # Generate GBP posts for week
npm run automation:rank-track      # Check keyword rankings
npm run automation:health          # Generate dashboard
```

### Daily Morning Check
```bash
# Quick daily routine (5 min)
npm run automation:monitor         # Health check
npm run automation:reviews         # Check review requests
cat automation/logs/alerts.log | tail -5  # Check alerts
```

### First-Time Setup
```bash
# Complete setup from scratch
npm install                        # Install dependencies
npm run automation:wizard          # Interactive setup
npm run automation:test            # Verify system
npm run automation:suburb-pages    # Test generation
npm run automation:health          # Check results
```

---

## 🕐 Recommended Cron Schedule

Add these to your crontab (`crontab -e`):

```bash
# Daily automation check (6 AM)
0 6 * * * cd /path/to/tpp && npm run automation:scheduled >> automation/logs/cron.log 2>&1

# Health monitoring every 6 hours
0 */6 * * * cd /path/to/tpp && npm run automation:monitor >> automation/logs/cron-monitor.log 2>&1

# Weekly dashboard (Mondays at 9 AM)
0 9 * * 1 cd /path/to/tpp && npm run automation:health >> automation/logs/cron.log 2>&1
```

---

## 💡 Pro Tips

### Command Chaining
```bash
# Run multiple commands in sequence
npm run automation:monitor && npm run automation:suburb-pages && npm run automation:health
```

### Check Last Run
```bash
# See what automated recently
npm run automation:status
```

### View Logs
```bash
# Health check log
cat automation/logs/health-check.log | tail -50

# Alerts
cat automation/logs/alerts.log | tail -20

# Cron output
cat automation/logs/cron.log | tail -100
```

### Quick Validation
```bash
# Before deployment or major changes
npm run automation:test && npm run automation:monitor
```

---

## 🆘 Troubleshooting Commands

### System Not Working?
```bash
# 1. Run tests
npm run automation:test

# 2. Check health
npm run automation:monitor

# 3. View logs
cat automation/logs/*.log

# 4. Re-run setup
npm run automation:wizard
```

### Low Health Score?
```bash
# Generate dashboard to see issues
npm run automation:health

# Open HTML report
open automation/reports/health-dashboard.html
```

### Automation Failed?
```bash
# Check status
npm run automation:status

# View error logs
ls -lt automation/logs/ | head

# Test specific automation
npm run automation:run <script-name>
```

---

## 📊 Command Usage Statistics

| Frequency | Commands |
|-----------|----------|
| **Daily** | `monitor`, `reviews`, `status` |
| **Weekly** | `gbp-posts`, `rank-track`, `health` |
| **Monthly** | `suburb-pages`, `link-outreach` |
| **As Needed** | `test`, `wizard`, `list`, `help` |
| **One-Time** | `setup`, `wizard` (initial only) |

---

## 🎯 Quick Start Sequence

**For absolute beginners, run these commands in order:**

```bash
# 1. Setup (one time)
npm run automation:wizard

# 2. Verify (before first use)
npm run automation:test

# 3. Generate sample content (test)
npm run automation:gbp-posts

# 4. Check results
npm run automation:health

# 5. View help anytime
npm run automation:help
```

**That's it! You're now using the automation system.**

---

## 📚 More Help

- **Full Tutorial**: `AUTOMATION-QUICK-START.md`
- **Workflows**: `automation/WORKFLOW-GUIDE.md`
- **Monitoring**: `automation/MONITORING-GUIDE.md`
- **Master Index**: `automation/INDEX.md`

---

**🎮 Complete command reference. 15 automation commands at your fingertips.**
