# Vercel GitHub Auto-Deployment Setup

## Current Status

**Repository:** `https://github.com/tindevelopers/retell-custom-functions`  
**Vercel Project:** `retell-frontend-adminpanel`  
**Root Directory:** `apps/frontend` ✅  
**Framework:** Next.js ✅

## Verify GitHub Integration

### Step 1: Check if GitHub is Connected

1. Go to: https://vercel.com/tindeveloper/retell-frontend-adminpanel/settings/git
2. Check if you see:
   - **Git Repository:** `tindevelopers/retell-custom-functions`
   - **Production Branch:** `main`
   - **Auto-deploy:** Enabled

### Step 2: Connect GitHub Repository (if not connected)

If the repository is **NOT** connected:

1. Go to: https://vercel.com/tindeveloper/retell-frontend-adminpanel/settings/git
2. Click **Connect Git Repository**
3. Select **GitHub**
4. Authorize Vercel to access your GitHub account (if prompted)
5. Search for: `tindevelopers/retell-custom-functions`
6. Click **Import**
7. Configure:
   - **Root Directory:** `apps/frontend`
   - **Framework Preset:** Next.js
   - **Production Branch:** `main`
8. Click **Deploy**

### Step 3: Verify Auto-Deploy Settings

After connecting, verify:

1. **Production Branch:** Should be `main`
2. **Auto-deploy:** Should be **Enabled** for:
   - Production (main branch)
   - Preview (all other branches)
3. **Root Directory:** Should be `apps/frontend`

### Step 4: Test Auto-Deployment

After connecting, test by:

1. Making a small change to any file
2. Committing and pushing to main:
   ```bash
   git add .
   git commit -m "test: trigger auto-deploy"
   git push origin main
   ```
3. Check Vercel dashboard - a new deployment should start automatically

## Manual Deployment (if auto-deploy doesn't work)

If auto-deploy isn't working, you can manually trigger:

```bash
cd apps/frontend
npx vercel --prod
```

Or from the repository root:

```bash
cd /path/to/transfer-out-of-hours
npx vercel --prod
```

## Troubleshooting

### Issue: Auto-deploy not triggering

**Possible causes:**
1. GitHub repository not connected
2. Wrong branch configured (should be `main`)
3. Root directory misconfigured
4. GitHub webhook not set up

**Solution:**
1. Check GitHub integration in Vercel settings
2. Verify webhook in GitHub: `https://github.com/tindevelopers/retell-custom-functions/settings/hooks`
3. Should see a webhook pointing to `api.vercel.com`

### Issue: Build fails

**Check:**
1. Root directory is `apps/frontend` ✅
2. Framework is Next.js ✅
3. Environment variables are set ✅
4. Node.js version is 24.x ✅

## Current Configuration Summary

✅ **Root Directory:** `apps/frontend`  
✅ **Framework:** Next.js  
✅ **Build Command:** `npm run build` (auto-detected)  
✅ **Output Directory:** `.next` (auto-detected)  
✅ **Install Command:** `npm install` (auto-detected)  
⚠️ **GitHub Integration:** Needs verification  
⚠️ **Auto-Deploy:** Needs verification

