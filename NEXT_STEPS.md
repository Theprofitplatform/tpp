# Google Ads Keyword Research API - Next Steps

## ✅ What's Been Done

1. ✅ Installed `google-ads-api` package
2. ✅ Created comprehensive setup guide: `GOOGLE_ADS_API_SETUP.md`
3. ✅ Created helper scripts:
   - `scripts/generate-google-ads-token.js` - Generate OAuth refresh token
   - `scripts/test-google-ads-connection.js` - Test API connection
4. ✅ Updated API functions:
   - `functions/api/keyword-research.js` - Main handler with fallback logic
   - `functions/api/keyword-research-google-ads.js` - Google Ads integration
   - `functions/api/keyword-research-fallback.js` - Sample data fallback
5. ✅ Added environment variable templates to `.env.local`
6. ✅ Updated UI to remove misleading "Real Search Data" badge
7. ✅ Added disclaimer about sample data

## 🚀 What You Need to Do Next

### Step 1: Get Google Ads API Credentials (30-60 minutes)

Follow the detailed instructions in `GOOGLE_ADS_API_SETUP.md`:

1. **Google Cloud Console**:
   - Create project
   - Enable Google Ads API
   - Create OAuth 2.0 credentials
   - Download client ID and secret

2. **Google Ads Manager Account**:
   - Create MCC account at https://ads.google.com/home/tools/manager-accounts/
   - Get developer token from API Center
   - (Optional) Create test account for development

3. **Generate Refresh Token**:
   ```bash
   # First, set your credentials
   export GOOGLE_ADS_CLIENT_ID="your_client_id"
   export GOOGLE_ADS_CLIENT_SECRET="your_client_secret"

   # Generate refresh token
   node scripts/generate-google-ads-token.js
   ```

4. **Update `.env.local`**:
   Replace the placeholder values with your real credentials:
   ```bash
   GOOGLE_ADS_CLIENT_ID=your_actual_client_id
   GOOGLE_ADS_CLIENT_SECRET=your_actual_client_secret
   GOOGLE_ADS_DEVELOPER_TOKEN=your_actual_dev_token
   GOOGLE_ADS_REFRESH_TOKEN=your_actual_refresh_token
   GOOGLE_ADS_CUSTOMER_ID=1234567890  # No dashes
   GOOGLE_ADS_LOGIN_CUSTOMER_ID=1234567890  # Manager account ID
   ```

### Step 2: Test the Connection (5 minutes)

```bash
# Test Google Ads API connection
node scripts/test-google-ads-connection.js
```

If successful, you'll see keyword ideas from Google's real data!

### Step 3: Deploy to Cloudflare Pages (10 minutes)

Add the environment variables to Cloudflare:

```bash
# Option 1: Using Wrangler CLI
npx wrangler pages secret put GOOGLE_ADS_DEVELOPER_TOKEN
npx wrangler pages secret put GOOGLE_ADS_CLIENT_ID
npx wrangler pages secret put GOOGLE_ADS_CLIENT_SECRET
npx wrangler pages secret put GOOGLE_ADS_REFRESH_TOKEN
npx wrangler pages secret put GOOGLE_ADS_CUSTOMER_ID
npx wrangler pages secret put GOOGLE_ADS_LOGIN_CUSTOMER_ID
```

**Option 2: Via Cloudflare Dashboard**:
1. Go to your Pages project
2. Settings → Environment variables
3. Add each variable for Production environment

### Step 4: Build and Deploy

```bash
# Build the site
npm run build

# Deploy to Cloudflare Pages
npm run deploy
```

### Step 5: Test in Production

Visit: https://theprofitplatform.com.au/tools/keyword-research/

Enter a keyword and check:
- ✅ Real search volume data from Google
- ✅ Accurate competition metrics
- ✅ CPC ranges
- ✅ Keyword clustering

## 📊 Current Behavior

### Without Google Ads API Configuration
- Uses sample/demo data (static ~51 keywords)
- Shows disclaimer about sample data
- Badge says "Sample Data for Demo"

### With Google Ads API Configuration
- Fetches real-time data from Google Ads
- Accurate search volumes, CPC, competition
- Dynamic keyword suggestions based on seed keyword
- Can update badge to "Real Google Data"

## 🔧 Troubleshooting

### "Missing environment variables"
- Check `.env.local` has all variables
- Ensure no placeholder values remain
- Verify customer ID has no dashes

### "Authentication error"
- Verify OAuth credentials are correct
- Check refresh token is valid
- Ensure developer token is for correct account

### "Developer token not approved"
- Use test account during pending approval
- Apply for production access in Google Ads
- Check API Center for approval status

### "Quota exceeded"
- Free tier: 15,000 operations/day
- Each keyword request = ~1 operation
- Implement caching (already done: 1 hour cache)

## 💰 Cost Considerations

**Current Setup (Free Tier)**:
- ✅ 15,000 keyword requests/day (free)
- ✅ No credit card required
- ✅ Suitable for moderate traffic

**Scaling**:
- If you exceed free tier, costs are minimal
- Typical cost: $0.001 per keyword idea
- 1,000 requests/day = ~$30/month
- Implement caching to reduce costs (already done)

## 🎯 Optional Improvements

1. **Update UI badge** (when API is configured):
   ```astro
   <span class="badge"><i class="fas fa-database"></i> Real Google Data</span>
   ```

2. **Add data freshness indicator**:
   Show "Updated 5 minutes ago" based on cache

3. **Implement rate limiting**:
   Prevent abuse and manage quota

4. **Add more locations**:
   Expand beyond Sydney (Melbourne, Brisbane, etc.)

5. **Historical trends**:
   Use Google Ads Historical Metrics endpoint

## 📚 Resources

- Setup Guide: `GOOGLE_ADS_API_SETUP.md`
- Google Ads API Docs: https://developers.google.com/google-ads/api/docs/start
- Keyword Planning: https://developers.google.com/google-ads/api/docs/keyword-planning/overview
- Node.js Library: https://developers.google.com/google-ads/api/docs/client-libs/nodejs

## ✉️ Need Help?

If you run into issues:
1. Check `GOOGLE_ADS_API_SETUP.md` for detailed instructions
2. Run `node scripts/test-google-ads-connection.js` for diagnostics
3. Check Cloudflare Pages logs for errors
4. Verify all environment variables are set correctly

Good luck! 🚀
