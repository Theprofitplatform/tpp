# n8n Visual Agent Deployment Guide

## 🚀 Complete Migration from Systemd to n8n

This guide covers the complete migration of your Playwright-based visual monitoring agent from systemd to n8n.

---

## 📋 Prerequisites

1. **n8n Instance Running**
   - Access to n8n at https://n8n.theprofitplatform.com.au/
   - Admin credentials

2. **Server Access**
   - SSH access to VPS (31.97.222.218)
   - Node.js and Playwright installed
   - Existing visual-check directory

3. **SMTP Credentials**
   - Gmail account: abhishekmaharjan3737@gmail.com
   - App password: tmhnofephrxbdaik

---

## 🎯 Deployment Steps

### Step 1: Import Workflow to n8n

1. **Login to n8n**
   ```bash
   # Open in browser
   https://n8n.theprofitplatform.com.au/
   ```

2. **Import Workflow**
   - Click "Workflows" → "Add Workflow" → "Import from File"
   - Upload: `/home/avi/projects/astro-site/scripts/visual-check/n8n-workflows/visual-agent-workflow.json`
   - Click "Import"

3. **Configure SMTP Credentials**
   - Go to "Settings" → "Credentials"
   - Click "Add Credential" → "SMTP"
   - Name: `Gmail SMTP`
   - Fill in:
     ```
     Host: smtp.gmail.com
     Port: 587
     User: abhishekmaharjan3737@gmail.com
     Password: tmhnofephrxbdaik
     Secure: false (TLS)
     ```
   - Save credential

4. **Update Email Nodes**
   - Open "Send Email Notification" node
   - Select credential: "Gmail SMTP"
   - Repeat for "Send Error Notification" node

### Step 2: Test the Workflow

1. **Manual Test Run**
   - Click "Execute Workflow" button
   - Monitor execution in real-time
   - Check for any errors

2. **Webhook Test**
   ```bash
   # Get webhook URL from n8n
   WEBHOOK_URL="https://n8n.theprofitplatform.com.au/webhook/visual-agent-webhook"

   # Trigger via curl
   curl -X POST $WEBHOOK_URL
   ```

3. **Verify Outputs**
   - Check email received
   - Verify screenshots in: `/home/avi/projects/astro-site/scripts/visual-check/screenshots/`
   - Verify summary updated: `/home/avi/projects/astro-site/scripts/visual-check/logs/summary.json`

### Step 3: Activate Schedule Trigger

1. **Enable Workflow**
   - Toggle "Active" switch to ON
   - Schedule will run every 15 minutes

2. **Verify Schedule**
   - Check "Executions" tab
   - Wait for next scheduled run (max 15 minutes)
   - Confirm automatic execution

### Step 4: Disable Old Systemd Services

```bash
# Stop and disable old systemd timer
sudo systemctl stop visual-agent-playwright.timer
sudo systemctl disable visual-agent-playwright.timer

# Stop and disable old systemd service
sudo systemctl stop visual-agent-playwright.service
sudo systemctl disable visual-agent-playwright.service

# Verify they're stopped
sudo systemctl status visual-agent-playwright.timer
sudo systemctl status visual-agent-playwright.service
```

### Step 5: Cleanup (Optional)

```bash
# Backup old systemd files
mkdir -p ~/backups/systemd-visual-agent
cp scripts/visual-check/*.service ~/backups/systemd-visual-agent/
cp scripts/visual-check/*.timer ~/backups/systemd-visual-agent/

# Remove systemd files from system
sudo rm /etc/systemd/system/visual-agent-playwright.service
sudo rm /etc/systemd/system/visual-agent-playwright.timer
sudo systemctl daemon-reload
```

---

## 🔧 Workflow Architecture

### Node Flow

