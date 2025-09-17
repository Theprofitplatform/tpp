const { chromium } = require('playwright');

async function testCompleteMobileLayout() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log('📱 COMPLETE MOBILE LAYOUT TEST...');
        await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        const viewports = [
            { name: 'Mobile', width: 375, height: 812 },
            { name: 'Tablet', width: 768, height: 1024 }
        ];

        for (const viewport of viewports) {
            console.log(`\n📱 ${viewport.name} (${viewport.width}x${viewport.height})`);
            console.log('='.repeat(50));

            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.waitForTimeout(500);

            const layoutAnalysis = await page.evaluate(() => {
                const header = document.getElementById('header');
                const main = document.querySelector('main');
                const hero = document.querySelector('[class*="hero"]');
                const body = document.body;

                const getElementInfo = (element, name) => {
                    if (!element) return null;
                    const rect = element.getBoundingClientRect();
                    const styles = window.getComputedStyle(element);
                    return {
                        name,
                        rect: {
                            top: Math.round(rect.top),
                            height: Math.round(rect.height),
                            bottom: Math.round(rect.bottom)
                        },
                        styles: {
                            position: styles.position,
                            paddingTop: styles.paddingTop,
                            marginTop: styles.marginTop,
                            display: styles.display
                        },
                        classes: Array.from(element.classList)
                    };
                };

                return {
                    viewport: { width: window.innerWidth, height: window.innerHeight },
                    scrollHeight: document.documentElement.scrollHeight,
                    elements: {
                        header: getElementInfo(header, 'HEADER'),
                        main: getElementInfo(main, 'MAIN'),
                        hero: getElementInfo(hero, 'HERO'),
                        body: getElementInfo(body, 'BODY')
                    }
                };
            });

            console.log(`Viewport: ${layoutAnalysis.viewport.width}x${layoutAnalysis.viewport.height}`);
            console.log(`Page Height: ${layoutAnalysis.scrollHeight}px`);

            Object.values(layoutAnalysis.elements).forEach(element => {
                if (element) {
                    console.log(`\n${element.name}:`);
                    console.log(`  Classes: ${element.classes.join(', ')}`);
                    console.log(`  Position: ${element.styles.position}`);
                    console.log(`  Display: ${element.styles.display}`);
                    console.log(`  Top: ${element.rect.top}px`);
                    console.log(`  Height: ${element.rect.height}px`);
                    console.log(`  Bottom: ${element.rect.bottom}px`);
                    console.log(`  Padding Top: ${element.styles.paddingTop}`);
                    console.log(`  Margin Top: ${element.styles.marginTop}`);

                    // Check visibility
                    if (element.rect.top >= layoutAnalysis.viewport.height) {
                        console.log(`  📍 BELOW VIEWPORT (need to scroll to see)`);
                    } else if (element.rect.bottom <= 0) {
                        console.log(`  📍 ABOVE VIEWPORT`);
                    } else {
                        console.log(`  📍 VISIBLE IN VIEWPORT`);
                    }
                }
            });

            // Check navbar covering content
            if (layoutAnalysis.elements.header && layoutAnalysis.elements.hero) {
                const gap = layoutAnalysis.elements.hero.rect.top - layoutAnalysis.elements.header.rect.bottom;
                console.log(`\nGap between navbar and hero: ${gap}px`);

                if (gap < 0) {
                    console.log('⚠️  WARNING: Navbar overlapping hero content!');
                } else if (gap === 0) {
                    console.log('✅ Hero starts immediately after navbar');
                } else {
                    console.log(`✅ Hero positioned ${gap}px below navbar`);
                }
            }

            // Take full page screenshot
            await page.screenshot({
                path: `complete-layout-${viewport.name.toLowerCase()}.png`,
                fullPage: true
            });

            // Take viewport screenshot
            await page.screenshot({
                path: `viewport-layout-${viewport.name.toLowerCase()}.png`,
                fullPage: false
            });

            // Scroll to hero and take screenshot
            await page.evaluate(() => {
                const hero = document.querySelector('[class*="hero"]');
                if (hero) hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            await page.waitForTimeout(1000);

            await page.screenshot({
                path: `hero-scrolled-${viewport.name.toLowerCase()}.png`,
                fullPage: false
            });
        }

        console.log('\n✅ COMPLETE LAYOUT TEST FINISHED!');
        console.log('Screenshots saved:');
        console.log('- complete-layout-*.png (full page)');
        console.log('- viewport-layout-*.png (viewport only)');
        console.log('- hero-scrolled-*.png (hero in view)');

        await page.waitForTimeout(5000);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

testCompleteMobileLayout();