# Unsplash Hero Image Integration

## Problem Solved

All automated blog posts were showing the same default SVG gradient hero image. This system automatically fetches **unique, relevant, high-quality images from Unsplash** for each blog post.

## Features

✅ **Automatic image fetching** - No manual work required
✅ **Duplicate prevention** - Tracks last 20 images used
✅ **Category-based search** - Fetches relevant images based on blog category
✅ **Proper attribution** - Includes photographer credits as required by Unsplash
✅ **Graceful fallback** - Uses default SVG if API fails
✅ **3-attempt retry** - Tries 3 times to find a unique image

## Setup Instructions

### 1. Get Unsplash API Access Key

1. Go to https://unsplash.com/developers
2. Register as a developer (free)
3. Create a new application
4. Copy your **Access Key** (not Secret Key)

### 2. Add to Environment Variables

Add to your `.env.local` file:

```bash
# Unsplash API (for blog hero images)
UNSPLASH_ACCESS_KEY=your_access_key_here
```

### 3. Test the Integration

```bash
# Test fetching an image
node automation/scripts/unsplash-fetcher.mjs "SEO" "Test Blog Post"

# Generate a blog post with image
node automation/scripts/generate-blog-post.js
```

## How It Works

### Image Selection Process

1. **Category Mapping** - Maps blog categories to relevant search keywords:
   - SEO → "seo", "search engine", "analytics"
   - Google Ads → "google ads", "ppc", "advertising"
   - Web Design → "web design", "website", "ui design"
   - etc.

2. **Title Keywords** - Extracts relevant keywords from post title

3. **Unsplash Query** - Searches for images matching the keywords
   - Orientation: Landscape
   - Content filter: High quality
   - Random to ensure variety

4. **Duplicate Check** - Verifies image wasn't used in last 20 posts

5. **Retry Logic** - If duplicate found, tries up to 3 times

### Frontmatter Output

When successful, adds these fields to blog post frontmatter:

```yaml
---
title: "Blog Post Title"
# ... other fields ...
coverImage: "https://images.unsplash.com/photo-xyz..."
coverImageAlt: "Description of the image"
coverImageCredit:
  name: "Photographer Name"
  link: "https://unsplash.com/@photographer"
---
```

### Template Integration

The blog template (`src/pages/blog/[...slug].astro`) already supports these fields:

- If `coverImage` exists → Shows Unsplash image with attribution
- If no `coverImage` → Falls back to default SVG gradient

## Tracking System

### used-images.json

Location: `automation/used-images.json`

Tracks images used in recent posts:

```json
{
  "images": [
    {
      "id": "abc123",
      "url": "https://images.unsplash.com/...",
      "photographer": {
        "name": "John Doe",
        "link": "https://unsplash.com/@johndoe"
      },
      "usedAt": "2025-01-19T10:30:00.000Z"
    }
  ],
  "lastUpdated": "2025-01-19T10:30:00.000Z"
}
```

**Auto-managed** - No manual editing required

## Category Keywords Customization

To customize search keywords for better image relevance, edit `automation/scripts/unsplash-fetcher.mjs`:

```javascript
const CATEGORY_KEYWORDS = {
  'SEO': ['seo', 'search engine', 'analytics', 'website optimization'],
  'Google Ads': ['google ads', 'ppc', 'advertising'],
  // Add more categories or modify existing ones
};
```

## Usage Examples

### Check for Duplicate Images

```bash
# Check if any blog posts have duplicate hero images
npm run image:check-duplicates

# Or run directly
node automation/scripts/check-duplicate-images.mjs
```

Output example:
```
📊 Results:
⚠️  DUPLICATE IMAGES FOUND: 4 images used multiple times

🖼️  Image used 3 times:
   URL: https://images.unsplash.com/photo-xyz...
   Posts:
      - post1.md
      - post2.md
      - post3.md

💡 Total posts needing unique images: 10
```

### Fix Duplicate Images

```bash
# Automatically replace duplicate images with unique ones
npm run image:fix-duplicates

# Or run directly
node automation/scripts/fix-duplicate-images.mjs
```

This will:
1. Find all posts using duplicate images
2. Keep the first post with each image
3. Fetch new unique images for the rest
4. Update frontmatter automatically

### Batch Update Old Posts

```bash
# Add images to posts that don't have any
npm run image:update-all

# Or run directly
node automation/scripts/update-blog-images.mjs
```

### Manual Image Fetch (Testing)

