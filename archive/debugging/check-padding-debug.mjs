import { chromium } from 'playwright';

async function checkPaddingDebug() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    await page.goto('http://localhost:4321/tools/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('🔍 DEBUGGING PADDING ISSUE\n');

    const hero = page.locator('.tools-hero-modern');

    // Get all styles
    const allStyles = await hero.evaluate(el => {
      const computed = window.getComputedStyle(el);
      const inline = el.style;
      return {
        computed: {
          padding: computed.padding,
          paddingTop: computed.paddingTop,
          paddingBottom: computed.paddingBottom,
          display: computed.display,
          position: computed.position,
        },
        inline: {
          padding: inline.padding,
          paddingTop: inline.paddingTop,
          paddingBottom: inline.paddingBottom,
        },
        className: el.className,
        attributes: Array.from(el.attributes).map(attr => ({name: attr.name, value: attr.value}))
      };
    });

    console.log('Element className:', allStyles.className);
    console.log('\nAttributes:', allStyles.attributes);
    console.log('\nComputed Styles:');
    console.log(JSON.stringify(allStyles.computed, null, 2));
    console.log('\nInline Styles:');
    console.log(JSON.stringify(allStyles.inline, null, 2));

    // Check what CSS rules are being applied
    const cssRules = await hero.evaluate(el => {
      const sheets = Array.from(document.styleSheets);
      let matchingRules = [];

      sheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          rules.forEach(rule => {
            if (rule.selectorText && rule.selectorText.includes('tools-hero-modern')) {
              matchingRules.push({
                selector: rule.selectorText,
                paddingTop: rule.style.paddingTop,
                padding: rule.style.padding,
              });
            }
          });
        } catch (e) {
          // Cross-origin stylesheet
        }
      });

      return matchingRules;
    });

    console.log('\nMatching CSS Rules:');
    console.log(JSON.stringify(cssRules, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

checkPaddingDebug();
