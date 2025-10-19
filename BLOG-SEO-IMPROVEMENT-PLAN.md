# Blog SEO Improvement Plan
## Comprehensive Strategy for Current + Future Blog Posts

**Created:** 2025-10-19
**Status:** Active Implementation Plan
**Goal:** Achieve A+ (96+/100) SEO score on all blog posts

---

## Executive Summary

**Current Situation:**
- Latest blog post scores B+ (83/100) - good but not optimal
- Missing critical SEO elements: images, links, schema
- Automation generates content but lacks post-processing
- No quality control for SEO best practices

**Target State:**
- All blog posts score A+ (96+/100)
- Automated SEO optimization in generation pipeline
- Quality control checks before publishing
- Consistent internal linking strategy
- Rich media integration (images, videos)

**Timeline:**
- Phase 1 (Immediate): Fix current post (2 hours)
- Phase 2 (This Week): Update automation (1 day)
- Phase 3 (Ongoing): Implement quality control (continuous)

---

## Phase 1: Fix Current Blog Post (IMMEDIATE)

### Priority 1A: Critical Fixes (30 minutes)

#### 1. Fix Meta Description ⚡ URGENT
**Current:**
```yaml
description: "** Learn what is local SEO..."
```

**Fixed:**
```yaml
description: "Learn what local SEO is and how Sydney businesses can dominate local search results. Complete guide with actionable tips, tools, and strategies to boost local visibility."
```

**Impact:** High - Affects SERP CTR
**Effort:** 30 seconds
**Tool:** Direct edit

---

#### 2. Add Internal Links (8-12 minimum) ⚡ URGENT

**Strategy:** Link to relevant existing TPP content

**Links to Add:**

**Section 1 - "Understanding Local SEO":**
```markdown
For more details on optimizing your presence, check out our guide on
[optimizing your Google Business Profile for Sydney](/blog/how-to-optimise-your-google-business-profile-for-sydney-local-search-in-2025/).
```

**Section 2 - "Key Components":**
```markdown
Learn more about [local SEO checklist strategies](/blog/local-seo-checklist-47-steps-to-dominate-sydney-suburb-search-results/).
```

**Section 3 - "Keyword Research":**
```markdown
Our [keyword research framework](/blog/keyword-research-for-local-sydney-businesses-the-complete-framework/)
provides deeper insights into finding local search terms.
```

**Section 4 - "Technical SEO":**
```markdown
For more on technical optimization, see our [website speed optimization guide](/blog/website-speed-optimization-how-sydney-businesses-can-improve-core-web-vitals/).
```

**Section 5 - "Schema Markup":**
```markdown
Dive deeper into [schema markup implementation](/blog/schema-markup-for-local-sydney-businesses-implementation-guide/)
for local businesses.
```

**Section 6 - "Multi-Location":**
```markdown
If you operate multiple locations, check our [multi-location SEO guide](/blog/complete-guide-to-multi-location-seo-for-sydney-business-owners/).
```

**Section 7 - "Google Search Console":**
```markdown
Master the basics with our [Google Search Console guide](/blog/google-search-console-the-complete-guide-for-sydney-business-owners/).
```

**Section 8 - "Service Pages":**
```markdown
Interested in professional help? Explore our [SEO optimization services](/seo/).
```

**Location mentions:**
```markdown
Learn about our work in [Sydney](/locations/sydney/), [Parramatta](/locations/parramatta/),
and [Bondi](/locations/bondi/).
```

**Impact:** High - SEO authority distribution + UX
**Effort:** 10 minutes
**Target:** 8-12 internal links

---

#### 3. Add External Links (5-8 authoritative sources) ⚡ URGENT

**Strategy:** Link to authoritative sources for credibility

**Links to Add:**

**Google Official Resources:**
- "Google Business Profile" → https://support.google.com/business/
- "Google's Local Pack" → https://support.google.com/business/answer/7091
- "Google PageSpeed Insights" → https://pagespeed.web.dev/

**Industry Tools Mentioned:**
- "BrightLocal" → https://www.brightlocal.com/
- "Moz Local" → https://moz.com/products/local
- "SEMrush" → https://www.semrush.com/
- "Google Analytics" → https://analytics.google.com/
- "Google Search Console" → https://search.google.com/search-console/

**Statistics Source:**
- "500% growth in near me searches" → Link to official Google study or Statista

**Best Practice:**
- All external links: `target="_blank" rel="noopener"`
- Link to official/authoritative sources only
- No affiliate links without disclosure

**Impact:** High - E-E-A-T credibility
**Effort:** 15 minutes
**Target:** 5-8 external links

---

### Priority 1B: High-Impact Fixes (1 hour)

#### 4. Add Images (6-8 minimum) 📸

**Image Requirements:**

1. **Featured Image** (Required)
   - File: `what-is-local-seo-sydney-featured.jpg`
   - Alt text: "Sydney business owner optimizing local SEO on laptop with Google Maps visible"
   - Size: 1200x630px (OpenGraph optimized)
   - Location: Add to frontmatter

2. **Google Business Profile Screenshot**
   - Section: "Key Components of Local SEO"
   - Alt text: "Google Business Profile example for Sydney business showing complete optimization"
   - Annotated with arrows/highlights

3. **Local Pack Example**
   - Section: "Understanding Local SEO"
   - Alt text: "Google Local Pack showing top 3 Sydney plumbers in search results"
   - Real screenshot from Google search

4. **NAP Consistency Diagram**
   - Section: "NAP Consistency"
   - Alt text: "Diagram showing NAP consistency across multiple platforms for Sydney business"
   - Infographic style

