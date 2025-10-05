// SERP rank checking endpoint for Cloudflare Pages Functions
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { keyword, location = 'Australia', domain } = body;

    if (!keyword || !domain) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Keyword and domain are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!env.SERP_API_KEY) {
      console.error('❌ SERP_API_KEY not configured');
      return new Response(JSON.stringify({
        success: false,
        error: 'SERP API not configured'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Call SerpAPI
    const serpUrl = new URL('https://serpapi.com/search');
    serpUrl.searchParams.append('q', keyword);
    serpUrl.searchParams.append('location', location);
    serpUrl.searchParams.append('api_key', env.SERP_API_KEY);
    serpUrl.searchParams.append('num', '100');
    serpUrl.searchParams.append('engine', 'google');

    const response = await fetch(serpUrl.toString(), {
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      if (response.status === 401) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid SERP API key'
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      if (response.status === 429) {
        return new Response(JSON.stringify({
          success: false,
          error: 'SERP API rate limit exceeded. Please try again later.'
        }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw new Error(`SerpAPI error: ${response.status}`);
    }

    const data = await response.json();
    const organicResults = data.organic_results || [];

    // Find domain rank
    let rank = null;
    let foundResult = null;

    for (let i = 0; i < organicResults.length; i++) {
      const result = organicResults[i];
      try {
        const resultDomain = new URL(result.link).hostname.replace('www.', '').toLowerCase();
        const searchDomain = domain.replace('www.', '').replace('https://', '').replace('http://', '').toLowerCase().trim();

        // Exact domain match only to avoid false positives
        if (resultDomain === searchDomain) {
          rank = result.position;
          foundResult = {
            position: result.position,
            title: result.title,
            link: result.link,
            snippet: result.snippet
          };
          break;
        }
      } catch (e) {
        continue;
      }
    }

    console.log('✅ SERP check:', { keyword, domain, rank, location });

    return new Response(JSON.stringify({
      success: true,
      data: {
        keyword,
        domain,
        location,
        rank,
        found: rank !== null,
        result: foundResult,
        totalResults: organicResults.length,
        timestamp: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ SERP API error:', error.message);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to check ranking. Please try again.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
