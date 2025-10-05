import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('🔍 Testing: https://01a43bbe.tpp.pages.dev/tools/rank-tracker');
  await page.goto('https://01a43bbe.tpp.pages.dev/tools/rank-tracker', { waitUntil: 'networkidle' });
  
  // Fill form
  await page.fill('input[name="keyword"]', 'the profit platform');
  await page.fill('input[name="domain"]', 'theprofitplatform.com.au');
  await page.selectOption('select[name="location"]', 'Australia');
  
  // Click submit
  await page.click('button[type="submit"]');
  
  // Wait for results
  await page.waitForSelector('.impact-card', { timeout: 30000 });
  
  // Check what CSS classes are applied
  const impactCard = await page.locator('.impact-card').first();
  const computedStyle = await impactCard.evaluate(el => {
    const styles = window.getComputedStyle(el);
    return {
      borderRadius: styles.borderRadius,
      padding: styles.padding,
      border: styles.border,
      background: styles.background
    };
  });
  console.log('✅ Impact Card Styles:', JSON.stringify(computedStyle, null, 2));
  
  // Check stat values
  const statValue = await page.locator('.stat-value').first();
  const statStyle = await statValue.evaluate(el => {
    const styles = window.getComputedStyle(el);
    return {
      fontSize: styles.fontSize,
      background: styles.background,
      webkitBackgroundClip: styles.webkitBackgroundClip,
      webkitTextFillColor: styles.webkitTextFillColor
    };
  });
  console.log('✅ Stat Value Styles:', JSON.stringify(statStyle, null, 2));
  
  await browser.close();
})();
