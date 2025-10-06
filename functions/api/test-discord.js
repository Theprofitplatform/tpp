/**
 * Test Discord notifications directly
 */
export async function onRequestGet({ env }) {
  const webhookUrl = env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    return new Response(JSON.stringify({ error: 'No webhook configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const testEmbed = {
      embeds: [{
        title: "🧪 TEST: Direct Function Call",
        color: 16711680, // Red
        fields: [
          {
            name: "Status",
            value: "Testing from Cloudflare Function",
            inline: false
          },
          {
            name: "Time",
            value: new Date().toISOString(),
            inline: false
          }
        ],
        footer: {
          text: "Test from test-discord.js"
        }
      }]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testEmbed)
    });

    const responseText = await response.text();

    return new Response(JSON.stringify({
      success: response.ok,
      status: response.status,
      webhookExists: !!webhookUrl,
      webhookLength: webhookUrl.length,
      responseText: responseText
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
