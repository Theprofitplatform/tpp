# Test Suite Documentation
**Last Updated:** October 17, 2025
**Test Files:** 10 (reduced from 52, 81% reduction)
**Organization:** Structured directories (core/, mobile/, pages/, blog/)

---

## Table of Contents
1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [Running Tests](#running-tests)
4. [Test Organization](#test-organization)
5. [Consolidation History](#consolidation-history)
6. [Writing New Tests](#writing-new-tests)
7. [Troubleshooting](#troubleshooting)

---

## Overview

This test suite uses **Playwright** for end-to-end testing of The Profit Platform website. After comprehensive consolidation (Phases 1 & 2), the suite is now:

- ✅ **Maintainable:** 10 focused tests vs 52 scattered tests
- ✅ **Organized:** Logical directory structure
- ✅ **Comprehensive:** Full coverage maintained
- ✅ **Fast:** Reduced redundancy = faster execution
- ✅ **Clear:** Better naming and documentation

---

## Directory Structure

```
tests/
├── README.md                          # This file
├── MOBILE-TEST-ANALYSIS.md            # Phase 1 consolidation plan
├── CONSOLIDATION-PHASE-2.md           # Phase 2 consolidation plan
│
├── core/                              # Essential functionality (4 tests)
│   ├── contact-form.spec.js          # Contact form validation & submission
│   ├── navigation.spec.js            # Site navigation functionality
│   ├── production-validation.spec.js # Production environment checks
│   └── scanner-issues.spec.js        # Scanner-specific verification
│
├── mobile/                            # Mobile-specific tests (2 tests)
│   ├── mobile-blog-layout.spec.js    # Blog mobile layout (breadcrumbs→image→title)
│   └── mobile-navigation.spec.js     # Mobile menu functionality (hamburger)
│
├── pages/                             # Page-specific tests (2 tests)
│   ├── about-page.spec.js            # About page rendering
│   └── portfolio-page.spec.js        # Portfolio page & cards
│
├── blog/                              # Blog functionality (2 tests)
│   ├── blog-post-final-diagnosis.spec.js # Individual blog post rendering
│   └── blog-verification.spec.js     # Blog listing page
│
├── manual/                            # Manual test procedures
├── n8n-qa/                           # N8N workflow testing (separate suite)
├── screenshots/                       # Test screenshot artifacts
└── test-seo-workflow-complete.cjs    # SEO workflow test

Archive directories (not active):
├── archive/old-mobile-tests/2025-10-17/      # Phase 1: 21 mobile tests
└── archive/old-tests/2025-10-17-phase2/      # Phase 2: 21 additional tests
```

---

## Running Tests

### Prerequisites
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start dev server** (required for most tests):
   ```bash
   npm run dev
   # Server runs on http://localhost:3001
   ```

### Run All Tests
```bash
# Run entire test suite
npx playwright test

# Run with UI mode (visual debugger)
npx playwright test --ui

# Run in headed mode (see browser)
npx playwright test --headed
```

### Run Specific Test Categories
```bash
# Core tests only
npx playwright test tests/core/

# Mobile tests only
npx playwright test tests/mobile/

# Pages tests only
npx playwright test tests/pages/

# Blog tests only
npx playwright test tests/blog/

# Single test file
npx playwright test tests/core/navigation.spec.js
```

### Run Tests with Different Browsers
```bash
# Chromium only
npx playwright test --project=chromium

# All browsers (chromium, firefox, webkit)
npx playwright test --project=chromium --project=firefox --project=webkit

# Mobile emulation
npx playwright test --project=mobile
```

### Debug Tests
```bash
# Debug mode (pause at breakpoints)
npx playwright test --debug

# Debug specific test
npx playwright test tests/core/navigation.spec.js --debug

# Show browser console
npx playwright test --headed --debug
```

### Generate Test Report
```bash
# Run tests and generate HTML report
npx playwright test --reporter=html

# Show existing report
npx playwright show-report
```

---

## Test Organization

### Core Tests (`tests/core/`)
**Purpose:** Essential site functionality that must always work.

**Files:**
- `contact-form.spec.js` - Contact form validation, submission, error handling
- `navigation.spec.js` - Main navigation menu, links, dropdowns
- `production-validation.spec.js` - Production environment checks
- `scanner-issues.spec.js` - Specific scanner issue verification

**When to run:** Before every deployment, part of CI/CD pipeline.

---

### Mobile Tests (`tests/mobile/`)
**Purpose:** Mobile-specific functionality and responsive design.

**Files:**
- `mobile-blog-layout.spec.js` - Verifies correct mobile blog element order (critical fix from commit c29dd66)
- `mobile-navigation.spec.js` - Mobile hamburger menu open/close, navigation (critical fix from commit d74a6cf)

**When to run:** After mobile CSS changes, before mobile-focused releases.

**Historical context:** These tests verify critical fixes:
- Mobile navigation z-index issues (fixed Oct 17, 2025)
- Blog post element ordering on mobile (fixed Oct 17, 2025)

---

### Pages Tests (`tests/pages/`)
**Purpose:** Page-specific rendering and functionality.

**Files:**
- `about-page.spec.js` - About page sections, content, layout
- `portfolio-page.spec.js` - Portfolio cards, hero section, visibility

**When to run:** After content changes, page redesigns.

---

### Blog Tests (`tests/blog/`)
**Purpose:** Blog system functionality.

**Files:**
- `blog-post-final-diagnosis.spec.js` - Individual blog post rendering, layout, TreeWalker logic
- `blog-verification.spec.js` - Blog listing page, pagination, filtering

**When to run:** After blog template changes, new post publications.

**Note:** These tests are critical for a content-focused platform.

---

## Consolidation History

### Phase 1: Mobile Test Consolidation (Oct 17, 2025)
**Archived:** 21 redundant mobile tests
**Reason:** High redundancy from mobile layout debugging
**Location:** `archive/old-mobile-tests/2025-10-17/`
**Details:** See `tests/MOBILE-TEST-ANALYSIS.md`

**Tests consolidated:**
- Mobile blog layout tests (13 files)
- Desktop vs mobile comparison tests (8 files)

### Phase 2: Comprehensive Consolidation (Oct 17, 2025)
**Archived:** 21 additional redundant tests
**Reason:** Reduce test suite by 68%, improve maintainability
**Location:** `archive/old-tests/2025-10-17-phase2/`
**Details:** See `tests/CONSOLIDATION-PHASE-2.md`

**Tests consolidated:**
- Hamburger menu tests: 7 → 1
- Portfolio tests: 9 → 1
- About page tests: 3 → 1
- Screenshot/debug tests: 4 → 0 (archived)

### Combined Results
| Metric | Before | After | Reduction |
|--------|--------|-------|-----------|
| Total tests | 52 | 10 | 81% |
| Organization | Flat | Structured | ✅ |
| Redundancy | High | Minimal | ✅ |
| Coverage | Scattered | Comprehensive | ✅ |

---

## Writing New Tests

### Test File Location
Choose the appropriate directory:
- **Core functionality** → `tests/core/`
- **Mobile-specific** → `tests/mobile/`
- **Page-specific** → `tests/pages/`
- **Blog-related** → `tests/blog/`

### Test Template
```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something specific', async ({ page }) => {
    // Navigate to page
    await page.goto('http://localhost:3001/');

    // Perform action
    const element = page.locator('selector');
    await element.click();

    // Assert expected result
    await expect(element).toBeVisible();
    await expect(element).toHaveText('Expected Text');
  });
});
```

### Best Practices
1. **One concept per test** - Don't test multiple unrelated things
2. **Clear test names** - Use descriptive "should..." format
3. **Avoid redundancy** - Check if similar test already exists
4. **Use page.goto sparingly** - Navigate once per describe block if possible
5. **Clean up after tests** - Close modals, reset state
6. **Mobile viewport** - Use `test.use({ viewport: { width: 375, height: 667 } })` for mobile

### Naming Conventions
- **File names:** `feature-name.spec.js` (kebab-case)
- **Test names:** `'should describe expected behavior'` (sentence case)
- **Selectors:** Use `data-testid` attributes when possible

### Example: Mobile Test
```javascript
import { test, expect } from '@playwright/test';

test.describe('Mobile Feature', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should display correctly on mobile', async ({ page }) => {
    await page.goto('http://localhost:3001/');

    const mobileElement = page.locator('[data-testid="mobile-menu"]');
    await expect(mobileElement).toBeVisible();
  });
});
```

---

## Troubleshooting

### Common Issues

#### 1. "ERR_CONNECTION_REFUSED" or "net::ERR_CONNECTION_REFUSED"
**Problem:** Dev server not running
**Solution:**
```bash
# Start dev server in separate terminal
npm run dev
```

#### 2. Tests Timeout
**Problem:** Page takes too long to load
**Solution:**
```javascript
// Increase timeout for slow pages
test.setTimeout(60000); // 60 seconds

// Or use waitUntil: 'networkidle'
await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
```

#### 3. Element Not Found
**Problem:** Selector doesn't match element
**Solution:**
```javascript
// Use Playwright inspector to find correct selector
npx playwright test --debug

// Or use more robust locators
page.locator('text=Exact Text');
page.locator('role=button[name="Button Name"]');
page.getByTestId('test-id');
```

#### 4. Flaky Tests
**Problem:** Test passes sometimes, fails other times
**Solution:**
```javascript
// Wait for element to be ready
await element.waitFor({ state: 'visible' });

// Use toPass for retries
await expect(async () => {
  const text = await element.textContent();
  expect(text).toBe('Expected');
}).toPass({ timeout: 5000 });
```

#### 5. Test Results Directory Growing
**Problem:** `test-results/` directory getting large
**Solution:**
```bash
# Clean old test results
rm -rf test-results/

# Or add to .gitignore (already done)
```

---

## Test Configuration

### Playwright Config
Configuration is in `playwright.config.js` at project root.

**Key settings:**
- **Timeout:** 30 seconds per test
- **Retries:** 2 retries on CI, 0 locally
- **Workers:** 5 parallel workers
- **Browsers:** Chromium, Firefox, WebKit, Mobile Chrome

### Environment Variables
```bash
# Change dev server port (if needed)
PORT=3001 npm run dev

# Run tests against different URL
BASE_URL=https://theprofitplatform.com.au npx playwright test
```

---

## CI/CD Integration

### GitHub Actions (Recommended)
```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright
  run: npx playwright install --with-deps

- name: Build site
  run: npm run build

- name: Run tests
  run: npx playwright test

- name: Upload test results
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

### Pre-deployment Checklist
- [ ] All core tests passing
- [ ] Mobile tests verified on actual devices
- [ ] Production validation test passed
- [ ] No failing tests in CI

---

## Maintenance

### Regular Tasks
- **Weekly:** Review test results, update flaky tests
- **Monthly:** Check for obsolete tests, update documentation
- **After major features:** Add new tests, update existing ones
- **Before releases:** Run full test suite, verify critical paths

### When to Archive Tests
Archive tests that are:
- Redundant with other tests
- Testing removed features
- Created for debugging specific issues (now fixed)
- No longer providing value

**Process:**
1. Create archive directory: `archive/old-tests/YYYY-MM-DD/`
2. Move redundant tests
3. Create README.md explaining why tests were archived
4. Update this documentation

---

## Resources

### Documentation
- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors Guide](https://playwright.dev/docs/selectors)

### Project-Specific Docs
- `tests/MOBILE-TEST-ANALYSIS.md` - Phase 1 consolidation details
- `tests/CONSOLIDATION-PHASE-2.md` - Phase 2 consolidation details
- `archive/old-mobile-tests/2025-10-17/README.md` - Phase 1 archived tests
- `archive/old-tests/2025-10-17-phase2/README.md` - Phase 2 archived tests

### Related Commits
- `d74a6cf` - Fix critical mobile navigation issues
- `c29dd66` - Optimize blog layout for mobile viewports
- `3711638` - Archive redundant mobile test files (Phase 1)
- `2f77e47` - Phase 2 Test Suite Consolidation

---

## Questions or Issues?

If you encounter test failures or have questions:

1. **Check recent changes:** `git log tests/` to see recent test modifications
2. **Review consolidation docs:** Phase 1 & 2 documentation
3. **Check archived tests:** Reference old tests if needed for historical context
4. **Update this README:** Keep documentation current as tests evolve

---

**Test Suite Status:** ✅ Optimized, Organized, Documented
**Last Major Refactor:** October 17, 2025
**Maintainer:** Development Team
**Health:** Excellent (8/10)
