# Local SEO Conversion Tracking Setup
**Business:** The Profit Platform
**Last Updated:** October 5, 2025
**Goal:** Measure ROI from local SEO efforts

---

## 🎯 Why Track Conversions?

### The Problem
Many businesses track rankings and traffic, but **can't prove local SEO drives revenue**.

### The Solution
Track the full funnel:
1. **Local search** → 2. **Website visit** → 3. **Lead/conversion** → 4. **Customer** → 5. **Revenue**

### What to Track
- 📞 Phone calls from local search
- 📧 Contact form submissions
- 📅 Appointment bookings
- 🗺️ Direction requests (GBP)
- 💬 GBP messages
- 💰 Revenue attributed to local SEO

---

## 📊 Conversion Goals by Source

### Google Business Profile Conversions
| Action | Tool to Track | Target | Priority |
|--------|---------------|--------|----------|
| Phone calls | GBP Insights | 20+/month | CRITICAL |
| Direction requests | GBP Insights | 30+/month | HIGH |
| Website clicks | GBP Insights | 50+/month | HIGH |
| Messages | GBP Chat | 10+/month | MEDIUM |
| Booking clicks | GBP Insights | 15+/month | MEDIUM |

### Website Conversions (Local SEO Traffic)
| Action | Tool to Track | Target | Priority |
|--------|---------------|--------|----------|
| Contact form submissions | GA4 Events | 15+/month | CRITICAL |
| Phone clicks (mobile) | GA4 Events | 25+/month | CRITICAL |
| Email clicks | GA4 Events | 10+/month | HIGH |
| Audit request form | GA4 Events | 10+/month | CRITICAL |
| Chat widget interactions | GA4 Events | 20+/month | MEDIUM |

### Revenue Tracking
| Metric | Tool to Track | Target (6 months) | Priority |
|--------|---------------|-------------------|----------|
| Local SEO attributed revenue | CRM + GA4 | $50,000+ | CRITICAL |
| Cost per lead (local SEO) | Calculation | <$50 | HIGH |
| ROI (local SEO) | Calculation | 300%+ | CRITICAL |

---

## 🛠️ Setup Guide - Google Analytics 4

### Step 1: Verify GA4 Installation

**Check if GA4 is installed:**
- Go to: https://analytics.google.com
- Look for property: theprofitplatform.com.au
- If exists: Note Measurement ID (format: G-XXXXXXXXXX)
- If not exists: Create new GA4 property

**To install GA4 on website:**
Add to `src/layouts/BaseLayout.astro` (before closing `</head>`):

```astro
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script is:inline>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Replace G-XXXXXXXXXX with your actual Measurement ID**

### Step 2: Set Up Conversion Events

**Navigate to:** GA4 → Admin → Events → Create Event

**Create 4 key events:**

1. **contact_form_submit** - Mark as conversion
2. **phone_click** - Mark as conversion
3. **email_click** - Mark as conversion
4. **audit_request** - Mark as conversion

### Step 3: Implement Event Tracking

**Add to contact form (after successful submission):**
```javascript
gtag('event', 'contact_form_submit', {
  'event_category': 'Lead Generation',
  'event_label': 'Contact Form',
  'value': 1
});
```

**Add to phone links:**
```html
<a href="tel:+61487286451" 
   onclick="gtag('event', 'phone_click', {'event_category': 'Lead Generation'});">
  +61 487 286 451
</a>
```

**Add to email links:**
```html
<a href="mailto:avi@theprofitplatform.com.au" 
   onclick="gtag('event', 'email_click', {'event_category': 'Lead Generation'});">
  avi@theprofitplatform.com.au