```
1. Schedule Trigger (Every 15 min) ─┐
2. Manual Webhook Trigger ──────────┴─→ Run Playwright Tests
                                        ↓
                                   Check Test Success
                                   ↓              ↓
                              [SUCCESS]      [FAILURE]
                                   ↓              ↓
                        Read Test Results    Handle Error
                                   ↓              ↓
                        Parse Test Results   Error Email
                                   ↓              ↓
                        Read Summary      Webhook Error Response
                                   ↓
                        Update Summary
                                   ↓
                        Save Summary JSON
                                   ↓
                        Generate HTML Report
                                   ↓
                        Send Email Notification
                                   ↓
                        Webhook Success Response

                        (Parallel Branch)
                        Prepare Page List
                                   ↓
                        Loop Through Pages
                                   ↓
                        Capture Screenshots
```

### Key Features

1. **Dual Triggers**
   - Schedule: Runs every 15 minutes automatically
   - Webhook: Manual on-demand execution

2. **Error Handling**
   - Failed tests trigger error notification
   - Detailed error emails with stack traces
   - Webhook returns appropriate HTTP codes

3. **Screenshot Capture**
   - Desktop (1920x1080) and Mobile (375x812)
   - Full page and viewport captures
   - Organized by timestamp and page name

4. **Trend Analysis**
   - Compares with previous runs
   - Calculates delta (improved/degraded/unchanged)
   - Maintains last 100 runs in summary

5. **Beautiful Email Reports**
   - HTML formatted with modern design
   - Status badges and emoji indicators
   - Detailed failure breakdown
   - Trend statistics

---

## 🎨 Customization Options

### Change Schedule Frequency

1. Edit "Schedule Every 15 Minutes" node
2. Modify interval:
   - Every 5 minutes: `*/5 * * * *`
   - Every hour: `0 * * * *`
   - Every day at 9 AM: `0 9 * * *`

### Add More Pages

1. Edit "Prepare Page List" node (Code node)
2. Add pages to array:
   ```javascript
   const pages = [
     { path: '/', name: 'home' },
     { path: '/about', name: 'about' },
     { path: '/new-page', name: 'new-page' }, // Add here
   ];
   ```

### Change Email Recipients

1. Edit "Send Email Notification" node
2. Modify `toEmail` field:
   ```
   Single: user@example.com
   Multiple: user1@example.com, user2@example.com
   ```

### Add Slack Notifications

1. Add "Slack" node after "Generate HTML Email Report"
2. Configure:
   - Webhook URL: Your Slack webhook
   - Channel: #visual-monitoring
   - Message: Use report data

### Add Database Storage

1. Add database node (PostgreSQL/MySQL/MongoDB)
2. Insert after "Update Summary Data"
3. Store:
   - Run ID
   - Timestamp
   - Test stats
   - Failure details

---

## 🔍 Monitoring & Debugging

### View Execution History

1. Go to "Executions" tab in n8n
2. Filter by workflow name
3. Click any execution to see:
   - Input/output of each node
   - Execution time
   - Error messages

### Check Logs

```bash
# n8n logs (if running as systemd service)
sudo journalctl -u n8n -f

# Visual agent logs (created by workflow)
tail -f /var/log/visual-agent.log
```

### Debug Failed Executions

1. Click failed execution in n8n
2. Identify failed node (red highlight)
3. View error in node output
4. Fix issue in workflow
5. Re-execute from that point

### Common Issues

**Issue: "Command not found: npx"**
```bash
# Fix: Install Node.js globally or use full path
which npx  # Should return /usr/bin/npx or similar
```

**Issue: "Permission denied: /home/avi/..."**
```bash
# Fix: Ensure n8n user has access
sudo chown -R n8n:n8n /home/avi/projects/astro-site/scripts/visual-check
```

**Issue: "SMTP authentication failed"**
```
1. Verify Gmail app password is correct
2. Enable "Less secure app access" if needed
3. Check SMTP credentials in n8n
```

**Issue: "Playwright not found"**
```bash
# Fix: Install Playwright in workflow directory
cd /home/avi/projects/astro-site/scripts/visual-check
npm install @playwright/test
npx playwright install chromium
```

---

## 📊 Webhook API

### Manual Trigger Endpoint

