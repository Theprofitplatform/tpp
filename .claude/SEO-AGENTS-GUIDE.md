# SEO Agents Quick Reference Guide

**Last Updated**: 2025-01-27
**Project**: The Profit Platform (TPP)
**Framework**: Astro 5.x + Cloudflare Pages

---

## 📋 Table of Contents

1. [Agent Overview](#agent-overview)
2. [When to Use Each Agent](#when-to-use-each-agent)
3. [Agent Collaboration Workflows](#agent-collaboration-workflows)
4. [Task-to-Agent Mapping](#task-to-agent-mapping)
5. [Common SEO Scenarios](#common-seo-scenarios)
6. [Quick Commands Reference](#quick-commands-reference)

---

## Agent Overview

### Available SEO Agents

| Agent | File | Primary Focus | Proactive |
|-------|------|---------------|-----------|
| **SEO Expert** | `seo-expert.md` | Overall strategy, keyword research, analytics | ✅ Yes |
| **Local SEO Specialist** | `local-seo-specialist.md` | Sydney local search, GBP, reviews, citations | ✅ Yes |
| **Technical SEO Specialist** | `technical-seo-specialist.md` | Site speed, Core Web Vitals, schema, crawlability | ✅ Yes |
| **Content SEO Specialist** | `content-seo-specialist.md` | Blog optimization, keyword targeting, readability | ✅ Yes |
| **E-commerce SEO Specialist** | `ecommerce-seo-specialist.md` | Product pages, shopping feeds, conversion optimization | ✅ Yes |

### Supporting Agents

| Agent | File | Primary Focus |
|-------|------|---------------|
| **BMad Content Editor** | `bmad-content-editor.md` | Content quality, Australian English, grammar |
| **BMad Dev** | `bmad-dev.md` | Technical implementation, code |
| **BMad QA** | `bmad-qa.md` | Testing, validation |
| **BMad Architect** | `bmad-architect.md` | Architecture, strategy |

---

## When to Use Each Agent

### 🎯 SEO Expert (General)
**Use when you need:**
- Overall SEO strategy and planning
- Comprehensive keyword research
- Competitive analysis
- SEO audits (general)
- Analytics setup and reporting
- Link building strategy
- SEO roadmap and prioritization
- Multi-channel SEO coordination

**Example Tasks:**
```
✅ "Create a 90-day SEO strategy"
✅ "Analyze our top 10 competitors"
✅ "What keywords should we target?"
✅ "Set up Google Analytics 4 conversion tracking"
✅ "Audit our backlink profile"
✅ "Create an SEO reporting dashboard"
```

**Don't use for:**
```
❌ Google Business Profile setup (→ local-seo-specialist)
❌ Site speed issues (→ technical-seo-specialist)
❌ Blog post optimization (→ content-seo-specialist)
```

---

### 📍 Local SEO Specialist
**Use when you need:**
- Google Business Profile optimization
- Local keyword research (Sydney-specific)
- Review generation and management
- Local citation building
- NAP consistency checks
- Suburb targeting strategy
- Local link building
- Local schema markup
- "Near me" optimization
- Multi-location SEO

**Example Tasks:**
```
✅ "Optimize our Google Business Profile"
✅ "Create landing pages for Sydney suburbs"
✅ "Build citations in Australian directories"
✅ "Generate more Google reviews"
✅ "Target 'digital marketing Parramatta'"
✅ "Get us in the local 3-pack"
✅ "Find local link opportunities"
```

**Don't use for:**
```
❌ National/international SEO (→ seo-expert)
❌ Technical schema implementation (→ technical-seo-specialist)
❌ Blog content creation (→ content-seo-specialist)
```

---

### ⚙️ Technical SEO Specialist
**Use when you need:**
- Site speed optimization
- Core Web Vitals improvement
- Schema markup implementation
- Crawlability issues
- Indexation problems
- robots.txt or sitemap configuration
- Cloudflare optimization
- Astro build optimization
- Security headers
- Image optimization
- JavaScript/CSS optimization
- Mobile optimization
- Technical audits

**Example Tasks:**
```
✅ "Improve our Core Web Vitals scores"
✅ "Why is our LCP 4 seconds?"
✅ "Add schema markup for articles"
✅ "Optimize our build process"
✅ "Configure Cloudflare caching headers"
✅ "Fix crawl errors in Search Console"
✅ "Make images load faster"
✅ "Set up structured data"
```

**Don't use for:**
```
❌ Content optimization (→ content-seo-specialist)
❌ Keyword research (→ seo-expert)
❌ Review management (→ local-seo-specialist)
```

---

### ✍️ Content SEO Specialist
**Use when you need:**
- Blog post optimization
- Content strategy and calendar
- Keyword targeting for content
- Readability optimization
- Content gap analysis
- Featured snippet optimization
- Topic clustering
- Content templates
- Internal linking strategy
- Content audits
- Meta tag optimization
- Title/description writing

**Example Tasks:**
```
✅ "Optimize this blog post for SEO"
✅ "Create a content calendar for Q1"
✅ "What topics should we write about?"
✅ "Improve readability of this article"
✅ "Target featured snippets for 'what is SEO'"
✅ "Write meta descriptions for 10 blog posts"
✅ "Find content gaps compared to competitors"
```

**Don't use for:**
```
❌ Technical implementation (→ technical-seo-specialist)
❌ Local content strategy (→ local-seo-specialist)
❌ Grammar/spelling (→ bmad-content-editor)
```

---

### 🛒 E-commerce SEO Specialist
**Use when you need:**
- Product page optimization
- Category page SEO
- Product schema markup
- Shopping feed optimization
- Faceted navigation SEO
- Product reviews optimization
- Conversion rate optimization
- Product keyword research
- Competitor product analysis
- E-commerce technical SEO

**Example Tasks:**
```
✅ "Optimize our service pages for conversion"
✅ "Add Product schema to service pages"
✅ "Improve our pricing page SEO"
✅ "Optimize service descriptions"
✅ "Create SEO-friendly service URLs"
✅ "Add reviews to service pages"
```

**Note**: This agent is useful even though TPP is a service business, not traditional e-commerce. Service pages = Product pages for our purposes.

---

## Agent Collaboration Workflows

### Scenario 1: New Blog Post Creation
```
┌─────────────────────┐
│ 1. content-seo-     │  "What topic should I write about?"
│    specialist       │  → Keyword research, topic selection
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 2. bmad-content-    │  Write the blog post
│    editor           │  → Draft content, Australian English
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 3. content-seo-     │  Optimize for SEO
│    specialist       │  → Title, meta, keywords, internal links
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 4. technical-seo-   │  Add schema markup
│    specialist       │  → Article schema, FAQ schema
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 5. bmad-dev         │  Implement in Astro
│                     │  → Create .md file, add to content collection
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 6. bmad-qa          │  Test and validate
│                     │  → Schema validation, link checking
└─────────────────────┘
```

### Scenario 2: Local SEO Campaign
```
┌─────────────────────┐
│ 1. local-seo-       │  Strategy and planning
│    specialist       │  → Suburb targeting, keyword research
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 2. content-seo-     │  Create location pages
│    specialist       │  → Write suburb-specific content
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 3. technical-seo-   │  Add local schema
│    specialist       │  → LocalBusiness, Service Area schema
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 4. local-seo-       │  GBP optimization
│    specialist       │  → Profile setup, posts, photos
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 5. local-seo-       │  Citation building
│    specialist       │  → Directory submissions, NAP consistency
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 6. local-seo-       │  Review generation
│    specialist       │  → Email campaigns, response management
└─────────────────────┘
```

### Scenario 3: Site Speed Optimization
```
┌─────────────────────┐
│ 1. technical-seo-   │  Performance audit
│    specialist       │  → Identify bottlenecks, prioritize fixes
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 2. bmad-dev         │  Implement optimizations
│                     │  → Image optimization, code splitting
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 3. technical-seo-   │  Configure caching
│    specialist       │  → Cloudflare headers, CDN setup
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 4. bmad-qa          │  Performance testing
│                     │  → Lighthouse, PageSpeed Insights
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ 5. technical-seo-   │  Monitor Core Web Vitals
│    specialist       │  → Track improvements, iterate
└─────────────────────┘
```

### Scenario 4: Comprehensive SEO Audit
```
┌─────────────────────┐
│ 1. seo-expert       │  Overall audit strategy
│                     │  → Define scope, prioritize areas
└──────────┬──────────┘
           │
     ┌─────┴─────┬─────────┬─────────┐
     │           │         │         │
     ▼           ▼         ▼         ▼
┌────────┐ ┌──────────┐ ┌──────┐ ┌────────┐
│technical│ │  local-  │ │content│ │ecommerce│
│  -seo-  │ │   seo-   │ │ -seo- │ │  -seo-  │
│specialist│ │specialist│ │special│ │specialist│
└────┬────┘ └────┬─────┘ └───┬──┘ └────┬───┘
     │           │            │         │
     └───────────┴────────────┴─────────┘
                  │
                  ▼
         ┌────────────────┐
         │  seo-expert    │  Consolidate findings
         │                │  → Prioritized action plan
         └────────────────┘
```

---

## Task-to-Agent Mapping

### Quick Lookup Table

| Task | Primary Agent | Supporting Agent(s) |
|------|---------------|---------------------|
| **Keyword Research** | seo-expert | content-seo-specialist |
| **Blog Post Optimization** | content-seo-specialist | bmad-content-editor |
| **Google Business Profile** | local-seo-specialist | - |
| **Site Speed Issues** | technical-seo-specialist | bmad-dev |
| **Schema Markup** | technical-seo-specialist | seo-expert |
| **Local Citations** | local-seo-specialist | - |
| **Review Management** | local-seo-specialist | - |
| **Core Web Vitals** | technical-seo-specialist | bmad-dev |
| **Content Calendar** | content-seo-specialist | seo-expert |
| **Service Page Optimization** | ecommerce-seo-specialist | content-seo-specialist |
| **Backlink Strategy** | seo-expert | local-seo-specialist |
| **Title Tag Optimization** | content-seo-specialist | seo-expert |
| **Robots.txt Issues** | technical-seo-specialist | - |
| **Suburb Landing Pages** | local-seo-specialist | content-seo-specialist |
| **Featured Snippets** | content-seo-specialist | - |
| **Analytics Setup** | seo-expert | technical-seo-specialist |
| **Cloudflare Configuration** | technical-seo-specialist | bmad-dev |
| **NAP Consistency** | local-seo-specialist | - |
| **Product Schema** | ecommerce-seo-specialist | technical-seo-specialist |
| **Image Optimization** | technical-seo-specialist | bmad-dev |

---

## Common SEO Scenarios

### 🚨 Emergency: Site Not Ranking
```
Step 1: seo-expert
  └─→ "Audit why our site isn't ranking"
      └─→ Comprehensive analysis

Step 2: technical-seo-specialist
  └─→ "Check for technical issues"
      └─→ Crawlability, indexation

Step 3: seo-expert
  └─→ "Prioritize fixes"
      └─→ Action plan

Step 4: [Appropriate agent]
  └─→ Implement fixes
```

### 📈 Goal: Increase Local Visibility
```
Week 1: local-seo-specialist
  └─→ "Optimize Google Business Profile"
  └─→ "Target Sydney suburbs"

Week 2-3: local-seo-specialist
  └─→ "Build 50 local citations"
  └─→ "Generate 10 reviews"

Week 4: content-seo-specialist + local-seo-specialist
  └─→ "Create location landing pages"

Ongoing: local-seo-specialist
  └─→ "Monitor local pack rankings"
  └─→ "Respond to reviews"
```

### 🎯 Goal: Launch New Service Page
```
Step 1: seo-expert
  └─→ "Research keywords for [service]"

Step 2: content-seo-specialist
  └─→ "Write SEO-optimized service page content"

Step 3: ecommerce-seo-specialist
  └─→ "Optimize for conversion"
  └─→ "Add trust signals"

Step 4: technical-seo-specialist
  └─→ "Add Service schema markup"

Step 5: bmad-dev
  └─→ "Implement in Astro"

Step 6: seo-expert
  └─→ "Build internal links to new page"
```

### 📝 Goal: Improve Blog Performance
```
Step 1: content-seo-specialist
  └─→ "Audit existing blog posts"
  └─→ "Identify underperforming content"

Step 2: content-seo-specialist
  └─→ "Create content calendar"
  └─→ "Fill content gaps"

Step 3: content-seo-specialist + technical-seo-specialist
  └─→ "Optimize top 10 posts"
  └─→ "Add schema markup"

Step 4: seo-expert
  └─→ "Build backlinks to blog"
  └─→ "Promote content"

Step 5: content-seo-specialist
  └─→ "Monitor performance"
  └─→ "Iterate"
```

### ⚡ Goal: Fix Core Web Vitals
```
Step 1: technical-seo-specialist
  └─→ "Audit Core Web Vitals"
  └─→ "Identify issues (LCP, CLS, INP)"

Step 2: technical-seo-specialist + bmad-dev
  └─→ "Optimize images"
  └─→ "Fix layout shifts"
  └─→ "Reduce JavaScript"

Step 3: technical-seo-specialist
  └─→ "Configure Cloudflare caching"
  └─→ "Test improvements"

Step 4: technical-seo-specialist
  └─→ "Monitor with Lighthouse CI"
  └─→ "Track in Search Console"
```

---

## Quick Commands Reference

### Invoke Agents in Claude Code

```bash
# General SEO strategy
"@seo-expert Create a 90-day SEO plan"

# Local SEO
"@local-seo-specialist Optimize our Google Business Profile"

# Technical SEO
"@technical-seo-specialist Fix our Core Web Vitals issues"

# Content SEO
"@content-seo-specialist Create a content calendar for Q1"

# E-commerce SEO
"@ecommerce-seo-specialist Optimize our service pages"
```

### SEO Testing Commands

```bash
# Full production parity check
npm run parity

# Compare local vs production
npm run parity:scan

# Build and deploy with validation
npm run deploy:auto

# Blog validation
npm run blog:validate
npm run blog:validate-schema

# Performance check
npm run blog:performance

# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Manual SEO Checks

```bash
# Check title tag
curl -s https://theprofitplatform.com.au/ | grep '<title>'

# Check robots.txt
curl -s https://theprofitplatform.com.au/robots.txt

# Check headers
curl -I https://theprofitplatform.com.au/

# Check sitemap
curl -s https://theprofitplatform.com.au/sitemap.xml
```

---

## Decision Tree: Which Agent?

```
┌─────────────────────────────────────────┐
│ What type of SEO task do you have?      │
└─────────────┬───────────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
┌────────┐         ┌─────────┐
│ LOCAL? │         │TECHNICAL│
└───┬────┘         └────┬────┘
    │                   │
    ▼                   ▼
┌─────────────────┐ ┌──────────────────┐
│local-seo-       │ │technical-seo-    │
│specialist       │ │specialist        │
└─────────────────┘ └──────────────────┘

    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
┌─────────┐       ┌──────────┐
│CONTENT? │       │PRODUCTS/ │
│         │       │SERVICES? │
└────┬────┘       └─────┬────┘
     │                  │
     ▼                  ▼
┌──────────────┐ ┌───────────────┐
│content-seo-  │ │ecommerce-seo- │
│specialist    │ │specialist     │
└──────────────┘ └───────────────┘

    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
┌─────────┐       ┌──────────┐
│STRATEGY?│       │NOT SURE? │
└────┬────┘       └─────┬────┘
     │                  │
     ▼                  ▼
┌──────────┐      ┌──────────┐
│seo-expert│      │seo-expert│
└──────────┘      └──────────┘
```

---

## Cheat Sheet: Agent Specialties

### 🎯 seo-expert
- Strategy, planning, research
- Keyword research (general)
- Competitor analysis
- Analytics & reporting
- Link building strategy
- SEO audits (comprehensive)

### 📍 local-seo-specialist
- Google Business Profile
- Sydney/local keywords
- Citations & directories
- Reviews & reputation
- NAP consistency
- Suburb targeting
- Local links

### ⚙️ technical-seo-specialist
- Site speed & performance
- Core Web Vitals
- Schema markup
- Crawlability & indexation
- Astro/Cloudflare optimization
- Security headers
- robots.txt & sitemaps

### ✍️ content-seo-specialist
- Blog optimization
- Content strategy
- Keyword targeting (content)
- Title/meta descriptions
- Readability
- Featured snippets
- Internal linking

### 🛒 ecommerce-seo-specialist
- Service/product pages
- Conversion optimization
- Product schema
- Pricing page SEO
- Trust signals
- CRO strategies

---

## Pro Tips

### Tip 1: Use Multiple Agents Together
Don't just use one agent. For complex tasks, coordinate multiple agents:
```
"@seo-expert @technical-seo-specialist @local-seo-specialist
 Do a complete SEO audit and prioritize fixes"
```

### Tip 2: Start with seo-expert for Strategy
When unsure, start with the general SEO expert for strategy:
```
"@seo-expert What should I focus on to improve rankings?"
→ They'll recommend which specialized agents to use next
```

### Tip 3: Let Agents Collaborate
Ask agents to collaborate explicitly:
```
"@content-seo-specialist work with @technical-seo-specialist
 to optimize this blog post"
```

### Tip 4: Use for Learning
Ask agents to explain:
```
"@technical-seo-specialist Explain how Core Web Vitals
 affect rankings and teach me how to optimize"
```

### Tip 5: Regular Checkups
Schedule regular agent reviews:
- Weekly: @local-seo-specialist for review management
- Weekly: @technical-seo-specialist for Core Web Vitals
- Bi-weekly: @content-seo-specialist for content performance
- Monthly: @seo-expert for comprehensive reporting

---

## Quick Reference Cards

### Card 1: "My Site is Slow"
```
Agent: technical-seo-specialist
Command: "Audit site speed and fix Core Web Vitals"
Expected: Performance analysis + optimization plan
Timeline: 2-4 hours implementation
```

### Card 2: "I Need More Local Customers"
```
Agent: local-seo-specialist
Command: "Improve local visibility in Sydney"
Expected: GBP optimization + citations + reviews
Timeline: 2-4 weeks for results
```

### Card 3: "Create a Blog Post"
```
Agent: content-seo-specialist
Command: "Create SEO-optimized blog post about [topic]"
Expected: Keyword research + outline + optimization
Timeline: 1-2 hours
```

### Card 4: "My Rankings Dropped"
```
Agent: seo-expert
Command: "Diagnose ranking drop and create recovery plan"
Expected: Analysis + prioritized action items
Timeline: Immediate diagnosis, 1-4 weeks recovery
```

### Card 5: "Optimize Service Pages"
```
Agent: ecommerce-seo-specialist
Command: "Optimize [service] page for conversions"
Expected: CRO recommendations + schema + trust signals
Timeline: 2-3 hours implementation
```

---

## File Locations

All agents are in: `.claude/agents/`

```
.claude/agents/
├── seo-expert.md
├── local-seo-specialist.md
├── technical-seo-specialist.md
├── content-seo-specialist.md
├── ecommerce-seo-specialist.md
├── bmad-content-editor.md
├── bmad-dev.md
├── bmad-qa.md
└── bmad-architect.md
```

---

## Need Help?

**Can't decide which agent?** → Start with `seo-expert`

**Multiple areas of concern?** → Use multiple agents together

**Time-sensitive issue?** → Use this priority:
1. technical-seo-specialist (if site broken/slow)
2. local-seo-specialist (if local rankings dropped)
3. seo-expert (for strategy)

**Want to learn?** → Ask any agent to explain their specialty

---

**Last Updated**: 2025-01-27
**Maintained by**: The Profit Platform SEO Team
**Version**: 1.0
