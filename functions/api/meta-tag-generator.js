/**
 * Cloudflare Pages Function: POST /api/meta-tag-generator
 * Proxies meta tag generation requests to VPS backend API
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
    const { topic, businessName, location, pageType, includeYear, includeCTA, canonicalUrl, customTitle, customDescription } = await request.json();

    if (!topic && !customTitle) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Topic or custom title is required'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use BACKEND_API_URL from environment (Cloudflare tunnel or VPS)
    const backendUrl = env.BACKEND_API_URL || 'https://api.theprofitplatform.com.au';

    if (!backendUrl) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Backend API URL not configured. Please set BACKEND_API_URL environment variable.'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    try {
      const backendResponse = await fetch(`${backendUrl}/api/meta-tag-generator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          businessName,
          location,
          pageType,
          includeYear,
          includeCTA,
          canonicalUrl,
          customTitle,
          customDescription
        }),
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
        error: 'Meta tag generation service is temporarily unavailable. The backend server may be offline. Please try again later.',
        details: `Backend API at ${backendUrl} is not responding`
      }),
      {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Meta tag generator error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate meta tags'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
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