5. **Mobile Search Screenshot**
   - Section: "Mobile-First Reality"
   - Alt text: "Mobile phone showing local search results for cafe near me in Sydney"

6. **Schema Markup Code Example**
   - Section: "Schema Markup for Local Businesses"
   - Alt text: "Local Business schema markup code example for Sydney business"
   - Code screenshot with syntax highlighting

7. **Citation Building Infographic**
   - Section: "Local Citations and Directory Listings"
   - Alt text: "Infographic showing top citation sources for Sydney businesses"

8. **Sydney Map with Suburbs**
   - Section: "Suburb-Specific Optimization"
   - Alt text: "Sydney map highlighting key suburbs for local SEO targeting"

**Image Sources:**
- Screenshots: Create fresh from actual Google searches
- Infographics: Canva templates or custom design
- Diagrams: Figma or draw.io
- Stock photos: Unsplash/Pexels (Sydney-specific)

**Image Optimization:**
- Format: WebP (with JPG fallback)
- Compression: TinyPNG or ImageOptim
- Max file size: 200KB each
- Responsive: Multiple sizes for srcset

**Implementation:**
```markdown
![Alt text](../images/what-is-local-seo-featured.webp)
```

**Impact:** High - Engagement, UX, SEO
**Effort:** 30-60 minutes
**Target:** 6-8 images

---

#### 5. Increase Target Keyword Density 🎯

**Current:** "what is local seo" = 4 occurrences (0.12%)
**Target:** 17-34 occurrences (0.5-1.0%)
**Need to add:** 13-30 more mentions

**Strategic Placements:**

**A. First Paragraph (add 2x):**
```markdown
If you're running a business in Sydney and wondering "what is local SEO,"
you're asking the right question. Understanding what is local SEO is the
first step toward dominating local search results. Local search engine
optimization is the practice...
```

**B. H2/H3 Headings (add 5x):**
- "What is Local SEO and Why Does It Matter for Sydney?"
- "What is Local SEO: Key Ranking Factors"
- "What is Local SEO Without Schema Markup?"
- "What is Local SEO in 2025: Voice Search Impact"
- "What is Local SEO ROI: Measuring Success"

**C. Section Transitions (add 8x):**
After each major section, add transitional phrase:
```markdown
Now that you understand what is local SEO fundamentals, let's explore...
```

**D. Conclusion (add 3x):**
```markdown
So, what is local SEO? It's your competitive advantage in Sydney's
crowded market. Understanding what is local SEO and implementing these
strategies will help you dominate local search. The question isn't
"what is local SEO?" anymore—it's "how fast can you implement it?"
```

**E. Natural Integration (add 10x):**
Sprinkle throughout body paragraphs naturally:
- "This is what local SEO is all about..."
- "When considering what local SEO means for your business..."
- "The essence of what local SEO achieves is..."

**Impact:** Medium-High - Ranking relevance
**Effort:** 20 minutes
**Target:** 17-34 total mentions

---

### Priority 1C: Medium-Priority Fixes (30 minutes)

#### 6. Add FAQ Schema 📋

**Extract from Content:**

```yaml
faq:
  - question: "What is local SEO and how does it differ from regular SEO?"
    answer: "Local SEO focuses on optimizing your online presence to attract business from relevant local searches on Google and other search engines. Unlike traditional SEO that targets broad, national keywords, local SEO targets location-specific searches like 'dentist Manly' or 'plumber Eastern Suburbs.'"

  - question: "How does Google determine local search rankings?"
    answer: "Google uses three primary factors to determine local search rankings: relevance (how well your business matches the search), distance (proximity to the searcher), and prominence (how well-known your business is online and offline)."

  - question: "Is Google Business Profile important for local SEO?"
    answer: "Yes, Google Business Profile is the cornerstone of local SEO. It's a free tool that allows you to manage how your business appears on Google Search and Maps. A complete, optimized profile significantly improves your local search visibility."

  - question: "What is NAP consistency and why does it matter?"
    answer: "NAP stands for Name, Address, Phone Number. NAP consistency means your business information must be identical across all online platforms. Inconsistencies confuse Google and can hurt your local rankings."

  - question: "How long does it take to see results from local SEO?"
    answer: "Most Sydney businesses see initial improvements within 3-6 months of implementing local SEO strategies. However, local SEO is an ongoing process that requires consistent optimization for long-term success."

  - question: "Do online reviews really affect local SEO rankings?"
    answer: "Yes, reviews significantly impact both local SEO rankings and customer decisions. Google considers both the quantity and quality of reviews when determining local rankings."

  - question: "What are local citations and why do I need them?"
    answer: "Local citations are online mentions of your business name, address, and phone number on directories, websites, and platforms. They help establish your business's credibility and local presence in Google's eyes."

  - question: "Should I optimize for specific Sydney suburbs or just 'Sydney'?"
    answer: "Optimize for specific suburbs. Suburb-specific optimization often yields better results than broad 'Sydney' terms because you face less competition and attract more qualified local traffic."
```

**Add to frontmatter** in blog post

**Impact:** Medium - Rich snippets opportunity
**Effort:** 15 minutes
**Target:** 6-8 FAQ items

---

#### 7. Add Mid-Article CTAs 📢

**CTA Placement Strategy:**

**CTA #1 - After Table of Contents (Soft):**
```markdown
---
**📥 Free Download:** Get our complete Local SEO Checklist for Sydney Businesses.
[Download the checklist →](/resources/local-seo-checklist/)
---
```

