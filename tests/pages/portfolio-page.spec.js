import { test, expect } from '@playwright/test';

test.describe('Portfolio Page - Design & Content', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to portfolio page
    await page.goto('http://localhost:3006/portfolio/');
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    // Wait for JavaScript to initialize
    await page.waitForTimeout(1500);
  });

  test('should load portfolio page successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Portfolio.*The Profit Platform/);

    // Check hero section is visible
    const heroTitle = page.locator('.hero-title');
    await expect(heroTitle).toBeVisible();
    await expect(heroTitle).toContainText('Success Stories');
  });

  test('should display all 6 portfolio projects', async ({ page }) => {
    // Count portfolio cards
    const portfolioCards = page.locator('.portfolio-card');
    await expect(portfolioCards).toHaveCount(6);

    // Check first project has required elements
    const firstCard = portfolioCards.first();
    await expect(firstCard.locator('.project-title')).toBeVisible();
    await expect(firstCard.locator('.project-excerpt')).toBeVisible();
    await expect(firstCard.locator('.project-results')).toBeVisible();
    await expect(firstCard.locator('.result-number')).toHaveCount(2);
  });

  test('should have working filter functionality', async ({ page }) => {
    // Check all filter buttons exist
    const filterButtons = page.locator('.filter-pill');
    await expect(filterButtons).toHaveCount(4); // All, SEO, Ads, Web

    // Initial state - "All" should be active
    const allButton = page.locator('.filter-pill[data-filter="all"]');
    await expect(allButton).toHaveClass(/active/);

    // All 6 projects should be visible
    let visibleCards = page.locator('.portfolio-card:not(.filtered-out)');
    await expect(visibleCards).toHaveCount(6);
  });

  test('should filter projects by SEO', async ({ page }) => {
    // Click SEO filter
    const seoButton = page.locator('.filter-pill[data-filter="seo"]');
    await seoButton.click();

    // Wait for animation
    await page.waitForTimeout(500);

    // Check active state
    await expect(seoButton).toHaveClass(/active/);

    // Count visible cards
    const visibleCards = page.locator('.portfolio-card:not(.filtered-out)');
    const count = await visibleCards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(6);
  });

  test('should filter projects by Google Ads', async ({ page }) => {
    // Click Ads filter
    const adsButton = page.locator('.filter-pill[data-filter="ads"]');
    await adsButton.click();

    // Wait for animation
    await page.waitForTimeout(500);

    // Check active state
    await expect(adsButton).toHaveClass(/active/);

    // Count visible cards
    const visibleCards = page.locator('.portfolio-card:not(.filtered-out)');
    const count = await visibleCards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(6);
  });

  test('should filter projects by Web Design', async ({ page }) => {
    // Click Web filter
    const webButton = page.locator('.filter-pill[data-filter="web"]');
    await webButton.click();

    // Wait for animation
    await page.waitForTimeout(500);

    // Check active state
    await expect(webButton).toHaveClass(/active/);

    // Count visible cards
    const visibleCards = page.locator('.portfolio-card:not(.filtered-out)');
    const count = await visibleCards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(6);
  });

  test('should return to all projects when clicking "All"', async ({ page }) => {
    // Click SEO first
    await page.locator('.filter-pill[data-filter="seo"]').click();
    await page.waitForTimeout(500);

    // Then click All
    await page.locator('.filter-pill[data-filter="all"]').click();
    await page.waitForTimeout(500);

    // All 6 projects should be visible again
    const visibleCards = page.locator('.portfolio-card:not(.filtered-out)');
    await expect(visibleCards).toHaveCount(6);
  });

  test('should display detailed project content', async ({ page }) => {
    // Check first project has enhanced content
    const firstCard = page.locator('.portfolio-card').first();
    const excerpt = firstCard.locator('.project-excerpt');
    const excerptText = await excerpt.textContent();

    // Should have detailed content (not generic)
    expect(excerptText.length).toBeGreaterThan(100);

    // Check for specific location mentions
    const allText = await page.textContent('body');
    expect(allText).toContain('Parramatta');
    expect(allText).toContain('Bondi');
    expect(allText).toContain('Sydney');
  });

  test('should have working CTA links', async ({ page }) => {
    // Check all CTA buttons link to contact page
    const ctaLinks = page.locator('.view-case-study');
    const firstCta = ctaLinks.first();

    await expect(firstCta).toBeVisible();
    await expect(firstCta).toHaveAttribute('href', '/contact');
  });

  test('should display testimonials section', async ({ page }) => {
    // Check testimonials section exists
    const testimonials = page.locator('.testimonials-section');
    await expect(testimonials).toBeVisible();

    // Check testimonial cards
    const testimonialCards = page.locator('.testimonial-card');
    await expect(testimonialCards).toHaveCount(3);

    // Check star ratings
    const stars = page.locator('.star').first();
    await expect(stars).toBeVisible();
  });

  test('should display CTA section', async ({ page }) => {
    // Check CTA section
    const ctaSection = page.locator('.cta-section');
    await expect(ctaSection).toBeVisible();

    // Check CTA buttons
    const primaryCta = page.locator('.cta-primary');
    const secondaryCta = page.locator('.cta-secondary');

    await expect(primaryCta).toBeVisible();
    await expect(secondaryCta).toBeVisible();
    await expect(secondaryCta).toHaveAttribute('href', 'tel:+61487286451');
  });

  test('should have Footer component', async ({ page }) => {
    // Check footer exists (use first() as BaseLayout may also have footer)
    const footer = page.locator('footer[role="contentinfo"]').first();
    await expect(footer).toBeVisible();

    // Check footer has social links
    const socialLinks = footer.locator('.social-icon');
    const count = await socialLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have proper structured data', async ({ page }) => {
    // Check for JSON-LD structured data
    const structuredData = page.locator('script[type="application/ld+json"]');
    const count = await structuredData.count();
    expect(count).toBeGreaterThan(0);

    // Validate JSON structure
    const jsonContent = await structuredData.first().textContent();
    const data = JSON.parse(jsonContent);

    expect(data['@context']).toBe('https://schema.org');
    expect(data['@graph']).toBeDefined();
    expect(Array.isArray(data['@graph'])).toBe(true);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check filter section is still accessible
    const filterSection = page.locator('.filter-section');
    await expect(filterSection).toBeVisible();

    // Check portfolio grid adapts
    const portfolioGrid = page.locator('.portfolio-grid');
    await expect(portfolioGrid).toBeVisible();

    // Check cards are still visible
    const cards = page.locator('.portfolio-card');
    const firstCard = cards.first();
    await expect(firstCard).toBeVisible();
  });

  test('should have hover effects on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Get first portfolio card
    const firstCard = page.locator('.portfolio-card').first();

    // Hover over card
    await firstCard.hover();

    // Card should remain visible after hover
    await expect(firstCard).toBeVisible();
  });

  test('should display hero stats', async ({ page }) => {
    // Check hero stats
    const heroStats = page.locator('.hero-stats');
    await expect(heroStats).toBeVisible();

    // Check stat items
    const statItems = page.locator('.stat-item');
    await expect(statItems).toHaveCount(3);

    // Check numbers are displayed
    const statNumbers = page.locator('.stat-number');
    const firstNumber = await statNumbers.first().textContent();
    expect(firstNumber.trim()).toMatch(/\d+/); // Should contain numbers
  });

  test('should have accessible filter buttons', async ({ page }) => {
    // Check filter buttons are keyboard accessible
    const firstFilter = page.locator('.filter-pill').first();

    // Focus on button
    await firstFilter.focus();

    // Press Enter
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);

    // Should have active class
    await expect(firstFilter).toHaveClass(/active/);
  });

  test('should load without console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('http://localhost:3006/portfolio/');
    await page.waitForLoadState('networkidle');

    // Check no JavaScript errors
    expect(errors.length).toBe(0);
  });
});
