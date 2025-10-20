# Quick Start: Unique Blog Hero Images

## 60-Second Setup

### 1. Get Unsplash API Key (2 minutes)
```
1. Go to: https://unsplash.com/developers
2. Click "Register as a developer"
3. Create "New Application"
4. Copy your "Access Key"
```

### 2. Add to Environment (30 seconds)
```bash
# Edit .env.local file (create if missing)
echo "UNSPLASH_ACCESS_KEY=your_key_here" >> .env.local
```

### 3. Test (30 seconds)
```bash
# Generate a blog post - it will automatically fetch a unique image
node automation/scripts/generate-blog-post.js
```

## That's It!

Every blog post generated will now have:
- ✅ Unique, professional hero image
- ✅ Relevant to post category/topic
- ✅ Proper photographer attribution
- ✅ No duplicates (tracks last 20 images)

## What You'll See

```
🖼️  Fetching unique hero image...
🔍 Searching Unsplash for: "search engine optimization"
✅ Found unique image by John Photographer
```

## If API Key Missing

Posts will use default SVG gradient (no errors, graceful fallback)

## Files Created

```
automation/
├── scripts/
│   ├── unsplash-fetcher.mjs     ← Fetches images
│   └── generate-blog-post.js    ← Updated to use images
├── used-images.json              ← Tracks used images
├── UNSPLASH-SETUP.md             ← Full documentation
└── HERO-IMAGE-SOLUTION.md        ← Implementation details
```

## Need Help?

See full documentation: `automation/UNSPLASH-SETUP.md`

## Free Tier Limits

- **50 requests/hour** (plenty for blog automation)
- **50,000 requests/month** (apply for production key)
