// Get available n8n workflows for Cloudflare Pages Functions
export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const password = url.searchParams.get('password');

    // Optional password protection
    if (env.N8N_PAGE_PASSWORD && password !== env.N8N_PAGE_PASSWORD) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid password'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse workflow configurations from environment
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
      success: true,
      workflows,
      requiresPassword: !!env.N8N_PAGE_PASSWORD
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ n8n workflows list error:', error.message);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to load workflows'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
