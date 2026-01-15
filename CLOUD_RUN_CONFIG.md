# Cloud Run Service Configuration

## Service Details
- **Service Name**: `out-of-office-transfer`
- **Region**: `us-central1`
- **URL**: `https://out-of-office-transfer-880489367524.us-central1.run.app`
- **Project ID**: `880489367524`

## Required Environment Variables

Based on the code in `apps/backend/src/env.ts`, the service requires:

### Required Variables:
1. **`RETELL_API_KEY`** 
   - Used for authenticating OUTGOING calls to Retell API
   - Format: `key_...` (e.g., `key_9173a3b696bb2ce2d50071e5dcdb`)

2. **`GCS_BUCKET`**
   - Google Cloud Storage bucket name for storing configurations
   - Example: `pet-store-direct-retell-configs`

3. **`ADMIN_SHARED_SECRET`**
   - Bearer token for admin endpoints (`/admin/*`)
   - Used by frontend to authenticate admin API calls

### Optional Variables:
4. **`RETELL_SHARED_SECRET`** ⚠️ **CURRENTLY CONFIGURED**
   - Used to authenticate INCOMING requests FROM Retell
   - If set, all requests to `/retell/transfer` must include: `Authorization: Bearer <RETELL_SHARED_SECRET>`
   - **This is why we're getting 401 Unauthorized** - it's set but we don't know the value

5. **`RETELL_API_BASE`**
   - Default: `https://api.retellai.com`

6. **`CORS_ORIGIN`**
   - Frontend URL for CORS (e.g., `https://your-frontend.vercel.app`)

7. **`SERVICE_NAME`**
   - Default: `retell-functions`

8. **`PORT`**
   - Default: `8080`

## How to Check Current Configuration

### Option 1: Using gcloud CLI
```bash
gcloud run services describe out-of-office-transfer \
  --region=us-central1 \
  --format="get(spec.template.spec.containers[0].env)"
```

Or to see all details:
```bash
gcloud run services describe out-of-office-transfer \
  --region=us-central1 \
  --format="yaml"
```

### Option 2: Using Google Cloud Console
1. Go to [Cloud Run Console](https://console.cloud.google.com/run)
2. Select project: `880489367524`
3. Click on service: `out-of-office-transfer`
4. Go to "Revisions and traffic" tab
5. Click on the latest revision
6. View "Environment variables" section

### Option 3: Using Cloud Run Admin API
```bash
curl -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  "https://run.googleapis.com/v1/projects/880489367524/locations/us-central1/services/out-of-office-transfer"
```

## How to Update Configuration

### Update Environment Variables:
```bash
gcloud run services update out-of-office-transfer \
  --region=us-central1 \
  --set-env-vars "RETELL_API_KEY=key_9173a3b696bb2ce2d50071e5dcdb,RETELL_SHARED_SECRET=your_secret_here,GCS_BUCKET=your_bucket,ADMIN_SHARED_SECRET=your_admin_secret"
```

### Remove RETELL_SHARED_SECRET (make auth optional):
```bash
gcloud run services update out-of-office-transfer \
  --region=us-central1 \
  --remove-env-vars RETELL_SHARED_SECRET
```

### Set RETELL_SHARED_SECRET to match API key:
```bash
gcloud run services update out-of-office-transfer \
  --region=us-central1 \
  --update-env-vars "RETELL_SHARED_SECRET=key_9173a3b696bb2ce2d50071e5dcdb"
```

## Current Issue

The endpoint is returning `401 Unauthorized` because:
- `RETELL_SHARED_SECRET` is configured on the service
- The value is unknown/doesn't match the API key provided
- All requests must include: `Authorization: Bearer <RETELL_SHARED_SECRET>`

## Testing After Configuration

Once you know or set the `RETELL_SHARED_SECRET`, test with:
```bash
curl -X POST "https://out-of-office-transfer-880489367524.us-central1.run.app/retell/transfer" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <RETELL_SHARED_SECRET>" \
  -d '{
    "call_id": "test-call-123",
    "project_id": "org_P5F0bnCrRcdlNtZk",
    "function_id": "RETELL_TRANSFER_WEEKDAYS"
  }'
```

## Deployment Command (from README)

The service was likely deployed using:
```bash
gcloud run deploy out-of-office-transfer \
  --image gcr.io/880489367524/retell-functions:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "RETELL_API_KEY=...,GCS_BUCKET=...,ADMIN_SHARED_SECRET=...,RETELL_SHARED_SECRET=...,CORS_ORIGIN=..."
```
