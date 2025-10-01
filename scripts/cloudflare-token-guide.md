# Cloudflare API Token Setup Guide

## 🚨 Current Issue
The provided API token appears to be invalid format. Cloudflare API tokens should be longer and contain letters, numbers, and special characters.

**Provided token**: `f9842482ab98737b5aecffe33b6e98b6422fd`
**Expected format**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (much longer)

## 🔧 How to Get the Correct API Token

### Step 1: Go to Cloudflare API Tokens Page
- URL: https://dash.cloudflare.com/profile/api-tokens
- Login to your Cloudflare account

### Step 2: Create New Token
1. Click **"Create Token"**
2. Choose **"Cloudflare Pages:Edit"** template
3. OR use **"Custom token"** with these permissions:

### Step 3: Custom Token Permissions (if not using template)
**Account Permissions:**
- `Cloudflare Pages:Edit`

**Zone Permissions:**
- `Zone:Read` (for your domain `theprofitplatform.com.au`)

**Zone Resources:**
- Include: `theprofitplatform.com.au`

### Step 4: Account ID
Your Account ID is correct: `8fc18f5691f32fccc13eb17e85a0ae10`

## 🔍 Alternative: Using Global API Key (Not Recommended)

If you're having trouble with API tokens, you can temporarily use:
- **CLOUDFLARE_EMAIL**: Your Cloudflare login email
- **CLOUDFLARE_API_KEY**: Global API Key (from same API tokens page)

But API tokens are preferred for security.

## ✅ Verification Steps

Once you have the correct token:

```bash
# Test authentication
export CLOUDFLARE_API_TOKEN="your-new-token-here"
wrangler whoami

# Should show your account information
```

## 🔧 Quick Fix Options

### Option 1: Get New API Token
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Create new token with "Cloudflare Pages:Edit" template
3. Copy the new token (will be much longer)
4. Use the new token in GitHub secrets

### Option 2: Use Global API Key
1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Scroll to "Global API Key" section
3. Click "View" and copy the key
4. Add these GitHub secrets instead:
   - `CLOUDFLARE_EMAIL`: your-email@domain.com
   - `CLOUDFLARE_API_KEY`: your-global-api-key

## 📝 Updated GitHub Secrets

### If Using API Token (Recommended):
```
CLOUDFLARE_API_TOKEN: [new-longer-token-from-cloudflare]
CLOUDFLARE_ACCOUNT_ID: 8fc18f5691f32fccc13eb17e85a0ae10
```

### If Using Global API Key:
```
CLOUDFLARE_EMAIL: [your-cloudflare-email]
CLOUDFLARE_API_KEY: [your-global-api-key]
CLOUDFLARE_ACCOUNT_ID: 8fc18f5691f32fccc13eb17e85a0ae10
```

## 🛠️ Update GitHub Actions Workflow

If using Global API Key, update `.github/workflows/cloudflare-pages.yml`:

```yaml
- name: Publish to Cloudflare Pages
  uses: cloudflare/pages-action@v1
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_KEY }}  # or CLOUDFLARE_API_TOKEN
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    projectName: tpp-astro
    directory: dist
    gitHubToken: ${{ secrets.GITHUB_TOKEN }}
    wranglerVersion: '3'
```

## 🎯 Next Steps

1. **Get correct Cloudflare credentials** (API token or global key)
2. **Add to GitHub secrets** at: https://github.com/Theprofitplatform/link/settings/secrets/actions
3. **Test deployment** by pushing to main branch
4. **Verify in Cloudflare Pages** dashboard

---

**Need Help?**
- Cloudflare API Tokens: https://developers.cloudflare.com/fundamentals/api/get-started/create-token/
- Pages Documentation: https://developers.cloudflare.com/pages/