// @ts-check
import { defineConfig } from 'astro/config';

// Phase 0 - Simple static config for exact parity
export default defineConfig({
  output: 'static',
  site: 'https://theprofitplatform.com.au',
  base: '/',
  trailingSlash: 'ignore',
  build: {
    inlineStylesheets: 'never'
  }
});
