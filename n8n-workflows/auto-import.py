#!/usr/bin/env python3
"""
n8n Workflow Auto-Importer
Imports the Tool Improvement Agent workflow directly into PostgreSQL
"""

import json
import psycopg2
from datetime import datetime
import sys

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'database': 'n8n',
    'user': 'n8nuser',
    'password': 'n8npassword'
}

WORKFLOW_FILE = '/home/avi/projects/astro-site/n8n-workflows/tool-improvement-agent-workflow.json'

def import_workflow():
    """Import workflow directly into n8n database"""

    print("🚀 n8n Workflow Auto-Importer")
    print("=" * 60)
    print()

    # Read workflow JSON
    print("📖 Reading workflow file...")
    try:
        with open(WORKFLOW_FILE, 'r') as f:
            workflow = json.load(f)
    except Exception as e:
        print(f"❌ Error reading workflow file: {e}")
        return False

    print(f"✅ Workflow loaded: {workflow['name']}")
    print()

    # Connect to database
    print("🔌 Connecting to n8n database...")
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

    print("✅ Connected to database")
    print()

    # Insert workflow
    print("📥 Importing workflow...")

    try:
        # Generate unique ID
        workflow_id = f"tool-improvement-agent-{int(datetime.now().timestamp())}"

        # Prepare data
        now = datetime.now()

        # Insert query
        insert_query = """
        INSERT INTO workflow_entity (
            id,
            name,
            active,
            nodes,
            connections,
            settings,
            "staticData",
            tags,
            "pinData",
            "versionId",
            "createdAt",
            "updatedAt"
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
        RETURNING id, name;
        """

        # Execute insert
        cur.execute(insert_query, (
            workflow_id,
            workflow['name'],
            False,  # Start inactive
            json.dumps(workflow['nodes']),
            json.dumps(workflow['connections']),
            json.dumps(workflow.get('settings', {})),
            json.dumps(workflow.get('staticData', {})),
            json.dumps(workflow.get('tags', [])),
            json.dumps(workflow.get('pinData', {})),
            workflow.get('versionId', '1'),
            now,
            now
        ))

        result = cur.fetchone()
        conn.commit()

        print(f"✅ Workflow imported successfully!")
        print(f"   ID: {result[0]}")
        print(f"   Name: {result[1]}")
        print()

    except Exception as e:
        print(f"❌ Import failed: {e}")
        conn.rollback()
        return False

    finally:
        cur.close()
        conn.close()

    # Success message
    print("=" * 60)
    print("🎉 Import Complete!")
    print("=" * 60)
    print()
    print("📋 Next Steps:")
    print()
    print("1. Open n8n:")
    print("   https://n8n.theprofitplatform.com.au/workflows")
    print()
    print("2. Find 'Tool Improvement Agent' workflow")
    print()
    print("3. Click 'Send Gmail' node and configure OAuth2:")
    print("   • Create new credential")
    print("   • Enter Google OAuth Client ID & Secret")
    print("   • Authorize access")
    print()
    print("4. Toggle 'Active' switch (top right)")
    print()
    print("5. Done! Reports will arrive every 30 minutes")
    print()
    print("=" * 60)

    return True

if __name__ == '__main__':
    try:
        success = import_workflow()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n❌ Import cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        sys.exit(1)
