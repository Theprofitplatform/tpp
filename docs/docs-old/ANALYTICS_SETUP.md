# Analytics Integration Setup Guide

## Overview

The blog automation system can now pull real traffic and search performance data from:
- **Google Analytics 4 (GA4)** - Pageviews, engagement, bounce rates
- **Google Search Console** - Clicks, impressions, CTR, rankings, keywords

This guide walks through the setup process.

---

## Quick Start

If you already have GA4 and Search Console configured, you just need to:

1. **Install dependency:**
   ```bash
   npm install jsonwebtoken
   ```

2. **Add API credentials to `.env.local`:**
   ```bash
   # GA4
   GA4_PROPERTY_ID="properties/123456789"
   GA4_SERVICE_ACCOUNT_KEY="/path/to/service-account-key.json"

   # Search Console
   SEARCH_CONSOLE_SITE_URL="https://theprofitplatform.com.au"
   SEARCH_CONSOLE_SERVICE_ACCOUNT_KEY="/path/to/service-account-key.json"
   ```

3. **Run performance report:**
   ```bash
   npm run blog:performance
   ```

That's it! The system will automatically fetch analytics data if configured.

---

## Detailed Setup Instructions

### Step 1: Google Cloud Console Setup

#### 1.1 Create/Select a Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Note the project ID

#### 1.2 Enable APIs

Enable these two APIs:
- **Google Analytics Data API** (for GA4)
- **Google Search Console API**

```
Navigation: APIs & Services → Library → Search for each API → Enable
```

#### 1.3 Create Service Account

1. Go to: `APIs & Services → Credentials`
2. Click: `Create Credentials → Service Account`
3. Fill in:
   - Service account name: `blog-analytics`
   - Service account ID: `blog-analytics`
   - Description: "Read blog performance data from GA4 and Search Console"
4. Click: `Create and Continue`
5. Grant role: `Viewer` (or more restrictive if preferred)
6. Click: `Done`

#### 1.4 Download Service Account Key

1. Click on the service account you just created
2. Go to: `Keys` tab
3. Click: `Add Key → Create new key`
4. Select: `JSON`
5. Click: `Create`
6. **Save the downloaded JSON file securely**

Example path: `/Users/you/credentials/tpp-blog-analytics.json`

---

### Step 2: Google Analytics 4 Setup

#### 2.1 Get GA4 Property ID

