#!/bin/bash
# Permanent Cloudflare Tunnel Setup Script
# Run this script ON THE VPS via SSH

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 TPP Backend - Permanent Cloudflare Tunnel Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "This script will set up a permanent Cloudflare tunnel with"
echo "subdomain: api.theprofitplatform.com.au"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "❌ ERROR: cloudflared is not installed"
    echo ""
    echo "Install with:"
    echo "  curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared"
    echo "  chmod +x cloudflared"
    echo "  sudo mv cloudflared /usr/local/bin/"
    exit 1
fi

echo "✅ cloudflared is installed"
echo ""

# Step 1: Authenticate
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Authenticate with Cloudflare"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ! -f ~/.cloudflared/cert.pem ]; then
    echo "⚠️  Origin certificate not found. You need to authenticate."
    echo ""
    echo "Run this command and follow the browser login:"
    echo ""
    echo "  cloudflared tunnel login"
    echo ""
    echo "This will:"
    echo "  1. Open your browser"
    echo "  2. Ask you to select your domain (theprofitplatform.com.au)"
    echo "  3. Save the certificate to ~/.cloudflared/cert.pem"
    echo ""
    read -p "Press Enter after you've completed the login process..."

    if [ ! -f ~/.cloudflared/cert.pem ]; then
        echo "❌ ERROR: Certificate still not found. Please run 'cloudflared tunnel login' first."
        exit 1
    fi
fi

echo "✅ Origin certificate found"
echo ""

# Step 2: Create tunnel
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Creating Named Tunnel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if tunnel already exists
if cloudflared tunnel list | grep -q "tpp-backend"; then
    echo "⚠️  Tunnel 'tpp-backend' already exists"
    TUNNEL_ID=$(cloudflared tunnel list | grep "tpp-backend" | awk '{print $1}')
    echo "Using existing tunnel ID: $TUNNEL_ID"
else
    echo "Creating new tunnel 'tpp-backend'..."
    cloudflared tunnel create tpp-backend
    TUNNEL_ID=$(cloudflared tunnel list | grep "tpp-backend" | awk '{print $1}')
    echo "✅ Created tunnel with ID: $TUNNEL_ID"
fi

echo ""

# Step 3: Create config file
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Creating Configuration File"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

CREDS_FILE="$HOME/.cloudflared/$TUNNEL_ID.json"

if [ ! -f "$CREDS_FILE" ]; then
    echo "❌ ERROR: Credentials file not found: $CREDS_FILE"
    exit 1
fi

cat > ~/.cloudflared/config.yml << EOF
tunnel: $TUNNEL_ID
credentials-file: $CREDS_FILE

ingress:
  - hostname: api.theprofitplatform.com.au
    service: http://localhost:4321
  - service: http_status:404
EOF

echo "✅ Configuration file created at ~/.cloudflared/config.yml"
echo ""

# Step 4: Set up DNS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Setting up DNS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Creating DNS record for api.theprofitplatform.com.au..."
cloudflared tunnel route dns tpp-backend api.theprofitplatform.com.au

echo "✅ DNS configured"
echo ""

# Step 5: Install as system service
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Installing as System Service"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared

echo "✅ Service installed and started"
echo ""

# Step 6: Verify
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SUCCESS! Permanent tunnel is now running"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Your API is now available at:"
echo "  🌐 https://api.theprofitplatform.com.au"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Test the endpoint:"
echo "   curl https://api.theprofitplatform.com.au/health"
echo ""
echo "2. Update your local .env.local:"
echo "   PUBLIC_API_URL=https://api.theprofitplatform.com.au"
echo ""
echo "3. Stop the temporary tunnel (if running):"
echo "   pm2 delete cloudflare-tunnel"
echo ""
echo "4. Rebuild and deploy frontend:"
echo "   npm run build && npm run deploy"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Useful Commands:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  sudo systemctl status cloudflared   # Check service status"
echo "  sudo systemctl restart cloudflared  # Restart tunnel"
echo "  sudo systemctl stop cloudflared     # Stop tunnel"
echo "  sudo journalctl -u cloudflared -f   # View logs"
echo "  cloudflared tunnel list             # List tunnels"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
