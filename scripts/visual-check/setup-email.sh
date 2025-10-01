#!/bin/bash

# Email Configuration Helper
# This script helps configure Gmail SMTP for email notifications

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║           📧 EMAIL NOTIFICATION SETUP                        ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Get Gmail app password
echo "Enter your Gmail App Password (16 characters):"
echo "(Create one at: https://myaccount.google.com/apppasswords)"
echo ""
read -s -p "App Password: " APP_PASSWORD
echo ""
echo ""

if [ -z "$APP_PASSWORD" ]; then
    echo "❌ No password entered. Exiting."
    exit 1
fi

# Remove spaces from app password
APP_PASSWORD=$(echo "$APP_PASSWORD" | tr -d ' ')

# Update production config
cat > config/production.json << CONFIGEOF
{
  "url": "https://theprofitplatform.com.au",
  "interval": "*/15 * * * *",
  "viewports": {
    "desktop": {
      "width": 1920,
      "height": 1080,
      "enabled": true
    },
    "mobile": {
      "width": 375,
      "height": 812,
      "enabled": true
    }
  },
  "checks": {
    "layout": true,
    "typography": true,
    "colors": true,
    "images": true,
    "responsiveness": true,
    "accessibility": true,
    "performance": true
  },
  "autoFix": {
    "enabled": false,
    "requireApproval": true,
    "backupBeforeFix": true
  },
  "notifications": {
    "webhook": {
      "enabled": false,
      "url": ""
    },
    "email": {
      "enabled": true,
      "to": "abhishekmaharjan3737@gmail.com",
      "from": "visual-agent@theprofitplatform.com.au",
      "subject": "🚨 Visual Quality Alert - Issues Detected",
      "smtp": {
        "host": "smtp.gmail.com",
        "port": 587,
        "secure": false,
        "auth": {
          "user": "abhishekmaharjan3737@gmail.com",
          "pass": "$APP_PASSWORD"
        }
      }
    },
    "slack": {
      "enabled": false,
      "webhookUrl": ""
    }
  },
  "paths": {
    "webRoot": "/home/avi/projects/astro-site",
    "screenshots": "./screenshots",
    "reports": "./reports",
    "fixes": "./fixes",
    "logs": "./logs"
  },
  "thresholds": {
    "maxLayoutShift": 0.1,
    "minContrast": 4.5,
    "maxImageSize": 500,
    "minFontSize": 12,
    "maxLoadTime": 3000
  }
}
CONFIGEOF

echo "✅ Configuration updated!"
echo ""
echo "Testing email connection..."

# Test email
node << 'NODEEOF'
const nodemailer = require('nodemailer');

async function testEmail() {
  try {
    const config = require('./config/production.json');
    
    const transporter = nodemailer.createTransporter({
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
      subject: '✅ Visual Quality Agent - Email Test',
      text: 'Email notifications are now configured and working!\n\nYou will receive alerts when visual quality issues are detected on your website.',
      html: '<h2>✅ Email Test Successful</h2><p>Email notifications are now configured and working!</p><p>You will receive alerts when visual quality issues are detected on your website.</p>'
    });

    console.log('✅ Test email sent successfully!');
    console.log('📧 Check your inbox: abhishekmaharjan3737@gmail.com');
  } catch (error) {
    console.error('❌ Test email failed:', error.message);
    console.error('Please check your app password and try again.');
  }
}

testEmail();
NODEEOF

echo ""
echo "Restarting visual-agent service..."
sudo systemctl restart visual-agent

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║   ✅ EMAIL NOTIFICATIONS CONFIGURED!                         ║"
echo "║                                                              ║"
echo "║   You will now receive email alerts at:                     ║"
echo "║   abhishekmaharjan3737@gmail.com                            ║"
echo "║                                                              ║"
echo "║   When issues are detected every 15 minutes                 ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

