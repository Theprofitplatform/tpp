import { test, expect } from '@playwright/test';

test.describe('Blog Post Overlay Issues - Focused Test', () => {
  test('check header and first section overlay on mobile', async ({ page }) => {
    // Navigate to specific blog post
    await page.goto('http://localhost:3002/blog/remarketing-campaigns-that-actually-convert-for-sydney-ecommerce/');
    await page.setViewportSize({ width: 375, height: 800 });
    await page.waitForLoadState('networkidle');
    
    console.log('=== HEADER & HERO OVERLAY ANALYSIS ===');
    
    // Check page loads successfully
    await expect(page.locator('body')).toBeVisible();
    
    // Focus on the top portion of the page where overlay issues occur
    const topSection = await page.evaluate(() => {
      // Look for logo, title, and featured image positioning
      const logo = document.querySelector('img[alt*="Logo"], header img');
      const mainTitle = document.querySelector('h1');
      const featuredImage = document.querySelector('.featured-image-container img, .post-header img, main img:first-of-type');
      const breadcrumbs = document.querySelector('.breadcrumbs');
      
      return {
        logo: logo ? {
          src: logo.src,
          rect: logo.getBoundingClientRect(),
          alt: logo.alt
        } : null,
        mainTitle: mainTitle ? {
          text: mainTitle.textContent,
          rect: mainTitle.getBoundingClientRect()
        } : null,
        featuredImage: featuredImage ? {
          src: featuredImage.src,
          rect: featuredImage.getBoundingClientRect(),
          alt: featuredImage.alt
        } : null,
        breadcrumbs: breadcrumbs ? {
          rect: breadcrumbs.getBoundingClientRect()
        } : null
      };
    });
    
    console.log('Top Section Elements:', JSON.stringify(topSection, null, 2));
    
    // Check for specific overlay issue: logo over H1
    if (topSection.logo && topSection.mainTitle) {
      const logoRect = topSection.logo.rect;
      const titleRect = topSection.mainTitle.rect;
      
      const overlapping = !(
        logoRect.right < titleRect.left ||
        logoRect.left > titleRect.right ||
        logoRect.bottom < titleRect.top ||
        logoRect.top > titleRect.bottom
      );
      
      if (overlapping) {
        console.warn('⚠️ OVERLAY ISSUE DETECTED: Logo is overlapping with the blog title!');
        console.log(`Logo: x=${logoRect.x}, y=${logoRect.y}, w=${logoRect.width}, h=${logoRect.height}`);
        console.log(`Title: x=${titleRect.x}, y=${titleRect.y}, w=${titleRect.width}, h=${titleRect.height}`);
      }
    }
    
    // Take screenshot of top portion only (to avoid timeout)
    await page.screenshot({
      path: 'test-results/blog-post-top-overlay.png',
      clip: {
        x: 0,
        y: 0,
        width: 375,
        height: 400  // Limit height to avoid huge page
      }
    });
    
    // Check if we need to scroll or if content is at bottom
    const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const heroPosition = await page.evaluate(() => {
      const hero = document.querySelector('.featured-image-container, .post-header');
      if (!hero) return null;
      return hero.getBoundingClientRect().y;
    });
    
    console.log(`Page total height: ${pageHeight}px`);
    console.log(`Hero/Image position: ${heroPosition}px`);
    
    if (heroPosition && heroPosition > window.innerHeight / 2) {
      console.log('⚠️ ISSUE: Hero section appears to be pushed down the page, not at the top!');
    }
  });

  test('check content flow and image placement', async ({ page }) => {
    await page.goto('http://localhost:3002/blog/remarketing-campaigns-that-actually-convert-for-sydney-ecommerce/');
    await page.setViewportSize({ width: 375, height: 800 });
    await page.waitForLoadState('networkidle');
    
    console.log('=== CONTENT FLOW ANALYSIS ===');
    
    // Check the order of main elements
    const contentOrder = await page.evaluate(() => {
      const article = document.querySelector('article, main');
      if (!article) return null;
      
      const children = Array.from(article.children).slice(0, 8); // First 8 elements
      return children.map((child, index) => {
        const rect = child.getBoundingClientRect();
        return {
          index,
          tagName: child.tagName.toLowerCase(),
          className: child.className.split(' ')[0] || 'no-class',
          y: rect.y,
          height: rect.height,
          visible: rect.height > 0,
          text: child.textContent?.substring(0, 30)?.trim() || 'no-text'
        };
      });
    });
    
    console.log('Content Order:', JSON.stringify(contentOrder, null, 2));
    
    // Expected order for blog posts:
    // 1. Breadcrumbs (nav)
    // 2. Post Header (with title/navigation)
    // 3. Featured Image
    // 4. Post Content
    
    let actualOrder = '';
    contentOrder.forEach(item => {
      if (item.visible && item.y < 1000) { // Only visible elements near top
        if (item.className.includes('breadcrumb')) {
          actualOrder += '1-breadcrumb ';
        } else if (item.className.includes('header') || item.tagName === 'header') {
          actualOrder += '2-header ';
        } else if (item.className.includes('image') || item.tagName === 'img') {
          actualOrder += '3-image ';
        } else {
          actualOrder += '4-content ';
        }
      }
    });
    
    console.log(`Actual order near top: ${actualOrder}`);
    
    // Take screenshot of first visible portion
    await page.screenshot({
      path: 'test-results/blog-post-content-flow.png',
      clip: {
        x: 0,
        y: 0,
        width: 375,
        height: 600
      }
    });
  });
});
