# PROGRESS.md — Build Progress Tracker

> هذا الملف يُحدَّث بواسطة Claude Code بعد كل مهمة. لا تعدّله يدوياً إلا في حالات استثنائية.

---

## 📍 Current State

**Phase:** Phase 1 — Foundation
**Current Task:** 1.3 — Tenant Context Middleware + RLS Wiring (next)
**Last Updated:** 2026-05-01

---

## 📊 Progress Overview

```
Phase 0 — Setup:                    [██████] 6/6 ✅
Phase 1 — Foundation:               [██░░░░░░░░░░░░] 2/14
Phase 2 — Core Operations:          [░░░░░░░░░░░░░░░░░░] 0/18
Phase 3 — Creative & Collaboration: [░░░░░░░░░░░░░░░░░░░░░░] 0/22
Phase 4 — SaaS Layer:               [░░░░░░░░░░░░] 0/12

TOTAL:                              [████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 8/72
```

---

## ✅ Completed Tasks

### Task 1.2 — Authentication Tier 2 (Tenant Users) (2026-05-01)

- [x] Schema migration `add_user_auth_fields` — adds `failed_login_attempts`, `account_locked_until`, `last_login_at`, `preferred_language`, `timezone` to `users`
- [x] JWT keys: RSA-2048 keypair generated for Tier 2 (TENANT), base64-encoded in `.env`. Reusable script `scripts/generate-jwt-keys.sh` for additional tiers
- [x] Argon2id password hashing (memory=64MB, t=3, p=4) — per ADR-002
- [x] JWT RS256 access tokens (15min, payload: sub/companyId/tier/jti/iss/aud) via `jose` library
- [x] Refresh tokens: 256-bit random, stored as SHA-256 hash in `sessions` table; rotated on each `/refresh` (old session marked `revoked_at`)
- [x] 7 endpoints: signup, verify-email, login, refresh, logout, forgot-password, reset-password — all with Zod validation
- [x] Account lockout: 5 failed attempts → `account_locked_until = now + 15min`; HTTP 423 LOCKED returned
- [x] Email service dual-driver: nodemailer→MailHog in dev, Resend in prod (env-driven)
- [x] 4 email templates (verify-email + reset-password, AR + EN), bilingual subject lines, RTL/LTR HTML
- [x] Verification + reset tokens stored in Redis with TTL (24h verify, 1h reset) — consume-once pattern
- [x] Audit logging: 7 actions (signup, login, login_failed, logout, email_verified, password_reset_requested, password_reset)
- [x] RFC 7807 Problem Details on errors (already from Task 0.4 filter)
- [x] `RedisModule` (global) + `RedisService` with managed lifecycle
- [x] Zod-based `ZodValidationPipe` for body validation

**Verified end-to-end (curl smoke test):**

- `POST /auth/signup` → 201, company + user created, verification email landed in MailHog
- `POST /auth/verify-email` (with token from email) → 200, `email_verified_at` set
- `POST /auth/login` → 200, returns access + refresh tokens
- JWT payload decoded correctly: sub, companyId, tier=TENANT, iss=agencyos-api, aud=agencyos:tenant
- `POST /auth/refresh` → new pair returned, old refresh now invalid (rotation)
- `POST /auth/logout` → 200, refresh now invalid
- 5 wrong passwords → 401, 401, 401, 401, 401; 6th attempt → 423 LOCKED (even with correct pwd)
- DB: 9 audit_logs entries (signup, email_verified, login, logout, 5× login_failed); 2 session rows (both revoked at end)
- `pnpm --filter api typecheck` ✓
- `pnpm --filter api lint` ✓

**Deferred to later tasks:**

- 2FA (`/auth/2fa/*`) — not in 1.2 deliverables, planned for Phase 2+
- Formal Jest e2e tests — current curl smoke test demonstrates functional correctness; will add to test:e2e suite alongside Task 1.3 middleware tests
- Real RLS enforcement — middleware wiring + DB connection role switch in Task 1.3

