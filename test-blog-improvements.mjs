import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Test desktop
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('http://localhost:4321/blog/how-to-scale-local-seo/', { waitUntil: 'networkidle' });
  
  const desktopAnalysis = await page.evaluate(() => {
    const header = document.querySelector('.post-header');
    const container = document.querySelector('.container');
    const postContent = document.querySelector('.post-content');
    const h1 = document.querySelector('.post-title');
    const h2 = document.querySelector('.post-content h2');
    const body = document.querySelector('.post-content p');
    
    return {
      header: {
        background: window.getComputedStyle(header).background,
        color: window.getComputedStyle(header).color
      },
      container: {
        maxWidth: window.getComputedStyle(container).maxWidth,
        width: container.offsetWidth
      },
      typography: {
        h1Size: window.getComputedStyle(h1).fontSize,
        h2Size: h2 ? window.getComputedStyle(h2).fontSize : 'N/A',
        bodySize: body ? window.getComputedStyle(body).fontSize : 'N/A',
        bodyLineHeight: body ? window.getComputedStyle(body).lineHeight : 'N/A'
      }
    };
  });
  
  await page.screenshot({ path: 'blog-improved-desktop.png', fullPage: true });
  
  // Test mobile
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('http://localhost:4321/blog/how-to-scale-local-seo/', { waitUntil: 'networkidle' });
  
  const mobileAnalysis = await page.evaluate(() => {
    const body = document.querySelector('.post-content p');
    const shareBtn = document.querySelector('.share-btn');
    
    return {
      bodySize: body ? window.getComputedStyle(body).fontSize : 'N/A',
      shareBtnSize: shareBtn ? `${shareBtn.offsetWidth}x${shareBtn.offsetHeight}` : 'N/A'
    };
  });
  
  await page.screenshot({ path: 'blog-improved-mobile.png', fullPage: true });
  
  console.log('=== DESKTOP ANALYSIS ===');
  console.log(JSON.stringify(desktopAnalysis, null, 2));
  console.log('\n=== MOBILE ANALYSIS ===');
  console.log(JSON.stringify(mobileAnalysis, null, 2));
  
  await browser.close();
})();