**CTA #2 - After Section 4 "Local Keyword Research" (Medium):**
```markdown
---
**Need help with local SEO keyword research?** Our team specializes in helping Sydney
businesses identify and target the right local keywords.
[Schedule a free consultation →](/contact/)
---
```

**CTA #3 - Before Conclusion (Strong - already exists, refine):**
```markdown
---
**Ready to dominate local search in Sydney?**

The Profit Platform has helped 100+ Sydney businesses achieve first-page rankings
in their local areas. We specialize in Google Business Profile optimization, local
citations, and suburb-specific SEO strategies.

✅ Free local SEO audit
✅ Custom strategy for your Sydney business
✅ Proven results in competitive markets

[Get your free audit →](/contact/) or call [+61 487 286 451](tel:+61487286451)
---
```

**Impact:** Medium - Lead generation
**Effort:** 5 minutes
**Target:** 3 CTAs (soft → strong)

---

#### 8. Add LSI Keywords 🔍

**LSI Keywords to Integrate:**

**Primary LSI terms (add 5-10x each):**
- "local search optimization"
- "Google Maps SEO"
- "local search rankings"
- "local search visibility"

**Secondary LSI terms (add 3-5x each):**
- "near me searches"
- "local search results"
- "local search performance"
- "map pack optimization"
- "local business listings"

**Example Integration:**
```markdown
Original: "Local SEO helps your business appear in search results."
Enhanced: "Local search optimization helps your business appear in local
search results and Google Maps SEO listings, improving your local search
rankings and visibility for near me searches."
```

**Impact:** Medium - Semantic relevance
**Effort:** 15 minutes
**Target:** 25-40 LSI keyword mentions

---

### Phase 1 Summary

**Total Time:** ~2 hours
**Expected Score Improvement:** B+ (83/100) → A+ (96/100)

**Priority Order:**
1. Meta description (30 sec)
2. Internal links (10 min)
3. External links (15 min)
4. Images (60 min)
5. Keyword density (20 min)
6. FAQ schema (15 min)
7. CTAs (5 min)
8. LSI keywords (15 min)

**Deliverables:**
- ✅ Fixed blog post with all improvements
- ✅ Image assets created and optimized
- ✅ Internal linking map documented
- ✅ FAQ schema implemented

---

## Phase 2: Automation Improvements (THIS WEEK)

### Goal: Prevent Future Issues

All future blog posts should automatically include:
1. Proper meta descriptions
2. Internal links
3. External links
4. Image placeholders
5. FAQ schema suggestions
6. Multiple CTAs
7. Optimal keyword density
8. LSI keywords

---

### 2.1: Update Blog Generation Script

**File:** `automation/scripts/generate-blog-post.js`

**Enhancements Needed:**

#### A. Meta Description Validation

Add validation to prevent formatting errors:

```javascript
// After generating frontmatter
function validateMetaDescription(description) {
  // Remove markdown formatting
  description = description.replace(/\*\*/g, '').trim();

  // Check length (150-160 chars optimal)
  if (description.length > 160) {
    description = description.substring(0, 157) + '...';
  }
  if (description.length < 120) {
    console.warn('⚠️  Meta description too short:', description.length, 'chars');
  }

  // Ensure it doesn't start with special chars
  description = description.replace(/^[^a-zA-Z0-9]+/, '');

  return description;
}

// Apply to frontmatter
frontmatter.description = validateMetaDescription(frontmatter.description);
```

---

#### B. Internal Link Injection

Create internal linking strategy:

```javascript
// New file: automation/scripts/internal-link-suggestions.mjs

export const linkingRules = {
  // Topic-based linking
  'google business profile': [
    '/blog/how-to-optimise-your-google-business-profile-for-sydney-local-search-in-2025/'
  ],
  'local seo checklist': [
    '/blog/local-seo-checklist-47-steps-to-dominate-sydney-suburb-search-results/'
  ],
  'keyword research': [
    '/blog/keyword-research-for-local-sydney-businesses-the-complete-framework/'
  ],
  'schema markup': [
    '/blog/schema-markup-for-local-sydney-businesses-implementation-guide/'
  ],
  'multi.location': [
    '/blog/complete-guide-to-multi-location-seo-for-sydney-business-owners/'
  ],
  'google search console': [
    '/blog/google-search-console-the-complete-guide-for-sydney-business-owners/'
  ],
  'website speed': [
    '/blog/website-speed-optimization-how-sydney-businesses-can-improve-core-web-vitals/'
  ],
  // Service pages
  'seo services': ['/seo/'],
  'google ads': ['/google-ads/'],
  'web design': ['/web-design/'],
  // Location pages
  'sydney': ['/locations/sydney/'],
  'parramatta': ['/locations/parramatta/'],
  'bondi': ['/locations/bondi/']
};

export function suggestInternalLinks(content, topicKeyword) {
  const suggestions = [];

  for (const [trigger, urls] of Object.entries(linkingRules)) {
    const regex = new RegExp(trigger, 'gi');
    if (regex.test(content) || regex.test(topicKeyword)) {
      suggestions.push(...urls);
    }
  }

  // Return unique suggestions
  return [...new Set(suggestions)].slice(0, 12); // Max 12 links
}
```

**Integrate into Claude prompt:**

```javascript
// In generate-blog-post.js

import { suggestInternalLinks } from './internal-link-suggestions.mjs';

const internalLinkSuggestions = suggestInternalLinks(topic.title, topic.targetKeyword);

const prompt = `
Write a comprehensive blog post...

