/**
 * Cloudflare Pages Function: POST /api/competitor-analysis
 * Proxies competitor analysis requests to backend server
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { yourDomain, competitorDomain } = body;

    if (!yourDomain || !competitorDomain) {
      return new Response(JSON.stringify({
        error: 'Both yourDomain and competitorDomain are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Use environment variable for backend URL
    const backendUrl = env.BACKEND_API_URL;

    if (!backendUrl) {
      return new Response(JSON.stringify({
        error: 'Backend API URL not configured. Please set BACKEND_API_URL environment variable.'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('Forwarding to backend:', backendUrl);

    // Forward request to backend
    const backendResponse = await fetch(`${backendUrl}/api/competitor-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CloudflareWorker/1.0',
      },
      body: JSON.stringify({ yourDomain, competitorDomain }),
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend error:', backendResponse.status, errorText);
      throw new Error(`Backend returned ${backendResponse.status}: ${errorText}`);
    }

    const data = await backendResponse.json();

    return new Response(JSON.stringify(data), {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error('Competitor analysis proxy error:', error);

    return new Response(JSON.stringify({
      error: 'Failed to analyze competitor. Please try again later.',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle OPTIONS for CORS
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
