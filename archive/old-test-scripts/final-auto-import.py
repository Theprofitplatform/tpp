#!/usr/bin/env python3
"""Complete automated n8n workflow import"""

import json
import subprocess
import sys

WORKFLOW_FILE = "/home/avi/projects/astro-site/n8n-workflows/advanced-seo-optimization-workflow.json"

def main():
    print("🚀 Complete Automated n8n Workflow Setup")
    print("=" * 60)
    print()

    # Load workflow
    with open(WORKFLOW_FILE, 'r') as f:
        workflow = json.load(f)

    workflow_name = workflow['name']

    try:
        import psycopg2
        import psycopg2.extras

        conn = psycopg2.connect(
            dbname='n8n',
            user='n8nuser',
            host='localhost',
            password=''  # Will use peer auth
        )
        cur = conn.cursor()

        # Delete existing
        cur.execute("DELETE FROM workflow_entity WHERE name = %s", (workflow_name,))
        print(f"🗑️  Removed existing workflow\n")

        # Insert workflow
        cur.execute("""
            INSERT INTO workflow_entity
            (name, active, nodes, connections, settings, "staticData", tags, "versionId", "createdAt", "updatedAt")
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
            RETURNING id
        """, (
            workflow_name,
            True,
            psycopg2.extras.Json(workflow['nodes']),
            psycopg2.extras.Json(workflow['connections']),
            psycopg2.extras.Json(workflow.get('settings', {'executionOrder': 'v1'})),
            None,
            psycopg2.extras.Json([]),
            1
        ))

        workflow_id = cur.fetchone()[0]
        conn.commit()

        print(f"✅ Workflow imported successfully!")
        print(f"   ID: {workflow_id}")
        print(f"   Name: {workflow_name}")
        print(f"   Active: True")
        print()

        # Setup credentials
        print("🔑 Setting up credentials...")

        # PostgreSQL
        cur.execute("SELECT id FROM credentials_entity WHERE name = %s AND type = %s",
                    ('PostgreSQL - Main DB', 'postgres'))
        if not cur.fetchone():
            cur.execute("""
                INSERT INTO credentials_entity (name, data, type, "createdAt", "updatedAt")
                VALUES (%s, %s, %s, NOW(), NOW())
            """, (
                'PostgreSQL - Main DB',
                psycopg2.extras.Json({
                    'host': 'localhost',
                    'database': 'n8n',
                    'user': 'n8nuser',
                    'password': '',
                    'port': 5432,
                    'ssl': 'disable'
                }),
                'postgres'
            ))
            print("   ✅ PostgreSQL credential created")
        else:
            print("   ✅ PostgreSQL credential exists")

        # SMTP
        cur.execute("SELECT id FROM credentials_entity WHERE name = %s AND type = %s",
                    ('SMTP - TPP', 'smtp'))
        if not cur.fetchone():
            cur.execute("""
                INSERT INTO credentials_entity (name, data, type, "createdAt", "updatedAt")
                VALUES (%s, %s, %s, NOW(), NOW())
            """, (
                'SMTP - TPP',
                psycopg2.extras.Json({
                    'host': 'smtp.gmail.com',
                    'port': 587,
                    'user': 'seo@theprofitplatform.com.au',
                    'password': '',
                    'secure': False
                }),
                'smtp'
            ))
            print("   ✅ SMTP credential created")
        else:
            print("   ✅ SMTP credential exists")

        conn.commit()
        cur.close()
        conn.close()

        # Restart n8n
        print()
        print("🔄 Restarting n8n...")
        subprocess.run(['sudo', 'systemctl', 'restart', 'n8n'], check=True)
        import time
        time.sleep(3)
        print("   ✅ n8n restarted")

        print()
        print("=" * 60)
        print("✅ SUCCESS! Workflow is imported and active")
        print("=" * 60)
        print()
        print("🔗 Webhook URL:")
        print("   https://n8n.theprofitplatform.com.au/webhook/seo-optimization")
        print()
        print("⚠️  Credentials need passwords:")
        print("   1. PostgreSQL: Set n8nuser password in n8n UI")
        print("   2. SMTP: Set Gmail app password in n8n UI")
        print()
        print("🧪 Run tests:")
        print("   cd /home/avi/projects/astro-site")
        print("   node scripts/test-seo-workflow.cjs")
        print()

        return 0

    except ImportError:
        print("❌ psycopg2 not available")
        print("Install: pip3 install psycopg2-binary")
        return 1
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    sys.exit(main())
