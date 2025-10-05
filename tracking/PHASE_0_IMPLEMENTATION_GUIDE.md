# Phase 0: Local SEO Tracking Implementation Guide
**The Profit Platform - 14-Day Setup Plan**
**Last Updated:** October 5, 2025

---

## 🎯 What is Phase 0?

Phase 0 is the **foundation** of your local SEO strategy. Before building citations, creating content, or pursuing links, you need **tracking systems** to measure success.

### Why Phase 0 Matters
- ❌ **Without tracking:** You're flying blind, can't prove ROI, wasting budget
- ✅ **With tracking:** Data-driven decisions, measurable results, scalable growth

### What You'll Build (14 Days)
1. **Google Business Profile tracking** - Monitor map pack performance
2. **Local rank tracking** - Measure keyword position improvements
3. **Citation tracking** - Ensure NAP consistency across web
4. **Conversion tracking** - Connect local SEO to revenue

---

## 📋 14-Day Implementation Checklist

### Week 1: Foundation Setup

#### **Day 1: GBP Audit & Baseline** (2 hours)
- [ ] Open `tracking/GBP_OPTIMIZATION_CHECKLIST.md`
- [ ] Log into Google Business Profile: https://business.google.com
- [ ] Complete "Pre-Optimization Audit" section:
  - Record current star rating: _____
  - Record current review count: _____
  - Record monthly views (last 30 days): _____
  - Record monthly searches: _____
- [ ] Take screenshots of current GBP profile (for before/after comparison)
- [ ] Decide: Physical office or Service Area Business (SAB)?
- [ ] If SAB: List service areas (10-15 suburbs max)

**Deliverable:** Completed audit section with baseline metrics recorded

---

#### **Day 2: NAP Standardization** (1 hour)
- [ ] Open `tracking/CITATION_TRACKER.md`
- [ ] Finalize exact NAP format (copy from section 2):
  ```
  Business Name: The Profit Platform
  Address: [Your decision from Day 1]
  Phone: +61 487 286 451
  Email: avi@theprofitplatform.com.au
  Website: https://theprofitplatform.com.au
  ```
- [ ] Verify this NAP matches:
  - [ ] Website footer (update if different)
  - [ ] BaseLayout.astro schema (check LocalBusiness schema)
  - [ ] Social media bios (Facebook, LinkedIn, Instagram)
- [ ] Create master NAP document (save as `tracking/OFFICIAL_NAP.txt`)

**Deliverable:** Single source of truth NAP format saved and verified

---

#### **Day 3: Citation Discovery** (2 hours)
- [ ] Google search: `"The Profit Platform" "Sydney"`
- [ ] Google search: `"+61 487 286 451"`
- [ ] Note all existing citations in spreadsheet
- [ ] Check each citation for NAP consistency:
  - ✅ Perfect match = no action needed
  - ❌ Inconsistent = flag for fixing
- [ ] Create Google Sheet "Citation Tracker" (template in CITATION_TRACKER.md)
- [ ] Document all findings

**Deliverable:** Complete list of existing citations with consistency status

---

#### **Day 4: Rank Tracking Setup** (1.5 hours)
- [ ] Open `tracking/LOCAL_RANK_TRACKER.md`
- [ ] Create Google Sheet "Rank Tracker" (use template from doc)
- [ ] Manual baseline rank check (incognito browser):
  - [ ] Google "digital marketing sydney" - note your position (or "not in top 50")
  - [ ] Google "seo sydney" - note position
  - [ ] Google "google ads agency sydney" - note position
  - [ ] Check map pack for same keywords - note position (or "not in top 3")
- [ ] Record all baseline ranks in spreadsheet
- [ ] Set calendar reminder: Weekly rank check (every Monday 9am)

**Deliverable:** Baseline ranks recorded, weekly tracking scheduled

---

