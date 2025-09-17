const { chromium } = require('playwright');

async function testMobileSimple() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log('📱 SIMPLE MOBILE HERO TEST...');
        await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle' });

        // Wait for page to load and check what hero elements exist
        await page.waitForTimeout(2000);

        const heroElements = await page.evaluate(() => {
            const possibleHeroSelectors = [
                '.hero',
                '.hero-section',
                '[class*="hero"]',
                'main .hero',
                'section.hero'
            ];

            const found = [];
            possibleHeroSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    found.push({
                        selector,
                        count: elements.length,
                        classes: Array.from(elements[0].classList),
                        tagName: elements[0].tagName
                    });
                }
            });

            return found;
        });

        console.log('Found hero elements:', heroElements);

        if (heroElements.length === 0) {
            console.log('❌ No hero elements found! Checking page structure...');

            const pageStructure = await page.evaluate(() => {
                const main = document.querySelector('main');
                const sections = document.querySelectorAll('section');
                const divs = document.querySelectorAll('div[class*="hero"], div[class*="banner"]');

                return {
                    hasMain: !!main,
                    mainClasses: main ? Array.from(main.classList) : null,
                    sectionCount: sections.length,
                    sectionClasses: Array.from(sections).slice(0, 3).map(s => Array.from(s.classList)),
                    heroLikeDivs: Array.from(divs).map(d => Array.from(d.classList))
                };
            });

            console.log('Page structure:', JSON.stringify(pageStructure, null, 2));
            return;
        }

        // Use the first found hero element
        const heroSelector = heroElements[0].selector;
        console.log(`\nTesting with hero selector: ${heroSelector}`);

        const mobileViewports = [
            { name: 'Mobile-Small', width: 320, height: 568 },
            { name: 'Mobile-Medium', width: 375, height: 812 },
            { name: 'Mobile-Large', width: 390, height: 844 },
            { name: 'Tablet', width: 768, height: 1024 }
        ];

        for (const viewport of mobileViewports) {
            console.log(`\n📱 ${viewport.name} (${viewport.width}x${viewport.height})`);

            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.waitForTimeout(500);

            const analysis = await page.evaluate((selector) => {
                const hero = document.querySelector(selector);
                if (!hero) return { error: 'Hero not found' };

                const heroStyles = window.getComputedStyle(hero);
                const heroRect = hero.getBoundingClientRect();

                return {
                    paddingTop: heroStyles.paddingTop,
                    marginTop: heroStyles.marginTop,
                    top: Math.round(heroRect.top),
                    width: Math.round(heroRect.width),
                    height: Math.round(heroRect.height)
                };
            }, heroSelector);

            if (analysis.error) {
                console.log(`❌ ${analysis.error}`);
            } else {
                console.log(`  Padding Top: ${analysis.paddingTop}`);
                console.log(`  Margin Top: ${analysis.marginTop}`);
                console.log(`  Position Top: ${analysis.top}px`);

                const paddingValue = parseInt(analysis.paddingTop);
                if (paddingValue === 0) {
                    console.log('  ✅ Hero padding successfully removed!');
                } else {
                    console.log(`  ⚠️  Hero still has ${paddingValue}px padding`);
                }
            }

            // Take screenshot
            await page.screenshot({
                path: `hero-mobile-${viewport.name.toLowerCase()}.png`,
                fullPage: false
            });
        }

        console.log('\n✅ Mobile test complete!');
        await page.waitForTimeout(5000);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

testMobileSimple();