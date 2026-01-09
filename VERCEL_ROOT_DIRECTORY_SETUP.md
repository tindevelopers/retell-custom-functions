# Vercel Root Directory Configuration

## Current Status

**Project:** `retell-frontend-adminpanel`  
**Current Root Directory:** `.` (root of repository)  
**Required Root Directory:** `apps/frontend`

## How to Update Root Directory

### Option 1: Via Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/tindeveloper/retell-frontend-adminpanel/settings/general
2. Scroll down to **Root Directory**
3. Click **Edit**
4. Enter: `apps/frontend`
5. Click **Save**

### Option 2: Via Vercel CLI (if you have project admin access)

```bash
# This requires project admin permissions
cd apps/frontend
npx vercel project update retell-frontend-adminpanel --root-directory apps/frontend
```

**Note:** The CLI command may not be available in all Vercel CLI versions. Use the dashboard method if CLI fails.

## Verify Configuration

After updating, verify the setting:

```bash
cd apps/frontend
npx vercel project inspect retell-frontend-adminpanel | grep "Root Directory"
```

Should show: `Root Directory		apps/frontend`

## Current Environment Variables Status

✅ **Already Configured:**
- `GOOGLE_APPLICATION_CREDENTIALS_JSON` (Production, Preview, Development)
- `NEXTAUTH_SECRET` (Production, Preview, Development)
- `NEXTAUTH_URL` (Production, Preview, Development)
- `ADMIN_SHARED_SECRET` (Production, Preview, Development)
- `NEXT_PUBLIC_API_BASE_URL` (Production, Preview, Development)

⚠️ **Still Needed:**
- `GOOGLE_CLIENT_ID` (for OAuth)
- `GOOGLE_CLIENT_SECRET` (for OAuth)

See `create-oauth-credentials.sh` for OAuth setup instructions.

## After Updating Root Directory

Once the root directory is updated:

1. **Redeploy** the project:
   ```bash
   cd apps/frontend
   npx vercel --prod
   ```

2. The build should now work correctly from the `apps/frontend` directory.