#### **Day 5: Google Search Console Verification** (1 hour)
- [ ] Go to: https://search.google.com/search-console
- [ ] Verify property `theprofitplatform.com.au` is added
- [ ] If not added:
  - [ ] Add property
  - [ ] Verify ownership (DNS or HTML file method)
  - [ ] Wait 24-48 hours for data to populate
- [ ] Navigate to: Performance → Search Results
- [ ] Export last 30 days data (baseline)
- [ ] Note current:
  - Total clicks: _____
  - Total impressions: _____
  - Average CTR: _____
  - Average position: _____

**Deliverable:** GSC verified and baseline data exported

---

#### **Day 6: GA4 Conversion Setup** (2 hours)
- [ ] Open `tracking/CONVERSION_TRACKING_SETUP.md`
- [ ] Verify GA4 is installed:
  - [ ] Go to: https://analytics.google.com
  - [ ] Check if property exists for theprofitplatform.com.au
- [ ] If not installed:
  - [ ] Create GA4 property
  - [ ] Add GA4 tag to BaseLayout.astro (template in CONVERSION_TRACKING_SETUP.md)
  - [ ] Deploy to production
  - [ ] Test: Check Real-Time report shows your visit
- [ ] Create conversion events:
  - [ ] Event: `contact_form_submit`
  - [ ] Event: `phone_click`
  - [ ] Event: `email_click`
  - [ ] Event: `audit_request`

**Deliverable:** GA4 installed with 4 conversion events configured

---

#### **Day 7: Week 1 Review & Planning** (1 hour)
- [ ] Review all tracking systems created:
  - [x] GBP baseline recorded
  - [x] NAP standardized
  - [x] Citations discovered
  - [x] Rank tracking setup
  - [x] GSC verified
  - [x] GA4 configured
- [ ] Create "Week 2 Plan" (see below)
- [ ] Identify any blockers or missing items
- [ ] If everything complete: Celebrate progress! 🎉

**Deliverable:** Week 1 complete, Week 2 plan ready

---

### Week 2: Optimization & Automation

#### **Day 8: GBP Optimization - Business Info** (2 hours)
- [ ] Open `tracking/GBP_OPTIMIZATION_CHECKLIST.md` - Section "1. Business Information"
- [ ] Update GBP with exact NAP:
  - [ ] Business name: The Profit Platform (NO keywords)
  - [ ] Address: [As standardized on Day 2]
  - [ ] Phone: +61 487 286 451
  - [ ] Website: https://theprofitplatform.com.au
  - [ ] Hours: Set accurate hours
- [ ] Verify changes saved
- [ ] Take screenshot (after optimization)

**Deliverable:** GBP business info 100% accurate and consistent

---

#### **Day 9: GBP Optimization - Categories & Description** (1.5 hours)
- [ ] Open GBP → Info → Categories
- [ ] Set primary category: "Internet Marketing Service" (or closest match)
- [ ] Add secondary categories:
  - [ ] Marketing Agency
  - [ ] Advertising Agency
  - [ ] Website Designer
- [ ] Update business description:
  - [ ] Copy optimized template from GBP_OPTIMIZATION_CHECKLIST.md
  - [ ] Customize for your business model
  - [ ] Include keywords: Sydney, Local SEO, digital marketing
  - [ ] Max 750 characters
- [ ] Save and verify

**Deliverable:** GBP categories and description optimized

---

#### **Day 10: GBP Photos & Media** (2 hours)
- [ ] Prepare photos (or find stock images):
  - [ ] Logo: 1:1 ratio, min 720x720px
  - [ ] Cover photo: 16:9 ratio, min 1920x1080px
  - [ ] Team photos: 3-5 images
  - [ ] Service photos: 5-10 images (dashboards, results, websites)
- [ ] Name files with keywords:
  - `sydney-digital-marketing-agency-team.jpg`
  - `local-seo-services-results.jpg`
- [ ] Upload to GBP → Photos
- [ ] Set logo and cover photo
- [ ] Verify photos appear

