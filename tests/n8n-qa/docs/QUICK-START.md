# Quick Start Guide

Get up and running with n8n QA Test Harness in 5 minutes.

## Prerequisites

- Node.js 20+ installed
- Access to n8n instance (https://n8n.theprofitplatform.com.au)
- n8n API token (from n8n Settings → API)
- Test webhook URLs (NOT production!)

## Step 1: Install Dependencies

```bash
cd tests/n8n-qa
npm install
```

## Step 2: Configure Environment

Create `.env` file from example:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```bash
# Required
N8N_API_BASE=https://n8n.theprofitplatform.com.au
N8N_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Your workflow IDs (comma-separated)
WORKFLOW_IDS=12,34,56

# Test webhook URLs (IMPORTANT: Use /webhook-test/ NOT /webhook/)
WEBHOOK_TEST_URL_CONTACT_FORM=https://n8n.theprofitplatform.com.au/webhook-test/contact-form-abc123
```

## Step 3: Run Tests

```bash
# Run all tests
npm test

# Run specific test types
npm run test:smoke      # Quick validation
npm run test:contract   # Schema validation
npm run test:error      # Error handling
```

## Step 4: Generate Report

```bash
npm run report
```

View report: `docs/TEST-REPORT.md`

## Step 5: (Optional) Deploy to VPS

Configure VPS settings in `.env`:

```bash
VPS_HOST=n8n.theprofitplatform.com.au
VPS_USER=root
VPS_DEPLOY_PATH=/opt/n8n-qa
```

Deploy:

```bash
npm run deploy:vps
```

This sets up automated nightly test runs via systemd timer.

## Common Issues

### "n8n health check failed"
- Check `N8N_API_BASE` URL is correct
- Verify `N8N_API_TOKEN` is valid
- Ensure n8n instance is accessible

### "Workflow not found"
- Verify workflow IDs in `WORKFLOW_IDS` exist
- Check workflows are activated in n8n UI

### "SECURITY: Production webhook URL detected"
- Use test URLs: `/webhook-test/...`
- NOT production URLs: `/webhook/...`

### "Polling timeout"
- Increase `POLL_MAX_ATTEMPTS` in `.env`
- Check workflow is executing correctly in n8n UI

## Next Steps

- Add more test fixtures in `fixtures/<workflow-slug>/`
- Create custom schemas in `src/schema/index.ts`
- Configure GitHub Actions CI (see `.github/workflows/ci.yml`)
- Export workflows: `npm run export:workflows`
- Generate Postman collection: `npm run postman`

## Getting Help

- Check README.md for detailed documentation
- Review test examples in `tests/` directory
- Verify n8n workflow configuration in n8n UI
