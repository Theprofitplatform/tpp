import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('Checking latest deployment CSS overrides...\n');
  await page.goto('https://a3ee1661.tpp-new.pages.dev/tools/');
  await page.waitForLoadState('networkidle');

  // Get all matching CSS rules for tools-hero-modern
  const allMatchingRules = await page.evaluate(() => {
    const element = document.querySelector('.tools-hero-modern');
    if (!element) return [];

    const matchedRules = [];

    // Get all stylesheets
    for (let sheet of document.styleSheets) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        for (let rule of rules) {
          if (rule instanceof CSSStyleRule) {
            // Check if this rule matches our element
            try {
              if (element.matches(rule.selectorText)) {
                const paddingTop = rule.style.paddingTop;
                if (paddingTop) {
                  matchedRules.push({
                    selector: rule.selectorText,
                    paddingTop: paddingTop,
                    priority: rule.style.getPropertyPriority('padding-top'),
                    href: sheet.href ? sheet.href.split('/').pop() : 'inline'
                  });
                }
              }
            } catch (e) {
              // Invalid selector
            }
          }
          // Check media queries
          if (rule instanceof CSSMediaRule) {
            for (let mediaRule of rule.cssRules) {
              if (mediaRule instanceof CSSStyleRule) {
                try {
                  if (element.matches(mediaRule.selectorText)) {
                    const paddingTop = mediaRule.style.paddingTop;
                    if (paddingTop) {
                      matchedRules.push({
                        selector: mediaRule.selectorText,
                        mediaQuery: rule.conditionText,
                        paddingTop: paddingTop,
                        priority: mediaRule.style.getPropertyPriority('padding-top'),
                        href: sheet.href ? sheet.href.split('/').pop() : 'inline'
                      });
                    }
                  }
                } catch (e) {
                  // Invalid selector
                }
              }
            }
          }
        }
      } catch (e) {
        // CORS or other error
      }
    }
    return matchedRules;
  });

  console.log('All CSS rules setting padding-top on .tools-hero-modern:');
  console.log(JSON.stringify(allMatchingRules, null, 2));

  await browser.close();
})();
