const { chromium } = require('playwright');

async function testDropdownQuick() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    const problematicPages = ['index.html', 'services.html'];
    const baseUrl = 'http://localhost:3000';

    try {
        console.log('🔍 TESTING DROPDOWN HOVER FUNCTIONALITY');
        console.log('========================================');

        for (const pageName of problematicPages) {
            console.log(`\n📄 Testing ${pageName}...`);

            try {
                await page.goto(`${baseUrl}/${pageName}`, { waitUntil: 'networkidle' });
                await page.waitForTimeout(1000);

                // Test dropdown hover
                console.log('  🖱️  Testing dropdown hover...');

                const servicesLink = await page.locator('.nav-dropdown a, .premium-dropdown a').first();

                if (await servicesLink.count() > 0) {
                    await servicesLink.hover();
                    await page.waitForTimeout(1000);

                    const dropdownVisible = await page.locator('.dropdown-menu, .mega-dropdown').isVisible();

                    if (dropdownVisible) {
                        console.log('  ✅ Dropdown menu visible on hover');

                        // Test if dropdown items are clickable
                        const dropdownItems = await page.locator('.dropdown-item').count();
                        console.log(`  ✅ Found ${dropdownItems} dropdown items`);

                    } else {
                        console.log('  ❌ Dropdown menu not visible on hover');

                        // Debug information
                        const dropdownMenu = await page.locator('.dropdown-menu, .mega-dropdown').first();
                        const opacity = await dropdownMenu.evaluate(el => window.getComputedStyle(el).opacity);
                        const visibility = await dropdownMenu.evaluate(el => window.getComputedStyle(el).visibility);
                        const display = await dropdownMenu.evaluate(el => window.getComputedStyle(el).display);

                        console.log(`    Debug: opacity=${opacity}, visibility=${visibility}, display=${display}`);
                    }
                } else {
                    console.log('  ❌ Services dropdown link not found');
                }

            } catch (error) {
                console.log(`  ❌ Error testing ${pageName}: ${error.message}`);
            }
        }

        console.log('\n✅ DROPDOWN QUICK TEST COMPLETE');

    } catch (error) {
        console.error('Error during testing:', error);
    } finally {
        await browser.close();
    }
}

testDropdownQuick();