## Retell Custom Functions Monorepo

This is a Turborepo monorepo containing the admin frontend and multiple custom function backends.

### Structure
- `apps/frontend`: Next.js admin UI
- `apps/backend`: Transfer out-of-hours Cloud Run backend
- `packages/*`: (future) shared packages for types, UI, and tooling
- `docs/`: Documentation and templates (future)

### Scripts
- `turbo dev` – run dev tasks in parallel
- `turbo build` – build all apps
- `turbo lint` – lint all apps

### Workspace
Defined via `pnpm-workspace.yaml` and `turbo.json` for task orchestration.

### Notes
- Environment variables remain app-specific under `apps/frontend` and `apps/backend`.
- Seed script lives under `apps/frontend/scripts/seed.js`.
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

