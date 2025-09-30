# 🚀 Deployment Guide - Autonomous Visual Quality Agent

## ✅ System Status

Your autonomous visual quality agent is **ready for deployment**!

## 📊 Test Results

Initial test completed successfully:
- ✅ Browser automation working
- ✅ Screenshot capture functional
- ✅ Issue detection operational
- ✅ Fix generation working (9 fixes generated)
- ✅ Multi-viewport testing verified

**Test URL**: https://test.theprofitplatform.com.au
**Issues detected**: 12
**Fixes generated**: 9
**Test duration**: 8.4 seconds

## 🎯 Deployment Options

### Option 1: Systemd Service (Recommended for Production)

**Best for**: 24/7 monitoring with automatic restarts

```bash
# 1. Install service
cd /home/avi/projects/astro-site/scripts/visual-check
npm run install-service

# 2. Configure production settings
nano config/production.json

# 3. Enable and start
sudo systemctl enable visual-agent
sudo systemctl start visual-agent

# 4. Verify
sudo systemctl status visual-agent
```

**Logs location**: `/var/log/visual-agent.log`

### Option 2: PM2 Process Manager

**Best for**: Development and staging environments

```bash
# 1. Install PM2
npm install -g pm2

# 2. Start agent
cd /home/avi/projects/astro-site/scripts/visual-check
pm2 start src/index.js --name visual-agent -- --config config/test.json --watch

# 3. Save configuration
pm2 save
pm2 startup

# 4. Monitor
pm2 monit
pm2 logs visual-agent
```

### Option 3: Screen/Tmux Session

**Best for**: Testing and temporary monitoring

```bash
# Using screen
screen -S visual-agent
cd /home/avi/projects/astro-site/scripts/visual-check
npm run agent:test
# Press Ctrl+A, D to detach

# Reattach later
screen -r visual-agent
```

## ⚙️ Configuration for Different Environments

### Test Environment (Every 15 minutes, auto-fix enabled)

`config/test.json`:
```json
{
  "url": "https://test.theprofitplatform.com.au",
  "interval": "*/15 * * * *",
  "autoFix": {
    "enabled": true,
    "requireApproval": true,
    "backupBeforeFix": true
  }
}
```

**Run**: `npm run agent:test`

### Production Environment (Hourly, monitoring only)

`config/production.json`:
```json
{
  "url": "https://theprofitplatform.com.au",
  "interval": "0 * * * *",
  "autoFix": {
    "enabled": false
  }
}
```

**Run**: `npm run agent:prod`

## 🔔 Enable Notifications

### Slack Setup

1. Create Slack webhook:
   - Go to: https://api.slack.com/messaging/webhooks
   - Create webhook for your channel
   - Copy webhook URL

2. Add to config:
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

### n8n Integration

Since you have n8n running at https://n8n.theprofitplatform.com.au:

1. Create webhook workflow in n8n
2. Add webhook URL to config:
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

3. n8n will receive:
```json
{
  "event": "visual_check",
  "type": "issues_found",
  "url": "https://...",
  "totalIssues": 12,
  "fixes": 9,
  "timestamp": "2025-09-30T14:33:57Z"
}
```

## 📁 Directory Structure

```
/home/avi/projects/astro-site/scripts/visual-check/
├── src/                          # Core agent code
│   ├── index.js                 # Main entry point
│   ├── autonomous-agent.js      # Agent orchestration
│   ├── fix-generator.js         # Fix generation
│   ├── notification-service.js  # Notifications
│   ├── version-control.js       # Backups/rollbacks
│   └── comparison-engine.js     # Run comparisons
├── config/                       # Configuration files
│   ├── default.json             # Base config
│   ├── test.json                # Test environment
│   ├── production.json          # Production
│   └── agent.service            # Systemd service
├── lib/                          # Detection modules
│   ├── detector.js              # Issue detection
│   └── reporter.js              # Report generation
├── screenshots/                  # Generated screenshots
├── reports/                      # JSON/Markdown reports
├── fixes/                        # Generated fixes
├── logs/                         # Summary logs
├── visualCheck.js               # Legacy checker
├── package.json                 # Dependencies
├── README.md                    # Basic docs
├── AUTONOMOUS-AGENT.md          # Agent features
├── QUICKSTART.md                # Quick start guide
└── DEPLOYMENT.md                # This file
```

## 🔧 Maintenance Commands

### Check Agent Status
```bash
node src/index.js --status
```

### View Recent Runs
```bash
cat logs/summary.json | jq '.[-5:]'
```

### Check Generated Fixes
```bash
ls -lt fixes/ | head -5
cat fixes/fixes-*.json | jq '.[0]'
```

### View Screenshots
```bash
ls -lt screenshots/ | head -5
```

### Clean Old Data (keep last 10 runs)
```bash
cd screenshots && ls -t | tail -n +11 | xargs rm -rf
cd ../reports && ls -t | tail -n +11 | xargs rm -rf
```

## 📊 Monitoring the Agent

