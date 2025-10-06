# Quick Setup Guide - GA4 & Search Console

## ⚠️ FIRST: Revoke the API Key You Shared

You accidentally shared an API key publicly. Please revoke it:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find: `AIzaSyBJ1Xmg5WHafq7oDkM8qBBUSmdmnquiJkY`
3. Click: Delete

---

## Part 1: Create Service Account (5 minutes)

### 1.1 Go to Google Cloud Console
🔗 https://console.cloud.google.com

### 1.2 Create/Select Project
- Click project dropdown (top left)
- Create new project: "TPP Blog Analytics" (or use existing)

### 1.3 Enable APIs
Go to: **APIs & Services → Library**

Search and enable:
1. ✅ **Google Analytics Data API**
2. ✅ **Google Search Console API**

### 1.4 Create Service Account
Go to: **APIs & Services → Credentials**

1. Click: **Create Credentials** → **Service Account**
2. Fill in:
   - **Service account name:** `blog-analytics`
   - **Service account ID:** `blog-analytics` (auto-fills)
   - **Description:** "Read blog performance data"
3. Click: **Create and Continue**
4. **Grant this service account access to project:**
   - Role: **Viewer**
   - Click: **Continue**
5. Click: **Done**

### 1.5 Download JSON Key
1. Click on the service account you just created (`blog-analytics@...`)
2. Go to **Keys** tab
3. Click: **Add Key** → **Create new key**
4. Select: **JSON**
5. Click: **Create**
6. **Save the downloaded file** (e.g., `blog-analytics-key.json`)

⚠️ **Keep this file safe!** It's like a password.

---

## Part 2: GA4 Setup (3 minutes)

### 2.1 Get Your Property ID
1. Go to: https://analytics.google.com
2. Select your property (The Profit Platform)
3. Click: **Admin** (bottom left gear icon)
4. Click: **Property Settings**
5. Copy the **Property ID** (number like `123456789`)

📝 **Write it down:** `properties/YOUR_NUMBER_HERE`

### 2.2 Grant Service Account Access
Still in GA4:

1. **Admin** → **Property Access Management**
2. Click: **+** (Add users) top right
3. Paste service account email:
   - Open your JSON key file
   - Copy the `client_email` value (looks like: `blog-analytics@yourproject.iam.gserviceaccount.com`)
4. Select role: **Viewer**
5. Uncheck: "Notify this user by email"
6. Click: **Add**

✅ **Done with GA4!**

---

## Part 3: Search Console Setup (3 minutes)

### 3.1 Verify Your Site URL
1. Go to: https://search.google.com/search-console
2. Select your property: `theprofitplatform.com.au`
3. Note the exact URL format (with or without www, http/https)

📝 **Write it down:** `https://theprofitplatform.com.au` (no trailing slash)

### 3.2 Grant Service Account Access
1. Click: **Settings** (left sidebar)
2. Click: **Users and permissions**
3. Click: **Add user**
4. Paste service account email (same as GA4 step)
5. Permission: **Full** (or Restricted)
6. Click: **Add**

✅ **Done with Search Console!**

---

## Part 4: Configure .env.local (2 minutes)

Open or create: `.env.local` in your project root

Add these lines (replace with your values):

```bash
# Google Analytics 4
GA4_PROPERTY_ID="properties/YOUR_PROPERTY_ID_HERE"
GA4_SERVICE_ACCOUNT_KEY="/full/path/to/blog-analytics-key.json"

# Google Search Console
SEARCH_CONSOLE_SITE_URL="https://theprofitplatform.com.au"
SEARCH_CONSOLE_SERVICE_ACCOUNT_KEY="/full/path/to/blog-analytics-key.json"
```

### Example:
```bash
GA4_PROPERTY_ID="properties/123456789"
GA4_SERVICE_ACCOUNT_KEY="/Users/abhis/credentials/blog-analytics-key.json"
SEARCH_CONSOLE_SITE_URL="https://theprofitplatform.com.au"
SEARCH_CONSOLE_SERVICE_ACCOUNT_KEY="/Users/abhis/credentials/blog-analytics-key.json"
```

💡 **Tip:** You use the **same JSON key file** for both GA4 and Search Console.

---

## Part 5: Test It! (1 minute)

Run:
```bash
npm run blog:performance
```

### ✅ Success looks like:
```
📊 Fetching GA4 Analytics Data...
   ✅ Retrieved analytics for X posts

📈 GA4 Summary (last 30 days):
   Total pageviews: 1,234
   Average engagement rate: 42.5%

🔍 Fetching Search Console Data...
   ✅ Retrieved search data for X posts

🔍 Search Console Summary (last 30 days):
   Total clicks: 245
   Total impressions: 12,450
```

### ❌ If you see errors:

**Error: "Invalid JWT"**
- Check the JSON key file path is correct
- Make sure the path has no typos

**Error: "403 Forbidden"**
- Service account not added to GA4/Search Console
- Double-check you added the correct email

**Error: "Property not found"**
- Check GA4_PROPERTY_ID format: `properties/123456789`
- Make sure you're using Property ID, not View ID

---

## Quick Checklist

- [ ] Created service account in Google Cloud
- [ ] Downloaded JSON key file
- [ ] Enabled "Google Analytics Data API"
- [ ] Enabled "Google Search Console API"
- [ ] Got GA4 Property ID (format: `properties/123456789`)
- [ ] Added service account to GA4 (as Viewer)
- [ ] Added service account to Search Console (as Full/Restricted)
- [ ] Created/updated `.env.local` with all 4 variables
- [ ] Ran `npm run blog:performance` successfully

---

## Need Help?

### Can't find service account email?
Open your JSON key file, look for:
```json
{
  "client_email": "blog-analytics@yourproject.iam.gserviceaccount.com"
}
```
That's the email to add to GA4 and Search Console.

### Don't see data in the report?
- Wait 24-48 hours (new data takes time)
- Check you have blog posts published
- Verify GA4 is tracking your site
- Verify Search Console has indexed your pages

### JSON key file security
- ❌ Don't commit to Git
- ❌ Don't share publicly
- ✅ Store outside project folder
- ✅ Add `.env.local` to `.gitignore`

---

**Estimated Time:** 15 minutes total
**What You Get:** Real traffic and search data in your performance reports!