1. Go to [Google Analytics](https://analytics.google.com)
2. Select your property
3. Go to: `Admin` (bottom left) → `Property Settings`
4. Copy the **Property ID** (format: `123456789`)
5. Full format for config: `properties/123456789`

#### 2.2 Grant Service Account Access

1. Still in GA4 Admin → `Property Access Management`
2. Click: `Add users` (top right with `+` icon)
3. Enter: Service account email (e.g., `blog-analytics@yourproject.iam.gserviceaccount.com`)
   - Find this in the service account JSON key file: `client_email` field
4. Select role: `Viewer`
5. Click: `Add`

---

### Step 3: Google Search Console Setup

#### 3.1 Get Site URL

Your verified Search Console property URL (e.g., `https://theprofitplatform.com.au`)

#### 3.2 Grant Service Account Access

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select your property
3. Go to: `Settings` (left sidebar) → `Users and permissions`
4. Click: `Add user`
5. Enter: Service account email (from JSON key file)
6. Select permission: `Full` or `Restricted`
7. Click: `Add`

---

### Step 4: Configure Environment Variables

Add to `.env.local`:

```bash
# Google Analytics 4
GA4_PROPERTY_ID="properties/YOUR_PROPERTY_ID"
GA4_SERVICE_ACCOUNT_KEY="/path/to/service-account-key.json"
# Or inline JSON (not recommended for production):
# GA4_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key":"..."}'

# Google Search Console
SEARCH_CONSOLE_SITE_URL="https://yourdomain.com"
SEARCH_CONSOLE_SERVICE_ACCOUNT_KEY="/path/to/service-account-key.json"
# Or use same key as GA4:
# SEARCH_CONSOLE_SERVICE_ACCOUNT_KEY="/path/to/same-key.json"
```

**Note:** You can use the **same service account key** for both GA4 and Search Console.

---

### Step 5: Test Integration

#### 5.1 Install Dependency

```bash
npm install jsonwebtoken
```

#### 5.2 Run Performance Report

```bash
npm run blog:performance
```

**Expected Output:**

```
📊 Blog Performance Tracker
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Analyzed 9 published posts

📈 Content Quality Metrics:
   Average word count: 2245 words
   Average headings: 30.9
   Average internal links: 4.0
   Average external links: 2.4
   Posts with images: 4/9

📊 Fetching GA4 Analytics Data...
   ✅ Retrieved analytics for 9 posts

📈 GA4 Summary (last 30 days):
   Total pageviews: 1,234
   Average engagement rate: 42.5%

🏆 Top Posts by Pageviews:
   1. How to Optimise Your Google Business Profile
      856 views, 48.2% engagement
   2. 7 Google Ads Mistakes Costing Sydney Businesses
      234 views, 35.1% engagement

🔍 Fetching Search Console Data...
   ✅ Retrieved search data for 9 posts

🔍 Search Console Summary (last 30 days):
   Total clicks: 245
   Total impressions: 12,450
   Average CTR: 2.15%
   Average position: 12.3

🏆 Top Posts by Search Clicks:
   1. How to Optimise Your Google Business Profile
      134 clicks, 5,234 impressions, pos 8.5
      Top keyword: "google business profile sydney" (45 clicks)
```

---

## What Data is Collected?

### From GA4 (per blog post):
- **Pageviews** - Total page views in last 30 days
- **Avg Session Duration** - How long users spend on page
- **Bounce Rate** - % of single-page sessions
- **Engagement Rate** - % of engaged sessions

### From Search Console (per blog post):
- **Clicks** - Total clicks from search results
- **Impressions** - How many times URL appeared in search
- **CTR** - Click-through rate (clicks / impressions)
- **Average Position** - Average ranking position
- **Top Keywords** - Best performing search queries

### Report Output

Data is saved to: `automation/performance-report.json`

```json
{
  "generatedAt": "2025-10-06T...",
  "summary": {
    "totalPosts": 9,
    "avgWordCount": 2245,
    ...
  },
  "analytics": {
    "totalPageviews": 1234,
    "avgEngagementRate": 42.5,
    "period": "30 days"
  },
  "searchConsole": {
    "totalClicks": 245,
    "totalImpressions": 12450,
    "avgCTR": 2.15,
    "avgPosition": 12.3,
    "period": "30 days"
  },
  "posts": [
    {
      "slug": "post-slug",
      "title": "Post Title",
      "wordCount": 2670,
      "quality": { ... },
      "analytics": {
        "pageviews": 856,
        "avgSessionDuration": 145.2,
        "bounceRate": 42.3,
        "engagementRate": 48.2
      },
      "searchConsole": {
        "clicks": 134,
        "impressions": 5234,
        "ctr": 2.56,
        "position": 8.5,
        "topKeywords": [
          {
            "query": "google business profile sydney",
            "clicks": 45,
            "impressions": 890,
            "position": 6,
            "ctr": 5.05
          }
        ]
      }
    }
  ]
}
```

---

## Troubleshooting

### Error: "GA4_PROPERTY_ID not configured"

**Solution:** Add GA4_PROPERTY_ID to `.env.local`

System will still work without analytics (graceful degradation).

### Error: "GA4 API error: 403"

**Causes:**
1. Service account not added to GA4 property
2. Google Analytics Data API not enabled

**Solution:**
1. Check API is enabled: Cloud Console → APIs & Services → Library
2. Check service account has access: GA4 Admin → Property Access Management

### Error: "Search Console API error: 404"

**Causes:**
1. Wrong site URL format
2. Property not verified in Search Console

**Solution:**
1. Ensure SEARCH_CONSOLE_SITE_URL matches exactly (include https://, no trailing slash)
2. Verify property exists in Search Console

### Error: "Invalid JWT"

**Cause:** Service account key file malformed or path incorrect

**Solution:**
1. Re-download service account key from Cloud Console
2. Verify path in `.env.local` is correct
3. If using inline JSON, ensure it's properly escaped

### Service account email not working

**Find it in the JSON key file:**
```json
{
  "type": "service_account",
  "project_id": "your-project",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "blog-analytics@your-project.iam.gserviceaccount.com",  // <-- THIS
  ...
}
```

---

## Optional: Advanced Usage

### Custom Date Ranges

Both helpers support custom lookback periods:

```javascript
import { getPostAnalytics } from './utils/ga4-helper.mjs';
import { getPostSearchPerformance } from './utils/search-console-helper.mjs';

// Last 7 days
const analytics = await getPostAnalytics('post-slug', 7);

// Last 90 days
const searchData = await getPostSearchPerformance('post-slug', 90);
```

### Top Performing Content

```javascript
import { getTopPosts } from './utils/ga4-helper.mjs';
import { getTopSearchPages } from './utils/search-console-helper.mjs';

// Top 10 posts by pageviews
const topByViews = await getTopPosts(10, 30);

// Top 20 pages by search clicks
const topByClicks = await getTopSearchPages(30);
```

### Keyword Opportunities

```javascript
import { getKeywordOpportunities } from './utils/search-console-helper.mjs';

// Find keywords ranking 5-20 with high impressions but low CTR
const opportunities = await getKeywordOpportunities(30);

// These are keywords you could optimize for (improve title/meta to increase CTR)
```

---

## Security Best Practices

1. **Never commit service account keys to Git**
   - Add to `.gitignore`: `*.json` (keys), `.env.local`
   - Use GitHub Secrets for CI/CD

2. **Use restrictive permissions**
   - Service account only needs "Viewer" role
   - Consider separate service accounts for GA4 vs Search Console

3. **Rotate keys periodically**
   - Delete old keys in Cloud Console → Service Accounts → Keys
   - Generate new keys every 90 days

4. **Store keys securely**
   - Use environment variables in production
   - Never log or print key contents

---

## GitHub Actions Setup (Optional)

To run performance reports in CI/CD:

1. **Add secrets to GitHub:**
   - `Settings → Secrets and variables → Actions → New repository secret`
   - Add: `GA4_PROPERTY_ID`, `GA4_SERVICE_ACCOUNT_KEY`, etc.

2. **Update workflow** (`.github/workflows/daily-blog-post.yml`):
   ```yaml
   - name: Run performance report
     env:
       GA4_PROPERTY_ID: ${{ secrets.GA4_PROPERTY_ID }}
       GA4_SERVICE_ACCOUNT_KEY: ${{ secrets.GA4_SERVICE_ACCOUNT_KEY }}
       SEARCH_CONSOLE_SITE_URL: ${{ secrets.SEARCH_CONSOLE_SITE_URL }}
       SEARCH_CONSOLE_SERVICE_ACCOUNT_KEY: ${{ secrets.SEARCH_CONSOLE_SERVICE_ACCOUNT_KEY }}
     run: npm run blog:performance
   ```

---

## FAQ

**Q: Do I need separate service accounts for GA4 and Search Console?**
A: No, you can use the same service account for both. Just ensure it has access to both properties.

**Q: Will this work if I don't configure analytics?**
A: Yes! The system gracefully degrades. You'll see warnings but the script will still work.

**Q: How much does this cost?**
A: Google Analytics Data API and Search Console API are **free** for reasonable usage. No additional costs.

**Q: Can I use OAuth instead of service accounts?**
A: Service accounts are recommended for automation. OAuth requires manual login/consent.

**Q: How often should I run the performance report?**
A: Weekly or bi-weekly is recommended. Daily is unnecessary (data doesn't change that fast).

**Q: Can I see historical data?**
A: Yes, change the `days` parameter. GA4 supports up to 14 months, Search Console supports up to 16 months.

---

## Next Steps

Once configured, you can:

1. **Monitor performance trends** - Run `npm run blog:performance` weekly
2. **Identify top performers** - See which posts drive traffic
3. **Find optimization opportunities** - Low CTR keywords to improve
4. **Data-driven content strategy** - Create more of what works

---

**Last Updated:** 2025-10-06
**Status:** Ready to configure
**Effort:** 15-30 minutes first-time setup
