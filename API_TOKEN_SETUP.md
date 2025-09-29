# Cloudflare API Token Setup Guide

## 🔑 Creating an API Token

1. **Go to Cloudflare Dashboard:**
   - Visit: https://dash.cloudflare.com/profile/api-tokens
   - Click "Create Token"

2. **Choose Custom Token:**
   - Click "Get started" next to "Custom token"

3. **Configure Token Permissions:**
   ```
   Token Name: TPP Domain Management

   Permissions:
   - Account | Cloudflare Pages:Edit
   - Zone | Zone:Read
   - Zone | DNS:Edit

   Account Resources:
   - Include | All accounts

   Zone Resources:
   - Include | All zones from account | <your-account>
   ```

4. **Save the Token:**
   - Copy the token immediately (it won't be shown again)

## 🚀 Setting Up the Token

### Option 1: Environment Variable (Recommended)
```bash
# Add to your ~/.bashrc or ~/.zshrc
export CLOUDFLARE_API_TOKEN="your_token_here"

# Reload your shell
source ~/.bashrc
```

### Option 2: One-time Use
```bash
export CLOUDFLARE_API_TOKEN="your_token_here"
./setup-domain.sh
```

## 🧪 Test the Setup

Run the domain setup script:
```bash
./setup-domain.sh
```

## 🔧 Manual Domain Setup (Alternative)

If API approach doesn't work, use Cloudflare Dashboard:

1. **Pages Dashboard:**
   - Go to: https://dash.cloudflare.com/pages/view/tpp-new
   - Click "Custom domains" tab
   - Click "Set up a custom domain"

2. **Add Domain:**
   - Enter: `new.theprofitplatform.com.au`
   - Follow the DNS instructions

3. **DNS Configuration:**
   - Add CNAME record in your domain DNS:
   ```
   Type: CNAME
   Name: new
   Value: [provided by Cloudflare]
   TTL: Auto
   ```

## 🎯 Expected Result

After setup, your site will be available at:
- https://new.theprofitplatform.com.au

## 🛠 Troubleshooting

### "Invalid token" error:
- Verify token permissions include Pages:Edit
- Check token hasn't expired
- Ensure account access is granted

### "Domain already exists" error:
- Domain might already be configured
- Check Pages dashboard for existing domains

### DNS propagation:
- Can take 5-60 minutes to propagate
- Use online DNS checker tools to verify