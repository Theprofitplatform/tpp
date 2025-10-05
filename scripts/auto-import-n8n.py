#!/usr/bin/env python3
"""
Automated n8n workflow import using PostgreSQL
"""

import json
import subprocess
import sys
from datetime import datetime

WORKFLOW_FILE = "/home/avi/projects/astro-site/n8n-workflows/advanced-seo-optimization-workflow.json"
DB_NAME = "n8n"

def run_sql(sql):
    """Execute SQL via psql"""
    cmd = ["sudo", "-u", "postgres", "psql", "-d", DB_NAME, "-t", "-c", sql]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout.strip(), result.returncode

def run_sql_file(sql_content):
    """Execute SQL from stdin"""
    cmd = ["sudo", "-u", "postgres", "psql", "-d", DB_NAME]
    result = subprocess.run(cmd, input=sql_content, capture_output=True, text=True)
    return result.stdout, result.stderr, result.returncode

def main():
    print("🚀 Automated n8n Workflow Import")
    print("=" * 50)
    print()

    # Load workflow
    print("📥 Loading workflow...")
    try:
        with open(WORKFLOW_FILE, 'r') as f:
            workflow = json.load(f)
    except Exception as e:
        print(f"❌ Error loading workflow: {e}")
        return 1

    workflow_name = workflow.get('name', 'Advanced SEO Optimization & Analysis Chain')
    nodes_json = json.dumps(workflow.get('nodes', []))
    connections_json = json.dumps(workflow.get('connections', {}))
    settings_json = json.dumps(workflow.get('settings', {'executionOrder': 'v1'}))

    print(f"   Workflow: {workflow_name}")
    print(f"   Nodes: {len(workflow.get('nodes', []))}")
    print()

    # Delete existing workflow
    print("🗑️  Removing existing workflow...")
    sql = f"DELETE FROM workflow_entity WHERE name = '{workflow_name}';"
    output, code = run_sql(sql)
    print(f"   {output if output else 'No existing workflow'}")
    print()

    # Insert workflow using COPY or file-based approach
    print("📊 Importing workflow...")

    # Create a temporary JSON file for the workflow data
    import tempfile
    import os

    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as tf:
        json.dump({
            'name': workflow_name,
            'active': True,
            'nodes': workflow.get('nodes', []),
            'connections': workflow.get('connections', {}),
            'settings': workflow.get('settings', {'executionOrder': 'v1'}),
            'staticData': None,
            'tags': [],
            'versionId': 1
        }, tf)
        temp_file = tf.name

    try:
        # Use Python to insert via psycopg2 if available, otherwise use file method
        try:
            import psycopg2
            import psycopg2.extras

            conn = psycopg2.connect(
                dbname=DB_NAME,
                user='postgres',
                host='localhost'
            )
            cur = conn.cursor()

            # Insert workflow
            cur.execute("""
                INSERT INTO workflow_entity (name, active, nodes, connections, settings, "staticData", tags, "versionId", "createdAt", "updatedAt")
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                RETURNING id
            """, (
                workflow_name,
                True,
                psycopg2.extras.Json(workflow.get('nodes', [])),
                psycopg2.extras.Json(workflow.get('connections', {})),
                psycopg2.extras.Json(workflow.get('settings', {'executionOrder': 'v1'})),
                None,
                psycopg2.extras.Json([]),
                1
            ))

            workflow_id = cur.fetchone()[0]
            conn.commit()

            print(f"   ✅ Workflow imported (ID: {workflow_id})")

            # Create credentials if they don't exist
            print()
            print("🔑 Setting up credentials...")

            # PostgreSQL credential
            cur.execute("SELECT id FROM credentials_entity WHERE name = 'PostgreSQL - Main DB' AND type = 'postgres'")
            if not cur.fetchone():
                cur.execute("""
                    INSERT INTO credentials_entity (name, data, type, "createdAt", "updatedAt")
                    VALUES (%s, %s, %s, NOW(), NOW())
                    RETURNING id
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
                pg_cred_id = cur.fetchone()[0]
                print(f"   ✅ PostgreSQL credential created (ID: {pg_cred_id})")
            else:
                print("   ✅ PostgreSQL credential exists")

            # SMTP credential
            cur.execute("SELECT id FROM credentials_entity WHERE name = 'SMTP - TPP' AND type = 'smtp'")
            if not cur.fetchone():
                cur.execute("""
                    INSERT INTO credentials_entity (name, data, type, "createdAt", "updatedAt")
                    VALUES (%s, %s, %s, NOW(), NOW())
                    RETURNING id
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
                smtp_cred_id = cur.fetchone()[0]
                print(f"   ✅ SMTP credential created (ID: {smtp_cred_id})")
            else:
                print("   ✅ SMTP credential exists")

            conn.commit()
            cur.close()
            conn.close()

            print()
            print("✅ Import complete!")
            print()
            print("📋 Next steps:")
            print()
            print("1. Set credential passwords:")
            print()
            print("   # Get your n8n database password")
            print("   DB_PASS='your_n8n_password'")
            print()
            print("   # Get Gmail app password from: https://myaccount.google.com/apppasswords")
            print("   SMTP_PASS='your_gmail_app_password'")
            print()
            print("   # Update credentials")
            print("   sudo -u postgres psql -d n8n <<EOF")
            print("   UPDATE credentials_entity")
            print("   SET data = jsonb_set(data, '{password}', '\"$DB_PASS\"')")
            print("   WHERE name = 'PostgreSQL - Main DB';")
            print()
            print("   UPDATE credentials_entity")
            print("   SET data = jsonb_set(data, '{password}', '\"$SMTP_PASS\"')")
            print("   WHERE name = 'SMTP - TPP';")
            print("   EOF")
            print()
            print("2. Restart n8n:")
            print("   sudo systemctl restart n8n")
            print()
            print("3. Run tests:")
            print("   node /home/avi/projects/astro-site/scripts/test-seo-workflow.cjs")
            print()

            return 0

        except ImportError:
            print("   ⚠️  psycopg2 not available, using alternative method")
            raise

    except Exception as e:
        print(f"   ❌ Error: {e}")
        print()
        print("Manual import required. Use n8n UI to import:")
        print(f"   {WORKFLOW_FILE}")
        return 1

    finally:
        if os.path.exists(temp_file):
            os.unlink(temp_file)

if __name__ == "__main__":
    sys.exit(main())
