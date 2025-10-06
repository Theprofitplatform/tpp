# Phase 2 Performance Optimization Plan

## Current Status: 63/100 Mobile (Target: 80+)

### ✅ Phase 1 Complete (52→63)
- Dashboard image: 1.76MB → 19KB ✅
- Removed animate.css: -72KB ✅
- **Result: +11 points**

### 🎯 Phase 2 Issues Identified

#### **Issue #1: Logo Loaded Twice (High Priority)**
**Impact**: 256KB total (128KB × 2), both with `fetchpriority="high"`

**Locations**:
1. `src/components/Header.astro` - Desktop nav
2. `src/components/Header.astro` - Mobile nav

**Current**:
```html
<!-- Desktop -->
<img src="https://storage.googleapis.com/...68b56f6e09148075ab5016df.png"
     fetchpriority="high" width="150" height="77">

<!-- Mobile -->
<img src="https://storage.googleapis.com/...68b56f6e09148075ab5016df.png"
     width="120" height="62" loading="lazy">
```

**Solution** (5 points):
1. Optimize logo: 128KB PNG → 10KB WebP + 15KB PNG fallback
2. Use same optimized logo in both nav instances
3. Keep `fetchpriority="high"` on desktop only
4. Use `loading="lazy"` on mobile nav (hidden by default)

**Commands**:
```bash
# Download and optimize logo
curl -o /tmp/logo.png "https://storage.googleapis.com/...68b56f6e09148075ab5016df.png"
node scripts/optimize-logo.js  # Create this script
```

---

#### **Issue #2: Render-Blocking Resources**
**Impact**: 1.24s delay (Font Awesome + Google Fonts)

**Current Problems**:
```html
<!-- Blocks render -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" media="all">

<!-- Preload strategy not working effectively -->
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter..." as="style">
```

**Solution A** - Font Awesome Subset (Medium effort, 3 points):
- Audit actual icon usage (currently 1,041 uses across 44 files)
- Likely only 20-30 unique icons actually used
- Create subset: 102KB → 10KB

**Solution B** - Defer Font Awesome (Low effort, 2 points):
```html
<link rel="preload" href="..." as="style" onload="this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="..."></noscript>
```

---

#### **Issue #3: Unused JavaScript (1.05s potential)**
**Location**: `src/layouts/BaseLayout.astro:112-190`

**Current**: Heavy inline analytics in `<head>`:
- Google Analytics tracking
- Hotjar tracking
- Scroll depth tracking
- Form submission tracking
- Outbound link tracking

**Problem**: All executed synchronously in `<head>`, blocking render

**Solution** (3 points):
Move analytics to external file loaded with `defer`:
```html
<!-- Instead of inline in head -->
<script defer src="/js/analytics.js"></script>
```

---

#### **Issue #4: Social Media Images Not Optimized**
**Meta tags reference**:
```html
<meta property="og:image" content="https://.../wp-content/uploads/.../Growth-Dashboard-1.png">
```

This is different from the dashboard image we optimized. Could be another large PNG.

**Solution** (1 point):
Update OG image to use optimized version:
```html
<meta property="og:image" content="https://theprofitplatform.com.au/images/dashboard-optimized.png">
```

---

### 📊 Phase 2 Expected Results

| Fix | Effort | Points | Risk |
|-----|--------|--------|------|
| Optimize logo (2 instances) | Low | +5 | Very Low |
| Defer Font Awesome | Low | +2 | Very Low |
| Extract analytics to defer | Low | +3 | Very Low |
| Update OG image meta tag | Low | +1 | None |
| **TOTAL QUICK WINS** | **1 hour** | **+11** | **Very Low** |
| | | | |
| Font Awesome subset | High | +3 | Medium |
| CSS consolidation | High | +5 | High |

**Realistic Target**: 63 + 11 = **74 points** (1 hour work)

---

### 🚀 Phase 2 Implementation (Safe Fixes Only)

#### **Fix 1: Optimize Logo**
```bash
# Create optimization script
cat > scripts/optimize-logo.js << 'EOF'
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const input = '/tmp/logo-original.png';
const outputDir = join(__dirname, '../public/images');

async function optimizeLogo() {
  const image = sharp(input);

  // WebP for modern browsers
  await image
    .resize(150, null, { withoutEnlargement: true })
    .webp({ quality: 90 })
    .toFile(join(outputDir, 'logo-optimized.webp'));

  // PNG fallback
  await image
    .resize(150, null, { withoutEnlargement: true })
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(join(outputDir, 'logo-optimized.png'));

  console.log('✅ Logo optimized');
}

optimizeLogo();
EOF

node scripts/optimize-logo.js
```

#### **Fix 2: Update Header.astro**
Replace both logo instances with:
```html
<picture>
  <source srcset="/images/logo-optimized.webp" type="image/webp">
  <img src="/images/logo-optimized.png" alt="The Profit Platform Logo"
       width="150" height="77" fetchpriority="high">
</picture>
```

#### **Fix 3: Defer Font Awesome**
In `BaseLayout.astro`:
```html
<!-- Change from -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" media="all">

<!-- To -->
<link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" as="style" onload="this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"></noscript>
```

#### **Fix 4: Extract Analytics**
Create `public/js/analytics.js` with current inline scripts, load with defer.

---

### ⚠️ What NOT to do (High Risk)

1. **DON'T** refactor CSS consolidation yet (requires architectural changes)
2. **DON'T** tree-shake Font Awesome yet (need proper audit first)
3. **DON'T** self-host Google Fonts (diminishing returns, adds complexity)
4. **DON'T** remove Hotjar/Analytics (business requirement)

---

### 🎯 Recommended Action

**Do you want me to implement Phase 2 quick wins now?**

This will:
- Optimize logo (same approach as dashboard)
- Defer Font Awesome
- Extract analytics to external file
- Update OG meta tags

**Time**: 20 minutes
**Expected**: 63 → 74 points (+11)
**Risk**: Very low (same techniques as Phase 1)
