# GitHub Secrets Setup Guide

## 🔐 Adding Cloudflare Credentials to GitHub

### Repository Information
- **Repository**: `Theprofitplatform/link`
- **URL**: https://github.com/Theprofitplatform/link

### Step-by-Step Instructions

1. **Navigate to Repository Secrets**:
   - Go to: https://github.com/Theprofitplatform/link/settings/secrets/actions
   - Click "New repository secret"

2. **Add CLOUDFLARE_API_TOKEN**:
   - **Name**: `CLOUDFLARE_API_TOKEN`
   - **Value**: `f9842482ab98737b5aecffe33b6e98b6422fd`
   - Click "Add secret"

3. **Add CLOUDFLARE_ACCOUNT_ID**:
   - **Name**: `CLOUDFLARE_ACCOUNT_ID`
   - **Value**: `8fc18f5691f32fccc13eb17e85a0ae10`
   - Click "Add secret"

### 🚨 Security Note
These credentials are now documented locally. After setup:
1. Add this file to .gitignore
2. Delete this file from the repository
3. Use environment variables for future access

## ✅ Verification

After adding the secrets, you can verify the setup by:

1. **Check Secrets Are Added**:
   - Go to repository settings → Secrets and variables → Actions
   - Verify both secrets are listed (values will be hidden)

2. **Test Automatic Deployment**:
   - Make a small change and push to main branch
   - Check GitHub Actions tab for deployment status
   - Monitor Cloudflare Pages dashboard

3. **Manual Workflow Trigger**:
   - Go to Actions tab → "Deploy to Cloudflare Pages"
   - Click "Run workflow" → "Run workflow"

## 🌐 Custom Domain Setup

After GitHub secrets are configured:

1. **Cloudflare Pages Dashboard**:
   - Go to https://dash.cloudflare.com/pages
   - Find your `tpp-astro` project
   - Go to "Custom domains" tab

2. **Add Production Domain**:
   - Add domain: `tpp.theprofitplatform.com.au`
   - Cloudflare will provide DNS instructions

3. **Add Preview Domain**:
   - Add domain: `test.theprofitplatform.com.au`
   - Configure for preview deployments

## 🚀 Next Steps

1. Add GitHub secrets using the values above
2. Push this repository to trigger first deployment
3. Monitor deployment in GitHub Actions
4. Configure custom domains in Cloudflare Pages
5. Test both production and preview URLs

---

**⚠️ IMPORTANT**: Delete this file after setup is complete for security.