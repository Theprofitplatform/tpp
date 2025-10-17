import { test, expect } from '@playwright/test';

test.describe('Individual Blog Post Mobile Layout', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the specific blog post
    await page.goto('http://localhost:3002/blog/remarketing-campaigns-that-actually-convert-for-sydney-ecommerce/');
    await page.setViewportSize({ width: 375, height: 800 });
    await page.waitForLoadState('networkidle');
  });

  test('check blog post hero section positioning', async ({ page }) => {
    console.log('=== BLOG POST HERO SECTION ANALYSIS ===');
    
    // Wait for page to load completely
    await page.waitForTimeout(2000);
    
    // Check if the blog post content is visible
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
    
    // Look for hero-related elements in blog post
    const heroSelectors = [
      '.post-hero',
      '.blog-post-hero', 
      '.hero-section',
      '.featured-image-container',
      '.post-header',
      '.post-title',
      '.featured-image'
    ];
    
    const foundElements = [];
    for (const selector of heroSelectors) {
      try {
        const element = page.locator(selector);
        const isVisible = await element.isVisible().catch(() => false);
        if (isVisible) {
          const box = await element.boundingBox();
          foundElements.push({
            selector,
            visible: true,
            position: { y: box.y, height: box.height }
          });
        } else {
          foundElements.push({ selector, visible: false });
        }
      } catch (e) {
        foundElements.push({ selector, visible: false, error: e.message });
      }
    }
    
    console.log('Hero Elements Found:', foundElements);
    
    // Check the overall page structure
    const pageStructure = await page.evaluate(() => {
      const main = document.querySelector('main');
      if (!main) return null;
      
      const children = Array.from(main.children);
      return {
        totalElements: children.length,
        elementOrder: children.slice(0, 10).map((child, index) => ({
          index,
          tagName: child.tagName,
          className: child.className,
          id: child.id,
          rect: child.getBoundingClientRect(),
          textContent: child.textContent?.substring(0, 50)?.trim() || 'no text'
        }))
      };
    });
    
    console.log('Page Structure:', JSON.stringify(pageStructure, null, 2));
    
    // Take screenshot of top portion
    await page.screenshot({
      path: 'test-results/blog-post-hero-top.png',
      fullPage:true
    });
  });

  test('check for image and text overlay issues', async ({ page }) => {
    console.log('=== OVERLAY ANALYSIS ===');
    
    await page.waitForTimeout(2000);
    
    // Find all images and text elements
    const overlayAnalysis = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      const textElements = Array.from(document.querySelectorAll('h1, h2, h3, p, span'))
        .filter(el => 
          el.getBoundingClientRect().height > 0 && 
          el.textContent.trim().length > 0
        );
      
      const overlappingPairs = [];
      
      images.forEach(img => {
        const imgRect = img.getBoundingClientRect();
        textElements.forEach(text => {
          const textRect = text.getBoundingClientRect();
          
          // Check for overlap
          const isOverlapping = !(
            imgRect.right < textRect.left ||
            imgRect.left > textRect.right ||
            imgRect.bottom < textRect.top ||
            imgRect.top > textRect.bottom
          );
          
          if (isOverlapping && !img.contains(text) && !text.contains(img)) {
            overlappingPairs.push({
              image: {
                src: img.src,
                alt: img.alt,
                rect: imgRect
              },
              text: {
                content: text.textContent.substring(0, 50),
                tagName: text.tagName,
                rect: textRect
              }
            });
          }
        });
      });
      
      return {
        imageCount: images.length,
        textElementCount: textElements.length,
        overlappingPairs
      };
    });
    
    console.log('Overlay Analysis:', JSON.stringify(overlayAnalysis, null, 2));
    
    if (overlayAnalysis.overlappingPairs.length > 0) {
      console.warn(`⚠️ Found ${overlayAnalysis.overlappingPairs.length} overlapping image/text pairs!`);
      
      // Take screenshot showing overlay issue
      await page.screenshot({
        path: 'test-results/blog-post-overlay-issue.png',
        fullPage: true
      });
    } else {
      console.log('✅ No overlay issues detected');
    }
  });

  test('check mobile responsive behavior', async ({ page }) => {
    console.log('=== MOBILE RESPONSIVE CHECK ===');
    
    await page.waitForTimeout(2000);
    
    // Check viewport and responsive behavior
    const mobileCheck = await page.evaluate(() => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Check for mobile-specific classes or styles
      const computedStyles = {};
      
      const elementsToCheck = [
        '.post-header',
        '.featured-image-container', 
        '.post-content',
        '.post-title',
        'img'
      ].filter(selector => document.querySelector(selector));
      
      elementsToCheck.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
          const style = getComputedStyle(element);
          computedStyles[selector] = {
            maxWidth: style.maxWidth,
            width: style.width,
            height: style.height,
            display: style.display,
            position: style.position,
            overflow: style.overflow
          };
        }
      });
      
      return {
        viewportWidth,
        viewportHeight,
        isMobile: viewportWidth <= 768,
        computedStyles
      };
    });
    
    console.log('Mobile Responsive Check:', JSON.stringify(mobileCheck, null, 2));
    
    // Test scrolling behavior
    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
    console.log(`Total page height: ${scrollHeight}px`);
    
    // Scroll to different positions and capture screenshots
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: 'test-results/blog-post-scroll-top.png' });
    
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.screenshot({ path: 'test-results/blog-post-scroll-middle.png' });
    
    // Back to top
    await page.evaluate(() => window.scrollTo(0, 0));
  });
});
