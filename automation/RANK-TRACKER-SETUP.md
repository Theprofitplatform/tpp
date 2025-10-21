# Google Search Console Rank Tracker Setup

## Current Status: ❌ Not Configured

The API key you provided (`AIzaSyBaEI319a5_NwxGnhjHp5K8piQSpw6rK40`) is a **Google API key**, but Google Search Console API requires **Service Account credentials** (JSON file), not an API key.

---

## What You Need

Google Search Console API requires authenticated access via a **Service Account**.

### Option 1: Use Service Account (Recommended - Free & Automated)

**Steps:**

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create/Select Project**
   - Create new project or select existing one

3. **Enable Search Console API**
   - Navigation: APIs & Services → Library
   - Search for "Google Search Console API"
   - Click "Enable"

4. **Create Service Account**
   - Navigation: IAM & Admin → Service Accounts
   - Click "Create Service Account"
   - Name: "TPP Rank Tracker"
   - Description: "Automated rank tracking for The Profit Platform"
   - Click "Create and Continue"

5. **Create JSON Key**
   - After creating service account, click on it
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Choose "JSON" format
   - Download the JSON file

6. **Add Service Account to Search Console**
   - Go to: https://search.google.com/search-console
   - Select your property (theprofitplatform.com.au)
   - Settings → Users and permissions
   - Click "Add user"
   - Enter the service account email (looks like: `name@project.iam.gserviceaccount.com`)
   - Permission: "Full" or "Restricted"
   - Click "Add"

7. **Save Credentials**
   ```bash
   # Save the downloaded JSON file as:
   automation/config/gsc-credentials.json
   ```

8. **Test It**
   ```bash
   npm run automation:rank-track
   ```

---

### Option 2: Use DataForSEO (Paid Alternative)

If Google Search Console setup is too complex, use DataForSEO:

1. Sign up: https://dataforseo.com/
2. Get API credentials
3. Use their rank tracking endpoint
4. ~$50/month for moderate usage

---

## Why Your API Key Won't Work

The API key `AIzaSyBaEI319a5_NwxGnhjHp5K8piQSpw6rK40` appears to be:
- A generic Google API key (possibly for Maps, YouTube, etc.)
- NOT a Search Console credential

**Search Console API requires:**
- Service Account (JSON file) with proper permissions
- OR OAuth2 flow (not suitable for automation)

**API keys cannot access:**
- Search Console data (requires authentication)
- User-specific data
- Private analytics

---

## Quick Check: What Type of Key Do You Have?

Run this to check:
```bash
# If it's a service account JSON, it will have this structure:
cat automation/config/gsc-credentials.json | grep -E "type|client_email|project_id"
```

**Expected output:**
```json
"type": "service_account",
"project_id": "your-project-123456",
"private_key_id": "abc123...",
"client_email": "rank-tracker@your-project.iam.gserviceaccount.com",
```

---

## Current Rank Tracker Behavior

**Without proper credentials:**
- Returns dummy/placeholder data
- Shows message: "Manual tracking required - GSC not configured"
- Generates reports with blank ranking data

**With proper credentials:**
- Fetches REAL ranking data from Google
- Tracks 20+ configured keywords
- Generates HTML + CSV reports weekly
- Shows historical trends

---

## Next Steps

**Choose one:**

**A) Set up Service Account (recommended - free)**
   - Follow steps 1-8 above
   - Takes ~10 minutes
   - One-time setup

**B) Use alternative rank tracker**
   - DataForSEO: Professional API ($50/mo)
   - SERPWatcher: Manual tool (free tier available)
   - Google Search Console manually (free but manual)

**C) Skip for now**
   - Focus on other automation (suburb pages working great!)
   - Come back to this later

---

## What Works NOW (No GSC Needed)

These automations are already working:
1. ✅ Suburb page generator (just generated 6 new pages!)
2. ✅ Blog post generator (25+ posts created)
3. ✅ Hero image system (28 posts updated)
4. ✅ GBP post generator (content creation works)

Focus on these first if GSC setup is blocking you!
