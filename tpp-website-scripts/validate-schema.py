#!/usr/bin/env python3

"""
Validate JSON-LD schema markup in HTML files
Checks for LocalBusiness, Organization, and other schemas
"""

import json
import sys
import re
from pathlib import Path
from bs4 import BeautifulSoup

def extract_json_ld(html_content):
    """Extract JSON-LD scripts from HTML"""
    soup = BeautifulSoup(html_content, 'html.parser')
    scripts = soup.find_all('script', type='application/ld+json')
    schemas = []

    for script in scripts:
        try:
            schema = json.loads(script.string)
            schemas.append(schema)
        except json.JSONDecodeError as e:
            print(f"  ⚠️  Invalid JSON-LD: {e}")

    return schemas

def validate_schema(schema, schema_type):
    """Validate required fields for schema type"""
    required_fields = {
        'LocalBusiness': ['@type', 'name', 'address', 'telephone'],
        'Organization': ['@type', 'name', 'url'],
        'WebSite': ['@type', 'name', 'url'],
        'FAQPage': ['@type', 'mainEntity'],
    }

    errors = []
    schema_type_value = schema.get('@type', '')

    if schema_type_value in required_fields:
        for field in required_fields[schema_type_value]:
            if field not in schema:
                errors.append(f"Missing required field: {field}")

    return errors

def main():
    print("🔍 Validating schema markup...\n")

    root_dir = Path(__file__).parent.parent
    html_files = list(root_dir.glob('*.html'))

    if not html_files:
        print("⚠️  No HTML files found")
        return 0

    total_schemas = 0
    total_errors = 0

    for html_file in html_files:
        print(f"📄 {html_file.name}")

        with open(html_file, 'r', encoding='utf-8') as f:
            html_content = f.read()

        schemas = extract_json_ld(html_content)

        if not schemas:
            print("  ⚠️  No JSON-LD schemas found")
            continue

        for i, schema in enumerate(schemas, 1):
            schema_type = schema.get('@type', 'Unknown')
            print(f"  Schema {i}: {schema_type}")

            errors = validate_schema(schema, schema_type)

            if errors:
                print(f"    ❌ Validation errors:")
                for error in errors:
                    print(f"      - {error}")
                total_errors += len(errors)
            else:
                print(f"    ✓ Valid")

            total_schemas += 1

        print()

    print(f"📊 Summary:")
    print(f"   Files checked: {len(html_files)}")
    print(f"   Schemas found: {total_schemas}")
    print(f"   Errors: {total_errors}\n")

    if total_errors > 0:
        print("❌ Schema validation FAILED\n")
        return 1
    else:
        print("✅ Schema validation PASSED\n")
        return 0

if __name__ == '__main__':
    sys.exit(main())
