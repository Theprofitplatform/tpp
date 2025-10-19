# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start local development server at `localhost:3001`
- `npm run build` - Build production site to `./dist/`
- `npm run preview` - Preview build locally before deploying

### Production Parity & Testing
- `npm run parity` - Full production parity check (fetch → download assets → build → scan)
- `npm run fetch:prod` - Fetch production HTML to `.cache/prod.html`
- `npm run assets:download` - Download production assets locally
- `npm run parity:scan` - Compare local build against production for CSS/JS order and SEO tags

### Deployment
- `npm run deploy` - Build and deploy to Cloudflare Pages
- `npm run deploy:auto` - Full parity check then deploy

## Architecture Overview

### Framework & Deployment
- **Framework**: Astro 5.x with static output mode
- **Deployment**: Cloudflare Pages
- **Site URL**: https://theprofitplatform.com.au

### Project Structure
- `src/pages/` - Astro pages (primarily index.astro with full site content)
- `src/layouts/` - Layout components (BaseLayout.astro with comprehensive SEO/performance optimization)
- `src/components/` - Reusable Astro components (Header with ARIA, Footer with contact links)
- `src/styles/` - Stylesheets (main.css consolidates all CSS for Astro bundling)
- `scripts/` - Custom build and verification scripts for production parity
- `public/` - Static assets
- `dist/` - Generated build output (optimized HTML, CSS, JS with Cloudflare headers)
- `archive/` - Legacy files (HTML, screenshots, test scripts) moved from root for organization

### Migration Context & Recent Optimizations
This is a migrated site from static HTML to Astro.

**Recent Performance Optimizations (2025-01):**
- Consolidated 22+ individual CSS `<link>` tags into Astro's bundling system (~91% reduction in CSS HTTP requests)
- Created `src/styles/main.css` that imports all CSS in correct order for optimal bundling
- Astro now generates optimized, hashed CSS files (e.g., `dist/_astro/about.Dz-KOsIw.css`)
- Improved parity-scan.mjs with configurable URLs via environment variables or CLI args
- Cleaned up root directory: moved legacy HTML files, utility scripts, and screenshots to `archive/`

### Production Parity System
The codebase includes scripts to ensure the Astro build matches production:

1. **parity-scan.mjs** - Compares CSS/JS load order and SEO meta tags between production and local build
   - Supports configurable URLs: `PROD_URL=https://... LOCAL_URL=http://... npm run parity:scan`
   - Or pass as CLI args: `node scripts/parity-scan.mjs <prod-url> <local-url>`

Note: Some parity scripts mentioned in package.json (fetch-production.mjs, download-assets.mjs) are not yet implemented.

### Cloudflare Pages Configuration
- **Config**: `wrangler.toml` with production environment
- **Deployment**: Automatic deployment from `dist/` directory via `npm run deploy`
- **Domain**: theprofitplatform.com.au
- **Build Output**: Static HTML/CSS/JS optimized for Cloudflare's edge network

## Development Workflow

When making changes:
1. Run `npm run parity` first to establish baseline
2. Make your changes
3. Run `npm run build` to test build
4. Run `npm run parity:scan` to verify no regressions
5. Use `npm run deploy:auto` for production deployment with verification

## Image Handling Guidelines - MANDATORY ENFORCEMENT

**⚠️ BREAKING THESE RULES CAUSES CONVERSATION-ENDING API ERRORS ⚠️**

Claude API limits (non-negotiable):
- **Max file size**: 5 MB
- **Max dimensions**: 8000 pixels (width or height)

**If an oversized image enters the conversation, the ENTIRE conversation dies. There is NO recovery except starting over.**

### REQUIRED Pre-Flight Checks

**Before EVERY screenshot or image read, you MUST:**

1. **For Chrome DevTools screenshots** - See `scripts/screenshot-helper.md` for complete guide:
   ```javascript
   // Step 1: ALWAYS resize browser first
   resize_page({ width: 1920, height: 1080 })  // Standard

   // Step 2: ALWAYS specify JPEG with quality
   take_screenshot({ format: "jpeg", quality: 75 })

   // ❌ NEVER use defaults: take_screenshot() ← THIS WILL BREAK!
   ```

2. **For reading image files** - MUST validate first:
   ```bash
   # REQUIRED: Check image before reading
   npm run image:check filename.png

   # If this fails, DO NOT READ THE FILE
   # Start a new conversation instead
   ```

### Screenshot Rules (MANDATORY)

**Standard screenshot:**
```javascript
resize_page({ width: 1920, height: 1080 })
take_screenshot({ format: "jpeg", quality: 75 })
```

**Element screenshot:**
```javascript
take_screenshot({ uid: "element-id", format: "jpeg", quality: 80 })
```

**Full-page screenshot (DANGER ZONE - use sparingly):**
```javascript
resize_page({ width: 1280, height: 800 })  // MUST resize smaller
take_screenshot({ fullPage: true, format: "jpeg", quality: 60 })  // MUST use lower quality
```

**NEVER:**
- ❌ `take_screenshot()` without parameters
- ❌ `take_screenshot({ fullPage: true })` without format/quality
- ❌ PNG format (default) - creates oversized images
- ❌ Quality > 75 for full-page screenshots
- ❌ Browser width > 1920px for full-page screenshots

