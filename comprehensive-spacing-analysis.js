const { chromium } = require('playwright');

async function comprehensiveSpacingAnalysis() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        console.log('🔍 COMPREHENSIVE WEBSITE SPACING & POLISH ANALYSIS');
        console.log('==================================================');

        await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle' });

        const viewports = [
            { name: 'Desktop-4K', width: 3840, height: 2160 },
            { name: 'Desktop-Large', width: 1920, height: 1080 },
            { name: 'Desktop-Medium', width: 1440, height: 900 },
            { name: 'Desktop-Standard', width: 1280, height: 720 },
            { name: 'Laptop', width: 1024, height: 768 },
            { name: 'Tablet-Large', width: 834, height: 1194 },
            { name: 'Tablet-Medium', width: 768, height: 1024 },
            { name: 'Mobile-Large', width: 428, height: 926 },
            { name: 'Mobile-Standard', width: 390, height: 844 },
            { name: 'Mobile-Medium', width: 375, height: 812 },
            { name: 'Mobile-Small', width: 320, height: 568 }
        ];

        const analysisResults = {};

        for (const viewport of viewports) {
            console.log(`\n📱 ANALYZING ${viewport.name} (${viewport.width}x${viewport.height})`);
            console.log('='.repeat(60));

            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.waitForTimeout(1000);

            const analysis = await page.evaluate(() => {
                const sections = [
                    'header',
                    '.hero-modern',
                    '.trust-signals-bar',
                    '#results',
                    '#services',
                    '#process',
                    '#pricing',
                    '#faq',
                    '#cta',
                    '#contact',
                    'footer'
                ];

                const getElementAnalysis = (selector) => {
                    const element = document.querySelector(selector);
                    if (!element) return null;

                    const rect = element.getBoundingClientRect();
                    const styles = window.getComputedStyle(element);

                    return {
                        selector,
                        visible: rect.width > 0 && rect.height > 0,
                        rect: {
                            top: Math.round(rect.top),
                            bottom: Math.round(rect.bottom),
                            height: Math.round(rect.height),
                            width: Math.round(rect.width)
                        },
                        spacing: {
                            paddingTop: styles.paddingTop,
                            paddingBottom: styles.paddingBottom,
                            marginTop: styles.marginTop,
                            marginBottom: styles.marginBottom
                        },
                        typography: {
                            fontSize: styles.fontSize,
                            lineHeight: styles.lineHeight,
                            fontWeight: styles.fontWeight
                        },
                        layout: {
                            position: styles.position,
                            display: styles.display,
                            flexDirection: styles.flexDirection,
                            gap: styles.gap,
                            gridGap: styles.gridGap
                        },
                        background: {
                            backgroundColor: styles.backgroundColor,
                            backgroundImage: styles.backgroundImage !== 'none' ? 'has-image' : 'none'
                        },
                        issues: []
                    };
                };

                const results = {};

                sections.forEach(selector => {
                    const analysis = getElementAnalysis(selector);
                    if (analysis) {
                        results[selector] = analysis;

                        // Detect spacing issues
                        const paddingTop = parseInt(analysis.spacing.paddingTop);
                        const paddingBottom = parseInt(analysis.spacing.paddingBottom);
                        const marginTop = parseInt(analysis.spacing.marginTop);
                        const marginBottom = parseInt(analysis.spacing.marginBottom);

                        // Flag excessive padding
                        if (paddingTop > 150) analysis.issues.push(`Excessive top padding: ${paddingTop}px`);
                        if (paddingBottom > 150) analysis.issues.push(`Excessive bottom padding: ${paddingBottom}px`);

                        // Flag huge margins
                        if (marginTop > 100) analysis.issues.push(`Large top margin: ${marginTop}px`);
                        if (marginBottom > 100) analysis.issues.push(`Large bottom margin: ${marginBottom}px`);

                        // Flag zero spacing where it shouldn't be
                        if (selector !== 'header' && paddingTop === 0 && paddingBottom === 0) {
                            analysis.issues.push('No padding - may need spacing');
                        }

                        // Flag height issues
                        if (analysis.rect.height < 50 && selector !== 'header') {
                            analysis.issues.push(`Very small height: ${analysis.rect.height}px`);
                        }
                        if (analysis.rect.height > window.innerHeight * 1.5) {
                            analysis.issues.push(`Very large height: ${analysis.rect.height}px (>${Math.round(window.innerHeight * 1.5)}px)`);
                        }

                        // Check responsiveness
                        if (analysis.rect.width > window.innerWidth) {
                            analysis.issues.push('Horizontal overflow');
                        }
                    }
                });

                // Check gaps between sections
                const sectionElements = sections.map(s => document.querySelector(s)).filter(Boolean);
                const gaps = [];
                for (let i = 0; i < sectionElements.length - 1; i++) {
                    const current = sectionElements[i].getBoundingClientRect();
                    const next = sectionElements[i + 1].getBoundingClientRect();
                    const gap = next.top - current.bottom;
                    gaps.push({
                        from: sections[i],
                        to: sections[i + 1],
                        gap: Math.round(gap)
                    });
                }

                return {
                    viewport: { width: window.innerWidth, height: window.innerHeight },
                    sections: results,
                    gaps,
                    scrollHeight: document.documentElement.scrollHeight,
                    bodyOverflow: document.body.scrollWidth > window.innerWidth
                };
            });

            analysisResults[viewport.name] = analysis;

            // Print summary for this viewport
            console.log(`📊 Viewport: ${analysis.viewport.width}x${analysis.viewport.height}`);
            console.log(`📄 Total Height: ${analysis.scrollHeight}px`);
            console.log(`🌊 Body Overflow: ${analysis.bodyOverflow ? 'YES ⚠️' : 'NO ✅'}`);

            console.log('\n📐 SECTION ANALYSIS:');
            Object.entries(analysis.sections).forEach(([selector, data]) => {
                console.log(`\n${selector.toUpperCase()}:`);
                console.log(`  📏 Size: ${data.rect.width}x${data.rect.height}px`);
                console.log(`  📍 Position: ${data.rect.top}px to ${data.rect.bottom}px`);
                console.log(`  🎨 Padding: ${data.spacing.paddingTop} | ${data.spacing.paddingBottom}`);
                console.log(`  🎨 Margin: ${data.spacing.marginTop} | ${data.spacing.marginBottom}`);

                if (data.issues.length > 0) {
                    console.log(`  ⚠️  Issues: ${data.issues.join(', ')}`);
                }
            });

            console.log('\n🔄 SECTION GAPS:');
            analysis.gaps.forEach(gap => {
                const status = gap.gap < 0 ? '❌ OVERLAP' :
                             gap.gap === 0 ? '✅ TOUCHING' :
                             gap.gap < 20 ? '⚠️  TIGHT' :
                             gap.gap > 100 ? '⚠️  LARGE GAP' : '✅ GOOD';
                console.log(`  ${gap.from} → ${gap.to}: ${gap.gap}px ${status}`);
            });

            // Take screenshot for visual reference
            await page.screenshot({
                path: `spacing-analysis-${viewport.name.toLowerCase()}.png`,
                fullPage: true
            });
        }

        // Generate comprehensive report
        console.log('\n\n🎯 COMPREHENSIVE ANALYSIS SUMMARY');
        console.log('=====================================');

        const issues = {};
        Object.entries(analysisResults).forEach(([viewportName, data]) => {
            Object.entries(data.sections).forEach(([selector, sectionData]) => {
                if (sectionData.issues.length > 0) {
                    if (!issues[selector]) issues[selector] = {};
                    issues[selector][viewportName] = sectionData.issues;
                }
            });
        });

        console.log('\n🔍 ISSUES BY SECTION:');
        Object.entries(issues).forEach(([selector, viewportIssues]) => {
            console.log(`\n${selector.toUpperCase()}:`);
            Object.entries(viewportIssues).forEach(([viewport, sectionIssues]) => {
                console.log(`  📱 ${viewport}: ${sectionIssues.join(', ')}`);
            });
        });

        // Detect responsive breakpoint issues
        console.log('\n📱 RESPONSIVE BREAKPOINT ANALYSIS:');
        const breakpointIssues = [];

        Object.entries(analysisResults).forEach(([viewportName, data]) => {
            if (data.bodyOverflow) {
                breakpointIssues.push(`${viewportName}: Horizontal overflow detected`);
            }

            const largeGaps = data.gaps.filter(g => g.gap > 150);
            if (largeGaps.length > 0) {
                breakpointIssues.push(`${viewportName}: Large gaps detected - ${largeGaps.map(g => `${g.from}→${g.to}:${g.gap}px`).join(', ')}`);
            }
        });

        if (breakpointIssues.length > 0) {
            breakpointIssues.forEach(issue => console.log(`  ⚠️  ${issue}`));
        } else {
            console.log('  ✅ No major responsive issues detected');
        }

        console.log('\n📊 SCREENSHOTS SAVED:');
        viewports.forEach(v => {
            console.log(`  - spacing-analysis-${v.name.toLowerCase()}.png`);
        });

        console.log('\n✅ COMPREHENSIVE SPACING ANALYSIS COMPLETE!');
        console.log('Review screenshots and issues above to prioritize fixes.');

        await page.waitForTimeout(10000);

    } catch (error) {
        console.error('Error during analysis:', error);
    } finally {
        await browser.close();
    }
}

comprehensiveSpacingAnalysis();