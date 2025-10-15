import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('Checking latest deployment...\n');
  await page.goto('https://cdd3bcbc.tpp-new.pages.dev/tools/');
  await page.waitForLoadState('networkidle');

  // Get the hero section element
  const heroSection = await page.locator('section.tools-hero-modern').first();

  // Get computed styles
  const paddingTop = await heroSection.evaluate(el => {
    const styles = window.getComputedStyle(el);
    return {
      paddingTop: styles.paddingTop,
      marginTop: styles.marginTop,
      position: styles.position,
      className: el.className,
      top: styles.top
    };
  });

  console.log('Hero Section Styles:');
  console.log(JSON.stringify(paddingTop, null, 2));

  // Get the header height
  const header = await page.locator('header.premium-nav').first();
  const headerInfo = await header.evaluate(el => {
    const styles = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return {
      position: styles.position,
      top: styles.top,
      height: rect.height,
      bottom: rect.bottom
    };
  });

  console.log('\nHeader Info:');
  console.log(JSON.stringify(headerInfo, null, 2));

  // Check if hero content is visible below header
  const heroRect = await heroSection.boundingBox();
  console.log('\nHero Section Position:');
  console.log(JSON.stringify(heroRect, null, 2));

  // Get all CSS rules that might affect it
  const cssRules = await page.evaluate(() => {
    const rules = [];
    for (let sheet of document.styleSheets) {
      try {
        for (let rule of sheet.cssRules || sheet.rules) {
          if (rule.selectorText && rule.selectorText.includes('tools-hero-modern')) {
            rules.push({
              selector: rule.selectorText,
              cssText: rule.cssText
            });
          }
        }
      } catch (e) {
        // CORS issues with external stylesheets
      }
    }
    return rules;
  });

  console.log('\nCSS Rules for .tools-hero-modern:');
  console.log(JSON.stringify(cssRules, null, 2));

  await browser.close();
})();