**Deliverable:** 10+ photos uploaded with keyword-optimized filenames

---

#### **Day 11: Conversion Tracking Implementation** (3 hours)
- [ ] Open `tracking/CONVERSION_TRACKING_SETUP.md`
- [ ] Add event tracking to contact forms:
  - [ ] Find contact form in codebase
  - [ ] Add GA4 event on submission (template in doc)
  - [ ] Test: Submit form, check GA4 Real-Time events
- [ ] Add click tracking to phone/email:
  - [ ] Find phone links in Header/Footer
  - [ ] Add `onclick` GA4 event (template in doc)
  - [ ] Test: Click phone, check GA4 Real-Time events
- [ ] Deploy changes to production
- [ ] Test all events work live

**Deliverable:** All conversion events firing correctly in GA4

---

#### **Day 12: Call Tracking Decision** (1 hour)
- [ ] Review call tracking options in CONVERSION_TRACKING_SETUP.md
- [ ] Decide approach:
  - **Option A:** Dynamic call tracking (CallRail $45/mo) - Recommended if >20 calls/month expected
  - **Option B:** Manual tracking (free) - Ask callers "How did you find us?"
- [ ] If Option A:
  - [ ] Sign up for CallRail (or alternative)
  - [ ] Get tracking numbers
  - [ ] Install JS snippet
  - [ ] Test: Call tracking number, verify it forwards
- [ ] If Option B:
  - [ ] Create "Call Log" spreadsheet with columns: Date, Caller, Source, Service Interest
  - [ ] Train team to ask source question

**Deliverable:** Call tracking method implemented

---

#### **Day 13: Tracking Spreadsheet Setup** (2 hours)
- [ ] Create master tracking spreadsheet: "TPP Local SEO Dashboard"
- [ ] Create Sheet 1: "Monthly Summary" (template in CONVERSION_TRACKING_SETUP.md)
- [ ] Create Sheet 2: "Lead Attribution" (template in doc)
- [ ] Create Sheet 3: "ROI Calculator" (template in doc)
- [ ] Create Sheet 4: "Rank Tracker" (import from Day 4)
- [ ] Create Sheet 5: "Citation Tracker" (import from Day 3)
- [ ] Set up data validation and formulas
- [ ] Share with team (view/edit permissions)

**Deliverable:** Centralized tracking dashboard created

---

#### **Day 14: Phase 0 Final Review & Launch** (2 hours)
- [ ] Test all tracking end-to-end:
  - [ ] Submit contact form → Check GA4 event → Check appears in dashboard
  - [ ] Click phone number → Check GA4 event
  - [ ] Check GBP insights updating daily
  - [ ] Verify rank tracker spreadsheet complete
- [ ] Set up automated reminders:
  - [ ] Daily: Check GBP insights (5 min)
  - [ ] Weekly: Manual rank check + update spreadsheet (30 min)
  - [ ] Monthly: Full reporting + ROI calculation (2 hours)
- [ ] Document any issues/blockers
- [ ] Create "Phase 1 Readiness Checklist" (see below)

**Deliverable:** Phase 0 complete, ready for Phase 1 (Citation Building)

---

## ✅ Phase 0 Completion Checklist

### Tracking Systems Built:
- [ ] **GBP Tracking:** Baseline recorded, optimization checklist created
- [ ] **Rank Tracking:** Baseline ranks recorded, weekly tracking scheduled
- [ ] **Citation Tracking:** Existing citations discovered, NAP standardized
- [ ] **Conversion Tracking:** GA4 events firing, lead attribution setup
- [ ] **Call Tracking:** Method selected and implemented
- [ ] **Reporting:** Master dashboard created, team trained

### Verification Tests:
- [ ] GBP insights update daily (check 2 days in a row)
- [ ] GA4 conversion events fire correctly (test all 4 events)
- [ ] Rank tracker spreadsheet populated with baseline data
- [ ] Citation tracker lists all existing citations
- [ ] Weekly/monthly tracking routines scheduled in calendar

