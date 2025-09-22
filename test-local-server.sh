#!/bin/bash
echo "Starting local test server on http://localhost:8080"
echo "Press Ctrl+C to stop"
cd "$(dirname "$0")"
python3 -m http.server 8080 2>/dev/null || python -m SimpleHTTPServer 8080
