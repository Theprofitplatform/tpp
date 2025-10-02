import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Checking production site: https://theprofitplatform.com.au/blog/');
  await page.goto('https://theprofitplatform.com.au/blog/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  console.log('\n=== DOM STRUCTURE AROUND BLOG HERO ===');
  const domInfo = await page.evaluate(() => {
    const hero = document.querySelector('.blog-hero');
    if (!hero) return { error: 'No .blog-hero found' };

    const elements = [];
    let current = hero;

    // Walk up the DOM tree
    while (current && current !== document.body) {
      const computed = window.getComputedStyle(current);
      const rect = current.getBoundingClientRect();

      elements.push({
        tag: current.tagName,
        classes: current.className,
        background: computed.background,
        backgroundColor: computed.backgroundColor,
        backgroundImage: computed.backgroundImage,
        zIndex: computed.zIndex,
        position: computed.position,
        width: rect.width,
        height: rect.height
      });

      current = current.parentElement;
    }

    // Check for pseudo-elements on body and main
    const body = document.body;
    const bodyBefore = window.getComputedStyle(body, '::before');
    const bodyAfter = window.getComputedStyle(body, '::after');
    const main = document.querySelector('main');
    const mainBefore = main ? window.getComputedStyle(main, '::before') : null;
    const mainAfter = main ? window.getComputedStyle(main, '::after') : null;

    return {
      hierarchy: elements,
      pseudoElements: {
        'body::before': {
          display: bodyBefore.display,
          content: bodyBefore.content,
          background: bodyBefore.background,
          position: bodyBefore.position,
          zIndex: bodyBefore.zIndex
        },
        'body::after': {
          display: bodyAfter.display,
          content: bodyAfter.content,
          background: bodyAfter.background,
          position: bodyAfter.position,
          zIndex: bodyAfter.zIndex
        },
        'main::before': mainBefore ? {
          display: mainBefore.display,
          content: mainBefore.content,
          background: mainBefore.background,
          position: mainBefore.position,
          zIndex: mainBefore.zIndex
        } : null,
        'main::after': mainAfter ? {
          display: mainAfter.display,
          content: mainAfter.content,
          background: mainAfter.background,
          position: mainAfter.position,
          zIndex: mainAfter.zIndex
        } : null
      }
    };
  });

  console.log(JSON.stringify(domInfo, null, 2));

  console.log('\n=== CHECKING FOR GRADIENT OVERLAYS ===');
  const gradients = await page.evaluate(() => {
    const allElements = document.querySelectorAll('*');
    const withGradients = [];

    allElements.forEach(el => {
      const computed = window.getComputedStyle(el);
      if (computed.backgroundImage.includes('gradient')) {
        const rect = el.getBoundingClientRect();
        withGradients.push({
          tag: el.tagName,
          classes: el.className,
          backgroundImage: computed.backgroundImage,
          position: computed.position,
          zIndex: computed.zIndex,
          width: rect.width,
          height: rect.height,
          top: rect.top
        });
      }
    });

    return withGradients;
  });

  console.log('Elements with gradients:', JSON.stringify(gradients, null, 2));

  await browser.close();
})();
