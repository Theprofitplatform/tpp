# Tool Improvement Agent - n8n Quick Start

## ⚡ Quick Installation (3 steps)

### Step 1: Install n8n
```bash
ssh tpp-vps
cd ~/projects/astro-site/n8n-workflows
./install-n8n.sh
```

### Step 2: Access n8n
Open in browser: `http://YOUR_VPS_IP:5678`

Create account when prompted.

### Step 3: Import Workflow

1. In n8n, click **Workflows** (left sidebar)
2. Click **+ Add Workflow** (top right)
3. Click **⋮** (menu) → **Import from File**
4. Select: `tool-improvement-agent-workflow.json`
5. Click **Save**

## 🔐 Gmail Setup (Required)

### Get OAuth Credentials:

1. Go to: https://console.cloud.google.com
2. Create new project: "Tool Agent"
3. Enable **Gmail API**
4. Create **OAuth 2.0 Client ID**:
   - Application type: Web application
   - Authorized redirect URIs: `http://YOUR_VPS_IP:5678/rest/oauth2-credential/callback`
5. Copy **Client ID** and **Client Secret**

### Configure in n8n:

1. In n8n, click **Credentials** → **+ Add Credential**
2. Search "Gmail OAuth2"
3. Paste Client ID and Client Secret
4. Click **Connect my account**
5. Authorize access
6. Save

### Update Workflow:

1. Open imported workflow
2. Click **Send Gmail** node
3. Select your Gmail OAuth2 credential
4. Change recipient email if needed
5. Click **Save**

## ✅ Activate Workflow

1. Open the workflow
2. Toggle **Active** switch (top right)
3. Done! Agent will run every 30 minutes

## 🧪 Test Now

Click **Execute Workflow** button to test immediately.

Check your email!

## 📊 What It Does

Every 30 minutes:
1. ✅ Rotates through 7 tools
2. ✅ Analyzes tool files (.astro)
3. ✅ Calculates completeness & user value scores
4. ✅ Generates improvement suggestions
5. ✅ Sends beautiful HTML email report

## 🎨 Email Features

- **Visual Progress Bars** - Completeness & user value scores
- **Priority Badges** - CRITICAL/HIGH/MEDIUM color-coded
- **API Suggestions** - Specific APIs for each tool type
- **Implementation Steps** - Detailed step-by-step guides
- **ROI Calculations** - Estimated time and return
- **Professional Design** - Gradient headers, clean layout

## 🛠️ Customization

### Change Schedule:
1. Click "Every 30 Minutes" node
2. Modify interval
3. Save

### Add Tools:
1. Click "Rotate Tools" node
2. Edit `tools` array
3. Save

### Customize Email:
1. Click "Generate Email HTML" node
2. Modify HTML template
3. Save

## 📱 Monitoring

View all executions:
- Click **Executions** tab
- See success/failure status
- Debug errors

## 🔧 Troubleshooting

**Workflow not running?**
- Check "Active" toggle is ON
- Verify n8n is running: `pm2 list`

**Email not sending?**
- Test Gmail credential separately
- Check execution log for errors

**No emails received?**
- Check spam folder
- Verify tool files exist
- Some tools may not need improvements (normal)

## 📞 Quick Commands

```bash
# Check n8n status
ssh tpp-vps "pm2 list"

# View n8n logs
ssh tpp-vps "pm2 logs n8n-server"

# Restart n8n
ssh tpp-vps "pm2 restart n8n-server"

# Stop n8n
ssh tpp-vps "pm2 stop n8n-server"
```

## 🎯 Next Steps

1. ✅ Install n8n
2. ✅ Configure Gmail OAuth2
3. ✅ Import workflow
4. ✅ Activate workflow
5. ✅ Receive first email report!

---

**Need help?** Read full guide: `n8n-setup-instructions.md`
