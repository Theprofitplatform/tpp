# 🔑 Copy Existing Credentials to Blog Automation

Since you already have Claude API and email credentials set up in other tools, here's how to quickly add them to this project:

---

## 📋 Quick Copy Instructions

### 1. Find Your Existing Credentials

**Claude API Key:**
- Check: `~/.anthropic/api_key`
- Or: Other project's `.env` files
- Or: Your Anthropic console: https://console.anthropic.com/

**Email Credentials:**
- Check: Other project's `.env` files
- Or: Your email app password settings

---

### 2. Add to .env.local

**Open `.env.local` and add:**

```bash
# Add after line 22 (after Search Console config):

# Claude AI (for content generation features)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Email Alerts (if you want email notifications)
# Already configured on lines 28-33, just update with your values
```

---

## 🚀 One-Line Copy (If You Know Your Keys)

**Option A: Add Both at Once**
```bash
cat >> .env.local << 'EOF'

# Claude AI
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
EOF
```

**Option B: Just Update Email Credentials**
The email template is already in `.env.local` on lines 28-33.
Just replace:
- `your-email@gmail.com` with your actual email
- `your-app-password-here` with your actual app password

---

## ✅ Verify After Adding

```bash
npm run blog:verify
```

Should show:
```
✅ ANTHROPIC_API_KEY is configured
✅ Email alerts configured
```

---

## 🎯 Quick Test

**Test Claude AI features:**
```bash
npm run blog:generate
```

**Test email alerts:**
```bash
npm run blog:alerts
```

---

## 📝 What You Need

Just copy these values from your other tools:

1. **Claude API Key** (starts with `sk-ant-`)
   - From: Anthropic console or other project

2. **Email Settings** (if you want alerts)
   - EMAIL_USER: your-email@gmail.com
   - EMAIL_PASS: your-app-password
   - EMAIL_TO: where-to-send-alerts@email.com

---

## 🔍 Find Your Claude API Key

**Method 1: Check Other Projects**
```bash
# Search in your projects
grep -r "ANTHROPIC_API_KEY" ~/projects/
```

**Method 2: Check Anthropic Config**
```bash
cat ~/.anthropic/api_key 2>/dev/null || echo "Not found"
```

**Method 3: Get New Key**
- Go to: https://console.anthropic.com/
- Settings → API Keys
- Copy existing or create new

---

## ⚡ After Adding Credentials

All these features will work:

```bash
npm run blog:generate              # AI content creation
npm run blog:optimize <slug>       # AI optimization
npm run blog:ab-test <slug>        # AI A/B testing
npm run blog:calendar              # AI content planning
npm run blog:competitor <url>      # AI competitor analysis
npm run blog:alerts               # Email notifications
npm run blog:master               # Full workflow
```

---

**Just add your existing API key to `.env.local` and you're done!** 🚀
