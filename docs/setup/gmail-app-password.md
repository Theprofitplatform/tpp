# Gmail App Password Setup for Tool Improvement Agent

## Quick Steps:

### 1. Create Gmail App Password

**Direct Link:** https://myaccount.google.com/apppasswords

**Steps:**
1. Go to the link above (you must have 2FA enabled first)
2. If 2FA not enabled, go to https://myaccount.google.com/security and enable it
3. At App Passwords page:
   - App: Select "Mail"
   - Device: Select "Other" and type "Tool Agent VPS"
   - Click "Generate"
4. Copy the 16-character password (format: xxxx xxxx xxxx xxxx)

### 2. Update VPS Configuration

**Option A - Using Command (Replace XXXX with your actual password):**
```bash
ssh tpp-vps "cd ~/projects/astro-site && echo 'SMTP_PASS=xxxx xxxx xxxx xxxx' >> .env.tool-agent"
```

**Option B - Manual Edit:**
```bash
ssh tpp-vps
nano ~/projects/astro-site/.env.tool-agent
```

Change line:
```
SMTP_PASS=your_app_password_here
```
To:
```
SMTP_PASS=your_actual_16_char_password
```

### 3. Restart Agent
```bash
ssh tpp-vps "pm2 restart tool-agent && pm2 logs tool-agent --lines 20"
```

### 4. Test It Works
```bash
ssh tpp-vps "cd ~/projects/astro-site/tools && node tool-improvement-agent.mjs"
```

Check your email inbox for the report!

---

## Troubleshooting

**"Invalid login" error:**
- Ensure 2FA is enabled on Google account
- Verify app password has no typos
- Remove any spaces when pasting password

**No email received:**
- Check spam/junk folder
- Verify email address in .env.tool-agent
- Check logs: `ssh tpp-vps "pm2 logs tool-agent"`

**Need to regenerate password:**
Go to https://myaccount.google.com/apppasswords and create a new one
