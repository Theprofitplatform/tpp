# Blog Automation CLI

Unified command-line interface for all blog automation tasks.

## Quick Start

```bash
# Via npm scripts (recommended)
npm run blog:generate
npm run blog:validate
npm run blog:verify

# Direct CLI usage
node tools/blog-cli.mjs generate
node tools/blog-cli.mjs --help

# Show all commands
npm run blog
```

## Available Commands

### Content Generation
- `blog:generate` - Generate new blog post from topic queue
- `blog:validate` - Validate blog content structure and quality
- `blog:test` - Generate + validate (compound command)

### Content Quality
- `blog:validate-schema` - Validate JSON-LD schema markup
- `blog:validate-authors` - Validate author profile data
- `blog:check-links` - Check for broken internal/external links
- `blog:plagiarism` - Check content for plagiarism
- `blog:images` - Update and optimize blog images

### SEO & Analytics
- `blog:performance` - Track blog performance metrics
- `blog:insights` - Generate SEO insights report
- `blog:optimize` - Optimize existing content for SEO
- `blog:opportunities` - Find SEO content opportunities
- `blog:keyword-research` - Perform keyword research
- `blog:link-map` - Build internal linking map

### Competitive Analysis
- `blog:competitor` - Analyze competitor content
- `blog:calendar` - Generate content calendar
- `blog:ab-test` - A/B test headline variations

### Monitoring & Alerts
- `blog:alerts` - Monitor performance alerts
- `blog:dashboard` - Generate analytics dashboard

### System
- `blog:master` - Run master automation workflow
- `blog:verify` - Verify setup and API connections

## Architecture

The CLI wraps existing automation scripts in `automation/scripts/` with:
- Unified command interface
- Lazy loading (fast startup)
- Better error handling
- Debug mode support

### File Structure

```
tools/
└── blog-cli.mjs          # CLI entry point

automation/
└── scripts/              # Individual script implementations
    ├── generate-blog-post.js
    ├── validate-content.js
    └── ... (20+ scripts)
```

## Migration from Old Scripts

**Before** (direct script execution):
```bash
node automation/scripts/generate-blog-post.js
node automation/scripts/validate-content.js
```

**After** (unified CLI):
```bash
npm run blog:generate
npm run blog:validate
```

**Benefits**:
- Single entry point for all blog operations
- Consistent command interface
- Better error messages
- Shared configuration
- Easier to test and maintain

## Debug Mode

Enable verbose output for troubleshooting:

```bash
node tools/blog-cli.mjs generate --debug
```

## Adding New Commands

1. Create script in `automation/scripts/`
2. Add to `SCRIPT_MAP` in `tools/blog-cli.mjs`
3. Add npm script in `package.json`

Example:

```javascript
// In tools/blog-cli.mjs
const SCRIPT_MAP = {
  'new-command': 'automation/scripts/new-command.mjs',
  // ...
};
```

```json
// In package.json
{
  "scripts": {
    "blog:new-command": "node tools/blog-cli.mjs new-command"
  }
}
```

## Backward Compatibility

All existing npm scripts (`blog:*`) work identically. The CLI is a transparent wrapper that maintains 100% compatibility with previous behavior.

Scripts in `automation/scripts/` are preserved and can still be executed directly if needed.

## Performance

CLI startup is optimized with lazy loading:
- Commands are only loaded when executed
- No memory overhead for unused scripts
- Fast help/version display

## Environment Variables

Scripts use environment variables from `.env.local`:
- `CLAUDE_API_KEY` - Anthropic Claude API key
- `GA4_PROPERTY_ID` - Google Analytics 4 property ID
- `SEARCH_CONSOLE_SITE_URL` - Google Search Console site
- And more (see individual scripts)

## Troubleshooting

**Command not found**:
```bash
npm run blog  # Shows all available commands
```

**Script fails**:
```bash
node tools/blog-cli.mjs <command> --debug  # Enable debug output
```

**Import errors**:
- Ensure you're using Node.js 18+
- Check `package.json` has `"type": "module"`
- Verify all dependencies are installed: `npm install`

## Examples

**Daily workflow**:
```bash
# Morning: Check setup
npm run blog:verify

# Generate new post
npm run blog:generate

# Validate and optimize
npm run blog:validate
npm run blog:optimize

# Check performance
npm run blog:performance
npm run blog:insights
```

**Content audit**:
```bash
npm run blog:check-links
npm run blog:validate-schema
npm run blog:plagiarism
```

**SEO research**:
```bash
npm run blog:keyword-research
npm run blog:opportunities
npm run blog:competitor
```

## Future Enhancements

Planned improvements:
- Interactive prompts for common tasks
- Configuration file support (`.blogrc`)
- Parallel execution of multiple commands
- Progress bars for long-running operations
- JSON output mode for CI/CD integration

## Support

For issues or questions:
1. Check command help: `node tools/blog-cli.mjs <command> --help`
2. Enable debug mode: `--debug`
3. Review script source in `automation/scripts/`
4. See main documentation: `docs/README.md`
