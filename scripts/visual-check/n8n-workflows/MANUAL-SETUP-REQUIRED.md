# ⚠️ Manual n8n UI Setup Required

## Current Status

I've successfully:
- ✅ Created the workflow in n8n database (ID: `5c7e5232f7bb4292bafa2b38381055f2`)
- ✅ Fixed ownership and permissions
- ✅ Installed Playwright browsers for root user
- ✅ Disabled old systemd services
- ✅ Created simplified 4-node workflow

## ⚠️ Issue

The workflow cannot start via webhook due to internal n8n validation. This needs to be completed in the n8n UI.

## 📋 Manual Steps (5 minutes)

### Step 1: Login to n8n
```
URL: https://n8n.theprofitplatform.com.au/
```

### Step 2: Create New Workflow

Since the imported workflow has validation issues, create a fresh one:

1. Click "**+ Add workflow**"
2. Name it: "**Visual Monitoring**"

### Step 3: Add Nodes

**Node 1: Webhook Trigger**
- Type: `Webhook`
- HTTP Method: `POST`
- Path: `visual-check`
- Respond: `When Last Node Finishes`

**Node 2: Execute Command**
- Type: `Execute Command`
- Command:
  ```bash
  cd /home/avi/projects/astro-site/scripts/visual-check && npx playwright test --config=playwright.config.js --reporter=json 2>&1
  ```
- Continue On Fail: `true`

**Node 3: Code (Send Email)**
- Type: `Code`
- Mode: `Run Once for All Items`
- JavaScript Code:
  ```javascript
  const nodemailer = require('nodemailer');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'abhishekmaharjan3737@gmail.com',
      pass: 'tmhnofephrxbdaik'
    }
  });

  const testOutput = $node["Execute Command"].json.stdout || 'Tests executed';

  await transporter.sendMail({
    from: 'visual-agent@theprofitplatform.com.au',
    to: 'abhishekmaharjan3737@gmail.com',
    subject: '✅ Visual Monitoring - Tests Complete',
    html: `
      <h2>Visual Quality Check Complete</h2>
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      <h3>Test Output:</h3>
      <pre>${testOutput.substring(0, 1000)}</pre>
    `
  });

  return {
    success: true,
    emailSent: true,
    timestamp: new Date().toISOString()
  };
  ```

**Node 4: Respond to Webhook**
- Type: `Respond to Webhook`
- Respond With: `JSON`
- Response Body: `{{ $json }}`

### Step 4: Connect Nodes

Connect them in sequence:
```
Webhook → Execute Command → Code → Respond to Webhook
```

### Step 5: Save & Activate

1. Click "**Save**" (top right)
2. Toggle "**Active**" switch to ON

### Step 6: Test

Get the webhook URL from the Webhook node and test:
```bash
curl -X POST https://n8n.theprofitplatform.com.au/webhook/visual-check
```

You should receive an email within 60-90 seconds!

---

## 🎯 Alternative: Import & Fix

If you want to use the existing workflow:

1. Go to n8n
2. Find workflow: "Visual Quality Monitoring Agent"
3. Click to open
4. Check for any red error indicators on nodes
5. Fix any validation errors
6. Ensure all nodes are connected properly
7. Save and activate

---

## 📞 Quick Reference

**SMTP Details:**
- Host: `smtp.gmail.com`
- Port: `587`
- User: `abhishekmaharjan3737@gmail.com`
- Password: `tmhnofephrxbdaik`

**Test Command:**
```bash
cd /home/avi/projects/astro-site/scripts/visual-check
npx playwright test --config=playwright.config.js --reporter=json
```

**Workflow Files:**
- Simple workflow JSON: `/tmp/simple-visual-workflow.json`
- Full workflow JSON: `n8n-workflows/visual-agent-workflow.json`

---

## ✅ What's Already Done

- ✅ Playwright installed and working
- ✅ Tests run successfully (37 tests, ~60s duration)
- ✅ n8n service running
- ✅ Permissions fixed
- ✅ Old systemd services disabled

**You just need 5 minutes in the n8n UI to complete the setup!**

---

**Created:** 2025-10-02 02:00 UTC
**Status:** Ready for manual UI completion
