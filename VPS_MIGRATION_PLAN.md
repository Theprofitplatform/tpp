# VPS Migration Plan: Automated Blog Generation with Claude Code

**Version:** 1.0
**Created:** 2025-10-06
**Status:** Ready for Implementation

---

## 📋 Executive Summary

This plan outlines the complete migration of The Profit Platform's blog automation system from local/manual execution to a fully automated VPS-based system using cron jobs and Claude Code CLI.

**Key Objectives:**
- ✅ Automate blog post generation 24/7
- ✅ Leverage Claude Code for AI-powered content creation
- ✅ Deploy to VPS with scheduled cron jobs
- ✅ Auto-commit and auto-deploy to production
- ✅ Monitor performance and send notifications

---

## 🏗️ Architecture Overview

### Current State
```
Local Machine (Windows WSL)
├── Blog automation scripts (21+ scripts)
├── Claude API integration
├── Manual npm run blog:generate
├── Manual git commit/push
└── Cloudflare Pages auto-deploys from git
```

### Target State
```
VPS (Ubuntu 22.04 LTS)
├── Claude Code CLI installed
├── Cron jobs (daily/weekly schedules)
├── Git repository cloned
├── Automated workflow:
│   ├── 1. Claude Code generates blog post
│   ├── 2. Post-processing (images, links, validation)
│   ├── 3. Git commit & push
│   ├── 4. Cloudflare Pages auto-deploys
│   ├── 5. Analytics tracking
│   └── 6. Notifications (Discord, Email)
└── Monitoring & logging
```

---

## 📦 System Requirements

### VPS Specifications (Minimum)
- **OS:** Ubuntu 22.04 LTS or newer
- **CPU:** 2 vCPUs
- **RAM:** 4GB
- **Storage:** 20GB SSD
- **Network:** Stable internet with public IP
- **Providers:** DigitalOcean, Linode, Vultr, or AWS Lightsail

### Software Dependencies
```bash
# Core
- Node.js 20.x LTS
- npm 10.x
- Git 2.x
- Claude Code CLI (latest)

# System utilities
- cron
- curl
- unzip
- build-essential
```

---

## 🔧 Installation & Setup Steps

### Phase 1: VPS Provisioning (Day 1)

#### 1.1 Create VPS Instance
```bash
# Provider: DigitalOcean/Linode/Vultr
# Size: $12-20/month tier (2GB-4GB RAM)
# Region: Closest to Sydney (for latency)
# OS: Ubuntu 22.04 LTS
```

#### 1.2 Initial Server Hardening
```bash
# SSH into VPS
ssh root@YOUR_VPS_IP

# Create non-root user
adduser automation
usermod -aG sudo automation

# Setup SSH key authentication (from local machine)
ssh-copy-id automation@YOUR_VPS_IP

# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart ssh

# Setup firewall
sudo ufw allow OpenSSH
sudo ufw enable
```

#### 1.3 Install System Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify versions
node --version  # Should be v20.x
npm --version   # Should be v10.x

# Install Git
sudo apt install -y git

# Install build tools
sudo apt install -y build-essential curl unzip
```

### Phase 2: Claude Code Setup (Day 1-2)

#### 2.1 Install Claude Code CLI
```bash
# Login as automation user
su - automation

# Install Claude Code CLI
npm install -g @anthropic-ai/claude-code

# Verify installation
claude --version

# Initialize Claude Code authentication
claude auth login
# Follow prompts to authenticate with your Anthropic account
```

#### 2.2 Configure Claude Code
```bash
# Create global Claude config
mkdir -p ~/.config/claude
nano ~/.config/claude/config.json
```

```json
{
  "apiKey": "${ANTHROPIC_API_KEY}",
  "model": "claude-sonnet-4",
  "maxTokens": 8000,
  "temperature": 0.7,
  "autoApprove": true,
  "toolUsePermissions": {
    "read": ["allow_all"],
    "write": ["allow_all"],
    "bash": ["allow_all"]
  }
}
```

### Phase 3: Repository Setup (Day 2)

#### 3.1 Clone Repository
```bash
# Navigate to home directory
cd ~

