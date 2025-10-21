# 🚀 Quick Start: Generate Next Batch of Suburbs

## Option 1: Generate 14 More Suburbs (Recommended)

Total after: 30 suburb pages
Time: ~40 minutes
Cost: ~$1.40
Value: ~$700

### Target Suburbs:
North Shore: Crows Nest, St Leonards, Lane Cove, Neutral Bay
Eastern Suburbs: Bondi Junction, Paddington, Randwick, Maroubra
Inner West: Glebe, Leichhardt, Balmain
Western/South: Blacktown, Bankstown, Cronulla

### Command:
```bash
# First, add these suburbs to the config:
# Edit automation/scripts/generate-suburb-pages.mjs
# Add the 14 new suburbs to targetSuburbs array
# Then run:

npm run automation:suburb-pages
npm run build
npm run deploy
```

---

## Option 2: Custom Suburbs

Pick any Sydney suburbs you want to target specifically.

### Command:
```bash
# Edit automation/scripts/generate-suburb-pages.mjs
# Add your custom suburbs
npm run automation:suburb-pages
```

---

## Need Help?

See: automation/SCALING-PLAN.md for complete details
