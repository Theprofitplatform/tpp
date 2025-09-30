# 🤖 Autonomous Visual Quality Agent

**Continuous monitoring, automatic issue detection, and intelligent fix generation for your web applications.**

## 🎯 Overview

The Autonomous Visual Quality Agent is an intelligent system that continuously monitors your website's visual quality, detects issues automatically, generates fixes, and can apply them with version control. It goes beyond simple screenshot comparison to provide actionable insights and automated remediation.

## ✨ Key Features

### 🔄 Continuous Monitoring
- **Scheduled checks** using cron expressions (every 15 min, hourly, daily, etc.)
- **Multi-viewport testing** (mobile, tablet, desktop)
- **Automatic issue detection** across CSS, fonts, layout, and assets
- **Before/after comparison** to track improvements or regressions

### 🛠️ Intelligent Fix Generation
- **Automated fix suggestions** for detected issues
- **CSS fix generation** for layout overflows, missing styles
- **Font optimization** (add font-display: swap)
- **Asset path corrections** for 404s
- **Confidence scoring** for each fix (0-100%)
- **Priority ranking** (critical, high, medium, low)

### 🔐 Safe Automatic Fixes
- **Version control integration** (Git backup before changes)
- **Rollback capability** to restore previous state
- **Approval workflow** for low-confidence fixes
- **Backup creation** before applying any changes

### 📊 Comparison & Tracking
- **Run-to-run comparison** to see if issues improved or degraded
- **Issue delta tracking** (+3 new issues, -5 fixed)
- **Historical summary** of all checks (last 100 runs)
- **Performance metrics** and load time tracking

### 🔔 Notifications
- **Slack integration** for immediate alerts
- **Webhook support** for custom integrations
- **Email notifications** (configurable)
- **Status change alerts** (improved, degraded, unchanged)

## 📋 Architecture

```
autonomous-agent.js       Core agent with scheduling and orchestration
fix-generator.js          Analyzes issues and generates fixes
notification-service.js   Sends alerts via Slack/Webhook/Email
version-control.js        Manages backups and rollbacks
comparison-engine.js      Compares runs to track improvements
index.js                  CLI entry point
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /home/avi/projects/astro-site/scripts/visual-check
npm install node-cron commander
```

### 2. Configure Your Agent

Edit `config/test.json` or `config/production.json`:

```json
{
  "url": "https://test.theprofitplatform.com.au",
  "interval": "*/15 * * * *",
  "autoFix": {
    "enabled": true,
    "requireApproval": true,
    "backupBeforeFix": true
  },
  "notifications": {
    "slack": {
      "enabled": true,
      "webhookUrl": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
    }
  }
}
```

### 3. Run the Agent

**Single check (test mode):**
```bash
node src/index.js --url "https://test.theprofitplatform.com.au" --run-once
```

**Continuous monitoring:**
```bash
node src/index.js --watch --config config/test.json
```

**With auto-fix enabled:**
```bash
node src/index.js --watch --config config/test.json --auto-fix
```

## 📖 Usage Examples

### Basic Monitoring

Monitor your test site every 15 minutes:
```bash
node src/index.js \
  --url "https://test.theprofitplatform.com.au" \
  --interval "*/15 * * * *" \
  --watch
```

### Production Monitoring

Monitor production every hour (no auto-fix):
```bash
node src/index.js \
  --config config/production.json \
  --watch
```

### Test Site with Auto-Fix

Monitor test site with automatic fixes:
```bash
node src/index.js \
  --config config/test.json \
  --auto-fix \
  --watch
```

### Manual Check

Run a single check without scheduling:
```bash
node src/index.js --url "https://example.com" --run-once
```

## 🔧 Configuration Options

### Core Settings

| Option | Type | Description |
|--------|------|-------------|
| `url` | string | URL to monitor |
| `interval` | string | Cron expression (e.g., `"*/15 * * * *"`) |
| `viewports` | object | Desktop, tablet, mobile viewports |

