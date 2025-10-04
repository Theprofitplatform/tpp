import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }
  });
  const page = await context.newPage();
  
  console.log('Loading LOCAL site at mobile viewport...\n');
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  
  // Check the CSS rule
  const result = await page.evaluate(() => {
    const results = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.type === CSSRule.MEDIA_RULE) {
            const mediaText = rule.conditionText || rule.media.mediaText;
            if (mediaText.includes('768px')) {
              for (const innerRule of rule.cssRules) {
                const selector = innerRule.selectorText;
                if (selector && (selector.includes('nav-floating-container') || selector.includes('premium-nav'))) {
                  const style = innerRule.style;
                  results.push({
                    media: mediaText,
                    selector: selector,
                    flexDirection: style.flexDirection || 'not set',
                    flexFlow: style.flexFlow || 'not set',
                    display: style.display || 'not set',
                    fullRule: innerRule.cssText
                  });
                }
              }
            }
          }
        }
      } catch (e) {}
    }
    return results;
  });
  
  console.log('CSS Rules in @media (max-width: 768px):');
  console.log(JSON.stringify(result, null, 2));
  
  await browser.close();
  process.exit(0);
})();
