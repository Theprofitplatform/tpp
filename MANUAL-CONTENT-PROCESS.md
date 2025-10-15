# 📝 MANUAL-FIRST CONTENT PUBLISHING PROCESS

**Philosophy:** Manual processes beat broken automation every time.
**Timeline:** Add automation when manual becomes painful, not before.

---

## 🚀 SIMPLE CONTENT WORKFLOW (< 10 Minutes)

### Step 1: Create New Blog Post
```bash
# Create new blog post (2 minutes)
cd src/content/blog
cp TEMPLATE.md YYYY-MM-DD-your-post-title.md
```

### Step 2: Edit Content
```markdown
---
title: "Your Post Title Here"
description: "What this post covers"
publishDate: 2025-10-XX
tags: ["seo", "sydney", "your-topic"]
---

# Your Post Title Here

Write your content...
```

### Step 3: Test Locally
```bash
# Build and test (2 minutes)
npm run build
npm run preview
```

### Step 4: Deploy to Production
```bash
# Deploy (1 minute)
npm run deploy
```

### Step 5: Verify
```bash
# Check it's live (1 minute)
curl https://theprofitplatform.com.au/blog/your-post-slug
```

**Total Time:** ~6-10 minutes
**Risk:** Minimal - you verify before deploy

---

## 📋 CONTENT QUALITY CHECKLIST

### Before Publishing:
- [ ] Title is clear and SEO-optimized
- [ ] Meta description under 160 characters
- [ ] Content is 1500+ words (if SEO-focused)
- [ ] Internal links to 3-5 relevant pages
- [ ] Images optimized (size < 500KB, alt text)
- [ ] FAQ section with 3+ questions
- [ ] Schema markup (if applicable)
- [ ] Proofread for errors

### Technical Checks:
- [ ] Build completes successfully
- [ ] No console errors
- [ ] Mobile-friendly
- [ ] All links work
- [ ] Meta tags populated

---

## 🔧 ESSENTIAL TOOLS ONLY

### What We Use:
- **Editor:** VSCode (with spell check)
- **SEO Check:** Manual review + Google Search Console
- **Images:** TinyPNG compression
- **Links:** Manual testing
- **Schema:** Template copy-paste

### What We DON'T Use: (And Why)
- ❌ Complex blog generators (overkill for 5-10 posts/month)
- ❌ Automated SEO tools (manual review works better)
- ❌ Complex image pipelines (manual optimization is faster)
- ❌ N8N workflows (not needed at current scale)
- ❌ Discord notifications (email is simpler)

---

## 📊 WHEN TO ADD AUTOMATION

### Add automation WHEN:
- You publish >20 posts/month consistently
- Manual process takes >30 minutes per post
- You have quality issues from repetitive tasks
- Multiple people need to publish content

### Add automation NEVER because:
- "It looks professional" (vanity project)
- "We might need it someday" (YAGNI principle)
- "Other companies do it" (different scale)
- "It was cool to build" (hobby, not business)

---

## 🚨 EMERGENCY CONTENT PROCESS

If something needs to be published in <5 minutes:

```bash
# ultra-fast content fix
echo "Quick fix" > src/content/blog/urgent-fix.md
npm run build && npm run deploy
```

### Maximum urgent post:
- Title, 200 words, publish
- Fix grammar errors immediately
- Remove broken content
- Add urgent update

---

## 📞 CONTENT SUPPORT

### For content creation:
1. Use the template structure
2. Follow quality checklist
3. Test before deploy
4. Keep it simple

### For technical issues:
1. Check STATUS.md for known issues
2. Run essential tests if unsure
3. Use emergency rollback if needed
4. Contact lead developer for help

---

## 🎯 SUCCESS METRICS

### Manual process is working if:
- You can publish a post in <10 minutes
- Zero stress about "automation breaking"
- Content quality improves (not declines)
- Team can actually use the process
- No weekend "automation emergency" calls

### Failed process signs:
- Taking >30 minutes per post
- Scripts breaking regularly  
- Team avoids publishing content
- Weekend support calls for broken tools
- Content quality declining

---

## 💻 QUICK REFERENCE

```bash
# Essential commands (the only ones we use)
npm run dev          # Local development
npm run build        # Build for production  
npm run preview      # Test local build
npm run deploy       # Deploy to production

# Essential tests
./scripts/core-test.sh           # Basic functionality
./scripts/essential-tests.sh     # 3 critical tests

# Emergency rollback
git log --oneline -5             # Find backup point
git reset --hard <commit-hash>   # Rollback if needed
```

---

**The faster you can ship content manually, the faster you should consider automation. Until then, manual is superior.**
