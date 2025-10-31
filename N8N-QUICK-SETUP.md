# 🚀 n8n GMB Automation - EASIEST Setup (10 Minutes)

**The simplest possible way to get 100% automated GMB posting**

---

## ⚡ 5 Steps to Complete Automation

### **Step 1: Import Workflow** (2 minutes)

```bash
# 1. Open your n8n in browser
http://your-vps-ip:5678

# 2. Click "Workflows" (top left)

# 3. Click "+" → "Import from File"

# 4. Drag and drop this file:
n8n-gmb-workflow.json

# 5. Click "Import"
```

**✅ Done!** Workflow is now in n8n.

---

### **Step 2: Connect Google** (3 minutes)

**In the imported workflow:**

```bash
# 1. Click the "Create GMB Post" node (purple box)

# 2. Under "Credential", click "Select Credential"

# 3. Click "Create New"

# 4. A popup opens → Click "Sign in with Google"

# 5. Login with your Google account that has GMB access

# 6. Click "Allow" to grant permissions

# 7. Click "Save"
```

**✅ Done!** Google is connected.

---

### **Step 3: Get Webhook URL** (1 minute)

```bash
# 1. Click the "Webhook" node (first node, gray box)

# 2. Look at the settings panel on right side

# 3. Find "Production URL" (looks like):
   http://your-vps.com:5678/webhook/gmb-posts

# 4. Click the copy icon 📋 next to it

# 5. Save it somewhere - you'll need it!
```

**✅ Done!** You have your webhook URL.

---

### **Step 4: Activate Workflow** (30 seconds)

```bash
# At the top right of n8n:

# 1. Toggle the switch to "Active" ✅

# 2. You'll see "Active" in green

# 3. That's it!
```

**✅ Done!** Workflow is active and listening.

---

### **Step 5: Test It!** (3 minutes)

**On your local machine (WSL):**

```bash
# 1. Set your webhook URL:
export N8N_WEBHOOK_URL=http://your-vps-ip:5678/webhook/gmb-posts

# 2. Send test post:
npm run automation:gmb-test-n8n

# 3. Watch the output - should see "✅ Posts sent successfully"

# 4. Check n8n:
#    - Go to "Executions" tab
#    - You'll see a green checkmark ✅
#    - Click it to see the execution

# 5. Check GMB in 1-2 minutes:
#    - Your test post should appear!
```

**✅ Done!** It works!

---

## 🎉 You're Done!

Your automation is now **100% set up and working!**

---

## 🔗 Connect to GitHub Actions (Optional - 5 minutes)

**Make it fully automatic every Sunday:**

```bash
# 1. Go to GitHub repo: https://github.com/YOUR_USERNAME/tpp

# 2. Settings → Secrets and variables → Actions

# 3. Click "New repository secret"

# 4. Fill in:
#    Name: N8N_WEBHOOK_URL
#    Value: http://your-vps-ip:5678/webhook/gmb-posts

# 5. Click "Add secret"
```

**That's it!** Now every Sunday:
- GitHub generates 12 posts
- Sends them to n8n automatically
- n8n posts them to GMB on schedule
- **You do nothing!**

---

## 📋 Send Your Real Posts

```bash
# Send your 12 existing posts to n8n:
npm run automation:gmb-send-n8n automation/generated/gbp-posts/gbp-posts-2025-10-21.json

# n8n will schedule and post them automatically!
```

---

## 🆘 Troubleshooting

### **"Can't access n8n"**
```bash
# Check if n8n is running:
curl http://your-vps-ip:5678/healthz

# If not, start it:
docker start n8n
# or
npm start  # (depending on how you installed it)
```

### **"Google authentication failed"**
```bash
# In n8n:
# 1. Click "Create GMB Post" node
# 2. Click your credential
# 3. Click "Reconnect"
# 4. Login again
```

### **"Webhook not working"**
```bash
# Test webhook directly:
curl -X POST http://your-vps-ip:5678/webhook/gmb-posts \
  -H "Content-Type: application/json" \
  -d '[{"content":"test"}]'

# Should get response:
# {"status":"success","message":"Received 1 posts"}
```

---

## 🎯 What Happens Next

**Your automated flow:**

```
Every Sunday 6pm:
└─ GitHub Actions generates 12 posts
└─ Sends to n8n webhook
└─ n8n receives them

n8n then:
└─ Schedules each post
└─ Waits for the scheduled time
└─ Posts to GMB automatically
└─ Logs the result

You do: NOTHING! 🎊
```

---

## ✅ Quick Commands

```bash
# Test n8n connection
npm run automation:gmb-test-n8n

# Send your 12 posts
npm run automation:gmb-send-n8n

# Generate new posts (happens automatically on Sunday)
npm run automation:gbp-posts
```

---

## 💡 Tips

**Check n8n executions regularly:**
- Go to n8n → Executions tab
- See all posts that were processed
- Check for any errors

**Your webhook URL:**
- Save it somewhere safe
- You'll need it for GitHub secrets
- Format: `http://your-vps-ip:5678/webhook/gmb-posts`

**If something breaks:**
- Check n8n is running
- Check workflow is "Active"
- Check Google credentials are valid
- Check webhook URL is correct

---

## 🎉 That's It!

**Total time:** 10 minutes
**Cost:** $0/month forever
**Automation:** 100%
**Maintenance:** Zero

You now have the same automation as Otto SEO ($99/mo) and GoHighLevel ($97/mo) - **completely free!**

---

**Questions?** Ask me anything specific and I'll help! 🚀
