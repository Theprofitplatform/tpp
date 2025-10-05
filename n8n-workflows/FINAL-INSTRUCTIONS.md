# 🎯 FINAL STEP - Import & Activate (2 Minutes)

## ✅ Everything is Ready!

The workflow file is prepared and n8n is running. You just need to import it through the UI.

---

## 🚀 Quick Import (3 Clicks)

### 1. Open n8n
**Go to:** https://n8n.theprofitplatform.com.au

### 2. Import Workflow

Click: **Workflows** → **Import from File** → **Import from URL**

Or manually:
1. Click **"Workflows"** (left sidebar)
2. Click **"+"** button (top right)
3. Click **"⋮"** menu → **"Import from File"**
4. Select: `/home/avi/projects/astro-site/n8n-workflows/tool-improvement-agent-workflow.json`

OR copy/paste this path in file picker:
```
/home/avi/projects/astro-site/n8n-workflows/tool-improvement-agent-workflow.json
```

### 3. Configure Gmail (First Time Only)

After importing:

1. Click the **"Send Gmail"** node (purple)
2. Create **Gmail OAuth2** credential:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Create OAuth client ID (Web application)
   - Redirect URI: `https://n8n.theprofitplatform.com.au/rest/oauth2-credential/callback`
   - Copy Client ID & Secret
3. Paste credentials in n8n
4. Click **"Connect my account"** and authorize

### 4. Activate

Toggle **"Active"** switch (top right)

**DONE!** 🎉

---

## 📧 What Happens Next

- Every 30 minutes: Analyzes one SEO tool
- Sends email report to: `abhishekmaharjan3737@gmail.com`
- Rotates through all 7 tools automatically
- Provides actionable improvement suggestions

---

## 🧪 Test Now (Optional)

Click **"Execute Workflow"** button to test immediately.

Check your email!

---

## 📁 Alternative: Use Existing Workflow File

The workflow JSON is already in your n8n directory:

```bash
/srv/data/n8n/.n8n/workflows/tool-improvement-agent-workflow.json
```

n8n may auto-load it on next restart, or you can import it via UI.

---

## ⚡ One-Line Import Command (If Browser Access Available)

If you can access the VPS desktop:

```bash
xdg-open "https://n8n.theprofitplatform.com.au/workflows"
```

Then just drag and drop the JSON file into n8n.

---

## 🎯 You're Here:

- [x] n8n installed ✅
- [x] Workflow file ready ✅
- [x] n8n service running ✅
- [ ] **Import workflow via UI** ← YOU ARE HERE
- [ ] Configure Gmail OAuth2
- [ ] Activate workflow

**Estimated time: 2 minutes**

---

## 🆘 Can't Access UI?

Run this to open n8n from VPS:

```bash
xdg-open https://n8n.theprofitplatform.com.au
```

Or access from any browser:
```
https://n8n.theprofitplatform.com.au
```

---

**The automation is DONE. Just import the file in the n8n UI and you're set!**

🚀 **GO:** https://n8n.theprofitplatform.com.au/workflows
