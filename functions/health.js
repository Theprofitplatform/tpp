// Health check endpoint for Cloudflare Pages Functions
export async function onRequestGet() {
  return new Response(JSON.stringify({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'TPP Backend API (Cloudflare Pages Functions)',
    platform: 'Cloudflare Workers'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
