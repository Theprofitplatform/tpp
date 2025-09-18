const { chromium } = require('playwright');

async function debugMobileSpacing() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log('🔍 DEBUGGING MOBILE HERO SPACING...');
        await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle' });
        await page.setViewportSize({ width: 375, height: 812 });
        await page.waitForTimeout(1000);

        // Get detailed information about all elements between header and hero
        const spacingAnalysis = await page.evaluate(() => {
            const header = document.getElementById('header');
            const main = document.querySelector('main');
            const hero = document.querySelector('[class*="hero"]');
            const body = document.body;

            // Get all direct children of body
            const bodyChildren = Array.from(body.children);

            // Get all direct children of main
            const mainChildren = main ? Array.from(main.children) : [];

            const getElementInfo = (element, index) => {
                if (!element) return null;
                const rect = element.getBoundingClientRect();
                const styles = window.getComputedStyle(element);

                return {
                    index,
                    tagName: element.tagName,
                    classes: Array.from(element.classList),
                    id: element.id || null,
                    rect: {
                        top: Math.round(rect.top),
                        height: Math.round(rect.height),
                        bottom: Math.round(rect.bottom),
                        width: Math.round(rect.width)
                    },
                    styles: {
                        position: styles.position,
                        display: styles.display,
                        paddingTop: styles.paddingTop,
                        paddingBottom: styles.paddingBottom,
                        marginTop: styles.marginTop,
                        marginBottom: styles.marginBottom,
                        height: styles.height,
                        minHeight: styles.minHeight,
                        maxHeight: styles.maxHeight
                    },
                    innerHTML: element.innerHTML.substring(0, 100) + (element.innerHTML.length > 100 ? '...' : '')
                };
            };

            return {
                viewport: { width: window.innerWidth, height: window.innerHeight },
                scrollHeight: document.documentElement.scrollHeight,
                header: getElementInfo(header, 'header'),
                main: getElementInfo(main, 'main'),
                hero: getElementInfo(hero, 'hero'),
                bodyChildren: bodyChildren.map((child, i) => getElementInfo(child, i)),
                mainChildren: mainChildren.map((child, i) => getElementInfo(child, i))
            };
        });

        console.log(`\n📱 MOBILE VIEWPORT: ${spacingAnalysis.viewport.width}x${spacingAnalysis.viewport.height}`);
        console.log(`📄 PAGE HEIGHT: ${spacingAnalysis.scrollHeight}px`);

        console.log('\n🔍 HEADER ANALYSIS:');
        if (spacingAnalysis.header) {
            console.log(`Header: ${spacingAnalysis.header.rect.top}px to ${spacingAnalysis.header.rect.bottom}px (height: ${spacingAnalysis.header.rect.height}px)`);
            console.log(`Position: ${spacingAnalysis.header.styles.position}`);
        }

        console.log('\n🔍 MAIN ELEMENT ANALYSIS:');
        if (spacingAnalysis.main) {
            console.log(`Main starts at: ${spacingAnalysis.main.rect.top}px`);
            console.log(`Main height: ${spacingAnalysis.main.rect.height}px`);
            console.log(`Main padding-top: ${spacingAnalysis.main.styles.paddingTop}`);
            console.log(`Main margin-top: ${spacingAnalysis.main.styles.marginTop}`);
            console.log(`Main position: ${spacingAnalysis.main.styles.position}`);
        }

        console.log('\n🔍 HERO ELEMENT ANALYSIS:');
        if (spacingAnalysis.hero) {
            console.log(`Hero starts at: ${spacingAnalysis.hero.rect.top}px`);
            console.log(`Hero height: ${spacingAnalysis.hero.rect.height}px`);
            console.log(`Hero padding-top: ${spacingAnalysis.hero.styles.paddingTop}`);
            console.log(`Hero margin-top: ${spacingAnalysis.hero.styles.marginTop}`);
            console.log(`Hero position: ${spacingAnalysis.hero.styles.position}`);
        }

        console.log('\n🔍 BODY CHILDREN ANALYSIS:');
        spacingAnalysis.bodyChildren.forEach((child, i) => {
            if (child && child.rect.height > 10) { // Skip tiny elements
                console.log(`\n${i}. ${child.tagName}${child.id ? '#' + child.id : ''}${child.classes.length ? '.' + child.classes.join('.') : ''}`);
                console.log(`   Position: ${child.rect.top}px to ${child.rect.bottom}px (height: ${child.rect.height}px)`);
                console.log(`   CSS: position:${child.styles.position}, display:${child.styles.display}`);
                console.log(`   Padding: ${child.styles.paddingTop} / ${child.styles.paddingBottom}`);
                console.log(`   Margin: ${child.styles.marginTop} / ${child.styles.marginBottom}`);

                if (child.rect.height > 500) {
                    console.log(`   ⚠️  LARGE ELEMENT! This might be pushing content down`);
                }
            }
        });

        console.log('\n🔍 MAIN CHILDREN ANALYSIS:');
        spacingAnalysis.mainChildren.forEach((child, i) => {
            if (child && child.rect.height > 10) {
                console.log(`\n${i}. ${child.tagName}${child.id ? '#' + child.id : ''}${child.classes.length ? '.' + child.classes.join('.') : ''}`);
                console.log(`   Position: ${child.rect.top}px to ${child.rect.bottom}px (height: ${child.rect.height}px)`);
                console.log(`   CSS: position:${child.styles.position}, display:${child.styles.display}`);
                console.log(`   Min-height: ${child.styles.minHeight}`);

                if (child.rect.height > 500) {
                    console.log(`   ⚠️  LARGE ELEMENT! This might be the culprit`);
                }
            }
        });

        // Calculate the actual gap
        const headerBottom = spacingAnalysis.header?.rect.bottom || 0;
        const heroTop = spacingAnalysis.hero?.rect.top || 0;
        const actualGap = heroTop - headerBottom;

        console.log(`\n📏 GAP ANALYSIS:`);
        console.log(`Header bottom: ${headerBottom}px`);
        console.log(`Hero top: ${heroTop}px`);
        console.log(`Actual gap: ${actualGap}px`);

        if (actualGap > 200) {
            console.log(`❌ PROBLEM: ${actualGap}px gap is too large!`);
        } else {
            console.log(`✅ Gap looks reasonable`);
        }

        // Look for elements with viewport-sized heights
        console.log('\n🔍 VIEWPORT-SIZED ELEMENTS:');
        const viewportHeight = spacingAnalysis.viewport.height;
        let foundViewportElements = false;

        [...spacingAnalysis.bodyChildren, ...spacingAnalysis.mainChildren].forEach(child => {
            if (child && (child.rect.height >= viewportHeight * 0.8)) {
                console.log(`⚠️  ${child.tagName}.${child.classes.join('.')} has height ${child.rect.height}px (near viewport size)`);
                console.log(`   Min-height: ${child.styles.minHeight}`);
                foundViewportElements = true;
            }
        });

        if (!foundViewportElements) {
            console.log('No viewport-sized elements found');
        }

        // Take screenshot showing the issue
        await page.screenshot({
            path: 'mobile-spacing-debug.png',
            fullPage: true
        });

        // Add visual markers to see the spacing
        await page.addStyleTag({
            content: `
                #header {
                    outline: 5px solid red !important;
                    z-index: 10000 !important;
                }
                .hero-modern {
                    outline: 5px solid blue !important;
                    background: rgba(0, 255, 0, 0.1) !important;
                }
                main {
                    outline: 3px solid orange !important;
                }
                body > *:not(#header):not(main) {
                    outline: 2px solid purple !important;
                }
                /* Add labels */
                #header::after {
                    content: "HEADER";
                    position: absolute;
                    top: -30px;
                    left: 0;
                    background: red;
                    color: white;
                    padding: 5px;
                    font-size: 12px;
                    z-index: 10001;
                }
                .hero-modern::before {
                    content: "HERO";
                    position: absolute;
                    top: -30px;
                    left: 0;
                    background: blue;
                    color: white;
                    padding: 5px;
                    font-size: 12px;
                    z-index: 10001;
                }
            `
        });

        await page.screenshot({
            path: 'mobile-spacing-debug-marked.png',
            fullPage: true
        });

        console.log('\n✅ Mobile spacing debug complete!');
        console.log('Screenshots saved:');
        console.log('- mobile-spacing-debug.png (full page)');
        console.log('- mobile-spacing-debug-marked.png (with visual markers)');

        await page.waitForTimeout(10000);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

debugMobileSpacing();