import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static mode for Cloudflare Pages
// API endpoints handled by Cloudflare Pages Functions (functions/ directory)
export default defineConfig({
  output: 'static',
  site: 'https://theprofitplatform.com.au',
  base: '/',
  trailingSlash: 'always', // Always use trailing slashes to match Cloudflare Pages behavior
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      // Exclude admin, thank-you pages, etc
      filter: page =>
        !page.includes('/admin') && !page.includes('/thank-you') && !page.includes('/404'),
      // Note: Removed customPages that were causing redirects
      // Astro will auto-generate correct URLs from pages/
    }),
  ],
  vite: {
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.logs in production
        },
      },
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks: {
            // Split large vendor chunks for better caching
            vendor: ['astro'],
          },
        },
      },
    },
  },
});
