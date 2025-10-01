#!/bin/bash
echo "Setting up Parity Guardrail System..."

# Install dependencies
echo "Installing Node dependencies..."
npm install cheerio undici playwright pixelmatch pngjs axe-core

# Install Playwright browsers
echo "Installing Playwright browsers..."
npx playwright install --with-deps

echo "Setup complete! You can now run:"
echo "  npm run verify:cloudflare"
echo "  npm run verify:prod-vs-preview"
echo ""
echo "Files created:"
echo "  ✓ package.json - Dependencies and scripts"
echo "  ✓ scripts/lib/http.js - HTTP utilities"
echo "  ✓ scripts/lib/dom.js - DOM extraction"
echo "  ✓ scripts/lib/visual.js - Visual comparison"
echo "  ✓ scripts/lib/a11y.js - Behavior checks"
echo "  ✓ scripts/verify.mjs - Main verification runner"
echo "  ✓ .github/workflows/parity.yml - CI automation"
echo ""
echo "Run 'npm run verify:cloudflare' to test!"