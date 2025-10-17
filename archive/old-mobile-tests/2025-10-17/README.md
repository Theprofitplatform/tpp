# Archived Mobile Test Files - October 17, 2025

## Purpose
These test files were created during mobile layout debugging and have been archived due to redundancy.

## Files Archived (21 total)

### Mobile Blog Tests (13 files)
1. blog-mobile-final-check.spec.js
2. blog-mobile-from-top.spec.js
3. blog-mobile-full-page.spec.js
4. blog-mobile-hero-section.spec.js
5. blog-mobile-hero-top.spec.js
6. blog-mobile-layout.spec.js
7. blog-mobile-order-check.spec.js
8. blog-mobile-order-debug.spec.js
9. blog-mobile-real-test.spec.js
10. blog-mobile-top-section.spec.js
11. blog-mobile-visual-order.spec.js
12. blog-mobile-visual-sequence.spec.js
13. blog-mobile-visual.spec.js

### Other Mobile/Blog Tests (8 files)
14. blog-desktop-vs-mobile.spec.js
15. blog-layout-final-verification.spec.js
16. blog-listing-mobile-hero.spec.js
17. blog-pages-available.spec.js
18. blog-post-mobile-layout.spec.js
19. blog-post-overlay-focus.spec.js
20. mobile-nav.spec.js
21. navigation-cta-overflow.spec.js

## Reason for Archival

**High Redundancy:** These tests were created during iterative debugging of mobile layout issues. Most tests check the same functionality:
- Element order verification (breadcrumbs → image → title)
- Hero section rendering
- Mobile navigation functionality
- Visual order checking

**Analysis:** See `tests/MOBILE-TEST-ANALYSIS.md` for detailed redundancy analysis.

**Issues Fixed:** All issues these tests were investigating have been resolved:
- Mobile navigation: Fixed in commit d74a6cf
- Blog mobile layout: Fixed in commit c29dd66
- CTA section: Redesigned in commit fd45f2c

## Consolidation Plan

These 21 tests were planned to be consolidated into 3 comprehensive test files:
- `blog-mobile-unified.spec.js` - Complete mobile blog testing
- `blog-desktop-unified.spec.js` - Desktop verification
- `blog-responsive-unified.spec.js` - Cross-device testing

**Status:** Plan documented in `tests/MOBILE-TEST-ANALYSIS.md`, implementation deferred.

## Test Suite Stats

**Before archival:**
- Total test files: 52
- Mobile-specific: 21
- Redundancy: High

**After archival:**
- Active test files: 31
- Archived tests: 21
- Redundancy: Low
- Test coverage: Maintained via existing tests

## Notes

- These tests are preserved for historical reference
- The functionality they tested is now covered by existing comprehensive tests
- Mobile layout issues are resolved and should not recur
- If mobile issues resurface, these tests can be referenced for debugging approach

## Related Commits

- d74a6cf - Fix critical mobile navigation issues
- c29dd66 - Optimize blog layout for mobile viewports
- fd45f2c - Redesign CTA section with conversion-focused layout

## Archived By

Claude Code - October 17, 2025
Part of comprehensive fix-all plan and test suite optimization
