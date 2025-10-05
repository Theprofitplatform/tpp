# n8n Visual Agent Workflow

Complete n8n workflow conversion of the Playwright-based visual monitoring agent.

## 📁 Files

- **visual-agent-workflow.json** - Main n8n workflow (import this)
- **deployment-guide.md** - Complete deployment documentation
- **QUICK-START.md** - 5-minute quick start guide
- **webhook-examples.sh** - Webhook integration examples
- **README.md** - This file

## ⚡ Quick Start

```bash
# 1. Import workflow to n8n
https://n8n.theprofitplatform.com.au/
Workflows → Import → visual-agent-workflow.json

# 2. Configure SMTP credentials
Settings → Credentials → Gmail SMTP

# 3. Test the workflow
Execute Workflow (or use webhook)

# 4. Activate schedule trigger
Toggle "Active" switch
```

## 🎯 Features

✅ **Automated Monitoring**
- Runs every 15 minutes
- 37 critical tests across 8 pages
- Desktop & mobile screenshots
- Email notifications with HTML reports

✅ **Error Handling**
- Failed tests trigger error emails
- Detailed error context
- Automatic retry on network issues

✅ **Trend Analysis**
- Compares with previous runs
- Status: improved/degraded/unchanged
- Delta calculations
- Historical data (last 100 runs)

✅ **Dual Triggers**
- Schedule: Every 15 minutes
- Webhook: On-demand execution

## 📊 What Gets Monitored

**Pages (8)**
- Home, About, Services, Blog, Contact, Privacy, Terms, Cookies

**Tests (37)**
- HTTP status codes (200 OK)
- Critical HTML elements (&lt;main&gt;, &lt;h1&gt;)
- CSS file loading (10 files)
- JavaScript file loading (3 files)

**Screenshots**
- Desktop (1920x1080)
- Mobile (375x812)
- Viewport + Full page captures

## 🔗 Webhook API

```bash
# Trigger manually
curl -X POST https://n8n.theprofitplatform.com.au/webhook/visual-agent-webhook

# Response
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
```

## 📚 Documentation

| File | Purpose |
|------|---------|
| deployment-guide.md | Complete setup instructions |
| QUICK-START.md | 5-minute quick start |
| webhook-examples.sh | Integration examples |

## 🚀 Migration from Systemd

**Before (Systemd)**
```bash
sudo systemctl start visual-agent-playwright
journalctl -u visual-agent-playwright -f
```

**After (n8n)**
```bash
curl -X POST https://n8n.theprofitplatform.com.au/webhook/visual-agent-webhook
# View executions in n8n UI
```

## 🎨 Customization

**Change Schedule**
```javascript
// Edit "Schedule Every 15 Minutes" node
interval: "*/15 * * * *"  // Every 15 minutes
interval: "0 9 * * *"     // Daily at 9 AM
```

**Add Pages**
```javascript
// Edit "Prepare Page List" node
const pages = [
  { path: '/', name: 'home' },
  { path: '/new-page', name: 'new-page' }  // Add here
];
```

**Change Recipients**
```javascript
// Edit "Send Email Notification" node
toEmail: "user@example.com, user2@example.com"
```

## 🔧 Troubleshooting

**Workflow not running?**
- Check workflow is Active
- Verify n8n service status: `sudo systemctl status n8n`

**Email not sending?**
- Check SMTP credentials in n8n
- Test email: `node test-email.js`

**Screenshots failing?**
- Check directory permissions
- Install Playwright: `npx playwright install chromium`

## 📞 Support

- n8n Community: https://community.n8n.io/
- n8n Docs: https://docs.n8n.io/
- Workflow Directory: `/home/avi/projects/astro-site/scripts/visual-check/n8n-workflows/`

## 🎯 Next Steps

1. Import workflow to n8n
2. Test manual execution
3. Activate schedule trigger
4. Monitor first few runs
5. Customize as needed
6. Expand with additional features

---

**🎉 Happy Monitoring!**

Your visual agent is now powered by n8n with automated scheduling, beautiful reports, and easy webhook integration.
