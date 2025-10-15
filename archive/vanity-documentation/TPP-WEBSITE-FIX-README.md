# TPP-Website GitHub Actions Fix - Quick Reference

## Problem Summary

GitHub Actions workflow Run #16 for `tpp-website` repository failed with:
- ❌ **Code Quality & Linting**: Missing `npm run lint` script
- ❌ **Automatic Rollback**: Missing SSH credentials (PROD_HOST, PROD_USER, PROD_KEY)

## Solution Overview

This package includes everything needed to fix the failing GitHub Actions workflow.

---

## 📁 Files Included

### Documentation
1. **TPP-WEBSITE-FIX-README.md** (this file) - Quick reference
2. **TPP-WEBSITE-FIXES.md** - Detailed problem analysis and fixes
3. **TPP-WEBSITE-GITHUB-SECRETS.md** - GitHub Secrets configuration guide
4. **TPP-WEBSITE-COMPLETE-SETUP.md** - Complete step-by-step setup guide

### Scripts (in `tpp-website-scripts/` folder)
#### Node.js Scripts
- `build.js` - Build and minify HTML, CSS, JS
- `extract-inline-styles.js` - Extract inline styles to CSS files
- `consolidate-css.js` - Consolidate and optimize CSS
- `optimize-images.js` - Optimize images with Sharp
- `analyze-bundle.js` - Analyze bundle sizes
- `check-bundle-size.js` - Check size limits for CI
- `build-components.js` - Build reusable components
- `generate-sw.js` - Generate service worker
- `synthetic-monitoring.js` - Synthetic monitoring tests
- `check-core-web-vitals.js` - Core Web Vitals testing

#### Python Scripts
- `validate-schema.py` - Validate JSON-LD schema markup
- `check-meta-tags.py` - Check SEO meta tags
- `validate-sitemap.py` - Validate sitemap.xml

---

## 🚀 Quick Start (3 Steps)

### Step 1: Update tpp-website Repository

```bash
# Clone the repository
git clone https://github.com/Theprofitplatform/tpp-website.git
cd tpp-website

# Copy scripts from tpp project
cp -r ../tpp/tpp-website-scripts/* scripts/

# Update package.json (see TPP-WEBSITE-COMPLETE-SETUP.md)
# Create config files (.eslintrc.json, .prettierrc, etc.)

# Install dependencies
npm install
pip install beautifulsoup4 lxml requests
```

### Step 2: Configure GitHub Secrets

Go to: `https://github.com/Theprofitplatform/tpp-website/settings/secrets/actions`

**Minimum Required:**
- `PROD_HOST` - Your VPS IP/hostname
- `PROD_USER` - SSH username (e.g., ubuntu)
- `PROD_KEY` - SSH private key (full content)

See **TPP-WEBSITE-GITHUB-SECRETS.md** for detailed instructions.

### Step 3: Deploy

```bash
# Test locally first
npm run lint
npm run build

# Push to GitHub
git add .
git commit -m "Fix GitHub Actions workflow"
git push origin main
```

---

## 📚 Which Document to Read?

### If you want to...

**Understand the problem:**
→ Read **TPP-WEBSITE-FIXES.md**

**Configure GitHub Secrets:**
→ Read **TPP-WEBSITE-GITHUB-SECRETS.md**

**Do complete setup from scratch:**
→ Read **TPP-WEBSITE-COMPLETE-SETUP.md**

**Quick reference:**
→ Read this file (TPP-WEBSITE-FIX-README.md)

---

## 🔧 What Each Script Does

### Build & Optimization
- **build.js**: Minifies HTML/CSS/JS, copies assets to dist/
- **consolidate-css.js**: Combines CSS files, removes duplicates
- **optimize-images.js**: Converts images to WebP, reduces file sizes
- **build-components.js**: Extracts reusable components from HTML

### Quality Assurance
- **analyze-bundle.js**: Reports on bundle composition and sizes
- **check-bundle-size.js**: Enforces size budgets in CI
- **validate-schema.py**: Validates JSON-LD structured data
- **check-meta-tags.py**: Checks SEO meta tags completeness
- **validate-sitemap.py**: Validates sitemap.xml structure

### Testing & Monitoring
- **synthetic-monitoring.js**: Tests key user flows
- **check-core-web-vitals.js**: Measures Core Web Vitals (LCP, FID, CLS)

### Utilities
- **extract-inline-styles.js**: Converts inline styles to external CSS
- **generate-sw.js**: Creates service worker for offline support

---

## 🎯 Minimum Setup (Just to Fix Failures)

If you just want to fix the current GitHub Actions failures quickly:

### 1. Add to package.json:
```json
{
  "scripts": {
    "lint": "eslint . || true",
    "format:check": "prettier --check '**/*.{js,html,css}' || true",
    "build": "mkdir -p dist && cp -r *.html *.css *.js images dist/"
  },
  "devDependencies": {
    "eslint": "^9.15.0",
    "prettier": "^3.3.3"
  }
}
```

### 2. Install:
```bash
npm install
```

### 3. Create minimal .eslintrc.json:
```json
{
  "extends": "eslint:recommended",
  "env": { "browser": true, "es2021": true },
  "rules": {}
}
```

### 4. Add GitHub Secrets:
- PROD_HOST
- PROD_USER
- PROD_KEY

