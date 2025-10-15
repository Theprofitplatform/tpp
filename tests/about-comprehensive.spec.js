import { test, expect } from '@playwright/test';

test('Comprehensive about page verification', async ({ page }) => {
  // Go to production with cache bypass
  await page.goto('https://theprofitplatform.com.au/about/?t=' + Date.now(), {
    waitUntil: 'networkidle'
  });

  // Verify header navigation
  const header = await page.locator('header');
  await expect(header).toBeVisible();

  const navItems = await page.locator('nav a, nav button').count();
  console.log(`✓ Found ${navItems} navigation items`);

  // Verify hero section
  const heroText = await page.locator('text=Sydney\'s most innovative').first();
  await expect(heroText).toBeVisible();
  console.log('✓ Hero section visible');

  // Verify key badges
  await expect(page.locator('text=Sydney Based')).toBeVisible();
  await expect(page.locator('text=127+ 5-Star Reviews')).toBeVisible();
  await expect(page.locator('text=Founded 2024')).toBeVisible();
  console.log('✓ Key info badges visible');

  // Check for team section
  const teamSection = await page.locator('text=Meet Our Team, text=Our Team').first();
  if (await teamSection.isVisible()) {
    console.log('✓ Team section found');

    // Look for team member cards
    const teamCards = await page.locator('[class*="team"], [class*="card"]').count();
    console.log(`  Found ${teamCards} potential team card elements`);
  }

  // Check for testimonials
  const testimonialText = await page.locator('text=testimonial, text=review, text=client').first();
  if (await testimonialText.isVisible()) {
    console.log('✓ Testimonials section found');
  }

  // Check for CTA section
  const ctaSection = await page.locator('text=Ready, text=Get Started, text=Contact').first();
  if (await ctaSection.isVisible()) {
    console.log('✓ CTA section found');
  }

  // Take full page screenshot
  await page.screenshot({
    path: 'test-results/about-verified-full.png',
    fullPage: true
  });

  // Take viewport screenshot
  await page.screenshot({
    path: 'test-results/about-verified-viewport.png'
  });

  console.log('\n✅ All verifications complete');
  console.log('   Screenshots saved to test-results/');
});
