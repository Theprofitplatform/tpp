# Blog SEO Quick Reference
## One-Page Cheat Sheet for A+ Blog Posts

---

## Checklist (Print This!)

### Critical (Must Have = Grade F if missing)
- [ ] **Meta Description**: 120-160 chars, no `**` or `*` formatting
- [ ] **Internal Links**: 8-12 links to TPP content
- [ ] **External Links**: 5-8 links to authoritative sources
- [ ] **Images**: 6-8 optimized images with alt text
- [ ] **Keyword Density**: 0.5-1.0% of target keyword

### High Priority (Should Have = Grade B)
- [ ] **FAQ Schema**: 6-8 questions in frontmatter
- [ ] **CTAs**: 3 calls-to-action (soft → medium → strong)
- [ ] **LSI Keywords**: 3-4 semantic variations
- [ ] **Word Count**: 2,500-3,500 words
- [ ] **Heading Hierarchy**: Proper H2 > H3 structure

---

## Quick Commands

```bash
# Check SEO quality of latest post
npm run blog:seo-check src/content/blog/latest-post.md

# Audit all blog posts
npm run blog:audit-all

# Generate new blog post (auto-optimized)
gh workflow run daily-blog-post.yml

# Check topic queue status
npm run topics:check
```

---

## Score Targets

| Grade | Score | Status | Action |
|-------|-------|--------|--------|
| **A+** | 96-100 | 🎉 Excellent | Publish immediately |
| **A** | 93-95 | ✅ Great | Publish with confidence |
| **A-** | 90-92 | ✅ Good | Minor polish recommended |
| **B+** | 87-89 | ⚠️ Okay | Fix high-priority items |
| **B** | 83-86 | ⚠️ Needs work | Significant improvements needed |
| **< B** | < 83 | ❌ Poor | Major revisions required |

---

## Internal Linking Strategy

### Always Link To:
- Related blog posts (keyword-based)
- Service pages (`/seo/`, `/google-ads/`, `/web-design/`)
- Location pages (`/locations/sydney/`, etc.)

### Linking Rules:
**Topic → URL Mapping:**
- "Google Business Profile" → `/blog/how-to-optimise-your-google-business-profile.../`
- "Local SEO checklist" → `/blog/local-seo-checklist-47-steps.../`
- "Keyword research" → `/blog/keyword-research-for-local-sydney.../`
- "Schema markup" → `/blog/schema-markup-for-local-sydney.../`
- "Multi-location" → `/blog/complete-guide-to-multi-location-seo.../`
- "Search Console" → `/blog/google-search-console-the-complete-guide.../`
- "Website speed" → `/blog/website-speed-optimization-how-sydney.../`

**Format:**
```markdown
Check our [Google Business Profile optimization guide](/blog/how-to-optimise-your-google-business-profile-for-sydney-local-search-in-2025/) for details.
```

---

## External Linking Guidelines

### Approved Authoritative Sources:
- **Google Official**: support.google.com, analytics.google.com, search.google.com
- **Tools**: moz.com, brightlocal.com, semrush.com
- **Industry**: searchengineland.com, searchenginejournal.com
- **Stats**: gov.au, statista.com

### Format:
```markdown
According to [Google's official guide](https://support.google.com/business/), ...
```

All external links auto-get: `target="_blank" rel="noopener"`

---

## Image Requirements

### Count & Types:
1. **Featured image** (1200x630px, WebP + JPG)
2. **Screenshots** (800x600px, WebP/PNG, < 200KB)
3. **Infographics** (800x2000px, SVG/PNG, < 150KB)
4. **Diagrams** (600x400px, SVG preferred)

### Alt Text Formula:
```
[Descriptive action] + [what it shows] + [for Sydney/location context]
```

**Examples:**
- ✅ "Sydney business owner optimizing Google Business Profile on laptop"
- ✅ "Google Local Pack showing top 3 plumbers in Bondi search results"
- ❌ "Business"
- ❌ "Screenshot"

---

## Keyword Optimization

### Target Density: 0.5-1.0%

**Example for 3,000-word post:**
- 0.5% = 15 mentions minimum
- 1.0% = 30 mentions maximum
- **Optimal**: 17-25 mentions

### Placement Priority:
1. Title (1x - required)
2. Meta description (1x - required)
3. First paragraph (2-3x)
4. H2/H3 headings (5-8x across all headings)
5. Throughout body (natural distribution)
6. Conclusion (2-3x)

