# 🚀 Visual Quality Agent - Quick Reference

## Installation (One-Time)

```bash
cd /home/avi/projects/astro-site/scripts/visual-check
./INSTALL.sh
```

## Common Commands

```bash
# Single check
node src/cli.js inspect --url "https://theprofitplatform.com.au"

# Continuous monitoring (every 15 min)
node src/cli.js watch

# With auto-fix
node src/cli.js watch --auto-fix

# Custom interval (every 30 min)
node src/cli.js watch --interval "*/30 * * * *"

# Apply specific fixes
node src/cli.js apply-fixes --run-id <RUN_ID> --fix-ids fix-1,fix-2

# View latest report
cat reports/summary.md
```

## Deployment

### Systemd (Recommended)

```bash
# Create service
sudo nano /etc/systemd/system/visual-agent.service

# Enable and start
sudo systemctl enable visual-agent
sudo systemctl start visual-agent

# Check status
sudo systemctl status visual-agent

# View logs
sudo journalctl -u visual-agent -f
```

### PM2

```bash
pm2 start src/cli.js --name visual-agent -- watch
pm2 save
pm2 startup
```

### Cron

```bash
crontab -e
# Add: */15 * * * * node src/cli.js inspect
```

## Configuration File

`config/config.json`:

```json
{
  "url": "https://theprofitplatform.com.au",
  "interval": "*/15 * * * *",
  "viewports": [
    {"name": "mobile", "width": 375, "height": 812},
    {"name": "desktop", "width": 1920, "height": 1080}
  ],
  "autoFix": {
    "enabled": false,
    "minConfidence": 0.8
  },
  "notifications": {
    "enabled": false,
    "channels": {
      "slack": {
        "enabled": false,
        "webhookUrl": ""
      }
    }
  }
}
```

## Output Locations

```
screenshots/                    # Screenshots
reports/                        # JSON + Markdown reports
  ├── summary.md               # Latest summary
  └── 2025-09-30T10-30-00-000Z/
      ├── results.json         # Complete data
      └── report.md            # Full report
fixes/                         # Generated fix patches
```

## Issue Types Detected

- ❌ **Layout**: Broken images, overflow, zero dimensions
- ⚠️ **Styling**: Low contrast, font issues, missing CSS
- 🐌 **Performance**: Slow loads, high resource counts
- ♿ **Accessibility**: Missing labels, heading hierarchy
- 🔴 **JavaScript**: Console errors, failed requests

## Troubleshooting

```bash
# Reinstall browsers
npm run install-browsers

# Debug mode
DEBUG=1 node src/cli.js inspect --url "https://theprofitplatform.com.au"

# Check logs
sudo journalctl -u visual-agent -f

# PM2 logs
pm2 logs visual-agent

# Restart service
sudo systemctl restart visual-agent
```

## Documentation

- **AGENT_OVERVIEW.md** - Complete system overview
- **USAGE.md** - Detailed usage guide
- **TEST_RUN.md** - Test examples
- **README.md** - Quick start guide

## Interactive Demo

```bash
./EXAMPLE_RUN.sh
```

## Systemd Service Template

```ini
[Unit]
Description=Visual Quality Agent
After=network.target

[Service]
Type=simple
User=avi
WorkingDirectory=/home/avi/projects/astro-site/scripts/visual-check
ExecStart=/usr/bin/node src/cli.js watch
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## Slack Notification Setup

1. Create webhook: https://api.slack.com/messaging/webhooks
2. Edit `config/config.json`:
   ```json
   "notifications": {
     "enabled": true,
     "channels": {
       "slack": {
         "enabled": true,
         "webhookUrl": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
       }
     }
   }
   ```

## Cron Schedule Examples

```
*/15 * * * *    Every 15 minutes
*/30 * * * *    Every 30 minutes
0 * * * *       Every hour
0 */6 * * *     Every 6 hours
0 0 * * *       Daily at midnight
0 9 * * 1       Every Monday at 9 AM
```

## Status Checks

```bash
# Systemd
sudo systemctl status visual-agent
sudo systemctl is-active visual-agent

# PM2
pm2 status
pm2 info visual-agent

# View reports
cat reports/summary.md
ls -lh screenshots/
```

---

**Quick Start**: `./INSTALL.sh` → `./EXAMPLE_RUN.sh` → Deploy as service
