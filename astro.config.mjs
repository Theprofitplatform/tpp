import { defineConfig } from 'astro/config';

// Static site configuration for Cloudflare Pages
// Note: No adapter needed for static deployment to Cloudflare Pages
export default defineConfig({
  output: 'static',
  site: 'https://theprofitplatform.com.au',
  base: '/',
  trailingSlash: 'ignore',
});