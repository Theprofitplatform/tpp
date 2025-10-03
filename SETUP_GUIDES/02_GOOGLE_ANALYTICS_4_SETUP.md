# Google Analytics 4 (GA4) Setup Guide
**The Profit Platform**
**Estimated Time:** 1 hour
**Priority:** HIGH (Need this to measure results!)

---

## Why GA4 Matters

**Google Analytics = Your website's dashboard.**

Without it, you're flying blind:
- ❌ Don't know where traffic comes from
- ❌ Don't know which pages perform best
- ❌ Don't know if marketing is working
- ❌ Can't prove ROI

With GA4:
- ✅ Track every visitor
- ✅ See which marketing channels work
- ✅ Measure conversions (form fills, calls, etc.)
- ✅ Make data-driven decisions

---

## Step 1: Create GA4 Account (10 min)

### 1.1 Go to Google Analytics
**URL:** https://analytics.google.com

### 1.2 Sign In
Use your business Gmail: **avi@theprofitplatform.com.au**

### 1.3 Click "Start measuring"

### 1.4 Account Setup
**Account Name:** The Profit Platform

**Account Data Sharing Settings:**
- ✅ Google products & services (recommended)
- ✅ Benchmarking (see how you compare to others)
- ✅ Technical support
- ❌ Account specialists (optional)

Click **Next**

---

### 1.5 Property Setup

**Property Name:** The Profit Platform Website

**Reporting Time Zone:** (GMT+11:00) Sydney

**Currency:** Australian Dollar (AUD)

Click **Next**

---

### 1.6 Business Information

**Industry:** Marketing & Advertising

**Business Size:** Small (1-10 employees)

**How do you intend to use Google Analytics?**
- ✅ Examine user behavior
- ✅ Measure advertising ROI
- ✅ Get to know my customers

Click **Create**

---

### 1.7 Accept Terms of Service
- ✅ Accept Google Analytics Terms of Service
- ✅ Accept Data Processing Terms

Click **I Accept**

---

## Step 2: Set Up Data Stream (15 min)

**Data Stream = Connection between your website and GA4**

### 2.1 Choose Platform
Click **Web**

### 2.2 Set Up Web Stream

**Website URL:** https://theprofitplatform.com.au

**Stream Name:** The Profit Platform Main Website

**Enhanced measurement:** Leave ON (recommended)
- This automatically tracks:
  - Page views
  - Scrolls
  - Outbound clicks
  - Site search
  - Video engagement
  - File downloads

Click **Create stream**

---

### 2.3 Get Measurement ID

You'll see: **Measurement ID: G-XXXXXXXXXX**

**Copy this ID** - you'll need it to install tracking.

Example: G-ABC123DEF456

---

## Step 3: Install Tracking Code (20 min)

**Two options:**

### Option A: Astro Global Tag (Recommended)

Since your site uses Astro, add GA4 to BaseLayout.astro:

**File:** `/src/layouts/BaseLayout.astro`

**Add this to the `<head>` section:**

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Replace G-XXXXXXXXXX with your actual Measurement ID**

**Location in file:** Right before `</head>` closing tag

---

### Option B: Google Tag Manager (Advanced)

If you want more flexibility for future tracking:

1. Set up Google Tag Manager account
2. Add GTM container to site
3. Add GA4 tag through GTM

**Recommendation:** Start with Option A (simpler), upgrade to GTM later if needed.

---

### 3.3 Verify Installation

**Method 1: Real-Time Report**
1. Go to GA4 dashboard
2. Click **Reports** → **Realtime**
3. Visit your website in another browser tab
4. Check if you see yourself in Realtime report

**Should see:**
- 1 user active now
- Your current page
- Your location

**Method 2: Chrome Extension**
Install "Google Analytics Debugger" extension:
1. Install from Chrome Web Store
2. Turn on extension
3. Visit your site
4. Check console for GA4 hits

---

## Step 4: Set Up Conversions (15 min)

**Conversions = Actions that matter to your business**

### Primary Conversions to Track:

#### 1. Contact Form Submissions

**In GA4:**
1. Go to **Admin** → **Events**
2. Click **Create event**
3. Event name: `form_submission`

**Configuration:**
- Matching conditions:
  - Parameter: `form_id`
  - Operator: equals
  - Value: `contact-form` (or your form ID)

**Mark as conversion:**
1. Go to **Admin** → **Conversions**
2. Click **New conversion event**
3. Enter: `form_submission`
4. Click **Save**

---

#### 2. Phone Number Clicks

**Add this to your site's phone number links:**

```html
<a href="tel:+61487286451"
   onclick="gtag('event', 'phone_call', {'method': 'Click'});">
   (02) 1234 5678
</a>
```

**In GA4:**
1. Go to **Admin** → **Conversions**
2. Click **New conversion event**
3. Event name: `phone_call`
4. Click **Save**

---

#### 3. Email Clicks

**Add to email links:**

```html
<a href="mailto:avi@theprofitplatform.com.au"
   onclick="gtag('event', 'email_click', {'method': 'Click'});">
   Email Us
</a>
```

