#!/bin/bash
echo "=== DEPENDENCY MAP ===" > dependency-map.txt

for pkg in $(find . -name "package.json" -not -path "*/node_modules/*"); do
  echo -e "\n=== $pkg ===" >> dependency-map.txt
  echo "--- Dependencies ---" >> dependency-map.txt
  cat "$pkg" | jq -r '.dependencies // {} | keys[]' 2>/dev/null >> dependency-map.txt
  echo "--- DevDependencies ---" >> dependency-map.txt
  cat "$pkg" | jq -r '.devDependencies // {} | keys[]' 2>/dev/null >> dependency-map.txt
done

cat dependency-map.txt