INTERNAL LINKING REQUIREMENT:
You MUST include 8-12 internal links naturally within the content.
Use these relevant links (select 8-12 that fit naturally):
${internalLinkSuggestions.map(url => `- ${url}`).join('\n')}

Link format: [descriptive anchor text](${url})
Place links where they add value to the reader.
`;
```

---

#### C. External Link Requirements

Add to Claude prompt:

```javascript
const prompt = `
Write a comprehensive blog post...

EXTERNAL LINKING REQUIREMENT:
You MUST include 5-8 authoritative external links:
1. Google official resources (Business Profile, Search Console, etc.)
2. Industry tools mentioned (add actual links to BrightLocal, Moz, SEMrush)
3. Statistics sources (link to studies/data)
4. Best practices: All external links should be to authoritative sources

Format: [tool/resource name](https://official-url.com)
All external links will be set to target="_blank" rel="noopener" automatically.
`;
```

---

#### D. Image Placeholder System

```javascript
const prompt = `
Write a comprehensive blog post...

IMAGE PLACEMENT REQUIREMENT:
Include 6-8 image placeholders using this format:
![Alt text description](IMAGE_PLACEHOLDER_featured.jpg)

Required images:
1. Featured image at top (after intro)
2. Screenshot/diagram for each major section
3. Infographic for complex topics
4. Examples/case study visuals

Alt text must be descriptive and SEO-optimized.
Image placeholders will be replaced with actual images post-generation.
`;
```

**Post-generation image handler:**

```javascript
// After blog post generated
function extractImagePlaceholders(content) {
  const regex = /!\[([^\]]+)\]\(IMAGE_PLACEHOLDER_([^)]+)\)/g;
  const images = [];
  let match;

  while ((match = regex.exec(content)) !== null) {
    images.push({
      altText: match[1],
      placeholder: match[2],
      type: match[2].includes('featured') ? 'featured' : 'inline'
    });
  }

  return images;
}

const imagePlaceholders = extractImagePlaceholders(blogContent);

// Create image generation tasks
console.log('\n📸 Image Requirements:');
imagePlaceholders.forEach((img, i) => {
  console.log(`${i + 1}. ${img.type.toUpperCase()}: ${img.altText}`);
  console.log(`   Placeholder: ${img.placeholder}`);
});

// Save to metadata for later processing
metadata.imageRequirements = imagePlaceholders;
```

---

#### E. FAQ Schema Auto-Extraction

```javascript
const prompt = `
Write a comprehensive blog post...

FAQ SCHEMA REQUIREMENT:
At the end of your blog post content, add a section:

## Frequently Asked Questions

Format each as:
**Q: Question text?**
A: Detailed answer (2-3 sentences)

Include 6-8 frequently asked questions relevant to the topic.
These will be automatically extracted for FAQ schema markup.
`;

// Post-generation extraction
function extractFAQs(content) {
  const faqSection = content.match(/## Frequently Asked Questions([\s\S]*?)(?=##|$)/);
  if (!faqSection) return [];

  const faqs = [];
  const regex = /\*\*Q:\s*([^*]+)\*\*\s*\n\s*A:\s*([^\n]+)/g;
  let match;

  while ((match = regex.exec(faqSection[1])) !== null) {
    faqs.push({
      question: match[1].trim(),
      answer: match[2].trim()
    });
  }

  return faqs;
}

// Add to frontmatter
frontmatter.faq = extractFAQs(blogContent);
```

---

#### F. CTA Injection System

```javascript
const CTAs = {
  soft: `---
**📥 Free Resource:** Download our ${topic.category} checklist for Sydney businesses.
[Get the free checklist →](/resources/)
---`,

  medium: `---
**Need expert help?** We specialize in ${topic.category} for Sydney businesses.
[Schedule a free consultation →](/contact/)
---`,

  strong: `---
**Ready to achieve results like these?**

The Profit Platform has helped 100+ Sydney businesses dominate their local markets.

✅ Free ${topic.category} audit
✅ Custom strategy for your business
✅ Proven results in competitive markets

[Get your free audit →](/contact/) or call [+61 487 286 451](tel:+61487286451)
---`
};

const prompt = `
Write a comprehensive blog post...

CALL-TO-ACTION REQUIREMENT:
Include these 3 CTAs at strategic points:

1. AFTER TABLE OF CONTENTS:
${CTAs.soft}

2. AFTER SECTION 3 OR 4 (mid-article):
${CTAs.medium}

3. BEFORE CONCLUSION:
${CTAs.strong}

Place them where they feel natural and don't interrupt the flow.
`;
```

---

#### G. Keyword Density Calculator

```javascript
function calculateKeywordDensity(content, keyword) {
  const wordCount = content.split(/\s+/).length;
  const keywordOccurrences = (content.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
  const density = (keywordOccurrences / wordCount) * 100;

  return {
    wordCount,
    keywordOccurrences,
    density: density.toFixed(2),
    optimal: density >= 0.5 && density <= 1.0,
    recommendation: density < 0.5
      ? `Add ${Math.ceil((wordCount * 0.005) - keywordOccurrences)} more mentions`
      : density > 1.0
      ? `Remove ${Math.floor(keywordOccurrences - (wordCount * 0.01))} mentions to avoid keyword stuffing`
      : 'Optimal density'
  };
}

// After generation
const keywordAnalysis = calculateKeywordDensity(blogContent, topic.targetKeyword);

console.log('\n🎯 Keyword Analysis:');
console.log(`Target: "${topic.targetKeyword}"`);
console.log(`Occurrences: ${keywordAnalysis.keywordOccurrences}`);
console.log(`Density: ${keywordAnalysis.density}%`);
console.log(`Status: ${keywordAnalysis.optimal ? '✅ Optimal' : '⚠️  Needs adjustment'}`);
console.log(`Action: ${keywordAnalysis.recommendation}`);

// If not optimal, add to Claude prompt for revision
if (!keywordAnalysis.optimal) {
  console.log('\n⚠️  Keyword density not optimal. Requesting revision...');
  // Trigger revision prompt
}
```

---

### 2.2: Create New Post-Processing Script

**File:** `automation/scripts/seo-enhance-blog.mjs`

```javascript
#!/usr/bin/env node

/**
 * SEO Enhancement Post-Processor
 *
 * Runs after blog generation to ensure all SEO requirements are met
 */

import fs from 'fs';
import path from 'path';

async function enhanceBlogPost(filePath) {
  console.log('\n🔍 Running SEO Enhancement...\n');

  const content = fs.readFileSync(filePath, 'utf-8');

  // Parse frontmatter and content
  const parts = content.split('---\n');
  const frontmatter = parts[1];
  const body = parts[2];

  // Run all checks
  const results = {
    metaDescription: checkMetaDescription(frontmatter),
    internalLinks: checkInternalLinks(body),
    externalLinks: checkExternalLinks(body),
    images: checkImages(body),
    keywordDensity: checkKeywordDensity(body, frontmatter),
    faqSchema: checkFAQSchema(frontmatter),
    ctas: checkCTAs(body),
    lsiKeywords: checkLSIKeywords(body)
  };

  // Generate report
  generateSEOReport(results, filePath);

  return results;
}

function checkMetaDescription(frontmatter) {
  const descMatch = frontmatter.match(/description:\s*"([^"]+)"/);
  if (!descMatch) return { pass: false, issue: 'No meta description' };

  const desc = descMatch[1];

  // Check for formatting errors
  if (desc.startsWith('**') || desc.startsWith('*')) {
    return { pass: false, issue: 'Meta description has markdown formatting' };
  }

  // Check length
  if (desc.length < 120) {
    return { pass: false, issue: `Meta description too short (${desc.length} chars, need 120-160)` };
  }
  if (desc.length > 160) {
    return { pass: false, issue: `Meta description too long (${desc.length} chars, max 160)` };
  }

  return { pass: true, value: desc, length: desc.length };
}

function checkInternalLinks(body) {
  const linkRegex = /\[([^\]]+)\]\(\/[^\)]+\)/g;
  const matches = body.match(linkRegex) || [];

  return {
    pass: matches.length >= 8,
    count: matches.length,
    target: '8-12',
    issue: matches.length < 8 ? `Only ${matches.length} internal links (need 8-12)` : null
  };
}

function checkExternalLinks(body) {
  const linkRegex = /\[([^\]]+)\]\(https?:\/\/[^\)]+\)/g;
  const matches = body.match(linkRegex) || [];

  return {
    pass: matches.length >= 5,
    count: matches.length,
    target: '5-8',
    issue: matches.length < 5 ? `Only ${matches.length} external links (need 5-8)` : null
  };
}

function checkImages(body) {
  const imageRegex = /!\[([^\]]+)\]\(([^\)]+)\)/g;
  const matches = body.match(imageRegex) || [];

  return {
    pass: matches.length >= 6,
    count: matches.length,
    target: '6-8',
    issue: matches.length < 6 ? `Only ${matches.length} images (need 6-8)` : null
  };
}

function checkKeywordDensity(body, frontmatter) {
  const titleMatch = frontmatter.match(/title:\s*"([^"]+)"/);
  if (!titleMatch) return { pass: false, issue: 'No title found' };

  // Extract likely target keyword from title (simplified)
  const title = titleMatch[1].toLowerCase();
  const keyword = title.split(':')[0].trim(); // Rough extraction

  const wordCount = body.split(/\s+/).length;
  const occurrences = (body.toLowerCase().match(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  const density = (occurrences / wordCount) * 100;

  return {
    pass: density >= 0.5 && density <= 1.0,
    keyword,
    occurrences,
    density: density.toFixed(2) + '%',
    issue: density < 0.5 ? 'Keyword density too low' : density > 1.0 ? 'Keyword density too high' : null
  };
}

function checkFAQSchema(frontmatter) {
  const hasFAQ = frontmatter.includes('faq:');

  return {
    pass: hasFAQ,
    issue: !hasFAQ ? 'No FAQ schema found in frontmatter' : null
  };
}

function checkCTAs(body) {
  // Look for CTA markers (simplified)
  const ctaCount = (body.match(/\[.*→.*\]|Download|Schedule.*consultation|Get.*free/gi) || []).length;

  return {
    pass: ctaCount >= 3,
    count: ctaCount,
    target: '3+',
    issue: ctaCount < 3 ? `Only ${ctaCount} CTAs found (need 3+)` : null
  };
}

function checkLSIKeywords(body) {
  const lsiKeywords = [
    'local search optimization',
    'Google Maps SEO',
    'local search rankings',
    'near me searches'
  ];

  const found = lsiKeywords.filter(keyword =>
    body.toLowerCase().includes(keyword.toLowerCase())
  );

  return {
    pass: found.length >= 3,
    found: found.length,
    target: '3-4',
    keywords: found,
    issue: found.length < 3 ? `Only ${found.length}/4 LSI keywords present` : null
  };
}

function generateSEOReport(results, filePath) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  SEO QUALITY REPORT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`File: ${path.basename(filePath)}\n`);

  let score = 0;
  let maxScore = 0;

  // Meta Description (15 points)
  maxScore += 15;
  if (results.metaDescription.pass) {
    console.log('✅ Meta Description: PASS');
    console.log(`   Length: ${results.metaDescription.length} chars`);
    score += 15;
  } else {
    console.log('❌ Meta Description: FAIL');
    console.log(`   Issue: ${results.metaDescription.issue}`);
  }

  // Internal Links (20 points)
  maxScore += 20;
  if (results.internalLinks.pass) {
    console.log(`✅ Internal Links: PASS (${results.internalLinks.count})`);
    score += 20;
  } else {
    console.log(`❌ Internal Links: FAIL`);
    console.log(`   Issue: ${results.internalLinks.issue}`);
  }

  // External Links (15 points)
  maxScore += 15;
  if (results.externalLinks.pass) {
    console.log(`✅ External Links: PASS (${results.externalLinks.count})`);
    score += 15;
  } else {
    console.log(`❌ External Links: FAIL`);
    console.log(`   Issue: ${results.externalLinks.issue}`);
  }

  // Images (20 points)
  maxScore += 20;
  if (results.images.pass) {
    console.log(`✅ Images: PASS (${results.images.count})`);
    score += 20;
  } else {
    console.log(`❌ Images: FAIL`);
    console.log(`   Issue: ${results.images.issue}`);
  }

  // Keyword Density (15 points)
  maxScore += 15;
  if (results.keywordDensity.pass) {
    console.log(`✅ Keyword Density: PASS (${results.keywordDensity.density})`);
    console.log(`   Keyword: "${results.keywordDensity.keyword}"`);
    score += 15;
  } else {
    console.log(`❌ Keyword Density: FAIL`);
    console.log(`   Issue: ${results.keywordDensity.issue}`);
  }

  // FAQ Schema (5 points)
  maxScore += 5;
  if (results.faqSchema.pass) {
    console.log('✅ FAQ Schema: PASS');
    score += 5;
  } else {
    console.log('⚠️  FAQ Schema: FAIL');
    console.log(`   Issue: ${results.faqSchema.issue}`);
  }

  // CTAs (5 points)
  maxScore += 5;
  if (results.ctas.pass) {
    console.log(`✅ CTAs: PASS (${results.ctas.count})`);
    score += 5;
  } else {
    console.log(`⚠️  CTAs: FAIL`);
    console.log(`   Issue: ${results.ctas.issue}`);
  }

  // LSI Keywords (5 points)
  maxScore += 5;
  if (results.lsiKeywords.pass) {
    console.log(`✅ LSI Keywords: PASS (${results.lsiKeywords.found}/${results.lsiKeywords.target})`);
    score += 5;
  } else {
    console.log(`⚠️  LSI Keywords: FAIL`);
    console.log(`   Issue: ${results.lsiKeywords.issue}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const percentage = Math.round((score / maxScore) * 100);
  const grade = percentage >= 95 ? 'A+' :
                percentage >= 90 ? 'A' :
                percentage >= 85 ? 'A-' :
                percentage >= 80 ? 'B+' :
                percentage >= 75 ? 'B' : 'C';

  console.log(`\n  FINAL SCORE: ${score}/${maxScore} (${percentage}%) - Grade: ${grade}\n`);

  if (percentage < 90) {
    console.log('⚠️  This blog post needs improvements before publishing.\n');
  } else {
    console.log('✅ This blog post meets SEO quality standards!\n');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: node seo-enhance-blog.mjs <path-to-blog-post.md>');
    process.exit(1);
  }

  enhanceBlogPost(filePath);
}

