# Health Check System - Setup Guide

> **5-minute setup for weekly automation monitoring**

---

## ✅ What You Get

After this setup, you'll automatically receive weekly reports showing:
- ✅ GitHub Actions status (failures detected)
- ✅ Topic queue health (low topics alerts)
- ✅ Website uptime (response time monitoring)
- ✅ Recent blog posts (publishing frequency)
- ✅ VPS status (optional)
- ✅ Git status (uncommitted changes)

**Time to set up**: 5-10 minutes
**Maintenance**: Zero
**Cost**: $0

---

## 🚀 Quick Start

### Step 1: Test the Health Check (30 seconds)

```bash
# Run it now to see what it does
npm run health

# Or directly
./scripts/simple-health-check.sh
```

**Expected output**:
```
════════════════════════════════════════════════════════
  TPP Automation Health Check
  2025-10-19 18:27:16
════════════════════════════════════════════════════════

GitHub Actions
────────────────────────────────────────────────────────
✓ No failures in last 20 runs

Topic Queue
────────────────────────────────────────────────────────
✓ 21 topics pending (healthy)

Website Status
────────────────────────────────────────────────────────
✓ Website responding (HTTP 200)
✓ Cloudflare CDN active

...
```

---

## 📧 Option A: Email Notifications (Recommended)

### For Linux/macOS with `mail` command

**Step 1: Install mail command** (if not already installed)

```bash
# Ubuntu/Debian
sudo apt-get install mailutils

# macOS
# Already installed (uses built-in mail command)
```

**Step 2: Add to crontab**

```bash
# Edit crontab
crontab -e

# Add this line (runs Monday at 9 AM)
0 9 * * 1 cd /mnt/c/Users/abhis/projects/atpp/tpp && ./scripts/simple-health-check.sh | mail -s "TPP Weekly Health Check" your-email@example.com
```

**Schedule options**:
```bash
# Every Monday at 9 AM
0 9 * * 1 cd /path/to/tpp && ./scripts/simple-health-check.sh | mail -s "TPP Health" you@example.com

# Every day at 8 AM
0 8 * * * cd /path/to/tpp && ./scripts/simple-health-check.sh | mail -s "TPP Daily Health" you@example.com

# Twice per week (Monday and Thursday at 9 AM)
0 9 * * 1,4 cd /path/to/tpp && ./scripts/simple-health-check.sh | mail -s "TPP Health" you@example.com
```

### For Windows WSL (Your Setup)

**Option 1: Use GitHub Actions** (easier)

Create `.github/workflows/health-check.yml`:

```yaml
name: Weekly Health Check

on:
  schedule:
    - cron: '0 9 * * 1'  # Monday 9 AM UTC
  workflow_dispatch:      # Manual trigger

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y jq

      - name: Run health check
        run: |
          chmod +x scripts/simple-health-check.sh
          ./scripts/simple-health-check.sh

      - name: Send email on failure
        if: failure()
        run: |
          echo "Health check failed! Check the Actions tab." | \
          mail -s "TPP Health Check Failed" ${{ secrets.NOTIFICATION_EMAIL }}
```

**Option 2: Windows Task Scheduler**

Create `scripts/health-check-email.bat`:
```batch
@echo off
cd C:\Users\abhis\projects\atpp\tpp
bash scripts/simple-health-check.sh > health-report.txt
powershell -Command "Send-MailMessage -To 'you@example.com' -From 'tpp@yourdomain.com' -Subject 'TPP Health Check' -Body (Get-Content health-report.txt -Raw) -SmtpServer 'smtp.gmail.com' -Port 587 -UseSsl -Credential (Get-Credential)"
```

---

## 🔔 Option B: Slack Notifications

### Step 1: Create Slack Webhook

1. Go to https://api.slack.com/apps
2. Create new app or use existing
3. Enable "Incoming Webhooks"
4. Create webhook for your channel
5. Copy webhook URL

### Step 2: Set environment variable

**For current session**:
```bash
export SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**For permanent** (add to `~/.bashrc` or `~/.zshrc`):
```bash
echo 'export SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL' >> ~/.bashrc
source ~/.bashrc
```

### Step 3: Test Slack notification

```bash
# The script will automatically send to Slack if errors are detected
./scripts/simple-health-check.sh
```

**Slack will receive messages only when errors occur**, not for successful checks.

### Step 4: Add to cron (with Slack)

```bash
crontab -e

# Add this line
0 9 * * 1 cd /path/to/tpp && export SLACK_WEBHOOK_URL=https://hooks.slack.com/... && ./scripts/simple-health-check.sh
```

---

## 🌐 Option C: Healthchecks.io Integration (Best!)

**Why Healthchecks.io?**
- ✅ Free for 20 checks
- ✅ Email + Slack + Discord + many more
- ✅ Detects if check doesn't run (silent failures)
- ✅ Beautiful dashboard
- ✅ 30-day history
- ✅ Status badges

### Step 1: Create account

1. Go to https://healthchecks.io
2. Sign up (free)
3. Create new check: "TPP Health Monitor"
4. Set schedule: "Weekly" or "Every 7 days"
5. Copy your ping URL: `https://hc-ping.com/your-uuid-here`

