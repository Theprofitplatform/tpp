# Quick Start Guide - Content Automation

## 🚀 Generate Complete Blog + Social Media in 3 Commands

### 1️⃣ Generate Blog Post (Claude API)
```bash
npm run content:blog
```
**Wait:** 2-5 minutes
**Output:** `src/content/blog/2025-10-10-<topic>.md`

---

### 2️⃣ Deploy Blog
```bash
npm run deploy
```
**Wait:** 1-2 minutes
**Live at:** `https://theprofitplatform.com.au/blog/<slug>`

---

### 3️⃣ Generate Social Media (DeepSeek API)
```bash
npm run social:generate <blog-slug>
```

**Example:**
```bash
npm run social:generate content-marketing-strategy-for-sydney-b2b-companies-in-2025
```

**Wait:** 30-60 seconds
**Output:** `automation/content-variants/<slug>/`
- ✅ LinkedIn post
- ✅ Twitter thread (8 tweets)
- ✅ Email newsletter
- ✅ Facebook post

---

## 📂 Where to Find Generated Content

### Blog Post
```
src/content/blog/2025-10-10-<topic>.md
```

### Social Media Variants
```
automation/content-variants/<slug>/
├── email.txt       → Copy/paste to email platform
├── linkedin.txt    → Copy/paste to LinkedIn
├── twitter.txt     → Copy/paste to Twitter
├── facebook.txt    → Copy/paste to Facebook
└── metadata.json   → Generation stats
```

---

## ⚡ Quick Commands Reference

| Command | What it does | Time |
|---------|-------------|------|
| `npm run content:blog` | Generate blog post (Claude) | 2-5 min |
| `npm run social:generate <slug>` | Generate social media (DeepSeek) | 30-60 sec |
| `npm run deploy` | Deploy blog to Cloudflare | 1-2 min |
| `npm run build` | Build site locally | 30 sec |
| `npm run preview` | Preview site locally | Instant |

---

## 🎯 Typical Workflow

```
Morning (10 mins):
├─ npm run content:blog
├─ Review generated blog post
├─ npm run deploy
└─ Wait for deployment

Afternoon (5 mins):
├─ npm run social:generate <slug>
├─ Review social media variants
├─ Copy/paste to platforms
└─ Schedule or post

Total: ~15 minutes for complete content cycle
```

---

## 🔑 Required Setup (One-Time)

Add to `.env.local`:
```bash
CLAUDE_API_KEY=sk-ant-...
DEEPSEEK_API_KEY=sk-...
UNSPLASH_ACCESS_KEY=...
```

---

## 💰 Cost Per Cycle

- Blog post (Claude): ~$0.50-1.00
- Social media (DeepSeek): ~$0.02-0.05
- **Total: ~$0.52-1.05 per complete blog + social cycle**

---

## ✅ Quality Checklist

Before posting, verify:
- [ ] Blog post is grammatically correct
- [ ] Statistics are accurate (not fabricated)
- [ ] Sydney-specific references included
- [ ] Internal links working
- [ ] Cover image loaded
- [ ] Social media hashtags relevant
- [ ] Email subject line under 50 chars
- [ ] Twitter thread under 280 chars/tweet

---

## 🆘 Quick Troubleshooting

**"DeepSeek API key not configured"**
→ Add `DEEPSEEK_API_KEY=...` to `.env.local`

**"Blog post not found"**
→ Use slug without date: `my-post` not `2025-10-10-my-post`

**Social media generation fails**
→ Wait 30 seconds, retry

**Stats look fake**
→ Check `metadata.json` for validation warnings

---

## 📚 Full Documentation

See `automation/CONTENT-AUTOMATION-GUIDE.md` for:
- Complete architecture
- Customization options
- Case study library
- Analytics tracking
- Best practices
- Advanced features

---

## 🎉 You're Ready!

Start with:
```bash
npm run content:blog
```

Then follow the prompts. It's that simple.