### Systemd Service Logs
```bash
# Real-time logs
sudo journalctl -u visual-agent -f

# Recent errors
sudo journalctl -u visual-agent -p err -n 50

# Today's logs
sudo journalctl -u visual-agent --since today
```

### PM2 Logs
```bash
pm2 logs visual-agent --lines 100
pm2 monit
```

### Agent Statistics
```bash
# Run count
cat logs/summary.json | jq 'length'

# Issues over time
cat logs/summary.json | jq '[.[] | {timestamp, issues: .totalIssues}]'

# Latest status
cat logs/summary.json | jq '.[-1]'
```

## 🔐 Security Considerations

1. **File Permissions**
```bash
chmod 600 config/*.json  # Protect configs
chmod 700 src/           # Protect source code
chmod 755 screenshots/ reports/ fixes/ logs/  # Allow reading results
```

2. **Systemd Service Security**
   - Service runs as user `avi`
   - Limited write access via `ProtectSystem=strict`
   - Memory limited to 2GB
   - CPU limited to 50%

3. **Webhook Security**
   - Use HTTPS only
   - Validate webhook signatures if possible
   - Don't expose sensitive paths in URLs

## 🎯 Recommended Deployment Strategy

### Phase 1: Testing (Week 1)
```bash
# Run on test site with frequent checks
npm run agent:test
```
- Monitor every 15 minutes
- Auto-fix enabled
- Review generated fixes daily
- Tune confidence thresholds

### Phase 2: Staging (Week 2-3)
```bash
# Monitor staging environment
node src/index.js --url "https://staging.theprofitplatform.com.au" --interval "*/30 * * * *" --watch
```
- Check every 30 minutes
- Enable Slack notifications
- Manual fix approval only
- Compare results with test

### Phase 3: Production (Week 4+)
```bash
# Production monitoring (systemd service)
sudo systemctl start visual-agent
```
- Hourly checks
- Monitoring only (no auto-fix)
- Slack/n8n notifications enabled
- Regular review of fixes

## 🐛 Troubleshooting

### Agent Won't Start

**Check Node version**:
```bash
node --version  # Must be >= 18.0.0
```

**Check dependencies**:
```bash
npm list
npm install
```

**Check config**:
```bash
cat config/production.json | jq '.'
```

### No Issues Detected (But There Are Issues)

**Increase detection sensitivity** in config:
```json
{
  "thresholds": {
    "minContrast": 3.0,
    "minFontSize": 10
  }
}
```

### Too Many False Positives

**Increase confidence threshold**:
```json
{
  "autoFix": {
    "requireApproval": true,
    "minConfidence": 80
  }
}
```

### Out of Memory

**Reduce viewports**:
```json
{
  "viewports": {
    "mobile": { "enabled": false },
    "desktop": { "enabled": true }
  }
}
```

### Service Won't Start

```bash
# Check service status
sudo systemctl status visual-agent

# Check logs
sudo journalctl -u visual-agent -n 50

# Validate service file
sudo systemd-analyze verify visual-agent.service

# Restart service
sudo systemctl restart visual-agent
```

## 📈 Performance Tuning

### For High-Traffic Sites
- Increase timeout: `"timeout": 60000`
- Reduce screenshot frequency
- Use single viewport only

### For Fast Checks
- Disable `waitForNetworkIdle`
- Use mobile viewport only
- Skip tablet viewport

### For Detailed Analysis
- Enable all viewports
- Increase wait time
- Enable all checks

## 🔄 Backup and Rollback

### Manual Backup
```bash
cd /var/www/theprofitplatform.com.au
git add -A
git commit -m "Pre-agent backup"
```

### Restore from Agent Backup
```bash
# List backups
ls -lah /var/www/theprofitplatform.com.au/.visual-agent-backups/

# Git rollback
cd /var/www/theprofitplatform.com.au
git log --oneline | grep "Visual Agent"
git revert <commit-hash>
```

## 📞 Support Checklist

Before asking for help:
- [ ] Check logs: `logs/summary.json`
- [ ] Check service status: `systemctl status visual-agent`
- [ ] Review config: `cat config/*.json | jq '.'`
- [ ] Verify Node version: `node --version`
- [ ] Check disk space: `df -h`
- [ ] Review recent errors: `journalctl -u visual-agent -p err -n 20`

## 🎉 Next Steps

1. ✅ **Choose deployment method** (systemd recommended)
2. ✅ **Configure for your environment** (test or production)
3. ✅ **Enable notifications** (Slack/n8n)
4. ✅ **Start the agent** (`systemctl start` or `pm2 start`)
5. ✅ **Monitor for 24 hours** (check logs and results)
6. ✅ **Review generated fixes** (fixes/ directory)
7. ✅ **Tune configuration** (adjust thresholds if needed)
8. ✅ **Scale to production** (when confident)

---

**Your autonomous visual quality agent is ready! 🚀**

For detailed features, see `AUTONOMOUS-AGENT.md`
For quick reference, see `QUICKSTART.md`