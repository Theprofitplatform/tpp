# 🆓 Make.com - 100% FREE GMB Automation

**Same features as Otto SEO ($99/mo) and GoHighLevel ($97/mo) - Completely FREE!**

---

## ✅ What You Get (FREE)

- ✅ **1,000 operations/month** (way more than you need)
- ✅ **100% automated GMB posting**
- ✅ **Connects to GitHub Actions** (your posts auto-sync)
- ✅ **Scheduling included**
- ✅ **No credit card required for free tier**
- ✅ **Never expires**

**Your 12 posts = 12 operations/month = 988 operations left over!**

---

## 🚀 Setup Guide (30 Minutes, One-Time)

### **Part 1: Sign Up (2 minutes)**

```bash
# 1. Go to Make.com
https://www.make.com/en/register

# 2. Sign up (FREE account)
# - Use your email
# - No credit card needed
# - Confirm email

# 3. Login to dashboard
```

---

### **Part 2: Connect Google Business Profile (5 minutes)**

```bash
# 1. In Make.com dashboard
Apps → Add Connection → Google My Business

# 2. Authenticate
- Click "Create a connection"
- Login with your Google account
- Grant permissions to Make.com
- ✅ Connection saved

# 3. Get your GBP Account ID
# You'll need this - Make.com will show it after connecting
```

---

### **Part 3: Create Automation Scenario (15 minutes)**

I'll walk you through creating the automation:

#### **Step 1: Create New Scenario**

```
Make.com Dashboard → Scenarios → Create New Scenario
Name it: "GMB Auto-Poster"
```

#### **Step 2: Add Webhook Trigger**

```
1. Click the "+" to add first module
2. Search: "Webhooks"
3. Select: "Custom Webhook"
4. Click "Add"
5. Create webhook:
   - Webhook name: "github-gmb-posts"
   - Click "Save"
6. Copy the webhook URL (looks like: https://hook.make.com/xxxxx)
   Save this - you'll need it!
```

#### **Step 3: Add JSON Parser**

```
1. Click "+" after webhook
2. Search: "JSON"
3. Select: "Parse JSON"
4. Data structure: Create new
   - Name: "GMB Posts"
   - Sample data: Paste this:

{
  "postNumber": 1,
  "type": "tip",
  "content": "Test post content",
  "scheduledDate": "2025-10-31",
  "actionButton": "Learn more",
  "actionUrl": "https://theprofitplatform.com.au"
}

5. Click "Save"
6. Map "JSON string": Select the webhook data
```

#### **Step 4: Add Array Iterator**

```
1. Click "+" after JSON parser
2. Search: "Iterator"
3. Select: "Iterator"
4. Array: Map to the parsed JSON array
```

#### **Step 5: Add Delay/Scheduler**

```
1. Click "+" after Iterator
2. Search: "Tools"
3. Select: "Sleep"
4. Mode: "Until specific date"
5. Date: Map to {{scheduledDate}} from iterator
```

#### **Step 6: Add GMB Post Creation**

```
1. Click "+" after Sleep
2. Search: "Google My Business"
3. Select: "Create a Local Post"
4. Connection: Select your GBP connection
5. Fill in fields:
   - Account: Your GBP account ID
   - Location: Your location ID
   - Language Code: en
   - Summary: Map to {{content}}
   - Topic Type: STANDARD
   - Call to Action:
     - Action Type: LEARN_MORE
     - URL: Map to {{actionUrl}}
6. Click "OK"
```

#### **Step 7: Test the Scenario**

```
1. Click "Run once" at bottom
2. It will wait for webhook data
3. Send test data:

curl -X POST https://hook.make.com/YOUR_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '[{
    "postNumber": 1,
    "type": "test",
    "content": "Test from Make.com automation",
    "scheduledDate": "2025-11-01T09:00:00Z",
    "actionUrl": "https://theprofitplatform.com.au"
  }]'

4. Check Make.com - should see successful execution
5. Check GMB - should see test post (or scheduled)
```

#### **Step 8: Activate Scenario**

```
1. Toggle "ON" at bottom left
2. Click "Save"
3. ✅ Your automation is LIVE!
```

---

### **Part 4: Connect to GitHub Actions (8 minutes)**

Now connect your weekly post generation to Make.com:

#### **Step 1: Add Webhook URL to GitHub Secrets**

```bash
# 1. Go to your GitHub repo
https://github.com/YOUR_USERNAME/tpp

# 2. Settings → Secrets and variables → Actions
# 3. Click "New repository secret"
# 4. Name: MAKE_WEBHOOK_URL
# 5. Value: https://hook.make.com/xxxxx (your webhook URL)
# 6. Click "Add secret"
```

#### **Step 2: Update GitHub Actions Workflow**

Edit `.github/workflows/weekly-gmb-posts.yml`:

```yaml
# Add this step after post generation
- name: Auto-sync to Make.com for GMB posting
  if: success()
  run: |
    LATEST_FILE=$(ls -t automation/generated/gbp-posts/gbp-posts-*.json 2>/dev/null | head -1)
    if [ -f "$LATEST_FILE" ]; then
      echo "📤 Sending posts to Make.com..."
      curl -X POST ${{ secrets.MAKE_WEBHOOK_URL }} \
        -H "Content-Type: application/json" \
        -d @"$LATEST_FILE"
      echo "✅ Posts sent to Make.com for scheduling"
    else
      echo "⚠️ No posts file found"
    fi
```

