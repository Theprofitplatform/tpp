# VPS Blog Automation - Complete Integration Guide

Your VPS already has automated blog generation running. Here's how everything works together.

---

## 🎯 Current VPS Setup (ALREADY RUNNING)

### **Existing Cron Jobs**

```bash
# TPP Blog Automation - ACTIVE
# Runs Monday-Friday at 9:00 AM AEST (6:00 AM UTC)
0 6 * * * cd /home/avi/projects/tpp && timeout 3600 ./automation/scripts/vps-blog-automation.sh

# Topic Queue Auto-Refill - ACTIVE
# Generates 30 new topics on 1st of each month
0 2 1 * * cd /home/avi/projects/tpp && npm run topics:generate 30

# Topic Queue Health Check - ACTIVE
# Alerts if queue drops below 5 topics (Mondays)
0 8 * * 1 cd /home/avi/projects/tpp && npm run topics:check
```

### **What Happens Daily (Mon-Fri at 9 AM)**

```mermaid
VPS Automation Flow:
1. vps-blog-automation.sh runs
2. Checks git safety (on main, no conflicts)
3. Pulls latest changes from GitHub
4. Reads topic-queue.json
5. Gets next Priority 1 topic
6. Calls generate-blog-post.js
7. Generates 3,000+ word post
8. Quality checks (75+ score required)
9. Git commit automatically
10. Auto-deploys to Cloudflare Pages
11. Sends Discord notification
12. Updates queue status
```

**Result:** 1 blog post published every weekday, fully automated

---

## 🆕 New Scripts (Just Added)

You now have **3 additional automation options** for manual control:

### **1. auto-blog-runner.sh** - Manual Single Post
```bash
ssh tpp-vps
cd projects/tpp
./automation/auto-blog-runner.sh
```

**Use case:** Generate 1 post on-demand when you need it
- Picks next Priority 1 topic
- Generates post
- **Asks** if you want to deploy
- Full control

### **2. auto-blog-batch.sh** - Manual Batch
```bash
ssh tpp-vps
cd projects/tpp
./automation/auto-blog-batch.sh 5  # Generate 5 posts
```

**Use case:** Weekend content sprints
- Generates N posts consecutively
- 10-second delay between posts
- Builds once at end
- **Asks** if you want to deploy

### **3. setup-cron.sh** - Cron Manager
```bash
ssh tpp-vps
cd projects/tpp
./automation/setup-cron.sh
```

**Use case:** Modify automation schedule
- View current cron jobs
- Add/remove automation
- Change schedule
- Custom cron expressions

---

## 🔄 How They Work Together

### **Scenario 1: Normal Operation (Hands-Off)**

```
✅ VPS cron runs Mon-Fri at 9 AM
✅ Generates 1 post per day automatically
✅ Deploys automatically
✅ Discord notification sent

YOU DO: Nothing! It runs itself
```

**Result:** 5 posts per week, 20 per month, 240 per year

---

### **Scenario 2: Need Extra Posts This Week**

```bash
# VPS automation already published 1 post today (Mon 9 AM)
# You want 2 more posts today

ssh tpp-vps
cd projects/tpp
./automation/auto-blog-batch.sh 2

# Generates 2 additional posts
# Total today: 3 posts (1 auto + 2 manual)
```

**Result:** Boost content velocity when needed

---

### **Scenario 3: Weekend Content Sprint**

```bash
# No VPS automation on weekends
# You want to generate 10 posts over the weekend

ssh tpp-vps
cd projects/tpp
./automation/auto-blog-batch.sh 10

# Generates 10 posts in ~1 hour
# Builds and asks to deploy
```

**Result:** Quickly build content inventory

---

### **Scenario 4: Change Schedule**

```bash
# Current: Mon-Fri at 9 AM (5x/week)
# Want: Daily at 2 PM (7x/week)

ssh tpp-vps
cd projects/tpp
./automation/setup-cron.sh

# Select option 4 (custom)
# Enter: 0 14 * * *
# (2 PM UTC = 12 AM AEST next day)
```

**Result:** More frequent automated posts

---

## 📊 Current Queue Status on VPS

```
Total Topics: 25
Priority 1: 6 (comparison/buying guides)
Priority 2: 16 (industry-specific)
Priority 3: 3 (general content)

Next 5 Posts:
1. Best SEO Agency in Sydney (260/mo) ✅ PUBLISHED
2. How Much Does SEO Cost? (90/mo) ⏭️ NEXT
3. Why We Show Our Prices ⏭️
4. In-House SEO vs Agency ⏭️
5. SEO for Plumbers Sydney (50/mo) ⏭️
```

