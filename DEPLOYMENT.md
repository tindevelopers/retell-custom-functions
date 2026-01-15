# Frontend Deployment Guide (Updated)

## Overview
The frontend is a Next.js application that should be deployed to Vercel.

## Changes Made
1. ✅ **Dynamic Function Loading**: Updated the client detail page to dynamically load functions from the config instead of hardcoding them
2. ✅ **Build Fix**: Fixed the login page to wrap `useSearchParams` in a Suspense boundary
3. ✅ **Vercel Configuration**: Created `vercel.json` for monorepo deployment

## Deployment Options

### Option 1: Vercel Git Integration (Recommended)
1. Connect your GitHub/GitLab/Bitbucket repository to Vercel
2. In Vercel dashboard:
   - Set **Root Directory** to `apps/frontend`
   - Set **Build Command** to `npm install && npm run build`
   - Set **Output Directory** to `.next`
   - Set **Install Command** to `npm install`
3. Add environment variables in Vercel:
   - `NEXT_PUBLIC_API_BASE_URL` - Your Cloud Run backend URL
   - `ADMIN_SHARED_SECRET` - Your admin shared secret
   - `NEXTAUTH_URL` - Your Vercel deployment URL
   - `NEXTAUTH_SECRET` - A random secret for NextAuth
   - Firebase Admin credentials (if using Firebase)
4. Deploy automatically on push to main/master branch

### Option 2: Vercel CLI
```bash
# Install Vercel CLI globally
npm i -g vercel

# Or use npx (no installation needed)
npx vercel

# Navigate to frontend directory
cd apps/frontend

# Deploy
vercel

# For production deployment
vercel --prod
```

## Environment Variables Required

### In Vercel Dashboard:
- `NEXT_PUBLIC_API_BASE_URL` - Cloud Run backend URL (e.g., `https://out-of-office-transfer-880489367524.us-central1.run.app`)
- `ADMIN_SHARED_SECRET` - Secret for backend admin endpoints
- `NEXTAUTH_URL` - Your Vercel app URL (e.g., `https://your-app.vercel.app`)
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`

### Firebase Admin (if using):
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

## Post-Deployment

After deployment:
1. Verify the frontend is accessible
2. Test login functionality
3. Verify functions are dynamically loaded from config
4. Test config editing and saving

## Troubleshooting

### Build Errors
- Ensure all environment variables are set in Vercel
- Check that the root directory is set to `apps/frontend`
- Verify Node.js version (should be 18+)

### Runtime Errors
- Check Vercel function logs
- Verify API routes are working
- Check that backend URL is correct and accessible