### Auto-Fix Settings

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | false | Enable automatic fix application |
| `requireApproval` | boolean | true | Skip low-confidence fixes |
| `backupBeforeFix` | boolean | true | Create backup before applying fixes |

### Notifications

```json
{
  "notifications": {
    "slack": {
      "enabled": true,
      "webhookUrl": "https://hooks.slack.com/services/..."
    },
    "webhook": {
      "enabled": true,
      "url": "https://your-api.com/webhook"
    }
  }
}
```

### Paths

```json
{
  "paths": {
    "webRoot": "/var/www/theprofitplatform.com.au",
    "screenshots": "./screenshots",
    "reports": "./reports",
    "fixes": "./fixes",
    "logs": "./logs"
  }
}
```

## 🎯 Issue Detection & Fixes

### Detected Issues

1. **CSS Issues**
   - Missing/failed to load stylesheets
   - Unstyled pages
   - Excessive inline styles

2. **Font Issues**
   - Fonts still loading/unloaded
   - System fonts only (custom fonts failed)

3. **Layout Issues**
   - Horizontal overflow
   - Broken images
   - Zero-dimension elements
   - Missing critical elements (h1, main, title)

4. **Asset Issues**
   - 404 errors on CSS/JS/images
   - Failed resource loads

### Generated Fixes

Each fix includes:
- **Description**: What the fix does
- **Priority**: critical | high | medium | low
- **Confidence**: 0-100% (how confident the agent is)
- **Action**: Specific remediation step
- **Code**: Generated CSS/HTML fix

Example fix:
```json
{
  "type": "layout",
  "issue": "horizontal_overflow",
  "description": "Fix horizontal overflow on 3 element(s)",
  "priority": "high",
  "confidence": 75,
  "viewport": "mobile",
  "action": "fix_overflow",
  "code": {
    "file": "overflow-fix-mobile.css",
    "content": "/* Generated fix CSS */"
  }
}
```

## 📊 Output Structure

After each run:

```
scripts/visual-check/
├── screenshots/
│   └── run-2025-09-30T14-30-00/
│       └── test-site/
│           ├── mobile/
│           ├── tablet/
│           └── desktop/
├── reports/
│   └── run-2025-09-30T14-30-00/
│       ├── report.json
│       └── report.md
├── fixes/
│   ├── fixes-1727704200000.json
│   └── overflow-fix-mobile.css
└── logs/
    └── summary.json
```

## 🔄 Continuous Operation

### Method 1: Systemd Service (Recommended)

Install as system service:
```bash
sudo cp config/agent.service /etc/systemd/system/visual-agent.service
sudo systemctl daemon-reload
sudo systemctl enable visual-agent
sudo systemctl start visual-agent
```

Check status:
```bash
sudo systemctl status visual-agent
sudo journalctl -u visual-agent -f
```

### Method 2: PM2 Process Manager

```bash
npm install -g pm2

pm2 start src/index.js --name visual-agent -- --watch --config config/production.json
pm2 save
pm2 startup
```

### Method 3: Screen/Tmux

```bash
screen -S visual-agent
cd /home/avi/projects/astro-site/scripts/visual-check
node src/index.js --watch --config config/production.json
# Ctrl+A, D to detach
```

## 🔔 Notification Examples

### Slack Notification

When issues are found:
```
⚠️ Visual Quality Agent Report

URL: https://test.theprofitplatform.com.au
Issues Found: 7
Fixes Generated: 5
Status: ⚠️ degraded
Issue Delta: +3

2025-09-30T14:30:00Z
```

### Webhook Payload

```json
{
  "event": "visual_check",
  "type": "issues_found",
  "runId": 1727704200000,
  "timestamp": "2025-09-30T14:30:00Z",
  "url": "https://test.theprofitplatform.com.au",
  "totalIssues": 7,
  "fixes": 5,
  "comparison": {
    "status": "degraded",
    "issuesDelta": 3
  }
}
```

## 📈 Monitoring & Metrics

### View Summary Log

