import { chromium } from 'playwright';

async function verifyEnhancedDesign() {
  console.log('📸 Taking screenshots of enhanced blog design...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  const url = 'https://0c1c3810.tpp.pages.dev/blog/2025-10-04-how-to-optimise-your-google-business-profile-for-sydney-local-search-in-2025';

  await page.goto(url, { waitUntil: 'networkidle' });

  // Desktop viewport shot
  await page.screenshot({
    path: 'enhanced-blog-desktop.png',
    fullPage: false
  });
  console.log('✓ Desktop viewport: enhanced-blog-desktop.png');

  // Full page
  await page.screenshot({
    path: 'enhanced-blog-full.png',
    fullPage: true
  });
  console.log('✓ Full page: enhanced-blog-full.png');

  // Mobile
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: 'enhanced-blog-mobile.png',
    fullPage: false
  });
  console.log('✓ Mobile: enhanced-blog-mobile.png');

  console.log('\n✅ All screenshots captured successfully!');

  await browser.close();
}

verifyEnhancedDesign().catch(console.error);
