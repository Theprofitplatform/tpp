/**
 * Cloudflare Pages Function: POST /api/n8n/trigger
 * Triggers an n8n workflow via webhook
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { workflowId, password } = body;

    if (!workflowId) {
      return new Response(JSON.stringify({ error: 'Workflow ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check password if required
    if (env.N8N_PAGE_PASSWORD && password !== env.N8N_PAGE_PASSWORD) {
      return new Response(JSON.stringify({ error: 'Invalid password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get webhook URL from environment
    const webhookUrl = env[`N8N_WORKFLOW_${workflowId}_WEBHOOK`];
    const workflowName = env[`N8N_WORKFLOW_${workflowId}_NAME`] || workflowId;

    if (!webhookUrl) {
      return new Response(JSON.stringify({ error: 'Workflow not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Trigger n8n webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'manual-trigger',
        timestamp: new Date().toISOString(),
        workflowId,
        workflowName
      })
    });

    if (!response.ok) {
      throw new Error(`N8N webhook returned status ${response.status}`);
    }

    console.log('✅ n8n workflow triggered:', { workflowId, workflowName, status: response.status });

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully triggered: ${workflowName}`,
      workflowId,
      workflowName
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ n8n trigger error:', error.message);
    return new Response(JSON.stringify({
      error: 'Failed to trigger workflow. Please check n8n configuration.',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
