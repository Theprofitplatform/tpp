# 📧 Email Alerts Setup Guide

## ✅ Email Configuration Added to .env.local

I've added email configuration to your `.env.local` file. Now you need to update it with your credentials.

---

## 📋 Choose Your Email Provider

### Option 1: Gmail (Recommended) ⭐

**Why Gmail?**
- Free
- Reliable
- Easy to set up
- Works with 2FA

**Setup Steps:**

1. **Enable 2-Step Verification** (if not already)
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow the setup

2. **Create App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other (Custom name)"
   - Enter: "Blog Automation"
   - Click "Generate"
   - Copy the 16-character password

3. **Update .env.local:**
   ```bash
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx  # The app password from step 2
   EMAIL_FROM=your-email@gmail.com
   EMAIL_TO=your-email@gmail.com  # Where to receive alerts
   ```

---

### Option 2: Outlook/Hotmail

**Setup Steps:**

1. **Update .env.local:**
   ```bash
   EMAIL_HOST=smtp-mail.outlook.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@outlook.com
   EMAIL_PASS=your-password
   EMAIL_FROM=your-email@outlook.com
   EMAIL_TO=your-email@outlook.com
   ```

2. If you have 2FA enabled, create an app password:
   - Go to: https://account.microsoft.com/security
   - Advanced security options → App passwords
   - Create new app password

---

### Option 3: Yahoo Mail

**Setup Steps:**

1. **Generate App Password:**
   - Go to: https://login.yahoo.com/account/security
   - Click "Generate app password"
   - Select "Other App"
   - Name it "Blog Automation"

2. **Update .env.local:**
   ```bash
   EMAIL_HOST=smtp.mail.yahoo.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@yahoo.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=your-email@yahoo.com
   EMAIL_TO=your-email@yahoo.com
   ```

---

### Option 4: Custom SMTP Provider

**Examples:**
- SendGrid: smtp.sendgrid.net
- Mailgun: smtp.mailgun.org
- Amazon SES: email-smtp.region.amazonaws.com

**Update .env.local with your provider's settings**

---

## 🧪 Test Email Setup

After configuring, test it:

```bash
npm run blog:alerts
```

If email is configured correctly, you should receive an email with:
- Subject: "Blog Performance: 0 Critical, 3 Warnings, 0 Wins"
- Body: HTML formatted alert summary

---

## 📧 What Emails You'll Receive

### Daily/Weekly Alerts
- 🚨 **Critical:** Posts with 0 traffic after 30 days
- ⚠️ **Warnings:** Low word count, missing links, high bounce rate
- 🎉 **Wins:** Viral posts, ranking opportunities, traffic milestones

### Example Email:

```
Subject: Blog Performance: 0 Critical, 3 Warnings, 0 Wins

🚨 Critical Issues (0)
(none)

⚠️ Warnings (3)
• Low word count: 222 words
  Post: 7 Google Ads Mistakes...
  Action: Expand to 1500+ words

• No internal links
  Post: 7 Google Ads Mistakes...
  Action: Add 3-5 relevant links

• Low word count: 413 words
  Post: How to Scale Local SEO...
  Action: Expand to 1500+ words

🎉 Wins & Opportunities (0)
(none)
```

---

## 🔧 Troubleshooting

### "Invalid login" error

**Gmail:**
- Make sure you're using an App Password, not your regular password
- Enable "Less secure app access" is NOT needed with app passwords
- Check 2-Step Verification is enabled

**Outlook:**
- Use app password if 2FA is enabled
- Regular password works if no 2FA

**Yahoo:**
- Must use app password (regular password doesn't work for SMTP)

### "Connection timeout" error

- Check EMAIL_HOST is correct
- Try port 465 with SSL instead of 587 with TLS
- Check firewall/antivirus isn't blocking

### No email received

- Check spam/junk folder
- Verify EMAIL_TO is correct
- Run `npm run blog:alerts` again
- Check console for error messages

---

## 🚀 Quick Setup (Gmail Example)

**1. Get App Password:**
```
1. Go to: https://myaccount.google.com/apppasswords
2. Generate app password for "Blog Automation"
3. Copy the 16-character code
```

**2. Update .env.local:**
```bash
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop  # Your app password
EMAIL_TO=your-email@gmail.com
```

**3. Test:**
```bash
npm run blog:alerts
```

**4. Check Email:**
You should receive an alert summary!

---

## 📅 Automate Daily Emails

### Option A: Cron Job (Linux/Mac)
```bash
# Edit crontab
crontab -e

# Add this line for daily 9 AM alerts
0 9 * * * cd /path/to/project && npm run blog:alerts
```

### Option B: Windows Task Scheduler

1. Create `run-alerts.bat`:
   ```batch
   @echo off
   cd C:\Users\abhis\projects\atpp\tpp
   npm run blog:alerts
   ```

2. Open Task Scheduler
3. Create Basic Task
4. Set trigger: Daily at 9:00 AM
5. Action: Start program → run-alerts.bat

### Option C: GitHub Actions
```yaml
name: Daily Blog Alerts
on:
  schedule:
    - cron: '0 9 * * *'
jobs:
  alerts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run blog:alerts
    env:
      EMAIL_HOST: ${{ secrets.EMAIL_HOST }}
      EMAIL_USER: ${{ secrets.EMAIL_USER }}
      EMAIL_PASS: ${{ secrets.EMAIL_PASS }}
```

---

## ✅ Verification

After setup, run:
```bash
npm run blog:verify
```

You should see:
```
✅ Email alerts configured
```

Instead of:
```
⚠️  Email alerts not configured
```

---

## 🎯 Next Steps

1. **Configure email** using one of the options above
2. **Test it:** `npm run blog:alerts`
3. **Set up automation** (cron/scheduler) for daily alerts
4. **Relax** - You'll now get automatic performance alerts!

---

## 💡 Pro Tip

Send alerts to a dedicated email or Slack channel to keep your inbox organized:

```bash
EMAIL_TO=blog-alerts@yourdomain.com
```

Or use email filters to auto-label blog automation emails.

---

**Need help?** Check troubleshooting section above or review `automation/scripts/performance-alerts.mjs` for email sending logic.