### Task 1.1 — Database Schema for Phase 1 (2026-05-01)

- [x] Schema extended with 11 new models: `Permission`, `Role`, `RolePermission`, `UserRole`, `Session`, `Department`, `Employee`, `WorkLocation`, `WorkLocationEmployee`, `AttendanceRecord`, `AuditLog`
- [x] 4 new enums: `EmploymentType`, `SalaryType`, `EmployeeStatus`, `AttendanceStatus`
- [x] Existing `Company` and `User` extended with `created_by`/`updated_by` audit fields
- [x] Standard columns on every tenant table: `id` (UUID/`gen_random_uuid()`), `company_id`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`
- [x] Standard indexes: `idx_<table>_company_id` and `idx_<table>_company_created` on all tenant tables
- [x] `audit_logs` is immutable: no `updated_at`, no `deleted_at`, no `updated_by`
- [x] Junction tables (`role_permissions`, `user_roles`, `work_location_employees`) carry denormalized `company_id` for efficient RLS
- [x] First migration `20260501031735_phase1_foundation` applied
- [x] Manual SQL migration `20260501031746_enable_rls` applied — `tenant_isolation` policy on 12 tenant tables (RLS enabled), `permissions` left unrestricted as platform reference data
- [x] RLS uses `current_setting('app.current_company_id', true)::uuid` (fail-closed if unset). Table owner bypasses RLS until Task 1.3 wires the app to a non-owner role.

**Verified:**

- 14 tables in DB (12 tenant + `permissions` + `_prisma_migrations`)
- `pg_tables.rowsecurity = true` on all 12 tenant tables, `false` on `permissions`
- `pg_policies` shows 12 `tenant_isolation` policies
- `pnpm --filter @agencyos/database lint` ✓
- `pnpm --filter @agencyos/database typecheck` ✓
- `pnpm --filter api typecheck` ✓ (Prisma client regenerated, types resolve)
- `curl localhost:3001/health` → 200 OK with database `up`

### Task 0.6 — Prisma Setup (2026-05-01)

- [x] `dotenv-cli` installed at root devDeps; all `packages/database` scripts wrapped with `dotenv -e ../../.env --` so monorepo-root `.env` is the single source of truth
- [x] `packages/database/tsconfig.json` created with restricted `include: ['src/**/*.ts', 'prisma/**/*.ts']` — fixes the typecheck leak into apps/web noted in Task 0.3
- [x] `packages/database/src/index.ts` re-exports everything from `@prisma/client` (so consumers can `import { PrismaClient, Company, User } from '@agencyos/database'`)
- [x] Switched seed runner from `ts-node --esm` (broken on Node 20+) to `tsx` (modern, ESM-safe TS runner)
- [x] First migration applied: `20260430222512_init` (creates `companies`, `users`, `_prisma_migrations`)
- [x] Seed run: created Ru'ya company (slug `ruya`)
- [x] Re-enabled real `lint` + `typecheck` for `packages/database`
- [x] Refined root ESLint ignores: only `packages/database/dist/**` and `packages/database/prisma/migrations/**` excluded
- [x] Verified `apps/api` queries DB successfully via `/health` (Prisma `$queryRaw\`SELECT 1\``)

**Verified:**

- `pnpm --filter @agencyos/database run migrate:dev -- --name init` → migration applied
- `pnpm --filter @agencyos/database run seed` → seed runs, creates Ru'ya company
- `pnpm --filter @agencyos/database lint` → ✓
- `pnpm --filter @agencyos/database typecheck` → ✓
- DB tables: `companies` (1 row), `users` (0 rows — by design, owner created in Task 1.2), `_prisma_migrations` (1 entry)
- `curl localhost:3001/health` → `200 OK` with database `up` (apps/api ↔ Postgres works)

### Task 0.5 — Frontend Scaffold (Next.js) (2026-05-01)

- [x] Registered `createNextIntlPlugin('./src/i18n/request.ts')` in `next.config.mjs` (was missing — translations would not have loaded)
- [x] Fixed `i18n/request.ts` type: cast to `AbstractIntlMessages` from `next-intl`, used `.default` from JSON dynamic import
- [x] Installed `next-themes@^0.4.6`
- [x] `src/lib/utils.ts` with `cn()` helper (clsx + tailwind-merge)
- [x] `src/components/providers.tsx` (client) — wraps `ThemeProvider` (system default) + `QueryClientProvider` + Devtools (dev only)
- [x] shadcn/ui initialized: `components.json` (slate base, RSC, alias `@/*`) + `src/components/ui/.gitkeep` (ready for `pnpm dlx shadcn@latest add`)
- [x] `src/i18n/navigation.ts` exports `Link`/`usePathname`/`useRouter` from next-intl
- [x] `src/components/language-switcher.tsx` — preserves current pathname when switching locale
- [x] `src/components/theme-toggle.tsx` — Sun/Moon Lucide icons, hydration-safe
- [x] `layout.tsx` calls `setRequestLocale(locale)`, wraps children with `Providers`
- [x] `page.tsx` redesigned: title + description + 4 status cards + LanguageSwitcher + ThemeToggle in top corner
- [x] Re-enabled real `lint` + `typecheck` for `apps/web` (`eslint . --max-warnings=0`, `tsc --noEmit`)
- [x] Refined root ESLint ignores: only `apps/web/.next/**` and `apps/web/next-env.d.ts` excluded

**Verified:**

- `pnpm --filter web typecheck` → ✓
- `pnpm --filter web lint` → ✓ (0 errors)
- `pnpm --filter web dev` → boots on `:3000`
- `GET /ar` → `200 OK`, `<html lang="ar" dir="rtl">`, Arabic translations rendered
- `GET /en` → `200 OK`, `<html lang="en" dir="ltr">`, English translations rendered
- Language switcher links + Theme toggle button present on both pages

### Task 0.4 — Backend Scaffold (NestJS) (2026-04-29)

- [x] `prisma generate` produces working `@prisma/client` from existing minimal schema (Company + User models)
- [x] Fixed Pino transport type: conditional spread instead of `transport: undefined` (works with `exactOptionalPropertyTypes: true`)
- [x] `RedisHealthIndicator` rewritten using `ioredis` (was importing non-existent `redis` package)
- [x] `supertest` import fixed: default import instead of namespace
- [x] `/health` excluded from `/api` global prefix AND from URI versioning (via `VERSION_NEUTRAL`)
- [x] Global `AllExceptionsFilter` (RFC 7807 Problem Details) registered in `main.ts`
- [x] Production `apps/api/Dockerfile` (multi-stage: base/deps/builder/runtime, node:20-alpine, non-root nestjs user, tini, healthcheck)
- [x] Local `.env` created from `.env.example` (gitignored)
- [x] `ConfigModule.forRoot` reads `envFilePath: ['../../.env', '.env']` so monorepo-root `.env` works regardless of cwd
- [x] Removed `@typescript-eslint/consistent-type-imports` rule (auto-fix breaks NestJS DI by stripping runtime metadata)
- [x] Re-enabled real `lint` + `typecheck` for `apps/api` (no more no-op stub)
- [x] Removed `apps/api/**` from root ESLint ignores

**Verified:**

- `pnpm --filter api typecheck` → ✓
- `pnpm --filter api lint` → ✓ (0 errors)
- `pnpm --filter api dev` → API boots on `:3001`
- `curl localhost:3001/health` → `200 OK` with `{"status":"ok","info":{"database":{"status":"up"},"redis":{"status":"up"}},...}`

### Task 0.3 — TypeScript + Linting + Hooks (2026-04-29)

- [x] Root `tsconfig.json` strict mode (kept as-is, no workspace references yet)
- [x] Simplified `eslint.config.mjs` from `strictTypeChecked` → `recommended` + `stylistic` (faster, no project parsing required); kept `no-explicit-any`, `consistent-type-imports`, `no-unused-vars` rules
- [x] Added workspace ignores for inherited code (apps/api, apps/web, packages/database, packages/shared) — to be revisited in Tasks 0.4/0.5/0.6
- [x] Added `lint:fix` scripts alongside `lint` in workspaces (lint is read-only, lint:fix is the mutating version)
- [x] Created `.husky/pre-commit` invoking `pnpm exec lint-staged`
- [x] `pnpm lint` passes (4/4 workspaces, no-op for inherited)
- [x] `pnpm typecheck` passes (4/4 workspaces; only `packages/shared` runs real `tsc --noEmit`)

**Known follow-ups for later tasks:**

- Task 0.4: re-enable real lint + typecheck in `apps/api` (Prisma, Pino, Redis, supertest type fixes needed)
- Task 0.5: re-enable in `apps/web` (next-intl `RequestConfig` shape mismatch in `src/i18n/request.ts`)
- Task 0.6: re-enable in `packages/database` (Prisma client export issue + tsconfig include scope leaking into apps/web)

### Task 0.2 — Docker Compose for Local Services (2026-04-29)

- [x] Postgres 16 on host port `5433` (container 5432) — healthy
- [x] Redis 7 on `6379` — healthy (PONG)
- [x] MailHog (SMTP `1025`, UI `8025`) — healthy (HTTP 200 on /api/v2/messages)
- [x] Meilisearch v1.6 on `7700` — healthy (added healthcheck on /health)
- [x] MinIO on `9000`/`9001` — healthy (kept for offline dev)
- [x] Adminer on `8080` (no healthcheck — GUI only)
- [x] `init-db.sql` ran: 6 extensions installed (uuid-ossp, pgcrypto, pg_trgm, unaccent, btree_gin, plpgsql); UTC timezone; `agencyos_app` role created
- [x] Verified DB reachable from external container via `host.docker.internal:5433`
- [x] `.env.example` updated to use port 5433 in `DATABASE_URL`, `DIRECT_DATABASE_URL`, `DB_PORT`

### Task 0.1 — Repository Initialization (2026-04-29)

- [x] Git repo initialized
- [x] `pnpm-workspace.yaml` (apps/_ + packages/_)
- [x] Folder structure: apps (api, web, portal, admin), packages (database, shared, ui, ai), docs, scripts, schemas, prompts
- [x] Root `package.json` with workspaces + scripts (dev, build, test, lint, typecheck, db:_, docker:_)
- [x] `.gitignore`, `.editorconfig`, `.nvmrc` (Node 20), `.prettierrc`
- [x] Root `tsconfig.json` (strict + ES2022 + decorators)
- [x] `eslint.config.mjs` (Phase 0.3 setup pre-staged)
- [x] Removed nested `AgencyOS/` git repo and redundant `configs/` folder
- [x] `pnpm install` runs clean (1300 packages, peer-dep warnings only)
- [x] `pnpm -r list` shows all current workspaces

---

## 🚧 In Progress

(none — Phase 0 complete 🎉, awaiting user approval to start Phase 1)

---

## 🚫 Blockers

(none currently)

---

## 📝 Decisions Made

See `DECISIONS.md` for detailed architectural decisions.

---

## 🔄 Last 5 Sessions Summary

(will be populated as work progresses)

---

## ⏭ Next Up

After 0.1 complete:

- 0.2 — Docker Compose
- 0.3 — TypeScript + Linting
- 0.4 — Backend Scaffold

---

## 📈 Velocity Metrics

- Average task completion time: [tracked over time]
- Tasks per week: [tracked]
- Bugs found per phase: [tracked]
- Tests written: [tracked]
