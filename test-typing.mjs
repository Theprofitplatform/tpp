import { chromium } from '@playwright/test';

async function testTypingAnimation() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🔍 Opening website...');
  await page.goto('http://localhost:4321/');

  // Wait for the page to load
  await page.waitForLoadState('networkidle');

  console.log('📸 Taking screenshot before animation...');
  await page.screenshot({ path: 'typing-before.png' });

  // Find the typing text element
  const typingElement = await page.locator('.typing-text');

  // Check if element exists
  const exists = await typingElement.count() > 0;
  console.log('✅ Typing element found:', exists);

  if (exists) {
    // Get initial text
    const initialText = await typingElement.textContent();
    console.log('📝 Initial text:', initialText);

    // Wait for animation to start (800ms delay + some buffer)
    await page.waitForTimeout(1000);

    // Check text during animation
    const duringAnimation = await typingElement.textContent();
    console.log('⌨️ Text during animation:', duringAnimation);

    // Take screenshot during typing
    await page.screenshot({ path: 'typing-during.png' });

    // Wait for animation to complete (2.4 seconds + buffer)
    await page.waitForTimeout(3000);

    // Get final text
    const finalText = await typingElement.textContent();
    console.log('✅ Final text:', finalText);

    // Check if typing-complete class was added
    const hasCompleteClass = await typingElement.evaluate(el => el.classList.contains('typing-complete'));
    console.log('🎯 Animation complete:', hasCompleteClass);

    // Take final screenshot
    await page.screenshot({ path: 'typing-complete.png' });

    // Check styles
    const styles = await typingElement.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        display: computed.display,
        fontWeight: computed.fontWeight,
        visibility: computed.visibility,
        color: computed.color
      };
    });
    console.log('🎨 Element styles:', styles);

    // Check if text is bold (font-weight 900)
    if (styles.fontWeight === '900') {
      console.log('✅ Text is bold!');
    } else {
      console.log('❌ Text is not bold. Font weight:', styles.fontWeight);
    }

    // Check line breaks
    const parentElement = await typingElement.locator('..').first();
    const parentDisplay = await parentElement.evaluate(el => window.getComputedStyle(el).display);
    console.log('📐 Parent display:', parentDisplay);

  } else {
    console.log('❌ Typing element not found!');
  }

  // Keep browser open for 3 seconds to observe
  console.log('👀 Keeping browser open for observation...');
  await page.waitForTimeout(3000);

  await browser.close();
  console.log('✅ Test complete!');
}

testTypingAnimation().catch(console.error);