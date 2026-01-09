# Retell Functions Admin UI (Next.js on Vercel)

Simple admin UI to view/edit project configs stored in Google Cloud Storage with optimistic concurrency.

## Setup
```bash
cd frontend
npm install
npm run dev
```

Environment (see `env.example`):
- `NEXT_PUBLIC_API_BASE_URL` — Cloud Run backend base URL
- `ADMIN_SHARED_SECRET` — shared bearer token for backend admin endpoints (kept server-side in route handlers)

## How it works
- UI calls Next.js API routes (`/api/config/[projectId]`).
- API routes proxy to Cloud Run backend with `Authorization: Bearer ADMIN_SHARED_SECRET`.
- On save, backend enforces `ifGenerationMatch` to prevent overwrites; UI handles 409 by reloading latest.

## Pages
- `/` — intro
- `/projects/[projectId]` — JSON editor for the project config (up to ~10 functions).

