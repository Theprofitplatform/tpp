# 🚀 Quick Start Guide - Autonomous Visual Quality Agent

## 📦 Installation (5 minutes)

```bash
# Navigate to project
cd /home/avi/projects/astro-site/scripts/visual-check

# Install dependencies
npm install

# Install Playwright browsers
npm run install-browsers
```

## 🧪 Test It Out

### 1. Single Check (Manual Test)

```bash
# Check test site once
npm run agent:once -- --url "https://test.theprofitplatform.com.au"
```

**Expected output:**
```
🤖 Autonomous Visual Quality Agent Starting...

🔍 Check Run #1 - 2025-09-30T14:30:00Z
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ No issues detected!

📁 Results: screenshots/run-2025-09-30T14-30-00
```

### 2. Watch Mode (Continuous Monitoring)

```bash
# Monitor test site every 15 minutes
npm run agent:test
```

Press `Ctrl+C` to stop.

## ⚙️ Configuration

### For Test Environment

Edit `config/test.json`:

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

### For Production

Edit `config/production.json`:

```json
{
  "url": "https://theprofitplatform.com.au",
  "interval": "0 * * * *",
  "autoFix": {
    "enabled": false,
    "requireApproval": true,
    "backupBeforeFix": true
  }
}
```

## 🔔 Enable Notifications

### Slack Integration

1. Create Slack webhook: https://api.slack.com/messaging/webhooks
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

### Webhook Integration

```json
{
  "notifications": {
    "webhook": {
      "enabled": true,
      "url": "https://your-api.com/webhook"
    }
  }
}
```

## 🤖 Run as Service (Production)

### Install Service

```bash
# Install systemd service
npm run install-service

# Enable and start
sudo systemctl enable visual-agent
sudo systemctl start visual-agent

# Check status
sudo systemctl status visual-agent
```

### View Logs

```bash
# Real-time logs
sudo journalctl -u visual-agent -f

# Recent logs
sudo journalctl -u visual-agent -n 100
```

## 📊 Check Results

### View Latest Summary

```bash
cat logs/summary.json | jq '.[-1]'
```

### View All Screenshots

```bash
ls -lah screenshots/
```

### View Generated Fixes

```bash
ls -lah fixes/
cat fixes/fixes-*.json | jq '.'
```

## 🎯 Common Use Cases

### 1. Hourly Production Monitoring

```bash
node src/index.js \
  --url "https://theprofitplatform.com.au" \
  --interval "0 * * * *" \
  --watch
```

### 2. 15-Minute Test Site Monitoring with Auto-Fix

```bash
node src/index.js \
  --config config/test.json \
  --auto-fix \
  --watch
```

### 3. One-Time Check Before Deployment

```bash
node src/index.js \
  --url "https://staging.theprofitplatform.com.au" \
  --run-once
```

### 4. Mobile-Only Check

Edit config and set:
```json
{
  "viewports": {
    "mobile": { "enabled": true },
    "tablet": { "enabled": false },
    "desktop": { "enabled": false }
  }
}
```

## 🔍 Understanding Output

### When Issues Found

```
⚠️  7 issue(s) detected. Analyzing...

💡 Generated 5 potential fix(es):

  1. Fix horizontal overflow on 3 element(s)
     Priority: high, Confidence: 75%
  2. Add font-display: swap for 2 font(s)
     Priority: medium, Confidence: 80%

📄 Fixes saved to: fixes/fixes-1727704200000.json

📁 Results: screenshots/run-2025-09-30T14-30-00
Next check: in 15 minutes
```

### When No Issues

```
✅ No issues detected!

📁 Results: screenshots/run-2025-09-30T14-30-00
Next check: in 15 minutes
```

## 🛠️ Troubleshooting

### Browser Not Found

```bash
npm run install-browsers
```

### Permission Errors

```bash
chmod +x src/index.js
sudo chown -R avi:avi /home/avi/projects/astro-site/scripts/visual-check
```

### Agent Won't Start

Check Node version:
```bash
node --version  # Should be >= 18.0.0
```

Check config syntax:
```bash
cat config/test.json | jq '.'
```

## 📚 Next Steps

1. ✅ **Test with manual check** - `npm run agent:once`
2. ✅ **Configure for your site** - Edit `config/test.json`
3. ✅ **Enable Slack notifications** - Add webhook URL
4. ✅ **Run in watch mode** - `npm run agent:test`
5. ✅ **Review generated fixes** - Check `fixes/` directory
6. ✅ **Install as service** - `npm run install-service`
7. ✅ **Monitor production** - `npm run agent:prod`

## 📖 Full Documentation

- **Autonomous Agent Features**: `AUTONOMOUS-AGENT.md`
- **Visual Check Basics**: `README.md`
- **Configuration Reference**: See `config/*.json`

## 🆘 Need Help?

Check logs:
```bash
# Agent logs
cat logs/summary.json | jq '.'

# System service logs
sudo journalctl -u visual-agent -n 50
```

---

**You're all set! Start monitoring your website's visual quality autonomously. 🚀**