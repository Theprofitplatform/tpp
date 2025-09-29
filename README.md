# The Profit Platform - Astro Site

🚀 **Cloudflare Pages Deployment**: Automatic deployment configured and active!

This is the modern Astro-based website for The Profit Platform, configured for automatic deployment to Cloudflare Pages.

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
├── .github/workflows/
└── package.json
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:3001`     |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run pm2:start`       | Start with PM2 on VPS                           |

## 🌐 Deployment

- **VPS**: http://31.97.222.218:3001
- **Cloudflare Pages**: https://tpp.theprofitplatform.com.au (when configured)

## 📋 Features

✅ **Dual Deployment**: VPS + Cloudflare Pages
✅ **Automatic CI/CD**: GitHub Actions workflow
✅ **Optimized Build**: Cloudflare-specific optimizations
✅ **Custom Domains**: Production and preview environments
