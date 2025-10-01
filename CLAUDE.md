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
- `src/styles/` - Stylesheets
- `scripts/` - Custom build and verification scripts for production parity
- `public/` - Static assets
- `dist/` - Generated build output (optimized HTML, CSS, JS with Cloudflare headers)

### Migration Context
This is a migrated site from static HTML to Astro. The root directory contains:
- Original HTML files (index.html, about.html, contact.html, etc.)
- Backup versions with `.backup-inline-styles` and `.footer-backup` suffixes
- Multiple deployment documentation files showing migration progress

### Production Parity System
The codebase includes sophisticated scripts to ensure the Astro build matches production:

1. **fetch-production.mjs** - Downloads current production HTML
2. **download-assets.mjs** - Downloads production assets (CSS, JS, images)
3. **parity-scan.mjs** - Compares CSS/JS load order and SEO meta tags between production and local build
4. **behavior-parity-scanner.mjs** - Advanced behavioral comparison

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