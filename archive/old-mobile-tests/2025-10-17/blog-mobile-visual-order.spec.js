import { test, expect } from '@playwright/test';

test.describe('Blog Mobile Visual Order Testing', () => {
  test('comprehensive mobile layout analysis', async ({ page }) => {
    // Navigate to blog listing page
    await page.goto('http://localhost:3001/blog/');
    await page.setViewportSize({ width: 375, height: 800 });
    await page.waitForLoadState('networkidle');
    
    console.log('=== COMPREHENSIVE MOBILE LAYOUT ANALYSIS ===');
    
    // 1. Get visual viewport dimensions
    const viewport = page.viewportSize();
    console.log(`Viewport: ${viewport.width}x${viewport.height}`);
    
    // 2. Check hero grid display
    const heroGrid = page.locator('.hero-grid');
    const gridVisible = await heroGrid.isVisible();
    console.log(`Hero grid visible: ${gridVisible}`);
    
    // 3. Analyze the order of elements in the hero grid
    const heroGridLayout = await page.evaluate(() => {
      const heroGrid = document.querySelector('.hero-grid');
      if (!heroGrid) return null;
      
      const children = Array.from(heroGrid.children);
      const computedStyle = getComputedStyle(heroGrid);
      
      return {
        gridTemplateColumns: computedStyle.gridTemplateColumns,
        display: computedStyle.display,
        flexDirection: computedStyle.flexDirection,
        children: children.map((child, index) => {
          const style = getComputedStyle(child);
          return {
            index,
            tagName: child.tagName,
            className: child.className,
            order: style.order,
            position: style.position,
            display: style.display,
            zIndex: style.zIndex,
            rect: child.getBoundingClientRect(),
            text: child.textContent?.substring(0, 50)?.trim() || 'no text'
          };
        })
      };
    });
    
    console.log('Hero Grid Layout:', JSON.stringify(heroGridLayout, null, 2));
    
    // 4. Check if we're in mobile breakpoint
    const isMobileBreakpoint = await page.evaluate(() => {
      const style = getComputedStyle(document.querySelector('.hero-grid'));
      const maxWidth = style.maxWidth;
      const gridColumns = style.gridTemplateColumns;
      return {
        windowWidth: window.innerWidth,
        gridColumns,
        isMobileLayout: gridColumns === '1fr'
      };
    });
    
    console.log('Mobile Breakpoint Check:', isMobileBreakpoint);
    
    // 5. Visual verification - take screenshot of hero section
    const heroSection = page.locator('.blog-hero');
    const heroBox = await heroSection.boundingBox();
    
    if (heroBox) {
      await page.screenshot({
        path: 'test-results/blog-hero-section-visual.png',
        clip: {
          x: 0,
          y: heroBox.y,
          width: viewport.width,
          height: Math.min(heroBox.height, 600) // Limit height for visibility
        }
      });
      
      await page.screenshot({
        path: 'test-results/blog-hero-full.png',
        clip: {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height
        }
      });
    }
    
    // 6. Test the actual visual order by element positions
    const elementPositions = await page.evaluate(() => {
      const illustration = document.querySelector('.hero-illustration');
      const content = document.querySelector('.hero-content');
      
      return {
        illustration: illustration ? illustration.getBoundingClientRect() : null,
        content: content ? content.getBoundingClientRect() : null
      };
    });
    
    console.log('Element Positions:', elementPositions);
    
    // Determine visual order
    if (elementPositions.illustration && elementPositions.content) {
      const illustrationY = elementPositions.illustration.y;
      const contentY = elementPositions.content.y;
      
      const visualOrder = illustrationY < contentY ? 'illustration-first' : 'content-first';
      console.log(`Visual Order: ${visualOrder}`);
      console.log(`Illustration Y: ${illustrationY}, Content Y: ${contentY}`);
      
      if (visualOrder === 'content-first') {
        console.warn('⚠️  ISSUE FOUND: Content is appearing before illustration on mobile!');
      } else {
        console.log('✅ Visual order is correct: Illustration appears first on mobile');
      }
    }
    
    // 7. Check CSS media query application
    const cssApplied = await page.evaluate(() => {
      const style = getComputedStyle(document.querySelector('.hero-illustration'));
      const mobileStyle = getComputedStyle(document.querySelector('.hero-content'));
      
      return {
        illustration: {
          order: style.order,
          animation: style.animation,
          maxWidth: style.maxWidth,
          margin: style.margin
        },
        content: {
          zIndex: mobileStyle.zIndex,
          position: mobileStyle.position
        }
      };
    });
    
    console.log('CSS Applied:', cssApplied);
  });
});
