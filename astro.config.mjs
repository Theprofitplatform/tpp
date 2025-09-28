// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: process.env.CF_PAGES ? 'static' : 'server',
  adapter: process.env.CF_PAGES ? undefined : node({
    mode: 'standalone'
  }),
  server: {
    port: 3001,
    host: true
  },
  build: {
    inlineStylesheets: 'auto'
  },
  // Cloudflare Pages configuration
  site: 'https://tpp.theprofitplatform.com.au'
});
