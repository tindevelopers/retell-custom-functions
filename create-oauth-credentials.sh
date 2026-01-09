#!/bin/bash
# Script to help create OAuth credentials for Retell Admin UI

PROJECT_ID="pet-store-direct"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

echo "=========================================="
echo "Creating OAuth Credentials for Retell Admin"
echo "=========================================="
echo ""
echo "Step 1: Opening Google Cloud Console..."
echo "URL: https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
echo ""

# Try to open the URL
if command -v open &> /dev/null; then
    open "https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
elif command -v xdg-open &> /dev/null; then
    xdg-open "https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
fi

echo ""
echo "Step 2: In the Console:"
echo "  1. Click 'Create Credentials' → 'OAuth client ID'"
echo "  2. If prompted, configure OAuth consent screen first"
echo "  3. Application type: 'Web application'"
echo "  4. Name: 'Retell Admin UI'"
echo "  5. Authorized redirect URIs:"
echo "     - https://frontend-tindeveloper.vercel.app/api/auth/callback/google"
echo "     - https://retell-frontend-adminpanel-*.vercel.app/api/auth/callback/google"
echo "  6. Click 'Create'"
echo ""
echo "Step 3: Copy the Client ID and Client Secret"
echo ""
echo "Step 4: Add to Vercel:"
echo "  cd apps/frontend"
echo "  echo 'YOUR_CLIENT_ID' | npx vercel env add GOOGLE_CLIENT_ID production preview development"
echo "  echo 'YOUR_CLIENT_SECRET' | npx vercel env add GOOGLE_CLIENT_SECRET production preview development"
echo ""

