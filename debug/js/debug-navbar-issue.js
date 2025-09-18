const { chromium } = require('playwright');

async function debugNavbarIssue() {
    const browser = await chromium.launch({
        headless: false,
        slowMo: 1000 // Slow down for better observation
    });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    try {
        console.log('Loading website to debug navbar issue...');
        await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle' });

        // Wait for the navbar to load
        await page.waitForSelector('#header', { timeout: 10000 });

        // Take screenshot of current state
        await page.screenshot({
            path: 'navbar-current-issue.png',
            fullPage: false,
            clip: { x: 0, y: 0, width: 1920, height: 300 }
        });

        console.log('Taking full viewport screenshot...');
        await page.screenshot({
            path: 'full-navbar-issue.png',
            fullPage: false
        });

        // Get all elements that might be causing the dark line
        const elementAnalysis = await page.evaluate(() => {
            const allElements = document.querySelectorAll('*');
            const problematicElements = [];

            allElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                const styles = window.getComputedStyle(el);

                // Check for elements that extend beyond viewport or have dark backgrounds
                if (
                    rect.right > window.innerWidth ||
                    rect.width > window.innerWidth ||
                    styles.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
                    styles.boxShadow !== 'none' ||
                    (rect.top < 200 && rect.right > window.innerWidth - 100) // Elements near navbar area
                ) {
                    problematicElements.push({
                        tagName: el.tagName,
                        className: el.className,
                        id: el.id,
                        rect: {
                            x: Math.round(rect.x),
                            y: Math.round(rect.y),
                            width: Math.round(rect.width),
                            height: Math.round(rect.height),
                            right: Math.round(rect.right),
                            bottom: Math.round(rect.bottom)
                        },
                        styles: {
                            position: styles.position,
                            backgroundColor: styles.backgroundColor,
                            background: styles.background,
                            boxShadow: styles.boxShadow,
                            border: styles.border,
                            width: styles.width,
                            maxWidth: styles.maxWidth,
                            overflow: styles.overflow
                        },
                        isOverflowing: rect.right > window.innerWidth,
                        inNavbarArea: rect.top < 200
                    });
                }
            });

            return {
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                problematicElements: problematicElements.slice(0, 20) // Top 20 problematic elements
            };
        });

        console.log('\n🔍 NAVBAR ISSUE ANALYSIS:');
        console.log('Viewport:', elementAnalysis.viewport);
        console.log('\nProblematic elements found:', elementAnalysis.problematicElements.length);

        // Focus on navbar area elements that overflow
        const navbarOverflowElements = elementAnalysis.problematicElements.filter(
            el => el.inNavbarArea && el.isOverflowing
        );

        console.log('\n⚠️ NAVBAR AREA OVERFLOW ELEMENTS:');
        navbarOverflowElements.forEach((el, index) => {
            console.log(`\n${index + 1}. ${el.tagName}${el.className ? `.${el.className}` : ''}${el.id ? `#${el.id}` : ''}`);
            console.log(`   Position: ${el.rect.x}, ${el.rect.y} | Size: ${el.rect.width}x${el.rect.height}`);
            console.log(`   Right edge: ${el.rect.right}px (overflow: ${el.rect.right - 1920}px)`);
            console.log(`   Background: ${el.styles.backgroundColor}`);
            console.log(`   Box Shadow: ${el.styles.boxShadow}`);
            console.log(`   Position: ${el.styles.position} | Width: ${el.styles.width} | Max-Width: ${el.styles.maxWidth}`);
        });

        // Check specifically for header element
        const headerAnalysis = await page.evaluate(() => {
            const header = document.getElementById('header');
            if (!header) return null;

            const rect = header.getBoundingClientRect();
            const styles = window.getComputedStyle(header);

            return {
                rect: {
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height,
                    right: rect.right
                },
                styles: {
                    position: styles.position,
                    top: styles.top,
                    left: styles.left,
                    width: styles.width,
                    maxWidth: styles.maxWidth,
                    transform: styles.transform,
                    background: styles.background,
                    boxShadow: styles.boxShadow
                },
                classes: header.className
            };
        });

        console.log('\n📍 HEADER ELEMENT ANALYSIS:');
        console.log(JSON.stringify(headerAnalysis, null, 2));

        // Highlight the problematic elements visually
        await page.evaluate(() => {
            const style = document.createElement('style');
            style.textContent = `
                .debug-overflow {
                    outline: 3px solid red !important;
                    outline-offset: -3px !important;
                }
                .debug-navbar-area {
                    outline: 2px solid orange !important;
                    outline-offset: -2px !important;
                }
            `;
            document.head.appendChild(style);

            // Highlight overflowing elements
            document.querySelectorAll('*').forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.right > window.innerWidth && rect.top < 200) {
                    el.classList.add('debug-overflow');
                } else if (rect.top < 200) {
                    el.classList.add('debug-navbar-area');
                }
            });
        });

        console.log('\n🎯 Taking highlighted screenshot...');
        await page.screenshot({
            path: 'navbar-debug-highlighted.png',
            fullPage: false,
            clip: { x: 0, y: 0, width: 1920, height: 300 }
        });

        console.log('\n📋 Debug complete. Check these files:');
        console.log('- navbar-current-issue.png (current state)');
        console.log('- full-navbar-issue.png (full viewport)');
        console.log('- navbar-debug-highlighted.png (with debug highlights)');

        console.log('\nKeeping browser open for 30 seconds for manual inspection...');
        await page.waitForTimeout(30000);

    } catch (error) {
        console.error('Error during debug:', error);
    } finally {
        await browser.close();
    }
}

debugNavbarIssue();