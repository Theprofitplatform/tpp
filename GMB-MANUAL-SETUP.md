# 🎯 GMB API Setup - Manual Method

Since the API quota is limited for new projects, here's how to get your IDs manually:

## ✅ **Step 1: Find Your Account Number**

### Option A: From GMB Dashboard URL

1. Go to: https://business.google.com
2. Look at the URL - it will be like:
   ```
   https://business.google.com/u/0/n/ACCOUNT_NUMBER/dashboard
   ```
3. Copy the **ACCOUNT_NUMBER** (usually 18-20 digits)

### Option B: From Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/api/mybusinessaccountmanagement.googleapis.com/quotas?project=240987975437
2. Click "Try this API" on any method
3. Execute the API call
4. Look for your account in format: `accounts/ACCOUNT_NUMBER`
5. Copy the number after `accounts/`

---

## ✅ **Step 2: Find Your Location ID**

### Method 1: From Business Profile URL

1. Go to: https://business.google.com
2. Select your business location
3. Look at the URL:
   ```
   https://business.google.com/dashboard/l/LOCATION_ID
   ```
4. Copy the **LOCATION_ID**

### Method 2: Using API Explorer

1. Go to: https://developers.google.com/my-business/reference/accountmanagement/rest/v1/accounts.locations/list
2. Click "Try this API"
3. For `parent`, enter: `accounts/YOUR_ACCOUNT_NUMBER`
4. Click Execute
5. Look for your location's name in format: `accounts/XXX/locations/LOCATION_ID`
6. Copy the **LOCATION_ID**

---

## ✅ **Step 3: Add to .env.local**

Once you have both IDs, add them to your `.env.local` file:

```bash
# GMB Account & Location IDs
GMB_ACCOUNT_ID=123456789012345678
GMB_LOCATION_ID=987654321098765432
```

**Example:**
```bash
# GMB Account & Location IDs
GMB_ACCOUNT_ID=105924398574920193847
GMB_LOCATION_ID=285472049375820193847
```

---

## ✅ **Step 4: Test the Setup**

After adding the IDs, test it:

```bash
# Dry run (won't actually post)
export GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
export GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
node automation/scripts/gmb-api-poster.mjs --dry-run
```

If you see:
```
📱 GMB Automated Posting
🧪 DRY RUN MODE - No actual posts will be made
📄 Found X pending post(s)
```

**You're ready!** Now run the real posting:

```bash
node automation/scripts/gmb-api-poster.mjs --post
```

---

## 🎯 **Quick Test Business Profile**

Not sure which business? Here's how to verify:

1. Go to: https://business.google.com
2. You should see "The Profit Platform" or your business name
3. Click on it
4. That's the one we'll be posting to!

---

## 🐛 **Troubleshooting**

### Can't find Account ID?

Try this API call:
```
https://mybusinessaccountmanagement.googleapis.com/v1/accounts
```

Use OAuth Playground:
1. Go to: https://developers.google.com/oauthplayground/
2. Select "Google My Business API v4"
3. Click "Authorize APIs"
4. Exchange authorization code
5. Make the API call to `/accounts`

### Can't find Location ID?

Check all your locations:
```
https://mybusinessbusinessinformation.googleapis.com/v1/accounts/YOUR_ACCOUNT_ID/locations
```

---

## 💡 **Pro Tip: Get IDs via cURL**

If you're comfortable with command line:

```bash
# Get access token
curl -X POST https://oauth2.googleapis.com/token \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "refresh_token=$(cat automation/data/gmb-tokens.json | grep refresh_token | cut -d'"' -f4)" \
  -d "grant_type=refresh_token"

# Use that token to list accounts
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  https://mybusinessaccountmanagement.googleapis.com/v1/accounts

# List locations
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  https://mybusinessbusinessinformation.googleapis.com/v1/accounts/YOUR_ACCOUNT_ID/locations
```

---

**Once you have your IDs, let me know and I'll help you test the posting!**
