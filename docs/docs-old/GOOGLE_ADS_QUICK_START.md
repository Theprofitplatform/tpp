# 🚀 Google Ads API - Quick Start Guide

## TL;DR - What to Do

1. Go to https://console.cloud.google.com/ → Create OAuth credentials
2. Go to https://ads.google.com/ → Get developer token
3. Run `node scripts/generate-google-ads-token.js` → Get refresh token
4. Update `.env.local` with your credentials
5. Run `node scripts/test-google-ads-connection.js` → Verify it works
6. Deploy to Cloudflare Pages with environment variables

**Full details**: See `GOOGLE_ADS_API_SETUP.md`

## 📋 Required Information

You need to collect these 6 values:

| Variable | Where to Get It | Example |
|----------|----------------|---------|
| `GOOGLE_ADS_CLIENT_ID` | Google Cloud Console → OAuth 2.0 | `123456789.apps.googleusercontent.com` |
| `GOOGLE_ADS_CLIENT_SECRET` | Google Cloud Console → OAuth 2.0 | `GOCSPX-abc123...` |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | Google Ads → API Center | `Ab12Cd34Ef56...` |
| `GOOGLE_ADS_REFRESH_TOKEN` | Generated using script | `1//0abc123...` |
| `GOOGLE_ADS_CUSTOMER_ID` | Google Ads → Account ID | `1234567890` (no dashes) |
| `GOOGLE_ADS_LOGIN_CUSTOMER_ID` | Manager Account ID | `1234567890` (usually same) |

## ⚡ 5-Minute Setup (If You Already Have a Google Ads Account)

```bash
# 1. Set your OAuth credentials from Google Cloud Console
export GOOGLE_ADS_CLIENT_ID="your_client_id"
export GOOGLE_ADS_CLIENT_SECRET="your_client_secret"

# 2. Generate refresh token
node scripts/generate-google-ads-token.js
# → Follow the URL, authorize, paste the code

# 3. Update .env.local with all 6 values

# 4. Test connection
node scripts/test-google-ads-connection.js
# → Should show "✅ Connection successful!"

# 5. Deploy
npm run build
npm run deploy
```

## 🎯 What Happens After Setup

### Before (Current State)
- ❌ Uses fake/sample data (~51 static keywords)
- ❌ Random search volumes (not accurate)
- ❌ Shows "Sample Data for Demo" badge

### After (With Google Ads API)
- ✅ Real data from Google's Keyword Planner
- ✅ Accurate search volumes, CPC, competition
- ✅ Dynamic keyword suggestions
- ✅ Up to 15,000 requests/day (free)

## 🆓 Is It Really Free?

**Yes!** Google provides:
- ✅ 15,000 keyword operations/day FREE
- ✅ No credit card required for API
- ✅ Enough for ~500-1000 visitors/day

**Caveat**: You need a Google Ads account with billing info entered (but won't be charged unless you run ads).

## 🔒 Security Note

**Never commit these to Git**:
- ❌ Client Secret
- ❌ Refresh Token
- ❌ Developer Token

They're already in `.gitignore` via `.env.local`

For Cloudflare Pages, use environment variables or Wrangler secrets.

## 📞 Common Issues

### "Developer token pending approval"
**Fix**: Use a test account while waiting (can take 24 hours)

### "Customer not found"
**Fix**: Remove dashes from customer ID (`123-456-7890` → `1234567890`)

### "Authentication error"
**Fix**: Regenerate refresh token using the script

### "Quota exceeded"
**Fix**: Add caching (already implemented: 1 hour cache)

## 🎓 Learning Resources

- **Full Setup Guide**: `GOOGLE_ADS_API_SETUP.md` (comprehensive, step-by-step)
- **Next Steps**: `NEXT_STEPS.md` (what to do after setup)
- **Google Docs**: https://developers.google.com/google-ads/api/docs/start

---

**Ready?** Start with `GOOGLE_ADS_API_SETUP.md` for detailed instructions!