```bash
# Fetch image for SEO category
node automation/scripts/unsplash-fetcher.mjs "SEO" "Complete SEO Guide"

# Fetch image for Google Ads category
node automation/scripts/unsplash-fetcher.mjs "Google Ads" "PPC Strategies"
```

### Automated Blog Generation

```bash
# Standard workflow (includes image fetching)
node automation/scripts/generate-blog-post.js

# With specific topic ID
TOPIC_ID=5 node automation/scripts/generate-blog-post.js
```

### Output Example

```
🚀 Blog Post Generator Starting...

📝 Selected Topic:
   ID: 5
   Title: SEO for Plumbers Sydney
   Category: SEO
   Keyword: seo for plumbers

🤖 Generating blog post with Claude AI...

🖼️  Fetching unique hero image...
🔍 Searching Unsplash for: "search engine"
✅ Found unique image by John Photographer

✅ Blog post generated successfully!
   File: 2025-01-19-seo-for-plumbers-sydney.md
   Words: 2,847
   Slug: seo-for-plumbers-sydney
   Hero Image: ✅ Unique Unsplash image

✅ Topic marked as completed in queue
```

## Troubleshooting

### No Images Appearing

**Check:**
1. Is `UNSPLASH_ACCESS_KEY` in `.env.local`?
2. Is the API key valid? (Check Unsplash dashboard)
3. Check console output for error messages

**Solution:**
- Posts will use default SVG if API fails
- No blocking errors - generation continues

### All Images Look Similar

**Cause:** Search keywords may be too generic

**Solutions:**
1. Add more specific keywords in `CATEGORY_KEYWORDS`
2. Customize keywords based on your content themes
3. Mix in title-based keywords (already automatic)

### Rate Limit Errors

**Unsplash Limits:**
- Demo: 50 requests/hour
- Production: Up to 50,000 requests/month (apply for production keys)

**Solution:**
1. Apply for production API access at https://unsplash.com/api-terms
2. Reduce blog generation frequency
3. System will gracefully fall back to default images

### Duplicate Detection Not Working

**Check:**
- `automation/used-images.json` exists and is writable
- File has proper JSON format

**Reset:**
```bash
# Clear tracking (all images become "new")
echo '{"images":[],"lastUpdated":"'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"}' > automation/used-images.json
```

## Maintenance

### Check for Duplicates Regularly

**Recommended:** Run duplicate check monthly or after bulk imports

```bash
# Quick check
npm run image:check-duplicates

# If duplicates found, fix them
npm run image:fix-duplicates
```

### Clear Old Image Tracking

The system tracks last 20 images. To reset:

```bash
rm automation/used-images.json
# Will auto-create empty file on next run
```

### Update Search Keywords

Edit `automation/scripts/unsplash-fetcher.mjs` and modify `CATEGORY_KEYWORDS` object.

### Monitor Image Quality

1. Check blog posts visually after generation
2. Adjust category keywords if images aren't relevant
3. Consider adding topic-specific overrides
4. Run duplicate checks periodically

## Compliance & Attribution

### Unsplash Requirements

✅ **Implemented:**
- Photographer credit with link
- Trigger download endpoint (tells Unsplash image was used)
- UTM parameters for attribution links

✅ **Automatic:**
- All attribution handled by blog template
- Visible on every blog post with Unsplash image
- Links to photographer and Unsplash

### License

Unsplash images are **free to use** under Unsplash License:
- Commercial and non-commercial use
- No permission required
- Attribution appreciated (we include it automatically)

## Advanced Configuration

### Change Image Orientation

In `unsplash-fetcher.mjs`, modify the fetch function:

```javascript
url.searchParams.append('orientation', 'portrait'); // or 'squarish'
```

### Content Filtering

```javascript
url.searchParams.append('content_filter', 'high'); // 'low' for more variety
```

### Customize Retry Count

```javascript
for (let attempt = 0; attempt < 5; attempt++) { // Change 3 to 5
```

## Benefits

📈 **Better Visual Appeal** - Professional, unique images for each post
🎨 **Content Variety** - No more repeated hero images
⚡ **Zero Manual Work** - Fully automated
✅ **SEO Benefits** - Relevant images improve content quality
📱 **Mobile Optimized** - Responsive images with proper alt text
🔒 **Legal Compliance** - Proper attribution and licensing

## Next Steps

1. ✅ Get Unsplash API key
2. ✅ Add to `.env.local`
3. ✅ Test with sample blog generation
4. 🎯 Generate blog posts as normal
5. 📊 Monitor results and adjust keywords if needed

---

**Questions?** Check the main automation guide: `automation/README-START-HERE.md`
