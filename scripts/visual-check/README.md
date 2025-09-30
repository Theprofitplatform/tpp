# 🎨 Visual Frontend Checker Agent

Automated visual inspection agent for web pages. Detects missing CSS, broken components, font issues, layout problems, and more using Playwright.

## ✨ Features

- 📸 **Multi-viewport screenshots** (mobile, tablet, desktop)
- 🔍 **Comprehensive issue detection**:
  - Missing CSS files and 404s on assets
  - Unstyled HTML elements
  - Font loading failures
  - Layout and overflow issues
  - Broken images
  - Console errors
- 📊 **Detailed reports** (JSON + Markdown)
- 🚀 **Batch URL checking**
- ⏰ **Cron-ready** for scheduled checks
- 🎯 **Exit codes** for CI/CD integration

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm or yarn

## 🚀 Quick Start

### 1. Installation

```bash
cd scripts/visual-check
npm install
npm run install-browsers
```

This will install dependencies and Chromium browser for Playwright.

### 2. Basic Usage

Check a single URL:

```bash
node visualCheck.js --url "https://theprofitplatform.com.au"
```

Check multiple URLs from a file:

```bash
node visualCheck.js --urls urls.json
```

### 3. Advanced Options

```bash
# Check only mobile and desktop (skip tablet)
node visualCheck.js --url "https://example.com" --mobile --desktop --no-tablet

# Custom output directory
node visualCheck.js --url "https://example.com" --output ./my-checks

# JSON-only report
node visualCheck.js --url "https://example.com" --format json

# Markdown-only report
node visualCheck.js --url "https://example.com" --format markdown
```

## 📁 URLs File Format

Create a `urls.json` file for batch checking:

```json
{
  "urls": [
    {
      "url": "https://theprofitplatform.com.au",
      "name": "Home Page"
    },
    {
      "url": "https://theprofitplatform.com.au/about",
      "name": "About Page"
    },
    {
      "url": "https://test.theprofitplatform.com.au",
      "name": "Test Site"
    }
  ]
}
```

Or simplified array format:

```json
[
  {
    "url": "https://theprofitplatform.com.au",
    "name": "Production"
  }
]
```

## 📊 Output Structure

After running, you'll get:

```
visual-checks/
└── run-2025-09-30T12-30-45/
    ├── report.json           # Detailed JSON report
    ├── report.md             # Human-readable markdown report
    └── theprofitplatform/
        ├── mobile/
        │   ├── full-page.png
        │   └── viewport.png
        ├── tablet/
        │   ├── full-page.png
        │   └── viewport.png
        └── desktop/
            ├── full-page.png
            └── viewport.png
```

## 🔍 Issue Detection

The agent detects:

### 1. **Missing Assets**
- 404 errors on CSS, JS, images, fonts
- Failed resource loads

### 2. **CSS Issues**
- Stylesheets that failed to load
- Unstyled pages (minimal styling detected)
- Excessive inline styles (possible CSS failure)

### 3. **Font Issues**
- Fonts still loading/unloaded
- System fonts only (custom fonts not loaded)

### 4. **Layout Issues**
- Horizontal overflow (elements beyond viewport)
- Broken images
- Zero-dimension elements
- Missing critical elements (title, h1, main)

### 5. **Console Errors**
- JavaScript errors in console

### 6. **HTTP Errors**
- Non-200 status codes

## 🔧 CLI Options

| Option | Alias | Type | Default | Description |
|--------|-------|------|---------|-------------|
| `--url` | `-u` | string | - | Single URL to check |
| `--urls` | - | string | - | Path to JSON file with URLs |
| `--mobile` | `-m` | boolean | true | Check mobile viewport (375x812) |
| `--tablet` | `-t` | boolean | false | Check tablet viewport (768x1024) |
| `--desktop` | `-d` | boolean | true | Check desktop viewport (1920x1080) |
| `--output` | `-o` | string | `./visual-checks` | Output directory |
| `--format` | `-f` | string | `both` | Report format: json, markdown, both |
| `--help` | `-h` | - | - | Show help |

## 🔁 Scheduled Checks (Cron)

### Method 1: Direct Cron

Add to crontab (`crontab -e`):

```bash
# Check every hour
0 * * * * cd /home/avi/projects/astro-site/scripts/visual-check && /usr/bin/node visualCheck.js --url "https://theprofitplatform.com.au" --urls production-urls.json >> /var/log/visual-check.log 2>&1

# Check every 6 hours
0 */6 * * * cd /home/avi/projects/astro-site/scripts/visual-check && /usr/bin/node visualCheck.js --urls production-urls.json

# Daily at 3 AM
0 3 * * * cd /home/avi/projects/astro-site/scripts/visual-check && /usr/bin/node visualCheck.js --urls all-sites.json
```