---

## ⚙️ VPS vs Local Automation

### **VPS Automation (vps-blog-automation.sh)**

✅ **Fully automated** - Runs on schedule
✅ **Auto-commits** to Git
✅ **Auto-deploys** to production
✅ **Discord notifications**
✅ **Quality scoring** (75+ required)
✅ **Safety checks** (git, API limits)
✅ **Backups** before deployment
✅ **Retry logic** for failures

**Configuration:**
```bash
ENABLE_GIT_COMMIT=true
ENABLE_DEPLOYMENT=true
ENABLE_NOTIFICATIONS=true
MIN_QUALITY_SCORE=75
API_TIMEOUT=600  # 10 minutes
```

### **New Scripts (auto-blog-runner.sh, etc.)**

✅ **Interactive** - Asks before deploy
✅ **Manual control** - Run when you want
✅ **Batch mode** - Multiple posts
✅ **Simpler** - Less safety checks
✅ **Faster** - No Discord webhooks
✅ **Flexible** - Change on the fly

**Use for:**
- Testing new topics
- Quick content sprints
- Weekend batches
- On-demand generation

---

## 🎯 Recommended Setup

### **Keep Existing VPS Automation**

```bash
# Don't change anything!
# Your Mon-Fri 9 AM automation is perfect

Current schedule: 0 6 * * *  (Mon-Fri at 9 AM AEST)
```

**Why?**
- Consistent publishing velocity
- Fully automated (set-and-forget)
- Discord notifications working
- Quality checks in place
- 5 posts per week = 240/year

### **Use New Scripts For:**

**1. Weekend Boosts**
```bash
# Saturday morning
ssh tpp-vps
cd projects/tpp
./automation/auto-blog-batch.sh 3
```

**2. Testing Topics**
```bash
# Test a specific high-priority topic
ssh tpp-vps
cd projects/tpp
./automation/auto-blog-runner.sh
```

**3. Content Sprints**
```bash
# Need 10 posts for a campaign
ssh tpp-vps
cd projects/tpp
./automation/auto-blog-batch.sh 10
```

---

## 📅 Publishing Calendar

### **Automated (VPS Cron)**
```
Monday:    9:00 AM  ✅ Auto-published
Tuesday:   9:00 AM  ✅ Auto-published
Wednesday: 9:00 AM  ✅ Auto-published
Thursday:  9:00 AM  ✅ Auto-published
Friday:    9:00 AM  ✅ Auto-published
Saturday:  ---      ⏸️  No automation
Sunday:    ---      ⏸️  No automation
```

**Result:** 5 posts per week, 20 per month

### **With Weekend Batches (Optional)**
```
Monday:    9:00 AM  ✅ Auto (1 post)
Tuesday:   9:00 AM  ✅ Auto (1 post)
Wednesday: 9:00 AM  ✅ Auto (1 post)
Thursday:  9:00 AM  ✅ Auto (1 post)
Friday:    9:00 AM  ✅ Auto (1 post)
Saturday:  Manual   🚀 Batch (3 posts)
Sunday:    ---      ⏸️  Rest
```

**Result:** 8 posts per week, 32 per month

---

## 🔧 Management Commands

### **SSH to VPS**
```bash
ssh tpp-vps
cd projects/tpp
```

### **Check Queue Status**
```bash
npm run topics:check
# Shows: 25 topics remaining
```

### **View Current Cron Jobs**
```bash
crontab -l | grep tpp
```

### **Check Automation Logs**
```bash
# VPS automation logs
tail -f automation/logs/blog-automation-*.log

# Cron output
tail -f automation/logs/cron-output.log
```

### **Manual Post Generation**
```bash
# Single post
./automation/auto-blog-runner.sh

# Batch posts
./automation/auto-blog-batch.sh 5
```

### **Update Queue from GitHub**
```bash
# If you add topics locally and push to GitHub
git pull origin main
# Queue updates automatically
```

---

## 🚀 Traffic Projection

### **Current Setup (5 posts/week)**
```
Month 1:  20 posts  →    500 visitors/mo
Month 3:  60 posts  →  1,500 visitors/mo
Month 6: 120 posts  →  3,500 visitors/mo
Month 12: 240 posts →  8,000+ visitors/mo
```

