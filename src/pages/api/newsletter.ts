import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.formData();
    const email = data.get('email');

    // Validate email
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // TODO: Integrate with your email service provider (Mailchimp, ConvertKit, etc.)
    // For now, just log it and return success
    console.log(`Newsletter signup: ${email}`);

    // Example: You would call your email service API here
    // await mailchimp.lists.addListMember(LIST_ID, { email_address: email, status: 'subscribed' });
    // await convertkit.forms.subscribe(FORM_ID, { email });

    return new Response(JSON.stringify({
      success: true,
      message: 'Thank you for subscribing!'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Newsletter signup error:', error);
    return new Response(JSON.stringify({
      error: 'An error occurred. Please try again later.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
