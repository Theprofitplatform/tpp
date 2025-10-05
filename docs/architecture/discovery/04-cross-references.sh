#!/bin/bash
echo "=== CROSS-SERVICE REFERENCES ===" > cross-references.txt

echo "--- Astro → API References ---" >> cross-references.txt
grep -r "fetch.*api" src/ --include="*.astro" --include="*.js" 2>/dev/null | head -20 >> cross-references.txt

echo -e "\n--- Import Statements Across Services ---" >> cross-references.txt
grep -r "from.*\.\./\.\./\|import.*\.\./\.\." api/ backend/ scripts/ --include="*.js" --include="*.mjs" 2>/dev/null | head -20 >> cross-references.txt

echo -e "\n--- Database References ---" >> cross-references.txt
find . -name "*.db" -o -name "*.sqlite" -not -path "*/node_modules/*" >> cross-references.txt

cat cross-references.txt
