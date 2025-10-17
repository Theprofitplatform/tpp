import { test, expect } from '@playwright/test';

test.describe('Blog Post Final Diagnosis', () => {
  test('diagnose the exact mobile layout issue', async ({ page }) => {
    await page.goto('http://localhost:3001/blog/remarketing-campaigns-that-actually-convert-for-sydney-ecommerce/');
    await page.setViewportSize({ width: 375, height: 800 });
    await page.waitForLoadState('networkidle');
    
    console.log('=== FINAL DIAGNOSIS ===');
    
    // Check the complete structure that user sees at top
    const topElements = await page.evaluate(() => {
      const elements = [];
      
      // Get first 10 elements that are visible in the top 800px
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_ELEMENT,
        {
          acceptNode: function(node) {
            const rect = node.getBoundingClientRect();
            return rect.y < 800 && rect.height > 50 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
          }
        }
      );
      
      let node;
      let count = 0;
      while ((node = walker.nextNode()) && count < 10) {
        const rect = node.getBoundingClientRect();
        elements.push({
          tagName: node.tagName,
          className: node.className,
          text: node.textContent?.substring(0, 50)?.trim() || 'no text',
          y: rect.y,
          height: rect.height
        });
        count++;
      }
      
      return elements;
    });
    
    console.log('Top visible elements:', JSON.stringify(topElements, null, 2));
    
    // Check the blog post structure
    const blogStructure = await page.evaluate(() => {
      const article = document.querySelector('article.blog-post');
      if (!article) return null;
      
      const children = Array.from(article.children);
      return {
        totalChildren: children.length,
        children: children.map((child, index) => {
          const rect = child.getBoundingClientRect();
          return {
            index,
            tagName: child.tagName,
            className: child.className,
            y: rect.y,
            visible: rect.y < window.innerHeight && rect.height > 10,
            isAtTop: rect.y < 200
          };
        })
      };
    });
    
    console.log('Blog post structure:', JSON.stringify(blogStructure, null, 2));
    
    // Take screenshot of what user actually sees at page load
    await page.scrollTo(0, 0);
    await page.screenshot({
      path: 'test-results/blog-post-mobile-user-view.png',
      fullPage: false
    });
    
    console.log('Screenshot saved of user view');
  });
});
