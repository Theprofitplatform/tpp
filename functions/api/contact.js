// Contact form handler for Cloudflare Pages Functions
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { name, email, phone, company, service, budget, message, consent, _gotcha } = body;

    // Spam detection
    if (_gotcha || (message && message.includes('http') && message.length > 1000)) {
      console.warn('🚨 Spam submission blocked:', email);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid submission'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validation
    const errors = [];
    if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email is required');
    if (!service) errors.push('Service selection is required');
    if (!message || message.trim().length < 10) errors.push('Message must be at least 10 characters');

    if (errors.length > 0) {
      return new Response(JSON.stringify({ success: false, errors }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Prepare email content
    const emailContent = `
New Contact Form Submission
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Contact Details:
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Company: ${company || 'Not provided'}

💼 Service Information:
Service: ${service}
Budget: ${budget || 'Not specified'}

📝 Message:
${message}

🔒 Consent: ${consent ? 'Yes' : 'No'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Submitted: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}
IP: ${request.headers.get('CF-Connecting-IP')}
    `.trim();

    // Send email to business using MailChannels (Cloudflare Workers Email)
    const emailToBusinessResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: env.CONTACT_EMAIL || 'avi@theprofitplatform.com.au' }],
          dkim_domain: 'theprofitplatform.com.au',
          dkim_selector: 'mailchannels'
        }],
        from: {
          email: env.SMTP_FROM || 'noreply@theprofitplatform.com.au',
          name: 'The Profit Platform'
        },
        reply_to: { email },
        subject: `🎯 New Lead: ${service} - ${name}`,
        content: [{
          type: 'text/plain',
          value: emailContent
        }, {
          type: 'text/html',
          value: `<pre style="font-family: monospace; font-size: 14px;">${emailContent}</pre>`
        }]
      })
    });

    // Send auto-reply to customer
    await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email }],
          dkim_domain: 'theprofitplatform.com.au',
          dkim_selector: 'mailchannels'
        }],
        from: {
          email: env.SMTP_FROM || 'noreply@theprofitplatform.com.au',
          name: 'The Profit Platform'
        },
        subject: 'Thank you for contacting The Profit Platform',
        content: [{
          type: 'text/html',
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #3B82F6;">Thank you for your inquiry, ${name}!</h2>
              <p>We've received your message about <strong>${service}</strong> and will get back to you within 24 hours.</p>
              <p>In the meantime, feel free to:</p>
              <ul>
                <li>Call us at <a href="tel:+61487286451">0487 286 451</a></li>
                <li>Check out our <a href="https://theprofitplatform.com.au/portfolio">portfolio</a></li>
                <li>Read our <a href="https://theprofitplatform.com.au/blog">latest blog posts</a></li>
              </ul>
              <p>Best regards,<br>The Profit Platform Team</p>
              <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="font-size: 12px; color: #6b7280;">
                This is an automated response. Please do not reply to this email.
              </p>
            </div>
          `
        }]
      })
    });

    console.log('✅ Contact form submission:', { name, email, service, timestamp: new Date().toISOString() });

    return new Response(JSON.stringify({
      success: true,
      message: 'Thank you! Your message has been sent successfully.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to send message. Please try again or email us directly.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
