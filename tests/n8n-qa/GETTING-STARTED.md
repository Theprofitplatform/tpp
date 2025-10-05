# 🚀 Getting Started with n8n QA Test Harness

Complete automated test harness for your n8n instance at https://n8n.theprofitplatform.com.au

## ✅ What You Get

- ✅ **Automated Testing**: Smoke, contract, error, and schedule tests
- ✅ **CI/CD Integration**: GitHub Actions with nightly runs
- ✅ **VPS Deployment**: Systemd-based scheduled execution
- ✅ **Test Reports**: Markdown reports with actionable insights
- ✅ **Workflow Validation**: Export and validate workflow JSON
- ✅ **Postman Integration**: Generate Postman collections from fixtures

## 📋 Quick Start (5 Minutes)

### Step 1: Install

```bash
cd tests/n8n-qa
npm install
```

### Step 2: Configure

Your `.env` file has been created with your API token. You need to add:

1. **Workflow IDs** - Get from n8n workflow URLs
2. **Webhook Test URLs** - Get from webhook nodes in n8n

```bash
# Edit .env and add:
WORKFLOW_IDS=12,34,56  # Your workflow IDs
WEBHOOK_TEST_URL_CONTACT_FORM=https://n8n.theprofitplatform.com.au/webhook-test/your-path
```

### Step 3: Run Tests

```bash
npm test
```

### Step 4: View Report

```bash
npm run report
cat docs/TEST-REPORT.md
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [README.md](README.md) | Project overview and features |
| [USAGE.md](USAGE.md) | Complete usage guide |
| [docs/QUICK-START.md](docs/QUICK-START.md) | 5-minute quick start |
| [docs/VPS-SETUP.md](docs/VPS-SETUP.md) | VPS deployment guide |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Technical architecture |

## 🎯 Common Tasks

### Run Different Test Types

```bash
npm run test:smoke      # Quick validation
npm run test:contract   # Schema validation
npm run test:error      # Error handling
npm run test:schedule   # Scheduled workflows
```

### Export Workflows

```bash
npm run export:workflows
```

### Deploy to VPS

```bash
npm run deploy:vps
```

### Generate Postman Collection

```bash
npm run postman
```

## 📁 Project Structure

```
n8n-qa/
├── src/
│   ├── lib/          # API client, polling, assertions, config
│   └── schema/       # Zod schemas for validation
├── tests/            # Test files
│   ├── contact-form.test.ts
│   ├── scheduled-workflow.test.ts
│   └── setup.ts
├── fixtures/         # Test payloads
│   ├── contact-form/
│   └── lead-capture/
├── scripts/          # Utility scripts
│   ├── export-workflows.ts
│   ├── validate-workflows.ts
│   ├── generate-report.ts
│   ├── generate-postman.ts
│   └── deploy-to-vps.sh
├── docs/             # Documentation
└── .github/
    └── workflows/
        └── ci.yml    # GitHub Actions CI
```

## 🔧 Configuration Reference

### Required Environment Variables

```bash
N8N_API_BASE=https://n8n.theprofitplatform.com.au  # ✅ Already configured
N8N_API_TOKEN=eyJ...                                # ✅ Already configured
WORKFLOW_IDS=12,34,56                               # ⚠️  YOU NEED TO ADD
WEBHOOK_TEST_URL_<SLUG>=https://...                # ⚠️  YOU NEED TO ADD
```

### How to Get Workflow IDs

1. Open workflow in n8n UI
2. Look at URL: `https://n8n.theprofitplatform.com.au/workflow/123`
3. ID is `123`

### How to Get Webhook Test URLs

1. Open workflow in n8n UI
2. Click on **Webhook** node
3. Copy **Test URL** (NOT Production URL!)
4. Format: `https://n8n.theprofitplatform.com.au/webhook-test/...`

## 🧪 Writing Your First Test

### 1. Create Fixtures

```bash
mkdir -p fixtures/my-workflow
echo '{"email": "test@example.com"}' > fixtures/my-workflow/valid.json
```

### 2. Add Webhook URL to .env

```bash
echo 'WEBHOOK_TEST_URL_MY_WORKFLOW=https://n8n.../webhook-test/...' >> .env
```

### 3. Create Test File

