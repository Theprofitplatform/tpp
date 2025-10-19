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

// ✅ CORRECT - Full page screenshot
resize_page({ width: 1280, height: 800 })
take_screenshot({
  fullPage: true,
  format: "jpeg",
  quality: 60
})

// ❌ WRONG - Never use defaults (creates oversized PNG)
take_screenshot()
take_screenshot({ fullPage: true })
```

## Required Pre-Flight Checklist

Before ANY screenshot:

1. **Resize browser first** (prevents dimension errors):
   ```javascript
   resize_page({ width: 1920, height: 1080 })  // Standard
   resize_page({ width: 1280, height: 800 })   // Safe for full-page
   ```

2. **Always specify format and quality**:
   - Format: `"jpeg"` (not PNG - too large!)
   - Quality: 60-80 (lower for full-page screenshots)

3. **Full-page screenshots need extra care**:
   - Resize to 1280x800 FIRST
   - Use quality 60-70 (not 75+)
   - Consider if you really need full page vs just element screenshot

## Quick Decision Tree

**"I need to see how something looks (visual/CSS)"** → `take_screenshot()` with JPEG

**"I need to interact with elements"** → `take_snapshot()` (text-based, no image)

**"I need to debug a specific element"** → `take_screenshot({ uid: "...", format: "jpeg", quality: 80 })`

**"I need full page"** → Resize to 1280x800, then `take_screenshot({ fullPage: true, format: "jpeg", quality: 60 })`

## What Went Wrong?

The dimension error happens when:
- ❌ Using default PNG format (uncompressed, huge dimensions)
- ❌ Taking full-page screenshots on long pages without resizing
- ❌ Not specifying quality parameter
- ❌ Browser window too large (> 1920px width)

## File Reading Safety

Before reading ANY image file:

```bash
# Check image first
npm run image:check filename.png

# Or check all images
npm run image:check-all
```

If validation fails, **DO NOT read the file**. Start a new conversation instead.
