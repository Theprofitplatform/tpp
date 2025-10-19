# Image Safeguards Implementation

## Problem
Claude Code was hitting API errors due to images exceeding 8000px dimensions, causing entire conversations to fail with no recovery option. The instructions in CLAUDE.md were not being followed.

## Root Cause Analysis
1. **ImageMagick not installed** - CLAUDE.md referenced `identify` and `convert` commands that weren't available
2. **No enforcement** - Instructions were guidelines, not enforced checks
3. **Easy to forget** - Chrome DevTools screenshots default to PNG (uncompressed, large dimensions)
4. **No validation layer** - No way to check images before they entered the conversation

## Solutions Implemented

### 1. Image Dimension Validator (`scripts/check-image-dimensions.mjs`)
- **Pure Node.js solution** - No dependencies, works without ImageMagick
- **Checks file size** - Ensures < 5MB limit
- **Checks dimensions** - Parses PNG/JPEG/WebP headers to extract dimensions
- **Safe threshold warnings** - Warns if > 7000px (staying under 8000px limit)
- **Actionable errors** - Provides exact commands to fix issues

**Usage:**
```bash
npm run image:check filename.png           # Check single file
npm run image:check-all                    # Check all images in root
node scripts/check-image-dimensions.mjs    # Direct usage
```

### 2. Screenshot Helper Guide (`scripts/screenshot-helper.md`)
- **Decision tree** - When to use snapshots vs screenshots
- **Required parameters** - Always use `format: "jpeg", quality: 75`
- **Browser resize requirements** - Must resize before full-page screenshots
- **Common mistakes** - What NOT to do

### 3. Updated CLAUDE.md with Enforcement Language
**Changed from:**
- "Always follow these practices" (suggestion)
- "Use `identify` to check" (command doesn't exist)

**Changed to:**
- "⚠️ BREAKING THESE RULES CAUSES CONVERSATION-ENDING API ERRORS"
- "MANDATORY: Validate BEFORE reading any image file"
- "If validation fails: DO NOT READ THE FILE"
- References to working validation tools: `npm run image:check`

### 4. Package.json Scripts
Added convenient npm commands:
```json
{
  "image:check": "node scripts/check-image-dimensions.mjs",
  "image:check-all": "node scripts/check-image-dimensions.mjs *.png *.jpg *.jpeg *.webp"
}
```

## How to Use (For Claude)

### Before Taking Screenshots
```javascript
// ALWAYS include these parameters
resize_page({ width: 1920, height: 1080 })
take_screenshot({ format: "jpeg", quality: 75 })

// NEVER use defaults
take_screenshot()  // ❌ Will create oversized PNG
```

### Before Reading Image Files
```bash
# ALWAYS validate first
npm run image:check filename.png

# If this passes, safe to read
# If this fails, DO NOT READ - start new conversation
```

### What to Do on Dimension Error
1. **STOP** - Conversation is dead, no recovery
2. **Start new conversation** - Only solution
3. **Validate images** before reading in new conversation
4. **Consider installing ImageMagick** for resize capabilities

## Testing

Validation works correctly on existing project images:
```
✅ blog-final-desktop.png: 1920x5952px (0.51 MB) - PASS
✅ locations-final.png: 1280x4914px (1.10 MB) - PASS
✅ locations-screenshot.png: 1280x5576px (1.35 MB) - PASS
✅ locations-updated.png: 1280x5228px (1.31 MB) - PASS
```

## Future Improvements

### Optional: Install ImageMagick for Resize Capabilities
```bash
sudo apt-get install imagemagick  # Ubuntu/WSL
brew install imagemagick          # macOS
```

Then use for fixing oversized images:
```bash
convert large.png -resize 7000x7000\> -quality 80 safe.jpg
```

### Optional: Pre-commit Hook
Could add git hook to validate images before committing:
```bash
#!/bin/bash
# .git/hooks/pre-commit
npm run image:check-all || {
  echo "❌ Images exceed safe dimensions"
  exit 1
}
```

### Optional: Claude Code Hooks
If Claude Code supports pre-tool-use hooks, could add:
```yaml
# .claude/hooks.yml (hypothetical)
pre_tool_use:
  Read:
    - if [[ "$file_path" =~ \.(png|jpg|jpeg|webp)$ ]]; then
        npm run image:check "$file_path" || exit 1
      fi
```

## Summary

**Before this implementation:**
- ❌ Instructions ignored → conversation-ending errors
- ❌ No validation tools available
- ❌ ImageMagick commands referenced but not installed
- ❌ Easy to forget compression parameters

**After this implementation:**
- ✅ Validation tool that works (Node.js-based)
- ✅ Convenient npm scripts
- ✅ Stronger enforcement language in CLAUDE.md
- ✅ Screenshot helper guide with examples
- ✅ Clear recovery instructions

**Key insight:** Guidelines alone don't work. Need:
1. **Validation tools** that can be run
2. **Strong language** ("MANDATORY", "DO NOT")
3. **Actionable instructions** with exact commands
4. **Recovery procedures** when things go wrong
