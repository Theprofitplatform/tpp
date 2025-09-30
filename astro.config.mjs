import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'static',
  site: 'https://new.theprofitplatform.com.au',
  base: '/',
  trailingSlash: 'ignore',
  vite: {
    server: {
      allowedHosts: [
        '.trycloudflare.com',
        'localhost',
        '127.0.0.1'
      ]
    }
  }
});