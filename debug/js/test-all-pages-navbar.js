const { chromium } = require('playwright');

async function testAllPagesNavbar() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    const pages = [
        'index.html',
        'services.html',
        'seo.html',
        'google-ads.html',
        'pricing.html',
        'about.html',
        'web-design.html',
        'contact.html',
        'portfolio.html',
        'terms.html',
        'disclaimer.html',
        'privacy.html'
    ];

    const baseUrl = 'http://localhost:3000';
    let results = [];

    try {
        console.log('🔍 TESTING NAVBAR ACROSS ALL PAGES');
        console.log('=====================================');

        for (const pageName of pages) {
            console.log(`\n📄 Testing ${pageName}...`);

            try {
                await page.goto(`${baseUrl}/${pageName}`, { waitUntil: 'networkidle' });
                await page.waitForTimeout(1000);

                const test = await page.evaluate(() => {
                    const results = {
                        page: window.location.pathname,
                        navbar: {},
                        dropdown: {},
                        styles: {},
                        spacing: {}
                    };

                    // Test navbar positioning and structure
                    const navbar = document.querySelector('.premium-nav');
                    if (navbar) {
                        const navRect = navbar.getBoundingClientRect();
                        const navStyles = window.getComputedStyle(navbar);

                        results.navbar = {
                            exists: true,
                            position: navStyles.position,
                            top: navStyles.top,
                            left: navStyles.left,
                            width: Math.round(navRect.width),
                            height: Math.round(navRect.height),
                            isFixed: navStyles.position === 'fixed',
                            isOverflowing: navRect.right > window.innerWidth,
                            zIndex: navStyles.zIndex,
                            overflow: navStyles.overflow
                        };
                    } else {
                        results.navbar.exists = false;
                    }

                    // Test dropdown menu
                    const dropdown = document.querySelector('.nav-dropdown');
                    const dropdownMenu = document.querySelector('.dropdown-menu');

                    results.dropdown = {
                        dropdownExists: !!dropdown,
                        menuExists: !!dropdownMenu,
                        hasChevron: !!document.querySelector('.dropdown-arrow'),
                        servicesText: !!document.querySelector('.nav-links span').textContent.includes('Services')
                    };

                    if (dropdownMenu) {
                        const menuStyles = window.getComputedStyle(dropdownMenu);
                        results.dropdown.menuStyles = {
                            position: menuStyles.position,
                            zIndex: menuStyles.zIndex,
                            opacity: menuStyles.opacity,
                            visibility: menuStyles.visibility
                        };
                    }

                    // Test if navbar-fix.css is loaded
                    const stylesheets = Array.from(document.styleSheets);
                    results.styles.navbarFixLoaded = stylesheets.some(sheet =>
                        sheet.href && sheet.href.includes('navbar-fix.css')
                    );

                    // Test stats section padding if it exists
                    const statsSection = document.querySelector('.modern-stats-section');
                    if (statsSection) {
                        const statsStyles = window.getComputedStyle(statsSection);
                        results.spacing.statsSection = {
                            exists: true,
                            paddingBottom: statsStyles.paddingBottom,
                            paddingBottomPx: parseInt(statsStyles.paddingBottom)
                        };
                    }

                    // Test hero padding
                    const heroH1 = document.querySelector('.hero h1, .hero-modern h1');
                    if (heroH1) {
                        const heroStyles = window.getComputedStyle(heroH1);
                        results.spacing.heroH1 = {
                            exists: true,
                            paddingTop: heroStyles.paddingTop,
                            paddingTopPx: parseInt(heroStyles.paddingTop)
                        };
                    }

                    return results;
                });

                // Validate results
                const issues = [];

                if (!test.navbar.exists) {
                    issues.push('❌ Navbar not found');
                } else {
                    if (test.navbar.isOverflowing) issues.push('❌ Navbar overflowing viewport');
                    if (test.navbar.position !== 'fixed') issues.push('❌ Navbar not fixed positioned');
                    if (parseInt(test.navbar.zIndex) < 1000) issues.push('❌ Navbar z-index too low');
                }

                if (!test.dropdown.dropdownExists) issues.push('❌ Services dropdown not found');
                if (!test.dropdown.hasChevron) issues.push('❌ Dropdown arrow missing');
                if (!test.styles.navbarFixLoaded) issues.push('❌ navbar-fix.css not loaded');

                if (test.spacing.statsSection && test.spacing.statsSection.paddingBottomPx > 100) {
                    issues.push(`❌ Stats section bottom padding too large: ${test.spacing.statsSection.paddingBottom}`);
                }

                if (test.spacing.heroH1 && test.spacing.heroH1.paddingTopPx < 140) {
                    issues.push(`❌ Hero H1 padding too small: ${test.spacing.heroH1.paddingTop}`);
                }

                // Test dropdown hover functionality
                try {
                    const servicesLink = await page.locator('.nav-dropdown a').first();
                    await servicesLink.hover();
                    await page.waitForTimeout(500);

                    const dropdownVisible = await page.locator('.dropdown-menu').isVisible();
                    if (!dropdownVisible) {
                        issues.push('❌ Dropdown menu not visible on hover');
                    }
                } catch (e) {
                    issues.push('❌ Dropdown hover test failed');
                }

                // Report results
                if (issues.length === 0) {
                    console.log(`  ✅ ${pageName} - All tests passed`);
                } else {
                    console.log(`  ⚠️  ${pageName} - Issues found:`);
                    issues.forEach(issue => console.log(`    ${issue}`));
                }

                results.push({
                    page: pageName,
                    passed: issues.length === 0,
                    issues: issues,
                    test: test
                });

            } catch (error) {
                console.log(`  ❌ ${pageName} - Error: ${error.message}`);
                results.push({
                    page: pageName,
                    passed: false,
                    issues: [`Error loading page: ${error.message}`]
                });
            }
        }

        // Summary report
        console.log('\n📊 SUMMARY REPORT');
        console.log('==================');

        const passed = results.filter(r => r.passed).length;
        const total = results.length;

        console.log(`✅ Passed: ${passed}/${total} pages`);
        console.log(`❌ Failed: ${total - passed}/${total} pages`);

        if (passed < total) {
            console.log('\n🔧 PAGES NEEDING ATTENTION:');
            results.filter(r => !r.passed).forEach(result => {
                console.log(`\n${result.page}:`);
                result.issues.forEach(issue => console.log(`  ${issue}`));
            });
        }

        console.log('\n✅ NAVBAR TESTING COMPLETE');

    } catch (error) {
        console.error('Error during testing:', error);
    } finally {
        await browser.close();
    }
}

testNavbarTesting();

// Fix function name
async function testNavbarTesting() {
    await testAllPagesNavbar();
}