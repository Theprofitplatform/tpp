# 🚀 n8n QA Test Harness - Deployment Checklist

## ✅ Completed

- [x] Project structure created
- [x] Dependencies installed (269 packages)
- [x] TypeScript configuration
- [x] API client implementation
- [x] Polling utilities
- [x] Schema validation (Zod)
- [x] Test framework (Vitest)
- [x] Sample tests (contact-form, scheduled-workflow)
- [x] Test fixtures (valid, minimal, invalid)
- [x] CI/CD pipeline (GitHub Actions)
- [x] VPS deployment script
- [x] Report generation
- [x] Workflow export/validation
- [x] Postman collection generator
- [x] Comprehensive documentation
- [x] Security enforcement (test URLs only)
- [x] .env file created with API token

## 📋 Your Action Items

### 1. Configure Workflows (Required)

Edit `tests/n8n-qa/.env` and add:

```bash
# Get workflow IDs from n8n UI:
# 1. Open workflow in n8n
# 2. Look at URL: https://n8n.theprofitplatform.com.au/workflow/123
# 3. ID is "123"
WORKFLOW_IDS=12,34,56  # Replace with your actual workflow IDs

# Get webhook test URLs from n8n UI:
# 1. Open workflow in n8n
# 2. Click on Webhook node
# 3. Copy "Test URL" (NOT Production URL!)
WEBHOOK_TEST_URL_CONTACT_FORM=https://n8n.theprofitplatform.com.au/webhook-test/your-path
WEBHOOK_TEST_URL_LEAD_CAPTURE=https://n8n.theprofitplatform.com.au/webhook-test/your-path
```

### 2. Run Initial Tests

```bash
cd tests/n8n-qa

# Run all tests
npm test

# Or run smoke tests only
npm run test:smoke
```

### 3. Generate First Report

```bash
npm run report
cat docs/TEST-REPORT.md
```

### 4. Export Workflows (Optional)

```bash
npm run export:workflows
npm run validate:workflows
```

### 5. Deploy to VPS (Optional)

```bash
# Configure SSH access if not already done
ssh-copy-id root@n8n.theprofitplatform.com.au

# Deploy
npm run deploy:vps
```

### 6. Setup CI/CD (Optional)

Add secrets to GitHub repository:
- Go to **Settings** → **Secrets and variables** → **Actions**
- Add:
  - `N8N_API_TOKEN`
  - `WORKFLOW_IDS`
  - `WEBHOOK_TEST_URL_CONTACT_FORM`
  - `WEBHOOK_TEST_URL_LEAD_CAPTURE`

## 🎯 Quick Commands Reference

```bash
# Testing
npm test                    # Run all tests
npm run test:smoke          # Quick validation
npm run test:contract       # Schema validation
npm run test:error          # Error handling
npm run test:schedule       # Scheduled workflows
npm run test:watch          # Watch mode

# Workflow Management
npm run export:workflows    # Export workflow JSON
npm run validate:workflows  # Validate workflow JSON

# Reporting
npm run report             # Generate Markdown report

# Deployment
npm run deploy:vps         # Deploy to VPS

# Utilities
npm run postman            # Generate Postman collection
npm run typecheck          # TypeScript validation
```

## 📚 Documentation

- **Getting Started**: `GETTING-STARTED.md`
- **Usage Guide**: `USAGE.md`
- **Quick Start**: `docs/QUICK-START.md`
- **VPS Setup**: `docs/VPS-SETUP.md`
- **Architecture**: `docs/ARCHITECTURE.md`

## 🐛 Troubleshooting

### "n8n health check failed"
- Verify n8n instance is running
- Check API token is valid
- Test: `curl -H "X-N8N-API-KEY: your-token" https://n8n.theprofitplatform.com.au/api/v1/workflows`

### "WORKFLOW_IDS not configured"
- Add workflow IDs to `.env`
- Get IDs from n8n workflow URLs

### "Webhook test URL not found"
- Add test URLs to `.env`
- Use `/webhook-test/` URLs, NOT `/webhook/`

## ✨ Next Steps

1. ✅ **Configure .env** - Add WORKFLOW_IDS and WEBHOOK_TEST_URL_*
2. ✅ **Run tests** - `npm test`
3. ✅ **Review report** - `npm run report && cat docs/TEST-REPORT.md`
4. ✅ **Add more tests** - Create test files in `tests/`
5. ✅ **Deploy to VPS** - `npm run deploy:vps`

## 📊 Project Status

| Component | Status |
|-----------|--------|
| Dependencies | ✅ Installed (269 packages) |
| TypeScript | ✅ Configured |
| Tests | ✅ Ready (awaiting workflow config) |
| CI/CD | ✅ Configured |
| VPS Script | ✅ Ready |
| Documentation | ✅ Complete |

**Current Status**: Ready to test! Configure .env and run `npm test`

---

**Need help?** Check `GETTING-STARTED.md` or `USAGE.md`
