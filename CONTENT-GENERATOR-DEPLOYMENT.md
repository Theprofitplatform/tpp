# Content Generator Deployment Guide

## Status: Needs Environment Variable Configuration

The content generator has been successfully upgraded to Claude 3.5 Sonnet with all improvements, but requires an API key to be configured in Cloudflare Pages.

## What Was Done

### Code Improvements (Completed ✅)
1. ✅ Upgraded from template-based generation to Claude 3.5 Sonnet
2. ✅ Fixed statistics hallucination risk (uses qualitative terms instead of fake citations)
3. ✅ Removed fake "uniqueness: 100%" metric
4. ✅ Added output validation (word count, tone, banned phrases)
5. ✅ Added rate limiting (10 requests/minute)
6. ✅ Improved error handling with specific messages
7. ✅ Fixed legal risk in examples (general descriptions instead of specific business names)
8. ✅ Added honest SEO analysis without arbitrary scores

### Current Deployment Status
- **Code**: Deployed to Cloudflare Pages ✅
- **Environment Variable**: **NOT configured** ❌
- **Status**: API returns "Failed to generate content" because ANTHROPIC_API_KEY is missing

## Required Action: Configure API Key

### Step 1: Get Anthropic API Key
1. Go to https://console.anthropic.com/
2. Sign in or create an account
3. Navigate to API Keys
4. Create a new API key or copy existing one

### Step 2: Add to Cloudflare Pages
1. Go to Cloudflare Dashboard: https://dash.cloudflare.com/
2. Navigate to: Workers & Pages → tpp → Settings → Environment variables
3. Click "Add variable" under Production environment
4. Add:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: `sk-ant-api03-...` (your API key)
   - **Type**: Production
5. Click "Save"

### Step 3: Redeploy
After adding the environment variable, redeploy to activate:

```bash
npm run build
npx wrangler pages deploy dist --project-name=tpp
```

Or just push to git to trigger auto-deployment:
```bash
git commit --allow-empty -m "Trigger rebuild with API key"
git push
```

### Step 4: Test
Once deployed with the API key configured:

```bash
curl -X POST 'https://theprofitplatform.com.au/api/content-generator' \
  -H 'Content-Type: application/json' \
  -d '{
    "contentType": "blog_post",
    "topic": "benefits of meditation",
    "tone": "professional",
    "length": "short"
  }'
```

Expected response:
- ✅ `success: true`
- ✅ Content without fake citations
- ✅ No "uniqueness: 100%" metric
- ✅ Honest SEO analysis with real metrics

## Cost Estimate

**Claude 3.5 Sonnet Pricing** (as of Oct 2025):
- Input: $3 per million tokens (~$0.003 per 1K tokens)
- Output: $15 per million tokens (~$0.015 per 1K tokens)

**Per Request**:
- Short (300 words): ~$0.01
- Medium (600 words): ~$0.02
- Long (1000 words): ~$0.03

**With Rate Limiting**: Maximum 10 requests/minute = ~$18/hour max (unlikely)

**Realistic Usage**: 100 requests/day = ~$1-2/day = $30-60/month

## Verification Checklist

After configuration, verify:
- [ ] API key is added to Cloudflare Pages environment variables (Production)
- [ ] Redeploy triggered (either via git push or manual wrangler deploy)
- [ ] Test request returns `success: true`
- [ ] Generated content does NOT have specific citations like "According to HubSpot 2024"
- [ ] Response does NOT include `"uniqueness": "100%"`
- [ ] SEO analysis has real metrics, not arbitrary scores

## Rollback Plan

If issues occur, you can rollback to the VPS proxy version:

```bash
git revert HEAD
git push
```

This will restore the proxy that calls `https://api.theprofitplatform.com.au/api/content-generator`

However, note that the VPS backend uses template-based generation (not AI) and produces the fake citations and metrics we're trying to fix.

## Files Changed
- `functions/api/content-generator.js` - Complete rewrite (82 lines → 570 lines)
  - Direct Claude API integration
  - Output validation
  - Rate limiting
  - Honest metrics

## Next Steps After Configuration
1. Monitor Claude API usage in Anthropic console
2. Adjust rate limiting if needed (currently 10 req/min)
3. Consider adding KV namespace for distributed rate limiting across regions
4. Update VPS backend (backend/content-generator.js) to match new quality standards (optional)

## Support
If you encounter issues:
1. Check Cloudflare Pages logs for specific error messages
2. Verify API key is valid in Anthropic console
3. Test API key with a simple curl to Anthropic directly
4. Check if the API key has usage limits or billing issues

---

**Status**: Ready for API key configuration ⏳
**Last Updated**: 2025-10-05
