# Architecture Overview

Technical architecture and design decisions for n8n QA Test Harness.

## System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        Test Harness                            │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────┐      ┌──────────────┐      ┌──────────────┐ │
│  │   Tests     │─────►│  API Client  │─────►│ n8n Instance │ │
│  │  (Vitest)   │      │  (Axios)     │      │  Public API  │ │
│  └─────────────┘      └──────────────┘      └──────────────┘ │
│         │                     │                               │
│         │                     │                               │
│         ▼                     ▼                               │
│  ┌─────────────┐      ┌──────────────┐                       │
│  │  Fixtures   │      │   Polling    │                       │
│  │   (JSON)    │      │   Utilities  │                       │
│  └─────────────┘      └──────────────┘                       │
│         │                     │                               │
│         │                     ▼                               │
│         │              ┌──────────────┐                       │
│         └─────────────►│   Schema     │                       │
│                        │ Validation   │                       │
│                        │   (Zod)      │                       │
│                        └──────────────┘                       │
│                               │                               │
│                               ▼                               │
│                        ┌──────────────┐                       │
│                        │   Report     │                       │
│                        │  Generator   │                       │
│                        └──────────────┘                       │
└────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Test Framework (Vitest)

**Location:** `tests/*.test.ts`

**Responsibilities:**
- Execute test suites (smoke, contract, error, schedule)
- Manage test lifecycle (beforeEach, afterEach)
- Generate test results in JSON format

**Design Decisions:**
- ✅ Vitest chosen for speed and TypeScript support
- ✅ Global test setup in `tests/setup.ts`
- ✅ Configurable timeouts for long-running workflows

### 2. API Client

**Location:** `src/lib/api.ts`

**Responsibilities:**
- Wrapper around n8n Public API
- Manage authentication (API token)
- Handle workflow and execution operations

**Key Features:**
- Axios-based HTTP client
- Request/response interceptors for logging
- Error handling and retries
- Separate method for webhook triggers (no auth)

**API Methods:**
```typescript
// Workflow operations
getWorkflow(id: string): Promise<N8nWorkflow>
listWorkflows(): Promise<N8nWorkflow[]>
exportWorkflow(id: string): Promise<any>
activateWorkflow(id: string): Promise<void>

// Execution operations
getExecution(id: string): Promise<N8nExecution>
listExecutions(params: ExecutionListParams): Promise<N8nExecution[]>
deleteExecution(id: string): Promise<void>

// Webhook operations
triggerWebhook(url: string, payload: any): Promise<AxiosResponse>

// Health check
healthCheck(): Promise<boolean>
```

### 3. Polling Utilities

**Location:** `src/lib/poll.ts`

**Responsibilities:**
- Poll n8n executions until completion
- Handle execution timeouts
- Support different polling strategies

**Polling Strategies:**

1. **Poll by Execution ID**
   - Use when webhook returns execution ID
   - Most reliable, direct lookup

2. **Poll Latest Execution**
   - Use when execution ID not returned
   - Filters by workflow ID and timestamp

3. **Poll Scheduled Execution**
   - Use for cron/event-triggered workflows
   - Validates execution freshness

**Configuration:**
```typescript
{
  interval: 1000,        // Poll every 1 second
  maxAttempts: 30,       // Max 30 attempts (30s timeout)
  sinceTimestamp: ISO    // Only check executions after this time
}
```

### 4. Schema Validation (Zod)

**Location:** `src/schema/index.ts`

**Responsibilities:**
- Define expected response structures
- Validate webhook responses
- Type-safe contract testing

**Example Schema:**
```typescript
export const contactFormSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  submissionId: z.string().uuid().optional(),
  timestamp: z.string().datetime().optional(),
  data: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
    message: z.string().min(1),
  }).optional(),
});
```

**Validation Patterns:**
```typescript
// Safe parsing (no throw)
const result = schema.safeParse(data);
if (!result.success) {
  console.error(result.error.format());
}

// Type inference
type ContactFormResponse = z.infer<typeof contactFormSchema>;
```

### 5. Test Fixtures

**Location:** `fixtures/<workflow-slug>/*.json`

**Organization:**
```
fixtures/
├── contact-form/
│   ├── valid.json       # Complete valid payload
│   ├── minimal.json     # Minimal required fields
│   └── invalid.json     # Invalid data (for error tests)
└── lead-capture/
    ├── valid.json
    ├── minimal.json
    └── invalid.json
```