### Choosing Between Text Snapshots and Screenshots

**Use text snapshots (`take_snapshot`) when:**
- Analyzing DOM structure or finding element UIDs for interaction
- Reading page content or checking if elements exist
- Automating interactions (clicks, filling forms)
- Functional testing (not visual/design testing)
- You need to interact with specific elements

**Use screenshots (`take_screenshot`) when:**
- Debugging visual/CSS issues (layout, alignment, spacing, colors)
- Verifying design implementation or responsive layouts
- User asks "how does it look?" or to see the page
- Visual QA, design reviews, or checking visual regressions
- Need proof of visual bugs (overlapping, broken styling, etc.)
- Analyzing what users actually see (UX verification)

**Key principle:** Text snapshots can't show visual bugs. If it's visual, screenshot it (with proper compression).

### Reading Image Files - REQUIRED VALIDATION

**MANDATORY: Validate BEFORE reading any image file:**

```bash
# Check single file
npm run image:check path/to/image.png

# Check all images in directory
npm run image:check-all
```

**What the validator checks:**
- File size (must be < 5MB)
- Image dimensions (must be < 8000px width/height)
- Warns if > 7000px (safe threshold)

**If validation fails:**
1. ❌ DO NOT READ THE FILE with Read tool
2. 🔄 Start a new conversation
3. 🛠️ Install ImageMagick to fix: `sudo apt-get install imagemagick`
4. 🔧 Then resize: `convert image.png -resize 7000x7000\> -quality 80 safe.jpg`

**Safe formats:** JPEG (quality 75-85) or WebP (quality 75-85)

### Example Safe Usage
```javascript
// For visual debugging (CSS, layout, design)
resize_page({ width: 1920, height: 1080 })
take_screenshot({ format: "jpeg", quality: 75 })

// For finding elements to interact with
take_snapshot()  // Get UIDs, then use click/fill/etc.

// Safe element screenshot (specific UI component)
take_screenshot({ uid: "element-123", format: "jpeg", quality: 80 })

// Safe full-page screenshot (if absolutely needed)
resize_page({ width: 1280, height: 800 })
take_screenshot({ fullPage: true, format: "jpeg", quality: 60 })

// Real-world examples:
// ❌ BAD: "Why is my header overlapping?" → take_snapshot() // Can't see overlap!
// ✅ GOOD: "Why is my header overlapping?" → take_screenshot() // See visual bug

// ✅ GOOD: "Click the submit button" → take_snapshot() // Get UID for clicking
// ❌ BAD: "Click the submit button" → take_screenshot() // Unnecessary image
```

### Available Validation Tools

This project has built-in image validation:

```bash
# Check specific images
npm run image:check image1.png image2.jpg

# Check all images in project root
npm run image:check-all

# Validation script location
node scripts/check-image-dimensions.mjs <files...>
```

### Recovery from Dimension Error

**If you see the dimension error:**

1. **STOP immediately** - The conversation is compromised
2. **Start a new conversation** - Oversized image is stuck in context
3. **In new conversation, validate first:**
   ```bash
   npm run image:check suspicious-file.png
   ```
4. **If validation fails:**
   - Install ImageMagick: `sudo apt-get install imagemagick`
   - Resize: `convert file.png -resize 7000x7000\> -quality 80 safe.jpg`
   - Validate again: `npm run image:check safe.jpg`
   - Only then read with Read tool

**Prevention is the only cure. Once the error occurs, the conversation cannot be saved.**

## Key Features Implemented

### Accessibility & UX
- **ARIA Navigation**: Header includes `aria-controls`, `aria-expanded`, `aria-hidden` attributes
- **Mobile Menu**: Accessible mobile navigation with proper focus management
- **Semantic HTML**: Proper roles and labels throughout

### Contact & Conversion
- **Clickable Contact Links**: Phone (`tel:+61487286451`) and email (`mailto:avi@theprofitplatform.com.au`)
- **Real Social Media**: Facebook, Instagram, LinkedIn with proper links
- **Contact Forms**: Comprehensive contact form with validation and honeypot spam protection

### SEO & Performance
- **JSON-LD Schemas**: LocalBusiness and FAQPage structured data
- **Meta Optimization**: Comprehensive OpenGraph, Twitter cards, geo tags
- **Resource Preloading**: Critical CSS/JS preloading with fallbacks
- **Performance Headers**: Cloudflare caching headers in `dist/_headers`

### Production Deployment
- **Cloudflare Pages**: Optimized routing configuration in `dist/_routes.json`
- **Minified Output**: Production builds are heavily optimized
- **Edge Network**: Global CDN distribution via Cloudflare

## Key Files to Understand

- `src/layouts/BaseLayout.astro` - Main layout with all SEO/performance optimization
- `src/components/Header.astro` - ARIA-enhanced navigation component
- `src/components/Footer.astro` - Contact-optimized footer component
- `scripts/parity-scan.mjs` - Production comparison logic
- `wrangler.toml` - Cloudflare Pages deployment configuration
- `dist/_headers` - Cloudflare caching and security headers
- `dist/_routes.json` - Cloudflare Pages routing configuration