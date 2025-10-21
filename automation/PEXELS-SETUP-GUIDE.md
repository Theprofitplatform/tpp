# Pexels API Setup Guide

## Why Pexels?

**Problem:** Unsplash demo API keys have 50 requests/hour limit (frequently hit during bulk updates)

**Solution:** Add Pexels as fallback source with 200 requests/hour limit (4x better)

**Result:** Combined 250 requests/hour capacity, automatic failover during rate limits

## Quick Setup (2 Minutes)

### 1. Get Free Pexels API Key

1. Visit: https://www.pexels.com/api/
2. Click "Get Started" button
3. Fill out simple form:
   - Name
   - Email
   - Project description (e.g., "Blog post hero images for marketing website")
4. Click "Create API Key"
5. **Copy your API key** (shown immediately, starts with long alphanumeric string)

**No approval wait, no credit card required, instant access.**

### 2. Add to Environment Variables

Edit `.env.local` file in project root:

```bash
# Existing
UNSPLASH_ACCESS_KEY=tuwGL1GDRQt_rWT3XEyJbvd83mn0IUEGc_Q9VLM3Klo

# Add Pexels key
PEXELS_API_KEY=YOUR_PEXELS_KEY_HERE
```

### 3. Test the Integration

```bash
# Test with both sources
PEXELS_API_KEY=your_key_here npm run image:refresh-all

# Or test individual search
node automation/scripts/test-keywords.mjs
```

## How Dual-Source Works

**Automatic Fallback Logic:**

1. **First attempt:** Try Unsplash API
   - If success → Use Unsplash image
   - If 403 rate limit → Immediately try Pexels

2. **Fallback:** Try Pexels API
   - If success → Use Pexels image
   - If also fails → Keep existing image

3. **Both sources use same improved keyword mappings**
   - "professional tradesman tools" for plumber posts
   - "business growth chart" for conversion posts
   - "professional office desk" for lawyer posts
   - 60+ contextual mappings

## Rate Limits Comparison

| Source | Free Tier Limit | Notes |
|--------|----------------|-------|
| Unsplash Demo | 50 req/hour | What we've been hitting |
| Unsplash Production | 5,000 req/hour | Requires application |
| Pexels | 200 req/hour | Instant access, no approval |
| **Combined** | **250 req/hour** | Best of both |

## Benefits

1. **4x More Requests:** 50 → 250 requests/hour combined
2. **Automatic Failover:** No manual intervention during rate limits
3. **Wider Selection:** Two different image libraries
4. **Same Quality:** Both provide professional stock photography
5. **Zero Cost:** Both free for typical usage

## Files Modified

- `automation/scripts/unsplash-fetcher.mjs` - Added Pexels integration + fallback logic
- `automation/scripts/refresh-all-images.mjs` - Updated to use both sources
- `automation/scripts/generate-blog-post.js` - Updated for new blog posts
- `.env.local` - Add PEXELS_API_KEY

## Usage

All existing commands work unchanged:

```bash
# Refresh all images (automatically uses both sources)
npm run image:refresh-all

# Generate new blog post (automatically uses both sources)
npm run topics:generate

# Check for duplicates
npm run image:check-duplicates

# Fix duplicates
npm run image:fix-duplicates
```

The system automatically:
- Tries Unsplash first
- Falls back to Pexels if rate limited
- Tracks which source provided each image
- Shows source in summary reports

## Testing

After adding your Pexels API key, test it:

```bash
# Test a few searches with Pexels
PEXELS_API_KEY=your_key node -e "
const url = 'https://api.pexels.com/v1/search?query=professional%20tradesman%20tools&orientation=landscape&per_page=1';
fetch(url, { headers: { 'Authorization': 'YOUR_KEY_HERE' }})
  .then(r => r.json())
  .then(d => console.log('Success! Found:', d.photos[0].photographer));
"
```

## Next Steps

1. **Get Pexels API key** (2 minutes): https://www.pexels.com/api/
2. **Add to .env.local**
3. **Run refresh script**: `npm run image:refresh-all`
4. **Verify images are contextually relevant**
5. **Deploy to production**

---

**Status:** Ready to use as soon as Pexels API key is added
**Time to setup:** ~2 minutes
**Cost:** Free
