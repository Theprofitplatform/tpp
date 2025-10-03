# Google Search Console Setup Guide
**The Profit Platform**
**Estimated Time:** 30 minutes
**Priority:** HIGH (Essential for SEO!)

---

## Why Google Search Console Matters

**Google Search Console (GSC) = Your direct line to Google.**

What you get:
- ✅ See exactly which keywords you rank for
- ✅ Track clicks, impressions, CTR, position
- ✅ Submit sitemaps to Google
- ✅ Fix technical SEO issues
- ✅ See which pages are indexed
- ✅ Monitor mobile usability
- ✅ Get alerts about penalties

**Without GSC, you're guessing. With GSC, you KNOW what's working.**

---

## Step 1: Add Property (10 min)

### 1.1 Go to Google Search Console
**URL:** https://search.google.com/search-console

### 1.2 Sign In
Use: **avi@theprofitplatform.com.au**

### 1.3 Add Property
Click **Add Property**

**Two options:**

#### Option A: Domain Property (Recommended)
**Verifies:** All versions (http, https, www, non-www, subdomains)

**Enter:** `theprofitplatform.com.au`

**Verification Method:** DNS record

**Steps:**
1. Copy TXT record provided by Google
2. Go to your domain registrar (where you bought domain)
3. Add TXT record to DNS settings
4. Wait 5-60 minutes for DNS propagation
5. Click "Verify" in GSC

---

#### Option B: URL Prefix Property
**Verifies:** Specific URL only

**Enter:** `https://theprofitplatform.com.au`

**Verification Methods:**
1. **HTML file upload** (upload file to your site)
2. **HTML tag** (add meta tag to site)
3. **Google Analytics** (if GA4 already installed)
4. **Google Tag Manager** (if GTM installed)

**Recommended:** Use Google Analytics method (easiest if GA4 is already set up)

---

### 1.4 Verify Property

**Using Google Analytics Method:**
1. Choose "Google Analytics" as verification method
2. GSC will detect your GA4 tracking code
3. Click "Verify"
4. Done!

