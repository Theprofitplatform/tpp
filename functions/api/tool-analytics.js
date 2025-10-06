/**
 * Cloudflare Pages Function: POST /api/tool-analytics
 * Tracks tool usage and sends Discord notifications
 */

import { sendDiscordNotification, createNotificationPayload } from '../utils/discord-notify.js';

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
    const { toolName, userInput } = await request.json();

    if (!toolName) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Tool name is required'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Discord webhook URL from environment
    const webhookUrl = env.DISCORD_WEBHOOK_URL;

    // Send notification if webhook is configured
    if (webhookUrl) {
      const payload = createNotificationPayload(toolName, userInput, request);
      console.log('Sending Discord notification for:', toolName);
      console.log('Webhook URL exists:', !!webhookUrl);

      // Send notification and await to ensure it completes
      try {
        await sendDiscordNotification(webhookUrl, payload);
        console.log('Discord notification sent successfully');
      } catch (err) {
        console.error('Failed to send Discord notification:', err);
      }
    } else {
      console.log('No webhook URL configured');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Analytics tracked'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Tool analytics error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to track analytics'
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
