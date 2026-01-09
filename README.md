# Retell Custom Functions (TS + Cloud Run + Vercel)

This repository contains:
- **Backend** (`backend/`): TypeScript + Hono service on Google Cloud Run
- **Frontend** (`frontend/`): Next.js admin UI on Vercel for editing configs

Configs are stored in **Google Cloud Storage** as JSON and protected with optimistic concurrency (`ifGenerationMatch`) to prevent admins overwriting each other.

## Quick start
1) See `backend/README.md` for API and deployment.
2) See `frontend/README.md` for UI usage and deployment.

## Important endpoints
- Retell: `POST /retell/transfer` (Cloud Run)
- Admin: `GET/PUT /admin/projects/:projectId/config` (Cloud Run)
- UI proxy: `/api/config/[projectId]` (Vercel) -> forwards to Cloud Run with admin secret

## Auth
- Retell endpoint: optional `RETELL_SHARED_SECRET` bearer.
- Admin endpoints: `ADMIN_SHARED_SECRET` bearer (frontend proxies server-side).

## Deployment targets
- Backend: Cloud Run container
- Frontend: Vercel

