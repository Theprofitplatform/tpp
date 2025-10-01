import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4321;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3001',
    'https://theprofitplatform.com.au',
    'https://*.theprofitplatform.com.au'
  ]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - 5 submissions per 15 minutes per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many form submissions. Please try again in 15 minutes.' }
});

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verify email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Honeypot spam detection
const isSpam = (body) => {
  // Check honeypot field
  if (body._gotcha) {
    return true;
  }
  // Check for suspicious patterns
  if (body.message && body.message.includes('http') && body.message.length > 1000) {
    return true;
  }
  return false;
};

// Validation middleware
const validateContactForm = (req, res, next) => {
  const { name, email, service, message } = req.body;

  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Valid email is required');
  }

  if (!service) {
    errors.push('Service selection is required');
  }

  if (!message || message.trim().length < 10) {
    errors.push('Message must be at least 10 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'TPP Backend API'
  });
});

// Contact form endpoint
app.post('/api/contact', contactLimiter, validateContactForm, async (req, res) => {
  try {
    const { name, email, phone, company, service, budget, message, consent } = req.body;

    // Spam detection
    if (isSpam(req.body)) {
      console.warn('🚨 Spam submission blocked:', email);
      return res.status(400).json({ success: false, error: 'Invalid submission' });
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
IP: ${req.ip}
    `.trim();

    // Send email to business
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL || 'avi@theprofitplatform.com.au',
      replyTo: email,
      subject: `🎯 New Lead: ${service} - ${name}`,
      text: emailContent,
      html: `<pre style="font-family: monospace; font-size: 14px;">${emailContent}</pre>`
    });

    // Send auto-reply to customer
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Thank you for contacting The Profit Platform',
      html: `
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
    });

    // Log successful submission
    console.log('✅ Contact form submission:', {
      name,
      email,
      service,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Thank you! Your message has been sent successfully.'
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message. Please try again or email us directly.'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 TPP Backend API Server Running
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
⏰ Started: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

export default app;
