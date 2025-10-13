#!/usr/bin/env python3

"""
Validate sitemap.xml
Checks structure and URL validity
"""

import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from datetime import datetime

def validate_sitemap(sitemap_path):
    """Validate sitemap XML structure and content"""
    errors = []

    if not sitemap_path.exists():
        return ['Sitemap file not found: sitemap.xml']

    try:
        tree = ET.parse(sitemap_path)
        root = tree.getroot()
    except ET.ParseError as e:
        return [f'Invalid XML: {e}']

    # Check namespace
    namespace = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}

    # Find all URLs
    urls = root.findall('.//ns:url', namespace)

    if not urls:
        errors.append('No URLs found in sitemap')
        return errors

    print(f"  Found {len(urls)} URLs")

    for i, url_elem in enumerate(urls, 1):
        loc = url_elem.find('ns:loc', namespace)
        lastmod = url_elem.find('ns:lastmod', namespace)
        changefreq = url_elem.find('ns:changefreq', namespace)
        priority = url_elem.find('ns:priority', namespace)

        # Check required loc element
        if loc is None or not loc.text:
            errors.append(f'URL {i}: Missing <loc> element')
            continue

        # Validate URL format
        url = loc.text
        if not url.startswith(('http://', 'https://')):
            errors.append(f'URL {i}: Invalid URL format: {url}')

        # Validate lastmod date format
        if lastmod is not None and lastmod.text:
            try:
                datetime.fromisoformat(lastmod.text.replace('Z', '+00:00'))
            except ValueError:
                errors.append(f'URL {i}: Invalid date format in <lastmod>: {lastmod.text}')

        # Validate changefreq
        valid_freqs = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never']
        if changefreq is not None and changefreq.text not in valid_freqs:
            errors.append(f'URL {i}: Invalid <changefreq>: {changefreq.text}')

        # Validate priority
        if priority is not None:
            try:
                p = float(priority.text)
                if not 0.0 <= p <= 1.0:
                    errors.append(f'URL {i}: Priority must be between 0.0 and 1.0: {p}')
            except ValueError:
                errors.append(f'URL {i}: Invalid <priority> value: {priority.text}')

    return errors

def main():
    print("🔍 Validating sitemap...\n")

    root_dir = Path(__file__).parent.parent
    sitemap_path = root_dir / 'sitemap.xml'

    print(f"📄 Checking {sitemap_path.name}")

    errors = validate_sitemap(sitemap_path)

    if errors:
        print(f"  ❌ {len(errors)} issues found:")
        for error in errors:
            print(f"    - {error}")
        print("\n❌ Sitemap validation FAILED\n")
        return 1
    else:
        print(f"  ✓ Sitemap is valid")
        print("\n✅ Sitemap validation PASSED\n")
        return 0

if __name__ == '__main__':
    sys.exit(main())
