import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('🔍 Testing: https://b9c3b990.tpp.pages.dev/tools/rank-tracker');
  await page.goto('https://b9c3b990.tpp.pages.dev/tools/rank-tracker', { waitUntil: 'networkidle' });

  // Take screenshot to see what's there
  await page.screenshot({ path: 'rank-tracker-page.png', fullPage: true });
  console.log('📸 Screenshot saved to rank-tracker-page.png');

  // Check if the form exists
  const formExists = await page.locator('form').count();
  console.log(`Form count: ${formExists}`);

  // Check for input fields
  const keywordInput = await page.locator('input[name="keyword"]').count();
  const domainInput = await page.locator('input[name="domain"]').count();
  console.log(`Keyword input: ${keywordInput}, Domain input: ${domainInput}`);

  // Get page content to debug
  const bodyText = await page.locator('body').textContent();
  console.log('Page text preview:', bodyText.substring(0, 500));

  await browser.close();
})();
