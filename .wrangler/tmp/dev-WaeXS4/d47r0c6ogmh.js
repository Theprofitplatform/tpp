var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/pages-bbtDkE/functionsWorker-0.4859135826288201.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { workflowId, password } = body;
    if (!workflowId) {
      return new Response(JSON.stringify({ error: "Workflow ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (env.N8N_PAGE_PASSWORD && password !== env.N8N_PAGE_PASSWORD) {
      return new Response(JSON.stringify({ error: "Invalid password" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const webhookUrl = env[`N8N_WORKFLOW_${workflowId}_WEBHOOK`];
    const workflowName = env[`N8N_WORKFLOW_${workflowId}_NAME`] || workflowId;
    if (!webhookUrl) {
      return new Response(JSON.stringify({ error: "Workflow not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        source: "manual-trigger",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        workflowId,
        workflowName
      })
    });
    if (!response.ok) {
      throw new Error(`N8N webhook returned status ${response.status}`);
    }
    console.log("\u2705 n8n workflow triggered:", { workflowId, workflowName, status: response.status });
    return new Response(JSON.stringify({
      success: true,
      message: `Successfully triggered: ${workflowName}`,
      workflowId,
      workflowName
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("\u274C n8n trigger error:", error.message);
    return new Response(JSON.stringify({
      error: "Failed to trigger workflow. Please check n8n configuration.",
      details: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost, "onRequestPost");
__name2(onRequestPost, "onRequestPost");
async function onRequestGet(context) {
  const { request, env } = context;
  try {
    const url = new URL(request.url);
    const password = url.searchParams.get("password");
    if (env.N8N_PAGE_PASSWORD && password !== env.N8N_PAGE_PASSWORD) {
      return new Response(JSON.stringify({ error: "Invalid password" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const workflows = [];
    let i = 1;
    while (env[`N8N_WORKFLOW_${i}_NAME`]) {
      workflows.push({
        id: i.toString(),
        name: env[`N8N_WORKFLOW_${i}_NAME`],
        icon: env[`N8N_WORKFLOW_${i}_ICON`] || "\u{1F916}"
      });
      i++;
    }
    return new Response(JSON.stringify({
      workflows,
      requiresPassword: !!env.N8N_PAGE_PASSWORD
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("N8N workflows list error:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch workflows" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestGet, "onRequestGet");
__name2(onRequestGet, "onRequestGet");
async function onRequestPost2(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { keyword, location = "Australia", domain } = body;
    if (!keyword || !domain) {
      return new Response(JSON.stringify({
        success: false,
        error: "Keyword and domain are required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!env.SERP_API_KEY) {
      console.error("\u274C SERP_API_KEY not configured");
      return new Response(JSON.stringify({
        success: false,
        error: "SERP API not configured"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const serpUrl = new URL("https://serpapi.com/search");
    serpUrl.searchParams.append("q", keyword);
    serpUrl.searchParams.append("location", location);
    serpUrl.searchParams.append("api_key", env.SERP_API_KEY);
    serpUrl.searchParams.append("num", "100");
    serpUrl.searchParams.append("engine", "google");
    const response = await fetch(serpUrl.toString(), {
      signal: AbortSignal.timeout(1e4)
    });
    if (!response.ok) {
      if (response.status === 401) {
        return new Response(JSON.stringify({
          success: false,
          error: "Invalid SERP API key"
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (response.status === 429) {
        return new Response(JSON.stringify({
          success: false,
          error: "SERP API rate limit exceeded. Please try again later."
        }), {
          status: 429,
          headers: { "Content-Type": "application/json" }
        });
      }
      throw new Error(`SerpAPI error: ${response.status}`);
    }
    const data = await response.json();
    const organicResults = data.organic_results || [];
    let rank = null;
    let foundResult = null;
    for (let i = 0; i < organicResults.length; i++) {
      const result = organicResults[i];
      try {
        const resultDomain = new URL(result.link).hostname.replace("www.", "").toLowerCase();
        const searchDomain = domain.replace("www.", "").replace("https://", "").replace("http://", "").toLowerCase().trim();
        if (resultDomain === searchDomain) {
          rank = result.position;
          foundResult = {
            position: result.position,
            title: result.title,
            link: result.link,
            snippet: result.snippet
          };
          break;
        }
      } catch (e) {
        continue;
      }
    }
    console.log("\u2705 SERP check:", { keyword, domain, rank, location });
    return new Response(JSON.stringify({
      success: true,
      data: {
        keyword,
        domain,
        location,
        rank,
        found: rank !== null,
        result: foundResult,
        totalResults: organicResults.length,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("\u274C SERP API error:", error.message);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to check ranking. Please try again."
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost2, "onRequestPost2");
__name2(onRequestPost2, "onRequestPost");
async function onRequestPost3(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { yourDomain, competitorDomain } = body;
    if (!yourDomain || !competitorDomain) {
      return new Response(JSON.stringify({
        error: "Both yourDomain and competitorDomain are required"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const backendUrl = env.BACKEND_API_URL;
    if (!backendUrl) {
      return new Response(JSON.stringify({
        error: "Backend API URL not configured. Please set BACKEND_API_URL environment variable."
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("Forwarding to backend:", backendUrl);
    const backendResponse = await fetch(`${backendUrl}/api/competitor-analysis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "CloudflareWorker/1.0"
      },
      body: JSON.stringify({ yourDomain, competitorDomain })
    });
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error("Backend error:", backendResponse.status, errorText);
      throw new Error(`Backend returned ${backendResponse.status}: ${errorText}`);
    }
    const data = await backendResponse.json();
    return new Response(JSON.stringify(data), {
      status: backendResponse.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    console.error("Competitor analysis proxy error:", error);
    return new Response(JSON.stringify({
      error: "Failed to analyze competitor. Please try again later.",
      details: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost3, "onRequestPost3");
__name2(onRequestPost3, "onRequestPost");
async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
__name(onRequestOptions, "onRequestOptions");
__name2(onRequestOptions, "onRequestOptions");
async function onRequestPost4(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { name, email, phone, company, service, budget, message, consent, _gotcha } = body;
    if (_gotcha || message && message.includes("http") && message.length > 1e3) {
      console.warn("\u{1F6A8} Spam submission blocked:", email);
      return new Response(JSON.stringify({
        success: false,
        error: "Invalid submission"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const errors = [];
    if (!name || name.trim().length < 2) errors.push("Name must be at least 2 characters");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Valid email is required");
    if (!service) errors.push("Service selection is required");
    if (!message || message.trim().length < 10) errors.push("Message must be at least 10 characters");
    if (errors.length > 0) {
      return new Response(JSON.stringify({ success: false, errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const emailContent = `
New Contact Form Submission
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

\u{1F4CB} Contact Details:
Name: ${name}
Email: ${email}
Phone: ${phone || "Not provided"}
Company: ${company || "Not provided"}

\u{1F4BC} Service Information:
Service: ${service}
Budget: ${budget || "Not specified"}

\u{1F4DD} Message:
${message}

\u{1F512} Consent: ${consent ? "Yes" : "No"}

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
Submitted: ${(/* @__PURE__ */ new Date()).toLocaleString("en-AU", { timeZone: "Australia/Sydney" })}
IP: ${request.headers.get("CF-Connecting-IP")}
    `.trim();
    const emailToBusinessResponse = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: env.CONTACT_EMAIL || "avi@theprofitplatform.com.au" }],
          dkim_domain: "theprofitplatform.com.au",
          dkim_selector: "mailchannels"
        }],
        from: {
          email: env.SMTP_FROM || "noreply@theprofitplatform.com.au",
          name: "The Profit Platform"
        },
        reply_to: { email },
        subject: `\u{1F3AF} New Lead: ${service} - ${name}`,
        content: [{
          type: "text/plain",
          value: emailContent
        }, {
          type: "text/html",
          value: `<pre style="font-family: monospace; font-size: 14px;">${emailContent}</pre>`
        }]
      })
    });
    await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email }],
          dkim_domain: "theprofitplatform.com.au",
          dkim_selector: "mailchannels"
        }],
        from: {
          email: env.SMTP_FROM || "noreply@theprofitplatform.com.au",
          name: "The Profit Platform"
        },
        subject: "Thank you for contacting The Profit Platform",
        content: [{
          type: "text/html",
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
    console.log("\u2705 Contact form submission:", { name, email, service, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
    return new Response(JSON.stringify({
      success: true,
      message: "Thank you! Your message has been sent successfully."
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("\u274C Contact form error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Failed to send message. Please try again or email us directly."
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost4, "onRequestPost4");
__name2(onRequestPost4, "onRequestPost");
async function onRequestPost5({ request, env }) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { contentType, topic, tone, length, targetAudience } = await request.json();
    if (!contentType || !topic || !tone || !length) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Content type, topic, tone, and length are required"
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const backendUrl = "https://api.theprofitplatform.com.au/api/content-generator";
    try {
      const backendResponse = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType, topic, tone, length, targetAudience }),
        signal: AbortSignal.timeout(3e4)
        // 30 second timeout
      });
      if (backendResponse.ok) {
        const data = await backendResponse.json();
        return new Response(
          JSON.stringify(data),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
    } catch (backendError) {
      console.error("Backend error:", backendError);
    }
    return new Response(
      JSON.stringify({
        success: false,
        error: "Content generation service is temporarily unavailable. The backend server may be offline. Please try again later.",
        details: "Backend API at api.theprofitplatform.com.au is not responding"
      }),
      {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Content generator error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to generate content"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
}
__name(onRequestPost5, "onRequestPost5");
__name2(onRequestPost5, "onRequestPost");
async function onRequestPost6({ request }) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { url } = await request.json();
    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    try {
      new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid URL format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const apiKey = "AIzaSyA308cZv0hNvZdC8VAM15v8CE12HEsHzCQ";
    const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&category=accessibility&category=best-practices&category=seo&strategy=mobile&key=${apiKey}`;
    const psiResponse = await fetch(psiUrl);
    if (!psiResponse.ok) {
      const errorData = await psiResponse.json().catch(() => ({ error: { message: "Unknown error" } }));
      throw new Error(errorData.error?.message || "PageSpeed Insights API failed");
    }
    const psiData = await psiResponse.json();
    const lighthouse = psiData.lighthouseResult;
    const seoScore = Math.round(lighthouse.categories.seo.score * 100);
    const performanceScore = Math.round(lighthouse.categories.performance.score * 100);
    const accessibilityScore = Math.round(lighthouse.categories.accessibility.score * 100);
    const bestPracticesScore = Math.round(lighthouse.categories["best-practices"].score * 100);
    const overallScore = Math.round(
      seoScore * 0.4 + performanceScore * 0.3 + accessibilityScore * 0.2 + bestPracticesScore * 0.1
    );
    const categoryScores = {
      "SEO": seoScore,
      "Performance": performanceScore,
      "Accessibility": accessibilityScore,
      "Best Practices": bestPracticesScore
    };
    const metaAudits = {
      "document-title": lighthouse.audits["document-title"],
      "meta-description": lighthouse.audits["meta-description"],
      "viewport": lighthouse.audits["viewport"],
      "canonical": lighthouse.audits["canonical"]
    };
    const meta = {
      title: {
        value: metaAudits["document-title"]?.score === 1 ? "Present" : "Missing",
        status: metaAudits["document-title"]?.score === 1 ? "pass" : "fail",
        message: metaAudits["document-title"]?.title || "",
        severity: metaAudits["document-title"]?.score === 1 ? "info" : "critical"
      },
      description: {
        value: metaAudits["meta-description"]?.score === 1 ? "Present" : "Missing",
        status: metaAudits["meta-description"]?.score === 1 ? "pass" : "fail",
        message: metaAudits["meta-description"]?.title || "",
        severity: metaAudits["meta-description"]?.score === 1 ? "info" : "critical"
      },
      og: {
        count: "N/A",
        status: "warning",
        message: "Open Graph tags not checked by Lighthouse",
        severity: "warning"
      },
      canonical: {
        value: metaAudits["canonical"]?.score === 1 ? "Present" : "Missing",
        status: metaAudits["canonical"]?.score === 1 ? "pass" : "warning",
        message: metaAudits["canonical"]?.title || "",
        severity: metaAudits["canonical"]?.score === 1 ? "info" : "warning"
      }
    };
    const metrics = {
      fcp: lighthouse.audits["first-contentful-paint"],
      lcp: lighthouse.audits["largest-contentful-paint"],
      cls: lighthouse.audits["cumulative-layout-shift"]
    };
    const performance = {
      loadTime: (metrics.fcp?.numericValue / 1e3).toFixed(2),
      loadTimeStatus: metrics.fcp?.score > 0.8 ? "pass" : metrics.fcp?.score > 0.5 ? "warning" : "fail",
      loadTimeMessage: metrics.fcp?.title || "",
      imagesOptimized: Math.round((lighthouse.audits["uses-optimized-images"]?.score || 0) * 100),
      imagesStatus: lighthouse.audits["uses-optimized-images"]?.score > 0.8 ? "pass" : "warning",
      imagesMessage: lighthouse.audits["uses-optimized-images"]?.title || "",
      minified: lighthouse.audits["unminified-css"]?.score === 1 && lighthouse.audits["unminified-javascript"]?.score === 1 ? "Yes" : "No",
      minifiedStatus: lighthouse.audits["unminified-css"]?.score === 1 && lighthouse.audits["unminified-javascript"]?.score === 1 ? "pass" : "warning",
      minifiedMessage: "CSS and JavaScript minification"
    };
    const content = {
      h1: {
        value: lighthouse.audits["heading-order"]?.score === 1 ? "Present" : "Missing/Invalid",
        status: lighthouse.audits["heading-order"]?.score === 1 ? "pass" : "warning",
        message: lighthouse.audits["heading-order"]?.title || "",
        severity: lighthouse.audits["heading-order"]?.score === 1 ? "info" : "warning"
      },
      headings: {
        value: lighthouse.audits["heading-order"]?.score === 1 ? "Valid" : "Invalid",
        status: lighthouse.audits["heading-order"]?.score === 1 ? "pass" : "warning",
        message: lighthouse.audits["heading-order"]?.title || ""
      },
      wordCount: {
        value: "N/A",
        status: "warning",
        message: "Word count not available from Lighthouse"
      },
      internalLinks: {
        value: lighthouse.audits["crawlable-anchors"]?.score === 1 ? "Good" : "Issues found",
        status: lighthouse.audits["crawlable-anchors"]?.score === 1 ? "pass" : "warning",
        message: lighthouse.audits["crawlable-anchors"]?.title || ""
      }
    };
    const technical = {
      https: {
        value: lighthouse.audits["is-on-https"]?.score === 1 ? "Yes" : "No",
        status: lighthouse.audits["is-on-https"]?.score === 1 ? "pass" : "fail",
        message: lighthouse.audits["is-on-https"]?.title || "",
        severity: lighthouse.audits["is-on-https"]?.score === 1 ? "info" : "critical"
      },
      robots: {
        value: lighthouse.audits["robots-txt"]?.score === 1 ? "Valid" : "Missing/Invalid",
        status: lighthouse.audits["robots-txt"]?.score === 1 ? "pass" : "warning",
        message: lighthouse.audits["robots-txt"]?.title || "",
        severity: lighthouse.audits["robots-txt"]?.score === 1 ? "info" : "warning"
      },
      sitemap: {
        value: "N/A",
        status: "warning",
        message: "Sitemap not checked by Lighthouse",
        severity: "warning"
      },
      structuredData: {
        value: lighthouse.audits["structured-data"]?.score === 1 ? "Valid" : "Missing/Invalid",
        status: lighthouse.audits["structured-data"]?.score === 1 ? "pass" : "warning",
        message: lighthouse.audits["structured-data"]?.title || "Structured data not found",
        severity: lighthouse.audits["structured-data"]?.score === 1 ? "info" : "warning"
      }
    };
    const mobile = {
      viewport: {
        value: metaAudits["viewport"]?.score === 1 ? "Present" : "Missing",
        status: metaAudits["viewport"]?.score === 1 ? "pass" : "fail",
        message: metaAudits["viewport"]?.title || "",
        severity: metaAudits["viewport"]?.score === 1 ? "info" : "critical"
      },
      friendly: {
        value: lighthouse.audits["font-size"]?.score === 1 ? "Yes" : "Issues found",
        status: lighthouse.audits["font-size"]?.score === 1 ? "pass" : "warning",
        message: lighthouse.audits["font-size"]?.title || ""
      },
      altTags: {
        value: Math.round((lighthouse.audits["image-alt"]?.score || 0) * 100),
        status: lighthouse.audits["image-alt"]?.score > 0.8 ? "pass" : "warning",
        message: lighthouse.audits["image-alt"]?.title || "",
        severity: lighthouse.audits["image-alt"]?.score > 0.8 ? "info" : "warning"
      }
    };
    const actionItems = [];
    const seoAudits = lighthouse.categories.seo.auditRefs;
    for (const auditRef of seoAudits) {
      const audit = lighthouse.audits[auditRef.id];
      if (audit.score !== null && audit.score < 1) {
        const priority = audit.score === 0 ? "high" : audit.score < 0.5 ? "medium" : "low";
        actionItems.push({
          title: audit.title,
          description: audit.description,
          priority,
          severity: audit.score === 0 ? "critical" : audit.score < 0.5 ? "warning" : "info"
        });
      }
    }
    actionItems.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    const result = {
      url: lighthouse.finalUrl,
      overallScore,
      categoryScores,
      meta,
      performance,
      content,
      technical,
      mobile,
      actionItems: actionItems.slice(0, 10),
      // Top 10 action items
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300"
        }
      }
    );
  } catch (error) {
    console.error("SEO Audit error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to run SEO audit"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
}
__name(onRequestPost6, "onRequestPost6");
__name2(onRequestPost6, "onRequestPost");
async function onRequestPost7({ request }) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { url } = await request.json();
    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    try {
      new URL(url);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid URL format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const apiKey = "AIzaSyA308cZv0hNvZdC8VAM15v8CE12HEsHzCQ";
    const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&category=accessibility&category=best-practices&category=seo&strategy=mobile&key=${apiKey}`;
    const psiResponse = await fetch(psiUrl);
    if (!psiResponse.ok) {
      const errorData = await psiResponse.json().catch(() => ({ error: { message: "Unknown error" } }));
      throw new Error(errorData.error?.message || "PageSpeed Insights API failed");
    }
    const psiData = await psiResponse.json();
    const lighthouse = psiData.lighthouseResult;
    const performanceScore = Math.round(lighthouse.categories.performance.score * 100);
    const getPerformanceGrade = /* @__PURE__ */ __name2((score) => {
      if (score >= 90) return "A";
      if (score >= 75) return "B";
      if (score >= 50) return "C";
      if (score >= 25) return "D";
      return "F";
    }, "getPerformanceGrade");
    const metrics = {
      fcp: lighthouse.audits["first-contentful-paint"],
      lcp: lighthouse.audits["largest-contentful-paint"],
      cls: lighthouse.audits["cumulative-layout-shift"],
      si: lighthouse.audits["speed-index"],
      tbt: lighthouse.audits["total-blocking-time"],
      tti: lighthouse.audits["interactive"]
    };
    const opportunities = [];
    const opportunityAudits = [
      "render-blocking-resources",
      "unused-css-rules",
      "unused-javascript",
      "modern-image-formats",
      "offscreen-images",
      "unminified-css",
      "unminified-javascript",
      "uses-optimized-images",
      "uses-text-compression",
      "uses-responsive-images",
      "efficient-animated-content",
      "duplicated-javascript",
      "legacy-javascript",
      "prioritize-lcp-image",
      "total-byte-weight",
      "uses-long-cache-ttl"
    ];
    for (const auditId of opportunityAudits) {
      const audit = lighthouse.audits[auditId];
      if (audit && audit.details && (audit.details.overallSavingsMs > 100 || audit.score < 0.9)) {
        opportunities.push({
          title: audit.title,
          description: audit.description,
          savings: audit.details.overallSavingsMs ? `${Math.round(audit.details.overallSavingsMs / 100) / 10}s` : audit.displayValue || "Optimize",
          savingsMs: audit.details.overallSavingsMs || 0,
          score: audit.score
        });
      }
    }
    opportunities.sort((a, b) => (b.savingsMs || 0) - (a.savingsMs || 0));
    const topOpportunities = opportunities.slice(0, 5);
    const result = {
      url: lighthouse.finalUrl,
      fetchTime: lighthouse.fetchTime,
      scores: {
        performance: performanceScore,
        accessibility: Math.round(lighthouse.categories.accessibility.score * 100),
        bestPractices: Math.round(lighthouse.categories["best-practices"].score * 100),
        seo: Math.round(lighthouse.categories.seo.score * 100)
      },
      metrics: {
        fcp: { value: metrics.fcp.displayValue, score: metrics.fcp.score },
        lcp: { value: metrics.lcp.displayValue, score: metrics.lcp.score },
        cls: { value: metrics.cls.displayValue, score: metrics.cls.score },
        si: { value: metrics.si.displayValue, score: metrics.si.score },
        tbt: { value: metrics.tbt.displayValue, score: metrics.tbt.score },
        tti: { value: metrics.tti.displayValue, score: metrics.tti.score }
      },
      opportunities: topOpportunities,
      performanceGrade: getPerformanceGrade(performanceScore)
    };
    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300"
        }
      }
    );
  } catch (error) {
    console.error("Speed test error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to run speed test"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
}
__name(onRequestPost7, "onRequestPost7");
__name2(onRequestPost7, "onRequestPost");
async function onRequestGet2() {
  return new Response(JSON.stringify({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    service: "TPP Backend API (Cloudflare Pages Functions)",
    platform: "Cloudflare Workers"
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
__name(onRequestGet2, "onRequestGet2");
__name2(onRequestGet2, "onRequestGet");
var routes = [
  {
    routePath: "/api/n8n/trigger",
    mountPath: "/api/n8n",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/n8n/workflows",
    mountPath: "/api/n8n",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/serp/rank-check",
    mountPath: "/api/serp",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/competitor-analysis",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions]
  },
  {
    routePath: "/api/competitor-analysis",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/contact",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/api/content-generator",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost5]
  },
  {
    routePath: "/api/seo-audit",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost6]
  },
  {
    routePath: "/api/speed-test",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost7]
  },
  {
    routePath: "/health",
    mountPath: "/",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  }
];
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name2(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  static {
    __name(this, "___Facade_ScheduledController__");
  }
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name2(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name2((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name2((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// node_modules/wrangler/templates/pages-dev-util.ts
function isRoutingRuleMatch(pathname, routingRule) {
  if (!pathname) {
    throw new Error("Pathname is undefined.");
  }
  if (!routingRule) {
    throw new Error("Routing rule is undefined.");
  }
  const ruleRegExp = transformRoutingRuleToRegExp(routingRule);
  return pathname.match(ruleRegExp) !== null;
}
__name(isRoutingRuleMatch, "isRoutingRuleMatch");
function transformRoutingRuleToRegExp(rule) {
  let transformedRule;
  if (rule === "/" || rule === "/*") {
    transformedRule = rule;
  } else if (rule.endsWith("/*")) {
    transformedRule = `${rule.substring(0, rule.length - 2)}(/*)?`;
  } else if (rule.endsWith("/")) {
    transformedRule = `${rule.substring(0, rule.length - 1)}(/)?`;
  } else if (rule.endsWith("*")) {
    transformedRule = rule;
  } else {
    transformedRule = `${rule}(/)?`;
  }
  transformedRule = `^${transformedRule.replaceAll(/\./g, "\\.").replaceAll(/\*/g, ".*")}$`;
  return new RegExp(transformedRule);
}
__name(transformRoutingRuleToRegExp, "transformRoutingRuleToRegExp");

// .wrangler/tmp/pages-bbtDkE/d47r0c6ogmh.js
var define_ROUTES_default = {
  version: 1,
  include: ["/*"],
  exclude: []
};
var routes2 = define_ROUTES_default;
var pages_dev_pipeline_default = {
  fetch(request, env, context) {
    const { pathname } = new URL(request.url);
    for (const exclude of routes2.exclude) {
      if (isRoutingRuleMatch(pathname, exclude)) {
        return env.ASSETS.fetch(request);
      }
    }
    for (const include of routes2.include) {
      if (isRoutingRuleMatch(pathname, include)) {
        const workerAsHandler = middleware_loader_entry_default;
        if (workerAsHandler.fetch === void 0) {
          throw new TypeError("Entry point missing `fetch` handler");
        }
        return workerAsHandler.fetch(request, env, context);
      }
    }
    return env.ASSETS.fetch(request);
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-t2esUj/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = pages_dev_pipeline_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-t2esUj/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class ___Facade_ScheduledController__2 {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=d47r0c6ogmh.js.map