# Create projects directory
mkdir -p ~/projects
cd ~/projects

# Clone repository (use SSH for automated commits)
git clone git@github.com:YOUR_USERNAME/tpp.git
cd tpp

# Setup git credentials
git config user.name "TPP Automation Bot"
git config user.email "automation@theprofitplatform.com.au"

# Setup SSH key for GitHub
ssh-keygen -t ed25519 -C "automation@theprofitplatform.com.au"
# Add public key to GitHub: Settings > SSH Keys
cat ~/.ssh/id_ed25519.pub
```

#### 3.2 Install Project Dependencies
```bash
cd ~/projects/tpp
npm install

# Verify build works
npm run build
```

#### 3.3 Setup Environment Variables
```bash
# Create .env.local file
nano .env.local
```

```bash
# Claude API
ANTHROPIC_API_KEY=your_anthropic_api_key_here
CLAUDE_API_KEY=your_anthropic_api_key_here

# Google Analytics & Search Console
GOOGLE_APPLICATION_CREDENTIALS=/home/automation/projects/tpp/credentials/google-service-account.json
GA4_PROPERTY_ID=your_ga4_property_id

# Notifications
DISCORD_WEBHOOK_URL=your_discord_webhook_url
GMAIL_USER=your_gmail_address
GMAIL_APP_PASSWORD=your_gmail_app_password

# Optional
UNSPLASH_ACCESS_KEY=your_unsplash_key
```

```bash
# Secure .env.local
chmod 600 .env.local
```

#### 3.4 Upload Credentials
```bash
# Create credentials directory
mkdir -p ~/projects/tpp/credentials

# Upload Google service account JSON
# From local machine:
scp /path/to/google-service-account.json automation@VPS_IP:~/projects/tpp/credentials/

