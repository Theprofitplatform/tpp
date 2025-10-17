import { test } from '@playwright/test';

test('debug portfolio cards rendering', async ({ page }) => {
  await page.goto('https://theprofitplatform.com.au/portfolio/');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('.portfolio-card');

  // Check card styles in detail
  const cardDetails = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.portfolio-card'));
    return cards.map((card, i) => {
      const computed = window.getComputedStyle(card);
      const title = card.querySelector('.project-title');
      const titleComputed = title ? window.getComputedStyle(title) : null;

      return {
        index: i + 1,
        title: title?.textContent?.trim(),
        cardStyles: {
          display: computed.display,
          opacity: computed.opacity,
          visibility: computed.visibility,
          backgroundColor: computed.backgroundColor,
          zIndex: computed.zIndex,
          position: computed.position
        },
        titleStyles: titleComputed ? {
          color: titleComputed.color,
          opacity: titleComputed.opacity,
          display: titleComputed.display
        } : null
      };
    });
  });

  console.log('Card details:', JSON.stringify(cardDetails, null, 2));

  // Check if there's any overlay or element covering the cards
  const overlays = await page.evaluate(() => {
    const section = document.querySelector('.portfolio-section');
    const rect = section.getBoundingClientRect();

    // Check what element is at the center of the section
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const elementAtCenter = document.elementFromPoint(centerX, centerY);

    return {
      elementAtCenter: elementAtCenter?.className,
      elementTag: elementAtCenter?.tagName,
      sectionRect: rect
    };
  });

  console.log('Overlays check:', overlays);

  // Try to make cards more visible and take screenshot
  await page.evaluate(() => {
    const cards = document.querySelectorAll('.portfolio-card');
    cards.forEach(card => {
      card.style.border = '5px solid red';
      card.style.backgroundColor = 'yellow';
    });
  });

  await page.screenshot({
    path: 'tests/screenshots/portfolio-debug-highlighted.png',
    fullPage: false
  });

  console.log('✅ Debug screenshot captured with highlighted cards');
});