### Step 2: Update health check script

**Create**: `scripts/health-check-with-ping.sh`

```bash
#!/bin/bash

# Your Healthchecks.io ping URL
HEALTHCHECK_URL="https://hc-ping.com/your-uuid-here"

# Ping start
curl -fsS --retry 3 "$HEALTHCHECK_URL/start" > /dev/null

# Run health check
cd /mnt/c/Users/abhis/projects/atpp/tpp
./scripts/simple-health-check.sh

# Capture exit code
EXIT_CODE=$?

# Ping success or failure
if [ $EXIT_CODE -eq 0 ]; then
  curl -fsS --retry 3 "$HEALTHCHECK_URL" > /dev/null
else
  curl -fsS --retry 3 "$HEALTHCHECK_URL/fail" > /dev/null
fi

exit $EXIT_CODE
```

**Make it executable**:
```bash
chmod +x scripts/health-check-with-ping.sh
```

### Step 3: Add to cron

```bash
crontab -e

# Add this line
0 9 * * 1 /mnt/c/Users/abhis/projects/atpp/tpp/scripts/health-check-with-ping.sh
```

### Step 4: Configure alerts in Healthchecks.io

1. Go to check settings
2. Add integrations:
   - Email ✅
   - Slack ✅
   - Discord
   - Telegram
   - etc.

Now you'll get notified if:
- Health check detects errors
- Health check doesn't run (cron failed)
- Check runs but takes too long

---

## 🔧 Option D: VPS Monitoring (Optional)

### Step 1: Set environment variables

**On your local machine**:
```bash
# Add to ~/.bashrc or ~/.zshrc
export VPS_HOST=your.vps.ip.address
export VPS_USER=avi

# Reload
source ~/.bashrc
```

### Step 2: Set up SSH key authentication

```bash
# If you don't have SSH key set up already
ssh-copy-id avi@your.vps.ip.address

# Test connection (should not ask for password)
ssh avi@your.vps.ip.address 'echo ok'
```

### Step 3: Test VPS check

```bash
# Run health check - should now include VPS section
./scripts/simple-health-check.sh
```

**Expected output includes**:
```
VPS Status
────────────────────────────────────────────────────────
✓ VPS reachable (your.vps.ip)
✓ Cron service running
✓ Disk usage: 45%
```

---

## 📊 Combined Setup: All Notifications

**The ultimate setup** (email + Slack + Healthchecks.io):

**Create**: `scripts/health-check-ultimate.sh`

```bash
#!/bin/bash

# Configuration
HEALTHCHECK_URL="https://hc-ping.com/your-uuid"
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
EMAIL_TO="you@example.com"
PROJECT_DIR="/mnt/c/Users/abhis/projects/atpp/tpp"

# Ping start
curl -fsS --retry 3 "$HEALTHCHECK_URL/start" > /dev/null 2>&1

# Run health check and capture output
cd "$PROJECT_DIR"
OUTPUT=$(./scripts/simple-health-check.sh 2>&1)
EXIT_CODE=$?

# Send email report (always)
echo "$OUTPUT" | mail -s "TPP Weekly Health Check" "$EMAIL_TO"

# Send to Slack (only on errors)
if [ $EXIT_CODE -ne 0 ]; then
  ERRORS=$(echo "$OUTPUT" | grep "errors" | head -1)
  curl -X POST "$SLACK_WEBHOOK_URL" \
    -H 'Content-Type: application/json' \
    -d "{\"text\":\"🚨 TPP Health Check Alert\n\`\`\`\n$ERRORS\n\`\`\`\"}" \
    > /dev/null 2>&1
fi

# Ping Healthchecks.io
if [ $EXIT_CODE -eq 0 ]; then
  curl -fsS --retry 3 "$HEALTHCHECK_URL" > /dev/null 2>&1
else
  curl -fsS --retry 3 "$HEALTHCHECK_URL/fail" > /dev/null 2>&1
fi

exit $EXIT_CODE
```

**Make executable and add to cron**:
```bash
chmod +x scripts/health-check-ultimate.sh

crontab -e
# Add: 0 9 * * 1 /path/to/scripts/health-check-ultimate.sh
```

---

## 🧪 Testing Your Setup

### Test 1: Manual run
```bash
npm run health
# Should show green checkmarks for working systems
```

### Test 2: Test with errors
```bash
# Temporarily rename topic queue to trigger error
mv automation/topic-queue.json automation/topic-queue.json.bak

# Run check - should show error
npm run health

# Restore
mv automation/topic-queue.json.bak automation/topic-queue.json
```

### Test 3: Test email
```bash
# Send test email
echo "Test email" | mail -s "Test Subject" you@example.com

# If this works, your email is configured correctly
```

### Test 4: Test Slack
```bash
# Test Slack webhook
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test notification from TPP Health Check"}'

# Check Slack channel for message
```

