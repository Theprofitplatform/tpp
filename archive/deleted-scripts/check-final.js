import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('https://cdd3bcbc.tpp-new.pages.dev/tools/');
  await page.waitForLoadState('networkidle');

  const result = await page.evaluate(() => {
    const element = document.querySelector('.tools-hero-modern');
    const styles = window.getComputedStyle(element);

    // Get all stylesheet rules
    const matchingRules = [];
    for (let sheet of document.styleSheets) {
      try {
        for (let rule of sheet.cssRules || sheet.rules) {
          if (rule instanceof CSSStyleRule && rule.style.paddingTop) {
            try {
              // Check if selector ACTUALLY matches the element
              if (element.matches(rule.selectorText)) {
                matchingRules.push({
                  selector: rule.selectorText,
                  paddingTop: rule.style.paddingTop,
                  important: rule.style.getPropertyPriority('padding-top'),
                  href: sheet.href ? sheet.href.split('/').pop() : 'inline'
                });
              }
            } catch (e) {}
          }
          // Check media rules
          if (rule instanceof CSSMediaRule) {
            for (let mediaRule of rule.cssRules) {
              if (mediaRule instanceof CSSStyleRule && mediaRule.style.paddingTop) {
                try {
                  if (element.matches(mediaRule.selectorText)) {
                    matchingRules.push({
                      selector: mediaRule.selectorText,
                      media: rule.conditionText,
                      paddingTop: mediaRule.style.paddingTop,
                      important: mediaRule.style.getPropertyPriority('padding-top'),
                      href: sheet.href ? sheet.href.split('/').pop() : 'inline'
                    });
                  }
                } catch (e) {}
              }
            }
          }
        }
      } catch (e) {}
    }

    return {
      computedPaddingTop: styles.paddingTop,
      matchingRules: matchingRules
    };
  });

  console.log('Computed padding-top:', result.computedPaddingTop);
  console.log('\nRules that ACTUALLY match and set padding-top:');
  console.log(JSON.stringify(result.matchingRules, null, 2));

  await browser.close();
})();