**Design Principles:**
- ✅ Realistic test data
- ✅ Includes edge cases (XSS, SQL injection attempts)
- ✅ Honeypot fields for spam detection tests
- ✅ Metadata for tracking (userAgent, IP, etc.)

### 6. Configuration Management

**Location:** `src/lib/config.ts`

**Responsibilities:**
- Load and validate environment variables
- Provide type-safe configuration access
- Security checks (prevent production URL usage)

**Environment Variables:**
```bash
# Required
N8N_API_BASE=https://n8n.theprofitplatform.com.au
N8N_API_TOKEN=eyJ...

# Workflow configuration
WORKFLOW_IDS=12,34,56
WEBHOOK_TEST_URL_<SLUG>=https://...

# Test configuration
TEST_TIMEOUT=30000
POLL_INTERVAL=1000
POLL_MAX_ATTEMPTS=30
```

**Security Features:**
```typescript
// Prevents accidental production usage
if (url.includes('/webhook/') && !url.includes('/webhook-test/')) {
  throw new Error('Production webhook URL detected!');
}
```

## Test Types & Patterns

### 1. Smoke Tests `[smoke]`

**Purpose:** Quick validation that workflow executes

**Pattern:**
```typescript
it('should process valid submission', async () => {
  const response = await n8nAPI.triggerWebhook(webhookUrl, minimalPayload);
  assertWebhookSuccess(response.status, response.data);

  const pollResult = await pollExecutionById(response.data.executionId);
  assertExecutionSuccess(pollResult.execution);
});
```

**Characteristics:**
- Fast (< 5s per test)
- Minimal payload
- Basic assertions (2xx response, success status)

### 2. Contract Tests `[contract]`

**Purpose:** Validate response structure and data types

**Pattern:**
```typescript
it('should return valid schema', async () => {
  const response = await n8nAPI.triggerWebhook(webhookUrl, validPayload);

  const result = contactFormSchema.safeParse(response.data);
  expect(result.success).toBe(true);
  expect(result.data.message).toBeDefined();
});
```

**Characteristics:**
- Schema validation with Zod
- Type safety
- Comprehensive payload
- Field-level assertions

### 3. Error Tests `[error]`

**Purpose:** Validate error handling and input validation

**Pattern:**
```typescript
it('should reject invalid email', async () => {
  const response = await n8nAPI.triggerWebhook(webhookUrl, invalidPayload);

  assertWebhookError(response.status);
  expect(response.data.error.message).toContain('email');
});
```

**Characteristics:**
- Invalid/malformed payloads
- XSS/injection attempts
- Missing required fields
- Oversized payloads

### 4. Schedule Tests `[schedule]`

**Purpose:** Validate cron/event-triggered workflows

**Pattern:**
```typescript
it('should have executed recently', async () => {
  const pollResult = await pollScheduledExecution(workflowId, 1440); // 24h
  assertExecutionSuccess(pollResult.execution);
  assertScheduledWorkflowFreshness(pollResult.execution, 1440);
});
```

**Characteristics:**
- Execution freshness validation
- Success rate analysis
- No stuck executions
- Reasonable execution time

## CI/CD Pipeline

**Location:** `.github/workflows/ci.yml`

**Workflow:**
```
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ Checkout│──►│ Install │──►│  Test   │──►│ Report  │
└─────────┘   └─────────┘   └─────────┘   └─────────┘
                                   │
                                   ▼
                            ┌──────────────┐
                            │   Artifact   │
                            │    Upload    │
                            └──────────────┘
```

**Triggers:**
- Push to `main`, `develop`
- Pull requests to `main`
- Nightly cron (2 AM UTC)
- Manual dispatch

**Secrets Required:**
- `N8N_API_BASE`
- `N8N_API_TOKEN`
- `WORKFLOW_IDS`
- `WEBHOOK_TEST_URL_*`
- `SLACK_WEBHOOK_URL` (optional)

## VPS Deployment

**Location:** `scripts/deploy-to-vps.sh`

**Deployment Flow:**
```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│   SSH    │──►│  Rsync   │──►│ npm ci   │──►│ Systemd  │
│   Test   │   │  Files   │   │ Install  │   │  Setup   │
└──────────┘   └──────────┘   └──────────┘   └──────────┘
```

**Systemd Components:**

