# Sanad — Saudi National Health Infrastructure

## Overview

Sanad is a national digital health platform — the "digital brain" of the Saudi healthcare sector. It links all medical records for citizens and residents via their national ID and uses AI to prevent medical errors and save lives.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (Tailwind CSS, Framer Motion, Recharts, date-fns)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild

## Structure

```
artifacts/
  sanad/          → React frontend (previewPath: /)
  api-server/     → Express backend (previewPath: /api)
lib/
  api-spec/       → OpenAPI 3.1 spec + Orval config
  api-client-react/ → Generated React Query hooks
  api-zod/        → Generated Zod schemas
  db/             → Drizzle ORM schema + DB connection
scripts/
  src/seed.ts     → Demo data seeder (50 patients)
```

## Application Modules

### Frontend Pages (artifacts/sanad/src/pages/)
- **home.tsx** — Role selection: Emergency, Physician, Citizen, Admin
- **emergency.tsx** — Instant patient lookup by National ID for first responders
- **doctor.tsx** — Full physician dashboard: patient history, medications, labs, AI risk analysis, drug interaction checker
- **citizen.tsx** — Personal health dashboard for patients
- **admin.tsx** — Ministry analytics: population health, charts, system stats

### Backend Routes (artifacts/api-server/src/routes/)
- **patients.ts** — CRUD, search, full patient detail with all relations
- **emergency.ts** — Ultra-fast emergency lookup (critical data only)
- **medications.ts** — Prescribing with real-time AI drug interaction check
- **visits.ts** — Visit history
- **lab_results.ts** — Lab results with critical alert auto-creation
- **alerts.ts** — Patient alerts system
- **ai.ts** — Drug interaction check + risk score calculation
- **admin.ts** — System stats + population health analytics

### AI Engine (artifacts/api-server/src/lib/ai-engine.ts)
- **Drug Interaction Checker** — Real database of 50+ known drug interactions (warfarin, aspirin, metformin, statins, etc.) with severity levels and recommendations
- **Risk Score Calculator** — Multi-factor scoring (age, chronic conditions, polypharmacy, abnormal labs, visit frequency) → 0-100 score + risk level (low/medium/high/critical)

### Database Schema (lib/db/src/schema/)
- **patients** — 50 demo patients with Saudi national IDs, blood types, allergies, conditions
- **medications** — Active prescriptions with drug names, dosages, prescribers, hospitals
- **visits** — Hospital visit history with diagnosis and visit type
- **lab_results** — Blood tests, imaging results with normal/abnormal/critical status
- **alerts** — Drug interaction, critical lab, risk score, and predictive alerts

## Key Demo Data

For demonstration, use these national IDs:
- `1000000001` — Mohammed Al-Qahtani (Hypertension + Diabetes + CAD, Risk: 65)
- `1000000003` — Khalid Al-Rashidi (Heart Failure + AFib + CKD — CRITICAL warfarin+amiodarone interaction alert)
- `1000000005` — Abdullah Al-Dosari (COPD + Diabetes + CKD, Risk: 92)
- `1000000010` — Maryam Al-Anzi (Type 1 Diabetes + CKD + Hypo, Risk: 78)
- `1000000023` — Yousef Al-Otaibi (Heart Failure + COPD + Diabetes, Risk: 95)
- `1000000004` — Nora Al-Shehri (Young, healthy — Risk: 8)

## Commands

```bash
# Run codegen after OpenAPI spec changes
pnpm --filter @workspace/api-spec run codegen

# Push database schema changes
pnpm --filter @workspace/db run push

# Seed demo data
pnpm --filter @workspace/scripts run seed

# Typecheck all packages
pnpm run typecheck
```

## Architecture Notes

- All content is in English only
- API base path: `/api`
- Frontend served at `/` (root)
- Drug interaction engine covers: warfarin, aspirin, metformin, lisinopril, simvastatin, amiodarone, metoprolol, clopidogrel, SSRIs, fluoroquinolones, and more
- Risk score factors: age, chronic conditions, polypharmacy (5+ drugs), multiple allergies, abnormal lab results, hospitalization frequency
