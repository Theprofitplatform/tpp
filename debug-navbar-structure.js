const { chromium } = require('playwright');

async function debugNavbarStructure() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    try {
        console.log('🔍 Debugging navbar structural positioning...');
        await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle' });
        await page.waitForSelector('#header', { timeout: 10000 });

        // Analyze the complete navbar structure and positioning
        const structuralAnalysis = await page.evaluate(() => {
            const header = document.getElementById('header');
            const body = document.body;
            const html = document.documentElement;

            // Get all positioning info
            const getElementInfo = (element, name) => {
                if (!element) return null;

                const rect = element.getBoundingClientRect();
                const styles = window.getComputedStyle(element);

                return {
                    name,
                    rect: {
                        x: Math.round(rect.x),
                        y: Math.round(rect.y),
                        width: Math.round(rect.width),
                        height: Math.round(rect.height),
                        top: Math.round(rect.top),
                        right: Math.round(rect.right),
                        bottom: Math.round(rect.bottom),
                        left: Math.round(rect.left)
                    },
                    styles: {
                        position: styles.position,
                        top: styles.top,
                        left: styles.left,
                        right: styles.right,
                        bottom: styles.bottom,
                        width: styles.width,
                        height: styles.height,
                        maxWidth: styles.maxWidth,
                        transform: styles.transform,
                        margin: styles.margin,
                        padding: styles.padding,
                        zIndex: styles.zIndex,
                        overflow: styles.overflow
                    },
                    className: element.className,
                    id: element.id
                };
            };

            // Check all navbar-related elements
            const navbarContainer = header?.querySelector('.nav-floating-container');
            const container = header?.querySelector('.container');
            const nav = header?.querySelector('nav');
            const navLinks = header?.querySelector('.nav-links');

            return {
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    scrollY: window.scrollY
                },
                elements: {
                    html: getElementInfo(html, 'HTML'),
                    body: getElementInfo(body, 'BODY'),
                    header: getElementInfo(header, 'HEADER #header'),
                    navbarContainer: getElementInfo(navbarContainer, 'nav-floating-container'),
                    container: getElementInfo(container, 'container'),
                    nav: getElementInfo(nav, 'NAV'),
                    navLinks: getElementInfo(navLinks, 'nav-links')
                },
                isHeaderAboveViewport: header ? header.getBoundingClientRect().bottom < 0 : false,
                isHeaderBelowViewport: header ? header.getBoundingClientRect().top > window.innerHeight : false,
                headerVisibleHeight: header ? Math.max(0, Math.min(header.getBoundingClientRect().bottom, window.innerHeight) - Math.max(header.getBoundingClientRect().top, 0)) : 0
            };
        });

        console.log('\n📋 STRUCTURAL ANALYSIS REPORT:');
        console.log('='.repeat(50));

        console.log(`\n🖥️  VIEWPORT: ${structuralAnalysis.viewport.width}x${structuralAnalysis.viewport.height}`);
        console.log(`📜 SCROLL POSITION: ${structuralAnalysis.viewport.scrollY}px`);

        console.log(`\n⚠️  NAVBAR VISIBILITY CHECKS:`);
        console.log(`- Header above viewport: ${structuralAnalysis.isHeaderAboveViewport}`);
        console.log(`- Header below viewport: ${structuralAnalysis.isHeaderBelowViewport}`);
        console.log(`- Header visible height: ${structuralAnalysis.headerVisibleHeight}px`);

        // Analyze each element in the hierarchy
        Object.entries(structuralAnalysis.elements).forEach(([key, element]) => {
            if (element) {
                console.log(`\n📦 ${element.name.toUpperCase()}:`);
                console.log(`   Position: ${element.styles.position}`);
                console.log(`   Location: (${element.rect.x}, ${element.rect.y}) | Size: ${element.rect.width}x${element.rect.height}`);
                console.log(`   CSS Position: top:${element.styles.top}, left:${element.styles.left}, right:${element.styles.right}`);
                console.log(`   Transform: ${element.styles.transform}`);
                console.log(`   Z-Index: ${element.styles.zIndex}`);
                console.log(`   Boundaries: top:${element.rect.top}, right:${element.rect.right}, bottom:${element.rect.bottom}, left:${element.rect.left}`);

                // Check for problematic positioning
                if (element.rect.top < -100) {
                    console.log(`   🚨 WARNING: Element positioned way above viewport (top: ${element.rect.top}px)`);
                }
                if (element.rect.right > structuralAnalysis.viewport.width + 100) {
                    console.log(`   🚨 WARNING: Element extends far beyond viewport (right: ${element.rect.right}px vs ${structuralAnalysis.viewport.width}px)`);
                }
                if (element.rect.left < -100) {
                    console.log(`   🚨 WARNING: Element positioned far left of viewport (left: ${element.rect.left}px)`);
                }
            }
        });

        // Take screenshots showing the structure
        console.log('\n📸 Taking structural debug screenshots...');

        // Full page screenshot
        await page.screenshot({
            path: 'navbar-structure-full.png',
            fullPage: true
        });

        // Viewport only
        await page.screenshot({
            path: 'navbar-structure-viewport.png',
            fullPage: false
        });

        // Extended top area to catch navbar if it's above
        await page.screenshot({
            path: 'navbar-structure-extended.png',
            fullPage: false,
            clip: { x: 0, y: -200, width: 1920, height: 500 }
        });

        // Highlight the navbar structure visually
        await page.addStyleTag({
            content: `
                #header {
                    outline: 5px solid red !important;
                    outline-offset: 0px !important;
                }
                .nav-floating-container {
                    outline: 3px solid blue !important;
                    outline-offset: -3px !important;
                }
                .container {
                    outline: 2px solid green !important;
                    outline-offset: -2px !important;
                }
                nav {
                    outline: 2px solid orange !important;
                    outline-offset: -2px !important;
                }
                .nav-links {
                    outline: 1px solid purple !important;
                    outline-offset: -1px !important;
                }

                /* Add labels */
                #header::before {
                    content: "HEADER";
                    position: absolute;
                    top: -25px;
                    left: 0;
                    background: red;
                    color: white;
                    padding: 2px 8px;
                    font-size: 12px;
                    font-weight: bold;
                    z-index: 10000;
                }
            `
        });

        await page.screenshot({
            path: 'navbar-structure-highlighted.png',
            fullPage: false,
            clip: { x: 0, y: -100, width: 1920, height: 400 }
        });

        console.log('\n📋 STRUCTURAL DIAGNOSIS COMPLETE');
        console.log('Check these files for visual analysis:');
        console.log('- navbar-structure-full.png (complete page)');
        console.log('- navbar-structure-viewport.png (current viewport)');
        console.log('- navbar-structure-extended.png (extended top area)');
        console.log('- navbar-structure-highlighted.png (with element outlines)');

        // Keep browser open for manual inspection
        console.log('\nBrowser open for 20 seconds for manual inspection...');
        await page.waitForTimeout(20000);

    } catch (error) {
        console.error('Error during structural debug:', error);
    } finally {
        await browser.close();
    }
}

debugNavbarStructure();