#### **Step 3: Test End-to-End**

```bash
# Trigger GitHub Actions manually
# GitHub repo → Actions → Weekly GMB Post Generation → Run workflow

# Watch it:
# 1. Generate posts ✅
# 2. Send to Make.com ✅
# 3. Make.com schedules them ✅
# 4. Posts appear on GMB automatically ✅
```

---

## 🎉 Result: 100% Automated, $0 Cost

### **Your Weekly Flow (All Automatic):**

```
Sunday 6:00 PM (Sydney):
├─ GitHub Actions triggers automatically
├─ Generates 12 GMB posts with Claude
├─ Saves to JSON file
├─ Sends to Make.com webhook
└─ ✅ Done!

Make.com receives posts:
├─ Parses JSON
├─ Schedules each post for correct date/time
├─ Posts automatically on schedule
└─ ✅ Done!

Monday/Wednesday/Friday 9:00 AM:
├─ Make.com posts to GMB
├─ Your content goes live
└─ ✅ Done!

You do: NOTHING! 🎊
```

---

## 💰 Cost Comparison

| What | Otto SEO | GoHighLevel | Make.com |
|------|----------|-------------|----------|
| **Monthly Cost** | $99-399 | $97-297 | **$0** |
| **Annual Cost** | $1,188 | $1,164 | **$0** |
| **GMB Posting** | ✅ | ✅ | ✅ |
| **Auto-Scheduling** | ✅ | ✅ | ✅ |
| **API Integration** | ✅ | ✅ | ✅ |
| **GitHub Actions** | ❌ | ❌ | ✅ |
| **Operations/mo** | Unlimited | Unlimited | 1,000 |
| **Setup Time** | 15 min | 15 min | 30 min |

**Savings with Make.com:** $1,164-1,188 per year!

---

## 🔧 Troubleshooting

### **Issue: Webhook not receiving data**

```bash
# Test webhook directly
curl -X POST https://hook.make.com/YOUR_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '[{"postNumber":1,"content":"Test","scheduledDate":"2025-11-01T09:00:00Z"}]'

# Check Make.com → Scenario History
# Should see the request
```

### **Issue: GMB post fails**

```
Common causes:
1. Wrong GBP Account/Location ID
   → Check in Make.com → Google My Business → List Accounts
2. Missing permissions
   → Re-authenticate your Google account
3. Content too long
   → GMB limit is 1,500 characters
```

### **Issue: Scheduled posts not posting**

```
1. Check scenario is "ON"
2. Check Make.com operations usage (free tier = 1,000/mo)
3. Check scenario history for errors
4. Verify scheduled dates are in future
```

---

## 📊 What You Get vs Paid Tools

### **Features Comparison:**

| Feature | Make.com (FREE) | Otto SEO ($99) | GHL ($97) |
|---------|-----------------|----------------|-----------|
| GMB Auto-Posting | ✅ | ✅ | ✅ |
| Scheduling | ✅ | ✅ | ✅ |
| GitHub Integration | ✅ | ❌ | ❌ |
| Content Generation | ❌ (you have this) | ✅ | ❌ |
| Review Management | ❌ | ✅ | ✅ |
| SEO Tools | ❌ | ✅ | ❌ |
| CRM/Email | ❌ | ❌ | ✅ |
| **Total Cost** | **$0/mo** | $99/mo | $97/mo |

**Verdict:** Make.com gives you GMB automation for free. You already have content generation (Claude). You don't need the rest.

---

## 🚀 Your Complete FREE Stack

```
Content Generation: ✅ Claude API ($3/mo for 12 posts)
Post Scheduling: ✅ Make.com ($0/mo)
Auto-Posting: ✅ Make.com ($0/mo)
GitHub Actions: ✅ GitHub ($0/mo)
Total: $3/month

vs

Otto SEO: $99/mo
GoHighLevel: $97/mo
Savings: $94-96/month = $1,128-1,152/year
```

---

## ✅ Next Steps - Let's Set It Up!

I'll guide you through each step:

### **Step 1: Sign Up (Do this now)**
```bash
https://www.make.com/en/register
```

### **Step 2: Tell me when ready**
Once you've signed up, tell me and I'll walk you through:
1. Connecting your Google Business Profile
2. Creating the automation scenario
3. Testing it with your 12 existing posts
4. Connecting to GitHub Actions

### **Step 3: Go live**
30 minutes from now, you'll have 100% free automation!

---

## 💡 Pro Tips

**Make.com Tips:**
1. Rename your scenario descriptively
2. Add error handling modules
3. Use "Resume" to recover from failures
4. Check scenario history regularly

**Monitoring:**
```
Make.com → Scenarios → Your scenario → History
Shows all executions, successes, failures
```

**Notifications:**
```
Add module: "Email" → Send me email
Trigger: On error
Get alerts if something breaks
```

---

## 🎯 Ready to Start?

**Reply with:**
1. ✅ "Signed up for Make.com" - I'll send detailed setup
2. ❓ "Have questions first" - Ask me anything
3. 🏃 "Let's do this now" - I'll walk you through live

**This is the same automation as Otto SEO and GoHighLevel, but 100% FREE!** 🎉

---

**Updated:** October 31, 2025
**Cost:** $0/month forever
**Automation:** 100%
**Your time:** 0 minutes/week after setup
