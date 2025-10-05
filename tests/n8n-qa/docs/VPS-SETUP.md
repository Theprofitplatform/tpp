# VPS Setup Guide

Complete guide for deploying n8n QA Test Harness to your VPS with automated scheduling.

## Prerequisites

- VPS with root access (n8n.theprofitplatform.com.au)
- SSH key authentication configured
- Node.js 20+ installed on VPS
- n8n instance running on VPS

## Architecture

```
┌─────────────────────────────────────────────┐
│ VPS (n8n.theprofitplatform.com.au)         │
│                                             │
│  ┌───────────────┐    ┌──────────────────┐ │
│  │  n8n Instance │◄───┤  n8n QA Harness  │ │
│  │  Port 5678    │    │  /opt/n8n-qa/    │ │
│  └───────────────┘    └──────────────────┘ │
│                              │              │
│                              │              │
│                       ┌──────▼──────┐       │
│                       │  Systemd    │       │
│                       │  Timer      │       │
│                       │  (Nightly)  │       │
│                       └─────────────┘       │
└─────────────────────────────────────────────┘
```

## Step 1: SSH Key Setup

### Generate SSH Key (if not already done)

```bash
ssh-keygen -t ed25519 -C "n8n-qa@theprofitplatform.com.au"
```

### Copy Public Key to VPS

```bash
ssh-copy-id root@n8n.theprofitplatform.com.au
```

### Test Connection

```bash
ssh root@n8n.theprofitplatform.com.au "echo 'Connection successful'"
```

## Step 2: Install Node.js on VPS

SSH to VPS and install Node.js 20+:

```bash
ssh root@n8n.theprofitplatform.com.au

# Install Node.js via nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node --version  # Should be v20.x.x
```

## Step 3: Configure Deployment

Edit `.env` file:

```bash
# VPS Configuration
VPS_HOST=n8n.theprofitplatform.com.au
VPS_USER=root
VPS_DEPLOY_PATH=/opt/n8n-qa

# n8n Configuration (use localhost if deployed on same VPS)
N8N_API_BASE=http://localhost:5678
N8N_API_TOKEN=your_api_token_here
```

## Step 4: Deploy to VPS

Run deployment script:

```bash
npm run deploy:vps
```

This script will:
1. ✅ Test SSH connection
2. 📁 Create deployment directory on VPS
3. 📤 Copy source files to VPS
4. 🔐 Copy .env file (with secrets)
5. 📦 Install npm dependencies on VPS
6. ⚙️  Create systemd service
7. ⏰ Create systemd timer for nightly runs
8. 🧪 Run initial smoke test

## Step 5: Verify Deployment

### Check Timer Status

```bash
ssh root@n8n.theprofitplatform.com.au "systemctl status n8n-qa.timer"
```

Expected output:
```
● n8n-qa.timer - n8n QA Test Suite Timer
   Loaded: loaded (/etc/systemd/system/n8n-qa.timer; enabled)
   Active: active (waiting)
```

### View Next Scheduled Run

```bash
ssh root@n8n.theprofitplatform.com.au "systemctl list-timers n8n-qa.timer"
```

### Check Test Logs

```bash
ssh root@n8n.theprofitplatform.com.au "tail -f /opt/n8n-qa/logs/test.log"
```

## Step 6: Manual Test Execution

Run tests manually on VPS:

```bash
# SSH to VPS
ssh root@n8n.theprofitplatform.com.au

# Navigate to deployment directory
cd /opt/n8n-qa

# Run all tests
npm test

# Run specific test types
npm run test:smoke
npm run test:contract

# Generate report
npm run report
cat docs/TEST-REPORT.md
```

## Systemd Service Management

### Start/Stop Timer

```bash
# Enable and start timer
sudo systemctl enable n8n-qa.timer
sudo systemctl start n8n-qa.timer

# Stop timer
sudo systemctl stop n8n-qa.timer

# Disable timer
sudo systemctl disable n8n-qa.timer
```

