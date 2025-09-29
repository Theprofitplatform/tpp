import { chromium } from '@playwright/test';

async function testContactSection() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🔍 Opening website...');
  await page.goto('http://localhost:4321/');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  // Scroll to contact section
  console.log('📍 Scrolling to contact section...');
  await page.evaluate(() => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  });

  await page.waitForTimeout(1000);

  console.log('📸 Taking screenshot of contact section...');
  await page.screenshot({ path: 'contact-section.png', fullPage: false });

  // Check "Get in Touch" card visibility
  const contactInfoCard = await page.locator('.contact-info-card').first();
  const cardExists = await contactInfoCard.count() > 0;
  console.log('✅ Contact info card found:', cardExists);

  if (cardExists) {
    // Check if "Get in Touch" heading is visible
    const heading = await contactInfoCard.locator('h3').first();
    const headingText = await heading.textContent();
    console.log('📝 Heading text:', headingText);

    // Check visibility of text elements
    const visibilityCheck = await heading.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity,
        color: styles.color,
        backgroundColor: styles.backgroundColor,
        zIndex: styles.zIndex
      };
    });
    console.log('🎨 Heading styles:', visibilityCheck);

    // Check phone number visibility
    const phoneLink = await page.locator('a[href^="tel:"]').first();
    if (await phoneLink.count() > 0) {
      const phoneText = await phoneLink.textContent();
      console.log('📞 Phone text:', phoneText);

      const phoneStyles = await phoneLink.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          color: styles.color,
          visibility: styles.visibility,
          opacity: styles.opacity
        };
      });
      console.log('📞 Phone link styles:', phoneStyles);
    }

    // Check email visibility
    const emailLink = await page.locator('a[href^="mailto:"]').first();
    if (await emailLink.count() > 0) {
      const emailText = await emailLink.textContent();
      console.log('📧 Email text:', emailText);

      const emailStyles = await emailLink.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          color: styles.color,
          visibility: styles.visibility,
          opacity: styles.opacity
        };
      });
      console.log('📧 Email link styles:', emailStyles);
    }

    // Check all text in contact-item divs
    const contactItems = await page.locator('.contact-item').all();
    console.log(`\n🔍 Found ${contactItems.length} contact items`);

    for (let i = 0; i < contactItems.length; i++) {
      const item = contactItems[i];
      const text = await item.textContent();
      console.log(`\nContact item ${i + 1} text:`, text);

      const itemStyles = await item.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor
        };
      });
      console.log(`Contact item ${i + 1} styles:`, itemStyles);
    }

    // Check for gradient issues
    const hasGradientIssue = await contactInfoCard.evaluate(el => {
      const allElements = el.querySelectorAll('*');
      let gradientFound = false;

      allElements.forEach(child => {
        const styles = window.getComputedStyle(child);
        if (styles.webkitTextFillColor === 'transparent' ||
            styles.background.includes('gradient')) {
          gradientFound = true;
        }
      });

      return gradientFound;
    });

    console.log('\n⚠️ Has gradient text fill issue:', hasGradientIssue);

  } else {
    console.log('❌ Contact info card not found!');
  }

  // Keep browser open for observation
  console.log('\n👀 Keeping browser open for observation...');
  await page.waitForTimeout(5000);

  await browser.close();
  console.log('✅ Test complete!');
}

testContactSection().catch(console.error);