### LSI Keywords (Add 3-4):
- "local search optimization"
- "Google Maps SEO"
- "local search rankings"
- "near me searches"

---

## CTA Placement

### 3 CTAs Required:

**1. Soft CTA** (After TOC):
```markdown
---
📥 **Free Resource**: Download our [topic] checklist.
[Get it here →](/resources/)
---
```

**2. Medium CTA** (Mid-article, after section 3-4):
```markdown
---
**Need expert help?** We specialize in [topic] for Sydney businesses.
[Schedule free consultation →](/contact/)
---
```

**3. Strong CTA** (Before conclusion):
```markdown
---
**Ready to dominate [topic]?**

The Profit Platform has helped 100+ Sydney businesses achieve results.

✅ Free audit
✅ Custom strategy
✅ Proven results

[Get your free audit →](/contact/) or call [+61 487 286 451](tel:+61487286451)
---
```

---

## FAQ Schema Template

Add to frontmatter:

```yaml
faq:
  - question: "What is [main topic]?"
    answer: "Brief 2-3 sentence answer with key info."

  - question: "How does [process] work?"
    answer: "Explain the process clearly and concisely."

  - question: "How long does it take to see results?"
    answer: "Realistic timeframe with context."

  - question: "How much does [service] cost?"
    answer: "Pricing guidance or range."

  - question: "Do I need [specific thing]?"
    answer: "Yes/no answer with reasoning."

  - question: "What are the benefits of [topic]?"
    answer: "List 3-5 key benefits."
```

**Target**: 6-8 FAQs per post

---

## Common Mistakes to Avoid

❌ **DON'T:**
- Use `**` in meta descriptions
- Link only to external sites (need internal too!)
- Skip images (visual content is critical)
- Keyword stuff (> 1.5% density)
- Use generic alt text ("image", "photo")
- Forget CTAs
- Ignore LSI keywords

✅ **DO:**
- Clean meta descriptions (120-160 chars)
- Balance internal (8-12) and external (5-8) links
- Use descriptive, keyword-rich alt text
- Natural keyword integration (0.5-1.0%)
- Place CTAs strategically (3 minimum)
- Include semantic variations

---

## File Naming

### Blog Post Files:
```
YYYY-MM-DD-slug-with-keywords.md
```

**Examples:**
- `2025-10-19-what-is-local-seo-complete-guide-for-sydney-businesses.md` ✅
- `blog-post.md` ❌

### Image Files:
```
[slug]-[type].[ext]
```

**Examples:**
- `what-is-local-seo-featured.jpg` ✅
- `what-is-local-seo-google-business-profile-screenshot.png` ✅
- `image1.jpg` ❌

---

## Frontmatter Template

```yaml
---
title: "Main Keyword: Descriptive Title for Sydney [Industry]"
description: "Clean description 120-160 chars with main keyword and location, no formatting."
pubDate: 2025-10-19
author: "Avi" # or "TPP Team" or "Aayush Shrestha" or "Abhishek Maharjan"
category: "SEO" # or "Google Ads", "Web Design", "Digital Marketing"
tags: ["Primary Tag","Secondary Tag","Location","Audience"]
featured: false
draft: false

faq:
  - question: "Question text?"
    answer: "Answer text."
---
```

---

## Testing Workflow

### Before Publishing:

1. **Run SEO Check:**
```bash
node automation/scripts/seo-enhance-blog.mjs src/content/blog/your-post.md
```

2. **Target Score:** A (90+) minimum, A+ (96+) ideal

3. **Fix Critical Issues First:**
   - Meta description
   - Internal/external links
   - Images
   - Keyword density

4. **Build & Preview:**
```bash
npm run build
npm run preview
```

5. **Deploy:**
```bash
npm run deploy
```

---

## Resources

**Files:**
- Full Plan: `BLOG-SEO-IMPROVEMENT-PLAN.md`
- SEO Checker: `automation/scripts/seo-enhance-blog.mjs`
- Internal Link Map: `automation/internal-link-map.json`

**Commands:**
- `npm run blog:seo-check <file>` - Check single post
- `npm run blog:audit-all` - Audit all posts
- `npm run topics:check` - Check topic queue
- `npm run health` - System health check

**Automation:**
- New posts auto-generated Mon/Thu 9 AM UTC
- Monthly audits on 1st Sunday
- Auto-deployment on commit to main

---

**Print this page and keep it handy!**

**Target**: Every blog post scores **A+ (96+)** before publishing.

---

Last Updated: 2025-10-19
