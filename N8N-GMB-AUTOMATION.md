# 🚀 n8n GMB Automation - Self-Hosted (100% FREE!)

**You already have n8n self-hosted? PERFECT!** This is the best solution!

---

## 🏆 Why n8n Self-Hosted is THE BEST

| Feature | n8n Self-Hosted | Make.com | Otto SEO | GHL |
|---------|-----------------|----------|----------|-----|
| **Cost** | **$0/mo** | $0 (limited) | $99/mo | $97/mo |
| **Operations** | **Unlimited** | 1,000/mo | Unlimited | Unlimited |
| **Data Privacy** | **Your server** | Their cloud | Their cloud | Their cloud |
| **Customization** | **Full control** | Limited | Limited | Limited |
| **Open Source** | **✅ MIT** | ❌ | ❌ | ❌ |
| **Setup Time** | 15 min | 30 min | 15 min | 15 min |

**Winner: n8n Self-Hosted** - Unlimited, free, private, customizable!

---

## 🎯 What You'll Build

**Your n8n Workflow:**
```
GitHub Actions generates posts
    ↓
Sends to n8n webhook
    ↓
n8n parses JSON
    ↓
For each post:
  ├─ Waits until scheduled date
  ├─ Posts to GMB
  └─ Logs result
    ↓
100% automated, $0 cost, unlimited posts!
```

---

## 📋 Prerequisites (You Have This!)

✅ n8n self-hosted on VPS
✅ n8n accessible (your-domain.com:5678 or tunneled)
✅ Google Business Profile
✅ 12 GMB posts ready

---

## 🚀 Setup (15 Minutes)

### **Step 1: Import Workflow Template (5 min)**

I'll create the workflow JSON for you to import directly into n8n.

**File:** `n8n-gmb-workflow.json` ✅ Created!

**Import to n8n:**
```bash
# 1. Login to your n8n instance
# Your VPS: http://your-vps-ip:5678

# 2. Click "Workflows" → "Import from File"

# 3. Upload: n8n-gmb-workflow.json

# 4. Workflow imported!
```

---

### **Step 2: Connect Google Business Profile (5 min)**

**In n8n:**
```
1. Click on "Create GMB Post" node
2. Click "Credential for Google Business Profile"
3. Click "Create New"
4. Choose: "OAuth2"
5. Click "Connect my account"
6. Login with Google
7. Grant permissions
8. ✅ Connected!
```

**Get your Account & Location IDs:**
```
1. In n8n, create a temporary workflow
2. Add "Google Business Profile" node
3. Operation: "List" → "Accounts"
4. Execute node
5. Copy your account ID (looks like: accounts/123456789)
6. Repeat for Locations
7. Copy location ID (looks like: locations/987654321)
8. Save these - you'll need them!
```

---

### **Step 3: Configure Workflow (3 min)**

**Update the workflow nodes:**

```
1. Open "Create GMB Post" node
2. Set accountName: "accounts/YOUR_ACCOUNT_ID"
3. Set locationName: "locations/YOUR_LOCATION_ID"
4. Click "Save"
```

**Activate webhook:**
```
1. Click "Webhook" node
2. Click "Execute Workflow"
3. Copy webhook URL (looks like:)
   http://your-vps.com:5678/webhook/gmb-posts

4. Save this URL - you'll need it!
```

---

### **Step 4: Test the Workflow (2 min)**

**Send test post:**
```bash
# On your local machine:
export N8N_WEBHOOK_URL=http://your-vps.com:5678/webhook/gmb-posts

npm run automation:gmb-test-n8n
```

**Or test manually:**
```bash
curl -X POST http://your-vps.com:5678/webhook/gmb-posts \
  -H "Content-Type: application/json" \
  -d '[{
    "postNumber": 1,
    "content": "🧪 Test from n8n! Call 0487 286 451",
    "scheduledDate": "2025-11-01T09:00:00Z",
    "actionUrl": "https://theprofitplatform.com.au"
  }]'
```

**Check n8n:**
- Executions → Should see successful run
- Check GMB → Post should appear (or be scheduled)

---

## 🔗 Connect to GitHub Actions

### **Step 1: Add n8n Webhook to GitHub Secrets**

```bash
# 1. GitHub repo → Settings → Secrets
# 2. New secret:
#    Name: N8N_WEBHOOK_URL
#    Value: http://your-vps.com:5678/webhook/gmb-posts
# 3. Save
```

### **Step 2: Update GitHub Actions**

Edit `.github/workflows/weekly-gmb-posts.yml`:

```yaml
name: Weekly GMB Post Generation

on:
  schedule:
    - cron: '0 8 * * 0'  # Sunday 6pm Sydney
  workflow_dispatch:

jobs:
  generate-and-post:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Generate GMB Posts
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: npm run automation:gbp-posts

      - name: Send to n8n for auto-posting
        run: |
          LATEST_FILE=$(ls -t automation/generated/gbp-posts/gbp-posts-*.json 2>/dev/null | head -1)
          if [ -f "$LATEST_FILE" ]; then
            echo "📤 Sending posts to n8n..."
            curl -X POST ${{ secrets.N8N_WEBHOOK_URL }} \
              -H "Content-Type: application/json" \
              -d @"$LATEST_FILE"
            echo "✅ Posts sent to n8n!"
          fi

      - name: Commit generated posts
        uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "🤖 Generated GMB posts"
          file_pattern: 'automation/generated/gbp-posts/*.json'
```

