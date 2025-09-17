const { chromium } = require('playwright');

async function inspectNavbar() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    try {
        console.log('Loading the website...');
        await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle' });

        // Wait for the navbar to be visible
        await page.waitForSelector('#header', { timeout: 10000 });

        console.log('Taking screenshot at top of page...');
        await page.screenshot({
            path: 'navbar-top.png',
            fullPage: false,
            clip: { x: 0, y: 0, width: 1920, height: 200 }
        });

        // Get navbar computed styles
        const navbarStyles = await page.evaluate(() => {
            const header = document.getElementById('header');
            const container = header.querySelector('.nav-floating-container');
            const headerRect = header.getBoundingClientRect();
            const containerRect = container ? container.getBoundingClientRect() : null;

            const headerStyles = window.getComputedStyle(header);
            const containerStyles = container ? window.getComputedStyle(container) : null;

            return {
                header: {
                    position: headerStyles.position,
                    top: headerStyles.top,
                    left: headerStyles.left,
                    right: headerStyles.right,
                    width: headerStyles.width,
                    height: headerStyles.height,
                    background: headerStyles.background,
                    borderRadius: headerStyles.borderRadius,
                    overflow: headerStyles.overflow,
                    rect: headerRect
                },
                container: containerStyles ? {
                    position: containerStyles.position,
                    top: containerStyles.top,
                    left: containerStyles.left,
                    right: containerStyles.right,
                    width: containerStyles.width,
                    height: containerStyles.height,
                    background: containerStyles.background,
                    borderRadius: containerStyles.borderRadius,
                    margin: containerStyles.margin,
                    padding: containerStyles.padding,
                    rect: containerRect
                } : null
            };
        });

        console.log('Navbar styles at top:', JSON.stringify(navbarStyles, null, 2));

        // Check for dark elements or overflow issues
        const darkElements = await page.evaluate(() => {
            const elements = document.querySelectorAll('*');
            const darkElements = [];

            elements.forEach(el => {
                const styles = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();

                // Check for dark backgrounds, shadows, or borders
                if (
                    styles.background.includes('rgb(') ||
                    styles.backgroundColor.includes('rgb(') ||
                    styles.boxShadow !== 'none' ||
                    styles.border !== '0px none' ||
                    (rect.right > window.innerWidth && rect.top < 200)
                ) {
                    darkElements.push({
                        tagName: el.tagName,
                        className: el.className,
                        id: el.id,
                        background: styles.background,
                        backgroundColor: styles.backgroundColor,
                        boxShadow: styles.boxShadow,
                        border: styles.border,
                        rect: rect,
                        overflowRight: rect.right > window.innerWidth
                    });
                }
            });

            return darkElements.filter(el =>
                el.rect.top < 200 && // Only top 200px
                (el.overflowRight || el.background !== 'rgba(0, 0, 0, 0)' || el.backgroundColor !== 'rgba(0, 0, 0, 0)')
            );
        });

        console.log('Dark/overflow elements in navbar area:', darkElements.length);
        darkElements.forEach((el, index) => {
            console.log(`Element ${index + 1}:`, {
                tag: el.tagName,
                class: el.className,
                id: el.id,
                background: el.background,
                backgroundColor: el.backgroundColor,
                boxShadow: el.boxShadow,
                border: el.border,
                overflowRight: el.overflowRight,
                rect: `x: ${Math.round(el.rect.x)}, y: ${Math.round(el.rect.y)}, w: ${Math.round(el.rect.width)}, h: ${Math.round(el.rect.height)}`
            });
        });

        // Scroll down to see how navbar changes
        console.log('Scrolling down to test navbar behavior...');
        await page.evaluate(() => window.scrollTo(0, 300));
        await page.waitForTimeout(1000);

        console.log('Taking screenshot after scroll...');
        await page.screenshot({
            path: 'navbar-scrolled.png',
            fullPage: false,
            clip: { x: 0, y: 0, width: 1920, height: 200 }
        });

        // Get navbar styles after scroll
        const scrolledStyles = await page.evaluate(() => {
            const header = document.getElementById('header');
            const headerStyles = window.getComputedStyle(header);
            const headerRect = header.getBoundingClientRect();

            return {
                position: headerStyles.position,
                top: headerStyles.top,
                left: headerStyles.left,
                right: headerStyles.right,
                width: headerStyles.width,
                height: headerStyles.height,
                background: headerStyles.background,
                transform: headerStyles.transform,
                hasScrolledClass: header.classList.contains('scrolled'),
                rect: headerRect
            };
        });

        console.log('Navbar styles after scroll:', JSON.stringify(scrolledStyles, null, 2));

        // Keep browser open for manual inspection
        console.log('Browser kept open for manual inspection. Press Ctrl+C to close.');
        await page.waitForTimeout(60000); // Keep open for 60 seconds

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

inspectNavbar();