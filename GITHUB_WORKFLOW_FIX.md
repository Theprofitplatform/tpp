# GitHub Workflow Permissions Fix

## 🎯 The Issue
Error: `refusing to allow an OAuth App to create or update workflow`

This happens when repository has restricted workflow permissions.

## 🔧 Solution 1: Repository Settings (RECOMMENDED)

### Step 1: Go to Repository Settings
**URL**: https://github.com/Theprofitplatform/link/settings/actions

### Step 2: Configure Actions Permissions
1. Click **"Actions"** in left sidebar
2. Click **"General"** tab
3. Under **"Actions permissions"** ensure:
   - ✅ **"Allow all actions and reusable workflows"** is selected

### Step 3: Configure Workflow Permissions
Under **"Workflow permissions"** section:
- ✅ Select **"Read and write permissions"**
- ✅ Check **"Allow GitHub Actions to create and approve pull requests"**
- Click **"Save"**

### Step 4: Test Push Again
```bash
git push origin main
```

## 🔧 Solution 2: Manual Workflow Upload

If Solution 1 doesn't work, create workflow via web interface:

### Step 1: Create Workflow File
1. Go to: https://github.com/Theprofitplatform/link
2. Click **"Add file"** → **"Create new file"**
3. File path: `.github/workflows/cloudflare-pages.yml`

### Step 2: Copy This Content:
```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
      pull-requests: write
    name: Deploy to Cloudflare Pages
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build for Production
        if: github.ref == 'refs/heads/main'
        run: |
          export CF_PAGES=true
          npm run build
        env:
          CF_PAGES: true

      - name: Build for Preview
        if: github.ref != 'refs/heads/main'
        run: |
          export CF_PAGES=true
          npm run build
        env:
          CF_PAGES: true

      - name: Publish to Cloudflare Pages (Production)
        if: github.ref == 'refs/heads/main'
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: tpp-astro
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
          wranglerVersion: '3'

      - name: Publish to Cloudflare Pages (Preview)
        if: github.ref != 'refs/heads/main'
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: tpp-astro
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
          wranglerVersion: '3'
          previewUrlComment: true
```

### Step 3: Commit via Web
- Commit message: `feat: add Cloudflare Pages deployment workflow`
- Click **"Commit new file"**

## 🔧 Solution 3: Personal Access Token

If you need more control, create a Personal Access Token:

### Step 1: Create PAT
1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Select scopes:
   - ✅ `repo` (full repository access)
   - ✅ `workflow` (update GitHub Actions workflows)
4. Generate and copy token

### Step 2: Use PAT for Git Operations
```bash
git remote set-url origin https://YOUR_PAT@github.com/Theprofitplatform/link.git
git push origin main
```

## 🎯 Quick Test

After applying any solution, test with:

### Manual Trigger:
1. Go to: https://github.com/Theprofitplatform/link/actions
2. Click **"Deploy to Cloudflare Pages"**
3. Click **"Run workflow"** → **"Run workflow"**

### Automatic Trigger:
Make any small change and push to main branch.

## 🚨 If All Else Fails

Use the **Cloudflare Dashboard** method - it's actually easier and doesn't require GitHub workflows:
- Go to: https://dash.cloudflare.com/pages
- Connect directly to your repository
- All deployments will be automatic

---

**Try Solution 1 first - it usually fixes the issue immediately!**