---

## ✅ You're Done!

### **Your 100% Automated Flow:**

```
Sunday 6:00 PM (Automatic):
├─ GitHub Actions triggers
├─ Generates 12 posts with Claude
├─ Sends to n8n webhook
└─ GitHub saves posts ✅

n8n receives (Automatic):
├─ Parses 12 posts
├─ Schedules each for correct date
├─ Waits until scheduled time
├─ Posts to GMB automatically
└─ Logs results ✅

Monday/Wednesday/Friday 9:00 AM:
├─ n8n posts to GMB
├─ Content goes live
└─ ✅ Done!

You do: NOTHING! 🎊
```

---

## 🎯 n8n Workflow Features

### **What the Workflow Does:**

1. **Webhook Trigger**
   - Receives posts from GitHub Actions
   - Responds immediately (non-blocking)

2. **Split Posts**
   - Iterates through each post
   - Processes them one by one

3. **Wait Until Scheduled**
   - Calculates time until post date
   - Sleeps until that time
   - Then proceeds

4. **Create GMB Post**
   - Connects to Google Business Profile
   - Creates local post
   - Adds content + CTA button

5. **Success/Error Logging**
   - Logs successful posts
   - Captures errors for debugging

---

## 🔧 Advanced Configuration

### **Add Email Notifications:**

```json
// Add after "Log Success" node
{
  "node": "Send Email",
  "type": "n8n-nodes-base.emailSend",
  "parameters": {
    "to": "your@email.com",
    "subject": "✅ GMB Post Published",
    "text": "Posted: {{$json.content}}"
  }
}
```

### **Add Retry Logic:**

```json
// Modify "Create GMB Post" node
{
  "retryOnFail": true,
  "maxTries": 3,
  "waitBetweenTries": 5000
}
```

### **Store Post Status:**

```json
// Add after "Create GMB Post"
{
  "node": "Update Database",
  "type": "n8n-nodes-base.postgres",
  "parameters": {
    "operation": "insert",
    "table": "gmb_posts",
    "columns": "post_id, status, posted_at"
  }
}
```

---

## 💰 Cost Analysis

### **n8n Self-Hosted vs Others:**

```
Monthly Costs:

n8n Self-Hosted:
├─ VPS (already have): $0 (existing)
├─ Operations: Unlimited
├─ Data: Your server (private)
└─ Total: $0/month ✅

Make.com:
├─ Free tier: 1,000 ops/month
├─ Paid: $9+/month for more
└─ Data: Their cloud

Otto SEO:
├─ Starter: $99/month
├─ Includes SEO tools
└─ Data: Their cloud

GoHighLevel:
├─ Starter: $97/month
├─ Includes CRM
└─ Data: Their cloud
```

**Your Annual Savings with n8n:** $1,164-1,188!

---

## 📊 Why n8n Self-Hosted Wins

| Feature | n8n (You) | Make.com | Otto | GHL |
|---------|-----------|----------|------|-----|
| **Monthly Cost** | **$0** | $0-9 | $99 | $97 |
| **Operations** | **∞** | 1,000 | ∞ | ∞ |
| **Data Location** | **Your VPS** | Their cloud | Their cloud | Their cloud |
| **Customization** | **Full** | Limited | Limited | Limited |
| **Privacy** | **100%** | Medium | Medium | Medium |
| **Open Source** | **✅** | ❌ | ❌ | ❌ |
| **GitHub Integration** | **✅** | ✅ | ❌ | ❌ |
| **Setup Complexity** | Medium | Medium | Easy | Easy |

**Winner: You already have the best solution!** 🏆

---

## 🚀 Quick Commands

```bash
# Test n8n webhook (after setup)
npm run automation:gmb-test-n8n

# Send latest posts to n8n
npm run automation:gmb-send-n8n

# Generate + send in one command
npm run automation:gbp-posts && npm run automation:gmb-send-n8n
```

---

## 🐛 Troubleshooting

### **Webhook not receiving data:**
```bash
# Check n8n is running
curl http://your-vps.com:5678/healthz

# Test webhook directly
curl -X POST http://your-vps.com:5678/webhook/gmb-posts \
  -d '[]'

# Check n8n logs
docker logs n8n  # if running in docker
```

### **GMB post fails:**
```
1. Check Google credentials in n8n
2. Verify Account/Location IDs
3. Check content length (<1,500 chars)
4. View execution logs in n8n
```

### **Posts not scheduling:**
```
1. Check date format: ISO 8601 (2025-11-01T09:00:00Z)
2. Ensure dates are in future
3. Verify "Wait" node is active
4. Check n8n execution history
```

---

## 📋 n8n Helper Scripts

Let me create the helper scripts for you:

