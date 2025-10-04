import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 667 }
  });
  const page = await context.newPage();
  
  console.log('Loading site at mobile viewport (375x667)...\n');
  await page.goto('https://theprofitplatform.com.au/', { waitUntil: 'networkidle' });
  
  // Check the specific CSS rule
  const result = await page.evaluate(() => {
    const results = [];
    for (const sheet of document.styleSheets) {
      try {
        if (!sheet.href || !sheet.href.includes('about.CkTzPJjd.css')) continue;
        
        for (const rule of sheet.cssRules) {
          if (rule.type === CSSRule.MEDIA_RULE) {
            const mediaText = rule.conditionText || rule.media.mediaText;
            if (mediaText.includes('768px')) {
              for (const innerRule of rule.cssRules) {
                const selector = innerRule.selectorText;
                if (selector && selector.includes('nav')) {
                  const style = innerRule.style;
                  if (style.flexDirection) {
                    results.push({
                      media: mediaText,
                      selector: selector,
                      flexDirection: style.flexDirection,
                      fullRule: innerRule.cssText
                    });
                  }
                }
              }
            }
          }
        }
      } catch (e) {}
    }
    return results;
  });
  
  console.log('CSS Rules with flex-direction in @media (max-width: 768px):');
  console.log(JSON.stringify(result, null, 2));
  
  await browser.close();
})();
