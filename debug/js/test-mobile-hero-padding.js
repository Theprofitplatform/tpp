const { chromium } = require('playwright');

async function testMobileHeroPadding() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log('📱 TESTING HERO PADDING ON MOBILE DEVICES...');
        await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle' });
        await page.waitForSelector('.hero', { timeout: 10000 });

        const mobileViewports = [
            { name: 'iPhone 13 Pro', width: 390, height: 844 },
            { name: 'iPhone 13', width: 375, height: 812 },
            { name: 'iPhone SE', width: 375, height: 667 },
            { name: 'Samsung Galaxy S21', width: 360, height: 800 },
            { name: 'iPad Mini', width: 768, height: 1024 },
            { name: 'iPad', width: 820, height: 1180 },
            { name: 'Small Mobile', width: 320, height: 568 }
        ];

        for (const viewport of mobileViewports) {
            console.log(`\n📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
            console.log('='.repeat(50));

            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.waitForTimeout(500); // Let layout settle

            const heroAnalysis = await page.evaluate(() => {
                const hero = document.querySelector('.hero');
                const main = document.querySelector('main');
                const header = document.getElementById('header');

                if (!hero) return { error: 'Hero element not found' };

                const heroStyles = window.getComputedStyle(hero);
                const mainStyles = main ? window.getComputedStyle(main) : null;
                const headerStyles = header ? window.getComputedStyle(header) : null;

                const heroRect = hero.getBoundingClientRect();
                const headerRect = header ? header.getBoundingClientRect() : null;

                return {
                    viewport: {
                        width: window.innerWidth,
                        height: window.innerHeight
                    },
                    hero: {
                        paddingTop: heroStyles.paddingTop,
                        marginTop: heroStyles.marginTop,
                        position: heroStyles.position,
                        rect: {
                            top: Math.round(heroRect.top),
                            left: Math.round(heroRect.left),
                            width: Math.round(heroRect.width),
                            height: Math.round(heroRect.height)
                        }
                    },
                    main: mainStyles ? {
                        paddingTop: mainStyles.paddingTop,
                        marginTop: mainStyles.marginTop
                    } : null,
                    header: headerStyles ? {
                        position: headerStyles.position,
                        top: headerStyles.top,
                        height: headerRect ? Math.round(headerRect.height) : null,
                        rect: headerRect ? {
                            top: Math.round(headerRect.top),
                            height: Math.round(headerRect.height)
                        } : null
                    } : null,
                    isHeroUnderNavbar: headerRect && heroRect ? heroRect.top < (headerRect.bottom + 20) : false,
                    gap: headerRect && heroRect ? Math.round(heroRect.top - headerRect.bottom) : null
                };
            });

            if (heroAnalysis.error) {
                console.log(`❌ Error: ${heroAnalysis.error}`);
                continue;
            }

            console.log(`Hero Padding Top: ${heroAnalysis.hero.paddingTop}`);
            console.log(`Hero Margin Top: ${heroAnalysis.hero.marginTop}`);
            console.log(`Hero Top Position: ${heroAnalysis.hero.rect.top}px`);

            if (heroAnalysis.main) {
                console.log(`Main Padding Top: ${heroAnalysis.main.paddingTop}`);
                console.log(`Main Margin Top: ${heroAnalysis.main.marginTop}`);
            }

            if (heroAnalysis.header) {
                console.log(`Header Height: ${heroAnalysis.header.rect.height}px`);
                console.log(`Header Bottom: ${heroAnalysis.header.rect.top + heroAnalysis.header.rect.height}px`);
                console.log(`Gap between Header and Hero: ${heroAnalysis.gap}px`);
            }

            // Check if hero is properly positioned
            if (heroAnalysis.isHeroUnderNavbar) {
                console.log('⚠️  WARNING: Hero content may be hidden under navbar!');
            } else {
                console.log('✅ Hero positioned correctly below navbar');
            }

            // Check for padding issues
            const paddingTopValue = parseInt(heroAnalysis.hero.paddingTop);
            if (paddingTopValue > 0) {
                console.log(`⚠️  WARNING: Hero still has ${paddingTopValue}px top padding!`);
            } else {
                console.log('✅ Hero top padding successfully removed (0px)');
            }

            // Take screenshot for this viewport
            await page.screenshot({
                path: `mobile-hero-${viewport.name.replace(/\s+/g, '-').toLowerCase()}.png`,
                fullPage: false
            });
        }

        // Test specific mobile breakpoints where CSS might change
        console.log('\n📱 TESTING CSS BREAKPOINT BEHAVIOR...');
        console.log('='.repeat(50));

        const breakpoints = [968, 768, 480, 320];

        for (const width of breakpoints) {
            console.log(`\n📱 Testing breakpoint: ${width}px`);
            await page.setViewportSize({ width: width, height: 800 });
            await page.waitForTimeout(300);

            const breakpointAnalysis = await page.evaluate(() => {
                const hero = document.querySelector('.hero');
                if (!hero) return null;

                const heroStyles = window.getComputedStyle(hero);

                // Check all possible CSS rules that might affect hero
                const allRules = [];
                const sheets = Array.from(document.styleSheets);

                for (const sheet of sheets) {
                    try {
                        const cssRules = Array.from(sheet.cssRules || sheet.rules || []);
                        for (const rule of cssRules) {
                            if (rule.type === CSSRule.STYLE_RULE) {
                                try {
                                    if (hero.matches(rule.selectorText)) {
                                        const paddingTop = rule.style.getPropertyValue('padding-top');
                                        if (paddingTop) {
                                            allRules.push({
                                                selector: rule.selectorText,
                                                paddingTop: paddingTop,
                                                priority: rule.style.getPropertyPriority('padding-top'),
                                                href: sheet.href || 'inline'
                                            });
                                        }
                                    }
                                } catch (e) {
                                    // Skip invalid selectors
                                }
                            }
                        }
                    } catch (e) {
                        // Skip inaccessible stylesheets
                    }
                }

                return {
                    computedPaddingTop: heroStyles.paddingTop,
                    matchingRules: allRules
                };
            });

            if (breakpointAnalysis) {
                console.log(`Computed Padding Top: ${breakpointAnalysis.computedPaddingTop}`);
                console.log(`Matching CSS Rules: ${breakpointAnalysis.matchingRules.length}`);

                breakpointAnalysis.matchingRules.forEach((rule, i) => {
                    console.log(`  ${i + 1}. ${rule.selector} { padding-top: ${rule.paddingTop}${rule.priority ? ' !important' : ''} } [${rule.href}]`);
                });

                const paddingValue = parseInt(breakpointAnalysis.computedPaddingTop);
                if (paddingValue > 0) {
                    console.log(`❌ ISSUE: Hero has ${paddingValue}px padding at ${width}px breakpoint`);
                } else {
                    console.log(`✅ SUCCESS: Hero padding removed at ${width}px breakpoint`);
                }
            }
        }

        console.log('\n✅ MOBILE HERO PADDING TEST COMPLETED!');
        console.log('Screenshots saved for each device/breakpoint');
        console.log('\nBrowser staying open for 15 seconds for manual inspection...');
        await page.waitForTimeout(15000);

    } catch (error) {
        console.error('Error during mobile test:', error);
    } finally {
        await browser.close();
    }
}

testMobileHeroPadding();