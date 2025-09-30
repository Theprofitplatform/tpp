# Test Run Example

## Quick Test

Run this command to test the agent:

```bash
cd /home/avi/projects/astro-site/scripts/visual-check
node src/cli.js inspect --url "https://theprofitplatform.com.au"
```

## What Happens

1. **Browser Launch**: Chromium browser starts in headless mode
2. **Page Load**: Visits your URL
3. **Multi-Viewport Check**: Tests mobile + desktop (or configured viewports)
4. **Screenshot Capture**: Takes full-page screenshots
5. **Issue Detection**: Analyzes for:
   - Missing CSS/broken images
   - Layout problems
   - Font issues
   - Accessibility issues
   - Console errors
   - Performance metrics
6. **Fix Generation**: Creates automated fix suggestions
7. **Report Creation**: Generates JSON + Markdown reports
8. **Screenshot Save**: Saves to `screenshots/` directory

## Expected Output

```
🎨 Visual Quality Agent

🔍 Checking: https://theprofitplatform.com.au
  📱 Checking mobile (375x812)...
  📱 Checking desktop (1920x1080)...
  ✅ Completed (2847ms)

📝 Generating reports...
  ✅ JSON report: reports/2025-09-30T10-30-00-000Z/results.json
  ✅ Markdown report: reports/2025-09-30T10-30-00-000Z/report.md

📊 Summary:
──────────────────────────────────────────────────
  Total Issues: 3
  🔴 error: 1
  🟡 warning: 2
  Total Fixes: 3
──────────────────────────────────────────────────

📁 Results saved to: reports/2025-09-30T10-30-00-000Z
```

## View Results

```bash
# View summary
cat reports/summary.md

# View detailed report
cat reports/2025-09-30T10-30-00-000Z/report.md

# View screenshots
ls -lh screenshots/

# View raw data
cat reports/2025-09-30T10-30-00-000Z/results.json | jq
```

## Continuous Monitoring Test

```bash
# Start monitoring (Ctrl+C to stop)
node src/cli.js watch

# In another terminal, check logs
tail -f /var/log/visual-agent.log
```
