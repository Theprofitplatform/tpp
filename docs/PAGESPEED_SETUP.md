# Google PageSpeed Insights API Setup

This guide explains how to enable **real** Core Web Vitals data in the Competitor Analysis tool.

## Why Add This?

**Before:** Page speed metrics were random estimates
**After:** Real performance scores from Google's PageSpeed Insights API

**Impact:**
- ✅ Shows actual Core Web Vitals (LCP, CLS, TBT)
- ✅ Real Performance Score (0-100)
- ✅ Builds credibility with verified data
- ✅ Identifies genuine performance gaps

---

## Step 1: Get a Free API Key

1. **Go to Google Cloud Console:**
   https://console.cloud.google.com/

2. **Create a new project** (or select existing)

3. **Enable PageSpeed Insights API:**
   - Navigate to "APIs & Services" > "Library"
   - Search for "PageSpeed Insights API"
   - Click "Enable"

4. **Create API Key:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

5. **Restrict the key** (optional but recommended):
   - Click on your API key
   - Under "API restrictions", select "Restrict key"
   - Choose "PageSpeed Insights API"
   - Save

---

## Step 2: Add to Local Development

1. **Create `.env` file** in project root:
   ```bash
   cp .env.example .env
   ```

2. **Add your API key:**
   ```env
   GOOGLE_PAGESPEED_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

3. **Test locally:**
   ```bash
   npm run dev
   ```

---

## Step 3: Deploy to Cloudflare Pages

### Option A: Via Cloudflare Dashboard (Recommended)

1. Go to your Cloudflare Pages project
2. Navigate to **Settings** > **Environment Variables**
3. Add variable:
   - **Variable name:** `GOOGLE_PAGESPEED_API_KEY`
   - **Value:** Your API key
   - **Environment:** Production (and Preview if needed)
4. Click "Save"
5. Redeploy your site

### Option B: Via Wrangler CLI

```bash
# Set production environment variable
wrangler pages secret put GOOGLE_PAGESPEED_API_KEY

# When prompted, paste your API key
```

---

## Step 4: Verify It's Working

1. **Deploy and test:**
   ```bash
   npm run build
   npm run deploy
   ```

2. **Check the tool:**
   - Go to `/tools/competitor-analysis`
   - Run an analysis
   - Look for "Google PageSpeed Insights API" in the data source badge
   - Real metrics will show actual values (e.g., "2.4s" instead of estimates)

3. **Check the logs:**
   - In Cloudflare Pages dashboard, go to "Functions" logs
   - You should see "Fetching PageSpeed data..." if working

---

## API Quota & Limits

- **Free tier:** 25,000 requests per day
- **Cost:** Free (no credit card required)
- **Rate limit:** 240 requests per minute per IP

**For this tool:**
- Each analysis uses 2 API calls (your domain + competitor)
- 25,000 daily quota = ~12,500 analyses per day
- More than enough for typical usage

---

## Fallback Behavior

**If API key is not set or quota exceeded:**
- Tool still works perfectly
- Shows estimated page speed metrics
- Displays note: "Estimate only - enable PageSpeed API for real data"

**No breaking changes** - API key is completely optional.

---

## Troubleshooting

### "PageSpeed data fetch failed"

**Possible causes:**
1. Invalid API key
2. API not enabled in Google Cloud Console
3. Quota exceeded (unlikely)
4. Website blocking Google's crawler

**Solution:**
- Check API key is correct
- Verify API is enabled in Google Cloud
- Check Cloudflare Functions logs for error details

### "Analysis takes too long"

PageSpeed API can take 20-30 seconds per domain. This is normal.

**Optimizations:**
- Both domains are fetched in parallel (not sequential)
- Frontend shows loading progress
- Users see this as "thorough analysis" (good UX)

---

## Cost Considerations

**Current setup: $0/month**
- Using free tier (25k requests/day)
- No credit card required

**If you exceed limits:**
- You can request quota increase (still free up to 400 requests/day)
- Or cache results for 24 hours (future optimization)

**Alternative: Disable PageSpeed temporarily**

Edit `functions/api/competitor-analysis.js`:
```javascript
options: {
  includePageSpeed: false, // Disable to save quota
  pageSpeedApiKey: env.GOOGLE_PAGESPEED_API_KEY || null
}
```

---

## What Data We Get

### Real Metrics (from PageSpeed API):
- ✅ Performance Score (0-100)
- ✅ Largest Contentful Paint (LCP)
- ✅ Cumulative Layout Shift (CLS)
- ✅ Total Blocking Time (TBT)
- ✅ First Contentful Paint (FCP)
- ✅ Speed Index
- ✅ Time to Interactive (TTI)

### Still Estimated:
- ⚠️ Domain Authority (requires Moz API - paid)
- ⚠️ Organic Traffic (requires SEMrush/Ahrefs - paid)
- ⚠️ Backlinks (requires Ahrefs/Majestic - paid)

---

## Next Steps

Once PageSpeed is working, consider:

1. **Add Moz API** for real Domain Authority ($99/month)
2. **Add DataForSEO** for real keyword rankings ($0.002/request)
3. **Cache PageSpeed results** for 24 hours to reduce API calls
4. **Show performance opportunities** from PageSpeed suggestions

---

## Questions?

Check the [main documentation](../CLAUDE.md) or [contact Avi](https://theprofitplatform.com.au/contact).
