const { chromium } = require('playwright');

async function testNavbarFix() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    try {
        console.log('Loading the fixed website...');
        await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle' });

        // Wait for the navbar to be visible
        await page.waitForSelector('#header', { timeout: 10000 });

        console.log('Testing navbar at top of page...');

        // Get navbar computed styles and positioning
        const topNavbarStyles = await page.evaluate(() => {
            const header = document.getElementById('header');
            const container = header.querySelector('.container');
            const headerRect = header.getBoundingClientRect();
            const containerRect = container ? container.getBoundingClientRect() : null;

            const headerStyles = window.getComputedStyle(header);
            const containerStyles = container ? window.getComputedStyle(container) : null;

            return {
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                header: {
                    position: headerStyles.position,
                    top: headerStyles.top,
                    left: headerStyles.left,
                    width: headerStyles.width,
                    maxWidth: headerStyles.maxWidth,
                    transform: headerStyles.transform,
                    rect: {
                        x: Math.round(headerRect.x),
                        y: Math.round(headerRect.y),
                        width: Math.round(headerRect.width),
                        height: Math.round(headerRect.height),
                        right: Math.round(headerRect.right)
                    }
                },
                container: containerStyles ? {
                    maxWidth: containerStyles.maxWidth,
                    width: containerStyles.width,
                    padding: containerStyles.padding,
                    rect: {
                        x: Math.round(containerRect.x),
                        y: Math.round(containerRect.y),
                        width: Math.round(containerRect.width),
                        height: Math.round(containerRect.height),
                        right: Math.round(containerRect.right)
                    }
                } : null
            };
        });

        console.log('Navbar at top:', JSON.stringify(topNavbarStyles, null, 2));

        // Check if navbar extends beyond viewport
        const isOverflowing = topNavbarStyles.header.rect.right > topNavbarStyles.viewport.width;
        console.log(`Navbar overflow check: ${isOverflowing ? 'OVERFLOW DETECTED' : 'NO OVERFLOW'}`);
        console.log(`Navbar right edge: ${topNavbarStyles.header.rect.right}px, Viewport width: ${topNavbarStyles.viewport.width}px`);

        // Take screenshot at top
        await page.screenshot({
            path: 'navbar-fixed-top.png',
            fullPage: false,
            clip: { x: 0, y: 0, width: 1920, height: 200 }
        });

        console.log('Scrolling to test navbar behavior...');

        // Test different scroll positions
        const scrollPositions = [300, 600, 1000];

        for (const scrollY of scrollPositions) {
            await page.evaluate((y) => window.scrollTo(0, y), scrollY);
            await page.waitForTimeout(500); // Wait for scroll animation

            const scrolledStyles = await page.evaluate(() => {
                const header = document.getElementById('header');
                const headerRect = header.getBoundingClientRect();
                const headerStyles = window.getComputedStyle(header);

                return {
                    scrollY: window.scrollY,
                    hasScrolledClass: header.classList.contains('scrolled'),
                    rect: {
                        x: Math.round(headerRect.x),
                        y: Math.round(headerRect.y),
                        width: Math.round(headerRect.width),
                        right: Math.round(headerRect.right)
                    },
                    styles: {
                        top: headerStyles.top,
                        width: headerStyles.width,
                        maxWidth: headerStyles.maxWidth,
                        transform: headerStyles.transform
                    }
                };
            });

            console.log(`At scroll ${scrollY}px:`, JSON.stringify(scrolledStyles, null, 2));

            const scrollOverflow = scrolledStyles.rect.right > 1920;
            console.log(`  Overflow: ${scrollOverflow ? 'YES' : 'NO'} (right edge: ${scrolledStyles.rect.right}px)`);
        }

        // Take final screenshot after scrolling
        await page.screenshot({
            path: 'navbar-fixed-scrolled.png',
            fullPage: false,
            clip: { x: 0, y: 0, width: 1920, height: 200 }
        });

        // Test on different viewport sizes
        console.log('\nTesting different viewport sizes...');

        const viewportSizes = [
            { width: 1600, height: 900 },
            { width: 1440, height: 900 },
            { width: 1366, height: 768 },
            { width: 1280, height: 720 }
        ];

        for (const size of viewportSizes) {
            await page.setViewportSize(size);
            await page.evaluate(() => window.scrollTo(0, 0)); // Reset to top
            await page.waitForTimeout(300);

            const sizeTest = await page.evaluate(() => {
                const header = document.getElementById('header');
                const headerRect = header.getBoundingClientRect();

                return {
                    viewport: {
                        width: window.innerWidth,
                        height: window.innerHeight
                    },
                    navbar: {
                        width: Math.round(headerRect.width),
                        right: Math.round(headerRect.right)
                    }
                };
            });

            const overflow = sizeTest.navbar.right > sizeTest.viewport.width;
            console.log(`${size.width}x${size.height}: navbar ${sizeTest.navbar.width}px, overflow: ${overflow ? 'YES' : 'NO'}`);
        }

        console.log('\n✅ Navbar fix test completed! Check the screenshots for visual confirmation.');
        console.log('Browser will close in 5 seconds...');
        await page.waitForTimeout(5000);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

testNavbarFix();