Create `tests/my-workflow.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { n8nAPI } from '@/lib/api';
import { getWebhookTestUrl } from '@/lib/config';
import validPayload from '../fixtures/my-workflow/valid.json';

describe('My Workflow [smoke]', () => {
  it('should process valid submission', async () => {
    const webhookUrl = getWebhookTestUrl('my-workflow');
    const response = await n8nAPI.triggerWebhook(webhookUrl, validPayload);
    expect(response.status).toBe(200);
  });
});
```

### 4. Run Your Test

```bash
npx vitest run tests/my-workflow.test.ts
```

## 🔄 CI/CD Setup

### GitHub Actions

1. Add secrets to GitHub repository:
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Add: `N8N_API_TOKEN`, `WORKFLOW_IDS`, webhook URLs

2. Push code to trigger workflow

3. View results in **Actions** tab

### Automated Schedule

- Tests run nightly at 2 AM UTC
- Results uploaded as artifacts
- PR comments with test results

## 🖥️ VPS Deployment

### One-Command Deploy

```bash
npm run deploy:vps
```

### What It Does

1. SSH to VPS (n8n.theprofitplatform.com.au)
2. Copy files to `/opt/n8n-qa/`
3. Install dependencies
4. Create systemd service + timer
5. Run initial test

### Manage VPS Tests

```bash
# Check status
ssh root@n8n.theprofitplatform.com.au "systemctl status n8n-qa.timer"

# View logs
ssh root@n8n.theprofitplatform.com.au "tail -f /opt/n8n-qa/logs/test.log"

# Run manually
ssh root@n8n.theprofitplatform.com.au "cd /opt/n8n-qa && npm test"
```

## 🚨 Security Notes

### ⚠️ NEVER Use Production URLs

**Production URL (DON'T USE):**
```
❌ https://n8n.theprofitplatform.com.au/webhook/abc123
```

**Test URL (USE THIS):**
```
✅ https://n8n.theprofitplatform.com.au/webhook-test/abc123
```

### The Harness Enforces This

```typescript
// Automatic security check - will throw error if production URL detected
if (url.includes('/webhook/') && !url.includes('/webhook-test/')) {
  throw new Error('SECURITY: Production webhook URL detected!');
}
```

## 📊 Test Report Example

```markdown
# n8n Test Report

## 📊 Summary

| Metric | Value |
|--------|-------|
| Total Tests | 15 |
| ✅ Passed | 14 |
| ❌ Failed | 1 |
| Pass Rate | 93.3% |

## 🧪 Test Suites

### ✅ contact-form.test.ts
- ✅ should process valid submission
- ✅ should return valid schema
- ❌ should reject invalid email

## 💡 Recommendations
- Fix failed test: "should reject invalid email"
```

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm test` | Run all tests |
| `npm run test:watch` | Watch mode |
| `npm run test:smoke` | Smoke tests only |
| `npm run test:contract` | Contract tests only |
| `npm run test:error` | Error tests only |
| `npm run test:schedule` | Schedule tests only |
| `npm run test:ci` | CI mode (JSON output) |
| `npm run report` | Generate test report |
| `npm run export:workflows` | Export workflow JSON |
| `npm run validate:workflows` | Validate workflow JSON |
| `npm run postman` | Generate Postman collection |
| `npm run deploy:vps` | Deploy to VPS |

## 🐛 Troubleshooting

### "n8n health check failed"

```bash
# Test API connection
curl -H "X-N8N-API-KEY: your-token" \
  https://n8n.theprofitplatform.com.au/api/v1/workflows
```

### "Workflow not found"

1. Check workflow ID exists in n8n
2. Verify workflow is not deleted
3. Ensure API token has access

### "Polling timeout"

Increase timeout in `.env`:
```bash
TEST_TIMEOUT=60000
POLL_MAX_ATTEMPTS=60
```

## 📞 Next Steps

1. ✅ **Configure** - Add your workflow IDs and webhook URLs to `.env`
2. ✅ **Test Locally** - Run `npm test` to verify setup
3. ✅ **Add Tests** - Create test files for your workflows
4. ✅ **Deploy to VPS** - Run `npm run deploy:vps` for automated execution
5. ✅ **Setup CI** - Add GitHub Actions secrets for automated testing

## 📚 Learn More

- **Full Documentation**: See [USAGE.md](USAGE.md)
- **VPS Setup**: See [docs/VPS-SETUP.md](docs/VPS-SETUP.md)
- **Architecture**: See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

**🎉 You're ready to go! Start by configuring `.env` and running `npm test`**
