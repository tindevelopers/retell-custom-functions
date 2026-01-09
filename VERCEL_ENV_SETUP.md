# Vercel Environment Variables Setup

## ⚙️ Monorepo Configuration

Since this is now a Turborepo monorepo, you need to configure Vercel to build from the `apps/frontend` directory:

1. Go to [Vercel Dashboard](https://vercel.com/tindeveloper/retell-frontend-adminpanel/settings)
2. Navigate to **Settings** → **General**
3. Under **Root Directory**, set it to: `apps/frontend`
4. Save the changes

Alternatively, if you're using the Vercel CLI:
```bash
cd apps/frontend
npx vercel link
# Follow prompts to link to existing project
```

## ✅ Already Added

The following environment variables have been added to all environments (Production, Preview, Development):

- ✅ `ADMIN_SHARED_SECRET` - Already existed
- ✅ `NEXT_PUBLIC_API_BASE_URL` - Already existed  
- ✅ `NEXTAUTH_SECRET` - Generated and added: `KkTcppB81tbdzf6eZzh07hnkebywfECPeBQv47jt3fc=`
- ✅ `NEXTAUTH_URL` - Added: `https://frontend-tindeveloper.vercel.app`

## ⚠️ Still Need to Add

You need to add these environment variables manually in Vercel:

### 1. Google OAuth Credentials

**GOOGLE_CLIENT_ID** and **GOOGLE_CLIENT_SECRET**

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials?project=pet-store-direct)
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: "Web application"
4. Authorized redirect URIs:
   - `https://frontend-tindeveloper.vercel.app/api/auth/callback/google`
   - `https://retell-frontend-adminpanel-*.vercel.app/api/auth/callback/google` (for preview)
5. Copy the Client ID and Client Secret
6. Add to Vercel:
   ```bash
   cd apps/frontend
   echo "YOUR_CLIENT_ID" | npx vercel env add GOOGLE_CLIENT_ID production preview development
   echo "YOUR_CLIENT_SECRET" | npx vercel env add GOOGLE_CLIENT_SECRET production preview development
   ```

### 2. Firebase Admin SDK Service Account

**GOOGLE_APPLICATION_CREDENTIALS_JSON**

1. Go to [Firebase Console](https://console.firebase.google.com/project/pet-store-direct/settings/serviceaccounts/adminsdk)
2. Click "Generate New Private Key"
3. Download the JSON file
4. Copy the entire JSON content as a single-line string
5. Add to Vercel:
   ```bash
   cd apps/frontend
   echo '{"type":"service_account","project_id":"pet-store-direct",...}' | npx vercel env add GOOGLE_APPLICATION_CREDENTIALS_JSON production preview development
   ```

   **OR** use the Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add `GOOGLE_APPLICATION_CREDENTIALS_JSON`
   - Paste the JSON as a single-line string
   - Select all environments

## Quick Add Commands

Once you have the values, run:

```bash
cd apps/frontend

# Google OAuth
echo "YOUR_GOOGLE_CLIENT_ID" | npx vercel env add GOOGLE_CLIENT_ID production preview development
echo "YOUR_GOOGLE_CLIENT_SECRET" | npx vercel env add GOOGLE_CLIENT_SECRET production preview development

# Firebase Service Account (as single-line JSON)
cat firebase-service-account.json | jq -c . | npx vercel env add GOOGLE_APPLICATION_CREDENTIALS_JSON production preview development
```

## Verify Setup

Check all environment variables:
```bash
cd apps/frontend
npx vercel env ls
```

## After Adding Missing Variables

Redeploy the frontend:
```bash
cd apps/frontend
npx vercel --prod
```

