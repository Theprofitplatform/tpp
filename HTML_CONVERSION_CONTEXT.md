# HTML to Astro Conversion Context

## Project Overview
Converting static HTML files to Astro pages for The Profit Platform website.
Current deployment: https://5ce9aac0.tpp-new.pages.dev

## Successfully Completed
✅ pricing.astro - Fully converted with clean header/footer (NO homepage sections)

## Critical Requirements

### 1. Header & Footer Usage
- **MUST** use components: `import Header from '../components/Header.astro'` and `import Footer from '../components/Footer.astro'`
- **DO NOT** copy header/footer HTML from the HTML files
- Header and Footer are already perfect - just import them

### 2. BaseLayout Structure
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';

const pageTitle = "Page Name | The Profit Platform";
---

<BaseLayout title={pageTitle}>
  <Header />
  
  <!-- Page-specific CSS -->
  <link rel="stylesheet" href="/css/page-specific.css">
  
  <!-- Main content ONLY (no header/footer HTML) -->
  <main id="main-content" role="main">
    <!-- Content from HTML file goes here -->
  </main>
  
  <Footer />
  
  <!-- Page-specific scripts ONLY -->
  <script src="/js/page-specific.js" defer is:inline></script>
</BaseLayout>
```

### 3. What to Extract from HTML Files
- ✅ Content inside `<main>` tag
- ✅ Page-specific `<style>` blocks → save to `/public/css/[page]-styles.css`
- ✅ Page-specific `<script>` blocks → keep inline or extract
- ✅ Update links: `*.html` → `/page-name`

### 4. What NOT to Include
- ❌ `<header>` HTML (use component)
- ❌ `<footer>` HTML (use component)  
- ❌ `component-loader.js` (causes homepage injection)
- ❌ `emergency-fixes-loader.js` (causes homepage injection)
- ❌ `consolidated.js` (unless needed for page functionality)

### 5. Files to Convert (Priority Order)

**High Priority:**
1. seo.html → src/pages/seo.astro
2. google-ads.html → src/pages/google-ads.astro
3. web-design.html → src/pages/web-design.astro (already exists in services/)
4. services.html → src/pages/services.astro (already exists)
5. about.html → src/pages/about.astro (already exists)
6. contact.html → src/pages/contact.astro (already exists)

**Medium Priority:**
7. disclaimer.html → src/pages/disclaimer.astro
8. privacy.html or privacy-policy.html → src/pages/privacy.astro (already exists)
9. terms.html → src/pages/terms.astro (already exists)
10. portfolio.html → src/pages/portfolio.astro (already exists)

**Low Priority (Landing Pages/Tests):**
11. google-ads-landing.html
12. landingpage.html
13. seo-dashboard.html
14. monitoring-dashboard.html
15. icon-animation-test.html
16. schema-testing.html

## CSS Files Location
- Source: `/css/` (root directory)
- Destination: `/public/css/`
- Already copied: pricing-enhanced.css, web-design-enhanced.css, seo-ultra.css

## Existing Astro Pages to Check
Before converting, verify if page already exists:
```bash
ls src/pages/*.astro
ls src/pages/services/*.astro
```

## Testing Requirement
After conversion, verify NO homepage sections appear:
- Should NOT have: `hero-modern`, `trust-signals-section`, `services section animate-on-scroll`
- Should ONLY have: page-specific sections

## Example: pricing.astro (Reference)
Located at: `/mnt/c/Users/abhis/projects/atpp/tpp/src/pages/pricing.astro`
- 458 lines
- Uses Header/Footer components
- Clean separation of concerns
- Only 3 scripts: pricing-enhanced.js, pricing-ultra.js, AOS

## Commands
- Build: `npm run build`
- Deploy: `npm run deploy`
- Verify: Use Playwright to check sections on deployed page
