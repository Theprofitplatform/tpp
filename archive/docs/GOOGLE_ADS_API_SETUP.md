# Google Ads Keyword Planner API Setup Guide

## Prerequisites
- Google account
- Google Cloud Platform account
- Google Ads account (can be test account)

## Step 1: Google Cloud Console Setup

### 1.1 Create OAuth 2.0 Credentials
1. Go to https://console.cloud.google.com/
2. Create a new project: "TPP Keyword Research"
3. Navigate to **APIs & Services** → **Library**
4. Search for "Google Ads API" and click **Enable**
5. Go to **APIs & Services** → **Credentials**
6. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
7. Configure consent screen (if prompted):
   - User Type: External
   - App name: "TPP Keyword Research"
   - User support email: your email
   - Developer contact: your email
8. Application type: **Desktop app** (or Web application if deploying to Cloudflare)
9. Name: "TPP OAuth Client"
10. Click **Create**
11. **Download JSON** file (save as `google-ads-oauth.json`)

### 1.2 Note Your Credentials
From the downloaded JSON, you'll need:
- `client_id`
- `client_secret`

## Step 2: Google Ads Manager Account (MCC)

### 2.1 Create Manager Account
1. Go to https://ads.google.com/home/tools/manager-accounts/
2. Click **Create a manager account**
3. Fill in business details
4. Complete setup

### 2.2 Get Developer Token
1. In your Google Ads Manager account
2. Go to **Tools & Settings** (wrench icon)
3. Under **Setup**, click **API Center**
4. Apply for access (can take 24 hours for approval)
5. For testing, you can use **test account** mode immediately
6. Copy your **Developer Token**

## Step 3: Create Test Account (Optional but Recommended)

1. In your Manager account
2. Click **Accounts** → **+ New account**
3. Select **Create a new Google Ads account**
4. Fill in details
5. Note the **Customer ID** (format: 123-456-7890)

## Step 4: Generate Refresh Token

### 4.1 Install Google Ads API Client Library
```bash
npm install google-ads-api
```

### 4.2 Create Token Generation Script

Create `scripts/generate-google-ads-token.js`:

```javascript
const readline = require('readline');
const { google } = require('googleapis');

const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob' // Desktop app redirect
);

// Generate auth URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: 'https://www.googleapis.com/auth/adwords',
});

console.log('Authorize this app by visiting:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the authorization code: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\nRefresh Token:', tokens.refresh_token);
    console.log('\nAdd this to your .env file');
  } catch (err) {
    console.error('Error getting tokens:', err);
  }
  rl.close();
});
```

### 4.3 Run the Script
```bash
node scripts/generate-google-ads-token.js
```

1. Visit the URL displayed
2. Authorize the app
3. Copy the authorization code
4. Paste it into the terminal
5. **Save the refresh token**

## Step 5: Configure Environment Variables

Add to `.env.local`:

```bash
# Google Ads API Configuration
GOOGLE_ADS_DEVELOPER_TOKEN=your_developer_token_here
GOOGLE_ADS_CLIENT_ID=your_client_id_here
GOOGLE_ADS_CLIENT_SECRET=your_client_secret_here
GOOGLE_ADS_REFRESH_TOKEN=your_refresh_token_here
GOOGLE_ADS_CUSTOMER_ID=123-456-7890  # Remove dashes: 1234567890
GOOGLE_ADS_LOGIN_CUSTOMER_ID=123-456-7890  # Manager account ID (if different)
```

## Step 6: Update Cloudflare Wrangler Configuration

Add secrets to Cloudflare Pages:

```bash
# Using Wrangler CLI
npx wrangler pages secret put GOOGLE_ADS_DEVELOPER_TOKEN
npx wrangler pages secret put GOOGLE_ADS_CLIENT_ID
npx wrangler pages secret put GOOGLE_ADS_CLIENT_SECRET
npx wrangler pages secret put GOOGLE_ADS_REFRESH_TOKEN
npx wrangler pages secret put GOOGLE_ADS_CUSTOMER_ID
npx wrangler pages secret put GOOGLE_ADS_LOGIN_CUSTOMER_ID
```

Or via Cloudflare Dashboard:
1. Go to your Pages project
2. Settings → Environment variables
3. Add each variable for Production environment

## Step 7: API Usage Limits (Free Tier)

- **Free quota**: 15,000 operations/day
- **Keyword Ideas endpoint**: ~1 operation per request
- **Historical Metrics**: ~1 operation per 1,000 keywords
- No credit card required for basic access
- Must have billing info in Google Ads account for full features

## Important Notes

1. **Test Account**: Use test account mode during development to avoid using quota
2. **Developer Token Status**:
   - Pending approval: Can only access test accounts
   - Approved: Can access production accounts
3. **Customer ID Format**: Remove dashes (123-456-7890 → 1234567890)
4. **Refresh Token**: Only shown once - save it securely

## Testing the Connection

Use this test script (`scripts/test-google-ads-connection.js`):

```javascript
const { GoogleAdsApi } = require('google-ads-api');

const client = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
});

const customer = client.Customer({
  customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
  refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
  login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
});

async function testConnection() {
  try {
    const keywordPlanIdeaService = customer.keywordPlanIdeas;

    const ideas = await keywordPlanIdeaService.generateKeywordIdeas({
      customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
      language: 'en',
      geo_target_constants: ['geoTargetConstants/2036'], // Australia
      keyword_seed: {
        keywords: ['digital marketing'],
      },
    });

    console.log('✅ Connection successful!');
    console.log(`Found ${ideas.length} keyword ideas`);
    console.log('Sample:', ideas.slice(0, 3));
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
```

Run: `node scripts/test-google-ads-connection.js`

## Next Steps

After setup is complete:
1. Test the connection with sample queries
2. Update `functions/api/keyword-research.js` to use real API
3. Add error handling for quota limits
4. Implement caching to reduce API calls

## Resources

- [Google Ads API Docs](https://developers.google.com/google-ads/api/docs/start)
- [Keyword Planning Guide](https://developers.google.com/google-ads/api/docs/keyword-planning/overview)
- [Node.js Library](https://developers.google.com/google-ads/api/docs/client-libs/nodejs)
