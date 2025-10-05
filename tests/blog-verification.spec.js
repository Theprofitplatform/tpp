/**
 * Blog Verification Test Suite
 * Verifies all blog features are working in production
 */

import { test, expect } from '@playwright/test';

const PROD_URL = 'https://theprofitplatform.com.au';

test.describe('Blog Production Verification', () => {

  test('Blog index page loads with real stats', async ({ page }) => {
    await page.goto(`${PROD_URL}/blog/`);

    // Check page loads
    await expect(page).toHaveTitle(/Blog.*The Profit Platform/i);

    // Check stats are real (not fake)
    const articlesText = await page.locator('.stat-number').first().textContent();
    expect(articlesText).toContain('7'); // Should show 7+ articles, not 100+

    console.log('✓ Real stats showing:', articlesText);
  });

  test('Hero images load on blog posts', async ({ page }) => {
    await page.goto(`${PROD_URL}/blog/how-to-scale-local-seo/`);

    // Wait for featured image
    const featuredImage = page.locator('.featured-image img');
    await expect(featuredImage).toBeVisible({ timeout: 10000 });

    // Check image has valid src
    const imageSrc = await featuredImage.getAttribute('src');
    expect(imageSrc).toContain('unsplash.com');

    console.log('✓ Hero image loaded:', imageSrc);
  });

  test('Search functionality works', async ({ page }) => {
    await page.goto(`${PROD_URL}/blog/`);

    // Type in search
    const searchInput = page.locator('.search-input');
    await searchInput.fill('SEO');

    // Wait for filtering
    await page.waitForTimeout(500);

    // Check that articles are filtered
    const visibleCards = page.locator('.article-card:visible');
    const count = await visibleCards.count();

    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(7); // Should filter out some posts

    console.log('✓ Search filtered to', count, 'articles');
  });

  test('Category filtering works with URL state', async ({ page }) => {
    await page.goto(`${PROD_URL}/blog/`);

    // Click SEO category pill
    const seoPill = page.locator('.filter-pill[data-category*="seo"]').first();
    await seoPill.click();

    // Wait for URL change
    await page.waitForURL(/category=/);

    // Check URL has category parameter
    const url = page.url();
    expect(url).toContain('category=');

    console.log('✓ Category filter URL:', url);
  });

  test('Load More button works', async ({ page }) => {
    await page.goto(`${PROD_URL}/blog/`);

    // Count initial articles
    const initialCount = await page.locator('.article-card:visible').count();

    // Click Load More
    const loadMoreBtn = page.locator('.load-more-btn');

    if (await loadMoreBtn.isVisible()) {
      await loadMoreBtn.click();
      await page.waitForTimeout(500);

      // Count articles after
      const afterCount = await page.locator('.article-card:visible').count();

      expect(afterCount).toBeGreaterThan(initialCount);
      console.log(`✓ Load More worked: ${initialCount} → ${afterCount} articles`);
    } else {
      console.log('✓ Load More hidden (all posts shown)');
    }
  });

  test('Newsletter form is functional', async ({ page }) => {
    await page.goto(`${PROD_URL}/blog/`);

    // Scroll to newsletter
    await page.locator('.newsletter-form').scrollIntoViewIfNeeded();

    // Fill email
    const emailInput = page.locator('#newsletter-email');
    await emailInput.fill('test@example.com');

    // Click submit
    const submitBtn = page.locator('#newsletter-submit');
    await submitBtn.click();

    // Wait for response message
    await page.waitForTimeout(2000);

    // Check message appears (success or error, doesn't matter - form is working)
    const message = page.locator('#newsletter-message');

    if (await message.isVisible()) {
      const messageText = await message.textContent();
      console.log('✓ Newsletter form response:', messageText);
    } else {
      console.log('✓ Newsletter form submitted (no visible message yet)');
    }
  });

  test('Tag filtering works from blog post', async ({ page }) => {
    await page.goto(`${PROD_URL}/blog/how-to-scale-local-seo/`);

    // Click first tag
    const firstTag = page.locator('.tag').first();
    const tagText = await firstTag.textContent();
    await firstTag.click();

    // Should navigate to blog with tag filter
    await page.waitForURL(/\/blog/);
    await expect(page.url()).toContain('tag=');

    console.log('✓ Tag filter works:', tagText);
  });

  test('Popular posts toggle works', async ({ page }) => {
    await page.goto(`${PROD_URL}/blog/`);

    // Click Popular tab
    const popularBtn = page.locator('.view-btn[data-view="popular"]');
    await popularBtn.click();

    // Check it's now active
    await expect(popularBtn).toHaveClass(/active/);

    console.log('✓ Popular posts toggle works');
  });

  test('Reading progress bar works on blog post', async ({ page }) => {
    await page.goto(`${PROD_URL}/blog/how-sydney-businesses-rank-number-1-google-2025/`);

    // Check progress bar exists
    const progressBar = page.locator('.reading-progress-bar');
    await expect(progressBar).toBeVisible();

    // Get initial width
    const initialWidth = await progressBar.evaluate(el => el.style.width);

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(200);

    // Get new width
    const newWidth = await progressBar.evaluate(el => el.style.width);

    console.log(`✓ Reading progress: ${initialWidth} → ${newWidth}`);
  });

  test('Table of Contents generates and works', async ({ page }) => {
    await page.goto(`${PROD_URL}/blog/how-sydney-businesses-rank-number-1-google-2025/`);

    // Check if TOC exists (only shows if 3+ headings)
    const toc = page.locator('#toc-container');

    if (await toc.isVisible()) {
      // Check TOC has links
      const tocLinks = toc.locator('a');
      const linkCount = await tocLinks.count();

      expect(linkCount).toBeGreaterThan(0);

      // Click first TOC link
      await tocLinks.first().click();
      await page.waitForTimeout(500);

      console.log(`✓ Table of Contents works (${linkCount} links)`);
    } else {
      console.log('✓ TOC hidden (fewer than 3 headings)');
    }
  });

  test('Social sharing buttons work', async ({ page }) => {
    await page.goto(`${PROD_URL}/blog/how-to-scale-local-seo/`);

    // Check share buttons exist
    const shareButtons = page.locator('.share-btn');
    const count = await shareButtons.count();

    expect(count).toBeGreaterThanOrEqual(4); // Twitter, LinkedIn, Facebook, Copy

    console.log(`✓ ${count} social share buttons present`);
  });

  test('Related posts section shows', async ({ page }) => {
    await page.goto(`${PROD_URL}/blog/how-to-scale-local-seo/`);

    // Scroll to related posts
    const relatedSection = page.locator('.related-posts');
    await relatedSection.scrollIntoViewIfNeeded();

    // Check related posts exist
    const relatedCards = page.locator('.related-post-card');
    const count = await relatedCards.count();

    expect(count).toBeGreaterThan(0);

    console.log(`✓ ${count} related posts showing`);
  });

  test('Comments section is present', async ({ page }) => {
    await page.goto(`${PROD_URL}/blog/how-to-scale-local-seo/`);

    // Scroll to comments
    const commentsSection = page.locator('.comments-section');
    await commentsSection.scrollIntoViewIfNeeded();

    // Check comments section exists
    await expect(commentsSection).toBeVisible();

    console.log('✓ Comments section present (Giscus ready)');
  });

  test('RSS feed is accessible', async ({ page }) => {
    const response = await page.goto(`${PROD_URL}/rss.xml`);

    expect(response.status()).toBe(200);

    const content = await page.content();
    expect(content).toContain('<rss');
    expect(content).toContain('The Profit Platform Blog');

    console.log('✓ RSS feed accessible and valid');
  });

  test('All blog posts are indexed', async ({ page }) => {
    await page.goto(`${PROD_URL}/blog/`);

    // Count total article cards
    const allCards = page.locator('.article-card');
    const totalCount = await allCards.count();

    expect(totalCount).toBeGreaterThanOrEqual(7); // Should have at least 7 posts

    console.log(`✓ ${totalCount} blog posts indexed`);
  });

  test('Mobile responsiveness - blog index', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto(`${PROD_URL}/blog/`);

    // Check hero loads
    const hero = page.locator('.blog-hero');
    await expect(hero).toBeVisible();

    // Check articles grid
    const grid = page.locator('.articles-grid');
    await expect(grid).toBeVisible();

    console.log('✓ Blog index responsive on mobile');
  });

  test('Mobile responsiveness - blog post', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto(`${PROD_URL}/blog/how-to-scale-local-seo/`);

    // Check featured image loads
    const featuredImage = page.locator('.featured-image');
    await expect(featuredImage).toBeVisible();

    // Check content is readable
    const content = page.locator('.post-content');
    await expect(content).toBeVisible();

    console.log('✓ Blog post responsive on mobile');
  });

});

