import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'static',
  adapter: cloudflare(),
  site: 'https://theprofitplatform.com.au',
  base: '/',
  trailingSlash: 'ignore',
});