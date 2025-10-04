/**
 * Cloudflare Pages Function: GET /api/n8n/workflows
 * Returns list of available n8n workflows
 */

export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const password = url.searchParams.get('password');

    // Check password if required
    if (env.N8N_PAGE_PASSWORD && password !== env.N8N_PAGE_PASSWORD) {
      return new Response(JSON.stringify({ error: 'Invalid password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Collect workflows from environment variables
    const workflows = [];
    let i = 1;

    while (env[`N8N_WORKFLOW_${i}_NAME`]) {
      workflows.push({
        id: i.toString(),
        name: env[`N8N_WORKFLOW_${i}_NAME`],
        icon: env[`N8N_WORKFLOW_${i}_ICON`] || '🤖'
      });
      i++;
    }

    return new Response(JSON.stringify({
      workflows,
      requiresPassword: !!env.N8N_PAGE_PASSWORD
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('N8N workflows list error:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch workflows' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
