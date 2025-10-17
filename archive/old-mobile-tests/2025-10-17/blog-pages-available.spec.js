import { test, expect } from '@playwright/test';

test.describe('Check available pages', () => {
  test('check main page works', async ({ page }) => {
    await page.goto('http://localhost:3001/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('check about page works', async ({ page }) => {
    await page.goto('http://localhost:3001/about');
    await expect(page.locator('body')).toBeVisible();
  });

  test('check blog page accessibility', async ({ page }) => {
    console.log('Testing blog page...');
    const response = await page.goto('http://localhost:3001/blog');
    console.log('Response status:', response.status());
    console.log('Response URL:', response.url());
    
    if (response.status() === 404) {
      const bodyText = await page.locator('body').textContent();
      console.log('404 body text:', bodyText?.substring(0, 200));
    }
  });

  test('check blog directory navigation', async ({ page }) => {
    console.log('Testing blog directory listing...');
    const response = await page.request.get('http://localhost:3001/blog/');
    console.log('Blog directory response status:', response.status());
  });
});