export { enhanceBlogPost };
```

**Add to package.json:**
```json
{
  "scripts": {
    "blog:seo-check": "node automation/scripts/seo-enhance-blog.mjs"
  }
}
```

---

### 2.3: Update GitHub Actions Workflow

**File:** `.github/workflows/daily-blog-post.yml`

**Add SEO enhancement step:**

```yaml
- name: ⚡ Auto-optimize SEO (A+ grade)
  run: node automation/scripts/post-process-blog.js
  continue-on-error: true

- name: 🔍 Run SEO quality check
  run: |
    # Find the latest blog post
    LATEST_POST=$(ls -t src/content/blog/*.md | head -1)
    echo "Checking SEO quality of: $LATEST_POST"
    node automation/scripts/seo-enhance-blog.mjs "$LATEST_POST"
  continue-on-error: false  # Fail if SEO check fails

- name: ✅ Validate generated content
  run: node automation/scripts/validate-content.js
  continue-on-error: false
```

---

## Phase 3: Quality Control System (ONGOING)

### 3.1: Pre-Publish Checklist

**Create:** `automation/SEO-CHECKLIST.md`

```markdown
# Blog Post SEO Checklist

Before publishing any blog post, verify:

## Critical (Must Have - Grade: F if missing)
- [ ] Meta description 120-160 chars, no markdown formatting
- [ ] 8-12 internal links to relevant TPP content
- [ ] 5-8 external links to authoritative sources
- [ ] 6-8 optimized images with alt text
- [ ] Target keyword density 0.5-1.0%

## High Priority (Should Have - Grade: B if missing)
- [ ] FAQ schema in frontmatter (6-8 questions)
- [ ] 3 CTAs (soft, medium, strong)
- [ ] LSI keywords present (3-4 variations)
- [ ] Featured image in frontmatter
- [ ] Table of contents

## Medium Priority (Nice to Have - Grade: A without)
- [ ] Video embed or YouTube link
- [ ] Infographic or custom diagram
- [ ] Case study or real example
- [ ] Social share buttons
- [ ] Related posts suggestions

## Technical
- [ ] Heading hierarchy correct (H1 > H2 > H3)
- [ ] No broken links (internal or external)
- [ ] All images < 200KB
- [ ] Mobile-friendly formatting
- [ ] Schema markup valid

## SEO Score Targets
- A+ (96-100): Publish immediately
- A (90-95): Publish with minor notes
- B+ (85-89): Fix high-priority items first
- B or below (< 85): Major revisions needed
```

---

### 3.2: Monthly Audit Process

**Schedule:** 1st Sunday of each month

**Audit Script:** `automation/scripts/audit-all-blog-posts.mjs`

```javascript
#!/usr/bin/env node

/**
 * Monthly Blog SEO Audit
 *
 * Audits all blog posts and generates report
 */

import fs from 'fs';
import path from 'path';
import { enhanceBlogPost } from './seo-enhance-blog.mjs';

const BLOG_DIR = 'src/content/blog';

async function auditAllPosts() {
  console.log('Starting monthly blog SEO audit...\n');

  const files = fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(BLOG_DIR, f));

  const results = [];

  for (const file of files) {
    console.log(`\nAuditing: ${path.basename(file)}`);
    const result = await enhanceBlogPost(file);
    results.push({
      file: path.basename(file),
      ...result
    });
  }

  // Generate summary report
  generateSummaryReport(results);
}

