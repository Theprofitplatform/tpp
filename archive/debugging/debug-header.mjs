import { chromium } from 'playwright';

const URL = 'https://theprofitplatform.com.au/blog/2025-10-04-how-to-optimise-your-google-business-profile-for-sydney-local-search-in-2025';

async function debugHeader() {
  console.log('🔍 Debugging header visibility issue...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  await page.goto(URL, { waitUntil: 'networkidle' });

  // Get header information
  const headerInfo = await page.evaluate(() => {
    const header = document.querySelector('header#header, header.premium-nav, header');

    if (!header) return { exists: false };

    const styles = window.getComputedStyle(header);
    const rect = header.getBoundingClientRect();

    return {
      exists: true,
      display: styles.display,
      visibility: styles.visibility,
      opacity: styles.opacity,
      position: styles.position,
      top: styles.top,
      left: styles.left,
      zIndex: styles.zIndex,
      height: styles.height,
      width: styles.width,
      backgroundColor: styles.backgroundColor,
      boundingBox: {
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
        x: rect.x,
        y: rect.y
      },
      innerHTML: header.innerHTML.substring(0, 500),
      parentElement: header.parentElement?.tagName,
      classes: header.className
    };
  });

  console.log('=== HEADER DOM INFO ===');
  console.log(JSON.stringify(headerInfo, null, 2));

  // Check body styles
  const bodyInfo = await page.evaluate(() => {
    const body = document.body;
    const styles = window.getComputedStyle(body);

    return {
      paddingTop: styles.paddingTop,
      marginTop: styles.marginTop,
      overflow: styles.overflow,
      position: styles.position
    };
  });

  console.log('\n=== BODY STYLES ===');
  console.log(JSON.stringify(bodyInfo, null, 2));

  // Get first visible element at top
  const topElement = await page.evaluate(() => {
    const element = document.elementFromPoint(window.innerWidth / 2, 50);
    return {
      tagName: element?.tagName,
      id: element?.id,
      className: element?.className,
      text: element?.textContent?.substring(0, 100)
    };
  });

  console.log('\n=== ELEMENT AT TOP OF VIEWPORT ===');
  console.log(JSON.stringify(topElement, null, 2));

  // Check if Header component is rendered
  const headerComponentCheck = await page.evaluate(() => {
    const allHeaders = Array.from(document.querySelectorAll('header'));
    return allHeaders.map(h => ({
      id: h.id,
      classes: h.className,
      position: window.getComputedStyle(h).position,
      display: window.getComputedStyle(h).display,
      visibility: window.getComputedStyle(h).visibility,
      top: window.getComputedStyle(h).top,
      boundingTop: h.getBoundingClientRect().top
    }));
  });

  console.log('\n=== ALL HEADER ELEMENTS ===');
  console.log(JSON.stringify(headerComponentCheck, null, 2));

  // Take annotated screenshot
  await page.evaluate(() => {
    const header = document.querySelector('header');
    if (header) {
      header.style.outline = '5px solid red';
    }
  });

  await page.screenshot({ path: 'debug-header-annotated.png', fullPage: false });
  console.log('\n✓ Annotated screenshot saved: debug-header-annotated.png');

  await browser.close();
}

debugHeader().catch(console.error);
