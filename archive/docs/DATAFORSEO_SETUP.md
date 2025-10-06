# DataForSEO API Setup Guide

## Why DataForSEO?

**Problem**: Google Ads API package is too large (>25MB) for Cloudflare Pages
**Solution**: DataForSEO API is lightweight (<1MB) with real Google Ads data

**Benefits**:
- ✅ Real keyword data from Google
- ✅ Small bundle size (works with Cloudflare Pages)
- ✅ More features than Google Ads API
- ✅ Simple authentication
- ✅ Pay-as-you-go pricing

---

## Quick Setup (5 minutes)

### Step 1: Create DataForSEO Account

1. Go to https://dataforseo.com/
2. Click "Sign Up"
3. Fill in your details
4. Verify your email

### Step 2: Get API Credentials

1. Log in to https://app.dataforseo.com/
2. Go to **Account** → **API Access**
3. Copy your **Login** (email)
4. Copy your **Password** (API password, not account password)

### Step 3: Add Credits

**Minimum**: $10 to start
**Recommendation**: $50 for testing + first month

1. Go to **Account** → **Billing**
2. Add credits via credit card
3. **Cost per keyword research**: ~$0.05-0.075

---

## Configure Locally

Update `.env.local`:

```bash
DATAFORSEO_LOGIN=your.email@example.com
DATAFORSEO_PASSWORD=your_api_password_here
```

**⚠️ Important**: Use the API password, NOT your account password!

---

## Deploy to Cloudflare Pages

### Option 1: Via Wrangler CLI

```bash
npx wrangler pages secret put DATAFORSEO_LOGIN
# Enter: your.email@example.com

npx wrangler pages secret put DATAFORSEO_PASSWORD
# Enter: your_api_password
```

### Option 2: Via Cloudflare Dashboard

1. Go to Cloudflare Pages dashboard
2. Select your project ("tpp")
3. Go to **Settings** → **Environment variables**
4. Click **Add variables**
5. Add:
   - `DATAFORSEO_LOGIN` = your.email@example.com
   - `DATAFORSEO_PASSWORD` = your_api_password
6. Save and redeploy

---

## Test Locally

```bash
# Build
npm run build

# Test the API
curl -X POST http://localhost:3001/api/keyword-research \
  -H "Content-Type: application/json" \
  -d '{"keyword":"digital marketing Sydney"}'

# Should see real keyword data with dataSource: "dataforseo"
```

---

## Pricing & Costs

### Pay-As-You-Go

| Endpoint | Cost | Speed |
|----------|------|-------|
| Standard Queue | $0.05/request | 45 min |
| Live Mode | $0.075/request | 7-32 sec |

**We use**: Standard Queue ($0.05/request)

### Monthly Estimates

| Traffic | Requests/Month | Cost |
|---------|----------------|------|
| Low (100 users) | ~300 | $15 |
| Medium (500 users) | ~1,500 | $75 |
| High (2,000 users) | ~6,000 | $300 |

### Cost Optimization

1. **Caching**: We cache results for 1 hour (reduces repeat costs)
2. **Rate Limiting**: 10 requests/hour/IP (prevents abuse)
3. **Fallback**: If API fails, shows sample data (no cost)

---

## How It Works

### Without DataForSEO (Current)
```
User → Keyword Research Tool → Sample Data
```
- Badge: "Sample Data for Demo"
- Data: Static 10 keywords
- Cost: $0

### With DataForSEO (After Setup)
```
User → Keyword Research Tool → DataForSEO API → Real Google Data
```
- Badge: "Real Keyword Data"
- Data: Up to 30 real keywords from Google
- Cost: ~$0.05 per search

---

## Verification

### Check if API is Working

```bash
# Deploy
npm run deploy

# Test production
curl -X POST https://your-site.pages.dev/api/keyword-research \
  -H "Content-Type: application/json" \
  -d '{"keyword":"SEO Sydney"}' | jq '.meta.dataSource'

# Should return: "dataforseo"
```

### Check Logs

Cloudflare Pages logs will show:
```json
{
  "event": "keyword_research_success",
  "dataSource": "dataforseo",
  "keyword": "SEO Sydney",
  "resultCount": 28,
  "responseTime": 1200,
  "cost": 0.05
}
```

---

## Troubleshooting

### "Using sample data" even with credentials

**Check**:
1. Environment variables are set in Cloudflare (not just `.env.local`)
2. API password is correct (not account password)
3. Account has credits ($10 minimum)
4. Redeploy after adding environment variables

### "Authentication failed"

**Fix**:
- Verify login email is exact match
- Regenerate API password in DataForSEO dashboard
- Check for extra spaces in credentials

### "Insufficient funds"

**Fix**:
- Add credits: https://app.dataforseo.com/billing
- Minimum $10 to start

### Bundle size error

**This shouldn't happen** - `dataforseo-client` is only ~500KB

If it does:
```bash
npm list dataforseo-client
# Verify version 2.0.7 or similar
```

---

## Upgrading from Sample Data

### Before (Sample Data)
- UI shows: "Sample Data for Demo"
- 10 static keywords
- No API costs
- Good for demos, not useful for real research

### After (Real Data)
- UI shows: "Real Keyword Data"
- Up to 30 real keywords from Google
- ~$0.05 per search
- Actually useful for SEO research

---

## Support

- **DataForSEO Docs**: https://docs.dataforseo.com/v3
- **API Reference**: https://docs.dataforseo.com/v3/keywords_data/google_ads/search_volume/live
- **Support**: support@dataforseo.com
- **Status Page**: https://status.dataforseo.com/

---

## Next Steps

1. ✅ Sign up for DataForSEO
2. ✅ Add $10-50 credits
3. ✅ Get API credentials
4. ✅ Add to Cloudflare Pages environment variables
5. ✅ Deploy
6. ✅ Test with real keyword
7. 🎉 Enjoy real keyword data!

**Estimated Time**: 5-10 minutes
**Cost**: $10 minimum, ~$50/month for moderate usage
