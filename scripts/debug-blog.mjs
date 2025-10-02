import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Navigating to blog page...');
  await page.goto('http://localhost:4322/blog', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log('\n=== CSS FILES LOADED ===');
  const stylesheets = await page.$$eval('link[rel="stylesheet"]', links =>
    links.map(link => link.href)
  );
  console.log('Stylesheets:', stylesheets);

  console.log('\n=== CHECKING BLOG.CSS ===');
  const blogCssLoaded = stylesheets.some(href => href.includes('/css/blog.css'));
  console.log('blog.css loaded:', blogCssLoaded);

  console.log('\n=== PAGE STRUCTURE ===');

  const h1 = await page.$('h1');
  const h1Text = await h1?.textContent();
  const h1Styles = await h1?.evaluate(el => {
    const styles = window.getComputedStyle(el);
    return {
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      color: styles.color,
      textAlign: styles.textAlign
    };
  });
  console.log('H1 text:', h1Text?.trim());
  console.log('H1 computed styles:', h1Styles);

  console.log('\n=== HERO SECTION ===');
  const heroSection = await page.$('section.blog-hero');
  if (heroSection) {
    const heroStyles = await heroSection.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        background: styles.background,
        padding: styles.padding,
        display: styles.display
      };
    });
    console.log('✓ .blog-hero section found');
    console.log('Hero section styles:', heroStyles);
  } else {
    console.log('✗ .blog-hero section NOT found');
    const firstSection = await page.$('main section:first-child');
    const firstSectionClass = await firstSection?.getAttribute('class');
    console.log('First section class:', firstSectionClass);
  }

  console.log('\n=== CATEGORY PILLS ===');
  const categoryPills = await page.$$('.category-pill');
  console.log('Category pills found:', categoryPills.length);

  if (categoryPills.length > 0) {
    const firstPillStyles = await categoryPills[0].evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        background: styles.background,
        borderRadius: styles.borderRadius,
        padding: styles.padding,
        border: styles.border
      };
    });
    console.log('First pill styles:', firstPillStyles);
  }

  console.log('\n=== ARTICLE CARDS ===');
  const articleCards = await page.$$('.article-card');
  console.log('Article cards found:', articleCards.length);

  if (articleCards.length > 0) {
    const firstCardStyles = await articleCards[0].evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        background: styles.background,
        borderRadius: styles.borderRadius,
        boxShadow: styles.boxShadow,
        display: styles.display
      };
    });
    console.log('First card styles:', firstCardStyles);
  }

  console.log('\n=== FEATURED CARD ===');
  const featuredCard = await page.$('.featured-card');
  if (featuredCard) {
    console.log('✓ Featured card found');
    const featuredStyles = await featuredCard.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        background: styles.background,
        borderRadius: styles.borderRadius,
        display: styles.display,
        gridTemplateColumns: styles.gridTemplateColumns
      };
    });
    console.log('Featured card styles:', featuredStyles);
  } else {
    console.log('✗ Featured card NOT found');
  }

  console.log('\n=== CHECKING FOR TAILWIND CLASSES ===');
  const hasTailwindClasses = await page.evaluate(() => {
    const allElements = document.querySelectorAll('*');
    const tailwindPatterns = ['md:', 'lg:', 'sm:', 'xl:', 'bg-gradient-to', 'text-'];
    const matches = [];

    allElements.forEach(el => {
      const classes = el.className;
      if (typeof classes === 'string') {
        tailwindPatterns.forEach(pattern => {
          if (classes.includes(pattern)) {
            matches.push({ element: el.tagName, classes: classes });
          }
        });
      }
    });

    return matches.slice(0, 10); // First 10 matches
  });

  if (hasTailwindClasses.length > 0) {
    console.log('⚠️  Tailwind classes found:', hasTailwindClasses);
  } else {
    console.log('✓ No Tailwind classes detected');
  }

  console.log('\n=== SCREENSHOTS ===');
  await page.screenshot({ path: 'blog-full-debug.png', fullPage: true });
  console.log('✓ Full page screenshot saved: blog-full-debug.png');

  await page.screenshot({ path: 'blog-hero-debug.png', clip: { x: 0, y: 0, width: 1920, height: 900 } });
  console.log('✓ Hero section screenshot saved: blog-hero-debug.png');

  console.log('\n=== NETWORK REQUESTS ===');
  const cssRequests = await page.evaluate(() => {
    return performance.getEntriesByType('resource')
      .filter(entry => entry.name.endsWith('.css'))
      .map(entry => ({
        url: entry.name,
        status: entry.responseStatus,
        size: entry.transferSize
      }));
  });
  console.log('CSS files loaded:', cssRequests);

  await browser.close();
})();
