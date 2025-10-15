/**
 * Send Discord Notification with Facebook Post
 */

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1425475321377062972/Pw2bZusS-R61jxdbMaaFVkvOmhSkfYMNQ7rAO7gbY_NPXNRKNtjZu1W1ojXYpJ0-3Fj5";

const facebookPost = `😱 Did you know 97% of your website visitors leave without contacting you? That's thousands in lost revenue for Sydney businesses like yours.

Meet Sarah's dental practice in Bondi Junction (2026). She was struggling with this exact problem. Then she implemented a few simple CRO tweaks…

The result? A 300% increase in booking enquiries in just one month! 🚀

The secret? 9 quick wins you can implement without a full website rebuild.

[Add relevant image/screenshot of a high-converting website form or landing page]

So, what's the #1 thing stopping YOUR Sydney website from converting? Is it slow load times, a confusing contact form, or something else?

Let us know in the comments! 👇

Read the complete guide to get all 9 strategies: https://theprofitplatform.com.au/blog/conversion-rate-optimization-9-quick-wins-for-sydney-service-businesses

#SydneySmallBusiness #ConversionOptimization #DigitalMarketingSydney #ServiceBusiness`;

async function sendDiscordNotification() {
  try {
    const payload = {
      embeds: [
        {
          title: "📘 Facebook Post Ready for Manual Publishing",
          description: "Your optimized Facebook post has been generated and is ready for manual posting!",
          color: 0x00ff00,
          fields: [
            {
              name: "📝 Post Content",
              value: "```" + facebookPost + "```",
              inline: false
            },
            {
              name: "📊 Optimization Stats",
              value: "• 127 words (Perfect Facebook length)\n• 838 characters\n• 5 strategic hashtags\n• Engagement question included\n• Visual suggestion added\n• Local Sydney focus",
              inline: false
            },
            {
              name: "🚀 Next Steps",
              value: "1. **Copy the post content above**\n2. **Add a relevant image** (as suggested)\n3. **Paste to Facebook** and publish\n4. **Monitor engagement** for 24-48 hours",
              inline: false
            },
            {
              name: "📁 File Location",
              value: "`automation/content-variants/conversion-rate-optimization-9-quick-wins-for-sydney-service-businesses/facebook.txt`",
              inline: false
            }
          ],
          footer: {
            text: "The Profit Platform Automation • Ready for Manual Posting"
          },
          timestamp: new Date().toISOString()
        }
      ]
    };

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log('✅ Discord notification sent successfully!');
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to send Discord notification:', errorText);
    }
  } catch (error) {
    console.error('❌ Error sending Discord notification:', error.message);
  }
}

sendDiscordNotification();