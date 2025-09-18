const { chromium } = require('playwright');

async function testNavbarFunctionality() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log('🔍 TESTING NAVBAR FUNCTIONALITY');
        console.log('===============================');

        await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle' });

        const viewports = [
            { name: 'Desktop', width: 1920, height: 1080 },
            { name: 'Tablet', width: 768, height: 1024 },
            { name: 'Mobile', width: 375, height: 812 }
        ];

        for (const viewport of viewports) {
            console.log(`\n📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);

            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.waitForTimeout(1000);

            const navbarTest = await page.evaluate(() => {
                const header = document.querySelector('header');
                const navbar = document.querySelector('.premium-nav');

                if (!header) return { error: 'Header not found' };

                const headerRect = header.getBoundingClientRect();
                const headerStyles = window.getComputedStyle(header);

                return {
                    visible: headerRect.width > 0 && headerRect.height > 0,
                    position: headerStyles.position,
                    top: headerStyles.top,
                    left: headerStyles.left,
                    width: Math.round(headerRect.width),
                    height: Math.round(headerRect.height),
                    rect: {
                        top: Math.round(headerRect.top),
                        left: Math.round(headerRect.left),
                        right: Math.round(headerRect.right)
                    },
                    isOverflowing: headerRect.right > window.innerWidth,
                    zIndex: headerStyles.zIndex
                };
            });

            if (navbarTest.error) {
                console.log(`  ❌ ${navbarTest.error}`);
                continue;
            }

            console.log(`  📏 Size: ${navbarTest.width}x${navbarTest.height}px`);
            console.log(`  📍 Position: ${navbarTest.position} at ${navbarTest.rect.top}px`);
            console.log(`  🌊 Overflow: ${navbarTest.isOverflowing ? '❌ YES' : '✅ NO'}`);
            console.log(`  👁️ Visible: ${navbarTest.visible ? '✅ YES' : '❌ NO'}`);
            console.log(`  📚 Z-Index: ${navbarTest.zIndex}`);

            // Test navbar links
            const linksTest = await page.evaluate(() => {
                const links = document.querySelectorAll('.nav-links a');
                return {
                    count: links.length,
                    visible: Array.from(links).some(link => {
                        const rect = link.getBoundingClientRect();
                        return rect.width > 0 && rect.height > 0;
                    })
                };
            });

            console.log(`  🔗 Links: ${linksTest.count} found, ${linksTest.visible ? '✅ visible' : '❌ hidden'}`);

            // Test mobile menu toggle if mobile
            if (viewport.width <= 768) {
                const mobileMenuTest = await page.evaluate(() => {
                    const toggle = document.querySelector('.menu-toggle');
                    if (!toggle) return { error: 'Mobile menu toggle not found' };

                    const toggleRect = toggle.getBoundingClientRect();
                    const toggleStyles = window.getComputedStyle(toggle);

                    return {
                        visible: toggleRect.width > 0 && toggleRect.height > 0,
                        display: toggleStyles.display
                    };
                });

                if (mobileMenuTest.error) {
                    console.log(`  📱 Mobile Menu: ❌ ${mobileMenuTest.error}`);
                } else {
                    console.log(`  📱 Mobile Menu: ${mobileMenuTest.visible ? '✅ visible' : '❌ hidden'} (${mobileMenuTest.display})`);
                }
            }

            await page.screenshot({
                path: `navbar-test-${viewport.name.toLowerCase()}.png`,
                fullPage: false
            });
        }

        console.log('\n✅ NAVBAR FUNCTIONALITY TEST COMPLETE');
        console.log('Screenshots saved for visual verification');

        await page.waitForTimeout(5000);

    } catch (error) {
        console.error('Error testing navbar:', error);
    } finally {
        await browser.close();
    }
}

testNavbarFunctionality();