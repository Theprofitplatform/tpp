import { chromium } from 'playwright';

async function finalCheck() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    await page.goto(`http://localhost:4321/tools/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('View the page in the browser - hero should now clear the navbar');
    console.log('Press Ctrl+C when done reviewing');
    
    await page.waitForTimeout(300000); // Wait 5 minutes

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

finalCheck();
