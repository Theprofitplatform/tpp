#!/usr/bin/env python3

"""
Check meta tags in HTML files
Validates SEO-critical meta tags
"""

import sys
from pathlib import Path
from bs4 import BeautifulSoup

REQUIRED_META_TAGS = [
    ('name', 'description'),
    ('property', 'og:title'),
    ('property', 'og:description'),
    ('property', 'og:image'),
    ('property', 'og:url'),
    ('name', 'twitter:card'),
]

REQUIRED_ELEMENTS = [
    'title',
]

def check_html_file(html_file):
    """Check meta tags in an HTML file"""
    with open(html_file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    errors = []

    # Check title
    title = soup.find('title')
    if not title or not title.string or len(title.string.strip()) == 0:
        errors.append("Missing or empty <title> tag")
    elif len(title.string) < 30:
        errors.append(f"Title too short: {len(title.string)} chars (min 30)")
    elif len(title.string) > 60:
        errors.append(f"Title too long: {len(title.string)} chars (max 60)")

    # Check required meta tags
    for attr_name, attr_value in REQUIRED_META_TAGS:
        meta = soup.find('meta', attrs={attr_name: attr_value})
        if not meta:
            errors.append(f"Missing meta tag: {attr_name}=\"{attr_value}\"")
        elif attr_name == 'name' and attr_value == 'description':
            content = meta.get('content', '')
            if len(content) < 120:
                errors.append(f"Description too short: {len(content)} chars (min 120)")
            elif len(content) > 160:
                errors.append(f"Description too long: {len(content)} chars (max 160)")

    # Check canonical URL
    canonical = soup.find('link', rel='canonical')
    if not canonical:
        errors.append("Missing canonical URL")

    return errors

def main():
    print("🔍 Checking meta tags...\n")

    root_dir = Path(__file__).parent.parent
    html_files = list(root_dir.glob('*.html'))

    if not html_files:
        print("⚠️  No HTML files found")
        return 0

    total_errors = 0

    for html_file in html_files:
        print(f"📄 {html_file.name}")

        errors = check_html_file(html_file)

        if errors:
            print(f"  ❌ {len(errors)} issues found:")
            for error in errors:
                print(f"    - {error}")
            total_errors += len(errors)
        else:
            print(f"  ✓ All meta tags present")

        print()

    print(f"📊 Summary:")
    print(f"   Files checked: {len(html_files)}")
    print(f"   Total errors: {total_errors}\n")

    if total_errors > 0:
        print("❌ Meta tag check FAILED\n")
        return 1
    else:
        print("✅ Meta tag check PASSED\n")
        return 0

if __name__ == '__main__':
    sys.exit(main())
