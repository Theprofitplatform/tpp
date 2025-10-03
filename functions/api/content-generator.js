/**
 * Cloudflare Pages Function for AI Content Generator
 * Proxies to the VPS backend API
 */

export async function onRequestPost({ request, env }) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contentType, topic, tone, length, targetAudience } = await request.json();

    if (!contentType || !topic || !tone || !length) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Content type, topic, tone, and length are required'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try the VPS backend first
    const backendUrl = 'https://api.theprofitplatform.com.au/api/content-generator';

    try {
      const backendResponse = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType, topic, tone, length, targetAudience }),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });

      if (backendResponse.ok) {
        const data = await backendResponse.json();
        return new Response(
          JSON.stringify(data),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    } catch (backendError) {
      console.error('Backend error:', backendError);
    }

    // If backend fails, return helpful error message
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Content generation service is temporarily unavailable. The backend server may be offline. Please try again later.',
        details: 'Backend API at api.theprofitplatform.com.au is not responding'
      }),
      {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Content generator error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate content'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}
