# n8n Automated Test Harness

Complete QA automation for n8n workflows with webhook testing, schedule validation, and CI/CD integration.

## 🚀 Features

- **Webhook Testing**: Smoke, contract, and error validation with Test URLs
- **Schedule Validation**: Verify cron/triggered workflows via execution freshness
- **API Integration**: Full n8n Public API coverage for workflow management
- **Schema Validation**: Zod-based contract testing for output validation
- **CI/CD Ready**: GitHub Actions pipeline with nightly runs
- **VPS Deployment**: Direct deployment and execution on self-hosted n8n instances
- **Test Reports**: Automated Markdown reports with execution summaries

## 📁 Project Structure

```
n8n-qa/
├── src/
│   ├── lib/
│   │   ├── api.ts           # n8n API client
│   │   ├── poll.ts          # Execution polling utilities
│   │   ├── assert.ts        # Custom assertions
│   │   └── config.ts        # Environment configuration
│   └── schema/
│       └── index.ts         # Zod schemas for validation
├── tests/
│   ├── setup.ts             # Global test setup
│   └── *.test.ts            # Workflow tests
├── fixtures/
│   └── <slug>/              # Test payloads per workflow
│       ├── valid.json
│       ├── invalid.json
│       └── minimal.json
├── scripts/
│   ├── export-workflows.ts  # Workflow JSON export
│   ├── validate-workflows.ts
│   ├── generate-report.ts
│   └── deploy-to-vps.sh
└── docs/
    └── TEST-REPORT.md       # Generated test report
```

## 🔧 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

**Required variables:**
- `N8N_API_BASE` - Your n8n instance URL
- `N8N_API_TOKEN` - API token from n8n settings
- `WEBHOOK_TEST_URL_<SLUG>` - Test webhook URLs (NOT production!)
- `WORKFLOW_IDS` - Comma-separated workflow IDs to test

### 3. Run Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Specific test types
npm run test:smoke      # Quick validation
npm run test:contract   # Schema validation
npm run test:error      # Error handling
npm run test:schedule   # Scheduled workflows

# CI mode with JSON report
npm run test:ci
```

## 🧪 Test Modes

### Smoke Tests
Minimal payload validation - ensures workflow executes successfully:
- Sends minimal valid payload to Test webhook URL
- Polls for execution completion
- Asserts 2xx response + success status

### Contract Tests
Output schema validation with Zod:
- Sends comprehensive payload
- Validates response structure matches schema
- Ensures data types and required fields

### Error Tests
Invalid payload handling:
- Sends malformed/invalid payloads
- Verifies error workflow triggers
- Validates error messages and codes

### Schedule Tests
Cron/event-triggered workflow validation:
- Queries `/executions` for recent runs
- Validates execution freshness (startedAt >= threshold)
- Checks execution success rate

## 📊 Test Reports

Generate comprehensive test report:

```bash
npm run report
```

Output: `docs/TEST-REPORT.md` with:
- Execution summary (pass/fail/skip)
- Performance metrics
- Coverage breakdown
- Failed test details
- Recommendations

## 🚀 VPS Deployment

Deploy test harness to your n8n VPS:

```bash
npm run deploy:vps
```

This script:
1. SSH to VPS (`VPS_HOST`, `VPS_USER` from .env)
2. Creates deployment directory (`VPS_DEPLOY_PATH`)
3. Copies source files
4. Installs dependencies
5. Sets up systemd service for scheduled test runs

## 🔄 CI/CD Integration

GitHub Actions workflow (`.github/workflows/ci.yml`):
- **Triggers**: PR, push to main, nightly cron (2 AM UTC)
- **Steps**: Install → Test → Report → Artifact upload
- **Secrets**: `N8N_API_TOKEN`, webhook URLs

## 📦 Workflow Export/Validation

Export all workflows as JSON:

```bash
npm run export:workflows
```

Validate workflow JSON structure:

```bash
npm run validate:workflows
```

## 🔐 Security Notes

- **NEVER use production webhook URLs in tests**
- Always use Test URLs (`/webhook-test/...`)
- Store API tokens in `.env` (git-ignored)
- Mask secrets in CI logs
- Use honeypot fields in test payloads

## 📚 Writing Tests

Example test file (`tests/contact-form.test.ts`):

```typescript
import { describe, it, expect } from 'vitest';
import { n8nAPI, pollExecution } from '@/lib/api';
import { contactFormSchema } from '@/schema';
import validPayload from '../fixtures/contact-form/valid.json';

describe('Contact Form Workflow [smoke]', () => {
  it('should process valid submission', async () => {
    const webhookUrl = process.env.WEBHOOK_TEST_URL_CONTACT_FORM!;
    const response = await n8nAPI.post(webhookUrl, validPayload);

    expect(response.status).toBe(200);

    const execution = await pollExecution(response.data.executionId);
    expect(execution.status).toBe('success');
  });
});

describe('Contact Form Workflow [contract]', () => {
  it('should return valid schema', async () => {
    const webhookUrl = process.env.WEBHOOK_TEST_URL_CONTACT_FORM!;
    const response = await n8nAPI.post(webhookUrl, validPayload);

    const validated = contactFormSchema.parse(response.data);
    expect(validated).toBeDefined();
  });
});
```

## 🛠️ Maintenance

- **Update fixtures**: Add new test cases to `fixtures/<slug>/`
- **Add schemas**: Define new Zod schemas in `src/schema/`
- **Extend API client**: Add new endpoints to `src/lib/api.ts`
- **CI schedule**: Adjust cron in `.github/workflows/ci.yml`

## 📞 Support

Issues? Check:
1. `.env` configuration (API token, webhook URLs)
2. n8n instance accessibility
3. Workflow activation status in n8n UI
4. Test webhook URLs (not production!)

For VPS access issues, verify SSH keys and permissions.
