# 🎯 Visual Quality Agent - Command Cheatsheet

## 📦 Setup & Installation

```bash
# Navigate to project
cd /home/avi/projects/astro-site/scripts/visual-check

# Install dependencies
npm install

# Install Playwright browsers
npm run install-browsers
```

---

## 🚀 Basic Usage

### Single Check (Test Mode)
```bash
npm run agent:once -- --url "https://test.theprofitplatform.com.au"
```

### Continuous Monitoring
```bash
# Test site (every 15 minutes)
npm run agent:test

# Production (every hour)
npm run agent:prod

# Custom URL
node src/index.js --url "https://example.com" --watch
```

### Check Agent Status
```bash
npm run agent:status
node src/index.js --status
```

---

## ⚙️ Configuration

### Edit Configuration
```bash
# Test environment
nano config/test.json

# Production environment
nano config/production.json
```

### Common Settings
```json
{
  "url": "https://your-site.com",
  "interval": "*/15 * * * *",
  "autoFix": {
    "enabled": false,
    "requireApproval": true,
    "backupBeforeFix": true
  }
}
```

---

## 🔔 Notifications

### Enable Slack
```json
{
  "notifications": {
    "slack": {
      "enabled": true,
      "webhookUrl": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
    }
  }
}
```

### Enable Webhook (n8n)
```json
{
  "notifications": {
    "webhook": {
      "enabled": true,
      "url": "https://n8n.theprofitplatform.com.au/webhook/visual-agent"
    }
  }
}
```

---

## 🤖 Service Management

### Systemd Service

#### Install
```bash
npm run install-service
sudo systemctl enable visual-agent
sudo systemctl start visual-agent
```

#### Control
```bash
# Start
sudo systemctl start visual-agent

# Stop
sudo systemctl stop visual-agent

# Restart
sudo systemctl restart visual-agent

# Status
sudo systemctl status visual-agent
```

#### View Logs
```bash
# Real-time
sudo journalctl -u visual-agent -f

# Recent errors
sudo journalctl -u visual-agent -p err -n 50

# Today's logs
sudo journalctl -u visual-agent --since today
```

### PM2 Process Manager

```bash
# Start
pm2 start src/index.js --name visual-agent -- --config config/test.json --watch

# Control
pm2 stop visual-agent
pm2 restart visual-agent
pm2 delete visual-agent

# Monitoring
pm2 monit
pm2 logs visual-agent

# Save & Startup
pm2 save
pm2 startup
```

---

## 📊 View Results

### Latest Summary
```bash
cat logs/summary.json | jq '.[-1]'
```

### Last 5 Runs
```bash
cat logs/summary.json | jq '.[-5:]'
```

### Issues Over Time
```bash
cat logs/summary.json | jq '[.[] | {time: .timestamp, issues: .totalIssues}]'
```

### View Screenshots
```bash
ls -lt screenshots/ | head -5
```

### View Generated Fixes
```bash
ls -lt fixes/ | head -5
cat fixes/fixes-*.json | jq '.[0:3]'
```

---

## 🔧 CLI Options

```bash
node src/index.js [options]
```

| Option | Description | Example |
|--------|-------------|---------|
| `-u, --url <url>` | URL to monitor | `--url "https://example.com"` |
| `-c, --config <path>` | Config file | `--config config/test.json` |
| `-i, --interval <cron>` | Schedule | `--interval "*/15 * * * *"` |
| `--watch` | Continuous mode | `--watch` |
| `--run-once` | Single check | `--run-once` |
| `--auto-fix` | Enable auto-fix | `--auto-fix` |
| `--no-auto-fix` | Disable auto-fix | `--no-auto-fix` |
| `--status` | Show status | `--status` |

---

## 📅 Cron Expressions

| Expression | Meaning |
|------------|---------|
| `*/15 * * * *` | Every 15 minutes |
| `*/30 * * * *` | Every 30 minutes |
| `0 * * * *` | Every hour |
| `0 */6 * * *` | Every 6 hours |
| `0 0 * * *` | Daily at midnight |
| `0 9 * * 1-5` | Weekdays at 9 AM |

Test cron: https://crontab.guru/

