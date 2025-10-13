# GitHub Secrets Configuration Guide

## Overview
This guide walks you through setting up all required GitHub Secrets for the `tpp-website` repository's GitHub Actions workflow.

## Access GitHub Secrets

Navigate to:
```
https://github.com/Theprofitplatform/tpp-website/settings/secrets/actions
```

Or follow these steps:
1. Go to your repository on GitHub
2. Click **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret** for each secret below

---

## Required Secrets

### 1. VPS/Production Server Secrets

#### PROD_HOST
- **Description**: Your production VPS hostname or IP address
- **Example**: `123.45.67.89` or `vps.theprofitplatform.com.au`
- **How to get it**:
  ```bash
  # If you SSH to your VPS like this:
  ssh user@YOUR_HOST
  # Then YOUR_HOST is what you need
  ```

#### PROD_USER
- **Description**: SSH username for your production server
- **Example**: `ubuntu`, `root`, or your custom username
- **Common values**:
  - Ubuntu servers: `ubuntu`
  - Debian servers: `debian`
  - Custom users: your username

#### PROD_KEY
- **Description**: SSH private key content (full key)
- **How to get it**:
  ```bash
  # On your local machine, display your private key:
  cat ~/.ssh/id_rsa
  # Or if you use a different key:
  cat ~/.ssh/your_key_name

  # Copy the ENTIRE output, including:
  # -----BEGIN OPENSSH PRIVATE KEY-----
  # ... all the content ...
  # -----END OPENSSH PRIVATE KEY-----
  ```
- **Important**:
  - Copy the entire key including header and footer
  - Include all line breaks
  - Never share this key publicly

**Generating a new SSH key pair (if needed)**:
```bash
# Generate new SSH key
ssh-keygen -t ed25519 -C "github-actions@theprofitplatform"

# Copy the public key to your VPS
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@your-vps

# Then use the private key (~/.ssh/id_ed25519) as PROD_KEY secret
```

---

### 2. Staging Server Secrets (Optional)

If you have a staging server, add these:

#### STAGING_HOST
- **Description**: Staging server hostname/IP
- **Example**: `staging.theprofitplatform.com.au`

#### STAGING_USER
- **Description**: SSH username for staging
- **Example**: `ubuntu`

#### STAGING_KEY
- **Description**: SSH private key for staging server
- **How to get**: Same as PROD_KEY above

---

### 3. Cloudflare Secrets (Optional but Recommended)

#### CF_ZONE_ID
- **Description**: Your Cloudflare Zone ID
- **How to get it**:
  1. Log in to Cloudflare Dashboard
  2. Select your domain (theprofitplatform.com.au)
  3. Scroll down on Overview page
  4. Find **Zone ID** in the right sidebar
  5. Copy the ID (looks like: `abc123def456...`)

#### CF_API_TOKEN
- **Description**: Cloudflare API token with cache purge permissions
- **How to get it**:
  1. Go to Cloudflare Dashboard
  2. Click on your profile → **API Tokens**
  3. Click **Create Token**
  4. Use template: **Zone.Cache Purge**
  5. Set zone resources to include your domain
  6. Click **Continue to summary** → **Create Token**
  7. Copy the token (you'll only see it once!)

**Required permissions**:
- Zone - Cache Purge - Purge

---

### 4. Notification Secrets (Optional)

#### SLACK_WEBHOOK
- **Description**: Slack webhook URL for deployment notifications
- **How to get it**:
  1. Go to your Slack workspace
  2. Go to **Apps** → Search for "Incoming Webhooks"
  3. Click **Add to Slack**
  4. Choose a channel for notifications
  5. Copy the Webhook URL (looks like: `https://hooks.slack.com/services/...`)

---

## Quick Setup Checklist

- [ ] PROD_HOST - VPS hostname/IP
- [ ] PROD_USER - SSH username
- [ ] PROD_KEY - SSH private key (full content)
- [ ] STAGING_HOST (optional)
- [ ] STAGING_USER (optional)
- [ ] STAGING_KEY (optional)
- [ ] CF_ZONE_ID (optional)
- [ ] CF_API_TOKEN (optional)
- [ ] SLACK_WEBHOOK (optional)

---

## Testing SSH Connection

Before adding secrets to GitHub, test your SSH connection locally:

```bash
# Test basic connection
ssh YOUR_USER@YOUR_HOST

# Test with specific key
ssh -i ~/.ssh/your_key YOUR_USER@YOUR_HOST

# Test directory access
ssh YOUR_USER@YOUR_HOST "ls -la /var/www/html"
```

---

## VPS Directory Structure

Ensure these directories exist on your VPS:

```bash
# Connect to your VPS
ssh YOUR_USER@YOUR_HOST

# Create required directories
sudo mkdir -p /var/www/html
sudo mkdir -p /var/www/backups

# Set proper permissions
sudo chown -R $USER:$USER /var/www/html
sudo chown -R $USER:$USER /var/www/backups
```

---

## Verifying Secrets

After adding all secrets, you can verify they're set (but not see their values):

1. Go to: `https://github.com/Theprofitplatform/tpp-website/settings/secrets/actions`
2. You should see all your secret names listed
3. Click the pencil icon to update (but values are hidden for security)

---

## Security Best Practices

1. **Never commit secrets to git**
   - Always use GitHub Secrets
   - Never hardcode credentials

2. **Use limited-access keys**
   - Create a dedicated SSH key for GitHub Actions
   - Use API tokens with minimal required permissions

3. **Rotate credentials regularly**
   - Change SSH keys every 6-12 months
   - Regenerate API tokens periodically

4. **Use separate keys for staging/production**
   - Never use the same credentials for both environments

5. **Review access logs**
   - Check your VPS SSH logs regularly
   - Monitor API token usage in Cloudflare

---

## Troubleshooting

### "Permission denied (publickey)" error
- Ensure PROD_KEY contains the full private key
- Verify the public key is in `~/.ssh/authorized_keys` on the VPS
- Check file permissions on VPS: `chmod 600 ~/.ssh/authorized_keys`

### "Host key verification failed" error
- Add to your workflow (already included in the template):
  ```yaml
  - name: Add SSH host key
    run: |
      mkdir -p ~/.ssh
      ssh-keyscan -H ${{ secrets.PROD_HOST }} >> ~/.ssh/known_hosts
  ```

### "No such file or directory" error
- Verify directories exist on VPS: `/var/www/html`, `/var/www/backups`
- Check user permissions: `ls -la /var/www/`

### Cloudflare cache not purging
- Verify CF_API_TOKEN has "Zone.Cache Purge" permission
- Check CF_ZONE_ID is correct for your domain
- Test token with curl:
  ```bash
  curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
       -H "Authorization: Bearer YOUR_TOKEN"
  ```

---

## Minimal Setup (Just to Fix Current Failures)

If you just want to fix the current GitHub Actions failures, you only need these 3 secrets:

1. **PROD_HOST** - Your VPS IP/hostname
2. **PROD_USER** - Your SSH username
3. **PROD_KEY** - Your SSH private key

All other secrets are optional and can be added later.

---

## Alternative: Simplified Workflow

If the full workflow is too complex, you can replace it with a simpler version that only requires the 3 minimal secrets above. See the `TPP-WEBSITE-FIXES.md` document for the simplified workflow configuration.