# Secure credentials
chmod 600 ~/projects/tpp/credentials/*.json
```

### Phase 4: Automation Scripts (Day 2-3)

#### 4.1 Create Main Automation Script
```bash
nano ~/projects/tpp/automation/scripts/vps-auto-blog.sh
```

```bash
#!/bin/bash

# VPS Blog Automation Master Script
# Runs Claude Code to generate blog posts automatically

set -e  # Exit on error

# Configuration
PROJECT_DIR="/home/automation/projects/tpp"
LOG_DIR="$PROJECT_DIR/automation/logs"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
LOG_FILE="$LOG_DIR/blog-automation-$DATE.log"

# Create log directory
mkdir -p "$LOG_DIR"

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "========================================="
log "Starting Blog Automation Workflow"
log "========================================="

# Navigate to project
cd "$PROJECT_DIR"

# Pull latest changes
log "Pulling latest changes from GitHub..."
git pull origin main >> "$LOG_FILE" 2>&1

# Check if there are pending topics in queue
TOPIC_COUNT=$(node -e "const fs = require('fs'); const data = JSON.parse(fs.readFileSync('automation/topic-queue.json', 'utf-8')); console.log(data.queue.filter(t => t.status === 'pending').length);")

log "Pending topics in queue: $TOPIC_COUNT"

if [ "$TOPIC_COUNT" -eq 0 ]; then
    log "No pending topics. Exiting..."
    exit 0
fi

# Generate blog post using Claude Code
log "Launching Claude Code to generate blog post..."

# Create Claude Code prompt
PROMPT="Generate a new blog post using the blog automation system. Run: npm run blog:generate. After successful generation, validate the post and commit changes to git with an appropriate commit message."

# Execute Claude Code
claude "$PROMPT" --auto-approve --project "$PROJECT_DIR" >> "$LOG_FILE" 2>&1

if [ $? -ne 0 ]; then
    log "ERROR: Claude Code execution failed"
    node automation/scripts/send-notification.js \
        STATUS="failed" \
        POST_TITLE="Blog Generation Failed" >> "$LOG_FILE" 2>&1
    exit 1
fi

log "Claude Code execution completed"

# Run post-processing
log "Running post-processing scripts..."
npm run blog:validate >> "$LOG_FILE" 2>&1
npm run blog:check-links >> "$LOG_FILE" 2>&1

# Git operations (Claude Code should handle this, but as backup)
log "Checking for uncommitted changes..."
if [[ -n $(git status -s) ]]; then
    log "Committing changes..."
    git add .
    git commit -m "🤖 Auto-publish blog post via VPS automation [$(date +'%Y-%m-%d')]" >> "$LOG_FILE" 2>&1
    git push origin main >> "$LOG_FILE" 2>&1
    log "Changes pushed to GitHub"
else
    log "No changes to commit"
fi

# Run analytics
log "Tracking performance..."
npm run blog:performance >> "$LOG_FILE" 2>&1
npm run blog:insights >> "$LOG_FILE" 2>&1
npm run blog:alerts >> "$LOG_FILE" 2>&1

# Send success notification
log "Sending notifications..."
node automation/scripts/send-notification.js \
    STATUS="success" \
    POST_TITLE="New blog post generated" >> "$LOG_FILE" 2>&1

log "========================================="
log "Blog Automation Workflow Completed"
log "========================================="

# Clean up old logs (keep last 30 days)
find "$LOG_DIR" -name "blog-automation-*.log" -mtime +30 -delete

exit 0
```

```bash
# Make executable
chmod +x ~/projects/tpp/automation/scripts/vps-auto-blog.sh
```

#### 4.2 Create Weekly Analytics Script
```bash
nano ~/projects/tpp/automation/scripts/vps-weekly-analytics.sh
```

```bash
#!/bin/bash

# Weekly Analytics & Insights Report

set -e

PROJECT_DIR="/home/automation/projects/tpp"
LOG_DIR="$PROJECT_DIR/automation/logs"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
LOG_FILE="$LOG_DIR/weekly-analytics-$DATE.log"

mkdir -p "$LOG_DIR"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "Starting Weekly Analytics Workflow"

cd "$PROJECT_DIR"

# Run full analytics suite
log "Running master automation workflow..."
npm run blog:master >> "$LOG_FILE" 2>&1

# Generate content calendar
log "Generating content calendar..."
npm run blog:calendar >> "$LOG_FILE" 2>&1

# Competitor analysis (optional)
# npm run blog:competitor https://competitor-site.com >> "$LOG_FILE" 2>&1

log "Weekly Analytics Completed"

exit 0
```

```bash
chmod +x ~/projects/tpp/automation/scripts/vps-weekly-analytics.sh
```

### Phase 5: Cron Jobs Configuration (Day 3)

#### 5.1 Setup Cron Schedule
```bash
# Edit crontab
crontab -e
```

```cron
# The Profit Platform - Blog Automation Cron Jobs
# Maintainer: automation@theprofitplatform.com.au

# Environment variables for cron
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
MAILTO=your-email@domain.com

# ============================================
# DAILY BLOG POST GENERATION
# ============================================
# Runs at 9:00 AM AEST (Sydney time) Monday-Friday
# Generates 1 blog post per day
0 9 * * 1-5 /home/automation/projects/tpp/automation/scripts/vps-auto-blog.sh

# ============================================
# WEEKLY ANALYTICS & INSIGHTS
# ============================================
# Runs every Monday at 8:00 AM AEST
0 8 * * 1 /home/automation/projects/tpp/automation/scripts/vps-weekly-analytics.sh

# ============================================
# PERFORMANCE MONITORING
# ============================================
# Quick performance check every 6 hours
0 */6 * * * cd /home/automation/projects/tpp && npm run blog:performance > /dev/null 2>&1

# ============================================
# LOG ROTATION
# ============================================
# Clean old logs every Sunday at 2:00 AM
0 2 * * 0 find /home/automation/projects/tpp/automation/logs -name "*.log" -mtime +30 -delete

# ============================================
# BACKUP CONFIGURATION
# ============================================
# Backup automation config and data every day at 3:00 AM
0 3 * * * tar -czf /home/automation/backups/tpp-automation-$(date +\%Y\%m\%d).tar.gz /home/automation/projects/tpp/automation
```

#### 5.2 Verify Cron Setup
```bash
# List current cron jobs
crontab -l

