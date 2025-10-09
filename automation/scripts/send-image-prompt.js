/**
 * Send Discord Notification with Image Generation Prompt
 */

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1425475321377062972/Pw2bZusS-R61jxdbMaaFVkvOmhSkfYMNQ7rAO7gbY_NPXNRKNtjZu1W1ojXYpJ0-3Fj5";

const imagePrompt = `**🎨 IMAGE GENERATION PROMPT FOR GEMINI**

**Copy and paste this prompt into Gemini to create the perfect Facebook post image:**

\`\`\`
Create a professional, high-converting website form or landing page screenshot for a Sydney dental practice.

**Style Requirements:**
- Clean, modern dental clinic website design
- Professional blue and white color scheme
- Sydney skyline background visible through office window
- High-converting contact form with fields: Name, Email, Phone, Preferred Date
- Clear call-to-action button: "BOOK YOUR APPOINTMENT NOW"
- Trust elements: 5-star reviews, "300+ Happy Patients", "Same-Day Appointments Available"
- Mobile-responsive design
- Professional dental imagery (subtle)

**Technical Details:**
- Aspect ratio: 16:9 (landscape)
- High resolution, professional quality
- Clean, uncluttered interface
- Modern web design aesthetics
- Australian/Sydney business context

**Branding:**
- Professional dental clinic branding
- Clean, trustworthy appearance
- Sydney local business focus
- Conversion-focused design
\`\`\`

**Alternative Prompts (if needed):**

\`\`\`
Create a professional screenshot of a high-converting landing page for a Sydney service business showing:
- Clean contact form with multiple fields
- Strong call-to-action button
- Trust badges and testimonials
- Mobile-responsive design
- Professional business aesthetics
\`\`\`

\`\`\`
Generate a realistic website screenshot showing a conversion-optimized contact form for a Sydney dental practice with:
- Professional design with blue/white color scheme
- Clear form fields and strong CTA
- Trust elements and social proof
- Modern, clean interface
\`\`\`

**💡 Tips for Best Results:**
- Use the first prompt for most accurate results
- If it doesn't work well, try the alternative prompts
- Look for clean, professional designs
- Ensure the image looks like a real website screenshot
- Focus on conversion elements (forms, CTAs, trust badges)`;

async function sendImagePrompt() {
  try {
    const payload = {
      embeds: [
        {
          title: "🎨 Image Generation Prompt for Facebook Post",
          description: "Copy and paste this prompt into Gemini to create the perfect image for your Facebook post!",
          color: 0x0099ff,
          fields: [
            {
              name: "📋 Instructions",
              value: "1. **Copy the prompt below**\n2. **Paste into Gemini**\n3. **Generate the image**\n4. **Download and use for Facebook post**",
              inline: false
            },
            {
              name: "🎯 Image Purpose",
              value: "This image will show a **high-converting website form** to illustrate the CRO strategies mentioned in your post about increasing booking enquiries by 300%.",
              inline: false
            },
            {
              name: "📝 Copy-Paste Prompt",
              value: "```" + imagePrompt + "```",
              inline: false
            }
          ],
          footer: {
            text: "The Profit Platform Automation • Image Generation Assistant"
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
      console.log('✅ Image generation prompt sent to Discord!');
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to send image prompt:', errorText);
    }
  } catch (error) {
    console.error('❌ Error sending image prompt:', error.message);
  }
}

sendImagePrompt();