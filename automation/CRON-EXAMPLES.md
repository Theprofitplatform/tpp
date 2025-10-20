# ⏰ Cron Configuration Examples

**Ready-to-use cron schedules for SEO automation**

---

## 📋 Table of Contents

1. [Cron Basics](#cron-basics)
2. [Quick Start Templates](#quick-start-templates)
3. [Production Configurations](#production-configurations)
4. [Custom Schedules](#custom-schedules)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Cron Basics

### Cron Format

```
┌─────── minute (0-59)
│ ┌─────── hour (0-23)
│ │ ┌─────── day of month (1-31)
│ │ │ ┌─────── month (1-12)
│ │ │ │ ┌─────── day of week (0-6, 0=Sunday)
│ │ │ │ │
* * * * * command to execute
```

### Common Patterns

```bash
* * * * *    # Every minute
0 * * * *    # Every hour
0 0 * * *    # Every day at midnight
0 6 * * *    # Every day at 6 AM
0 0 * * 0    # Every Sunday at midnight
0 0 1 * *    # First day of every month at midnight
*/5 * * * *  # Every 5 minutes
0 */6 * * *  # Every 6 hours
```

### Setting Up Cron

```bash
# Edit crontab
crontab -e

# List current crontab
crontab -l

# Remove all cron jobs
crontab -r

# Test cron service
sudo systemctl status cron
```

---

## 🚀 Quick Start Templates

### Template 1: Minimal Daily Automation

**Use case:** Small operation, daily content generation

```bash
# Open crontab
crontab -e

# Add these lines:
# ===========================================
# TPP Automation - Minimal Daily Schedule
# ===========================================

# Set API key (REQUIRED)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Set project path (update this!)
PROJECT_PATH=/home/automation/projects/tpp

# Daily automation at 6 AM
0 6 * * * cd $PROJECT_PATH && npm run automation:scheduled >> $PROJECT_PATH/automation/logs/cron.log 2>&1

# Health check every 6 hours
0 */6 * * * cd $PROJECT_PATH && npm run automation:status:quick >> $PROJECT_PATH/automation/logs/health.log 2>&1
```

**What this does:**
- Runs all scheduled automations at 6 AM daily
- Checks system health every 6 hours
- Logs everything to separate files

---

### Template 2: Standard Production Schedule

**Use case:** Most users, balanced automation + monitoring

```bash
# ===========================================
# TPP Automation - Standard Production
# ===========================================

# Environment variables
ANTHROPIC_API_KEY=sk-ant-your-key-here
PROJECT_PATH=/home/automation/projects/tpp
EMAIL=your@email.com

# Daily content generation at 6 AM
0 6 * * * cd $PROJECT_PATH && npm run automation:scheduled >> $PROJECT_PATH/automation/logs/cron.log 2>&1 || echo "Automation failed - check logs" | mail -s "TPP Alert" $EMAIL

# Weekly backup on Sundays at 2 AM
0 2 * * 0 cd $PROJECT_PATH && npm run automation:backup >> $PROJECT_PATH/automation/logs/backup.log 2>&1

# Health check every 6 hours
0 */6 * * * cd $PROJECT_PATH && npm run automation:status:quick >> $PROJECT_PATH/automation/logs/health.log 2>&1

# Full health report on Mondays at 8 AM
0 8 * * 1 cd $PROJECT_PATH && npm run automation:health >> $PROJECT_PATH/automation/logs/health-report.log 2>&1

# Monthly cleanup on 1st at 3 AM (remove logs older than 30 days)
0 3 1 * * find $PROJECT_PATH/automation/logs -name "*.log" -mtime +30 -delete
```

**What this does:**
- Daily content generation with email alerts on failure
- Weekly automated backups
- Regular health checks throughout the day
- Weekly detailed health reports
- Monthly log cleanup

---

### Template 3: Advanced Enterprise Schedule

**Use case:** High-volume operations, multiple clients, extensive monitoring

```bash
# ===========================================
# TPP Automation - Enterprise Schedule
# ===========================================

# Environment variables
ANTHROPIC_API_KEY=sk-ant-your-key-here
PROJECT_PATH=/home/automation/projects/tpp
EMAIL=ops@yourcompany.com
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Morning automation batch (6 AM weekdays)
0 6 * * 1-5 cd $PROJECT_PATH && npm run automation:suburb-pages >> $PROJECT_PATH/automation/logs/suburb-pages.log 2>&1

# Mid-morning GBP posts (9 AM weekdays)
0 9 * * 1-5 cd $PROJECT_PATH && npm run automation:gbp-posts >> $PROJECT_PATH/automation/logs/gbp.log 2>&1

# Afternoon review requests (2 PM weekdays)
0 14 * * 1-5 cd $PROJECT_PATH && npm run automation:reviews >> $PROJECT_PATH/automation/logs/reviews.log 2>&1

# Weekly rank tracking (Mondays at 7 AM)
0 7 * * 1 cd $PROJECT_PATH && npm run automation:rank-track >> $PROJECT_PATH/automation/logs/rank-track.log 2>&1

# Monthly link outreach (1st of month at 10 AM)
0 10 1 * * cd $PROJECT_PATH && npm run automation:link-outreach >> $PROJECT_PATH/automation/logs/link-outreach.log 2>&1

# Health monitoring every 3 hours
0 */3 * * * cd $PROJECT_PATH && npm run automation:status:quick >> $PROJECT_PATH/automation/logs/health.log 2>&1

# Daily health report (8 AM)
0 8 * * * cd $PROJECT_PATH && npm run automation:health >> $PROJECT_PATH/automation/logs/health-report.log 2>&1

# Daily cost estimation (6 PM)
0 18 * * * cd $PROJECT_PATH && npm run automation:cost-estimate >> $PROJECT_PATH/automation/logs/costs.log 2>&1

# Content quality analysis (8 PM daily)
0 20 * * * cd $PROJECT_PATH && npm run automation:analyze-content >> $PROJECT_PATH/automation/logs/quality.log 2>&1

# Daily backups (2 AM)
0 2 * * * cd $PROJECT_PATH && npm run automation:backup >> $PROJECT_PATH/automation/logs/backup.log 2>&1

# Weekly full system verification (Sundays at 3 AM)
0 3 * * 0 cd $PROJECT_PATH && npm run automation:verify-env >> $PROJECT_PATH/automation/logs/verification.log 2>&1

# Monthly log cleanup (1st at 4 AM)
0 4 1 * * find $PROJECT_PATH/automation/logs -name "*.log" -mtime +30 -delete

# Monthly backup cleanup (keep last 12 backups, 1st at 5 AM)
0 5 1 * * cd $PROJECT_PATH/automation/backups && ls -t *.tar.gz | tail -n +13 | xargs rm -f

# Send daily summary email (9 PM)
0 21 * * * cd $PROJECT_PATH && tail -100 $PROJECT_PATH/automation/logs/cron.log | mail -s "Daily Automation Summary" $EMAIL
```

**What this does:**
- Spreads automations throughout the workday
- Separates each automation into its own log file
- Comprehensive health monitoring
- Daily backups and quality checks
- Automated cleanup and reporting
- Email summaries

---

## 🛠️ Production Configurations

### Configuration 1: Cost-Conscious Schedule

**Minimize API costs while maintaining effectiveness**

```bash
# ===========================================
# TPP Automation - Cost-Conscious
# ===========================================

ANTHROPIC_API_KEY=sk-ant-your-key-here
PROJECT_PATH=/home/automation/projects/tpp

# Bi-weekly suburb pages (1st and 15th at 6 AM)
0 6 1,15 * * cd $PROJECT_PATH && npm run automation:suburb-pages >> $PROJECT_PATH/automation/logs/cron.log 2>&1

# Weekly GBP posts (Mondays at 9 AM)
0 9 * * 1 cd $PROJECT_PATH && npm run automation:gbp-posts >> $PROJECT_PATH/automation/logs/cron.log 2>&1

# Monthly link outreach (1st at 10 AM)
0 10 1 * * cd $PROJECT_PATH && npm run automation:link-outreach >> $PROJECT_PATH/automation/logs/cron.log 2>&1

# Health check once daily (8 AM)
0 8 * * * cd $PROJECT_PATH && npm run automation:status:quick >> $PROJECT_PATH/automation/logs/health.log 2>&1

# Weekly backup (Sundays at 2 AM)
0 2 * * 0 cd $PROJECT_PATH && npm run automation:backup >> $PROJECT_PATH/automation/logs/backup.log 2>&1
```

**Estimated cost: $15-25/month**
**Time saved: 8-10 hours/month**

---

### Configuration 2: Maximum Automation

**Aggressive content generation for rapid growth**

```bash
# ===========================================
# TPP Automation - Maximum Automation
# ===========================================

ANTHROPIC_API_KEY=sk-ant-your-key-here
PROJECT_PATH=/home/automation/projects/tpp

# Suburb pages twice weekly (Monday & Thursday at 6 AM)
0 6 * * 1,4 cd $PROJECT_PATH && npm run automation:suburb-pages >> $PROJECT_PATH/automation/logs/suburb.log 2>&1

# GBP posts 3x per week (Mon/Wed/Fri at 9 AM)
0 9 * * 1,3,5 cd $PROJECT_PATH && npm run automation:gbp-posts >> $PROJECT_PATH/automation/logs/gbp.log 2>&1

# Daily review requests (2 PM weekdays)
0 14 * * 1-5 cd $PROJECT_PATH && npm run automation:reviews >> $PROJECT_PATH/automation/logs/reviews.log 2>&1

# Bi-weekly link outreach (1st and 15th at 10 AM)
0 10 1,15 * * cd $PROJECT_PATH && npm run automation:link-outreach >> $PROJECT_PATH/automation/logs/link.log 2>&1

# Daily rank tracking (7 AM)
0 7 * * * cd $PROJECT_PATH && npm run automation:rank-track >> $PROJECT_PATH/automation/logs/ranks.log 2>&1

# Health checks every 4 hours
0 */4 * * * cd $PROJECT_PATH && npm run automation:status:quick >> $PROJECT_PATH/automation/logs/health.log 2>&1

# Daily quality analysis (8 PM)
0 20 * * * cd $PROJECT_PATH && npm run automation:analyze-content >> $PROJECT_PATH/automation/logs/quality.log 2>&1

# Daily backups (2 AM)
0 2 * * * cd $PROJECT_PATH && npm run automation:backup >> $PROJECT_PATH/automation/logs/backup.log 2>&1
```

**Estimated cost: $60-90/month**
**Time saved: 25-30 hours/month**

---

### Configuration 3: Multi-Client Agency

**Managing multiple client accounts**

```bash
# ===========================================
# TPP Automation - Multi-Client Agency
# ===========================================

ANTHROPIC_API_KEY=sk-ant-your-key-here
PROJECT_PATH=/home/automation/projects/tpp

# Client A - Suburb pages (Mondays 6 AM)
0 6 * * 1 cd $PROJECT_PATH && CLIENT=client-a npm run automation:suburb-pages >> $PROJECT_PATH/automation/logs/client-a.log 2>&1

# Client B - Suburb pages (Tuesdays 6 AM)
0 6 * * 2 cd $PROJECT_PATH && CLIENT=client-b npm run automation:suburb-pages >> $PROJECT_PATH/automation/logs/client-b.log 2>&1

# Client C - Suburb pages (Wednesdays 6 AM)
0 6 * * 3 cd $PROJECT_PATH && CLIENT=client-c npm run automation:suburb-pages >> $PROJECT_PATH/automation/logs/client-c.log 2>&1

# All clients - GBP posts (Fridays 9 AM)
0 9 * * 5 cd $PROJECT_PATH && npm run automation:gbp-posts >> $PROJECT_PATH/automation/logs/gbp-all.log 2>&1

# All clients - Review requests (Daily 2 PM weekdays)
0 14 * * 1-5 cd $PROJECT_PATH && npm run automation:reviews >> $PROJECT_PATH/automation/logs/reviews.log 2>&1

# Weekly rank tracking for all (Mondays 7 AM)
0 7 * * 1 cd $PROJECT_PATH && npm run automation:rank-track >> $PROJECT_PATH/automation/logs/ranks.log 2>&1

# Health monitoring every 6 hours
0 */6 * * * cd $PROJECT_PATH && npm run automation:status:quick >> $PROJECT_PATH/automation/logs/health.log 2>&1

# Daily backup (2 AM)
0 2 * * * cd $PROJECT_PATH && npm run automation:backup >> $PROJECT_PATH/automation/logs/backup.log 2>&1

# Weekly client reports (Sundays 8 AM)
0 8 * * 0 cd $PROJECT_PATH && npm run automation:health >> $PROJECT_PATH/automation/logs/weekly-report.log 2>&1
```

---

## ⚙️ Custom Schedules

### Off-Hours Scheduling

**Run during low-traffic periods to minimize server impact**

```bash
# All automations between midnight and 6 AM
0 1 * * * cd /home/automation/projects/tpp && npm run automation:suburb-pages
0 2 * * * cd /home/automation/projects/tpp && npm run automation:gbp-posts
0 3 * * * cd /home/automation/projects/tpp && npm run automation:reviews
0 4 * * * cd /home/automation/projects/tpp && npm run automation:backup
```

### Business Hours Only

**Run only during business hours (9 AM - 5 PM weekdays)**

```bash
# Suburb pages at 9 AM weekdays
0 9 * * 1-5 cd /home/automation/projects/tpp && npm run automation:suburb-pages

# GBP posts at 11 AM weekdays
0 11 * * 1-5 cd /home/automation/projects/tpp && npm run automation:gbp-posts

# Review requests at 2 PM weekdays
0 14 * * 1-5 cd /home/automation/projects/tpp && npm run automation:reviews

# Health check at 5 PM weekdays
0 17 * * 1-5 cd /home/automation/projects/tpp && npm run automation:health
```

### Seasonal Adjustments

**Different schedules for different seasons**

```bash
# Winter schedule (Nov-Feb): Less frequent
# Add to crontab from November 1 to February 28

# Summer schedule (Mar-Oct): More frequent
# Different crontab for March 1 to October 31

# Example: More aggressive in summer months
0 6 * * 1,3,5 cd /home/automation/projects/tpp && npm run automation:suburb-pages  # Summer
0 6 * * 1 cd /home/automation/projects/tpp && npm run automation:suburb-pages      # Winter
```

---

## ✅ Best Practices

### 1. Always Set Environment Variables

```bash
# At the top of crontab
ANTHROPIC_API_KEY=sk-ant-your-key-here
PROJECT_PATH=/home/automation/projects/tpp
PATH=/usr/local/bin:/usr/bin:/bin
SHELL=/bin/bash
```

### 2. Use Full Paths

```bash
# ✅ GOOD
0 6 * * * cd /home/automation/projects/tpp && npm run automation:suburb-pages

# ❌ BAD
0 6 * * * cd ~/projects/tpp && npm run automation:suburb-pages  # ~ doesn't work in cron
```

### 3. Redirect Output to Logs

```bash
# ✅ GOOD - Capture both stdout and stderr
0 6 * * * cd /home/automation/projects/tpp && npm run automation:suburb-pages >> /home/automation/projects/tpp/automation/logs/cron.log 2>&1

# ❌ BAD - Output lost
0 6 * * * cd /home/automation/projects/tpp && npm run automation:suburb-pages
```

### 4. Add Email Alerts on Failure

```bash
# Send email only if command fails
0 6 * * * cd /home/automation/projects/tpp && npm run automation:scheduled >> /home/automation/projects/tpp/automation/logs/cron.log 2>&1 || echo "Automation failed" | mail -s "TPP Alert" your@email.com
```

### 5. Stagger Automations

```bash
# ✅ GOOD - Spread out over time
0 6 * * * automation-1
0 7 * * * automation-2
0 8 * * * automation-3

# ❌ BAD - All at once, may cause resource issues
0 6 * * * automation-1
0 6 * * * automation-2
0 6 * * * automation-3
```

### 6. Test Before Scheduling

```bash
# Test the command manually first
cd /home/automation/projects/tpp
npm run automation:suburb-pages

# If successful, then add to crontab
crontab -e
```

### 7. Monitor Cron Execution

```bash
# Check if cron ran
grep CRON /var/log/syslog

# Check automation logs
tail -f /home/automation/projects/tpp/automation/logs/cron.log
```

### 8. Use Locking to Prevent Overlaps

```bash
# Prevent multiple instances running simultaneously
0 6 * * * flock -n /tmp/automation.lock -c "cd /home/automation/projects/tpp && npm run automation:scheduled"
```

---

## 🔧 Troubleshooting

### Problem: Cron jobs not running

```bash
# Check if cron service is running
sudo systemctl status cron

# If not running:
sudo systemctl start cron
sudo systemctl enable cron

# Check crontab syntax
crontab -l

# View cron logs
grep CRON /var/log/syslog
```

### Problem: Environment variables not working

```bash
# Ensure variables are set IN crontab
crontab -e

# Add at the top:
ANTHROPIC_API_KEY=sk-ant-your-key-here
PATH=/usr/local/bin:/usr/bin:/bin

# Test by echoing variable to log
0 * * * * echo $ANTHROPIC_API_KEY >> /tmp/test.log
```

### Problem: npm command not found

```bash
# Add node/npm to PATH in crontab
PATH=/usr/local/bin:/usr/bin:/bin:/usr/local/sbin:/usr/sbin

# Or use full path to npm
0 6 * * * cd /home/automation/projects/tpp && /usr/bin/npm run automation:suburb-pages
```

### Problem: Automation runs but produces no output

```bash
# Check logs immediately after scheduled time
cat /home/automation/projects/tpp/automation/logs/cron.log

# Check API key is actually set
0 * * * * echo "API Key: $ANTHROPIC_API_KEY" >> /tmp/debug.log

# Run with verbose output
0 6 * * * cd /home/automation/projects/tpp && NODE_DEBUG=* npm run automation:suburb-pages >> /home/automation/projects/tpp/automation/logs/debug.log 2>&1
```

### Problem: Permission denied

```bash
# Make sure user has permission to project directory
ls -la /home/automation/projects/tpp

# Fix ownership if needed
sudo chown -R automation:automation /home/automation/projects/tpp

# Make scripts executable
chmod +x /home/automation/projects/tpp/automation/scripts/*.sh
```

---

## 📅 Cron Schedule Templates by Use Case

### Blogger / Content Creator

```bash
# Weekly suburb pages (Mondays 6 AM)
0 6 * * 1 cd $PROJECT_PATH && npm run automation:suburb-pages >> $PROJECT_PATH/automation/logs/cron.log 2>&1

# 3x weekly GBP posts (Mon/Wed/Fri 9 AM)
0 9 * * 1,3,5 cd $PROJECT_PATH && npm run automation:gbp-posts >> $PROJECT_PATH/automation/logs/cron.log 2>&1

# Daily health check (8 AM)
0 8 * * * cd $PROJECT_PATH && npm run automation:status:quick >> $PROJECT_PATH/automation/logs/health.log 2>&1

# Weekly backup (Sundays 2 AM)
0 2 * * 0 cd $PROJECT_PATH && npm run automation:backup >> $PROJECT_PATH/automation/logs/backup.log 2>&1
```

### Local Business Owner

```bash
# Bi-weekly suburb pages (1st and 15th)
0 6 1,15 * * cd $PROJECT_PATH && npm run automation:suburb-pages >> $PROJECT_PATH/automation/logs/cron.log 2>&1

# Weekly GBP posts (Mondays 9 AM)
0 9 * * 1 cd $PROJECT_PATH && npm run automation:gbp-posts >> $PROJECT_PATH/automation/logs/cron.log 2>&1

# Daily review requests (2 PM weekdays)
0 14 * * 1-5 cd $PROJECT_PATH && npm run automation:reviews >> $PROJECT_PATH/automation/logs/cron.log 2>&1

# Weekly health check (Mondays 8 AM)
0 8 * * 1 cd $PROJECT_PATH && npm run automation:health >> $PROJECT_PATH/automation/logs/health.log 2>&1
```

### SEO Agency

```bash
# Daily suburb pages (6 AM weekdays)
0 6 * * 1-5 cd $PROJECT_PATH && npm run automation:suburb-pages >> $PROJECT_PATH/automation/logs/suburb.log 2>&1

# Daily GBP posts (9 AM weekdays)
0 9 * * 1-5 cd $PROJECT_PATH && npm run automation:gbp-posts >> $PROJECT_PATH/automation/logs/gbp.log 2>&1

# Daily review requests (2 PM weekdays)
0 14 * * 1-5 cd $PROJECT_PATH && npm run automation:reviews >> $PROJECT_PATH/automation/logs/reviews.log 2>&1

# Weekly rank tracking (Mondays 7 AM)
0 7 * * 1 cd $PROJECT_PATH && npm run automation:rank-track >> $PROJECT_PATH/automation/logs/ranks.log 2>&1

# Bi-weekly link outreach (1st and 15th)
0 10 1,15 * * cd $PROJECT_PATH && npm run automation:link-outreach >> $PROJECT_PATH/automation/logs/link.log 2>&1

# Health checks every 6 hours
0 */6 * * * cd $PROJECT_PATH && npm run automation:status:quick >> $PROJECT_PATH/automation/logs/health.log 2>&1

# Daily backups (2 AM)
0 2 * * * cd $PROJECT_PATH && npm run automation:backup >> $PROJECT_PATH/automation/logs/backup.log 2>&1

# Weekly quality analysis (Sundays 8 PM)
0 20 * * 0 cd $PROJECT_PATH && npm run automation:analyze-content >> $PROJECT_PATH/automation/logs/quality.log 2>&1
```

---

## 🎯 Quick Copy-Paste Configurations

### Minimal (Budget-Conscious)

```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
PROJECT_PATH=/home/automation/projects/tpp
0 6 * * 1 cd $PROJECT_PATH && npm run automation:scheduled >> $PROJECT_PATH/automation/logs/cron.log 2>&1
0 2 * * 0 cd $PROJECT_PATH && npm run automation:backup >> $PROJECT_PATH/automation/logs/backup.log 2>&1
```

### Standard (Recommended)

```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
PROJECT_PATH=/home/automation/projects/tpp
EMAIL=your@email.com
0 6 * * * cd $PROJECT_PATH && npm run automation:scheduled >> $PROJECT_PATH/automation/logs/cron.log 2>&1 || echo "Failed" | mail -s "TPP Alert" $EMAIL
0 */6 * * * cd $PROJECT_PATH && npm run automation:status:quick >> $PROJECT_PATH/automation/logs/health.log 2>&1
0 2 * * 0 cd $PROJECT_PATH && npm run automation:backup >> $PROJECT_PATH/automation/logs/backup.log 2>&1
0 8 * * 1 cd $PROJECT_PATH && npm run automation:health >> $PROJECT_PATH/automation/logs/health-report.log 2>&1
```

### Maximum (High-Volume)

```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
PROJECT_PATH=/home/automation/projects/tpp
EMAIL=your@email.com
0 6 * * 1,4 cd $PROJECT_PATH && npm run automation:suburb-pages >> $PROJECT_PATH/automation/logs/suburb.log 2>&1
0 9 * * 1,3,5 cd $PROJECT_PATH && npm run automation:gbp-posts >> $PROJECT_PATH/automation/logs/gbp.log 2>&1
0 14 * * 1-5 cd $PROJECT_PATH && npm run automation:reviews >> $PROJECT_PATH/automation/logs/reviews.log 2>&1
0 10 1,15 * * cd $PROJECT_PATH && npm run automation:link-outreach >> $PROJECT_PATH/automation/logs/link.log 2>&1
0 7 * * * cd $PROJECT_PATH && npm run automation:rank-track >> $PROJECT_PATH/automation/logs/ranks.log 2>&1
0 */4 * * * cd $PROJECT_PATH && npm run automation:status:quick >> $PROJECT_PATH/automation/logs/health.log 2>&1
0 20 * * * cd $PROJECT_PATH && npm run automation:analyze-content >> $PROJECT_PATH/automation/logs/quality.log 2>&1
0 2 * * * cd $PROJECT_PATH && npm run automation:backup >> $PROJECT_PATH/automation/logs/backup.log 2>&1
```

---

## 📚 Additional Resources

- **Cron Calculator:** https://crontab.guru
- **Deployment Guide:** [`automation/DEPLOYMENT-GUIDE.md`](DEPLOYMENT-GUIDE.md)
- **Troubleshooting:** [`automation/TROUBLESHOOTING-FLOWCHART.md`](TROUBLESHOOTING-FLOWCHART.md)
- **Maintenance:** [`automation/MAINTENANCE-GUIDE.md`](MAINTENANCE-GUIDE.md)

---

## ✅ Setup Checklist

After adding cron jobs:

- [ ] Test commands manually first
- [ ] API key set in crontab
- [ ] Full paths used (not ~)
- [ ] Output redirected to log files
- [ ] Cron service running (`systemctl status cron`)
- [ ] Waited for first execution
- [ ] Checked logs after execution
- [ ] Verified output quality
- [ ] Set up log rotation
- [ ] Documented your schedule

---

**💡 Pro Tip:** Start with the "Standard" configuration and adjust based on your actual needs and API costs after 1-2 weeks of monitoring.

**⏰ Cron Difficulty:** ⭐ Easy (copy-paste ready)
**Setup Time:** 5-10 minutes
**Maintenance:** Review monthly

**Version:** 2.1.0
**Last Updated:** January 19, 2025
