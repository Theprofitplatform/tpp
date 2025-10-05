-- Import Tool Improvement Agent Workflow to n8n Database
-- This SQL script directly inserts the workflow into the PostgreSQL database

INSERT INTO workflow_entity (
    id,
    name,
    active,
    nodes,
    connections,
    settings,
    "staticData",
    tags,
    "createdAt",
    "updatedAt",
    "versionId"
) VALUES (
    'tool-improvement-agent-2025',
    'Tool Improvement Agent',
    true,
    '[
        {
            "parameters": {
                "rule": {
                    "interval": [
                        {
                            "field": "minutes",
                            "minutesInterval": 30
                        }
                    ]
                }
            },
            "id": "schedule-trigger",
            "name": "Every 30 Minutes",
            "type": "n8n-nodes-base.scheduleTrigger",
            "typeVersion": 1.1,
            "position": [250, 300]
        },
        {
            "parameters": {
                "functionCode": "// Tool Improvement Agent - Tool Rotation Logic\nconst tools = [\n  ''rank-tracker'',\n  ''revenue-leak-detector'', \n  ''speed-test'',\n  ''website-speed-test'',\n  ''keyword-difficulty-checker'',\n  ''local-rankings-map'',\n  ''seo-audit-tool''\n];\n\nconst currentCycle = $workflow.staticData.cycleCount || 0;\nconst currentToolIndex = currentCycle % tools.length;\nconst currentTool = tools[currentToolIndex];\nconst nextTool = tools[(currentToolIndex + 1) % tools.length];\n\n$workflow.staticData.cycleCount = currentCycle + 1;\n\nreturn {\n  json: {\n    toolSlug: currentTool,\n    toolName: currentTool.split(''-'').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('' ''),\n    nextTool: nextTool.split(''-'').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('' ''),\n    cycleCount: currentCycle + 1,\n    timestamp: new Date().toISOString()\n  }\n};"
            },
            "id": "rotate-tools",
            "name": "Rotate Tools",
            "type": "n8n-nodes-base.code",
            "typeVersion": 2,
            "position": [450, 300]
        },
        {
            "parameters": {
                "filePath": "=/home/avi/projects/astro-site/src/pages/tools/{{ $json.toolSlug }}.astro",
                "options": {}
            },
            "id": "read-tool-file",
            "name": "Read Tool File",
            "type": "n8n-nodes-base.readFile",
            "typeVersion": 1,
            "position": [650, 300],
            "continueOnFail": true
        }
    ]'::jsonb,
    '{
        "Every 30 Minutes": {
            "main": [[{"node": "Rotate Tools", "type": "main", "index": 0}]]
        },
        "Rotate Tools": {
            "main": [[{"node": "Read Tool File", "type": "main", "index": 0}]]
        }
    }'::jsonb,
    '{"executionOrder": "v1"}'::jsonb,
    '{"cycleCount": 0}'::jsonb,
    '[]'::jsonb,
    NOW(),
    NOW(),
    '1'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    active = EXCLUDED.active,
    nodes = EXCLUDED.nodes,
    connections = EXCLUDED.connections,
    settings = EXCLUDED.settings,
    "updatedAt" = NOW();
