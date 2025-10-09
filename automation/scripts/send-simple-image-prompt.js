/**
 * Send Simple Discord Notification with Image Generation Prompt
 */

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1425475321377062972/Pw2bZusS-R61jxdbMaaFVkvOmhSkfYMNQ7rAO7gbY_NPXNRKNtjZu1W1ojXYpJ0-3Fj5";

const messageContent = `🎨 **IMAGE GENERATION PROMPT FOR GEMINI**

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

**💡 Instructions:**
1. **Copy the prompt above**
2. **Paste into Gemini**
3. **Generate the image**
4. **Download and use for Facebook post**

**🎯 Image Purpose:** This image will show a high-converting website form to illustrate the CRO strategies mentioned in your post about increasing booking enquiries by 300%.

**Alternative Prompt (if needed):**
\`\`\`
Create a professional screenshot of a high-converting landing page for a Sydney service business showing clean contact form, strong call-to-action button, trust badges, and mobile-responsive design.
\`\`\``;

async function sendImagePrompt() {
  try {
    const payload = {
      content: messageContent
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