### Team Readiness:
- [ ] Team knows how to log leads in tracking spreadsheet
- [ ] Sales team asks "How did you find us?" on calls
- [ ] Weekly rank check routine assigned to team member
- [ ] Monthly reporting routine scheduled

---

## 📊 What Success Looks Like (30 Days After Phase 0)

### Tracking Metrics You'll Have:
- ✅ GBP performance tracked (views, calls, directions, clicks)
- ✅ Keyword rankings monitored weekly (know which keywords moving up/down)
- ✅ NAP consistency verified (all citations match exactly)
- ✅ Conversion data flowing (form submits, phone clicks, leads)
- ✅ Revenue attribution working (know which leads came from local SEO)

### Decisions You Can Now Make:
1. **Budget allocation:** "Local SEO drove 15 leads at $20 CPL → invest more"
2. **Keyword priority:** "Ranking #8 for 'seo sydney' drives 5 leads/month → push to #3"
3. **Content strategy:** "Service pages convert at 8% vs homepage at 2% → create more service pages"
4. **ROI proof:** "Local SEO cost $500, drove $15k revenue = 2,900% ROI → scale up"

---

## 🚀 Next Steps: Phase 1 Launch

Once Phase 0 is complete (all checkboxes ticked above), you're ready for:

### **Phase 1: Citation Building** (Month 2)
- Build Tier 1 citations (6 sites) with perfect NAP
- Add Tier 2 industry citations (5 sites)
- Start Tier 3 general directories (10 sites)
- **Goal:** 20+ citations with 100% NAP consistency

### **Phase 2: GBP Domination** (Month 2-3)
- Seed Q&A section (10-15 questions)
- Create 2 Google Posts per week
- Upload 2-3 photos per week
- Enable messaging + respond <1 hour

### **Phase 3: Content & Links** (Month 3-4)
- Create 5 high-quality location pages
- Publish 2-4 local SEO blog posts per month
- Acquire 5-10 local backlinks

**Full roadmap:** See `LOCAL_SEO_STRATEGY_V2.md`

---

## 🛠️ Tools Summary

### Free Tools (Phase 0):
- ✅ Google Business Profile - GBP tracking
- ✅ Google Search Console - Organic search data
- ✅ Google Analytics 4 - Conversion tracking
- ✅ Google Sheets - Centralized dashboards
- ✅ Chrome Incognito - Manual rank checks

### Paid Tools (Optional - Month 2+):
- **Local Falcon ($30/mo):** Map pack rank tracking
- **BrightLocal ($39/mo):** Citation building + tracking
- **CallRail ($45/mo):** Call tracking + attribution
- **Total:** $114/mo (if using all 3)

**Recommended Start:** Free tools only (Month 1) → Add paid tools Month 2+ as ROI proves out

---

## 📝 Daily/Weekly/Monthly Routines

### Daily (5 minutes)
- [ ] Check GBP insights (calls, directions, clicks)
- [ ] Respond to GBP messages (if enabled)
- [ ] Answer new Q&A questions
- [ ] Respond to reviews within 24 hours

### Weekly (30 minutes)
- [ ] Manual rank check (top 10 keywords)
- [ ] Update rank tracker spreadsheet
- [ ] Upload 2-3 new GBP photos
- [ ] Create 2 Google Posts
- [ ] Review week's leads in tracking dashboard

### Monthly (2 hours)
- [ ] Export GBP insights (30 days)
- [ ] Export GA4 conversion data (30 days)
- [ ] Update citation tracker (spot-check 10 citations)
- [ ] Calculate monthly ROI
- [ ] Create stakeholder report
- [ ] Adjust strategy based on data

---

## 🚨 Common Phase 0 Mistakes to Avoid

### 1. Inconsistent NAP
- ❌ Using different phone formats: +61 vs (04) vs 0487
- ✅ Use exact same NAP everywhere (copy/paste from master doc)