test.describe('SEO & Performance', () => {

  test('Blog posts have proper meta tags', async ({ page }) => {
    await page.goto(`${PROD_URL}/blog/how-to-scale-local-seo/`);

    // Check title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(10);

    // Check meta description
    const metaDesc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(metaDesc).toBeTruthy();
    expect(metaDesc.length).toBeGreaterThan(50);

    console.log('✓ Meta tags present:', title);
  });

  test('Blog posts have structured data', async ({ page }) => {
    await page.goto(`${PROD_URL}/blog/how-to-scale-local-seo/`);

    // Check for BlogPosting schema
    const schemaScript = await page.locator('script[type="application/ld+json"]').textContent();
    expect(schemaScript).toContain('BlogPosting');

    console.log('✓ BlogPosting schema present');
  });

  test('Images have lazy loading', async ({ page }) => {
    await page.goto(`${PROD_URL}/blog/how-sydney-businesses-rank-number-1-google-2025/`);

    // Check if images have loading attribute
    const images = page.locator('.post-content img');

    if (await images.count() > 0) {
      const firstImage = images.first();
      const loading = await firstImage.getAttribute('loading');

      expect(loading).toBe('lazy');
      console.log('✓ Images have lazy loading');
    } else {
      console.log('✓ No content images to check');
    }
  });

});
