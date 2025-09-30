import nodemailer from 'nodemailer';
import fs from 'fs/promises';

async function testEmail() {
  try {
    const config = JSON.parse(await fs.readFile('./config/production.json', 'utf-8'));
    
    const transporter = nodemailer.createTransport({
      host: config.notifications.email.smtp.host,
      port: config.notifications.email.smtp.port,
      secure: config.notifications.email.smtp.secure,
      auth: {
        user: config.notifications.email.smtp.auth.user,
        pass: config.notifications.email.smtp.auth.pass
      }
    });

    await transporter.sendMail({
      from: config.notifications.email.from,
      to: config.notifications.email.to,
      subject: '✅ Visual Quality Agent - Email Test Successful',
      text: 'Congratulations! Email notifications are now configured and working!\n\nYou will receive alerts when visual quality issues are detected on your website.\n\nThe agent is monitoring: https://theprofitplatform.com.au\nCheck frequency: Every 15 minutes',
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #28a745; color: white; padding: 20px; border-radius: 5px; text-align: center; }
    .content { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .info { background: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>✅ Email Notifications Active!</h2>
    </div>

    <div class="content">
      <h3>🎉 Setup Successful</h3>
      <p>Your Visual Quality Agent is now configured to send email notifications.</p>
      
      <div class="info">
        <strong>What happens next?</strong>
        <ul>
          <li>Agent monitors: <strong>https://theprofitplatform.com.au</strong></li>
          <li>Checks run: <strong>Every 15 minutes</strong></li>
          <li>You'll receive alerts when issues are detected</li>
          <li>Each email includes issue details and fix suggestions</li>
        </ul>
      </div>

      <p><strong>Current Status:</strong></p>
      <ul>
        <li>✅ Service running</li>
        <li>✅ Email notifications enabled</li>
        <li>✅ Monitoring active</li>
      </ul>
    </div>

    <div class="footer">
      <p>This is an automated test from Visual Quality Agent</p>
      <p>Powered by The Profit Platform</p>
    </div>
  </div>
</body>
</html>
`
    });

    console.log('✅ Test email sent successfully!');
    console.log('📧 Check your inbox: abhishekmaharjan3737@gmail.com');
  } catch (error) {
    console.error('❌ Test email failed:', error.message);
    throw error;
  }
}

testEmail();
