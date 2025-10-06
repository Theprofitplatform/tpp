# Environment Variables Setup Guide

## 🔐 Required Environment Variables for Production

This guide will help you configure the necessary environment variables in Cloudflare Pages to make all tools fully functional.

---

## 1. SERP API Key (CRITICAL - Required for Rank Tracker)

### What it does:
Enables the Rank Tracker tool to fetch real Google search results and determine website rankings.

### How to get it:

1. **Sign up for SerpAPI:**
   - Visit: https://serpapi.com/
   - Create a free account
   - Free tier includes: **100 searches/month**

2. **Get your API key:**
   - After login, go to: https://serpapi.com/manage-api-key
   - Copy your API key (format: `abc123def456...`)

3. **Pricing (if you exceed free tier):**
   - Pay-as-you-go: $0.02 - $0.05 per search
   - 5,000 searches/month: $50/month
   - 20,000 searches/month: $150/month

### How to set in Cloudflare:

```bash
# Variable name:
SERP_API_KEY

# Value (example):
abc123def456789ghi012jkl345mno678pqr901stu234

# Environment:
Production
```

**Steps:**
1. Log into Cloudflare Dashboard
2. Go to: **Pages** → **tpp** → **Settings** → **Environment Variables**
3. Click **Add variable**
4. Set variable name: `SERP_API_KEY`
5. Paste your SerpAPI key as the value
6. Select environment: **Production**
7. Click **Save**

**After saving:** Cloudflare will automatically redeploy your site with the new environment variable.

---

## 2. Backend API URL (OPTIONAL - For Beta Tools)

### What it does:
Enables the Competitor Analysis and AI Content Generator tools by connecting to your backend API server.

### Required for:
- ⚠️ Competitor Analysis tool
- ⚠️ AI Content Generator tool

### Value:
```bash
# Variable name:
BACKEND_API_URL

# Value (your VPS backend):
https://api.theprofitplatform.com.au

# Environment:
Production
```

### How to set in Cloudflare:

**Steps:**
1. Log into Cloudflare Dashboard
2. Go to: **Pages** → **tpp** → **Settings** → **Environment Variables**
3. Click **Add variable**
4. Set variable name: `BACKEND_API_URL`
5. Enter your backend URL: `https://api.theprofitplatform.com.au`
6. Select environment: **Production**
7. Click **Save**

**Note:** Your backend API must be running and accessible at the provided URL.

---

## 3. Verify Environment Variables

### Check if variables are set:

1. **Via Cloudflare Dashboard:**
   - Pages → tpp → Settings → Environment Variables
   - You should see:
     ```
     SERP_API_KEY: •••••••••••••• (hidden)
     BACKEND_API_URL: https://api.theprofitplatform.com.au
     ```

2. **Test in production:**
   - Visit: https://theprofitplatform.com.au/tools/rank-tracker/
   - Enter a domain + keyword
   - If it works → ✅ SERP_API_KEY is configured correctly
   - If you see "Rank tracker is currently offline" → ❌ Variable not set

---

## 4. Development Environment (Local)

For local development, create a `.env` file in the project root:

```bash
# .env (for local development only)
SERP_API_KEY=your_key_here
BACKEND_API_URL=https://api.theprofitplatform.com.au
```

**Important:**
- ⚠️ Never commit `.env` to git
- ⚠️ `.env` is already in `.gitignore`
- Use `.env.example` to document required variables

---

## 5. Cost Monitoring

### SERP API Usage Tracking:

1. **Monitor in SerpAPI Dashboard:**
   - Visit: https://serpapi.com/account
   - Check: "API Calls This Month"

2. **Set up alerts:**
   - Go to: https://serpapi.com/account#alerts
   - Enable email alerts at 80% usage
   - Set monthly budget limit

3. **Estimated costs based on traffic:**
   - 100 searches/month: **Free tier** ✅
   - 500 searches/month: ~$25/month
   - 1,000 searches/month: ~$50/month
   - 5,000 searches/month: ~$150/month

### Cost optimization tips:
- ✅ Rate limiting implemented (10 sec cooldown)
- ✅ Input validation prevents wasted API calls
- ✅ Error handling prevents retry loops
- Consider caching results (not yet implemented)

---

## 6. Troubleshooting

### Issue: "Rank tracker is currently offline"

**Possible causes:**
1. `SERP_API_KEY` not set in Cloudflare
2. API key is invalid or expired
3. SerpAPI quota exceeded

**Solutions:**
1. Verify environment variable is set in Cloudflare Dashboard
2. Check API key validity at https://serpapi.com/manage-api-key
3. Check remaining quota at https://serpapi.com/account

---

### Issue: "Too many requests. Please wait..."

**Cause:** Rate limiting (10 second cooldown)

**Solution:** This is working as intended. User must wait 10 seconds between searches to prevent API abuse.

---

### Issue: Beta tools not working

**Cause:** `BACKEND_API_URL` not set or backend server is down

**Solutions:**
1. Set `BACKEND_API_URL` environment variable
2. Verify backend server is running at specified URL
3. Check backend server logs for errors

---

## 7. Security Best Practices

### ✅ DO:
- Store API keys in Cloudflare environment variables only
- Use Cloudflare's encryption for sensitive values
- Rotate API keys periodically (every 90 days)
- Monitor API usage for anomalies
- Set up billing alerts

### ❌ DON'T:
- Hard-code API keys in source code
- Commit API keys to git
- Share API keys publicly
- Use same key for dev and production
- Ignore usage alerts

---

## 8. Environment Variable Summary

| Variable | Required | Used By | Default | Notes |
|----------|----------|---------|---------|-------|
| `SERP_API_KEY` | ✅ Yes | Rank Tracker | None | Get from serpapi.com |
| `BACKEND_API_URL` | ⚠️ Optional | Beta Tools | None | Your VPS backend URL |

---

## 9. Quick Start Checklist

### For Rank Tracker (Essential):
- [ ] Create SerpAPI account at https://serpapi.com/
- [ ] Copy your API key
- [ ] Log into Cloudflare Dashboard
- [ ] Add `SERP_API_KEY` to environment variables
- [ ] Save and wait for automatic redeploy (~2 min)
- [ ] Test at https://theprofitplatform.com.au/tools/rank-tracker/

### For Beta Tools (Optional):
- [ ] Ensure backend server is running
- [ ] Get backend server URL
- [ ] Add `BACKEND_API_URL` to environment variables
- [ ] Save and wait for redeploy
- [ ] Test Competitor Analysis and Content Generator tools

---

## 10. Support

**Need help?**
- Cloudflare Support: https://developers.cloudflare.com/support/
- SerpAPI Docs: https://serpapi.com/docs
- Contact: avi@theprofitplatform.com.au
- Phone: 0487 286 451

---

**Last updated:** 2025-10-04
