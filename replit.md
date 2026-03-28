# Sanad — National Health Intelligence Platform

## Overview
Sanad is a national digital health platform for the Saudi healthcare sector. It connects medical records via National IDs and uses an AI engine to prevent medical errors, compute patient risk scores, generate clinical predictions, and surface actionable recommendations across citizen, doctor, emergency, and admin roles.

## Architecture

### Monorepo Structure (pnpm workspaces)
```
artifacts/
  sanad/          — React 19 + Vite frontend (port 26138, BASE_PATH=/)
  api-server/     — Express 5 backend API (port 8080, BASE_PATH=/api)
  mockup-sandbox/ — Vite sandbox for UI prototyping
lib/
  db/             — Drizzle ORM schema + PostgreSQL connection
  api-spec/       — OpenAPI 3.1 spec (openapi.yaml) + Orval config
  api-zod/        — Zod schemas generated from OpenAPI spec
  api-client-react/ — TanStack Query hooks generated from OpenAPI spec
scripts/
  src/seed.ts     — Database seeder (50 demo patients)
```

### Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion, Recharts, Radix UI
- **Backend**: Express 5, TypeScript, pino logging, esbuild
- **Database**: PostgreSQL + Drizzle ORM
- **API Generation**: Orval (OpenAPI → React Query hooks + Zod schemas)
- **Runtime**: Node 24, pnpm workspaces

## Workflow
The "Start application" workflow runs:
```
PORT=8080 pnpm --filter @workspace/api-server run dev & PORT=26138 BASE_PATH=/ pnpm --filter @workspace/sanad run dev
```

## API Routing
Replit proxies requests:
- `/` → sanad frontend on port 26138
- `/api/...` → api-server on port 8080

## Database
- PostgreSQL via `DATABASE_URL` environment variable
- Schema pushed with: `pnpm --filter @workspace/db run push`
- Seed: `pnpm --filter @workspace/scripts run seed`
- Tables: patients, medications, visits, lab_results, alerts

## AI Engine (`artifacts/api-server/src/lib/ai-engine.ts`)
- **Drug Interaction Check**: 50+ known interactions with severity levels
- **Risk Score Calculator**: 0-100 score from age, conditions, polypharmacy, labs, visits
- **Prediction Engine**: Deterioration, pattern, complication, adherence predictions
- **Clinical Actions Generator**: Immediate DO_NOT_GIVE, MONITOR, URGENT_REVIEW actions for emergency
- **Citizen Health Score**: Client-side computed wellness score with grade A-F

## Pages
- **Home** (`/`) — Role selector (Citizen, Doctor, Emergency, Admin)
- **Citizen** (`/citizen`) — Health Score + AI recommendations + records
- **Doctor** (`/doctor`) — Clinical dashboard with timeline, labs, AI predictions, prescribing
- **Emergency** (`/emergency`) — High-speed patient lookup with critical actions
- **Admin** (`/admin`) — Ministry analytics: risk distribution, regional stats, population health

## Demo Patient IDs
1000000001, 1000000003, 1000000004, 1000000005, 1000000010, 1000000023

## Replit Configuration
- Frontend artifact: `artifacts/sanad/.replit-artifact/artifact.toml` (port 26138)
- API artifact: `artifacts/api-server/.replit-artifact/artifact.toml` (port 8080)
- Environment secrets needed: `DATABASE_URL`
