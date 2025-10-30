# 🗺️ Google Maps API Fix Guide

**Issue**: All 50 location pages show: "Google Maps Platform rejected your request. The provided API key is invalid."

**Impact**: Maps not displaying, reduces credibility and user experience

**Status**: ⚠️ **REQUIRES ACTION** - Need valid API key

---

## 🔍 Problem Analysis

### Current Error
```
Google Maps Platform rejected your request. The provided API key is invalid.
```

### Where It Appears
- All pages under `/locations/*` (50 pages total)
- Map component in "Find Us" section
- Affects: Bondi, Parramatta, North Sydney, and all other suburb pages

### Why It Matters
✅ **Local Trust**: Maps help users verify you're a real local business  
✅ **User Experience**: Visitors expect to see where you're located  
✅ **SEO**: Google values businesses with accurate location information  
✅ **Conversions**: Maps make it easier for customers to find/contact you

---

## 🔧 How to Fix

### Step 1: Get Google Maps API Key (5 minutes)

#### Option A: Google Cloud Console (Recommended)

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create or Select Project**
   - Click project dropdown → "New Project"
   - Name: "The Profit Platform Website"
   - Click "Create"

3. **Enable Maps JavaScript API**
   - Go to: APIs & Services → Library
   - Search: "Maps JavaScript API"
   - Click "Maps JavaScript API"
   - Click "ENABLE"

4. **Create API Key**
   - Go to: APIs & Services → Credentials
   - Click "+ CREATE CREDENTIALS"
   - Select "API key"
   - Copy your new API key

5. **Restrict API Key (IMPORTANT for security)**
   - Click "Edit API key" (pencil icon)
   - Under "Application restrictions":
     - Select "HTTP referrers (web sites)"
     - Add referrer: `theprofitplatform.com.au/*`
     - Add referrer: `*.theprofitplatform.com.au/*`
   - Under "API restrictions":
     - Select "Restrict key"
     - Check only: "Maps JavaScript API"
   - Click "Save"

#### Option B: Quick Link
Direct link: https://console.cloud.google.com/google/maps-apis/start

---

### Step 2: Add API Key to Your Website

The API key needs to be configured in your Astro/React components that use Google Maps.

#### Find Where Maps Are Used

```bash
# Search for Google Maps usage
cd /path/to/tpp
grep -r "google.com/maps" src/
grep -r "GoogleMap" src/
grep -r "maps.googleapis.com" src/
```

#### Common Locations to Update

**1. Environment Variables** (Recommended)
```bash
# Add to .env.local
GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE

# Add to .env.production
GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

**2. Component Files**
Look for files like:
- `src/components/GoogleMap.astro`
- `src/components/LocationMap.astro`
- `src/layouts/LocationLayout.astro`

Update the API key reference:
```javascript
// Before
const apiKey = 'YOUR_API_KEY';

// After
const apiKey = import.meta.env.GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY';
```

**3. Inline Script Tags**
If maps are embedded directly in location pages:
```html
<!-- Before -->
<script src="https://maps.googleapis.com/maps/api/js?key=INVALID_KEY"></script>

<!-- After -->
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_KEY"></script>
```

---

### Step 3: Add to GitHub Secrets (for deployment)

1. **Go to GitHub Repository**
   - Visit: https://github.com/Theprofitplatform/tpp

2. **Add Secret**
   - Go to: Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `GOOGLE_MAPS_API_KEY`
   - Value: [paste your API key]
   - Click "Add secret"

3. **Update Build Configuration**
   
   If using Cloudflare Pages, add environment variable:
   - Cloudflare Dashboard → Pages → tpp → Settings → Environment variables
   - Variable name: `GOOGLE_MAPS_API_KEY`
   - Value: [paste your API key]
   - Click "Save"

---

### Step 4: Test & Deploy

#### Local Testing
```bash
# Build locally with API key
cd /path/to/tpp
npm run build

# Preview
npm run preview

# Open browser and check a location page
# Example: http://localhost:4321/locations/bondi/
```

#### Check Map Loads
1. Open browser console (F12)
2. Look for errors (should be none)
3. Map should display with marker
4. Zoom/pan should work

#### Deploy to Production
```bash
# Commit changes (if you modified files)
git add .
git commit -m "fix: Add Google Maps API key"
git push origin main

# Or trigger deployment
gh workflow run deploy.yml
```

---

## 💰 Cost Information

### Google Maps Pricing
- **Free Tier**: $200/month free credit
- **Maps JavaScript API**: $7 per 1,000 loads
- **Expected Usage**: ~1,000-5,000 map loads/month
- **Estimated Cost**: $0/month (within free tier)

### What's Included Free
✅ First 28,571 map loads/month ($200 credit ÷ $7)  
✅ Dynamic maps with markers  
✅ Zoom, pan, street view  
✅ Custom styling

---

## 🔒 Security Best Practices

### API Key Restrictions (CRITICAL)

**Never use unrestricted API keys!** They can be stolen and abused.

#### HTTP Referrer Restrictions
```
theprofitplatform.com.au/*
*.theprofitplatform.com.au/*
localhost:*/*  (for development only)
```

#### API Restrictions
Only enable:
- Maps JavaScript API
- (optional) Geocoding API if you use address lookup

#### What NOT to Do
❌ Don't commit API keys to Git  
❌ Don't use the same key for multiple sites  
❌ Don't skip restrictions  
❌ Don't share keys publicly

---

## 🐛 Troubleshooting

### Map Still Not Loading?

**1. Check Browser Console**
```javascript
// Look for these errors:
"InvalidKeyMapError" → API key is wrong
"RefererNotAllowedMapError" → Referrer restrictions too strict
"ApiNotActivatedMapError" → Need to enable Maps JavaScript API
```

**2. Verify API Key**
```bash
# Test API key (replace YOUR_KEY)
curl "https://maps.googleapis.com/maps/api/js?key=YOUR_KEY"

