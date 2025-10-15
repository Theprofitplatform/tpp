# Gmail Notification Setup Guide

This guide will help you set up Gmail notifications for your automated blog posting system.

## Step 1: Create Gmail App Password

Since Google disabled "Less Secure Apps" access, you need to create an **App Password** for your Gmail account.

### Prerequisites:

- Gmail account with **2-Factor Authentication (2FA) enabled**
- If 2FA is not enabled, you must enable it first

### Instructions:

1. **Enable 2-Factor Authentication** (if not already enabled):
   - Go to https://myaccount.google.com/security
   - Under "How you sign in to Google", click "2-Step Verification"
   - Follow the setup process

2. **Create App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Sign in if prompted
   - Under "Select app", choose **"Mail"**
   - Under "Select device", choose **"Other (Custom name)"**
   - Enter: **"Blog Automation System"**
   - Click **"Generate"**
   - Google will display a 16-character password like: `abcd efgh ijkl mnop`
   - **IMPORTANT**: Copy this password immediately - you won't see it again!

## Step 2: Add Secrets to GitHub

You need to add 3 secrets to your GitHub repository:

1. Go to your GitHub repository: `https://github.com/YOUR_USERNAME/tpp`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**

Add these 3 secrets:

### Secret 1: GMAIL_USER

- **Name**: `GMAIL_USER`
- **Value**: Your full Gmail address (e.g., `yourname@gmail.com`)

### Secret 2: GMAIL_APP_PASSWORD

- **Name**: `GMAIL_APP_PASSWORD`
- **Value**: The 16-character app password from Step 1 (remove spaces)
- Example: `abcdefghijklmnop`

### Secret 3: NOTIFICATION_EMAIL (Optional)

- **Name**: `NOTIFICATION_EMAIL`
- **Value**: Email address to receive notifications (defaults to GMAIL_USER if not set)
- You can use the same Gmail or a different email address

## Step 3: Test the Setup

### Local Testing:

1. Add to your `.env.local` file:

```bash
GMAIL_USER=yourname@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
NOTIFICATION_EMAIL=yourname@gmail.com
```

2. Test the notification system:

```bash
STATUS=success \
POST_TITLE="Test Blog Post" \
POST_URL="https://theprofitplatform.com.au/blog/test" \
SLUG="test-blog-post" \
WORD_COUNT="1500" \
node automation/scripts/send-notification.js
```

3. Check your Gmail inbox for the notification email!

### GitHub Actions Testing:

1. Manually trigger the workflow:

```bash
gh workflow run daily-blog-post.yml
```

2. Monitor the workflow:

```bash
gh run watch
```

3. Check your Gmail inbox for the notification!

## Email Notification Features

### Success Email Includes:

- ✅ Blog post title
- 📊 Word count
- 🔗 Direct link to published post
- 🏷️ Post slug
- ⏱️ Build status with timing estimate
- 🔍 Link to GitHub workflow run
- 🤖 Timestamp in Sydney timezone

### Failure Email Includes:

- ❌ Alert that generation failed
- 📝 Attempted topic (if available)
- 🔗 Link to workflow logs for debugging
- 🤖 Timestamp in Sydney timezone

## Troubleshooting

### "Invalid login: 535-5.7.8 Username and Password not accepted"

- Double-check your app password (no spaces)
- Make sure 2FA is enabled on your Gmail account
- Try generating a new app password

### "Error: self-signed certificate in certificate chain"

- This usually happens in corporate networks
- Try from a different network
- Or add `tls: { rejectUnauthorized: false }` to transporter config (not recommended for production)

### Not receiving emails:

- Check your spam/junk folder
- Verify `GMAIL_USER` is correct
- Make sure you have GitHub secrets set correctly (not just .env.local)

### Getting "Gmail credentials not configured" message:

- Check that GitHub secrets are set correctly
- Secret names must be EXACT: `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `NOTIFICATION_EMAIL`
- Secrets are case-sensitive

## Security Best Practices

✅ **DO:**

- Use App Passwords (never use your actual Gmail password)
- Store credentials in GitHub Secrets (never commit to code)
- Use different app passwords for different applications
- Revoke app passwords when no longer needed

❌ **DON'T:**

- Share your app password
- Commit credentials to your repository
- Use the same password for multiple services
- Disable 2FA to avoid app passwords

## Revoking Access

If you need to revoke access:

1. Go to https://myaccount.google.com/apppasswords
2. Find "Blog Automation System"
3. Click **"Remove"**
4. Delete the secret from GitHub: Settings → Secrets → Actions → Delete

## Additional Configuration

### Change Notification Email:

Update the `NOTIFICATION_EMAIL` secret in GitHub to send to a different address.

### Multiple Recipients:

Modify `send-notification.js` line 244:

```javascript
to: 'person1@example.com, person2@example.com',
```

### Custom Email Template:

Edit `buildSuccessEmail()` or `buildErrorEmail()` functions in `send-notification.js`

---

**Questions?** Check the main README or create an issue on GitHub.