**In GA4:**
1. Create conversion event: `email_click`

---

#### 4. PDF Downloads (Lead Magnet)

**Add to download button:**

```html
<a href="/downloads/sydney-seo-checklist.pdf"
   download
   onclick="gtag('event', 'file_download', {
     'file_name': 'sydney-seo-checklist.pdf',
     'file_extension': 'pdf'
   });">
   Download Checklist
</a>
```

**In GA4:**
1. `file_download` is automatically tracked with Enhanced Measurement
2. Go to **Admin** → **Conversions**
3. Click **New conversion event**
4. Enter: `file_download`

---

#### 5. Button Clicks (CTA)

**For important CTAs, add tracking:**

```html
<button onclick="gtag('event', 'cta_click', {
  'button_name': 'Free Audit CTA',
  'button_location': 'Homepage Hero'
});">
  Get Free Audit
</button>
```

---

## Step 5: Link Google Search Console (5 min)

**Why?** See which keywords drive organic traffic.

### Steps:
1. In GA4, go to **Admin** → **Property Settings**
2. Click **Search Console links**
3. Click **Link**
4. Choose your Search Console property (we'll set this up next)
5. Select **All web site data**
6. Click **Submit**

**Result:** In GA4 under **Reports** → **Acquisition** → **Search Console**, you'll see:
- Which keywords drive traffic
- Click-through rates
- Impressions
- Average position

---

## Step 6: Set Up Custom Reports (10 min)

### Report 1: Lead Generation Performance

**Track:**
- Traffic sources
- Conversions by source
- Conversion rate by channel

**To Create:**
1. Go to **Explore**
2. Click **Free Form**
3. Add dimensions:
   - Session source/medium
   - Landing page
4. Add metrics:
   - Users
   - Conversions
   - Conversion rate

---

### Report 2: Top Performing Pages

**Track:**
- Which pages get most traffic
- Which pages convert best
- Time on page

**To Create:**
1. Go to **Reports** → **Engagement** → **Pages and screens**
2. View default report
3. Add secondary dimension: **Session source**

---

### Report 3: Location Performance

**Track:**
- Which Sydney suburbs visit your site
- Where your customers come from

**To Create:**
1. Go to **Reports** → **User** → **Demographics**
2. View **City** report
3. Filter to Sydney suburbs

---

## Step 7: Set Up Audiences (Optional but Powerful)

**Audiences = Segments of users you can remarket to**

### Audience 1: All Visitors
- Everyone who visits your site
- Used for remarketing ads

### Audience 2: Engaged Visitors
- Users who spent 2+ minutes on site OR viewed 3+ pages
- High-quality leads

### Audience 3: Contact Form Abandoners
- Users who viewed contact page but didn't submit
- Good for follow-up ads

### Audience 4: Lead Magnet Downloaders
- Downloaded SEO checklist
- Warm leads for email nurture

**To Create:**
1. Go to **Admin** → **Audiences**
2. Click **New audience**
3. Choose template or create custom
4. Set conditions
5. Save

---

## Step 8: Set Up Goals & KPIs

### Weekly KPIs to Monitor:

**Traffic:**
- Total users (target: +10% week-over-week)
- New vs returning users
- Sessions

**Engagement:**
- Average session duration (target: 2+ minutes)
- Pages per session (target: 3+)
- Bounce rate (target: <50%)

**Conversions:**
- Total conversions
- Conversion rate (target: 2-5%)
- Conversions by source

**Top Pages:**
- Most visited pages
- Pages with highest conversion rate
- Pages with longest time on page

---

## Step 9: Connect to Google Ads (Future)

When you start running Google Ads:

1. Go to **Admin** → **Google Ads Links**
2. Click **Link**
3. Choose your Google Ads account
4. Link

**Benefits:**
- See which ads drive conversions
- Optimize campaigns based on GA4 data
- Create remarketing audiences

---

## Troubleshooting Common Issues

### Issue #1: Not Seeing Data
**Possible causes:**
- Tracking code not installed correctly
- Ad blocker blocking GA4
- Tracking code in wrong location

**Fix:**
- Check code placement in BaseLayout.astro
- Test in incognito mode
- Use GA Debugger Chrome extension

---

### Issue #2: Seeing Double Pageviews
**Cause:** Tracking code installed twice

**Fix:**
- Search codebase for `gtag` or `G-XXXXXXXXXX`
- Remove duplicate code

---

### Issue #3: Conversions Not Tracking
**Possible causes:**
- Event name misspelled
- Conversion not marked in GA4
- Code not firing

**Fix:**
- Check event names match exactly
- Mark event as conversion in GA4
- Test with browser console open

---

## Reports to Check Weekly

### Monday Morning Routine (15 min):

1. **Realtime Report**
   - Any visitors on site right now?

2. **Acquisition Overview** (Last 7 days)
   - Where is traffic coming from?
   - Which source drives most conversions?

3. **Pages Report**
   - Top 10 pages by traffic
   - Which blog posts performing well?

4. **Conversions Report**
   - How many conversions last week?
   - Which pages drive conversions?

5. **Search Console Integration** (if linked)
   - Which keywords driving traffic?
   - Any new keywords ranking?

---

## Advanced Setup (Month 2+)

### Custom Dimensions
Track custom data:
- Client type (new vs returning)
- Service interest
- Lead source

### Enhanced E-commerce (If selling)
- Product views
- Add to cart
- Purchases

### Cross-Domain Tracking (If you have multiple domains)
- Track users across domains
- Full funnel visibility

### User-ID Tracking
- Track logged-in users across devices
- Better attribution

---

## GA4 Best Practices

### DO:
✅ Check data weekly
✅ Set up conversions for all important actions
✅ Filter out internal traffic (your own visits)
✅ Use UTM parameters for campaign tracking
✅ Document what you're tracking (keep notes)

### DON'T:
❌ Obsess over daily fluctuations (look at trends)
❌ Track personal information (violates privacy laws)
❌ Install multiple tracking codes (creates duplicates)
❌ Ignore data (what's the point of tracking if you don't use it?)

---

## Privacy & Compliance

**Important:** Ensure you're compliant with privacy laws.

### Add Privacy Policy
Create privacy policy page explaining:
- What data you collect (GA4 cookies, user behavior)
- How you use it (improve website, marketing)
- User rights (opt-out, data deletion)

**Required by:**
- GDPR (Europe)
- Australian Privacy Act
- Google's terms

### Cookie Consent (Optional but Recommended)
Add cookie banner:
- Explain cookies
- Get user consent
- Allow opt-out

**Tools:**
- Cookiebot
- OneTrust
- Termly

---

## Checklist: Is GA4 Properly Set Up?

### Installation
- [ ] GA4 account created
- [ ] Property and data stream created
- [ ] Tracking code added to BaseLayout.astro
- [ ] Verified in Realtime report (seeing data)

### Conversions
- [ ] Contact form submissions tracked
- [ ] Phone clicks tracked
- [ ] Email clicks tracked
- [ ] PDF downloads tracked
- [ ] All marked as conversions in GA4

### Integration
- [ ] Google Search Console linked (after GSC setup)
- [ ] Google Ads linked (when you start ads)

### Reports
- [ ] Custom reports created
- [ ] Weekly check scheduled (calendar reminder)
- [ ] KPIs documented

### Privacy
- [ ] Privacy policy added to website
- [ ] Cookie consent implemented (if needed)

### Team Access
- [ ] Team members added with appropriate permissions
- [ ] Login credentials saved securely

---

## Monthly Reporting Template

Use this template for monthly reports:

### Traffic Summary
- Total users: [X]
- New users: [X]
- Sessions: [X]
- Change vs last month: +/-[X%]

### Top Traffic Sources
1. Organic Search: [X] users ([X%])
2. Direct: [X] users ([X%])
3. Social: [X] users ([X%])
4. Referral: [X] users ([X%])

### Engagement
- Avg. session duration: [X minutes]
- Pages per session: [X]
- Bounce rate: [X%]

### Conversions
- Total conversions: [X]
- Conversion rate: [X%]
- Conversions by source:
  - Organic: [X]
  - Direct: [X]
  - Social: [X]

### Top Pages
1. [Page] - [X] views
2. [Page] - [X] views
3. [Page] - [X] views

### Top Converting Pages
1. [Page] - [X] conversions
2. [Page] - [X] conversions
3. [Page] - [X] conversions

### Goals for Next Month
- [Goal 1]
- [Goal 2]
- [Goal 3]

---

## UTM Parameters for Campaign Tracking

**Use UTM parameters to track where traffic comes from:**

### Format:
```
https://theprofitplatform.com.au?utm_source=SOURCE&utm_medium=MEDIUM&utm_campaign=CAMPAIGN
```

### Examples:

**Email Newsletter:**
```
?utm_source=newsletter&utm_medium=email&utm_campaign=january_2025
```

**Facebook Post:**
```
?utm_source=facebook&utm_medium=social&utm_campaign=seo_checklist_promo
```

**LinkedIn Ad:**
```
?utm_source=linkedin&utm_medium=cpc&utm_campaign=seo_services
```

**Tool to Create:** https://ga-dev-tools.google/campaign-url-builder/

---

## Resources

**GA4 Help Center:** https://support.google.com/analytics

**GA4 Academy (Free Courses):** https://analytics.google.com/analytics/academy/

**GA4 Debugger Extension:** https://chrome.google.com/webstore (search "GA Debugger")

**UTM Builder:** https://ga-dev-tools.google/campaign-url-builder/

---

## Next Steps

After GA4 is set up:

1. ✅ Set up Google Search Console (next guide)
2. ✅ Let data collect for 1 week
3. ✅ Review first weekly report
4. ✅ Make note of baseline metrics
5. ✅ Set goals for improvement

---

**YOU NOW HAVE EYES ON YOUR WEBSITE!**

Check your GA4 dashboard weekly. Data is power. Use it to make smart decisions about your marketing.

---

*Last Updated: January 15, 2025*
*Next Guide: Google Search Console Setup*
