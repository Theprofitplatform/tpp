import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://theprofitplatform.com.au/blog/how-to-scale-local-seo/', { 
    waitUntil: 'networkidle' 
  });
  
  // Desktop screenshot
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.screenshot({ path: 'blog-scale-seo-desktop.png', fullPage: true });
  
  // Mobile screenshot
  await page.setViewportSize({ width: 375, height: 667 });
  await page.screenshot({ path: 'blog-scale-seo-mobile.png', fullPage: true });
  
  // Reset to desktop for analysis
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  const analysis = await page.evaluate(() => {
    const article = document.querySelector('article') || document.querySelector('main') || document.body;
    const h1 = document.querySelector('h1');
    const h2s = document.querySelectorAll('h2');
    const ctas = document.querySelectorAll('a[href*="contact"], button, .cta, .btn');
    const featuredImg = document.querySelector('article img, .featured-image img, main img');
    
    const getStyles = (el) => {
      if (!el) return null;
      const computed = window.getComputedStyle(el);
      return {
        fontSize: computed.fontSize,
        lineHeight: computed.lineHeight,
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        marginTop: computed.marginTop,
        marginBottom: computed.marginBottom,
        padding: computed.padding,
        width: computed.width,
        maxWidth: computed.maxWidth
      };
    };
    
    return {
      articleStyles: getStyles(article),
      h1Styles: getStyles(h1),
      h1Text: h1?.textContent,
      h2Count: h2s.length,
      h2Styles: h2s.length > 0 ? getStyles(h2s[0]) : null,
      ctaCount: ctas.length,
      ctaStyles: ctas.length > 0 ? Array.from(ctas).slice(0, 2).map(el => ({
        text: el.textContent.trim(),
        href: el.href,
        ...getStyles(el)
      })) : [],
      featuredImgPresent: !!featuredImg,
      featuredImgStyles: getStyles(featuredImg),
      bodyWidth: article?.offsetWidth,
      hasTableOfContents: !!document.querySelector('.toc, #toc, [class*="table-of-contents"]'),
      hasBreadcrumbs: !!document.querySelector('.breadcrumb, [class*="breadcrumb"]'),
      hasSocialShare: !!document.querySelector('[class*="share"], .social-share'),
      hasRelatedPosts: !!document.querySelector('.related-posts, [class*="related"]')
    };
  });
  
  console.log(JSON.stringify(analysis, null, 2));
  
  await browser.close();
})();