### Test 5: Test Healthchecks.io
```bash
# Ping your check
curl https://hc-ping.com/your-uuid

# Check Healthchecks.io dashboard - should show green
```

### Test 6: Test cron job
```bash
# Add temporary cron that runs in 2 minutes
crontab -e

# Add this (replace HH:MM with current time + 2 minutes)
32 18 * * * cd /path/to/tpp && ./scripts/simple-health-check.sh > /tmp/health-test.log 2>&1

# Wait 2 minutes, then check
cat /tmp/health-test.log

# Remove test cron after verification
```

---

## 📋 Recommended Setup (For You)

Based on your setup (WSL + VPS + GitHub), I recommend:

### **Primary: Healthchecks.io** (5 min setup)
✅ Free, reliable, detects silent failures
✅ Email notifications included
✅ Easy to add Slack later
✅ Beautiful dashboard

### **Secondary: GitHub Actions** (3 min setup)
✅ Already using GitHub
✅ Runs in cloud (doesn't depend on local machine)
✅ Easy to check in Actions tab
✅ No WSL cron issues

### **Optional: Local cron + Slack** (for immediate alerts)
⚠️ Only if you keep local machine running 24/7

---

## 🎯 Complete Setup Checklist

**5-Minute Setup** (Healthchecks.io):
- [ ] Create Healthchecks.io account
- [ ] Create check "TPP Health Monitor"
- [ ] Copy ping URL
- [ ] Create `health-check-with-ping.sh`
- [ ] Test: `./scripts/health-check-with-ping.sh`
- [ ] Add to crontab (local or VPS)
- [ ] Configure email alerts in Healthchecks.io
- [ ] Done! ✅

**10-Minute Setup** (GitHub Actions):
- [ ] Create `.github/workflows/health-check.yml`
- [ ] Add `NOTIFICATION_EMAIL` to GitHub secrets
- [ ] Trigger workflow manually to test
- [ ] Check email for report
- [ ] Done! ✅

**Advanced Setup** (All three):
- [ ] Set up Healthchecks.io
- [ ] Set up GitHub Actions workflow
- [ ] Set up local cron + Slack
- [ ] Test all three work independently
- [ ] Done! ✅

---

## 🔍 Troubleshooting

### Problem: `mail: command not found`

**Solution**:
```bash
# Install mailutils
sudo apt-get install mailutils

# Or use GitHub Actions instead
```

### Problem: Cron doesn't run

**Solution**:
```bash
# Check cron is running
systemctl status cron

# Check cron logs
grep CRON /var/log/syslog

# Verify crontab
crontab -l

# Use absolute paths in crontab
```

### Problem: Script shows permission denied

**Solution**:
```bash
chmod +x scripts/simple-health-check.sh
chmod +x scripts/health-check-with-ping.sh
```

### Problem: jq or gh command not found

**Solution**:
```bash
# Install jq
sudo apt-get install jq

# Install GitHub CLI
# See: https://cli.github.com/manual/installation
```

### Problem: VPS check fails

**Solution**:
```bash
# Test SSH connection
ssh avi@your.vps.ip 'echo ok'

# If fails, set up SSH key
ssh-copy-id avi@your.vps.ip

# Or skip VPS check by not setting VPS_HOST
```

---

## 📈 What to Monitor

After 1 month, review your health check emails and answer:

1. **How many issues were detected?**
   - 0-1: Simple check is perfect, keep it
   - 2-5: Simple check working well, maybe add more checks
   - 5+: Investigate why so many failures

2. **Were any issues caught that you wouldn't have noticed?**
   - Yes: Health check is valuable ✅
   - No: Consider less frequent checks

3. **Did you take action on the issues found?**
   - Yes: Health check is useful ✅
   - No: Maybe too many false positives

4. **Is weekly frequency right?**
   - Too often: Switch to bi-weekly
   - Not enough: Add daily quick check

---

## 🚀 Next Steps

**After Setup**:
1. Run it for 1 month
2. Review the reports
3. Adjust frequency/notifications as needed
4. If insufficient, consider building the CLI tool (Option 1 from the plan)

**Do NOT build the full dashboard unless**:
- Simple health check has been running for 1+ month
- You've identified specific gaps
- You have concrete data showing need

---

## 📞 Quick Reference

**Run health check**:
```bash
npm run health
# or
npm run status
# or
./scripts/simple-health-check.sh
```

**Check cron jobs**:
```bash
crontab -l
```

**View recent cron executions**:
```bash
grep CRON /var/log/syslog | tail -20
```

**Test email**:
```bash
echo "test" | mail -s "test" you@example.com
```

**Test Slack**:
```bash
curl -X POST $SLACK_WEBHOOK_URL \
  -d '{"text":"test"}'
```

---

**Time to set up**: 5-10 minutes
**Effort saved**: Hours per month
**Peace of mind**: Priceless ✅

Start with Healthchecks.io. It's the easiest and most reliable option.