function generateSummaryReport(results) {
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  MONTHLY AUDIT SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const issues = {
    metaDescription: 0,
    internalLinks: 0,
    externalLinks: 0,
    images: 0,
    keywordDensity: 0,
    faqSchema: 0,
    ctas: 0,
    lsiKeywords: 0
  };

  results.forEach(result => {
    Object.keys(issues).forEach(key => {
      if (!result[key]?.pass) issues[key]++;
    });
  });

  console.log('Issues Found:\n');
  console.log(`Meta Descriptions: ${issues.metaDescription} posts need fixing`);
  console.log(`Internal Links: ${issues.internalLinks} posts need more links`);
  console.log(`External Links: ${issues.externalLinks} posts need more links`);
  console.log(`Images: ${issues.images} posts need more images`);
  console.log(`Keyword Density: ${issues.keywordDensity} posts need optimization`);
  console.log(`FAQ Schema: ${issues.faqSchema} posts missing FAQs`);
  console.log(`CTAs: ${issues.ctas} posts need more CTAs`);
  console.log(`LSI Keywords: ${issues.lsiKeywords} posts need LSI keywords\n`);

  // Priority list
  const needsWork = results
    .filter(r => !r.metaDescription?.pass || !r.internalLinks?.pass || !r.externalLinks?.pass || !r.images?.pass)
    .map(r => r.file);

  if (needsWork.length > 0) {
    console.log('🚨 HIGH PRIORITY - Fix These First:\n');
    needsWork.forEach(file => console.log(`   - ${file}`));
    console.log('');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

auditAllPosts();
```

**Add to package.json:**
```json
{
  "scripts": {
    "blog:audit-all": "node automation/scripts/audit-all-blog-posts.mjs"
  }
}
```

**Add to crontab (VPS or local):**
```bash
# Monthly blog audit - 1st Sunday 10 AM
0 10 1-7 * 0 cd /home/avi/projects/tpp && npm run blog:audit-all >> automation/logs/monthly-audit.log 2>&1
```

---

### 3.3: Image Asset Management

**Strategy:** Create image library and generation system

**Directory Structure:**
```
public/
  blog-images/
    featured/
      what-is-local-seo-sydney.jpg
      seo-for-plumbers-sydney.jpg
    screenshots/
      google-business-profile-example.png
      local-pack-screenshot.png
    infographics/
      nap-consistency-diagram.svg
      local-seo-process.svg
    stock/
      sydney-bondi-beach.jpg
      sydney-cbd.jpg
```

**Image Generation Options:**

**Option 1: AI Image Generation (Fastest)**
- DALL-E 3 or Midjourney for featured images
- Figma for infographics/diagrams
- Real screenshots for Google examples

**Option 2: Stock + Custom (Recommended)**
- Unsplash/Pexels for Sydney photos
- Canva templates for infographics
- Real screenshots from actual Google searches

**Option 3: Automated (Future)**
- Puppeteer screenshots of actual searches
- Programmatic diagram generation
- Template-based featured images

**Image Workflow:**

```javascript
// automation/scripts/generate-blog-images.mjs

async function generateImagesForBlogPost(blogFile, imageRequirements) {
  console.log('\n📸 Generating images for blog post...\n');

  for (const img of imageRequirements) {
    if (img.type === 'featured') {
      console.log(`Creating featured image: ${img.altText}`);
      // Generate or select featured image
      await createFeaturedImage(img);
    } else if (img.altText.includes('screenshot')) {
      console.log(`Taking screenshot: ${img.altText}`);
      await takeScreenshot(img);
    } else if (img.altText.includes('diagram') || img.altText.includes('infographic')) {
      console.log(`Creating infographic: ${img.altText}`);
      await createInfographic(img);
    }
  }
}
```

---

## Phase 4: Implementation Roadmap

### Week 1: Immediate Fixes

**Day 1 (Today):**
- [ ] Fix current blog post ("What is Local SEO")
  - Meta description
  - Internal links
  - External links
  - Keyword density
  - FAQ schema
  - CTAs
- [ ] Create image assets (6-8)
- [ ] Publish fixes to production

**Day 2-3:**
- [ ] Create SEO enhancement script (`seo-enhance-blog.mjs`)
- [ ] Test on current blog post
- [ ] Validate results

**Day 4-5:**
- [ ] Update blog generation script with new requirements
- [ ] Test generation with new prompts
- [ ] Validate automated linking works

**Day 6-7:**
- [ ] Update GitHub Actions workflow
- [ ] Test complete pipeline with manual trigger
- [ ] Document new process

---

### Week 2: System Testing

**Day 8-10:**
- [ ] Run monthly audit on all existing posts
- [ ] Identify top 10 posts needing fixes
- [ ] Create fix schedule

**Day 11-14:**
- [ ] Fix top 10 priority posts
- [ ] Test image generation workflow
- [ ] Create image asset library structure

---

### Month 1: Ongoing Optimization

**Weekly:**
- [ ] Review new blog posts for SEO quality
- [ ] Update internal linking rules as new posts publish
- [ ] Track SEO score improvements

**Monthly:**
- [ ] Run full blog audit
- [ ] Fix any posts scoring < B+
- [ ] Update automation based on learnings

---

## Success Metrics

### Blog Post Quality
- **Target:** 100% of new posts score A+ (96+)
- **Current:** Latest post scored B+ (83/100)
- **Improvement:** +13 points needed

### SEO Elements (Per Post)
- Meta description: 120-160 chars, no formatting
- Internal links: 8-12 per post
- External links: 5-8 per post
- Images: 6-8 per post
- Keyword density: 0.5-1.0%
- FAQ schema: 6-8 questions
- CTAs: 3 per post

### Automation Reliability
- **Target:** 95% of generated posts pass SEO check without manual fixes
- **Current:** 0% (no automation yet)

### Rankings Impact (3 months)
- Monitor keyword rankings for all posts
- Track organic traffic growth
- Measure engagement metrics (time on page, bounce rate)

---

## Tools & Resources

### Required Tools
- Node.js 20+ (already installed)
- Sharp/ImageMagick (image optimization)
- Puppeteer (screenshots - optional)
- Figma/Canva (infographics)

### Optional Tools
- DALL-E 3 API (AI image generation)
- Grammarly API (content quality)
- Copyscape API (plagiarism)
- SEMrush API (keyword research)

### Documentation
- SEO Checklist: `automation/SEO-CHECKLIST.md`
- Image Guidelines: `automation/IMAGE-GUIDELINES.md`
- Linking Strategy: `automation/LINKING-STRATEGY.md`
- Quality Standards: `automation/QUALITY-STANDARDS.md`

---

## Next Actions

**Immediate (Do Now):**
1. Review and approve this plan
2. Choose image generation approach
3. Begin Phase 1: Fix current blog post

**This Week:**
4. Implement SEO enhancement script
5. Update blog generation automation
6. Test complete pipeline

**This Month:**
7. Audit all existing blog posts
8. Fix high-priority posts
9. Monitor new post quality

---

## Appendix

### A. Complete Internal Linking Map

Will be maintained in: `automation/internal-link-map.json`

```json
{
  "topicToUrls": {
    "google business profile": [
      "/blog/how-to-optimise-your-google-business-profile-for-sydney-local-search-in-2025/",
      "/blog/google-my-business-posts-how-to-use-them-to-increase-local-visibility/"
    ],
    "local seo": [
      "/blog/local-seo-checklist-47-steps-to-dominate-sydney-suburb-search-results/",
      "/blog/complete-guide-to-multi-location-seo-for-sydney-business-owners/"
    ],
    "keyword research": [
      "/blog/keyword-research-for-local-sydney-businesses-the-complete-framework/"
    ],
    "technical seo": [
      "/blog/technical-seo-audit-checklist-for-sydney-business-websites/",
      "/blog/website-speed-optimization-how-sydney-businesses-can-improve-core-web-vitals/"
    ]
  },
  "servicePages": {
    "seo": "/seo/",
    "google-ads": "/google-ads/",
    "web-design": "/web-design/"
  },
  "locationPages": {
    "sydney": "/locations/sydney/",
    "parramatta": "/locations/parramatta/",
    "bondi": "/locations/bondi/",
    "chatswood": "/locations/chatswood/"
  }
}
```

### B. External Link Authority List

Approved external domains:
- google.com (official resources)
- support.google.com
- analytics.google.com
- search.google.com
- moz.com
- brightlocal.com
- semrush.com
- hubspot.com
- searchengineland.com
- gov.au (statistics)

### C. Image Specifications

**Featured Images:**
- Size: 1200x630px (OpenGraph)
- Format: WebP + JPG fallback
- Max file size: 150KB
- Alt text: 60-125 chars, keyword-rich

**Inline Images:**
- Size: 800x600px (landscape) or 600x800px (portrait)
- Format: WebP + JPG fallback
- Max file size: 100KB each
- Alt text: Descriptive, specific

**Screenshots:**
- Size: 1920x1080px max
- Format: PNG or WebP
- Max file size: 200KB
- Annotations: Red arrows/boxes for emphasis

**Infographics:**
- Size: 800x2000px (vertical)
- Format: SVG preferred, PNG fallback
- Max file size: 150KB
- Must be readable on mobile

---

**End of Plan**

Last Updated: 2025-10-19
Version: 1.0
Owner: The Profit Platform
Status: Ready for Implementation
