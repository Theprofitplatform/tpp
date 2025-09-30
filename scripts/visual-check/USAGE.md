# Visual Quality Agent - Complete Usage Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /home/avi/projects/astro-site/scripts/visual-check
npm install
npm run install-browsers
```

### 2. Run Your First Check

```bash
# Single check
node src/cli.js inspect --url "https://theprofitplatform.com.au"

# Continuous monitoring (every 15 minutes)
node src/cli.js watch
```

## 📋 Available Commands

### `inspect` - Single Inspection Run

```bash
# Basic inspection
node src/cli.js inspect

# Inspect specific URL
node src/cli.js inspect --url "https://test.theprofitplatform.com.au"

# With auto-fix enabled
node src/cli.js inspect --auto-fix

# Use custom config
node src/cli.js inspect --config config/production.json
```

### `watch` - Continuous Monitoring

```bash
# Start watching (uses config interval)
node src/cli.js watch

# Custom interval (every 30 minutes)
node src/cli.js watch --interval "*/30 * * * *"

# With auto-fix
node src/cli.js watch --auto-fix

# Watch specific URL
node src/cli.js watch --url "https://theprofitplatform.com.au"
```

### `apply-fixes` - Apply Generated Fixes

```bash
# Apply all high-confidence fixes from run
node src/cli.js apply-fixes --run-id 2025-09-30T10-30-00-000Z

# Apply specific fixes
node src/cli.js apply-fixes --run-id 2025-09-30T10-30-00-000Z --fix-ids fix-1,fix-2,fix-3
```

### `report` - Generate Report

```bash
# Generate report for specific run
node src/cli.js report --run-id 2025-09-30T10-30-00-000Z
```

## ⚙️ Configuration

### Default Configuration (`config/config.json`)

```json
{
  "url": "https://theprofitplatform.com.au",
  "testUrl": "https://test.theprofitplatform.com.au",

  "monitoring": {
    "enabled": true,
    "interval": "*/15 * * * *",
    "autoFix": false,
    "requireApproval": true
  },

  "viewports": [
    { "name": "desktop", "width": 1920, "height": 1080 },
    { "name": "laptop", "width": 1366, "height": 768 },
    { "name": "tablet", "width": 768, "height": 1024 },
    { "name": "mobile", "width": 375, "height": 812 }
  ],

  "detectionThresholds": {
    "layoutShift": 0.1,
    "contrastRatio": 4.5,
    "performanceScore": 80
  },

  "paths": {
    "screenshots": "./screenshots",
    "reports": "./reports",
    "fixes": "./fixes",
    "webRoot": "/home/avi/projects/astro-site"
  },

  "notifications": {
    "enabled": false,
    "channels": {
      "slack": {
        "enabled": false,
        "webhookUrl": "YOUR_WEBHOOK_URL"
      }
    }
  },

  "git": {
    "enabled": true,
    "autoCommit": false,
    "branchPrefix": "visual-fix/"
  }
}
```

### Cron Interval Examples

```bash
"*/15 * * * *"   # Every 15 minutes
"*/30 * * * *"   # Every 30 minutes
"0 * * * *"      # Every hour
"0 */6 * * *"    # Every 6 hours
"0 0 * * *"      # Daily at midnight
"0 9 * * 1"      # Every Monday at 9 AM
```

## 🔄 Deployment Options

### Option 1: Systemd Service (Recommended for VPS)

Create service file:

```bash
sudo nano /etc/systemd/system/visual-agent.service
```

```ini
[Unit]
Description=Visual Quality Monitoring Agent
After=network.target

[Service]
Type=simple
User=avi
WorkingDirectory=/home/avi/projects/astro-site/scripts/visual-check
ExecStart=/usr/bin/node /home/avi/projects/astro-site/scripts/visual-check/src/cli.js watch
Restart=always
RestartSec=10
StandardOutput=append:/var/log/visual-agent.log
StandardError=append:/var/log/visual-agent.log

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable visual-agent
sudo systemctl start visual-agent
sudo systemctl status visual-agent
```

View logs:

```bash
sudo journalctl -u visual-agent -f
```

### Option 2: PM2 Process Manager

```bash
# Install PM2 globally
npm install -g pm2

# Start agent
pm2 start src/cli.js --name visual-agent -- watch

# Save configuration
pm2 save

# Setup auto-start on boot
pm2 startup
```

PM2 commands:

```bash
pm2 status              # Check status
pm2 logs visual-agent   # View logs
pm2 restart visual-agent # Restart
pm2 stop visual-agent    # Stop
pm2 delete visual-agent  # Remove
```

### Option 3: Crontab

Add to crontab (`crontab -e`):

```bash
# Run every 15 minutes
*/15 * * * * cd /home/avi/projects/astro-site/scripts/visual-check && /usr/bin/node src/cli.js inspect >> /var/log/visual-check.log 2>&1

# Run every hour
0 * * * * cd /home/avi/projects/astro-site/scripts/visual-check && /usr/bin/node src/cli.js inspect