1. **Service:** `/etc/systemd/system/n8n-qa.service`
   - One-shot execution
   - Logs to `/opt/n8n-qa/logs/`

2. **Timer:** `/etc/systemd/system/n8n-qa.timer`
   - Daily execution at 2 AM
   - Persistent (runs missed timers on boot)

## Reporting

**Location:** `scripts/generate-report.ts`

**Report Sections:**
1. Summary (total, passed, failed, skipped, pass rate)
2. Test suites (per-file breakdown)
3. Failed test details (error messages)
4. Recommendations (actionable insights)

**Output Format:** Markdown (`docs/TEST-REPORT.md`)

**Generation:**
```bash
npm run report
```

## Extensibility Points

### 1. Add New Workflow Tests

```bash
# 1. Create fixtures
mkdir -p fixtures/new-workflow
echo '{"field": "value"}' > fixtures/new-workflow/valid.json

# 2. Add webhook URL to .env
echo 'WEBHOOK_TEST_URL_NEW_WORKFLOW=https://...' >> .env

# 3. Create test file
touch tests/new-workflow.test.ts

# 4. Define schema (optional)
# Edit src/schema/index.ts
```

### 2. Add Custom Assertions

```typescript
// src/lib/assert.ts
export function assertCustomCondition(data: any): void {
  expect(data.customField).toBeDefined();
  expect(data.customField).toMatch(/pattern/);
}
```

### 3. Add Custom Schemas

```typescript
// src/schema/index.ts
export const customSchema = z.object({
  customField: z.string(),
  nestedObject: z.object({
    field: z.number(),
  }),
});
```

## Performance Considerations

### 1. Parallel Test Execution

Vitest runs tests in parallel by default. Configure in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    maxConcurrency: 5,  // Max 5 concurrent tests
  },
});
```

### 2. Polling Optimization

- Default: 1s interval, 30 max attempts (30s timeout)
- Adjust based on workflow complexity:
  - Fast workflows: `{ interval: 500, maxAttempts: 20 }`
  - Slow workflows: `{ interval: 2000, maxAttempts: 60 }`

### 3. Caching

- Fixtures loaded once per test file
- API client singleton pattern
- Config loaded once on startup

## Security Considerations

1. **Webhook URL Validation**
   - Enforces `/webhook-test/` prefix
   - Blocks production URLs (`/webhook/`)

2. **Environment Variables**
   - `.env` git-ignored
   - Secrets never committed
   - Masked in CI logs

3. **Input Sanitization Tests**
   - XSS prevention validation
   - SQL injection attempt tests
   - Malformed JSON handling

4. **VPS Security**
   - SSH key authentication
   - Non-root user execution (recommended)
   - Log rotation to prevent disk fill

## Monitoring & Observability

### 1. Test Execution Logs

```bash
# Local
npm test 2>&1 | tee test-execution.log

# VPS
tail -f /opt/n8n-qa/logs/test.log
```

### 2. Systemd Journal

```bash
journalctl -u n8n-qa.service -f
```

### 3. Test Reports

- Generated after every run
- Markdown format for easy review
- Uploaded as CI artifacts

### 4. Metrics Tracked

- Test count (total, passed, failed, skipped)
- Pass rate percentage
- Execution duration
- Poll attempts (efficiency metric)

## Technology Stack

| Component | Technology | Reason |
|-----------|-----------|--------|
| Test Framework | Vitest | Fast, TypeScript native, modern |
| HTTP Client | Axios | Robust, interceptors, timeouts |
| Schema Validation | Zod | Type-safe, composable, error messages |
| Type System | TypeScript | Static typing, IDE support |
| Package Manager | npm | Standard, widely supported |
| CI/CD | GitHub Actions | Integrated, free for public repos |
| Scheduling (VPS) | systemd | Native to Linux, reliable |
| Reporting | Markdown | Readable, version-controllable |

## Future Enhancements

1. **Performance Testing**
   - Load testing with k6 or Artillery
   - Concurrent webhook submissions
   - Throughput benchmarks

2. **Visual Regression**
   - Screenshot comparison for email outputs
   - PDF output validation

3. **Database Validation**
   - Query n8n database directly
   - Validate data persistence

4. **Advanced Reporting**
   - Historical trend analysis
   - Slack/email notifications
   - Grafana dashboards

5. **Multi-Environment Testing**
   - Staging vs Production comparison
   - Cross-instance validation
