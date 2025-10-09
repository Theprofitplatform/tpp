# VPS Deployment Guide for Facebook Automation

Complete setup instructions for running Facebook automation on your VPS.

## 🚀 Quick Start

### 1. Initial Setup

```bash
# Navigate to your project directory
cd /home/abhi/projects/atpp/tpp

# Run the VPS setup script
chmod +x automation/scripts/vps-setup.sh
./automation/scripts/vps-setup.sh
```

### 2. Configure Environment

Update `.env.local` with your credentials:
```bash
nano .env.local
```

**Required:**
- `ANTHROPIC_API_KEY` (already set)
- `FACEBOOK_DISCORD_WEBHOOK_URL` (already set)

**Optional (for automated posting):**
- `FACEBOOK_PAGE_ID`
- `FACEBOOK_ACCESS_TOKEN`

### 3. Test the System

```bash
# Test manual posting with Discord notifications
./automation/scripts/post-manual.sh conversion-rate-optimization-9-quick-wins-for-sydney-service-businesses
```

### 4. Start Automation

```bash
# Start the Facebook scheduler
./automation/scripts/start-facebook-automation.sh

# Check status
./automation/scripts/check-status.sh
```

## 📋 VPS Scripts Overview

### Core Scripts

| Script | Purpose | Usage |
|--------|---------|--------|
| `vps-setup.sh` | Initial VPS setup | Run once |
| `start-facebook-automation.sh` | Start scheduler | Start automation |
| `stop-facebook-automation.sh` | Stop scheduler | Stop automation |
| `check-status.sh` | Check system status | Monitor health |
| `post-manual.sh` | Manual posting | Generate posts |
| `rotate-logs.sh` | Log rotation | Weekly maintenance |

### Automation Scripts

| Script | Purpose |
|--------|---------|
| `facebook-automation.js` | Main automation orchestrator |
| `facebook-scheduler.js` | Automated scheduling |
| `facebook-discord-notifier.js` | Discord notifications |
| `facebook-generator.js` | Content generation |
| `facebook-poster.js` | Facebook API posting |
| `facebook-analytics.js` | Performance tracking |

## ⏰ Automated Scheduling

### Cron Job Setup

```bash
# Set up cron jobs
chmod +x automation/scripts/cron-setup.sh
./automation/scripts/cron-setup.sh

# Install cron jobs automatically
crontab /tmp/facebook-cron
```

### Default Schedule

- **Scheduler Startup**: On system reboot
- **Log Rotation**: Every Sunday at midnight
- **Health Checks**: Every hour
- **Facebook Posting**:
  - Monday: 09:30 AEST
  - Wednesday: 14:00 AEST
  - Friday: 11:00 AEST

## 🔧 Manual Operations

### Generate Facebook Post

```bash
# Generate post and send Discord notifications
./automation/scripts/post-manual.sh <blog-slug>

# Examples:
./automation/scripts/post-manual.sh conversion-rate-optimization-9-quick-wins-for-sydney-service-businesses
./automation/scripts/post-manual.sh 15-free-seo-tools-every-sydney-small-business-should-use-in-2025
```

### Check System Status

```bash
# Check if automation is running
./automation/scripts/check-status.sh

# Check Facebook automation status
node automation/scripts/facebook-automation.js --status

# Check scheduler status
node automation/scripts/facebook-scheduler.js status
```

### Start/Stop Automation

```bash
# Start automation
./automation/scripts/start-facebook-automation.sh

# Stop automation
./automation/scripts/stop-facebook-automation.sh

# Force immediate check
node automation/scripts/facebook-scheduler.js force
```

## 📊 Monitoring & Logs

### Log Files

- `automation/logs/scheduler.log` - Scheduler activity
- `automation/logs/automation.log` - Automation logs
- `automation/logs/health-check.log` - Health check logs

### View Logs

```bash
# View recent scheduler logs
tail -f automation/logs/scheduler.log

# View specific number of lines
tail -50 automation/logs/scheduler.log

# Search for errors
grep -i error automation/logs/scheduler.log
```

### Discord Notifications

The system will send two Discord messages for each post:
1. **Facebook post content** - Ready for manual posting
2. **Image generation prompt** - For creating the perfect image

## 🛠️ Troubleshooting

### Common Issues

**Scheduler not starting:**
```bash
# Check if process is running
ps aux | grep facebook-scheduler

# Check PID file
cat automation/logs/scheduler.pid

# Restart scheduler
./automation/scripts/stop-facebook-automation.sh
./automation/scripts/start-facebook-automation.sh
```

**No Discord notifications:**
- Check `DISCORD_WEBHOOK_URL` in `.env.local`
- Verify webhook URL is correct
- Check scheduler logs for errors

**Content generation failing:**
- Verify `ANTHROPIC_API_KEY` in `.env.local`
- Check Claude API quota
- Review automation logs

### Performance Monitoring

```bash
# Check system resources
top
htop

# Check disk space
df -h

# Check memory usage
free -h
```

## 🔒 Security Considerations

### File Permissions

```bash
# Secure environment file
chmod 600 .env.local

# Secure automation directories
chmod 700 automation/scripts/
chmod 600 automation/data/*.json
```

### API Security

- Facebook API tokens stored in `.env.local`
- Claude API key secured
- Discord webhook URL for notifications only

## 📈 Scaling & Maintenance

### Regular Maintenance

```bash
# Rotate logs manually
./automation/scripts/rotate-logs.sh

# Check disk usage
du -sh automation/logs/

# Clean old log files
find automation/logs/ -name "*.log" -mtime +30 -delete
```

### Monitoring Automation

```bash
# Set up monitoring script
cat > /home/abhi/monitor-facebook.sh << 'EOF'
#!/bin/bash
PROJECT_DIR="/home/abhi/projects/atpp/tpp"
LOG_FILE="$PROJECT_DIR/automation/logs/health-check.log"

cd "$PROJECT_DIR"

# Check if scheduler is running
if [ ! -f "automation/logs/scheduler.pid" ]; then
    echo "$(date): Scheduler not running - restarting" >> "$LOG_FILE"
    ./automation/scripts/start-facebook-automation.sh
fi
EOF

chmod +x /home/abhi/monitor-facebook.sh

# Add to crontab for hourly checks
# 0 * * * * /home/abhi/monitor-facebook.sh
```

## 🎯 Production Checklist

- [ ] VPS setup script run successfully
- [ ] Environment variables configured
- [ ] Manual posting tested
- [ ] Discord notifications working
- [ ] Scheduler started successfully
- [ ] Cron jobs installed
- [ ] Log rotation configured
- [ ] Security permissions set
- [ ] Monitoring in place

## 📞 Support

For issues with VPS deployment:

1. Check logs: `tail -f automation/logs/scheduler.log`
2. Verify environment: `cat .env.local`
3. Test manually: `./automation/scripts/post-manual.sh <blog-slug>`
4. Check status: `./automation/scripts/check-status.sh`

The system is designed to be resilient and will automatically recover from most issues. Discord notifications will alert you to any problems that require manual intervention.