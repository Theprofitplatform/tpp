# Blog Quick Start Guide

## 🚀 Common Commands

### Development
```bash
# Start local dev server
npm run dev
# → Opens at http://localhost:3001/blog

# Build for production
npm run build

# Preview build locally
npm run preview
```

### Blog Management
```bash
# Add hero images to posts (Unsplash)
npm run blog:images

# Generate new blog post
npm run blog:generate

# Validate blog content
npm run blog:validate

# Run blog tests
npm run test:blog
```

### Deployment
```bash
# Deploy to Cloudflare Pages
npm run deploy

# Deploy with parity check
npm run deploy:auto
```

---

## ✍️ Creating a New Blog Post

### 1. Create the File
```bash
# In src/content/blog/
touch src/content/blog/my-new-post.md
```

### 2. Add Frontmatter
```yaml
---
title: "Your Awesome Blog Post Title"
description: "A compelling description for SEO and social sharing"
author: "Avi Sharma"  # or "The Profit Platform"
publishDate: 2025-10-15
category: "SEO"  # SEO, Google Ads, Marketing Strategy, etc.
tags: ["Local SEO", "Sydney", "Small Business"]
featured: false  # true for hero post on blog index
draft: false
# Image will be auto-added with npm run blog:images
seo:
  title: "Custom SEO Title | The Profit Platform"
  description: "Custom meta description for search engines"
  keywords: ["keyword1", "keyword2"]
---

## Your Content Starts Here

Write your amazing content...
```

### 3. Add Hero Image
```bash
# Automatically fetch from Unsplash
npm run blog:images

# Or manually add to frontmatter:
# coverImage: "https://images.unsplash.com/photo-xxxxx"
# coverImageAlt: "Description"
# coverImageCredit:
#   name: "Photographer Name"
#   link: "https://unsplash.com/@username"
```

### 4. Build & Deploy
```bash
npm run build
npm run deploy
```

---

## 🎨 Blog Features You Can Use

### Markdown Formatting
```markdown
# Heading 1
## Heading 2 (shows in TOC if 3+ H2/H3 exist)
### Heading 3 (shows in TOC)

**Bold text**
*Italic text*

[Link text](https://example.com)

![Image alt text](/images/example.jpg)

- Bullet point 1
- Bullet point 2

1. Numbered list
2. Another item

> Blockquote for emphasis

`inline code`

\`\`\`javascript
// Code block
const example = 'code';
\`\`\`
```

### Automatic Features
- ✅ **Table of Contents** - Auto-generated if 3+ H2/H3 headings
- ✅ **Reading Progress Bar** - Tracks scroll position
- ✅ **Related Posts** - Shows 3 related articles at bottom
- ✅ **Social Sharing** - Twitter, LinkedIn, Facebook, Copy link
- ✅ **View Tracking** - Tracks popularity in localStorage
- ✅ **Lazy Loading** - Images load as user scrolls
- ✅ **Breadcrumbs** - Navigation with schema markup
- ✅ **Comments** - Giscus integration (after setup)

---

## 🔧 Configuration

### Newsletter Integration
**File**: `src/pages/api/newsletter.ts` (line 28)

```typescript
// Replace with your email service
await mailchimp.lists.addListMember(LIST_ID, {
  email_address: email,
  status: 'subscribed'
});

// Or ConvertKit
await convertkit.forms.subscribe(FORM_ID, { email });
```

### Comments Setup (Giscus)
**File**: `src/pages/blog/[...slug].astro` (lines 236-238)

1. Create GitHub repo for comments
2. Enable Discussions
3. Visit https://giscus.app
4. Get configuration
5. Update these lines:
```html
data-repo="your-username/blog-comments"
data-repo-id="YOUR_REPO_ID"
data-category-id="YOUR_CATEGORY_ID"
```

---

## 📊 Testing

### Test Blog Features
```bash
npm run test:blog
```

### What Gets Tested
- ✅ Real stats showing
- ✅ Hero images loading
- ✅ Search functionality
- ✅ Category filtering
- ✅ Tag filtering
- ✅ Load More pagination
- ✅ Newsletter form
- ✅ Popular posts toggle
- ✅ Table of Contents
- ✅ Social sharing
- ✅ Related posts
- ✅ Comments section
- ✅ RSS feed
- ✅ Mobile responsive
- ✅ SEO meta tags

---

## 🐛 Troubleshooting

### "No images showing"
```bash
# Re-run image fetcher
npm run blog:images
```

### "Build fails"
```bash
# Check for frontmatter errors
npm run blog:validate

# Clean and rebuild
rm -rf dist .astro
npm run build
```

### "Changes not showing"
```bash
# Hard refresh browser
# Chrome/Edge: Ctrl + Shift + R
# Firefox: Ctrl + F5
# Safari: Cmd + Option + R
```

### "Tests failing"
```bash
# Check if Playwright browsers are installed
npx playwright install

# Run single test
npx playwright test tests/blog-verification.spec.js -g "Hero images"
```

---

## 📈 Best Practices

### SEO
- ✅ Use descriptive titles (50-60 characters)
- ✅ Write compelling meta descriptions (150-160 characters)
- ✅ Include target keywords naturally
- ✅ Use H2/H3 headings for structure
- ✅ Add alt text to images
- ✅ Link to related content

### Content
- ✅ Write for humans first, SEO second
- ✅ Use short paragraphs (2-3 sentences)
- ✅ Include actionable tips
- ✅ Add examples and case studies
- ✅ Use bullet points for readability
- ✅ Include a clear call-to-action

### Images
- ✅ Use landscape orientation (16:9)
- ✅ Minimum 1200x630px
- ✅ Always credit photographers
- ✅ Write descriptive alt text

### Categories
- `SEO` - SEO tips and strategies
- `Google Ads` - PPC and paid advertising
- `Marketing Strategy` - General marketing advice
- `tools-resources` - Tools and resources
- `case-studies` - Client success stories
- `marketing` - General marketing content

---

## 🔗 Useful Links

- **Live Blog**: https://theprofitplatform.com.au/blog/
- **RSS Feed**: https://theprofitplatform.com.au/rss.xml
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Unsplash API**: https://unsplash.com/oauth/applications
- **Giscus Setup**: https://giscus.app

---

## 📞 Need Help?

Check these files for examples:
- `src/content/blog/how-to-scale-local-seo.md` - Well-structured post
- `src/pages/blog.astro` - Blog index page
- `src/pages/blog/[...slug].astro` - Blog post template
- `BLOG_UPGRADE_SUMMARY.md` - Full feature documentation

---

**Last Updated**: October 5, 2025
