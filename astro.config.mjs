import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static mode for Cloudflare Pages
// API endpoints handled by Cloudflare Pages Functions (functions/ directory)
export default defineConfig({
  output: 'static',
  site: 'https://theprofitplatform.com.au',
  base: '/',
  trailingSlash: 'ignore',
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      // Exclude admin, thank-you pages, etc
      filter: (page) =>
        !page.includes('/admin') &&
        !page.includes('/thank-you') &&
        !page.includes('/404'),
      // Custom entries for priority pages
      customPages: [
        'https://theprofitplatform.com.au/', // Homepage - highest priority
        'https://theprofitplatform.com.au/seo',
        'https://theprofitplatform.com.au/google-ads',
        'https://theprofitplatform.com.au/web-design',
        'https://theprofitplatform.com.au/contact',
        'https://theprofitplatform.com.au/blog',
        'https://theprofitplatform.com.au/seo-checklist',
      ],
    }),
  ],
});