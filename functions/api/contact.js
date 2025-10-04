// Contact form handler for Cloudflare Pages Functions
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { name, email, phone, company, service, budget, message, consent, _gotcha, utm_source, utm_medium, utm_campaign, utm_term, utm_content, referrer } = body;

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

    // Calculate lead score
    function calculateLeadScore(data) {
      let score = 0;
      let scoreReasons = [];

      // Budget scoring (highest weight)
      if (data.budget === '$10000+') {
        score += 50;
        scoreReasons.push('Premium budget ($10k+)');
      } else if (data.budget === '$5000-$10000') {
        score += 35;
        scoreReasons.push('High budget ($5k-$10k)');
      } else if (data.budget === '$2000-$5000') {
        score += 20;
        scoreReasons.push('Mid budget ($2k-$5k)');
      }

      // Service scoring
      if (data.service === 'Digital Marketing') {
        score += 20;
        scoreReasons.push('Full-service interest');
      } else if (data.service === 'Google Ads') {
        score += 15;
        scoreReasons.push('High-value service (Google Ads)');
      } else if (data.service === 'SEO') {
        score += 15;
        scoreReasons.push('Long-term service (SEO)');
      }

      // Company provided (indicates serious business)
      if (data.company) {
        score += 10;
        scoreReasons.push('Company identified');
      }

      // Phone provided (higher intent)
      if (data.phone) {
        score += 10;
        scoreReasons.push('Phone provided');
      }

      // Message length (detailed inquiry = higher intent)
      if (data.message && data.message.length > 100) {
        score += 5;
        scoreReasons.push('Detailed message');
      }

      return { score, scoreReasons };
    }

    const { score, scoreReasons } = calculateLeadScore(body);
    const priority = score >= 50 ? '🔥 HIGH PRIORITY' : score >= 30 ? '⭐ MEDIUM PRIORITY' : '📋 STANDARD';

    // Prepare UTM tracking info
    const utmInfo = (utm_source || utm_medium || utm_campaign || utm_term || utm_content || referrer) ? `
📊 Marketing Attribution:
Source: ${utm_source || 'Direct'}
Medium: ${utm_medium || 'None'}
Campaign: ${utm_campaign || 'None'}
Term: ${utm_term || 'None'}
Content: ${utm_content || 'None'}
Referrer: ${referrer || 'Direct visit'}
` : '';

    // Prepare email content
    const emailContent = `
${priority} - New Contact Form Submission (Lead Score: ${score}/100)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Lead Score Breakdown:
${scoreReasons.map(r => `   ✓ ${r}`).join('\n')}

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
${utmInfo}
🔒 Consent: ${consent ? 'Yes' : 'No'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Submitted: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}
IP: ${request.headers.get('CF-Connecting-IP')}
User Agent: ${request.headers.get('User-Agent')}
    `.trim();

    // Send email to business using MailChannels (Cloudflare Workers Email)
    let emailToBusinessResponse;
    try {
      emailToBusinessResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
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
          subject: `${priority} Lead (Score: ${score}) - ${service} - ${name}`,
          content: [{
            type: 'text/plain',
            value: emailContent
          }, {
            type: 'text/html',
            value: `<pre style="font-family: monospace; font-size: 14px; background: ${score >= 50 ? '#fef3c7' : score >= 30 ? '#dbeafe' : '#f3f4f6'}; padding: 20px; border-radius: 8px;">${emailContent}</pre>`
          }]
        })
      });

      if (!emailToBusinessResponse.ok) {
        const errorText = await emailToBusinessResponse.text();
        console.error('❌ MailChannels error:', errorText);
        // Still continue to send auto-reply
      }
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      // Continue to auto-reply even if business email fails
    }

    // Send auto-reply to customer
    try {
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
    } catch (autoReplyError) {
      console.error('❌ Auto-reply failed:', autoReplyError);
      // Don't fail the whole request if auto-reply fails
    }

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