### 2. Skipping Baseline Metrics
- ❌ Starting optimization without recording "before" state
- ✅ Always record baseline before making changes (can't prove improvement otherwise)

### 3. Too Many Tools Too Soon
- ❌ Signing up for $500/mo in tools before proving ROI
- ✅ Start with free tools, add paid tools as revenue justifies

### 4. No Weekly Routine
- ❌ Setting up tracking but never checking it
- ✅ Calendar recurring reminders, assign ownership

### 5. Tracking Vanity Metrics
- ❌ Obsessing over impressions/views without tracking conversions
- ✅ Focus on: Leads, customers, revenue (metrics that matter)

---

## 📚 Support Resources

### Documentation Files:
- `tracking/GBP_OPTIMIZATION_CHECKLIST.md` - Complete GBP optimization guide
- `tracking/LOCAL_RANK_TRACKER.md` - Rank tracking setup and tools
- `tracking/CITATION_TRACKER.md` - Citation building and NAP consistency
- `tracking/CONVERSION_TRACKING_SETUP.md` - GA4 and revenue attribution
- `LOCAL_SEO_STRATEGY_V2.md` - Full 12-month local SEO strategy

### External Resources:
- **GBP Help:** https://support.google.com/business
- **GA4 Help:** https://support.google.com/analytics
- **GSC Help:** https://support.google.com/webmasters
- **Local SEO Guide:** https://moz.com/learn/seo/local
- **BrightLocal Blog:** https://brightlocal.com/blog

---

## ✅ Final Checklist - Am I Ready for Phase 1?

**Answer YES to all questions below:**

- [ ] I have baseline GBP metrics recorded (views, calls, clicks)
- [ ] I have baseline keyword ranks recorded (at least top 10 keywords)
- [ ] I have standardized NAP documented and verified across website
- [ ] I have GA4 conversion events firing correctly (tested)
- [ ] I have centralized tracking dashboard created (Google Sheets)
- [ ] I have weekly/monthly tracking routines scheduled in calendar
- [ ] I can currently answer: "How many local SEO leads did we get last week?"
- [ ] I can currently answer: "What's our cost per lead from local SEO?"
- [ ] My team knows how to log leads with source attribution
- [ ] I'm committed to checking tracking data weekly (minimum)

**If 10/10 YES:** Phase 0 complete! 🎉 Begin Phase 1 (Citation Building)

**If <10 YES:** Review incomplete items, complete them before Phase 1

---

## 🎯 30-Day Phase 0 Goals

By the end of Phase 0 (Day 14-30), you should have:

### Tracking Infrastructure:
- ✅ All tracking systems built and tested
- ✅ Baseline metrics recorded across all channels
- ✅ Weekly/monthly routines established and followed

### Data You'll Have:
- ✅ 14-30 days of GBP insights data
- ✅ 14-30 days of GA4 conversion data
- ✅ 2-4 weeks of rank tracking data
- ✅ Complete citation inventory with consistency status

### ROI Proof (Early Indicators):
- ✅ 10+ leads generated from local SEO (tracked)
- ✅ Cost per lead calculated (even if rough estimate)
- ✅ 1-2 customers attributed to local SEO (if sales cycle short)
- ✅ Baseline ROI calculated (or projected based on lead value)

---

**Phase 0 Duration:** 14 days (setup) + 14-30 days (data collection) = 30-45 days total

**Budget Required:** $0-114/mo (depending on tool choices)

**Time Investment:**
- Setup: 2-3 hours/day (Week 1-2)
- Maintenance: 30 min/week (ongoing)
- Reporting: 2 hours/month (ongoing)

**Next Action:** Begin Day 1 → Open `tracking/GBP_OPTIMIZATION_CHECKLIST.md` and start audit

---

**Last Updated:** October 5, 2025
**Owner:** Avi
**Status:** Ready to implement
