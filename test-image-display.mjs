import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const url = 'http://localhost:4321/blog/2025-10-04-7-google-ads-mistakes-costing-sydney-businesses-thousands-every-month-test/';

  console.log(`🌐 Navigating to: ${url}`);
  await page.goto(url);

  // Wait for featured image to load
  console.log('⏳ Waiting for featured image...');
  await page.waitForSelector('.featured-image-container img', { timeout: 10000 });

  // Get image details
  const imageData = await page.evaluate(() => {
    const img = document.querySelector('.featured-image-container img');
    const credit = document.querySelector('.image-credit');

    return {
      src: img?.src || 'not found',
      alt: img?.alt || 'not found',
      width: img?.width || 0,
      height: img?.height || 0,
      naturalWidth: img?.naturalWidth || 0,
      naturalHeight: img?.naturalHeight || 0,
      loading: img?.loading || 'not set',
      credit: credit?.textContent?.trim() || 'not found',
      visible: img && window.getComputedStyle(img).display !== 'none'
    };
  });

  console.log('\n✅ Featured Image Found!');
  console.log('═══════════════════════════════════════════');
  console.log(`📸 Source: ${imageData.src.substring(0, 80)}...`);
  console.log(`📝 Alt Text: "${imageData.alt}"`);
  console.log(`📏 Dimensions: ${imageData.width}×${imageData.height} (declared)`);
  console.log(`📐 Natural Size: ${imageData.naturalWidth}×${imageData.naturalHeight} (actual)`);
  console.log(`⚡ Loading: ${imageData.loading}`);
  console.log(`👁️  Visible: ${imageData.visible}`);
  console.log(`©️  Credit: ${imageData.credit}`);
  console.log('═══════════════════════════════════════════\n');

  // Take screenshot of full page
  console.log('📸 Capturing full page screenshot...');
  await page.screenshot({
    path: 'blog-with-featured-image-full.png',
    fullPage: true
  });

  // Take screenshot of just the featured image area
  console.log('📸 Capturing featured image section...');
  const imageElement = await page.$('.featured-image-container');
  await imageElement.screenshot({ path: 'featured-image-section.png' });

  // Take screenshot of viewport (above the fold)
  console.log('📸 Capturing viewport screenshot...');
  await page.screenshot({
    path: 'blog-with-featured-image-viewport.png'
  });

  console.log('\n✅ Screenshots saved:');
  console.log('   1. blog-with-featured-image-full.png - Full page');
  console.log('   2. featured-image-section.png - Just the image');
  console.log('   3. blog-with-featured-image-viewport.png - Above the fold');

  // Verify image actually loaded (not broken)
  const imageLoaded = await page.evaluate(() => {
    const img = document.querySelector('.featured-image-container img');
    return img && img.complete && img.naturalHeight > 0;
  });

  console.log(`\n🖼️  Image Load Status: ${imageLoaded ? '✅ LOADED' : '❌ FAILED'}`);

  if (!imageLoaded) {
    console.error('⚠️  Warning: Image element exists but did not load properly');
  }

  await browser.close();

  console.log('\n🎉 Test Complete!');
  process.exit(imageLoaded ? 0 : 1);
})();