```bash
cat logs/summary.json | jq '.[-5:]'
```

Output:
```json
[
  {
    "runId": 1727704200000,
    "timestamp": "2025-09-30T14:30:00Z",
    "totalIssues": 7,
    "fixesGenerated": 5,
    "status": "degraded",
    "issuesDelta": 3
  }
]
```

### Check Agent Status

```bash
node src/index.js --status
```

## 🛡️ Version Control & Rollback

### Automatic Backups

When `backupBeforeFix: true`, the agent creates:
1. **Git commit** (if in git repo)
2. **File backup** (fallback if no git)

### Manual Rollback

Git-based:
```bash
cd /var/www/theprofitplatform.com.au
git log  # Find backup commit
git revert HEAD
```

File-based:
```bash
ls /var/www/theprofitplatform.com.au/.visual-agent-backups
# Copy backup folder back
```

## 🔍 Troubleshooting

### Agent not detecting issues

Check configuration:
```bash
node src/index.js --config config/test.json --run-once
```

### Fixes not applying

1. Check `autoFix.enabled: true`
2. Verify file permissions on `webRoot`
3. Check logs: `tail -f logs/summary.json`

### Browser launch errors

Install Playwright browsers:
```bash
npm run install-browsers
```

### Out of memory

Reduce viewport count or increase system resources:
```json
{
  "viewports": {
    "mobile": { "enabled": false },
    "desktop": { "enabled": true }
  }
}
```

## 🎛️ CLI Reference

```bash
node src/index.js [options]

Options:
  -u, --url <url>           URL to monitor
  -c, --config <path>       Configuration file path
  -i, --interval <cron>     Cron schedule
  --watch                   Run in continuous mode
  --run-once               Run single check and exit
  --auto-fix               Enable automatic fixes
  --no-auto-fix            Disable automatic fixes
  --status                 Show agent status
  --stop                   Stop running agent
  -h, --help               Display help
```

## 🌐 Cron Expression Examples

| Expression | Description |
|------------|-------------|
| `*/15 * * * *` | Every 15 minutes |
| `*/30 * * * *` | Every 30 minutes |
| `0 * * * *` | Every hour |
| `0 */6 * * *` | Every 6 hours |
| `0 0 * * *` | Daily at midnight |
| `0 9 * * 1-5` | Weekdays at 9 AM |

## 🔗 Integration Examples

### GitHub Actions

```yaml
name: Visual Quality Check
on:
  schedule:
    - cron: '0 */6 * * *'
  workflow_dispatch:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: |
          cd scripts/visual-check
          npm ci
          npm run install-browsers
          node src/index.js --run-once --config config/production.json
```

### n8n Workflow

1. Create webhook trigger
2. Add HTTP Request node → Call agent API
3. Add Slack notification on issues found

### Custom API

```javascript
import { AutonomousAgent } from './autonomous-agent.js';

const agent = new AutonomousAgent(config);
await agent.runCheck();

const status = agent.getStatus();
console.log(status.lastRun);
```

## 📚 Best Practices

1. **Start with test environment** - Enable auto-fix on staging first
2. **Monitor before auto-fixing** - Run monitoring-only mode initially
3. **Use webhooks** - Integrate with your incident management
4. **Review fixes** - Check generated fixes before production deployment
5. **Keep backups** - Always enable `backupBeforeFix: true`
6. **Tune confidence thresholds** - Adjust `requireApproval` based on results
7. **Use appropriate intervals** - Don't over-monitor (hourly is often enough)

## 🤝 Contributing

Improvements welcome! Key areas:
- Additional fix generators (JS errors, accessibility)
- Machine learning for better confidence scoring
- Visual regression detection (image diffing)
- Performance optimization suggestions

## 📄 License

MIT

## 🆘 Support

- Documentation: `/scripts/visual-check/README.md`
- Logs: `/scripts/visual-check/logs/summary.json`
- Issues: Check agent output and logs first

---

**Built with ❤️ for reliable, autonomous visual quality monitoring**