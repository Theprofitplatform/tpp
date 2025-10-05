# Usage Guide

Comprehensive usage guide for n8n QA Test Harness.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)
- [VPS Deployment](#vps-deployment)
- [Troubleshooting](#troubleshooting)

---

## Installation

### 1. Clone and Install

```bash
cd tests/n8n-qa
npm install
```

### 2. Create Environment File

```bash
cp .env.example .env
```

### 3. Get n8n API Token

1. Log in to n8n: https://n8n.theprofitplatform.com.au
2. Go to **Settings** → **API**
3. Click **Create API Key**
4. Copy the token

### 4. Configure Environment

Edit `.env`:

```bash
# n8n API Configuration
N8N_API_BASE=https://n8n.theprofitplatform.com.au
N8N_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYzg5YTg4ZS0wMTJkLTQ0YjItODExYS0yNTJhY2RiNWVjZGUiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU5NTczODkzfQ.pZwCkHZWRxCEZ0ov2C-GTTyZ0dLrdWVG_V_-vS9zxVM

# Workflow IDs (comma-separated)
WORKFLOW_IDS=12,34,56

# Webhook Test URLs (IMPORTANT: Use /webhook-test/ NOT /webhook/)
WEBHOOK_TEST_URL_CONTACT_FORM=https://n8n.theprofitplatform.com.au/webhook-test/contact-form-abc123
WEBHOOK_TEST_URL_LEAD_CAPTURE=https://n8n.theprofitplatform.com.au/webhook-test/lead-capture-xyz789
```

---

## Configuration

### Getting Webhook URLs

#### In n8n Workflow Editor:

1. Open workflow in n8n
2. Click on **Webhook** node
3. Find **Test URL** (looks like `/webhook-test/...`)
4. Copy **Test URL** (NOT Production URL!)

#### Add to .env:

```bash
# Convert workflow name to environment variable format:
# "Contact Form" → WEBHOOK_TEST_URL_CONTACT_FORM
# "Lead Capture" → WEBHOOK_TEST_URL_LEAD_CAPTURE

WEBHOOK_TEST_URL_CONTACT_FORM=https://n8n.theprofitplatform.com.au/webhook-test/your-webhook-path
```

### Getting Workflow IDs

#### In n8n:

1. Open workflow
2. Look at URL: `https://n8n.../workflow/123`
3. ID is `123`

#### Add to .env:

```bash
WORKFLOW_IDS=12,34,56
```

Or individually:

```bash
WORKFLOW_ID_CONTACT_FORM=12
WORKFLOW_ID_LEAD_CAPTURE=34
```

---

## Running Tests

### All Tests

```bash
npm test
```

### Test Types

```bash
# Smoke tests (quick validation)
npm run test:smoke

# Contract tests (schema validation)
npm run test:contract

# Error tests (error handling)
npm run test:error

# Schedule tests (cron workflows)
npm run test:schedule
```

### Watch Mode

```bash
npm run test:watch
```

### CI Mode (JSON output)

```bash
npm run test:ci
```

### Specific Test File

```bash
npx vitest run tests/contact-form.test.ts
```

### Specific Test

```bash
npx vitest run -t "should process valid submission"
```

---

## Writing Tests

### 1. Create Fixtures

Create directory and files:

```bash
mkdir -p fixtures/my-workflow
touch fixtures/my-workflow/valid.json
touch fixtures/my-workflow/minimal.json
touch fixtures/my-workflow/invalid.json
```

Example `valid.json`:

```json
{
  "email": "test@example.com",
  "name": "John Doe",
  "message": "Hello world"
}
```

### 2. Add Webhook URL to .env

```bash
WEBHOOK_TEST_URL_MY_WORKFLOW=https://n8n.theprofitplatform.com.au/webhook-test/my-workflow-abc123
```

### 3. Create Test File

Create `tests/my-workflow.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { n8nAPI } from '@/lib/api';
import { pollExecutionById } from '@/lib/poll';
import { assertExecutionSuccess, assertTestWebhookUrl } from '@/lib/assert';
import { getWebhookTestUrl } from '@/lib/config';

import validPayload from '../fixtures/my-workflow/valid.json';

describe('My Workflow [smoke]', () => {
  let webhookUrl: string;

  beforeEach(() => {
    webhookUrl = getWebhookTestUrl('my-workflow');
    assertTestWebhookUrl(webhookUrl);
  });

  it('should process valid submission', async () => {
    const response = await n8nAPI.triggerWebhook(webhookUrl, validPayload);
    expect(response.status).toBe(200);

    if (response.data?.executionId) {
      const pollResult = await pollExecutionById(response.data.executionId);
      assertExecutionSuccess(pollResult.execution);
    }
  });
});
```

### 4. Define Schema (Optional)

Edit `src/schema/index.ts`:

```typescript
export const myWorkflowSchema = z.object({
  success: z.boolean(),
  data: z.object({
    email: z.string().email(),
    name: z.string(),
  }),
});
```

### 5. Run Your Test

```bash
npx vitest run tests/my-workflow.test.ts
```

---

## Test Patterns

### Smoke Test Pattern

```typescript
describe('Workflow [smoke]', () => {
  it('should execute successfully', async () => {
    const response = await n8nAPI.triggerWebhook(webhookUrl, minimalPayload);
    assertWebhookSuccess(response.status, response.data);

    const pollResult = await pollExecutionById(response.data.executionId);
    assertExecutionSuccess(pollResult.execution);
  });
});
```

### Contract Test Pattern

```typescript
describe('Workflow [contract]', () => {
  it('should return valid schema', async () => {
    const response = await n8nAPI.triggerWebhook(webhookUrl, validPayload);

    const result = mySchema.safeParse(response.data);
    expect(result.success).toBe(true);
  });
});
```

### Error Test Pattern

```typescript
describe('Workflow [error]', () => {
  it('should reject invalid input', async () => {
    const response = await n8nAPI.triggerWebhook(webhookUrl, invalidPayload);

    assertWebhookError(response.status);
    expect(response.data?.error).toBeDefined();
  });
});
```

### Schedule Test Pattern

```typescript
describe('Workflow [schedule]', () => {
  it('should have run recently', async () => {
    const pollResult = await pollScheduledExecution(workflowId, 1440); // 24h
    assertExecutionSuccess(pollResult.execution);
  });
});
```

---

## CI/CD Integration

### GitHub Actions Setup

1. **Add Secrets to GitHub Repository:**

   Go to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

   Add:
   - `N8N_API_BASE`
   - `N8N_API_TOKEN`
   - `WORKFLOW_IDS`
   - `WEBHOOK_TEST_URL_CONTACT_FORM`
   - `WEBHOOK_TEST_URL_LEAD_CAPTURE`
   - `SLACK_WEBHOOK_URL` (optional)

2. **Enable GitHub Actions:**

   The workflow file is already created at `.github/workflows/ci.yml`

3. **Trigger Workflow:**

   - Push to `main` or `develop`
   - Create a pull request
   - Wait for nightly cron (2 AM UTC)
   - Manual: **Actions** → **n8n QA Test Suite** → **Run workflow**

### View Test Results

1. Go to **Actions** tab in GitHub
2. Click on workflow run
3. Download **test-results** artifact
4. View `TEST-REPORT.md`

---

## VPS Deployment

### Prerequisites

- VPS with root access
- SSH key authentication
- Node.js 20+ on VPS

### Deploy

```bash
npm run deploy:vps
```

This will:
1. Copy files to VPS
2. Install dependencies
3. Create systemd service and timer
4. Run initial test

### Manage VPS Tests

```bash
# Check timer status
ssh root@n8n.theprofitplatform.com.au "systemctl status n8n-qa.timer"

# View logs
ssh root@n8n.theprofitplatform.com.au "tail -f /opt/n8n-qa/logs/test.log"

# Run tests manually
ssh root@n8n.theprofitplatform.com.au "cd /opt/n8n-qa && npm test"

# Generate report
ssh root@n8n.theprofitplatform.com.au "cd /opt/n8n-qa && npm run report"
```

See [VPS-SETUP.md](docs/VPS-SETUP.md) for detailed instructions.

---

## Workflow Export & Validation

### Export Workflows

```bash
npm run export:workflows
```

Exports all workflows to `exports/workflows/*.json`

### Validate Workflow JSON

```bash
npm run validate:workflows
```

Validates structure and integrity of exported workflows.

---

## Generate Postman Collection

```bash
npm run postman
```

Generates Postman collection at `exports/n8n-qa-postman-collection.json`

Import into Postman for manual testing.

---

## Test Reports

### Generate Report

```bash
npm run report
```

Output: `docs/TEST-REPORT.md`

### Report Contents

- Summary (total, passed, failed, pass rate)
- Test suite breakdown
- Failed test details
- Recommendations

### View Report

```bash
cat docs/TEST-REPORT.md
```

---

## Troubleshooting

### "n8n health check failed"

**Cause:** Cannot connect to n8n instance

**Solutions:**
1. Check `N8N_API_BASE` URL is correct
2. Verify `N8N_API_TOKEN` is valid
3. Test connection: `curl -H "X-N8N-API-KEY: your-token" https://n8n.theprofitplatform.com.au/api/v1/workflows`

### "Workflow not found"

**Cause:** Workflow ID doesn't exist or is inaccessible

**Solutions:**
1. Verify workflow ID in n8n UI
2. Check workflow is not deleted
3. Ensure API token has access to workflow

### "SECURITY: Production webhook URL detected"

**Cause:** Using production URL instead of test URL

**Solutions:**
1. Use **Test URL** from n8n webhook node
2. URL must contain `/webhook-test/` not `/webhook/`
3. Update `.env` with correct test URL

### "Polling timeout"

**Cause:** Execution didn't complete within timeout

**Solutions:**
1. Increase timeout in `.env`:
   ```bash
   TEST_TIMEOUT=60000
   POLL_MAX_ATTEMPTS=60
   ```
2. Check workflow is executing in n8n UI
3. Review workflow for infinite loops or errors

### "Schema validation failed"

**Cause:** Response doesn't match expected schema

**Solutions:**
1. Check actual response: `console.log(response.data)`
2. Update schema in `src/schema/index.ts`
3. Verify workflow returns expected structure

### Tests fail on VPS but pass locally

**Cause:** Environment differences

**Solutions:**
1. Check `.env` file on VPS: `ssh root@vps "cat /opt/n8n-qa/.env"`
2. Verify n8n instance is accessible from VPS
3. Check firewall rules
4. Test manually: `ssh root@vps "cd /opt/n8n-qa && npm test"`

---

## Best Practices

### ✅ DO

- Use test webhook URLs (`/webhook-test/`)
- Write descriptive test names
- Add comprehensive fixtures (valid, minimal, invalid)
- Use schemas for contract testing
- Run tests before deploying workflows
- Generate reports after test runs
- Keep .env file secure and git-ignored

### ❌ DON'T

- Use production webhook URLs
- Hardcode credentials in code
- Skip error tests
- Ignore failed tests
- Commit .env file
- Test production workflows directly
- Overload n8n with too many concurrent tests

---

## Advanced Usage

### Custom Assertions

Create custom assertions in `src/lib/assert.ts`:

```typescript
export function assertCustomCondition(data: any): void {
  expect(data.customField).toBeDefined();
  expect(data.customField).toMatch(/pattern/);
}
```

### Custom Polling

Customize polling behavior:

```typescript
const pollResult = await pollExecutionById(executionId, {
  interval: 500,        // Poll every 500ms
  maxAttempts: 60,      // Max 60 attempts (30s)
});
```

### Environment-Specific Configuration

Create multiple `.env` files:

```bash
.env.local      # Local development
.env.staging    # Staging environment
.env.production # Production (VPS)
```

Load specific env:

```bash
cp .env.staging .env
npm test
```

---

## Support

- **Documentation:** See `docs/` directory
- **Examples:** Review `tests/` directory
- **Issues:** Check n8n workflow configuration
- **VPS Help:** See [VPS-SETUP.md](docs/VPS-SETUP.md)
- **Architecture:** See [ARCHITECTURE.md](docs/ARCHITECTURE.md)
