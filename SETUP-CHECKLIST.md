# ✅ GMB Automation Setup Checklist

**Copy this and check off as you go!**

---

## 🎯 Part 1: n8n Setup (10 min)

### Step 1: Import Workflow
- [ ] Open n8n: `http://your-vps-ip:5678`
- [ ] Click: **Workflows** → **+** → **Import from File**
- [ ] Upload: `n8n-gmb-workflow.json`
- [ ] Click: **Import**
- [ ] ✅ Workflow appears in list

### Step 2: Connect Google
- [ ] Click: **Create GMB Post** node (purple)
- [ ] Click: **Select Credential** → **Create New**
- [ ] Click: **Sign in with Google**
- [ ] Login with your Google account
- [ ] Click: **Allow**
- [ ] Click: **Save**
- [ ] ✅ Shows "Connected"

### Step 3: Get Webhook URL
- [ ] Click: **Webhook** node (first node)
- [ ] Find: **Production URL** in right panel
- [ ] Copy the URL: `_______________________`
- [ ] Save it here: `_______________________`
- [ ] ✅ URL copied

### Step 4: Activate
- [ ] Toggle switch at top right: **Active** ✅
- [ ] Shows green "Active" status
- [ ] ✅ Workflow is active

### Step 5: Test
```bash
# Run this:
export N8N_WEBHOOK_URL=http://your-vps-ip:5678/webhook/gmb-posts
npm run automation:gmb-test-n8n
```
- [ ] Command runs successfully
- [ ] n8n shows execution in **Executions** tab
- [ ] Test post appears in GMB (check in 1-2 min)
- [ ] ✅ Test successful!

---

## 🚀 Part 2: GitHub Connection (5 min)

### Step 1: Add Secret
- [ ] Go to: `https://github.com/YOUR_USERNAME/tpp`
- [ ] Click: **Settings** → **Secrets and variables** → **Actions**
- [ ] Click: **New repository secret**
- [ ] Name: `N8N_WEBHOOK_URL`
- [ ] Value: `http://your-vps-ip:5678/webhook/gmb-posts`
- [ ] Click: **Add secret**
- [ ] ✅ Secret added

### Step 2: Test Full Flow
- [ ] Go to: **Actions** tab
- [ ] Click: **Weekly GMB Post Generation**
- [ ] Click: **Run workflow** → **Run workflow**
- [ ] Wait 2-3 minutes
- [ ] Check: Workflow shows green ✅
- [ ] Check: n8n shows 12 executions
- [ ] ✅ Full automation working!

---

## 📤 Part 3: Send Existing Posts (2 min)

```bash
# Send your 12 ready posts:
npm run automation:gmb-send-n8n automation/generated/gbp-posts/gbp-posts-2025-10-21.json
```
- [ ] Command runs successfully
- [ ] n8n shows 12 executions
- [ ] Posts appear in GMB (or scheduled)
- [ ] ✅ Posts sent!

---

## 🎉 You're Done!

### Verify Everything Works:
- [ ] n8n workflow is **Active**
- [ ] Google is **Connected**
- [ ] Webhook URL is saved
- [ ] GitHub secret is added
- [ ] Test post worked
- [ ] Real posts sent

### Your Automation:
- [ ] Posts generate every Sunday (automatic)
- [ ] Posts send to n8n (automatic)
- [ ] n8n posts to GMB (automatic)
- [ ] **You do: NOTHING!** 🎊

---

## 📞 Quick Reference

**Your Details:**
```
n8n URL: http://________________:5678
Webhook: http://________________:5678/webhook/gmb-posts
GitHub Repo: https://github.com/________________/tpp
```

**Commands:**
```bash
# Test connection
npm run automation:gmb-test-n8n

# Send posts
npm run automation:gmb-send-n8n

# Generate posts
npm run automation:gbp-posts
```

**Check Status:**
- n8n executions: http://your-vps:5678 → Executions
- GitHub Actions: https://github.com/YOUR_USER/tpp/actions
- GMB posts: https://business.google.com

---

## 🆘 If Something Breaks

1. **n8n not responding?**
   ```bash
   # Check if running:
   curl http://your-vps:5678/healthz

   # Start if needed:
   docker start n8n
   ```

2. **Webhook fails?**
   - Check workflow is **Active** in n8n
   - Check webhook URL is correct
   - Test with: `npm run automation:gmb-test-n8n`

3. **Google auth fails?**
   - In n8n: Click credential → **Reconnect**
   - Re-authenticate

4. **Posts not appearing?**
   - Check n8n Executions for errors
   - Verify Google credentials
   - Check GMB scheduled posts

---

**Stuck?** Tell me which checkbox you're on and I'll help! 🚀
