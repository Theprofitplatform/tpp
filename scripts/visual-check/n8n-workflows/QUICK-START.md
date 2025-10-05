# n8n Visual Agent - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Import Workflow (2 minutes)

```bash
# Login to n8n
https://n8n.theprofitplatform.com.au/

# Import workflow file
Workflows → Import from File → visual-agent-workflow.json
```

### 2. Configure SMTP (1 minute)

```
Settings → Credentials → Add Credential → SMTP

Name: Gmail SMTP
Host: smtp.gmail.com
Port: 587
User: abhishekmaharjan3737@gmail.com
Password: tmhnofephrxbdaik
Secure: false (TLS)
```

### 3. Test Workflow (1 minute)

```bash
# Click "Execute Workflow" button in n8n
# Or trigger via webhook:
curl -X POST https://n8n.theprofitplatform.com.au/webhook/visual-agent-webhook
```

### 4. Activate Schedule (1 minute)

```bash
# Toggle "Active" switch to ON in n8n
# Workflow will now run every 15 minutes automatically
```

---

## 🔧 Quick Commands

### Trigger Manual Run
```bash
curl -X POST https://n8n.theprofitplatform.com.au/webhook/visual-agent-webhook
```

### Check Last Run
```bash
cat /home/avi/projects/astro-site/scripts/visual-check/logs/summary.json | jq '.[-1]'
```

### View Screenshots
```bash
ls -lh /home/avi/projects/astro-site/scripts/visual-check/screenshots/ | tail -5
```

### Check n8n Status
```bash
sudo systemctl status n8n
```

---

## 📊 What Gets Monitored

✅ **8 Pages**
- Home, About, Services, Blog, Contact, Privacy, Terms, Cookies

✅ **37 Tests**
- HTTP status codes (200 OK)
- Critical HTML elements (&lt;main&gt;, &lt;h1&gt;)
- CSS file loading (10 files)
- JavaScript file loading (3 files)

✅ **Screenshots**
- Desktop (1920x1080) + Mobile (375x812)
- Viewport + Full page
- Organized by timestamp

✅ **Email Reports**
- HTML formatted
- Trend analysis (improved/degraded/unchanged)
- Test failure details
- Delta from previous run

---

## 🎯 Key Differences from Systemd

| Feature | Systemd | n8n |
|---------|---------|-----|
| **Scheduling** | systemd timer | n8n schedule trigger |
| **Manual trigger** | `sudo systemctl start` | Webhook URL |
| **Monitoring** | journalctl logs | n8n executions UI |
| **Configuration** | .service files | Visual workflow editor |
| **Notifications** | Node script | Built-in email node |
| **Debugging** | Log files | Visual execution flow |

---

## 🚨 Troubleshooting

**Workflow not executing?**
```bash
# Check if workflow is active
# Toggle "Active" switch in n8n

# Check n8n service
sudo systemctl status n8n
```

**Email not sending?**
```bash
# Verify SMTP credentials in n8n
Settings → Credentials → Gmail SMTP

# Test SMTP manually
node /home/avi/projects/astro-site/scripts/visual-check/test-email.js
```

**Screenshots not saving?**
```bash
# Check directory permissions
ls -la /home/avi/projects/astro-site/scripts/visual-check/screenshots/

# Ensure n8n user has write access
sudo chown -R n8n:n8n /home/avi/projects/astro-site/scripts/visual-check/
```

**Playwright tests failing?**
```bash
# Run tests manually to see error
cd /home/avi/projects/astro-site/scripts/visual-check
npx playwright test --config=playwright.config.js

# Reinstall Playwright browsers
npx playwright install chromium
```

---

## 📈 Next Steps

1. ✅ Test workflow runs successfully
2. ✅ Verify email received
3. ✅ Check screenshots generated
4. ✅ Activate schedule trigger
5. 🔧 Customize pages/frequency as needed
6. 🚀 Add advanced features (Slack, database, etc.)

---

## 📞 Quick Reference

**n8n Dashboard**
```
https://n8n.theprofitplatform.com.au/
```

**Webhook URL**
```
https://n8n.theprofitplatform.com.au/webhook/visual-agent-webhook
```

**Workflow Files**
```
/home/avi/projects/astro-site/scripts/visual-check/n8n-workflows/
├── visual-agent-workflow.json      (Import this)
├── deployment-guide.md             (Full documentation)
└── QUICK-START.md                  (This file)
```

**Key Directories**
```
Screenshots: /home/avi/projects/astro-site/scripts/visual-check/screenshots/
Logs:        /home/avi/projects/astro-site/scripts/visual-check/logs/summary.json
Tests:       /home/avi/projects/astro-site/scripts/visual-check/tests/
```

---

🎉 **You're all set!** Your visual monitoring agent is now running on n8n.