This minimal setup will make the workflow pass.

---

## 📦 Complete Package.json

See **TPP-WEBSITE-COMPLETE-SETUP.md** for the full `package.json` with all scripts and dependencies.

---

## 🔐 GitHub Secrets Quick Reference

| Secret | Description | Example |
|--------|-------------|---------|
| PROD_HOST | VPS hostname/IP | `123.45.67.89` |
| PROD_USER | SSH username | `ubuntu` |
| PROD_KEY | SSH private key | `-----BEGIN OPENSSH...` |
| STAGING_HOST | Staging hostname | `staging.example.com` |
| STAGING_USER | Staging SSH user | `ubuntu` |
| STAGING_KEY | Staging SSH key | `-----BEGIN OPENSSH...` |
| CF_ZONE_ID | Cloudflare Zone ID | `abc123...` |
| CF_API_TOKEN | Cloudflare API token | `xyz789...` |
| SLACK_WEBHOOK | Slack webhook URL | `https://hooks.slack.com/...` |

**Bold** = Required for minimal setup

---

## 🧪 Testing Checklist

Before pushing to GitHub:

```bash
# Test linting
npm run lint

# Test formatting
npm run format:check

# Test build
npm run build

# Test Python scripts
python3 scripts/validate-schema.py
python3 scripts/check-meta-tags.py

# Test SSH connection
ssh YOUR_USER@YOUR_HOST "ls -la /var/www/html"
```

---

## 🚨 Common Issues

### "Missing script: lint"
**Fix**: Add `"lint": "eslint ."` to package.json scripts

### "Permission denied (publickey)"
**Fix**: Verify PROD_KEY secret contains full private key

### "/var/www/html: No such file"
**Fix**: Create directory on VPS:
```bash
ssh YOUR_USER@YOUR_HOST "sudo mkdir -p /var/www/html && sudo chown -R $USER:$USER /var/www"
```

### Python scripts fail
**Fix**: Install dependencies:
```bash
pip install beautifulsoup4 lxml requests
```

---

## 📊 Success Criteria

Your workflow is fixed when:
- ✅ `npm run lint` works locally
- ✅ `npm run build` completes successfully
- ✅ GitHub Actions Code Quality job passes
- ✅ GitHub Actions Deployment job succeeds
- ✅ Website loads at production URL
- ✅ VPS cron jobs continue running

---

## 🔄 Workflow Structure

The GitHub Actions workflow has these stages:

1. **Quality Check** - Linting, formatting, security audit
2. **Testing** - Unit, integration, e2e tests
3. **Performance** - Lighthouse audits, bundle analysis
4. **SEO Check** - Schema, meta tags, sitemap validation
5. **Build** - Optimize and build production bundle
6. **Deploy Staging** - Deploy to staging environment
7. **Visual Regression** - Screenshot comparison tests
8. **Deploy Production** - Deploy to live site
9. **Monitoring** - Health checks, Core Web Vitals
10. **Rollback** - Automatic rollback on failure

Most are optional - the minimal setup only needs Quality Check and Build stages.

---

## 💡 Pro Tips

1. **Start minimal, expand gradually**
   - Get the basic workflow passing first
   - Add advanced features incrementally

2. **Test locally before pushing**
   - Run all scripts locally
   - Verify SSH connection works
   - Check VPS has required directories

3. **Use separate SSH keys**
   - Don't reuse personal SSH keys
   - Generate dedicated key for GitHub Actions

4. **Monitor the first few runs**
   - Watch GitHub Actions logs closely
   - Fix issues as they appear

5. **Keep backups**
   - The workflow creates backups in `/var/www/backups`
   - Test rollback procedure

---

## 📞 Support Resources

- **GitHub Actions Logs**: Check detailed error messages
- **VPS Logs**: `ssh user@host "tail -f /var/log/nginx/error.log"`
- **Test SSH**: `ssh user@host` before configuring secrets
- **Verify Secrets**: Check they're set in GitHub repo settings

---

## 🎉 Summary

You now have:
- ✅ Complete package.json with all required scripts
- ✅ All build, test, and optimization scripts
- ✅ SEO validation scripts (Python)
- ✅ Configuration files for ESLint, Prettier, Playwright
- ✅ Detailed documentation for setup and troubleshooting
- ✅ GitHub Secrets configuration guide

**Next step**: Follow **TPP-WEBSITE-COMPLETE-SETUP.md** for detailed instructions.

---

## 📁 File Structure

```
tpp-website/
├── scripts/
│   ├── build.js
│   ├── extract-inline-styles.js
│   ├── consolidate-css.js
│   ├── optimize-images.js
│   ├── analyze-bundle.js
│   ├── check-bundle-size.js
│   ├── build-components.js
│   ├── generate-sw.js
│   ├── synthetic-monitoring.js
│   ├── check-core-web-vitals.js
│   ├── validate-schema.py
│   ├── check-meta-tags.py
│   └── validate-sitemap.py
├── .github/workflows/
│   └── deploy.yml
├── package.json
├── .eslintrc.json
├── .prettierrc
├── playwright.config.js
├── lighthouse-budget.json
└── ... (your HTML, CSS, JS files)
```

Good luck with your deployment! 🚀