### Manual Service Execution

```bash
# Run tests immediately (one-time)
sudo systemctl start n8n-qa.service

# Check service status
sudo systemctl status n8n-qa.service
```

### View Service Logs

```bash
# View systemd logs
sudo journalctl -u n8n-qa.service -f

# View test logs
tail -f /opt/n8n-qa/logs/test.log
tail -f /opt/n8n-qa/logs/error.log
```

## Scheduled Execution

By default, tests run:
- **Daily at 2:00 AM UTC**

### Change Schedule

Edit systemd timer:

```bash
ssh root@n8n.theprofitplatform.com.au
sudo nano /etc/systemd/system/n8n-qa.timer
```

Modify `OnCalendar`:

```ini
[Timer]
OnCalendar=daily      # Run daily
OnCalendar=02:00      # At 2 AM
Persistent=true       # Run missed timers on boot
```

Examples:
- Hourly: `OnCalendar=hourly`
- Every 6 hours: `OnCalendar=*-*-* 00,06,12,18:00:00`
- Twice daily: `OnCalendar=*-*-* 02,14:00:00`

Reload systemd:

```bash
sudo systemctl daemon-reload
sudo systemctl restart n8n-qa.timer
```

## Log Rotation

Prevent logs from growing indefinitely:

```bash
ssh root@n8n.theprofitplatform.com.au
sudo nano /etc/logrotate.d/n8n-qa
```

Add:

```
/opt/n8n-qa/logs/*.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
    create 0640 root root
}
```

## Monitoring & Alerts

### Email Notifications

Install `mailutils`:

```bash
sudo apt-get install mailutils
```

Edit systemd service to send email on failure:

```bash
sudo nano /etc/systemd/system/n8n-qa.service
```

Add:

```ini
[Service]
OnFailure=failure-email@%n.service
```

### Slack Notifications (Optional)

Add Slack webhook to `.env`:

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

Modify systemd service to send Slack notification on failure.

## Updating Deployment

To update tests after making changes:

```bash
# On local machine
npm run deploy:vps
```

This redeploys all files and restarts the timer.

## Troubleshooting

### Tests Not Running

1. Check timer is enabled:
   ```bash
   systemctl status n8n-qa.timer
   ```

2. Check for errors in logs:
   ```bash
   journalctl -u n8n-qa.service -n 50
   ```

3. Verify n8n instance is accessible:
   ```bash
   ssh root@n8n.theprofitplatform.com.au "curl -I http://localhost:5678"
   ```

### Permission Errors

Ensure correct ownership:

```bash
ssh root@n8n.theprofitplatform.com.au "chown -R root:root /opt/n8n-qa"
```

### Node.js Not Found

Add Node.js path to systemd service:

```bash
sudo nano /etc/systemd/system/n8n-qa.service
```

Add:

```ini
[Service]
Environment="PATH=/root/.nvm/versions/node/v20.x.x/bin:/usr/bin"
```

## Security Best Practices

1. ✅ Use SSH keys, not passwords
2. ✅ Store .env on VPS with `chmod 600`
3. ✅ Run as non-root user (optional, more secure)
4. ✅ Firewall: only allow SSH (port 22) from trusted IPs
5. ✅ Regular security updates: `apt-get update && apt-get upgrade`

## Resource Monitoring

Check test execution resource usage:

```bash
# CPU/Memory usage
ssh root@n8n.theprofitplatform.com.au "top -bn1 | grep node"

# Disk usage
ssh root@n8n.theprofitplatform.com.au "du -sh /opt/n8n-qa"
```

## Backup

Backup test results and reports:

```bash
ssh root@n8n.theprofitplatform.com.au "tar -czf /tmp/n8n-qa-backup.tar.gz /opt/n8n-qa/logs /opt/n8n-qa/docs"
scp root@n8n.theprofitplatform.com.au:/tmp/n8n-qa-backup.tar.gz ./
```
