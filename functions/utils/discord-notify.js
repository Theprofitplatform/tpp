/**
 * Discord Notification Utility
 * Sends notifications to Discord webhook when tools are used
 */

/**
 * Send notification to Discord webhook
 * @param {string} webhookUrl - Discord webhook URL
 * @param {Object} data - Notification data
 */
export async function sendDiscordNotification(webhookUrl, data) {
  if (!webhookUrl) {
    console.warn('Discord webhook URL not configured');
    return;
  }

  const {
    toolName,
    userInput,
    timestamp = new Date().toISOString(),
    userAgent = 'Unknown',
    country = 'Unknown',
    city = 'Unknown'
  } = data;

  try {
    const embed = {
      embeds: [{
        title: `🔔 Tool Used: ${toolName}`,
        color: 3447003, // Blue color
        fields: [
          {
            name: '🛠️ Tool',
            value: toolName,
            inline: true
          },
          {
            name: '⏰ Time',
            value: new Date(timestamp).toLocaleString('en-AU', {
              timeZone: 'Australia/Sydney',
              dateStyle: 'medium',
              timeStyle: 'short'
            }),
            inline: true
          },
          {
            name: '🌍 Location',
            value: `${city}, ${country}`,
            inline: true
          }
        ],
        timestamp: timestamp,
        footer: {
          text: 'The Profit Platform Analytics'
        }
      }]
    };

    // Add user input fields if provided
    if (userInput && Object.keys(userInput).length > 0) {
      const inputFields = Object.entries(userInput)
        .filter(([_, value]) => value) // Filter out empty values
        .slice(0, 5) // Limit to 5 fields to avoid Discord limits
        .map(([key, value]) => ({
          name: `📝 ${key}`,
          value: String(value).substring(0, 200), // Limit value length
          inline: false
        }));

      embed.embeds[0].fields.push(...inputFields);
    }

    // Add user agent info
    if (userAgent && userAgent !== 'Unknown') {
      // Parse user agent for device type
      const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);
      const device = isMobile ? '📱 Mobile' : '💻 Desktop';

      embed.embeds[0].fields.push({
        name: '📱 Device',
        value: device,
        inline: true
      });
    }

    console.log('Sending embed to Discord:', JSON.stringify(embed, null, 2));

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(embed),
    });

    console.log('Discord response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord notification failed:', response.status, errorText);
      throw new Error(`Discord API error: ${response.status} ${errorText}`);
    } else {
      console.log('Discord notification sent successfully');
    }
  } catch (error) {
    console.error('Error sending Discord notification:', error);
  }
}

/**
 * Extract user location from Cloudflare request
 */
export function getUserLocation(request) {
  const cf = request.cf || {};
  return {
    country: cf.country || 'Unknown',
    city: cf.city || 'Unknown',
    region: cf.region || 'Unknown',
    timezone: cf.timezone || 'Unknown'
  };
}

/**
 * Create a notification payload from request data
 */
export function createNotificationPayload(toolName, requestData, request) {
  const location = getUserLocation(request);

  return {
    toolName,
    userInput: requestData,
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent') || 'Unknown',
    country: location.country,
    city: location.city,
    region: location.region,
    timezone: location.timezone
  };
}
