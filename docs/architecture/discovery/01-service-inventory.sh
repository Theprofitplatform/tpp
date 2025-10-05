#!/bin/bash
echo "=== SERVICE INVENTORY ===" > service-inventory.txt
echo "Date: $(date)" >> service-inventory.txt
echo "" >> service-inventory.txt

echo "--- Package.json Files ---" >> service-inventory.txt
find . -name "package.json" -not -path "*/node_modules/*" -exec echo {} \; >> service-inventory.txt

echo -e "\n--- Running Processes ---" >> service-inventory.txt
ps aux | grep -E "node.*server|pm2|astro" | grep -v grep >> service-inventory.txt

echo -e "\n--- PM2 Status ---" >> service-inventory.txt
pm2 list 2>/dev/null >> service-inventory.txt || echo "PM2 not running" >> service-inventory.txt

echo -e "\n--- Systemd Timers ---" >> service-inventory.txt
systemctl list-timers --all 2>/dev/null | grep -E "visual|playwright" >> service-inventory.txt || echo "No systemd access or no timers found" >> service-inventory.txt

echo -e "\n--- Port Listeners ---" >> service-inventory.txt
ss -tulpn 2>/dev/null | grep -E ":3001|:4321|:5678" >> service-inventory.txt || netstat -tulpn 2>/dev/null | grep -E ":3001|:4321|:5678" >> service-inventory.txt || echo "Cannot check ports" >> service-inventory.txt

cat service-inventory.txt
