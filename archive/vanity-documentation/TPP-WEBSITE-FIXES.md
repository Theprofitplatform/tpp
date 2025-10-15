# TPP-Website GitHub Actions Fixes

## Overview
The `tpp-website` repository's GitHub Actions workflow is failing due to missing dependencies, scripts, and configuration. This document provides everything needed to fix the issues.

## Current Issues

### Run #16 Failed With:
1. **Code Quality & Linting** - `npm run lint` script missing
2. **Automatic Rollback** - Missing SSH credentials (PROD_HOST, PROD_USER, PROD_KEY)
3. **Multiple other scripts referenced in workflow but not defined**

---

## Part 1: Update package.json

Replace the current minimal `package.json` in `tpp-website` repository with the comprehensive version below.

### Complete package.json for tpp-website

```json
{
  "name": "tpp-website",
  "version": "1.0.0",
  "description": "The Profit Platform - Production Website",
  "type": "module",
  "scripts": {
    "dev": "http-server . -p 8080",
    "build": "node scripts/build.js",
    "preview": "http-server dist -p 8080",

    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write \"**/*.{js,mjs,cjs,html,css,md,json}\"",
    "format:check": "prettier --check \"**/*.{js,mjs,cjs,html,css,md,json}\"",

    "test": "NODE_OPTIONS=--experimental-vm-modules jest",
    "test:integration": "NODE_OPTIONS=--experimental-vm-modules jest --testPathPattern=integration",
    "test:playwright": "playwright test",
    "test:visual": "playwright test --config=playwright.visual.config.js",
    "test:synthetic": "node scripts/synthetic-monitoring.js",
    "test:cwv": "node scripts/check-core-web-vitals.js",

    "extract:inline-styles": "node scripts/extract-inline-styles.js",
    "consolidate:css": "node scripts/consolidate-css.js",
    "build:components": "node scripts/build-components.js",
    "optimize:images": "node scripts/optimize-images.js",
    "analyze": "node scripts/analyze-bundle.js"
  },
  "devDependencies": {
    "@playwright/test": "^1.48.0",
    "@types/jest": "^29.5.12",
    "eslint": "^9.15.0",
    "eslint-config-prettier": "^9.1.0",
    "http-server": "^14.1.1",
    "jest": "^29.7.0",
    "prettier": "^3.3.3",
    "playwright": "^1.48.0"
  },
  "dependencies": {
    "cheerio": "^1.0.0",
    "clean-css": "^5.3.3",
    "glob": "^11.0.0",
    "html-minifier-terser": "^7.2.0",
    "sharp": "^0.33.5",
    "terser": "^5.36.0"
  }
}
```

---

## Part 2: Required GitHub Secrets

Add these secrets in the GitHub repository settings:
`https://github.com/Theprofitplatform/tpp-website/settings/secrets/actions`

### Production Server Secrets
- **PROD_HOST**: Production server hostname (e.g., `your-server.com`)
- **PROD_USER**: SSH username (e.g., `ubuntu` or `root`)
- **PROD_KEY**: SSH private key content (full key including `-----BEGIN OPENSSH PRIVATE KEY-----`)

### Staging Server Secrets (if applicable)
- **STAGING_HOST**: Staging server hostname
- **STAGING_USER**: SSH username
- **STAGING_KEY**: SSH private key

### Cloudflare Secrets
- **CF_ZONE_ID**: Your Cloudflare Zone ID
- **CF_API_TOKEN**: Cloudflare API token with cache purge permissions

### Notification Secrets (optional)
- **SLACK_WEBHOOK**: Slack webhook URL for deployment notifications

---

## Part 3: Create Missing Script Files

All scripts should be created in the `scripts/` directory of the `tpp-website` repository.

### File locations created in next section:
- `scripts/build.js`
- `scripts/extract-inline-styles.js`
- `scripts/consolidate-css.js`
- `scripts/build-components.js`
- `scripts/optimize-images.js`
- `scripts/analyze-bundle.js`
- `scripts/check-bundle-size.js`
- `scripts/validate-schema.py`
- `scripts/check-meta-tags.py`
- `scripts/validate-sitemap.py`
- `scripts/generate-sw.js`
- `scripts/synthetic-monitoring.js`
- `scripts/check-core-web-vitals.js`

---

## Part 4: Python Scripts Requirements

Install Python dependencies for SEO validation scripts:

```bash
pip install beautifulsoup4 lxml requests
```

---

## Part 5: Missing Configuration Files

### Create `.eslintrc.json`:
```json
{
  "extends": ["eslint:recommended", "prettier"],
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": "warn",
    "no-console": "off"
  }
}
```

### Create `.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

### Create `lighthouse-budget.json`:
```json
{
  "budget": [
    {
      "path": "/*",
      "timings": [
        {
          "metric": "interactive",
          "budget": 3000
        },
        {
          "metric": "first-contentful-paint",
          "budget": 1500
        }
      ],
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": 200
        },
        {
          "resourceType": "stylesheet",
          "budget": 100
        }
      ]
    }
  ]
}
```

### Create `playwright.config.js`:
```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.TEST_URL || 'http://localhost:8080',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Quick Start Guide

### 1. Clone the tpp-website repository
```bash
git clone https://github.com/Theprofitplatform/tpp-website.git
cd tpp-website
```

### 2. Copy all script files from the next document

### 3. Update package.json
Replace the existing minimal package.json with the complete version above.

### 4. Install dependencies
```bash
npm install
```

### 5. Configure GitHub Secrets
Add all required secrets in GitHub repository settings.

### 6. Test locally
```bash
npm run lint
npm run format:check
npm run test
npm run build
```

### 7. Push changes
```bash
git add .
git commit -m "Add missing scripts and dependencies for GitHub Actions"
git push origin main
```

---

## Simplified Alternative Workflow

If the full production pipeline is too complex for now, you can replace the workflow with a simpler version that matches your current setup. Create `.github/workflows/deploy-simple.yml`:

```yaml
name: Simple Deployment

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint
        continue-on-error: true

      - name: Build website
        run: npm run build

      - name: Deploy to production
        uses: appleboy/scp-action@master
        if: github.ref == 'refs/heads/main'
        with:
          host: ${{ secrets.PROD_HOST }}
          username: ${{ secrets.PROD_USER }}
          key: ${{ secrets.PROD_KEY }}
          source: "dist/*"
          target: "/var/www/html"
```

This simplified workflow requires only:
- PROD_HOST
- PROD_USER
- PROD_KEY

And will still lint and deploy your site.
