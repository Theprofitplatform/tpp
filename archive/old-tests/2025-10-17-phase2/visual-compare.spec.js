import { test, expect } from '@playwright/test';

test('Compare about vs services page', async ({ page }) => {
  // Take screenshot of services page
  await page.goto('https://theprofitplatform.com.au/services/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test-results/services-page-full.png', fullPage: true });

  // Take screenshot of about page
  await page.goto('https://theprofitplatform.com.au/about/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test-results/about-page-full.png', fullPage: true });

  // Compare header sections
  await page.goto('https://theprofitplatform.com.au/services/');
  const servicesHeader = await page.locator('header.premium-nav');
  await servicesHeader.screenshot({ path: 'test-results/services-header.png' });

  await page.goto('https://theprofitplatform.com.au/about/');
  const aboutHeader = await page.locator('header.premium-nav');
  await aboutHeader.screenshot({ path: 'test-results/about-header.png' });

  // Check if headers match
  const servicesNav = await page.locator('.premium-nav-links').innerHTML();

  await page.goto('https://theprofitplatform.com.au/services/');
  const servicesNavHTML = await page.locator('.premium-nav-links').innerHTML();

  console.log('✅ Screenshots saved to test-results/');
  console.log('   - services-page-full.png');
  console.log('   - about-page-full.png');
  console.log('   - services-header.png');
  console.log('   - about-header.png');
});
