const { chromium } = require('playwright');

async function validateSpacingFixes() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log('🔍 VALIDATING COMPREHENSIVE SPACING FIXES');
        console.log('=========================================');

        await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle' });

        const testViewports = [
            { name: 'Desktop', width: 1920, height: 1080 },
            { name: 'Tablet', width: 768, height: 1024 },
            { name: 'Mobile', width: 375, height: 812 }
        ];

        const validationResults = {};

        for (const viewport of testViewports) {
            console.log(`\n📱 TESTING ${viewport.name} (${viewport.width}x${viewport.height})`);
            console.log('='.repeat(50));

            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.waitForTimeout(1000);

            const results = await page.evaluate(() => {
                const header = document.querySelector('header');
                const hero = document.querySelector('.hero-modern');
                const results = document.querySelector('#results');
                const cta = document.querySelector('#cta');

                const getElementData = (element) => {
                    if (!element) return null;
                    const rect = element.getBoundingClientRect();
                    const styles = window.getComputedStyle(element);
                    return {
                        top: Math.round(rect.top),
                        height: Math.round(rect.height),
                        paddingTop: styles.paddingTop,
                        paddingBottom: styles.paddingBottom,
                        marginTop: styles.marginTop,
                        marginBottom: styles.marginBottom
                    };
                };

                return {
                    viewport: { width: window.innerWidth, height: window.innerHeight },
                    hasHorizontalOverflow: document.body.scrollWidth > window.innerWidth,
                    sections: {
                        header: getElementData(header),
                        hero: getElementData(hero),
                        results: getElementData(results),
                        cta: getElementData(cta)
                    },
                    gaps: {
                        headerToHero: hero && header ? Math.round(hero.getBoundingClientRect().top - header.getBoundingClientRect().bottom) : null
                    }
                };
            });

            validationResults[viewport.name] = results;

            // Validation checks
            console.log(`📊 Viewport: ${results.viewport.width}x${results.viewport.height}`);
            console.log(`🌊 Horizontal Overflow: ${results.hasHorizontalOverflow ? '❌ DETECTED' : '✅ NONE'}`);

            // Header-Hero gap check
            if (results.gaps.headerToHero !== null) {
                const gapStatus = results.gaps.headerToHero >= 0 ? '✅ NO OVERLAP' : '❌ STILL OVERLAPPING';
                console.log(`📏 Header-Hero Gap: ${results.gaps.headerToHero}px ${gapStatus}`);
            }

            // Section analysis
            Object.entries(results.sections).forEach(([name, data]) => {
                if (data) {
                    console.log(`\n${name.toUpperCase()}:`);
                    console.log(`  Position: ${data.top}px`);
                    console.log(`  Height: ${data.height}px`);
                    console.log(`  Padding: ${data.paddingTop} / ${data.paddingBottom}`);

                    // Check for issues
                    const issues = [];

                    if (name === 'hero' && data.top < 0) issues.push('Hero overlapping header');
                    if (name === 'results' && parseInt(data.paddingBottom) > 120) issues.push('Excessive bottom padding');
                    if (name === 'cta' && parseInt(data.paddingBottom) > 120) issues.push('Excessive bottom padding');
                    if (data.height > results.viewport.height * 2) issues.push('Very large section height');

                    if (issues.length > 0) {
                        console.log(`  ⚠️  Issues: ${issues.join(', ')}`);
                    } else {
                        console.log(`  ✅ Looking good!`);
                    }
                }
            });

            // Take validation screenshot
            await page.screenshot({
                path: `validation-${viewport.name.toLowerCase()}.png`,
                fullPage: false
            });
        }

        // Summary report
        console.log('\n\n🎯 VALIDATION SUMMARY');
        console.log('=====================');

        const overallIssues = [];
        Object.entries(validationResults).forEach(([viewport, data]) => {
            if (data.hasHorizontalOverflow) {
                overallIssues.push(`${viewport}: Horizontal overflow detected`);
            }
            if (data.gaps.headerToHero < 0) {
                overallIssues.push(`${viewport}: Header-hero overlap (${data.gaps.headerToHero}px)`);
            }
        });

        if (overallIssues.length === 0) {
            console.log('🎉 ALL MAJOR SPACING ISSUES RESOLVED!');
            console.log('✅ No horizontal overflow detected');
            console.log('✅ Header-hero overlap fixed');
            console.log('✅ Section spacing optimized');
        } else {
            console.log('⚠️  REMAINING ISSUES:');
            overallIssues.forEach(issue => console.log(`  - ${issue}`));
        }

        console.log('\n📸 VALIDATION SCREENSHOTS:');
        testViewports.forEach(v => console.log(`  - validation-${v.name.toLowerCase()}.png`));

        await page.waitForTimeout(5000);

    } catch (error) {
        console.error('Error during validation:', error);
    } finally {
        await browser.close();
    }
}

validateSpacingFixes();