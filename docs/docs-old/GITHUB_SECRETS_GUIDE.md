# 🔐 Copy Credentials from GitHub Secrets

Your credentials are stored in GitHub secrets. Here's how to copy them to your local `.env.local`:

---

## 📋 Quick Steps

### 1. View Your GitHub Secrets

**Go to your repository settings:**
```
https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions
```

Or navigate:
1. Go to your GitHub repository
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. You'll see your secrets listed (values are hidden)

---

### 2. Copy Secret Values to .env.local

You can't view the secret values directly in GitHub, but you can:

**Option A: Re-create locally (Recommended)**

Since you set them up before, you likely have them saved somewhere. Add to `.env.local`:

```bash
# Claude AI
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Email (if configured)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_TO=your-email@gmail.com
```

**Option B: Retrieve from GitHub Actions run**

If you have a recent GitHub Actions run that uses these secrets:
1. Go to Actions tab
2. Find a recent workflow run
3. The secrets are used there (but not displayed)

**Option C: Get fresh keys**

**Claude API:**
- Go to: https://console.anthropic.com/settings/keys
- Copy existing key or create new one

**Email App Password:**
- Gmail: https://myaccount.google.com/apppasswords
- Create new app password

---

## 🔑 Common GitHub Secret Names

Your secrets might be named:

**Claude API:**
- `ANTHROPIC_API_KEY`
- `CLAUDE_API_KEY`
- `OPENAI_API_KEY` (if you also use OpenAI)

**Email:**
- `EMAIL_HOST`
- `EMAIL_USER`
- `EMAIL_PASS` or `EMAIL_PASSWORD`
- `SMTP_USER` / `SMTP_PASS`

---

## ⚡ Quick Add to .env.local

**Method 1: Direct Edit**
```bash
nano .env.local
```

Add after line 22:
```bash
# Claude AI
ANTHROPIC_API_KEY=sk-ant-your-actual-key

# Email Alerts
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_TO=your-email@gmail.com
```

**Method 2: Command Line**
```bash
# Add Claude API
echo "ANTHROPIC_API_KEY=sk-ant-your-key" >> .env.local

# Add Email
echo "EMAIL_USER=your-email@gmail.com" >> .env.local
echo "EMAIL_PASS=your-app-password" >> .env.local
echo "EMAIL_TO=your-email@gmail.com" >> .env.local
```

---

## 🔍 Which Repo Has Your Secrets?

Run this to find repos with secrets:
```bash
# List your recent repos
gh repo list --limit 20
```

Then check secrets in a specific repo:
```bash
# View secrets (requires GitHub CLI)
gh secret list -R your-username/your-repo
```

---

## 🆕 If You Need Fresh Credentials

### Get New Claude API Key:
1. Go to: https://console.anthropic.com/settings/keys
2. Click "Create Key"
3. Name it: "TPP Blog Automation"
4. Copy the key (starts with `sk-ant-`)
5. Add to `.env.local`

### Get New Email App Password:
1. Gmail: https://myaccount.google.com/apppasswords
2. Create app password for "Blog Automation"
3. Copy the 16-character code
4. Add to `.env.local`

---

## ✅ Verify After Adding

```bash
npm run blog:verify
```

Should show:
```
✅ ANTHROPIC_API_KEY is configured
✅ Email alerts configured (if email added)
```

---

## 🚀 Quick Test

**Test Claude AI:**
```bash
npm run blog:generate
```

**Test All Features:**
```bash
npm run blog:master
```

---

## 🔒 Keep .env.local Secure

**.env.local is already in .gitignore** ✅

Your local credentials won't be committed to Git. They're separate from your GitHub secrets.

**GitHub Secrets** = For CI/CD workflows
**.env.local** = For local development

Both can have the same values!

---

## 💡 Pro Tip: Use Same Keys

You can use the **same API key** in both places:
- GitHub Secrets (for Actions)
- .env.local (for local dev)

Just copy the value from wherever you originally got it!

---

**Need the actual key value?**

If you don't remember it:
1. Get fresh key from Anthropic console
2. Update both GitHub secrets AND .env.local
3. You're set!
