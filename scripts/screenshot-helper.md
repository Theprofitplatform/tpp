# Screenshot Helper - Safe Chrome DevTools Usage

## ⚠️ MANDATORY: Always Use These Settings

When taking screenshots with Chrome DevTools MCP, **ALWAYS** include compression parameters:

```javascript
// ✅ CORRECT - Standard page screenshot
take_screenshot({
  format: "jpeg",
  quality: 75
})

// ✅ CORRECT - Element screenshot
take_screenshot({
  uid: "element-123",
  format: "jpeg",
  quality: 80
})

// ❌ WRONG - Never use defaults (creates oversized PNG)
take_screenshot()

// ❌ BANNED - Full-page screenshots ALWAYS fail on long pages
take_screenshot({ fullPage: true })
take_screenshot({ fullPage: true, format: "jpeg", quality: 60 })
```

## Required Pre-Flight Checklist

Before ANY screenshot:

1. **Resize browser first** (prevents dimension errors):
   ```javascript
   resize_page({ width: 1920, height: 1080 })  // Standard viewport
   ```

2. **Always specify format and quality**:
   - Format: `"jpeg"` (not PNG - too large!)
   - Quality: 75-85 (standard range)

3. **NEVER use fullPage: true**:
   - Long pages exceed 8000px height even with compression
   - Use `take_snapshot()` for full page content instead
   - Or take multiple element screenshots

## Quick Decision Tree

**"I need to see how something looks (visual/CSS)"** → `take_screenshot()` with JPEG

**"I need to interact with elements"** → `take_snapshot()` (text-based, no image)

**"I need to debug a specific element"** → `take_screenshot({ uid: "...", format: "jpeg", quality: 80 })`

**"I need to see the whole page"** → `take_snapshot()` for text, or multiple element screenshots

**"I need full page screenshot"** → ❌ **IMPOSSIBLE** - Use `take_snapshot()` instead

## What Went Wrong?

The dimension error happens when:
- ❌ Using default PNG format (uncompressed, huge dimensions)
- ❌ Using `fullPage: true` on ANY page (long pages exceed 8000px height)
- ❌ Not specifying format and quality parameters
- ❌ Browser window too large (> 1920px width)

**Why fullPage always fails:**
- Blog posts and long pages are often 10,000+ pixels tall
- Compression doesn't fix height - only reduces file size
- There is **NO safe way** to use `fullPage: true`

## File Reading Safety

Before reading ANY image file:

```bash
# Check image first
npm run image:check filename.png

# Or check all images
npm run image:check-all
```

If validation fails, **DO NOT read the file**. Start a new conversation instead.
