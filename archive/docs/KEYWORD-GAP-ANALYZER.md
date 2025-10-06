# Keyword Gap Analyzer - Setup Guide

## What's New

I've completely rebuilt your competitor analysis tool into a **realistic, valuable keyword gap analyzer** that:

✅ **Actually works** (no more fake hardcoded data)
✅ **Provides real value** (scrapes real sites, checks real SERPs)
✅ **Costs ~$10-20/month** (not $3,750/month)
✅ **Has a clear conversion path** (free → email → strategy call)

---

## How It Works

### 1. **Content Scraping + Topic Extraction**
   - Scrapes both sites using Cheerio
   - Extracts services/topics (e.g., "plumbing", "web design", "legal")
   - Detects industry (legal, home services, medical, etc.)
   - Calculates estimated Domain Authority

### 2. **Keyword Generation**
   - Generates 30-50 likely keywords based on:
     - Services found on both sites
     - Industry-specific templates
     - Sydney-focused variations
   - Example: If it finds "plumbing" → generates "plumber sydney", "emergency plumber sydney", etc.

### 3. **SERP Position Checking** (Limited to Save Costs)
   - Checks top 20 keywords using SerpApi
   - Cost: ~$0.10 per analysis (20 searches × $0.005)
   - Finds where competitor ranks, where you don't
   - **Fallback:** Without API key, uses mock data for testing

