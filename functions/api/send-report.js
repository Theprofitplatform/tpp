/**
 * Cloudflare Pages Function to send speed test email reports
 */

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
    const { email, results } = await request.json();

    if (!email || !results) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email and results are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate HTML email content
    const emailHtml = generateEmailReport(results);

    // In production, integrate with email service (SendGrid, Mailgun, etc.)
    // For now, log the request and return success
    console.log('Email report requested for:', email);
    console.log('Results:', results.url, results.scores.performance);

    // TODO: Integrate with actual email service
    // Example with SendGrid:
    // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     personalizations: [{ to: [{ email }] }],
    //     from: { email: 'reports@theprofitplatform.com.au', name: 'The Profit Platform' },
    //     subject: `Speed Test Report - ${results.url}`,
    //     content: [{ type: 'text/html', value: emailHtml }]
    //   })
    // });

    // Store lead in database/CRM
    await storeLeadData(email, results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Report sent successfully'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Send report error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to send report'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

function generateEmailReport(results) {
  const { url, scores, coreWebVitals, deviceComparison, benchmarks } = results;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Speed Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; }
    .score-card { background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
    .score-value { font-size: 48px; font-weight: 900; color: #667eea; }
    .metric { display: inline-block; margin: 10px; padding: 15px; background: white; border-radius: 8px; }
    .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #64748b; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Website Speed Test Report</h1>
    <p>${url}</p>
  </div>

  <div class="score-card">
    <h2>Performance Score</h2>
    <div class="score-value">${scores.performance}/100</div>
    <p>Your website scored ${scores.performance} out of 100 for performance.</p>
  </div>

  ${coreWebVitals ? `
  <div class="score-card">
    <h2>Core Web Vitals</h2>
    <div class="metric">
      <strong>LCP:</strong> ${coreWebVitals.lcp.displayValue}
      <br><small>${coreWebVitals.lcp.rating}</small>
    </div>
    <div class="metric">
      <strong>FID:</strong> ${coreWebVitals.fid.displayValue}
      <br><small>${coreWebVitals.fid.rating}</small>
    </div>
    <div class="metric">
      <strong>CLS:</strong> ${coreWebVitals.cls.displayValue}
      <br><small>${coreWebVitals.cls.rating}</small>
    </div>
  </div>
  ` : ''}

  ${deviceComparison ? `
  <div class="score-card">
    <h2>Device Performance</h2>
    <p>Mobile: <strong>${deviceComparison.mobile}</strong> | Desktop: <strong>${deviceComparison.desktop}</strong></p>
    <p>${deviceComparison.recommendation}</p>
  </div>
  ` : ''}

  ${benchmarks ? `
  <div class="score-card">
    <h2>Industry Comparison</h2>
    <p>Your Score: <strong>${benchmarks.yourScore}</strong></p>
    <p>Industry Average: ${benchmarks.industryAverage}</p>
    <p>Top Performers: ${benchmarks.topPerformers}</p>
    <p><strong>${benchmarks.percentile}</strong></p>
  </div>
  ` : ''}

  <div style="text-align: center; margin: 40px 0;">
    <a href="https://theprofitplatform.com.au/contact?service=speed-optimization" class="cta-button">
      Get Professional Speed Optimization
    </a>
  </div>

  <div class="footer">
    <p><strong>The Profit Platform</strong></p>
    <p>Digital Marketing & Web Performance Specialists</p>
    <p>Phone: <a href="tel:+61487286451">0487 286 451</a> | Email: <a href="mailto:avi@theprofitplatform.com.au">avi@theprofitplatform.com.au</a></p>
    <p><a href="https://theprofitplatform.com.au">Visit Our Website</a></p>
  </div>
</body>
</html>
  `;
}

async function storeLeadData(email, results) {
  // TODO: Integrate with CRM or database
  // For now, just log the lead
  console.log('New lead captured:', {
    email,
    url: results.url,
    score: results.scores.performance,
    timestamp: new Date().toISOString()
  });

  // In production, store in KV, D1, or external CRM:
  // await env.LEADS_KV.put(
  //   `lead-${Date.now()}`,
  //   JSON.stringify({ email, results, timestamp: Date.now() })
  // );
}