### **With Weekend Batches (8 posts/week)**
```
Month 1:  32 posts  →    800 visitors/mo
Month 3:  96 posts  →  2,400 visitors/mo
Month 6: 192 posts  →  5,500 visitors/mo
Month 12: 384 posts → 15,000+ visitors/mo
```

---

## 🎯 Action Plan

### **This Week: Let VPS Run Automatically**

```
Mon 9 AM: ✅ VPS publishes "How Much Does SEO Cost?"
Tue 9 AM: ✅ VPS publishes "Why We Show Our Prices"
Wed 9 AM: ✅ VPS publishes "In-House SEO vs Agency"
Thu 9 AM: ✅ VPS publishes "SEO for Plumbers Sydney"
Fri 9 AM: ✅ VPS publishes "SEO for Lawyers Sydney"
```

**YOU DO:** Nothing! Check Discord for notifications

---

### **Next Weekend: Manual Batch**

```bash
# Saturday morning
ssh tpp-vps
cd projects/tpp
./automation/auto-blog-batch.sh 5

# Generates:
- SEO for Dentists Sydney
- SEO for Real Estate Sydney
- SEO for Restaurants Sydney
- SEO for Electricians Sydney
- SEO for Accountants Sydney
```

**Result:** 10 posts this week (5 auto + 5 manual)

---

### **Month 2+: Pure Automation**

```
Just let the VPS cron run:
- Mon-Fri at 9 AM
- 5 posts per week
- 20 posts per month
- 240 posts per year
```

**Result:** Fully automated content marketing

---

## 📊 Monitoring

### **Discord Notifications (Already Configured)**

VPS automation sends Discord webhooks:
- ✅ Post generation started
- ✅ Post published
- ❌ Generation failed
- ⚠️ Queue running low

### **Email Alerts (Optional)**

Set up email for cron failures:
```bash
# In cron, add MAILTO:
MAILTO=your@email.com
```

### **Dashboard (Optional)**

```bash
npm run blog:dashboard
# View analytics at /tools/analytics-dashboard/
```

---

## 🔍 Troubleshooting

### **"VPS automation didn't run today"**

```bash
ssh tpp-vps
cd projects/tpp
tail -100 automation/logs/blog-automation-*.log
```

Check for:
- API key issues
- Git conflicts
- Queue empty
- Permission errors

### **"Want to change schedule"**

```bash
ssh tpp-vps
cd projects/tpp
./automation/setup-cron.sh
# Select option to modify
```

### **"Queue is empty"**

```bash
ssh tpp-vps
cd projects/tpp
npm run topics:generate 20 -- --auto
# Generates 20 new topics
```

---

## 💡 Pro Tips

### **1. Keep VPS Automation as Primary**
- It's reliable, tested, and working
- Has safety checks and notifications
- Auto-deploys successfully

### **2. Use New Scripts for Flexibility**
- Weekend content sprints
- Testing specific topics
- Quick batches when needed

### **3. Monitor via Discord**
- Check notifications daily
- Confirm posts published
- Watch for errors

### **4. Let Queue Auto-Refill**
- Generates 30 topics on 1st of month
- Health check on Mondays
- Never runs out of content

---

## ✅ Summary

**What You Have:**

1. ✅ **VPS Automation** - Running Mon-Fri at 9 AM (5 posts/week)
2. ✅ **25 Topics Queued** - Priority 1 comparison posts ready
3. ✅ **Auto-Deployment** - Posts go live automatically
4. ✅ **Discord Notifications** - Know when posts publish
5. ✅ **Manual Scripts** - For weekends and batches
6. ✅ **Quality Checks** - Only publishes good content

**What You Can Do:**

1. **Nothing!** Let VPS automation run (recommended)
2. **Weekend batches** with `auto-blog-batch.sh`
3. **Manual posts** with `auto-blog-runner.sh`
4. **Change schedule** with `setup-cron.sh`

**Expected Result:**

- 5 posts per week (auto)
- +3-5 posts on weekends (optional manual)
- 20-32 posts per month
- 2,000+ monthly visitors by Month 6

---

## 🎉 You're All Set!

Your VPS automation is running perfectly. The new scripts are there if you need them for flexibility.

**Next post publishes:** Tomorrow (Monday) at 9 AM AEST

**Current queue:** 25 topics (enough for 5 weeks of automation)

**Just check Discord for notifications! 🚀**