---

## 🔍 Troubleshooting

### Browser Not Found
```bash
npm run install-browsers
npx playwright install chromium
```

### Permission Errors
```bash
chmod +x src/index.js
sudo chown -R avi:avi /home/avi/projects/astro-site/scripts/visual-check
```

### Check Node Version
```bash
node --version  # Should be >= 18.0.0
```

### Validate Config
```bash
cat config/test.json | jq '.'
```

### Service Not Starting
```bash
sudo systemctl status visual-agent
sudo journalctl -u visual-agent -n 50
```

### Out of Memory
Edit config to reduce viewports:
```json
{
  "viewports": {
    "mobile": { "enabled": false },
    "desktop": { "enabled": true }
  }
}
```

---

## 🗂️ File Locations

```
/home/avi/projects/astro-site/scripts/visual-check/
├── src/              # Source code
├── config/           # Configuration files
├── screenshots/      # Generated screenshots
├── reports/          # JSON/Markdown reports
├── fixes/            # Generated fixes
└── logs/             # Summary logs
```

### System Logs
- Service logs: `/var/log/visual-agent.log`
- Error logs: `/var/log/visual-agent-error.log`
- Systemd: `sudo journalctl -u visual-agent`

---

## 🧹 Cleanup

### Remove Old Screenshots (keep last 10)
```bash
cd screenshots && ls -t | tail -n +11 | xargs rm -rf
```

### Remove Old Reports
```bash
cd reports && ls -t | tail -n +11 | xargs rm -rf
```

### Clear All Data
```bash
rm -rf screenshots/* reports/* fixes/* logs/*
```

---

## 🔐 Security

### Set File Permissions
```bash
chmod 600 config/*.json
chmod 700 src/
chmod 755 screenshots/ reports/ fixes/ logs/
```

### Create Backup
```bash
cd /var/www/theprofitplatform.com.au
git add -A
git commit -m "Pre-agent backup"
```

### Restore from Backup
```bash
cd /var/www/theprofitplatform.com.au
git log --oneline | grep "Visual Agent"
git revert <commit-hash>
```

---

## 📈 Monitoring

### Check Disk Usage
```bash
du -sh screenshots/ reports/ fixes/ logs/
```

### Count Total Runs
```bash
cat logs/summary.json | jq 'length'
```

### Find Problematic Runs
```bash
cat logs/summary.json | jq '.[] | select(.totalIssues > 10)'
```

---

## 🎯 Common Workflows

### Development Workflow
```bash
# 1. Test once
npm run agent:once -- --url "https://test.theprofitplatform.com.au"

# 2. Review results
ls -lah screenshots/ fixes/

# 3. Start monitoring
npm run agent:test
```

### Production Deployment
```bash
# 1. Configure
nano config/production.json

# 2. Install service
npm run install-service

# 3. Enable & start
sudo systemctl enable visual-agent
sudo systemctl start visual-agent

# 4. Monitor
sudo journalctl -u visual-agent -f
```

### Quick Debug
```bash
# Single check with verbose output
node src/index.js --url "https://test.theprofitplatform.com.au" --run-once

# Check logs
cat logs/summary.json | jq '.[-1]'

# View latest fixes
cat fixes/fixes-*.json | jq '.'
```

---

## 📚 Documentation Quick Links

- **Quick Start**: `QUICKSTART.md`
- **Full Features**: `AUTONOMOUS-AGENT.md`
- **Deployment**: `DEPLOYMENT.md`
- **Overview**: `SUMMARY.md`
- **This File**: `CHEATSHEET.md`

---

## 🆘 Emergency Commands

### Stop Everything
```bash
# Systemd
sudo systemctl stop visual-agent

# PM2
pm2 stop visual-agent

# Kill process
pkill -f "visual-agent"
```

### Check What's Running
```bash
ps aux | grep visual
systemctl status visual-agent
pm2 list
```

### Full Reset
```bash
# Stop service
sudo systemctl stop visual-agent

# Clean data
rm -rf screenshots/* reports/* fixes/* logs/*

# Restart
sudo systemctl start visual-agent
```

---

**Quick Help**: Type `node src/index.js --help` for all options