</a>
```

---

## 📊 Google Business Profile Tracking

### Daily Tracking (5 minutes)

**Navigate to:** GBP Dashboard → Insights → Customer Actions

**Track these metrics:**
| Metric | Location | Target |
|--------|----------|--------|
| Profile views | Insights → Overview | 500+/month |
| Phone calls | Insights → Calls | 20+/month |
| Direction requests | Insights → Directions | 30+/month |
| Website clicks | Insights → Website visits | 50+/month |
| Messages | Messages tab | 10+/month |

### Export Data Monthly

1. Log into GBP dashboard
2. Go to Insights → Performance
3. Set date range: Last 30 days
4. Screenshot or manually record metrics
5. Add to tracking spreadsheet

**Tools to automate:**
- GMB Everywhere (Chrome Extension - FREE)
- BrightLocal ($39/mo) - Auto-pulls GBP data

---

## 📞 Call Tracking Options

### Option A: Dynamic Call Tracking (Recommended)

**Best tools:**
- **CallRail** ($45/mo) - Most popular
- **CallTrackingMetrics** ($39/mo)
- **ResponseTap** ($50/mo)

**How it works:**
1. Get tracking number pool
2. Show different numbers by traffic source
3. Track which source drove each call
4. Integrate with GA4

### Option B: Manual Tracking (Free)

**Process:**
1. Ask every caller: "How did you find us?"
2. Log in spreadsheet:
   - Date, Caller, Source, Service Interest
3. Calculate leads by source monthly

---

## 📊 Revenue Attribution

### Method 1: CRM Integration (Recommended)

**Popular CRMs:**
- HubSpot (Free CRM)
- Pipedrive ($15/mo)
- Salesforce (Enterprise)

**Flow:**
1. Lead fills form → Capture source (hidden field)
2. CRM creates contact with source tag
3. Sales closes deal → Tag revenue to source
4. Report: "Local SEO = $25k revenue, $2k cost = 1,150% ROI"

### Method 2: Spreadsheet Tracking (Budget)

**Create tracking sheet:**
| Date | Lead Name | Source | Service | Deal Size | Status | Revenue |
|------|-----------|--------|---------|-----------|--------|---------|
| 10/5 | John Smith | Organic Local | SEO | $5,000 | Won | $5,000 |

**How to determine source:**
- Ask during sales call
- Check form hidden fields
- Review GA4 user journey

---

## 📊 Tracking Spreadsheet Templates

### Template 1: Monthly Conversion Summary
```
| Month | GBP Calls | GBP Clicks | Contact Forms | Phone Clicks | Total Leads | Cost | CPL |
|-------|-----------|------------|---------------|--------------|-------------|------|-----|
| Oct 2025 | 15 | 40 | 12 | 18 | 85 | $500 | $5.88 |
```

**Formulas:**
- Total Leads = SUM(all lead sources)
- CPL = Cost / Total Leads

### Template 2: ROI Calculator
```
| Month | Cost | Leads | Customers | Avg Deal | Revenue | ROI |
|-------|------|-------|-----------|----------|---------|-----|
| Oct 2025 | $500 | 85 | 13 | $4,500 | $58,500 | 11,600% |
```

**Formulas:**
- Revenue = Customers × Avg Deal
- ROI = ((Revenue - Cost) / Cost) × 100

---

## 🎯 Conversion Goals

### Month 1 (Baseline)
- [ ] Set up all tracking
- [ ] Record baseline data
- [ ] Target: 20+ total leads

### Month 3
- [ ] 50+ total leads
- [ ] <$20 cost per lead
- [ ] 10% conversion rate
- [ ] $15k+ revenue

### Month 6
- [ ] 100+ total leads
- [ ] <$15 cost per lead
- [ ] 15% conversion rate
- [ ] $50k+ revenue
- [ ] 500%+ ROI

---

## 🔄 Weekly Tracking Routine

### Monday (10 minutes)
- [ ] Check GBP insights (last 7 days)
- [ ] Check GA4 conversions (last 7 days)
- [ ] Update tracking spreadsheet

### Friday (15 minutes)
- [ ] Review week's leads
- [ ] Categorize by source
- [ ] Calculate week-over-week change

### Monthly (1 hour)
- [ ] Export all data (GBP, GA4)
- [ ] Calculate CPL, conversion rate, ROI
- [ ] Create monthly report

---

## ✅ Setup Completion Checklist

- [ ] GA4 installed and configured
- [ ] Conversion events created (4 events)
- [ ] Event tracking code added to site
- [ ] GBP insights review scheduled
- [ ] Call tracking method selected
- [ ] Revenue tracking method chosen
- [ ] Tracking spreadsheet created
- [ ] Weekly routine scheduled

---

**Last Updated:** October 5, 2025
**Owner:** Avi
**Review Frequency:** Weekly