# Should return JavaScript code, not an error
```

**3. Check Restrictions**
- Go to Google Cloud Console → Credentials
- Click your API key
- Ensure referrer includes your domain
- Ensure Maps JavaScript API is allowed

**4. Clear Cache**
```bash
# Cloudflare cache
# Go to Cloudflare Dashboard → Caching → Purge Everything

# Browser cache
# Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

### Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "InvalidKeyMapError" | Wrong/missing API key | Check key is correct |
| "RefererNotAllowedMapError" | Referrer restrictions | Add your domain to restrictions |
| "ApiNotActivatedMapError" | API not enabled | Enable Maps JavaScript API |
| Map loads but marker missing | Coordinates wrong | Check lat/lng in frontmatter |
| Map is all gray | Billing not enabled | Set up billing (free tier available) |

---

## 📋 Quick Checklist

Before deploying the fix:

- [ ] Created Google Cloud project
- [ ] Enabled Maps JavaScript API
- [ ] Generated API key
- [ ] Added HTTP referrer restrictions
- [ ] Added API restrictions (Maps JavaScript only)
- [ ] Set up billing (to activate free $200 credit)
- [ ] Added key to environment variables
- [ ] Added key to GitHub secrets
- [ ] Added key to Cloudflare Pages env vars
- [ ] Tested locally (map displays correctly)
- [ ] Deployed to production
- [ ] Verified on live site
- [ ] Checked multiple location pages
- [ ] Confirmed no console errors

---

## 🎯 Expected Results

### After Fix Applied

**Before**:
```
❌ Google Maps Platform rejected your request.
```

**After**:
```
✅ Interactive Google Map displaying
✅ Marker showing business location
✅ Address visible
✅ Zoom/pan controls working
✅ Street view available
```

### What Users Will See
- Professional, interactive map
- Exact business location
- Easy-to-use navigation controls
- Option to get directions
- Street view of area
- Nearby landmarks visible

---

## 📊 Impact Assessment

### SEO Benefits
✅ **Local SEO Boost**: Google values complete location information  
✅ **Rich Snippets**: Maps can appear in search results  
✅ **User Signals**: Lower bounce rate when users find what they need  
✅ **Local Pack**: Increases chances of appearing in local 3-pack

### User Experience Benefits
✅ **Instant Visual**: Users see exactly where you are  
✅ **Directions**: Click-to-navigate on mobile  
✅ **Trust**: Professional presentation  
✅ **Context**: Nearby landmarks visible

### Business Benefits
✅ **More Visits**: Easier for customers to find you  
✅ **Better Conversions**: Clear location = more confidence  
✅ **Professional Image**: Shows attention to detail  
✅ **Mobile-Friendly**: Critical for mobile users

---

## 🔄 Alternative Solutions

### If You Don't Want to Use Google Maps

#### Option 1: OpenStreetMap (Free)
```html
<div id="map" style="height: 400px;"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  const map = L.map('map').setView([-33.8915, 151.2767], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
  L.marker([-33.8915, 151.2767]).addTo(map);
</script>
```

**Pros**: 100% free, no API key needed  
**Cons**: Less polished, fewer features

#### Option 2: Mapbox
- Similar to Google Maps
- First 50,000 loads/month free
- Get API key: https://www.mapbox.com/

#### Option 3: Static Map Image
```html
<img src="https://maps.googleapis.com/maps/api/staticmap?center=-33.8915,151.2767&zoom=13&size=600x400&markers=color:red%7C-33.8915,151.2767&key=YOUR_KEY" alt="Map showing location">
```

**Pros**: No JavaScript, faster loading  
**Cons**: Not interactive

---

## 📞 Need Help?

### Can't Get It Working?

**Option 1**: Check Google Maps Platform Status
- https://status.cloud.google.com/maps-platform

**Option 2**: Review Google Maps Documentation
- https://developers.google.com/maps/documentation/javascript

**Option 3**: Common Issues Guide
- https://developers.google.com/maps/documentation/javascript/error-messages

---

## ✅ Verification Steps

After implementing the fix, verify on these pages:

**Eastern Suburbs**:
- ✅ https://theprofitplatform.com.au/locations/bondi/
- ✅ https://theprofitplatform.com.au/locations/randwick/

**Western Sydney**:
- ✅ https://theprofitplatform.com.au/locations/parramatta/
- ✅ https://theprofitplatform.com.au/locations/penrith/

**North Shore**:
- ✅ https://theprofitplatform.com.au/locations/north-sydney/
- ✅ https://theprofitplatform.com.au/locations/chatswood/

**Test Checklist**:
1. Map loads without errors
2. Marker appears at correct location
3. Zoom/pan controls work
4. Street view available
5. Mobile responsive
6. No console errors

---

**Estimated Time to Fix**: 15-20 minutes  
**Difficulty**: Easy  
**Cost**: $0 (within free tier)  
**Priority**: HIGH (affects all 50 location pages)