### 4. **Gap Analysis + Scoring**
   - Finds keywords where competitor ranks page 1-2, you don't
   - Scores each opportunity based on:
     - Search volume (higher = better)
     - Difficulty (lower = better)
     - Competitor position (validates it's winnable)
     - Your DA vs difficulty (realistic match)
   - Identifies "easy wins" (difficulty < your DA + 10, volume > 300)

### 5. **Free Tier → Email Gate → Upgrade**
   - **Free:** Top 3 opportunities
   - **Email:** Full 10 keywords + metrics
   - **Paid:** Strategy call ($997 value, free session)

---

## File Structure

```
/backend/keyword-gap-analyzer.js      # Main analysis logic
/functions/api/keyword-gap.js         # Cloudflare Pages Function
/src/pages/tools/keyword-gap.astro    # New frontend UI
/functions/api/competitor-analysis.js # OLD tool (keep for now)
/src/pages/tools/competitor-analysis.astro # OLD frontend (keep for now)
```

---

## Setup Instructions

### Option 1: Test Without API (Free, Mock Data)

The tool works immediately with mock data for testing:

1. **Navigate to the new tool:**
   ```
   http://localhost:3001/tools/keyword-gap
   ```

2. **Test with any two websites:**
   - Your site: `theprofitplatform.com.au`
   - Competitor: `searchenginepeople.com.au`

3. **What happens:**
   - Scrapes both sites (real)
   - Generates keywords based on content (real)
   - Uses mock SERP data (simulated)
   - Shows top 3 opportunities

**Note:** Without API key, you'll see: "Using mock data" disclaimer

---

### Option 2: Use Real SERP Data (Recommended)

To get **real competitive intelligence**, add a SerpApi key:

#### Step 1: Get SerpApi Key

1. Go to https://serpapi.com/
2. Sign up (free tier: 100 searches/month)
3. Copy your API key

#### Step 2: Add to Environment Variables

**For Local Development:**
Create `.dev.vars` in root:
```bash
SERPAPI_KEY=your_serpapi_key_here
```

**For Cloudflare Pages:**
1. Go to your Cloudflare Pages dashboard
2. Settings → Environment variables
3. Add: `SERPAPI_KEY` = `your_key`

#### Step 3: Test

```bash
npm run dev
# Visit http://localhost:3001/tools/keyword-gap
# Analyze competitors - now uses REAL SERP data!
```

---

## Cost Analysis

### With SerpApi Free Tier (100 searches/month)

- **Per analysis:** 20 searches
- **Free tier allows:** 5 analyses/month
- **Cost after free tier:** $0.10 per analysis
- **At 100 analyses/month:** $10/month

### Return on Investment

You need **1 client/month** from this tool to 10x your ROI:
- Tool cost: $10/month
- Strategy call conversion: 1 client = $997+ value
- Break-even: 0.01 conversions needed 🎯

---

## Customization Guide

### 1. Add More Industries

Edit `/backend/keyword-gap-analyzer.js`:

```javascript
const SYDNEY_KEYWORD_TEMPLATES = {
  // Add your industry
  real_estate: [
    '{service} sydney',
    'buy {service} sydney',
    '{service} for sale sydney',
    'best {service} sydney'
  ],
  // ... add more
};
```

### 2. Change Geographic Focus

Change `location` in SERP checks:

```javascript
const params = {
  q: keyword,
  location: 'Sydney, New South Wales, Australia', // Change this
  gl: 'au', // Country code
  hl: 'en', // Language
  // ...
};
```

### 3. Adjust Free Tier Limits

In `/functions/api/keyword-gap.js`:

```javascript
// Currently: 3 free, 10 with email
opportunities: email ? result.full10 : result.top3,

// Change to: 5 free, 20 with email
opportunities: email ? result.full20 : result.top5,
```

### 4. Add Email Sending (PDF Reports)

Install email service:

```bash
npm install @sendgrid/mail
# or
npm install nodemailer
```

Update `/functions/api/keyword-gap.js`:

```javascript
if (email) {
  // Send PDF report
  await sendEmailReport(email, result);
}
```

---

## Testing Checklist

### Test Scenarios

1. **Different Industries:**
   - [ ] Legal: `lawyersweekly.com.au` vs competitor
   - [ ] Trades: `service.com.au` vs competitor
   - [ ] Tech: `webfirm.com.au` vs competitor

2. **Edge Cases:**
   - [ ] Site with bot protection (should use mock data)
   - [ ] Invalid domain
   - [ ] Same domain for both fields
   - [ ] Very small site vs large site

3. **User Flow:**
   - [ ] See top 3 for free
   - [ ] Email gate appears
   - [ ] Enter email → see full 10
   - [ ] Click upgrade CTA → goes to contact

---

## Migration Strategy

### Phase 1: Parallel Testing (Now)

- Keep old tool at `/tools/competitor-analysis`
- New tool at `/tools/keyword-gap`
- Test both with real users
- Compare conversion rates

### Phase 2: Redirect (After 2-4 Weeks)

```javascript
// In competitor-analysis.astro, add redirect
if (typeof window !== 'undefined') {
  window.location.href = '/tools/keyword-gap';
}
```

### Phase 3: Deprecate Old Tool

- Remove `/tools/competitor-analysis`
- Update all internal links
- Add 301 redirect in `_redirects` file

---

## Monitoring & Optimization

### Track These Metrics

1. **Usage:**
   - Analyses per day
   - Unique users
   - API costs

2. **Conversion:**
   - % who provide email
   - % who click "Book Call"
   - Strategy calls booked

3. **Quality:**
   - User feedback
   - "Easy wins" accuracy
   - Keyword relevance

### Optimization Ideas

1. **Improve keyword generation:**
   - Add more service indicators
   - Better multi-word service detection
   - Industry-specific keyword databases

2. **Better scoring:**
   - Factor in your actual DA (via API)
   - Consider keyword intent
   - Use real CPC data (Google Keyword Planner API)

3. **Increase conversions:**
   - Add case studies
   - Show proof (testimonials)
   - Limited-time offers

---

## Next Steps

### Immediate (Today):

1. **Test the tool:**
   ```bash
   npm run dev
   # Visit http://localhost:3001/tools/keyword-gap
   ```

2. **Try with your own site:**
   - Your site: `theprofitplatform.com.au`
   - Competitor: Pick a real Sydney competitor
   - See if results make sense

3. **Decide on API:**
   - Test with mock data first
   - If valuable, get SerpApi key
   - Deploy to production

### This Week:

1. **Add to navigation:**
   - Link from homepage
   - Update tools page
   - Add to footer

2. **Create landing page content:**
   - Case study: "How we found 47 easy wins for..."
   - FAQ section
   - Trust indicators

3. **Set up analytics:**
   - Track form submissions
   - Track email captures
   - Track upgrade CTA clicks

### This Month:

1. **Email automation:**
   - Send PDF report on email capture
   - Nurture sequence (day 1, 3, 7)
   - Strategy call booking flow

2. **Improve accuracy:**
   - Build industry-specific keyword databases
   - Integrate better DA calculation
   - Add real CPC data

3. **Scale:**
   - Monitor costs
   - Optimize API usage
   - A/B test conversion points

---

## Troubleshooting

### "Module not found: google-search-results-nodejs"

```bash
npm install google-search-results-nodejs --save
```

### "SERPAPI_KEY not configured" warning

This is fine for testing. Tool uses mock data. To fix:
- Add `SERPAPI_KEY` to `.dev.vars` (local)
- Add to Cloudflare Pages environment variables (production)

### High API costs

Reduce searches per analysis:
```javascript
// In keyword-gap-analyzer.js
const keywordsToCheck = keywords.slice(0, 10); // Was 20
```

### Inaccurate keyword suggestions

Improve service extraction:
```javascript
// Add more service indicators in backend/keyword-gap-analyzer.js
const SERVICE_INDICATORS = [
  'your', 'industry', 'keywords', 'here'
];
```

---

## Support

Questions? Issues?

1. Check the code comments in:
   - `/backend/keyword-gap-analyzer.js` (main logic)
   - `/functions/api/keyword-gap.js` (API endpoint)

2. Test with console logs:
   ```javascript
   console.log('Debug:', yourVariable);
   ```

3. Review Cloudflare Pages logs for production issues

---

## Success Criteria

This tool is working well when:

✅ 80%+ of keyword suggestions are relevant
✅ "Easy wins" are actually achievable
✅ Users provide email (30%+ conversion)
✅ 5-10% book strategy calls
✅ API costs under $50/month
✅ Generates 1+ client/month

---

**Built:** 2025-10-05
**Cost:** $10-20/month (vs $3,750 for original plan!)
**Value:** Actually useful competitive intelligence 🎯
