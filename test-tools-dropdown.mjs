import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();
  
  console.log('Navigating to localhost:4322...');
  await page.goto('http://localhost:4322/', { waitUntil: 'networkidle' });
  
  console.log('Waiting for navigation to load...');
  await page.waitForSelector('.premium-nav', { timeout: 5000 });
  
  // Take screenshot before hover
  console.log('Taking screenshot before hover...');
  await page.screenshot({ path: 'before-hover.png', fullPage: false });
  
  // Check if Tools link exists
  const toolsLink = await page.$('a[data-page="tools"]');
  if (toolsLink) {
    console.log('✓ Tools link found in navbar');
    
    // Get the parent li element
    const toolsDropdown = await page.$('li.nav-dropdown a[data-page="tools"]');
    if (toolsDropdown) {
      console.log('✓ Tools dropdown container found');
      
      // Hover over Tools
      console.log('Hovering over Tools link...');
      await toolsDropdown.hover();
      
      // Wait a bit for animation
      await page.waitForTimeout(500);
      
      // Check if dropdown menu is visible
      const dropdownMenu = await page.$('#tools-dropdown');
      if (dropdownMenu) {
        console.log('✓ Tools dropdown menu element exists');
        
        const isVisible = await dropdownMenu.isVisible();
        console.log('Dropdown visible:', isVisible);
        
        const opacity = await dropdownMenu.evaluate(el => {
          return window.getComputedStyle(el).opacity;
        });
        console.log('Dropdown opacity:', opacity);
        
        const visibility = await dropdownMenu.evaluate(el => {
          return window.getComputedStyle(el).visibility;
        });
        console.log('Dropdown visibility:', visibility);
      } else {
        console.log('✗ Tools dropdown menu (#tools-dropdown) not found');
      }
      
      // Take screenshot after hover
      console.log('Taking screenshot after hover...');
      await page.screenshot({ path: 'after-hover-tools.png', fullPage: false });
      
    } else {
      console.log('✗ Tools is not in a dropdown container');
    }
  } else {
    console.log('✗ Tools link not found');
  }
  
  // Also check Services dropdown for comparison
  console.log('\nChecking Services dropdown for comparison...');
  const servicesDropdown = await page.$('li.nav-dropdown a[data-page="services"]');
  if (servicesDropdown) {
    await servicesDropdown.hover();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'after-hover-services.png', fullPage: false });
    console.log('✓ Services dropdown screenshot taken');
  }
  
  await browser.close();
  console.log('\nScreenshots saved:');
  console.log('- before-hover.png');
  console.log('- after-hover-tools.png');
  console.log('- after-hover-services.png');
})();