# Check cron logs
sudo tail -f /var/log/syslog | grep CRON
```

### Phase 6: Monitoring & Logging (Day 3-4)

#### 6.1 Setup Log Rotation
```bash
sudo nano /etc/logrotate.d/tpp-automation
```

```
/home/automation/projects/tpp/automation/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0640 automation automation
}
```

#### 6.2 Create Health Check Script
```bash
nano ~/projects/tpp/automation/scripts/health-check.sh
```

```bash
#!/bin/bash

# Health Check Script - Monitors automation system

PROJECT_DIR="/home/automation/projects/tpp"
cd "$PROJECT_DIR"

echo "=== TPP Automation Health Check ==="
echo "Date: $(date)"
echo ""

# Check if git repo is clean
echo "Git Status:"
git status -s
echo ""

# Check last cron run
echo "Last Blog Generation:"
ls -lt automation/logs/blog-automation-*.log | head -1
echo ""

# Check API connectivity
echo "API Status:"
npm run blog:verify 2>&1 | grep -E "✅|❌"
echo ""

# Check disk space
echo "Disk Usage:"
df -h "$PROJECT_DIR" | tail -1
echo ""

# Check recent commits
echo "Recent Commits:"
git log --oneline -5
echo ""

echo "=== Health Check Complete ==="
```

```bash
chmod +x ~/projects/tpp/automation/scripts/health-check.sh

# Add to cron for daily health checks
crontab -e
# Add: 0 7 * * * /home/automation/projects/tpp/automation/scripts/health-check.sh | mail -s "TPP Health Check" your-email@domain.com
```

#### 6.3 Setup Process Monitoring (Optional)
```bash
# Install PM2 for process management
sudo npm install -g pm2

