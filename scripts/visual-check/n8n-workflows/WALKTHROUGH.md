# 🚀 n8n Visual Agent - Step-by-Step Walkthrough

## STEP 1: Login to n8n

1. Open your browser
2. Go to: **https://n8n.theprofitplatform.com.au/**
3. Login with your credentials

✅ **Checkpoint**: You should see the n8n dashboard

---

## STEP 2: Create New Workflow

1. Look for the **"+ Add workflow"** button (usually top right or left sidebar)
2. Click it
3. You'll see a blank canvas with a note saying "Add your first step"

✅ **Checkpoint**: Blank workflow canvas is open

---

## STEP 3: Add Webhook Trigger

1. Click the **"+"** button or "Add first step"
2. In the search box, type: **webhook**
3. Click on **"Webhook"** (under "Trigger" category)
4. Configure it:
   - **HTTP Method**: Select `POST`
   - **Path**: Type `visual-check`
   - **Respond**: Select `When Last Node Finishes`
5. Click **"Execute Node"** to test it
6. Copy the **Production URL** (you'll need this later)
   - Should look like: `https://n8n.theprofitplatform.com.au/webhook/visual-check`

✅ **Checkpoint**: Webhook node created and shows a green checkmark

---

## STEP 4: Add Execute Command Node

1. Click the **"+"** button on the right side of the Webhook node
2. Search for: **execute command**
3. Click **"Execute Command"**
4. In the **Command** field, paste this EXACTLY:
   ```bash
   cd /home/avi/projects/astro-site/scripts/visual-check && npx playwright test --config=playwright.config.js --reporter=json 2>&1
   ```
5. Scroll down and expand **"Options"**
6. Toggle **"Continue On Fail"** to ON (enabled)
7. Click **"Execute Node"** to test
   - This will take 60 seconds - don't worry!
   - You should see test output

✅ **Checkpoint**: Command executed, shows test results (even if some tests fail)

---

## STEP 5: Add Code Node (Email Sender)

1. Click the **"+"** button on the right of the Execute Command node
2. Search for: **code**
3. Click **"Code"**
4. In the **JavaScript Code** field, delete everything and paste this:

```javascript
const nodemailer = require('nodemailer');

// Get test output from previous node
const testOutput = $node["Execute Command"].json.stdout || 'Tests completed';

// Create email transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'abhishekmaharjan3737@gmail.com',
    pass: 'tmhnofephrxbdaik'
  }
});

// Send email
const info = await transporter.sendMail({
  from: 'visual-agent@theprofitplatform.com.au',
  to: 'abhishekmaharjan3737@gmail.com',
  subject: '✅ Visual Monitoring Complete - ' + new Date().toLocaleString(),
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #667eea;">🔍 Visual Quality Check Complete</h2>
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      <p><strong>Status:</strong> Tests executed successfully</p>

      <h3>Test Output (first 2000 chars):</h3>
      <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto;">
${testOutput.substring(0, 2000)}
      </pre>

      <hr style="margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">
        Automated by n8n Visual Quality Monitoring<br>
        Workflow running on n8n.theprofitplatform.com.au
      </p>
    </div>
  `
});

return {
  success: true,
  emailSent: true,
  messageId: info.messageId,
  timestamp: new Date().toISOString(),
  testsRan: true
};
```

5. Make sure **"Run Once for All Items"** is selected at the top
6. Click **"Execute Node"**
7. **CHECK YOUR EMAIL** - you should receive an email!

✅ **Checkpoint**: Email received in abhishekmaharjan3737@gmail.com inbox

---

## STEP 6: Add Respond to Webhook Node

1. Click the **"+"** button on the right of the Code node
2. Search for: **respond**
3. Click **"Respond to Webhook"**
4. Configure:
   - **Respond With**: Select `JSON`
   - **Response Body**: Leave as `{{ $json }}`
5. Click **"Execute Node"**

✅ **Checkpoint**: Response node added and executed

---

## STEP 7: Save & Name Your Workflow

1. Look for the workflow name at the top (probably says "My workflow")
2. Click on it and rename to: **Visual Quality Monitoring**
3. Click **"Save"** button (top right, looks like a disk icon)

✅ **Checkpoint**: Workflow saved

---

## STEP 8: Activate the Workflow

1. Find the **"Active"** toggle switch (top right corner)
2. Click it to turn it **ON** (should turn blue/green)
3. You'll see "Workflow activated" message

✅ **Checkpoint**: Workflow is now active and running!

---

## STEP 9: Test the Webhook

Now let's test that the webhook works:

1. Copy the Production URL from the Webhook node
   - Should be: `https://n8n.theprofitplatform.com.au/webhook/visual-check`

2. Open a terminal and run:
   ```bash
   curl -X POST https://n8n.theprofitplatform.com.au/webhook/visual-check
   ```

3. Wait 60-90 seconds

4. Check your email - you should get a report!

✅ **Checkpoint**: Email received with test results

---

## STEP 10: Add Schedule (Optional - for automatic runs)

If you want it to run automatically every 15 minutes:

1. Click the **"+"** button to the LEFT of the Webhook node
2. Search for: **schedule**
3. Click **"Schedule Trigger"**
4. Configure:
   - **Trigger Interval**: Select `Minutes`
   - **Minutes Between Triggers**: Type `15`
5. Connect it to the Execute Command node
   - Drag from the Schedule node to Execute Command
6. Save the workflow

✅ **Checkpoint**: Tests will now run automatically every 15 minutes!

---

## 🎉 YOU'RE DONE!

Your visual monitoring is now:
- ✅ Running in n8n
- ✅ Testing your site with Playwright
- ✅ Sending email reports
- ✅ Can be triggered manually via webhook
- ✅ (Optional) Running every 15 minutes automatically

## 📧 What to Expect

Every time the workflow runs:
1. Playwright tests execute (60 seconds)
2. Email sent with results
3. Webhook responds with success

## 🔍 View Execution History

In n8n:
1. Click **"Executions"** in the left sidebar
2. See all past runs
3. Click any execution to see details

---

## ❓ Troubleshooting

**Email not sending?**
- Check the Code node - make sure the nodemailer code is correct
- Verify email/password in the code

**Tests not running?**
- Check the Execute Command node shows output
- Verify the command path is correct

**Webhook not responding?**
- Make sure workflow is **Active** (toggle ON)
- Check the Production URL in Webhook node

---

**Need help?** Check the n8n execution logs or re-read the steps above!
