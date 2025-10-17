import { test, expect } from '@playwright/test';

test.describe('Blog Listing Page Mobile Hero Section', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to blog listing page (note trailing slash)
    await page.goto('http://localhost:3001/blog/');
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('check hero section positioning on mobile', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if hero section is visible
    const heroSection = page.locator('.blog-hero');
    await expect(heroSection).toBeVisible();
    
    // Get hero section position
    const heroBox = await heroSection.boundingBox();
    console.log(`Hero section position: Y=${heroBox.y}, Height=${heroBox.height}`);
    
    // Hero should be at the top of the page
    expect(heroBox.y).toBeLessThan(100);
    
    // Check hero content positioning
    const heroContent = page.locator('.hero-content');
    const contentBox = await heroContent.boundingBox();
    console.log(`Hero content position: Y=${contentBox.y}, Height=${contentBox.height}`);
    
    // Check hero illustration positioning
    const heroIllustration = page.locator('.hero-illustration');
    const illustrationBox = await heroIllustration.boundingBox();
    console.log(`Hero illustration position: Y=${illustrationBox.y}, Height=${illustrationBox.height}`);
    
    // On mobile, illustration should appear before content
    const mobileOrder = await page.evaluate(() => {
      const heroGrid = document.querySelector('.hero-grid');
      if (!heroGrid) return null;
      
      const children = Array.from(heroGrid.children);
      return children.map((child, index) => ({
        index,
        className: child.className,
        element: child.classList.contains('hero-content') ? 'content' : 
                  child.classList.contains('hero-illustration') ? 'illustration' : 'other'
      }));
    });
    
    console.log('Mobile hero grid order:', mobileOrder);
    
    // Take screenshot for visual verification
    await page.screenshot({ 
      path: 'test-results/blog-listing-mobile-hero.png',
      fullPage: false 
    });
  });

  test('check for overlay issues in mobile view', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check if elements are overlapping incorrectly
    const heroTitle = page.locator('.hero-title');
    const heroIllustration = page.locator('.hero-illustration');
    
    // Get bounding boxes
    const titleBox = await heroTitle.boundingBox();
    const illustrationBox = await heroIllustration.boundingBox();
    
    console.log('Title box:', titleBox);
    console.log('Illustration box:', illustrationBox);
    
    // Check for unwanted overlaps
    if (titleBox && illustrationBox) {
      const isOverlapping = !(
        titleBox.y + titleBox.height < illustrationBox.y ||
        illustrationBox.y + illustrationBox.height < titleBox.y
      );
      
      console.log(`Elements are overlapping: ${isOverlapping}`);
      
      if (isOverlapping) {
        console.warn('WARNING: Hero title and illustration are overlapping on mobile!');
      }
    }
    
    // Check z-index values
    const zIndexes = await page.evaluate(() => {
      const title = document.querySelector('.hero-title');
      const illustration = document.querySelector('.hero-illustration');
      const content = document.querySelector('.hero-content');
      
      return {
        title: title ? getComputedStyle(title).zIndex : 'not found',
        illustration: illustration ? getComputedStyle(illustration).zIndex : 'not found',
        content: content ? getComputedStyle(content).zIndex : 'not found'
      };
    });
    
    console.log('Z-index values:', zIndexes);
    
    // Take a screenshot to visually verify the layout
    await page.screenshot({ 
      path: 'test-results/blog-listing-mobile-overlay-check.png',
      fullPage: false 
    });
  });

  test('verify mobile CSS order and positioning', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check the CSS order property in mobile view
    const cssOrder = await page.evaluate(() => {
      const heroContent = document.querySelector('.hero-content');
      const heroIllustration = document.querySelector('.hero-illustration');
      
      const contentStyle = heroContent ? getComputedStyle(heroContent) : null;
      const illustrationStyle = heroIllustration ? getComputedStyle(heroIllustration) : null;
      
      return {
        content: {
          order: contentStyle ? contentStyle.order : 'not found',
          display: contentStyle ? contentStyle.display : 'not found',
          position: contentStyle ? contentStyle.position : 'not found'
        },
        illustration: {
          order: illustrationStyle ? illustrationStyle.order : 'not found',
          display: illustrationStyle ? illustrationStyle.display : 'not found',
          position: illustrationStyle ? illustrationStyle.position : 'not found'
        }
      };
    });
    
    console.log('CSS Order and positioning:', cssOrder);
    
    // Check if the mobile CSS media query is working
    const isMobileView = await page.evaluate(() => {
      return window.innerWidth <= 968;
    });
    
    console.log(`Is mobile view active: ${isMobileView}`);
    
    // Get the computed grid template columns
    const gridTemplate = await page.evaluate(() => {
      const heroGrid = document.querySelector('.hero-grid');
      if (!heroGrid) return null;
      
      const style = getComputedStyle(heroGrid);
      return {
        gridTemplateColumns: style.gridTemplateColumns,
        display: style.display
      };
    });
    
    console.log('Grid template on mobile:', gridTemplate);
  });
});