# Create PM2 ecosystem file
nano ~/projects/tpp/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'tpp-blog-monitor',
    script: 'automation/scripts/health-check.sh',
    cron_restart: '0 */6 * * *',  // Every 6 hours
    autorestart: false,
    watch: false
  }]
}
```

---

## 🔐 Security Considerations

### 1. Secrets Management
```bash
# Store sensitive credentials securely
chmod 600 ~/.env.local
chmod 600 ~/projects/tpp/credentials/*.json

# Use environment variables, never commit secrets
echo ".env.local" >> .gitignore
echo "credentials/*.json" >> .gitignore
```

### 2. SSH Hardening
```bash
# Disable password authentication
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
# Set: PubkeyAuthentication yes

sudo systemctl restart ssh
```

### 3. Firewall Configuration
```bash
# Allow only SSH
sudo ufw allow 22/tcp
sudo ufw enable
sudo ufw status
```

### 4. Automatic Security Updates
```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

---

## 📊 Monitoring & Alerts

### Key Metrics to Track
1. **Blog generation success rate** (target: >95%)
2. **Git push failures** (alert immediately)
3. **API failures** (Claude/Google APIs)
4. **Disk space usage** (alert at >80%)
5. **Cron job execution time** (monitor for slowdowns)

### Alert Channels
- **Discord:** Real-time notifications via webhook
- **Email:** Daily summary + critical alerts
- **Logs:** Comprehensive logging in `automation/logs/`

### Discord Webhook Setup
```bash
# Already configured in .env.local
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK_URL

# Test notification
node automation/scripts/send-notification.js \
  STATUS="success" \
  POST_TITLE="Test Notification"
```

---

## 🚀 Deployment Checklist

### Pre-Migration
- [ ] VPS provisioned and accessible
- [ ] SSH keys configured
- [ ] GitHub SSH access setup
- [ ] API keys secured (Anthropic, Google, Unsplash)
- [ ] Discord webhook created
- [ ] Gmail app password generated

### Migration Day
- [ ] Clone repository to VPS
- [ ] Install all dependencies
- [ ] Configure environment variables
- [ ] Upload credentials files
- [ ] Test scripts manually
- [ ] Configure cron jobs
- [ ] Run first automated generation
- [ ] Verify git commit & push
- [ ] Confirm Cloudflare deployment

### Post-Migration
- [ ] Monitor first 3 automated runs
- [ ] Check logs daily for 1 week
- [ ] Verify notifications working
- [ ] Review analytics dashboard
- [ ] Document any issues
- [ ] Optimize cron timing if needed

---

## 🐛 Troubleshooting Guide

### Issue: Cron Job Not Running
```bash
# Check cron service
sudo systemctl status cron

# Check cron logs
grep CRON /var/log/syslog | tail -20

# Test script manually
/home/automation/projects/tpp/automation/scripts/vps-auto-blog.sh
```

### Issue: Claude Code Authentication Failed
```bash
# Re-authenticate
claude auth logout
claude auth login

# Check API key
echo $ANTHROPIC_API_KEY
```

### Issue: Git Push Failed
```bash
# Check SSH connection to GitHub
ssh -T git@github.com

# Re-add SSH key if needed
ssh-add ~/.ssh/id_ed25519

# Check git remote
git remote -v
```

### Issue: npm Install Fails
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 💰 Cost Estimation

### VPS Hosting
- **DigitalOcean Droplet:** $12-24/month (2-4GB RAM)
- **Linode:** $12-24/month
- **Vultr:** $12-24/month

### API Costs (Monthly)
- **Anthropic Claude API:** ~$20-50 (5 posts/week @ 8k tokens each)
- **Google Analytics API:** Free
- **Google Search Console API:** Free
- **Unsplash API:** Free (50 requests/hour)

### Total Monthly Cost: **$32-74/month**

---

## 📈 Expected Results

### Automation Benefits
- ✅ **5 blog posts/week** generated automatically
- ✅ **20+ hours/week** saved in manual content creation
- ✅ **Zero manual intervention** required
- ✅ **Consistent publishing schedule** (M-F at 9 AM)
- ✅ **Auto-optimized SEO** with real analytics data
- ✅ **Instant notifications** on success/failure

### Content Quality
- **Grade:** A-/B+ (87-92/100)
- **Word count:** 1500-2500 words average
- **SEO optimization:** Automated keyword research
- **Internal linking:** Auto-generated from link map
- **Images:** Auto-fetched from Unsplash
- **Schema markup:** JSON-LD included

---

## 🔄 Maintenance Schedule

### Daily
- Monitor Discord notifications
- Check blog post quality
- Review error logs if any

### Weekly
- Review analytics dashboard
- Check cron job execution logs
- Verify git commit history
- Monitor disk space

### Monthly
- Update dependencies (`npm update`)
- Review and optimize topic queue
- Analyze performance trends
- Backup automation data

### Quarterly
- Update Node.js if new LTS available
- Security audit and patches
- Review and optimize cron schedules
- Cost optimization review

---

## 📚 Additional Resources

### Claude Code Documentation
- [Claude Code CLI Docs](https://docs.claude.com/claude-code)
- [API Reference](https://docs.anthropic.com/api)

### VPS Providers
- [DigitalOcean](https://www.digitalocean.com)
- [Linode](https://www.linode.com)
- [Vultr](https://www.vultr.com)

### Monitoring Tools
- [PM2 Process Manager](https://pm2.keymetrics.io/)
- [Cronitor](https://cronitor.io/) - Cron job monitoring

---

## ✅ Success Criteria

Migration is considered successful when:
1. ✅ Cron job runs daily without manual intervention
2. ✅ Blog posts are generated with >90% quality score
3. ✅ Git commits and pushes happen automatically
4. ✅ Cloudflare Pages deploys successfully
5. ✅ Notifications are received for each run
6. ✅ No failed runs for 7 consecutive days
7. ✅ Analytics tracking is accurate
8. ✅ Zero manual intervention required

---

## 🎯 Next Steps

1. **Provision VPS** → Choose provider and create instance
2. **Run Phase 1-3** → Basic setup and Claude Code installation
3. **Test manually** → Run scripts manually to verify
4. **Configure cron** → Setup automated schedule
5. **Monitor for 1 week** → Ensure stability
6. **Optimize** → Adjust timing and parameters as needed

---

**Questions or Issues?**
Contact: automation@theprofitplatform.com.au
Docs: `/home/automation/projects/tpp/VPS_MIGRATION_PLAN.md`