# Daily at 3 AM
0 3 * * * cd /home/avi/projects/astro-site/scripts/visual-check && /usr/bin/node src/cli.js inspect
```

### Option 4: Docker Container

Create `Dockerfile`:

```dockerfile
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["node", "src/cli.js", "watch"]
```

Build and run:

```bash
docker build -t visual-agent .
docker run -d --name visual-agent \
  -v /home/avi/projects/astro-site:/workspace \
  -v $(pwd)/screenshots:/app/screenshots \
  -v $(pwd)/reports:/app/reports \
  visual-agent
```

## 📊 Understanding Reports

### Report Structure

After each run, you'll get:

```
reports/
└── 2025-09-30T10-30-00-000Z/
    ├── results.json      # Complete results
    ├── report.md         # Human-readable report
    └── summary.md        # Quick summary
```

### Report Contents

**results.json** - Complete data:
- All detected issues
- Generated fixes
- Screenshots
- Performance metrics
- Viewport data

**report.md** - Formatted report:
- Summary statistics
- Issues by severity
- Issues by category
- Fix suggestions
- Screenshots

**summary.md** - Latest run overview:
- Run status
- Issue count
- Recent runs history

## 🔧 Issue Types Detected

### Layout Issues
- ❌ Broken images
- ❌ Missing image sources
- ❌ Horizontal overflow
- ❌ Elements with zero dimensions
- ❌ Empty links

### Styling Issues
- ⚠️ Low contrast ratios
- ⚠️ Font loading failures
- ⚠️ Missing CSS

### Performance Issues
- 🐌 Slow First Contentful Paint
- 🐌 Slow page load times
- 🐌 High resource counts

### Accessibility Issues
- ♿ Missing ARIA labels
- ♿ Missing form labels
- ♿ Improper heading hierarchy
- ♿ Missing alt text

### JavaScript & Network
- 🔴 Console errors
- 🔴 Failed network requests
- 🔴 Broken resource links

## 💡 Fix Confidence Levels

Fixes are generated with confidence scores:

- **90-100%**: Safe to auto-apply
- **80-89%**: High confidence, review recommended
- **70-79%**: Moderate confidence, manual review needed
- **<70%**: Low confidence, requires manual implementation

## 🔔 Notifications

### Slack Integration

1. Create Slack Incoming Webhook
2. Update `config/config.json`:

```json
{
  "notifications": {
    "enabled": true,
    "channels": {
      "slack": {
        "enabled": true,
        "webhookUrl": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
      }
    }
  }
}
```

### Custom Webhook

```json
{
  "notifications": {
    "enabled": true,
    "channels": {
      "webhook": {
        "enabled": true,
        "url": "https://your-api.com/webhooks/visual-checks",
        "method": "POST"
      }
    }
  }
}
```

## 🎯 Common Use Cases

### 1. Pre-Deployment Check

```bash
# Check staging before deploying to production
node src/cli.js inspect --url "https://test.theprofitplatform.com.au"

# Exit code indicates success/failure
if [ $? -eq 0 ]; then
  echo "✅ Visual checks passed"
  # Deploy to production
else
  echo "❌ Visual issues detected"
  exit 1
fi
```

### 2. Post-Deployment Verification

```bash
# Check production after deployment
node src/cli.js inspect --url "https://theprofitplatform.com.au"
```

### 3. Continuous Monitoring

```bash
# Run as systemd service
sudo systemctl start visual-agent
```

### 4. Manual Fix Application

```bash
# Inspect and save fixes
node src/cli.js inspect --url "https://theprofitplatform.com.au"

# Review generated fixes in reports/

# Apply specific fixes
node src/cli.js apply-fixes --run-id <RUN_ID> --fix-ids fix-1,fix-2
```

## 🐛 Troubleshooting

### Browser Installation

```bash
# Reinstall Playwright browsers
npx playwright install chromium --force
npx playwright install-deps chromium
```

### Permission Issues

```bash
# Fix directory permissions
chmod -R 755 /home/avi/projects/astro-site/scripts/visual-check
```

### View Logs

```bash
# Systemd service logs
sudo journalctl -u visual-agent -f

# PM2 logs
pm2 logs visual-agent

# Manual log file
tail -f /var/log/visual-check.log
```

### Debug Mode

```bash
# Enable debug output
DEBUG=1 node src/cli.js inspect --url "https://theprofitplatform.com.au"
```

## 📈 Best Practices

1. **Start with manual runs** to understand the output
2. **Review generated fixes** before enabling auto-fix
3. **Test on staging** before production
4. **Keep confidence threshold high** (≥80%) for auto-fix
5. **Enable notifications** for production monitoring
6. **Version control your fixes** with git integration
7. **Monitor logs** regularly
8. **Schedule during low-traffic** hours for intensive checks

## 🔐 Security Notes

- Never commit webhook URLs to git
- Use environment variables for sensitive config
- Restrict file permissions on config files
- Review auto-applied fixes in git history
- Enable git branching for fixes

## 📚 Next Steps

1. Run your first check: `node src/cli.js inspect`
2. Review the generated report
3. Set up continuous monitoring with systemd/PM2
4. Configure notifications
5. Enable auto-fix for high-confidence issues
6. Integrate with your CI/CD pipeline

---

**Need Help?**
- Check the logs: `sudo journalctl -u visual-agent -f`
- Review screenshots: `screenshots/`
- Read reports: `reports/summary.md`
