import { test } from '@playwright/test';

test('check hero background positioning', async ({ page }) => {
  await page.goto('https://theprofitplatform.com.au/portfolio/');
  await page.waitForLoadState('networkidle');

  // Check hero and background styles
  const heroStyles = await page.evaluate(() => {
    const hero = document.querySelector('.portfolio-hero');
    const heroBackground = document.querySelector('.hero-background');
    const heroGradient = document.querySelector('.hero-gradient');

    const heroComputed = hero ? window.getComputedStyle(hero) : null;
    const bgComputed = heroBackground ? window.getComputedStyle(heroBackground) : null;
    const gradComputed = heroGradient ? window.getComputedStyle(heroGradient) : null;

    return {
      hero: heroComputed ? {
        position: heroComputed.position,
        zIndex: heroComputed.zIndex,
        height: heroComputed.height,
        minHeight: heroComputed.minHeight
      } : null,
      heroBackground: bgComputed ? {
        position: bgComputed.position,
        zIndex: bgComputed.zIndex,
        inset: bgComputed.inset,
        top: bgComputed.top,
        bottom: bgComputed.bottom,
        height: bgComputed.height
      } : null,
      heroGradient: gradComputed ? {
        position: gradComputed.position,
        zIndex: gradComputed.zIndex,
        inset: gradComputed.inset,
        background: gradComputed.background,
        height: gradComputed.height
      } : null
    };
  });

  console.log('Hero styles:', JSON.stringify(heroStyles, null, 2));

  // Check if hero is covering cards
  const overlap = await page.evaluate(() => {
    const hero = document.querySelector('.portfolio-hero');
    const section = document.querySelector('.portfolio-section');

    if (!hero || !section) return null;

    const heroRect = hero.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();

    return {
      heroBottom: heroRect.bottom,
      sectionTop: sectionRect.top,
      overlap: heroRect.bottom > sectionRect.top
    };
  });

  console.log('Overlap check:', overlap);
});
