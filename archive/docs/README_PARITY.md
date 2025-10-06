# Parity Guardrail System

Complete automated verification system that ensures your production site and preview deployments maintain parity across:

## ✅ What It Checks

### 1. CSS/JS Order Parity
- Verifies `<link>` and `<script>` tags load in identical order
- Catches build system inconsistencies

### 2. Behavior Verification
- **Counters**: Ensures stat counters animate (not stuck at 0)
- **Mobile Navigation**: Tests toggle functionality and aria-expanded changes
- **Contact Links**: Verifies `tel:` and `mailto:` links are present
- **404 Detection**: Scans for broken asset references

### 3. SEO Parity
- Title tag consistency
- Meta description matching
- Canonical URL verification
- Open Graph and Twitter Card presence

### 4. JSON-LD Structured Data
- Validates LocalBusiness schema
- Validates FAQPage schema
- Ensures both are present and parseable

### 5. Visual Parity
- Pixel-diff screenshots (production vs preview)
- Above-the-fold visual comparison
- Configurable mismatch threshold

### 6. Infrastructure
- Cache-Control headers on assets
- Asset delivery verification

## 🚀 Setup

```bash
# Run the setup script
./setup.sh

# Or manually:
npm install
npx playwright install --with-deps
```

## 📊 Usage

```bash
# Test Cloudflare Pages vs Production
npm run verify:cloudflare

# Test production vs preview URLs
npm run verify:prod-vs-preview

# Test local preview vs production
npm run verify:local
```

## 🎯 Environment Variables

```bash
PROD_URL="https://theprofitplatform.com.au/"
PREVIEW_URL="https://tpp.pages.dev/"
LOCAL_PREVIEW="http://localhost:4321/"
```

## 📈 Output

The verification outputs a detailed JSON report:

```json
{
  "PASS": true,
  "issues": [],
  "jsonldOK": true,
  "behavior": {
    "countersOK": true,
    "navOK": true,
    "contactOK": true,
    "no404": true,
    "bad": []
  },
  "visualMismatchPixels": 45,
  "cache": [
    {
      "u": "https://tpp.pages.dev/_astro/",
      "ok": true,
      "status": 200,
      "cache": "public, max-age=31536000"
    }
  ]
}
```

## 🔧 Files Created

```
scripts/
├── lib/
│   ├── http.js      # HTTP utilities (fetch, head requests)
│   ├── dom.js       # DOM parsing and comparison
│   ├── visual.js    # Screenshot and pixel diff
│   └── a11y.js      # Behavior and accessibility checks
└── verify.mjs       # Main verification runner

.github/workflows/
└── parity.yml       # CI automation

package.json         # Dependencies and npm scripts
setup.sh            # Setup automation
```

## 🚨 Common Issues & Fixes

### CSS/JS Order Mismatch
- Check build system configuration
- Verify identical bundling between environments
- Review script loading order in templates

### Counters Stuck at 0
- Move counter initialization after bundle loads
- Check for JavaScript errors blocking execution
- Verify animation triggers are working

### Mobile Nav Failing
- Check `aria-expanded` attribute updates
- Verify click handlers are attached
- Test mobile viewport behavior

### Missing JSON-LD
- Add LocalBusiness schema to head
- Add FAQPage schema for FAQ sections
- Validate JSON syntax

### Visual Differences
- Check font loading between environments
- Verify image optimization consistency
- Review responsive breakpoint behavior

### Missing Cache Headers
- Configure Cloudflare Pages cache rules
- Check asset delivery configuration
- Verify CDN settings

## 🎛 Configuration

Adjust thresholds in `scripts/verify.mjs`:

```javascript
// Visual diff tolerance (pixels)
const mismatch = diff("prod.png", "prev.png", "diff.png", 0.1);

// Pass threshold
const pass = mismatch < 500; // Lower = stricter

// Timeout for animations
await page.waitForTimeout(1200); // Increase for slower sites
```

## 🔄 CI Integration

The `.github/workflows/parity.yml` automatically runs verification on every push to main. Failed checks block deployment.

## 📞 Support

Review the generated screenshots and diff images:
- `prod.png` - Production screenshot
- `prev.png` - Preview screenshot
- `diff.png` - Visual differences highlighted

Exit codes:
- `0` - All checks passed
- `1` - One or more checks failed