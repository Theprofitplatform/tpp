# SEO Automation Workflows

**Last Updated**: 2025-01-27
**Project**: The Profit Platform (TPP)
**Purpose**: Automated SEO workflows leveraging specialized agents

---

## 📋 Table of Contents

1. [Workflow Overview](#workflow-overview)
2. [Daily Automated Workflows](#daily-automated-workflows)
3. [Weekly Automated Workflows](#weekly-automated-workflows)
4. [Monthly Automated Workflows](#monthly-automated-workflows)
5. [Event-Triggered Workflows](#event-triggered-workflows)
6. [Integration with n8n](#integration-with-n8n)
7. [GitHub Actions Workflows](#github-actions-workflows)

---

## Workflow Overview

### Available Workflow Types

| Type | Trigger | Frequency | Agents Used |
|------|---------|-----------|-------------|
| **Blog Validation** | Git commit | On push | content-seo-specialist, technical-seo-specialist |
| **Core Web Vitals Check** | Scheduled | Daily | technical-seo-specialist |
| **Review Monitoring** | Scheduled | Daily | local-seo-specialist |
| **Content Performance** | Scheduled | Weekly | content-seo-specialist, seo-expert |
| **Technical SEO Audit** | Scheduled | Weekly | technical-seo-specialist |
| **Ranking Monitor** | Scheduled | Daily | seo-expert, local-seo-specialist |
| **Competitor Analysis** | Scheduled | Weekly | seo-expert |
| **Comprehensive Report** | Scheduled | Monthly | All agents |

---

## Daily Automated Workflows

### Workflow 1: Daily Ranking Monitor

**Trigger**: Cron schedule (daily at 8 AM)
**Agents**: `seo-expert`, `local-seo-specialist`

```yaml
# .github/workflows/daily-ranking-monitor.yml
name: Daily Ranking Monitor

on:
  schedule:
    - cron: '0 8 * * *'  # 8 AM daily
  workflow_dispatch:  # Manual trigger

jobs:
  check-rankings:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Check keyword rankings
        run: |
          # Use DataForSEO or similar API
          node scripts/check-rankings.mjs

      - name: Analyze with SEO Expert
        uses: anthropics/claude-code-action@v1
        with:
          agent: seo-expert
          prompt: |
            Analyze the ranking data in rankings-report.json.
            Identify:
            1. Keywords with significant changes (>3 positions)
            2. New ranking opportunities
            3. Rankings drops that need attention
            4. Competitor movements

            Create a summary and prioritized action items.

      - name: Check local rankings
        uses: anthropics/claude-code-action@v1
        with:
          agent: local-seo-specialist
          prompt: |
            Analyze local pack rankings for Sydney keywords.
            Check Google Business Profile insights.
            Flag any issues or opportunities.

      - name: Send notification
        if: failure() || success()
        run: |
          node scripts/send-slack-notification.mjs \
            --channel "#seo-alerts" \
            --file rankings-summary.md
```

**Output**: Daily ranking report in Slack/Email

---

### Workflow 2: Core Web Vitals Monitor

**Trigger**: Cron schedule (daily at 9 AM)
**Agents**: `technical-seo-specialist`

```yaml
# .github/workflows/core-web-vitals-monitor.yml
name: Core Web Vitals Monitor

on:
  schedule:
    - cron: '0 9 * * *'  # 9 AM daily
  workflow_dispatch:

jobs:
  check-vitals:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Run PageSpeed Insights
        run: |
          npm install -g lighthouse
          lighthouse https://theprofitplatform.com.au \
            --output=json \
            --output-path=./cwv-report.json \
            --only-categories=performance

      - name: Analyze with Technical SEO Specialist
        uses: anthropics/claude-code-action@v1
        with:
          agent: technical-seo-specialist
          prompt: |
            Analyze the Core Web Vitals report in cwv-report.json.

            Check:
            1. LCP (target: < 2.5s)
            2. CLS (target: < 0.1)
            3. INP (target: < 200ms)

            If any metric is in "Needs Improvement" or "Poor":
            - Identify the cause
            - Provide specific fix recommendations
            - Estimate impact and effort

            Create a prioritized action plan.

      - name: Alert if thresholds exceeded
        run: |
          node scripts/check-cwv-thresholds.mjs

      - name: Create GitHub issue if failing
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '⚠️ Core Web Vitals Alert',
              body: 'Core Web Vitals have degraded. See attached report.',
              labels: ['seo', 'performance', 'urgent']
            })
```

**Output**: Daily Core Web Vitals report, alerts on degradation

---

### Workflow 3: Google Business Profile Monitor

**Trigger**: Cron schedule (daily at 10 AM)
**Agents**: `local-seo-specialist`

```yaml
# .github/workflows/gbp-monitor.yml
name: Google Business Profile Monitor

on:
  schedule:
    - cron: '0 10 * * *'  # 10 AM daily
  workflow_dispatch:

jobs:
  monitor-gbp:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Fetch GBP insights
        run: |
          node scripts/fetch-gbp-insights.mjs

      - name: Check new reviews
        run: |
          node scripts/check-new-reviews.mjs

      - name: Analyze with Local SEO Specialist
        uses: anthropics/claude-code-action@v1
        with:
          agent: local-seo-specialist
          prompt: |
            Analyze Google Business Profile data from gbp-insights.json.

            Tasks:
            1. Check for new reviews (respond if needed)
            2. Review performance metrics (views, clicks, calls)
            3. Check for Q&A updates
            4. Identify any issues or opportunities
            5. Recommend GBP optimizations

            If there are new reviews:
            - Draft appropriate responses
            - Flag negative reviews for immediate attention

      - name: Auto-respond to reviews
        run: |
          node scripts/auto-respond-reviews.mjs \
            --responses review-responses.json

      - name: Send daily summary
        run: |
          node scripts/send-gbp-summary.mjs --email
```

**Output**: Daily GBP summary, auto-responses to reviews

---

## Weekly Automated Workflows

### Workflow 4: Content Performance Analysis

**Trigger**: Cron schedule (Monday 8 AM)
**Agents**: `content-seo-specialist`, `seo-expert`

```yaml
# .github/workflows/weekly-content-analysis.yml
name: Weekly Content Performance Analysis

on:
  schedule:
    - cron: '0 8 * * 1'  # Monday 8 AM
  workflow_dispatch:

jobs:
  analyze-content:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Fetch analytics data
        run: |
          node scripts/fetch-ga4-data.mjs --period 7d

      - name: Fetch Search Console data
        run: |
          node scripts/fetch-gsc-data.mjs --period 7d

      - name: Analyze with Content SEO Specialist
        uses: anthropics/claude-code-action@v1
        with:
          agent: content-seo-specialist
          prompt: |
            Analyze blog performance data from the last 7 days.

            Data sources:
            - ga4-report.json (traffic, engagement)
            - gsc-report.json (rankings, clicks, impressions)

            Tasks:
            1. Identify top-performing content
            2. Identify underperforming content
            3. Find content optimization opportunities
            4. Check for ranking improvements/declines
            5. Analyze featured snippet opportunities

            Deliverables:
            1. Top 5 posts to update (with specific recommendations)
            2. New content topics based on trends
            3. Internal linking opportunities

      - name: Generate content calendar updates
        uses: anthropics/claude-code-action@v1
        with:
          agent: content-seo-specialist
          prompt: |
            Based on the performance analysis, update our content calendar.

            Add:
            - New topic ideas based on successful content
            - Content update tasks for underperforming posts
            - Internal linking tasks

            Format as markdown and save to docs/content-calendar.md

      - name: Create GitHub issues for updates
        run: |
          node scripts/create-content-tasks.mjs

      - name: Send weekly report
        run: |
          node scripts/send-content-report.mjs \
            --recipients team@theprofitplatform.com.au
```

**Output**: Weekly content performance report, automated task creation

---

### Workflow 5: Technical SEO Audit

**Trigger**: Cron schedule (Sunday 6 AM)
**Agents**: `technical-seo-specialist`

```yaml
# .github/workflows/weekly-technical-audit.yml
name: Weekly Technical SEO Audit

on:
  schedule:
    - cron: '0 6 * * 0'  # Sunday 6 AM
  workflow_dispatch:

jobs:
  technical-audit:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Run Lighthouse audit
        run: |
          npm run parity
          npx lighthouse https://theprofitplatform.com.au \
            --output=html --output=json \
            --output-path=./audit-report

      - name: Check robots.txt and sitemap
        run: |
          curl -s https://theprofitplatform.com.au/robots.txt > robots.txt
          curl -s https://theprofitplatform.com.au/sitemap.xml > sitemap.xml

      - name: Validate schema markup
        run: |
          node scripts/validate-all-schemas.mjs

      - name: Check for broken links
        run: |
          npm run blog:check-links

      - name: Analyze with Technical SEO Specialist
        uses: anthropics/claude-code-action@v1
        with:
          agent: technical-seo-specialist
          prompt: |
            Perform comprehensive technical SEO audit.

            Review:
            1. audit-report.json (Lighthouse scores)
            2. schema-validation-results.json
            3. broken-links.json
            4. Production parity scan results

            Identify:
            1. Critical issues (immediate fix needed)
            2. Important issues (fix within 7 days)
            3. Minor issues (backlog)
            4. Optimization opportunities

            Create prioritized action plan with:
            - Issue description
            - Impact (High/Medium/Low)
            - Effort (Hours estimate)
            - Fix recommendations
            - Code examples where applicable

      - name: Create GitHub issues
        run: |
          node scripts/create-technical-issues.mjs \
            --source audit-action-plan.json

      - name: Update documentation
        run: |
          node scripts/update-technical-docs.mjs

      - name: Send weekly audit report
        run: |
          node scripts/send-audit-report.mjs
```

**Output**: Weekly technical audit report, automated issue creation

---

### Workflow 6: Competitor Analysis

**Trigger**: Cron schedule (Wednesday 7 AM)
**Agents**: `seo-expert`

```yaml
# .github/workflows/weekly-competitor-analysis.yml
name: Weekly Competitor Analysis

on:
  schedule:
    - cron: '0 7 * * 3'  # Wednesday 7 AM
  workflow_dispatch:

jobs:
  competitor-analysis:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Fetch competitor data
        run: |
          node scripts/fetch-competitor-rankings.mjs \
            --competitors netbranding.com.au,webfx.com

      - name: Analyze with SEO Expert
        uses: anthropics/claude-code-action@v1
        with:
          agent: seo-expert
          prompt: |
            Analyze competitor SEO performance from competitor-data.json.

            Tasks:
            1. Compare keyword rankings (us vs competitors)
            2. Identify keywords competitors rank for (we don't)
            3. Analyze content gaps
            4. Check backlink profiles
            5. Review on-page optimization differences

            Deliverables:
            1. Keywords to target (based on competitor success)
            2. Content ideas (based on competitor content)
            3. Backlink opportunities (from competitor profiles)
            4. Competitive advantages to leverage
            5. Weaknesses to address

      - name: Update keyword targets
        run: |
          node scripts/update-keyword-targets.mjs

      - name: Create content briefs
        uses: anthropics/claude-code-action@v1
        with:
          agent: content-seo-specialist
          prompt: |
            Based on competitor analysis, create 3 content briefs
            targeting gaps we identified.

            For each brief:
            - Target keyword
            - Search intent
            - Outline (H2/H3 structure)
            - Word count target
            - Internal linking plan

            Save to docs/content-briefs/

      - name: Send competitor report
        run: |
          node scripts/send-competitor-report.mjs
```

**Output**: Weekly competitor analysis report, content briefs

---

## Monthly Automated Workflows

### Workflow 7: Comprehensive SEO Report

**Trigger**: Cron schedule (1st of month, 9 AM)
**Agents**: All SEO agents

```yaml
# .github/workflows/monthly-seo-report.yml
name: Monthly Comprehensive SEO Report

on:
  schedule:
    - cron: '0 9 1 * *'  # 1st of month, 9 AM
  workflow_dispatch:

jobs:
  monthly-report:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Fetch all data sources
        run: |
          node scripts/fetch-monthly-data.mjs

      - name: Technical SEO Analysis
        uses: anthropics/claude-code-action@v1
        with:
          agent: technical-seo-specialist
          prompt: |
            Analyze technical SEO performance for the past month.

            Review:
            - Core Web Vitals trends
            - Page speed performance
            - Crawl errors
            - Indexation status
            - Schema markup health

            Generate monthly technical SEO section.

      - name: Local SEO Analysis
        uses: anthropics/claude-code-action@v1
        with:
          agent: local-seo-specialist
          prompt: |
            Analyze local SEO performance for the past month.

            Review:
            - Google Business Profile insights
            - Local pack rankings
            - Reviews (count, ratings, responses)
            - NAP consistency checks
            - Local citations

            Generate monthly local SEO section.

      - name: Content Performance Analysis
        uses: anthropics/claude-code-action@v1
        with:
          agent: content-seo-specialist
          prompt: |
            Analyze content performance for the past month.

            Review:
            - Blog traffic and engagement
            - New content published
            - Content updates performed
            - Featured snippets gained/lost
            - Top-performing content

            Generate monthly content SEO section.

      - name: Service Page Performance
        uses: anthropics/claude-code-action@v1
        with:
          agent: ecommerce-seo-specialist
          prompt: |
            Analyze service page performance for the past month.

            Review:
            - Service page traffic
            - Conversion rates
            - Form submissions
            - A/B test results
            - CTA performance

            Generate monthly conversion optimization section.

      - name: Overall SEO Strategy
        uses: anthropics/claude-code-action@v1
        with:
          agent: seo-expert
          prompt: |
            Consolidate all monthly analysis into comprehensive report.

            Include:
            1. Executive Summary (key wins, concerns, priorities)
            2. Technical SEO (from technical-seo-specialist)
            3. Local SEO (from local-seo-specialist)
            4. Content Performance (from content-seo-specialist)
            5. Conversion Optimization (from ecommerce-seo-specialist)
            6. Competitive Landscape
            7. Goals vs Actuals
            8. Next Month Priorities

            Generate final monthly report in markdown and PDF.

      - name: Generate visualizations
        run: |
          node scripts/generate-report-charts.mjs

      - name: Send monthly report
        run: |
          node scripts/send-monthly-report.mjs \
            --recipients team@theprofitplatform.com.au,stakeholders@example.com \
            --format pdf
```

**Output**: Comprehensive monthly SEO report (PDF + Markdown)

---

## Event-Triggered Workflows

### Workflow 8: Blog Post Publish

**Trigger**: Git push to main (blog post file added/modified)
**Agents**: `content-seo-specialist`, `technical-seo-specialist`

```yaml
# .github/workflows/blog-post-publish.yml
name: Blog Post Validation & Publish

on:
  push:
    paths:
      - 'src/content/blog/**/*.md'
    branches:
      - main

jobs:
  validate-and-publish:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Identify changed blog posts
        id: changed-files
        run: |
          echo "files=$(git diff --name-only HEAD^ HEAD | grep 'src/content/blog')" >> $GITHUB_OUTPUT

      - name: Validate with Content SEO Specialist
        uses: anthropics/claude-code-action@v1
        with:
          agent: content-seo-specialist
          prompt: |
            Validate the blog post: ${{ steps.changed-files.outputs.files }}

            Check:
            ✓ Title tag (50-60 chars, includes keyword)
            ✓ Meta description (150-160 chars, includes CTA)
            ✓ H1 includes primary keyword
            ✓ Header hierarchy (H1→H2→H3)
            ✓ Word count (1500-2500)
            ✓ Internal links (3-5 minimum)
            ✓ Images have ALT text
            ✓ Readability (Flesch 60-70)
            ✓ Australian English spelling
            ✓ FAQ section present

            If validation fails, create detailed issue.
            If validation passes, approve for publish.

      - name: Validate schema markup
        uses: anthropics/claude-code-action@v1
        with:
          agent: technical-seo-specialist
          prompt: |
            Validate schema markup for blog post.

            Check:
            ✓ Article schema present
            ✓ FAQPage schema if FAQ section exists
            ✓ Author schema
            ✓ Publisher schema
            ✓ Images schema
            ✓ No schema errors

            Run validation and report results.

      - name: Build and deploy
        if: success()
        run: |
          npm run build
          npm run deploy

      - name: Submit to Search Console
        run: |
          node scripts/submit-url-to-gsc.mjs \
            --url https://theprofitplatform.com.au/blog/${{ steps.blog-slug.outputs.slug }}

      - name: Share on social media
        run: |
          node scripts/share-blog-post.mjs \
            --platforms linkedin,twitter,facebook

      - name: Create validation failed issue
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '❌ Blog Post Validation Failed',
              body: 'See workflow run for details.',
              labels: ['blog', 'seo', 'validation-failed']
            })
```

**Output**: Validated blog post, auto-publish, Search Console submission

---

### Workflow 9: Ranking Drop Alert

**Trigger**: Webhook from ranking tracker
**Agents**: `seo-expert`, relevant specialist

```yaml
# .github/workflows/ranking-drop-alert.yml
name: Ranking Drop Emergency Response

on:
  repository_dispatch:
    types: [ranking-drop]

jobs:
  emergency-response:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Analyze with SEO Expert
        uses: anthropics/claude-code-action@v1
        with:
          agent: seo-expert
          prompt: |
            URGENT: Significant ranking drop detected.

            Keyword: ${{ github.event.client_payload.keyword }}
            Previous position: ${{ github.event.client_payload.old_position }}
            Current position: ${{ github.event.client_payload.new_position }}
            Change: ${{ github.event.client_payload.change }}
            URL: ${{ github.event.client_payload.url }}

            Tasks:
            1. Identify likely cause (algorithm update, technical issue, competitor)
            2. Check if other keywords affected
            3. Immediate action items
            4. Recovery strategy

            Create emergency response plan.

      - name: Technical check
        uses: anthropics/claude-code-action@v1
        with:
          agent: technical-seo-specialist
          prompt: |
            Check for technical issues on affected page.

            URL: ${{ github.event.client_payload.url }}

            Verify:
            - Page is indexed
            - No robots.txt blocks
            - No noindex tags
            - Page loads correctly
            - Core Web Vitals OK
            - Schema markup valid
            - No manual penalties

      - name: Create critical issue
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🚨 URGENT: Ranking Drop Alert',
              body: 'Significant ranking drop detected. See analysis.',
              labels: ['seo', 'urgent', 'ranking-drop'],
              assignees: ['team-lead']
            })

      - name: Send immediate alert
        run: |
          node scripts/send-urgent-alert.mjs \
            --channel "#seo-emergency" \
            --phone "+61487286451" \
            --email "avi@theprofitplatform.com.au"
```

**Output**: Immediate alert, emergency response plan, critical issue

---

## Integration with n8n

### n8n Workflow: Daily SEO Dashboard Update

```json
{
  "name": "Daily SEO Dashboard Update",
  "nodes": [
    {
      "name": "Schedule",
      "type": "n8n-nodes-base.cron",
      "parameters": {
        "triggerTimes": {
          "item": [
            {
              "hour": 8,
              "minute": 0
            }
          ]
        }
      }
    },
    {
      "name": "Fetch Google Analytics",
      "type": "n8n-nodes-base.googleAnalytics"
    },
    {
      "name": "Fetch Search Console",
      "type": "n8n-nodes-base.googleSearchConsole"
    },
    {
      "name": "Fetch GBP Insights",
      "type": "n8n-nodes-base.httpRequest"
    },
    {
      "name": "Claude Code - SEO Expert",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://api.anthropic.com/v1/messages",
        "method": "POST",
        "body": {
          "model": "claude-sonnet-4-5",
          "agent": "seo-expert",
          "prompt": "Analyze daily SEO data and create dashboard update"
        }
      }
    },
    {
      "name": "Update Dashboard",
      "type": "n8n-nodes-base.notion"
    },
    {
      "name": "Send Slack Notification",
      "type": "n8n-nodes-base.slack"
    }
  ]
}
```

### n8n Workflow: Review Response Automation

```json
{
  "name": "Auto-Respond to Google Reviews",
  "nodes": [
    {
      "name": "Webhook - New Review",
      "type": "n8n-nodes-base.webhook"
    },
    {
      "name": "Check Review Sentiment",
      "type": "n8n-nodes-base.httpRequest"
    },
    {
      "name": "Claude Code - Local SEO",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "agent": "local-seo-specialist",
        "prompt": "Draft response for this review: {{ $json.reviewText }}"
      }
    },
    {
      "name": "Human Approval (if negative)",
      "type": "n8n-nodes-base.slack",
      "parameters": {
        "resource": "message",
        "operation": "post",
        "channel": "#review-alerts"
      }
    },
    {
      "name": "Post Review Response",
      "type": "n8n-nodes-base.httpRequest"
    }
  ]
}
```

---

## GitHub Actions Workflows

### Setup Instructions

1. **Create workflow directory**:
```bash
mkdir -p .github/workflows
```

2. **Copy workflow files** from this document to `.github/workflows/`

3. **Configure secrets** in GitHub:
```bash
Settings > Secrets and variables > Actions > New repository secret

Required secrets:
- ANTHROPIC_API_KEY
- GA4_PROPERTY_ID
- GSC_SERVICE_ACCOUNT
- GBP_API_KEY
- SLACK_WEBHOOK_URL
- CLOUDFLARE_API_TOKEN
```

4. **Test workflows**:
```bash
# Trigger manual workflow
gh workflow run daily-ranking-monitor.yml

# View workflow runs
gh run list

# View logs
gh run view [run-id] --log
```

---

## Custom Workflow Scripts

### Script: check-rankings.mjs
```javascript
// scripts/check-rankings.mjs
import { DataForSEOClient } from 'dataforseo-client';

const keywords = [
  'digital marketing Sydney',
  'SEO services Sydney',
  'Google Ads management Sydney'
];

const client = new DataForSEOClient(
  process.env.DATAFORSEO_LOGIN,
  process.env.DATAFORSEO_PASSWORD
);

const results = await client.serp.google.organic(keywords);

// Save to rankings-report.json
fs.writeFileSync('rankings-report.json', JSON.stringify(results, null, 2));
```

### Script: send-slack-notification.mjs
```javascript
// scripts/send-slack-notification.mjs
import fetch from 'node-fetch';
import fs from 'fs';

const webhookUrl = process.env.SLACK_WEBHOOK_URL;
const file = process.argv[3]; // --file rankings-summary.md

const content = fs.readFileSync(file, 'utf-8');

await fetch(webhookUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Daily SEO Report',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: content
        }
      }
    ]
  })
});
```

### Script: submit-url-to-gsc.mjs
```javascript
// scripts/submit-url-to-gsc.mjs
import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GSC_SERVICE_ACCOUNT),
  scopes: ['https://www.googleapis.com/auth/webmasters']
});

const indexing = google.indexing({ version: 'v3', auth });

const url = process.argv[2]; // --url https://...

await indexing.urlNotifications.publish({
  requestBody: {
    url: url,
    type: 'URL_UPDATED'
  }
});

console.log(`✓ Submitted ${url} to Google Search Console`);
```

---

## Monitoring & Maintenance

### Workflow Health Dashboard

Create a dashboard to monitor workflow health:

```markdown
## Workflow Status (Week of [Date])

| Workflow | Status | Last Run | Success Rate | Avg Duration |
|----------|--------|----------|--------------|--------------|
| Daily Ranking Monitor | ✅ | 2h ago | 100% | 2m 15s |
| Core Web Vitals | ✅ | 1h ago | 95% | 3m 40s |
| GBP Monitor | ✅ | 30m ago | 100% | 1m 50s |
| Weekly Content Analysis | ✅ | 2d ago | 90% | 8m 20s |
| Technical Audit | ⚠️ | 5d ago | 85% | 12m 15s |
| Competitor Analysis | ✅ | 1d ago | 95% | 6m 45s |
| Monthly Report | ✅ | 5d ago | 100% | 25m 30s |

### Recent Alerts
- [2025-01-26] Core Web Vitals: LCP degraded to 3.2s
- [2025-01-25] Ranking drop: "SEO Sydney" from #3 to #5
- [2025-01-24] New negative review on GBP

### Actions Taken
- ✅ Optimized hero image (reduced LCP to 2.4s)
- ⏳ Created recovery plan for "SEO Sydney"
- ✅ Responded to negative review
```

---

## Best Practices

### 1. Workflow Design
- Keep workflows focused on single responsibility
- Use descriptive names
- Add manual triggers for testing
- Handle failures gracefully
- Send notifications on failures

### 2. Agent Collaboration
- Chain agents for complex tasks
- Pass context between agents
- Use specialized agents for their expertise
- Consolidate results with general agent

### 3. Data Management
- Store results as artifacts
- Use consistent file formats (JSON, Markdown)
- Version control important data
- Archive old reports

### 4. Security
- Use secrets for API keys
- Don't log sensitive data
- Rotate credentials regularly
- Limit workflow permissions

### 5. Monitoring
- Track workflow success rates
- Monitor execution time
- Alert on repeated failures
- Review and optimize monthly

---

## Next Steps

1. **Implement core workflows**:
   - Start with daily ranking monitor
   - Add Core Web Vitals check
   - Set up blog validation

2. **Test and iterate**:
   - Run manually first
   - Verify outputs
   - Adjust based on results

3. **Scale up**:
   - Add weekly workflows
   - Implement monthly reporting
   - Create custom workflows

4. **Optimize**:
   - Reduce execution time
   - Improve agent prompts
   - Automate more tasks

---

**Created**: 2025-01-27
**Version**: 1.0
**Maintained by**: The Profit Platform SEO Team
