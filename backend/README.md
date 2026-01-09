# Retell Functions Backend (TypeScript + Hono on Cloud Run)

Lightweight HTTP service for Retell.ai custom functions with:
- `/retell/transfer` — time-gated transfer decisions + optional Retell transfer call
- `/admin/projects/:projectId/config` — config read/write with GCS optimistic concurrency

## Setup
```bash
cd backend
npm install
npm run dev
```

Environment (see `env.example`):
- `RETELL_API_KEY` (required)
- `RETELL_API_BASE` (default: https://api.retellai.com)
- `RETELL_SHARED_SECRET` (optional, auth for Retell calls)
- `GCS_BUCKET` (required)
- `ADMIN_SHARED_SECRET` (required, bearer for admin endpoints)
- `CORS_ORIGIN` (optional, allow frontend URL)
- `SERVICE_NAME`, `PORT`

## Running locally
```
npm run dev
```
Service listens on `PORT` (default 8080).

## Deploy to Cloud Run
```bash
docker build -t gcr.io/PROJECT_ID/retell-functions:latest .
docker push gcr.io/PROJECT_ID/retell-functions:latest
gcloud run deploy retell-functions \
  --image gcr.io/PROJECT_ID/retell-functions:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "RETELL_API_KEY=...,GCS_BUCKET=...,ADMIN_SHARED_SECRET=...,CORS_ORIGIN=https://your-frontend.vercel.app"
```

## Admin API (used by frontend)
- `GET /admin/projects/:projectId/config` → `{ config, generation }`
- `PUT /admin/projects/:projectId/config` body `{ config, expected_generation? }`
  - On generation mismatch → `409` with `{ latest_config, generation }`

## Retell endpoint
- `POST /retell/transfer` body `{ call_id, project_id, function_id }`
- Response:
  - Allowed: `{ transfer_allowed: true, transfer_attempted: true, message }`
  - Denied: `{ transfer_allowed: false, transfer_attempted: false, message, reason }`
  - Errors return `{ error: true, message }`

