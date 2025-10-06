import { chromium } from 'playwright';

const URL = 'https://ec22b5dd.tpp.pages.dev/blog/2025-10-04-how-to-optimise-your-google-business-profile-for-sydney-local-search-in-2025';

async function verifyProduction() {
  console.log('🚀 Verifying production deployment...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  await page.goto(URL, { waitUntil: 'networkidle' });

  // Check header positions
  const layoutCheck = await page.evaluate(() => {
    const navHeader = document.querySelector('header#header');
    const postHeader = document.querySelector('.post-header');
    const navRect = navHeader?.getBoundingClientRect();
    const postRect = postHeader?.getBoundingClientRect();

    return {
      navHeader: {
        exists: !!navHeader,
        visible: navRect ? (navRect.width > 0 && navRect.height > 0) : false,
        position: navHeader ? window.getComputedStyle(navHeader).position : null,
        top: navHeader ? window.getComputedStyle(navHeader).top : null,
        boundingTop: navRect?.top,
        zIndex: navHeader ? window.getComputedStyle(navHeader).zIndex : null,
        height: navRect?.height
      },
      postHeader: {
        exists: !!postHeader,
        position: postHeader ? window.getComputedStyle(postHeader).position : null,
        marginTop: postHeader ? window.getComputedStyle(postHeader).marginTop : null,
        boundingTop: postRect?.top
      },
      topElement: (() => {
        const el = document.elementFromPoint(window.innerWidth / 2, 50);
        return {
          tagName: el?.tagName,
          id: el?.id,
          isNavHeader: el?.id === 'header' || el?.closest('#header') !== null
        };
      })()
    };
  });

  console.log('=== NAVIGATION HEADER ===');
  console.log(`✓ Exists: ${layoutCheck.navHeader.exists ? '✅' : '❌'}`);
  console.log(`✓ Visible: ${layoutCheck.navHeader.visible ? '✅' : '❌'}`);
  console.log(`✓ Position: ${layoutCheck.navHeader.position}`);
  console.log(`✓ Top: ${layoutCheck.navHeader.top}`);
  console.log(`✓ Bounding Top: ${layoutCheck.navHeader.boundingTop}px`);
  console.log(`✓ Z-Index: ${layoutCheck.navHeader.zIndex}`);
  console.log(`✓ Height: ${layoutCheck.navHeader.height}px`);

  console.log('\n=== BLOG POST HEADER ===');
  console.log(`✓ Exists: ${layoutCheck.postHeader.exists ? '✅' : '❌'}`);
  console.log(`✓ Position: ${layoutCheck.postHeader.position} (should be relative)`);
  console.log(`✓ Margin Top: ${layoutCheck.postHeader.marginTop} (should be 95px)`);
  console.log(`✓ Bounding Top: ${layoutCheck.postHeader.boundingTop}px (should be > 95px)`);

  console.log('\n=== TOP OF VIEWPORT ===');
  console.log(`✓ Element: ${layoutCheck.topElement.tagName}#${layoutCheck.topElement.id}`);
  console.log(`✓ Is Navigation: ${layoutCheck.topElement.isNavHeader ? '✅ YES' : '❌ NO'}`);

  // Final verdict
  const isFixed = layoutCheck.navHeader.exists &&
                  layoutCheck.navHeader.visible &&
                  layoutCheck.postHeader.position === 'relative' &&
                  layoutCheck.postHeader.boundingTop > 95;

  console.log('\n=== RESULT ===');
  if (isFixed) {
    console.log('✅ LAYOUT FIXED! Navigation is visible and positioned correctly.');
  } else {
    console.log('❌ STILL BROKEN - Layout issue persists.');
  }

  // Screenshots
  await page.screenshot({ path: 'production-desktop.png', fullPage: false });
  console.log('\n✓ Screenshot saved: production-desktop.png');

  await page.screenshot({ path: 'production-full.png', fullPage: true });
  console.log('✓ Full page saved: production-full.png\n');

  await browser.close();
}

verifyProduction().catch(console.error);