### Method 2: Systemd Timer (Recommended)

Create `/etc/systemd/system/visual-check.service`:

```ini
[Unit]
Description=Visual Frontend Check
After=network.target

[Service]
Type=oneshot
User=avi
WorkingDirectory=/home/avi/projects/astro-site/scripts/visual-check
ExecStart=/usr/bin/node visualCheck.js --urls /home/avi/projects/astro-site/scripts/visual-check/production-urls.json
StandardOutput=append:/var/log/visual-check.log
StandardError=append:/var/log/visual-check.log

[Install]
WantedBy=multi-user.target
```

Create `/etc/systemd/system/visual-check.timer`:

```ini
[Unit]
Description=Run Visual Frontend Check hourly
Requires=visual-check.service

[Timer]
OnCalendar=hourly
Persistent=true

[Install]
WantedBy=timers.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable visual-check.timer
sudo systemctl start visual-check.timer

# Check status
sudo systemctl status visual-check.timer
sudo systemctl list-timers
```

## 🚦 Exit Codes

- `0` - All checks passed, no issues
- `1` - One or more checks failed
- `2` - Checks passed but issues detected
- `3` - Fatal error occurred

Perfect for CI/CD integration:

```bash
node visualCheck.js --url "https://staging.example.com"
if [ $? -eq 0 ]; then
  echo "✅ Deployment verified!"
else
  echo "❌ Visual issues detected"
  exit 1
fi
```

## 🐳 Docker Usage

Create `Dockerfile`:

```dockerfile
FROM mcr.microsoft.com/playwright:v1.48.0-jammy

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ENTRYPOINT ["node", "visualCheck.js"]
```

Build and run:

```bash
docker build -t visual-checker .
docker run --rm -v $(pwd)/visual-checks:/app/visual-checks visual-checker --url "https://example.com"
```

## 🔧 Configuration

Edit `visualCheck.js` to customize:

```javascript
const CONFIG = {
  outputDir: path.join(__dirname, 'visual-checks'),
  viewports: {
    mobile: { width: 375, height: 812, name: 'mobile' },
    tablet: { width: 768, height: 1024, name: 'tablet' },
    desktop: { width: 1920, height: 1080, name: 'desktop' }
  },
  timeout: 30000,  // 30 seconds
  waitForNetworkIdle: true
};
```

## 📝 Example Output

### Terminal Output
```
🎨 Visual Frontend Checker Agent

Output directory: visual-checks/run-2025-09-30T12-30-45
Checking 2 URL(s) across 2 viewport(s)

🔍 Checking: https://theprofitplatform.com.au
  📱 Checking mobile (375x812)...
  📱 Checking desktop (1920x1080)...
  ⚠️  Completed with 3 issue(s) (2847ms)

📝 Generating reports...
  ✅ JSON report: visual-checks/run-2025-09-30T12-30-45/report.json
  ✅ Markdown report: visual-checks/run-2025-09-30T12-30-45/report.md

📊 Summary:
──────────────────────────────────────────────────
  Total URLs checked: 1
  ✅ Successful: 1
  ⚠️  Total issues: 3
──────────────────────────────────────────────────

📁 Results saved to: visual-checks/run-2025-09-30T12-30-45
```

## 🛠️ Development

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
```

### Debug Mode
Set environment variable:
```bash
DEBUG=1 node visualCheck.js --url "https://example.com"
```

## 📚 Use Cases

1. **Pre-deployment verification** - Check staging before production
2. **Scheduled monitoring** - Hourly/daily checks for regressions
3. **Multi-environment testing** - Compare dev, staging, production
4. **CI/CD integration** - Fail builds on visual issues
5. **Post-deployment verification** - Ensure successful deploys

## 🤝 Contributing

Improvements welcome! Key areas:
- Additional issue detection patterns
- Performance optimizations
- New report formats
- Comparison between runs

## 📄 License

MIT

## 🆘 Troubleshooting

### Playwright browser not found
```bash
npm run install-browsers
```

### Permission denied
```bash
chmod +x visualCheck.js
```

### Timeout errors
Increase timeout in CONFIG or use `--timeout 60000`

### Memory issues with large sites
Check one viewport at a time:
```bash
node visualCheck.js --url "..." --mobile --no-desktop
```

---

**Made with ❤️ for reliable frontend monitoring**