**Using DNS Method (Option A):**
1. Log in to domain registrar
2. Find DNS settings
3. Add TXT record:
   - Type: TXT
   - Name: @ (or leave blank)
   - Value: [paste Google's TXT record]
   - TTL: 3600 (or default)
4. Save
5. Wait 15-60 minutes
6. Click "Verify" in GSC

---

## Step 2: Submit Sitemap (5 min)

**Sitemap = List of all pages on your site for Google to crawl**

### 2.1 Check if Sitemap Exists
Visit: `https://theprofitplatform.com.au/sitemap.xml`

**If it exists:** You'll see XML file with list of URLs

**If it doesn't exist:** Create one (Astro should auto-generate)

### 2.2 Submit to Google Search Console

1. In GSC, go to **Sitemaps** (left sidebar)
2. Enter sitemap URL: `sitemap.xml`
3. Click **Submit**

**Result:** Google will start crawling your pages more efficiently.

### 2.3 Check Sitemap Status
- Wait 24-48 hours
- Go to **Sitemaps** in GSC
- Status should show "Success" with number of discovered URLs

---

## Step 3: Check Coverage (5 min)

**Coverage = Which pages Google has indexed**

### 3.1 Go to Index → Pages
Shows:
- ✅ Indexed pages (good!)
- ⚠️ Excluded pages (may need attention)
- ❌ Errors (need fixing)

### 3.2 Review Issues

**Common issues:**

**"Page with redirect"**
- Not an error, just informational
- Means page redirects to another URL

**"Not found (404)"**
- Page doesn't exist anymore
- Fix: Remove from sitemap or set up redirect

**"Crawled - currently not indexed"**
- Google crawled but chose not to index
- Reasons: Low quality, duplicate content, or too new
- Fix: Improve content quality, wait

**"Excluded by 'noindex' tag"**
- Page has noindex tag telling Google not to index
- Fix: Remove noindex if you want it indexed

---

## Step 4: Request Indexing for New Pages (10 min)

**Speed up indexing of important pages:**

### For New Blog Posts:

1. Go to **URL Inspection** (top search bar)
2. Enter full URL: `https://theprofitplatform.com.au/blog/your-post`
3. Click "Request indexing"
4. Wait 24-48 hours

**Do this for:**
- All 5 new blog posts
- All 5 location pages
- SEO checklist landing page

**Why?** Otherwise Google might take weeks to find them.

---

## Step 5: Set Up Performance Tracking (Ongoing)

### 5.1 Go to Performance Report
**Left sidebar:** Performance → Search results

### 5.2 Key Metrics

**Total Clicks:** How many people clicked your site in Google
**Total Impressions:** How many times your site appeared in search
**Average CTR:** Clicks ÷ Impressions (target: 3-5%+)
**Average Position:** Average ranking (lower = better, #1 is best)

### 5.3 Filter by:
- **Queries:** See which keywords you rank for
- **Pages:** See which pages get most traffic
- **Countries:** See where traffic comes from (should be mostly Australia)
- **Devices:** Mobile vs desktop vs tablet

### 5.4 Weekly Check
Every Monday:
1. Check performance last 28 days vs previous 28 days
2. Identify:
   - Which keywords are growing (double down)
   - Which keywords are declining (fix content)
   - New keywords appearing (opportunities)
   - Keywords on page 2 (positions 11-20) = low-hanging fruit

---

## Step 6: Check Mobile Usability

**60%+ of searches are mobile. Mobile-friendly = critical.**

### 6.1 Go to Mobile Usability
**Left sidebar:** Experience → Mobile Usability

### 6.2 Check for Issues

**Common mobile issues:**
- Text too small to read
- Clickable elements too close together
- Content wider than screen
- Viewport not set

**Your site should have ZERO mobile issues** (Astro is mobile-first by default).

**If issues appear:**
- Click on issue to see affected pages
- Fix CSS/HTML
- Request re-crawl

---

## Step 7: Check Core Web Vitals

**Core Web Vitals = Google's page experience metrics (ranking factor!)**

### 7.1 Go to Core Web Vitals
**Left sidebar:** Experience → Core Web Vitals

### 7.2 Key Metrics

**LCP (Largest Contentful Paint):**
- Measures: How fast main content loads
- Target: < 2.5 seconds
- Status: Should be GREEN (your site loads in 152ms!)

**FID (First Input Delay):**
- Measures: How fast site responds to interactions
- Target: < 100ms
- Status: Should be GREEN

**CLS (Cumulative Layout Shift):**
- Measures: Visual stability (content doesn't jump around)
- Target: < 0.1
- Status: Should be GREEN

**Your site should pass all 3 easily.**

---

## Step 8: Set Up Email Alerts

**Get notified when issues occur:**

### 8.1 Go to Settings (gear icon)
**Top right:** Settings

### 8.2 Users and Permissions
Add team members if needed.

### 8.3 Email Notifications
**Enable all:**
- ✅ Manual actions (penalties)
- ✅ Security issues
- ✅ Site errors
- ✅ Mobile usability issues
- ✅ Core Web Vitals

**Why?** Get alerts immediately if Google finds problems.

---

## Step 9: Link to Google Analytics

**See GSC data inside GA4:**

### In GSC:
1. Go to **Settings**
2. Click **Associations**
3. Click **Associate** next to Google Analytics
4. Choose your GA4 property
5. Confirm

**In GA4:**
(We already did this in GA4 setup guide)

**Result:** See search queries, impressions, CTR inside GA4 reports.

---

## Weekly GSC Checklist

**Every Monday (15 minutes):**

### 1. Performance Report
- [ ] Check total clicks (increasing?)
- [ ] Check total impressions (growing visibility?)
- [ ] Check average CTR (improving?)
- [ ] Check average position (rankings going up?)

### 2. Top Queries
- [ ] Identify top 10 keywords driving traffic
- [ ] Find keywords on page 2 (positions 11-20) = opportunities
- [ ] Look for new keywords (means new content is ranking!)

### 3. Top Pages
- [ ] See which pages get most clicks
- [ ] Identify pages with high impressions but low CTR (need better titles/descriptions)
- [ ] Check if new blog posts are getting impressions

### 4. Coverage
- [ ] Check for any new errors
- [ ] Fix any issues that appeared
- [ ] Verify fixed pages are now indexed

### 5. Mobile Usability & Core Web Vitals
- [ ] Check for any new mobile issues
- [ ] Ensure Core Web Vitals stay GREEN

---

## How to Find Quick SEO Wins in GSC

### Win #1: Page 2 Keywords (Positions 11-20)
**These are EASIEST to improve.**

**Steps:**
1. Go to **Performance** → **Queries**
2. Filter by **Position: 11-20**
3. Sort by **Impressions** (highest first)
4. These are your opportunities!

**How to improve:**
- Add more content to that page
- Improve title tag to include keyword
- Add internal links pointing to that page
- Build 2-3 backlinks to that page

**Result:** Move from page 2 to page 1 = 5-10x more traffic

---

### Win #2: High Impressions, Low CTR
**Means you're ranking but title/description isn't compelling.**

**Steps:**
1. Go to **Performance** → **Pages**
2. Add column: **CTR**
3. Filter: **Impressions > 100** AND **CTR < 2%**
4. These pages need better titles/descriptions!

**How to improve:**
- Rewrite title tag to be more compelling
- Add numbers ("5 Ways...", "Complete Guide...")
- Include year (2025)
- Add benefit ("...That Actually Work")
- Rewrite meta description with clear value proposition

**Result:** Same rankings, 2-3x more clicks

---

### Win #3: Brand Search Opportunity
**Check if people are searching your brand name.**

**Steps:**
1. Go to **Performance** → **Queries**
2. Search for: "profit platform" or "the profit platform"
3. See if you're ranking #1

**If not #1:**
- You MUST rank #1 for your own brand name
- Add more mentions of your brand across site
- Build backlinks with branded anchor text
- Add social media profiles (they rank too)

---

## Common GSC Issues & Fixes

### Issue #1: "Sitemap could not be read"
**Fix:**
- Check sitemap URL is correct
- Ensure sitemap is accessible (visit URL directly)
- Verify XML formatting is valid

---

### Issue #2: "Submitted URL not found (404)"
**Fix:**
- Page was deleted or URL changed
- Remove from sitemap OR
- Set up 301 redirect to new URL

---

### Issue #3: "Crawled - currently not indexed"
**Reasons:**
- Page is too new (wait)
- Content is thin/duplicate
- No internal links pointing to page

**Fix:**
- Wait 2-4 weeks if new
- Improve content quality
- Add internal links from other pages
- Request indexing manually

---

### Issue #4: "Duplicate content"
**Fix:**
- Consolidate duplicate pages
- Use canonical tags
- Set up 301 redirects

---

## Advanced Features (Month 2+)

### URL Parameters
Handle dynamic URLs properly.

### International Targeting
If you expand beyond Australia.

### Property Sets
Group multiple properties.

### Structured Data
Monitor rich results (FAQ, reviews, etc.)

---

## Resources

**GSC Help:** https://support.google.com/webmasters
**GSC Training:** https://developers.google.com/search/docs

---

## Checklist: Is GSC Properly Set Up?

### Basics
- [ ] Property added and verified
- [ ] Sitemap submitted
- [ ] Email alerts enabled

### Data Collection
- [ ] Performance data showing (wait 24-48 hours if new)
- [ ] Coverage report shows indexed pages
- [ ] Mobile usability checked (no issues)
- [ ] Core Web Vitals are GREEN

### Integrations
- [ ] Linked to Google Analytics
- [ ] Team members added

### Maintenance
- [ ] Weekly check scheduled (calendar reminder)
- [ ] Process for requesting indexing of new pages

---

## Next Steps

1. ✅ Wait 24-48 hours for data to populate
2. ✅ Review first Performance report
3. ✅ Request indexing for all new blog posts and location pages
4. ✅ Check weekly for opportunities

---

**YOUR SITE IS NOW CONNECTED TO GOOGLE!**

GSC is your window into how Google sees your site. Check it weekly. It will guide your SEO strategy.

---

*Last Updated: January 15, 2025*
*Next Guide: Local Citations Submission*