```bash
# Trigger visual check manually
curl -X POST https://n8n.theprofitplatform.com.au/webhook/visual-agent-webhook

# Response (success)
{
  "success": true,
  "message": "Visual quality check completed",
  "timestamp": "2025-10-01T10:30:00.000Z",
  "stats": {
    "total": 37,
    "passed": 35,
    "failed": 2,
    "duration": 45000
  }
}

# Response (failure)
{
  "error": true,
  "message": "Test execution failed",
  "timestamp": "2025-10-01T10:30:00.000Z",
  "details": "..."
}
```

### Integration Examples

**GitHub Actions**
```yaml
name: Trigger Visual Check
on:
  push:
    branches: [main]
jobs:
  visual-check:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger n8n Workflow
        run: |
          curl -X POST https://n8n.theprofitplatform.com.au/webhook/visual-agent-webhook
```

**Cron Job (Fallback)**
```bash
# Add to crontab
*/15 * * * * curl -X POST https://n8n.theprofitplatform.com.au/webhook/visual-agent-webhook
```

---

## 🚀 Advanced Features

### Add Visual Regression Detection

1. Install pixelmatch:
   ```bash
   cd /home/avi/projects/astro-site/scripts/visual-check
   npm install pixelmatch
   ```

2. Add "Visual Diff" node:
   ```javascript
   const { compare } = require('pixelmatch');
   const fs = require('fs');
   const PNG = require('pngjs').PNG;

   // Compare current vs previous screenshots
   // Return diff percentage
   ```

### Add Performance Metrics

1. Add "HTTP Request" node
2. Configure to call Lighthouse API
3. Parse performance scores
4. Include in email report

### Add Multi-Browser Support

1. Modify "Run Playwright Tests" node
2. Add browser parameter:
   ```bash
   npx playwright test --project=chromium,firefox,webkit
   ```

3. Update result parser for multiple browsers

---

## 🔐 Security Considerations

1. **Protect Webhook URL**
   - Add authentication token
   - Use HTTPS only
   - Rate limit requests

2. **Secure SMTP Credentials**
   - Use n8n credential encryption
   - Rotate passwords regularly
   - Use app-specific passwords

3. **File Permissions**
   ```bash
   # Restrict access to sensitive files
   chmod 600 /home/avi/projects/astro-site/scripts/visual-check/config/production.json
   chown n8n:n8n /home/avi/projects/astro-site/scripts/visual-check/logs/
   ```

---

## 📈 Performance Optimization

1. **Parallel Screenshot Capture**
   - Already implemented with Split in Batches
   - Adjust batch size for faster processing

2. **Reduce Test Timeout**
   - Edit playwright.config.js
   - Lower timeout for faster failures

3. **Cache Test Results**
   - Add Redis cache node
   - Store results for quick retrieval

4. **Compress Screenshots**
   - Add image optimization node
   - Reduce storage usage

---

## 🎯 Next Steps

1. ✅ Import workflow to n8n
2. ✅ Configure SMTP credentials
3. ✅ Test manual execution
4. ✅ Enable schedule trigger
5. ✅ Disable old systemd services
6. 📊 Monitor first few runs
7. 🔧 Customize as needed
8. 🚀 Expand with additional features

---

## 📞 Support

**Issues or Questions?**
- Check n8n community: https://community.n8n.io/
- Review n8n docs: https://docs.n8n.io/
- Visual agent logs: `/var/log/visual-agent.log`

**Workflow File Location**
- Main workflow: `/home/avi/projects/astro-site/scripts/visual-check/n8n-workflows/visual-agent-workflow.json`
- This guide: `/home/avi/projects/astro-site/scripts/visual-check/n8n-workflows/deployment-guide.md`

---

**🎉 Migration Complete!**

Your visual monitoring agent is now running on n8n with:
- ✅ Automatic scheduling (every 15 minutes)
- ✅ Manual webhook triggers
- ✅ Beautiful email reports
- ✅ Error handling and notifications
- ✅ Screenshot capture (desktop & mobile)
- ✅ Trend analysis and tracking
