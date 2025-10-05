#!/bin/bash
echo "=== ENVIRONMENT AUDIT ===" > env-audit.txt
echo "Finding .env files (content redacted for security):" >> env-audit.txt
find . -name ".env*" -not -path "*/node_modules/*" -exec echo {} \; >> env-audit.txt

echo -e "\n--- Environment Variable Keys (no values) ---" >> env-audit.txt
find . -name ".env" -not -path "*/node_modules/*" -exec sh -c 'echo "\nFile: {}" && grep -o "^[A-Z_]*=" {} | sed "s/=//"' \; >> env-audit.txt 2>/dev/null

echo -e "\n--- PUBLIC_API_URL References ---" >> env-audit.txt
grep -r "PUBLIC_API_URL\|API_URL" src/ --include="*.astro" --include="*.js" 2>/dev/null >> env-audit.txt

cat env-audit.txt
