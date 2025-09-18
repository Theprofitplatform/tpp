const { chromium } = require('playwright');

async function debugComprehensive() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    try {
        console.log('🔍 COMPREHENSIVE NAVBAR DEBUG...');
        await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle' });
        await page.waitForSelector('#header', { timeout: 10000 });

        // Get all CSS files loaded
        const cssFiles = await page.evaluate(() => {
            const stylesheets = Array.from(document.styleSheets);
            return stylesheets.map(sheet => ({
                href: sheet.href,
                disabled: sheet.disabled,
                media: sheet.media ? Array.from(sheet.media).join(', ') : 'all'
            }));
        });

        console.log('\n📄 LOADED CSS FILES:');
        cssFiles.forEach((file, i) => {
            console.log(`${i + 1}. ${file.href || 'inline'} (media: ${file.media}, disabled: ${file.disabled})`);
        });

        // Comprehensive navbar analysis
        const analysis = await page.evaluate(() => {
            const header = document.getElementById('header');
            const navContainer = header?.querySelector('.nav-floating-container');
            const container = header?.querySelector('.container');

            const getComputedStyles = (element) => {
                if (!element) return null;
                const styles = window.getComputedStyle(element);
                return {
                    background: styles.background,
                    backgroundColor: styles.backgroundColor,
                    backgroundImage: styles.backgroundImage,
                    backdropFilter: styles.backdropFilter,
                    webkitBackdropFilter: styles.webkitBackdropFilter,
                    border: styles.border,
                    borderColor: styles.borderColor,
                    boxShadow: styles.boxShadow,
                    opacity: styles.opacity,
                    zIndex: styles.zIndex,
                    position: styles.position,
                    top: styles.top,
                    left: styles.left,
                    right: styles.right,
                    width: styles.width,
                    maxWidth: styles.maxWidth,
                    transform: styles.transform,
                    overflow: styles.overflow,
                    visibility: styles.visibility,
                    display: styles.display
                };
            };

            return {
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                header: getComputedStyles(header),
                navContainer: getComputedStyles(navContainer),
                container: getComputedStyles(container),
                headerClasses: header?.className || '',
                navContainerClasses: navContainer?.className || '',
                containerClasses: container?.className || ''
            };
        });

        console.log('\n🎨 COMPUTED STYLES ANALYSIS:');
        console.log('='.repeat(50));

        console.log('\n📦 HEADER ELEMENT:');
        console.log('Classes:', analysis.headerClasses);
        console.log('Background:', analysis.header?.background || 'none');
        console.log('Background Color:', analysis.header?.backgroundColor || 'transparent');
        console.log('Background Image:', analysis.header?.backgroundImage || 'none');
        console.log('Backdrop Filter:', analysis.header?.backdropFilter || 'none');
        console.log('Border:', analysis.header?.border || 'none');
        console.log('Box Shadow:', analysis.header?.boxShadow || 'none');

        console.log('\n📦 NAV-FLOATING-CONTAINER:');
        console.log('Classes:', analysis.navContainerClasses);
        console.log('Background:', analysis.navContainer?.background || 'none');
        console.log('Background Color:', analysis.navContainer?.backgroundColor || 'transparent');
        console.log('Background Image:', analysis.navContainer?.backgroundImage || 'none');
        console.log('Backdrop Filter:', analysis.navContainer?.backdropFilter || 'none');
        console.log('Border:', analysis.navContainer?.border || 'none');
        console.log('Box Shadow:', analysis.navContainer?.boxShadow || 'none');

        console.log('\n📦 CONTAINER:');
        console.log('Classes:', analysis.containerClasses);
        console.log('Background:', analysis.container?.background || 'none');
        console.log('Background Color:', analysis.container?.backgroundColor || 'transparent');

        // Check if there are conflicting CSS rules
        const conflicts = await page.evaluate(() => {
            const header = document.getElementById('header');
            const navContainer = header?.querySelector('.nav-floating-container');

            // Get all CSS rules that might affect these elements
            const getMatchingRules = (element, property) => {
                if (!element) return [];

                const rules = [];
                const sheets = Array.from(document.styleSheets);

                for (const sheet of sheets) {
                    try {
                        const cssRules = Array.from(sheet.cssRules || sheet.rules || []);
                        for (const rule of cssRules) {
                            if (rule.type === CSSRule.STYLE_RULE) {
                                try {
                                    if (element.matches(rule.selectorText)) {
                                        const value = rule.style.getPropertyValue(property);
                                        if (value) {
                                            rules.push({
                                                selector: rule.selectorText,
                                                property: property,
                                                value: value,
                                                priority: rule.style.getPropertyPriority(property),
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
                return rules;
            };

            return {
                headerBackgroundRules: getMatchingRules(header, 'background'),
                headerBackgroundColorRules: getMatchingRules(header, 'background-color'),
                navContainerBackgroundRules: getMatchingRules(navContainer, 'background'),
                navContainerBackgroundColorRules: getMatchingRules(navContainer, 'background-color'),
                paddingTopRules: getMatchingRules(document.querySelector('main'), 'padding-top')
            };
        });

        console.log('\n🔄 CSS RULE CONFLICTS:');
        console.log('='.repeat(50));

        if (conflicts.headerBackgroundRules.length > 0) {
            console.log('\nHEADER BACKGROUND RULES:');
            conflicts.headerBackgroundRules.forEach((rule, i) => {
                console.log(`${i + 1}. ${rule.selector} { ${rule.property}: ${rule.value} ${rule.priority ? '!important' : ''} } [${rule.href}]`);
            });
        }

        if (conflicts.navContainerBackgroundRules.length > 0) {
            console.log('\nNAV-CONTAINER BACKGROUND RULES:');
            conflicts.navContainerBackgroundRules.forEach((rule, i) => {
                console.log(`${i + 1}. ${rule.selector} { ${rule.property}: ${rule.value} ${rule.priority ? '!important' : ''} } [${rule.href}]`);
            });
        }

        if (conflicts.paddingTopRules.length > 0) {
            console.log('\nMAIN PADDING-TOP RULES:');
            conflicts.paddingTopRules.forEach((rule, i) => {
                console.log(`${i + 1}. ${rule.selector} { ${rule.property}: ${rule.value} ${rule.priority ? '!important' : ''} } [${rule.href}]`);
            });
        }

        // Take screenshots showing the issue
        console.log('\n📸 Taking diagnostic screenshots...');

        await page.screenshot({
            path: 'debug-comprehensive-full.png',
            fullPage: false
        });

        // Highlight different elements with different colors
        await page.addStyleTag({
            content: `
                #header {
                    outline: 5px solid red !important;
                    outline-offset: 2px !important;
                }
                .nav-floating-container {
                    outline: 3px solid blue !important;
                    outline-offset: -3px !important;
                }
                .container {
                    outline: 2px solid green !important;
                    outline-offset: -2px !important;
                }
                main {
                    outline: 2px solid orange !important;
                    outline-offset: 5px !important;
                }
            `
        });

        await page.screenshot({
            path: 'debug-comprehensive-highlighted.png',
            fullPage: false
        });

        console.log('\n✅ COMPREHENSIVE DEBUG COMPLETE');
        console.log('Check these files:');
        console.log('- debug-comprehensive-full.png');
        console.log('- debug-comprehensive-highlighted.png');

        console.log('\nBrowser staying open for 30 seconds for manual inspection...');
        await page.waitForTimeout(30000);

    } catch (error) {
        console.error('Error during comprehensive debug:', error);
    } finally {
        await browser.close();
    }
}

debugComprehensive();