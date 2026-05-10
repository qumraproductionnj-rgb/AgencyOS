# PROGRESS.md — Build Progress Tracker

> هذا الملف يُحدَّث بواسطة Claude Code بعد كل مهمة. لا تعدّله يدوياً إلا في حالات استثنائية.

---

## 📍 Current State

**Phase:** Phase 2 — Core Operations
**Current Task:** 2.6 — CRM: Clients & Contacts (up next)
**Last Updated:** 2026-05-10

---

## 📊 Progress Overview

```
Phase 0 — Setup:                    [██████] 6/6 ✅
Phase 1 — Foundation:               [████████████████] 14/14 ✅
Phase 2 — Core Operations:          [███░░░░░░░░░░░░░░░░] 5/18
Phase 3 — Creative & Collaboration: [░░░░░░░░░░░░░░░░░░░░░░] 0/22
Phase 4 — SaaS Layer:               [░░░░░░░░] 0/12

TOTAL:                              [████████████████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 24/72
```

Phase 0 — Setup: [██████] 6/6 ✅
Phase 1 — Foundation: [████████████████] 14/14 ✅
Phase 2 — Core Operations: [█░░░░░░░░░░░░░░░░░░] 1/18
Phase 3 — Creative & Collaboration: [░░░░░░░░░░░░░░░░░░░░░░] 0/22
Phase 4 — SaaS Layer: [░░░░░░░░░░] 0/12

TOTAL: [████████████████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 20/72

```

---

## ✅ Completed Tasks

### Task 1.4 — Roles & Permissions System (2026-05-09)

- [x] `packages/database/src/permissions.ts` — 35 permission definitions in catalog (18 resources × actions from MasterSpec Section 7 matrix)
- [x] `packages/database/src/seed-default-roles.ts` — `seedPermissions()` and `seedDefaultRoles()` helpers (upsert-safe)
- [x] `packages/database/prisma/seed.ts` — seeds Permissions + 11 default roles for Ru'ya company
- [x] `apps/api/src/permissions/permission.service.ts` — `userCan()`, `userHasRole()`, `getUserPermissions()`, `getUserRoles()`, `seedCompanyDefaultRoles()`
- [x] `apps/api/src/permissions/permission.module.ts` — NestJS module exporting PermissionService
- [x] `apps/api/src/common/decorators/require-permission.decorator.ts` — `@RequirePermission('resource', 'action')` with `manage` escalation
- [x] `apps/api/src/common/decorators/require-role.decorator.ts` — `@RequireRole('roleKey', ...)` with OR semantics
- [x] `apps/api/src/common/guards/permission.guard.ts` — `PermissionsGuard` (global, passes through if no metadata)
- [x] `apps/api/src/common/guards/role.guard.ts` — `RolesGuard` (global, passes through if no metadata)
- [x] Both guards registered as `APP_GUARD` after `JwtAuthGuard` (correct ordering for `req.user` availability)
- [x] `AuthService.signup()` now calls `permissionService.seedCompanyDefaultRoles()` after creating company + user
- [x] 26 unit tests across 4 suites: userCan (5), getUserPermissions (2), getUserRoles (2), userHasRole (4), PermissionsGuard (5), RolesGuard (5)
- [x] Verified seed: 35 permissions + 11 roles in DB
- [x] `pnpm lint` ✓ | `pnpm typecheck` ✓ | `pnpm test` ✓ (5 suites, 26 tests)

**Key decisions:**

- `manage` action on a resource grants any action check (implicit escalation: `manage` → `read`, `write`, etc.)
- Roles use OR semantics: `@RequireRole('admin', 'hr_manager')` passes if user has either
- Guards return `true` when no metadata is set (backward-compatible with existing routes)
- `PermissionService` uses `PrismaService.system` (bypasses RLS) for permission lookups since `permissions` table has no RLS
- All permission keys use empty string `''` for scope (nullable unique constraint incompatible with Prisma upsert `where`)

---

### Task 1.13 — Audit Logging (2026-05-09)

- [x] `AuditService` — `log()` writes to `prisma.system.auditLog`, handles errors gracefully; `findAll()` with cursor-based pagination, entityType/userId filter, limit capped at 200
- [x] `AuditInterceptor` — global NestInterceptor via `APP_INTERCEPTOR`; captures POST/PUT/PATCH/DELETE; logs on success and failure (`_failed` suffix); skips GET/HEAD/OPTIONS and sensitive actions (auth); extracts entity type from URL via `guessEntityType()` (skips UUIDs, numeric IDs, check-in/check-out)
- [x] `AuditController` — `GET /audit-logs` requires `owner`/`admin` role + `TENANT` tier; supports `entityType`, `userId`, `limit`, `cursor` query params
- [x] `AuditModule` registered in `app.module.ts`
- [x] Frontend `/admin/audit-logs` viewer with entity-type filter, action badge (blue/red for failed)
- [x] `useAuditLogs` React Query hook
- [x] Fixed `exactOptionalPropertyTypes` errors — conditionally spread optional fields in controller, interceptor, and frontend page
- [x] Fixed `guessEntityType` to skip numeric path segments; added `auth` entity check for sensitive action exclusion
- [x] 13 unit tests (7 service + 6 interceptor)
- [x] `pnpm lint` ✓ | `pnpm typecheck` ✓ | `pnpm test` ✓ (11 suites, 62 tests)

**Key decisions:**

- `audit_logs` table is immutable (no `updated_at`, no `deleted_at`)
- Interceptor uses `as never` cast matching service's existing Prisma cast pattern
- `() => { void 0 }` for empty catch handlers to satisfy `no-empty-function` rule

---

### Task 2.2 — HR: Leaves Management (backend + frontend) (2026-05-10)

- [x] `leave.controller.ts` — 7 endpoints: `POST /leaves`, `GET /leaves`, `GET /leaves/balance`, `GET /leaves/:id`, `PATCH approve`, `PATCH reject`, `PATCH cancel`
- [x] `leave.module.ts` — imports `PermissionModule`, registered in `app.module.ts`
- [x] Fixed `leave.service.ts` TS errors — `leaveType` typed as `LeaveType` enum
- [x] `leave.service.spec.ts` — 22 unit tests (create, findAll, findOne, approve, reject, cancel, getBalances)
- [x] `hooks/use-leaves.ts` — React Query hooks (list, create, approve, reject, cancel, balance)
- [x] `lib/api.ts` — added `api.patch()` method
- [x] `components/leaves/leave-table.tsx` — main page with status filter tabs, my-leaves toggle, approve/reject/cancel actions, reject reason modal
- [x] `components/leaves/leave-modal.tsx` — create leave form (type, dates, reason, duration preview)
- [x] `components/leaves/leave-balance.tsx` — balance cards per leave type with usage bars
- [x] `app/[locale]/leaves/page.tsx` — route page shell
- [x] Translations: AR + EN `leaves` block (30+ keys) + `leaves` nav link
- [x] `pnpm lint` ✓ | `pnpm typecheck` ✓ | `pnpm test` ✓ (84 tests pass)

**Not in scope for this task:**

- Calendar view — deferred to future enhancement
- Notification triggers — logging only for now; email/Telegram notifications in Task 2.14

### Task 2.5 — CRM: Leads Pipeline (2026-05-10)

- [x] `lead.dto.ts` — Zod schemas (create, update, status transition with `LeadStatus` enum)
- [x] `lead.service.ts` — CRUD, forward-only stage transitions, WON auto-conversion (creates Client + Deal), soft delete
- [x] `lead.controller.ts` — 6 endpoints (list, get, create, update, status transition, delete); `@RequireRole('owner', 'admin', 'sales', 'account_manager')`
- [x] `lead.module.ts` — registered in `app.module.ts`
- [x] `lead.service.spec.ts` — 12 unit tests covering all operations including backward rejection and auto-conversion
- [x] Fixed `exactOptionalPropertyTypes` in controller (conditional spread for optional params)
- [x] Fixed spec TS errors — `m()` helper for bracket property access on `Record<string, jest.Mock>`
- [x] Frontend `hooks/use-leads.ts` — React Query hooks: list, get, create, update, updateStatus, delete
- [x] `lead-kanban.tsx` — Kanban board with 7 columns, HTML5 drag-drop, search, status filter, create button
- [x] `lead-modal.tsx` — create/edit lead modal with all fields
- [x] `lead-detail.tsx` — side panel with lead info, deals list, mark as WON/LOST buttons
- [x] `app/[locale]/leads/page.tsx` — route page
- [x] Translations: AR + EN `leads` block (30+ keys) + `leads` nav link
- [x] `pnpm lint` ✓ | `pnpm typecheck` ✓ | `pnpm test` ✓ (118 tests, 15 suites)

### Task 2.1 — Database Schema for Phase 2 (2026-05-10)

- [x] 22 new models added to `schema.prisma`: `Leave`, `LeaveBalance`, `PayrollRun`, `PayrollEntry`, `PerformanceReview`, `Lead`, `Client`, `Contact`, `Deal`, `Quotation`, `Invoice`, `Payment`, `Expense`, `Campaign`, `Project`, `Revision`, `Task`, `TaskComment`, `TaskTimeLog`, `File`, `Notification`, `ExchangeRate`
- [x] 13 new enums: `LeaveType`, `LeaveStatus`, `PayrollRunStatus`, `LeadStatus`, `DealStage`, `QuotationStatus`, `InvoiceType`, `InvoiceStatus`, `ExpenseStatus`, `CampaignStatus`, `ProjectStage`, `TaskStatus`, `TaskPriority`, `NotificationType`
- [x] All tables follow standard columns (`id`, `company_id`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`)
- [x] All tenant tables have indexes on `company_id` and relevant query columns
- [x] RLS enabled on all 22 tables with `tenant_isolation` policy
- [x] Grants applied for `agencyos_app` role
- [x] Migration `20260510090000_phase2_core_operations` created and applied
- [x] Seed updated with demo data: lead (أحمد العلواني), client (شركة بغداد للتجارة), deal, project (إعلان تلفزيوني), task (كتابة السيناريو)
- [x] ESLint ignores for database `.js` files added to root config
- [x] `pnpm lint` ✓ | `pnpm typecheck` ✓ | `pnpm test` ✓

---

### Task 1.14 & 1.15 — E2E Tests & Phase 1 Finalization (2026-05-10)

- [x] 8 Playwright E2E tests covering all Phase 1 critical flows:
  - Health check (API + Web)
  - Tenant signup → verify email → login
  - Owner creates employee → employee accepts invite
  - GPS check-in within radius (success)
  - GPS check-in outside radius (rejected with `OUT_OF_RANGE`)
  - HR dashboard shows employee attendance
  - Browser: home page renders in Arabic (RTL)
  - Browser: employees page loads with auth
- [x] Fixed 6 bugs during E2E bring-up (API helper header merge, QP decoding, missing `@Public()`, wrong HTTP code, endpoint path, ForbiddenException serialization)
- [x] Added `public/sw.js` and `public/workbox-*.js` to ESLint ignores
- [x] **62 unit tests** → all pass
- [x] **8 E2E tests** → all pass (3.5s)
- [x] **API lint** ✓ | **Web lint** ✓ | **API typecheck** ✓ | **Web typecheck** ✓
- [x] Docs updated (PROGRESS.md, TASKS.md)
- [x] All 14 Phase 1 tasks complete

---

### Task 1.12 — Attendance Dashboard (2026-05-09)

- [x] `/attendance` page with today's table (employee, status, time, location), department filter dropdown
- [x] 4 stat cards: present, late, absent, onLeave
- [x] Monthly calendar (day numbers only, empty cells for padding)
- [x] Export Excel/PDF placeholder buttons
- [x] `statusCounts` type error fixed with `??` fallback for `exactOptionalPropertyTypes`
- [x] i18n AR/EN

---

### Task 1.11 — Check-In UI / Mobile PWA (2026-05-09)

- [x] `/check-in` page with big check-in/check-out circle button, GPS accuracy indicator (±Xm, green/yellow)
- [x] Real-time location watch (`watchPosition` with `enableHighAccuracy: true`)
- [x] Error states (permission denied, timeout, unavailable)
- [x] "Why blocked?" help modal (GPS/permission troubleshooting)
- [x] Today's summary card (latest record, total hours)
- [x] `use-attendance.ts` React Query hooks
- [x] i18n AR/EN

---

### Task 1.10 — GPS Check-In API (2026-05-09)

- [x] `POST /attendance/check-in` — validates GPS coordinates against assigned work-location radius (Haversine)
- [x] `POST /attendance/check-out` — closes open record, calculates duration
- [x] `GET /attendance/today` — current user's today records
- [x] `GET /attendance/today/all` — all employees' today records (manager view)
- [x] `POST /attendance/:id/override` — requires `owner`/`admin`/`hr_manager` role
- [x] Zod DTOs for all endpoints
- [x] Server-side grace period (15 min) for late detection
- [x] 49 API tests pass

---

### Task 1.9 — PWA Setup (2026-05-09)

- [x] `next-pwa` configured in `next.config.mjs`
- [x] `public/manifest.json` with Arabic name, 192/512/maskable icons (SVG)
- [x] `PwaInstallPrompt` component
- [x] Apple Touch Icon + iOS metadata in layout
- [x] i18n AR/EN for install prompt

---

### Task 1.8 — Work Locations CRUD with Map (2026-05-09)

- [x] Backend 6 endpoints: list, get, create, update, delete + assign/unassign employees
- [x] Leaflet map picker with `react-leaflet@4`
- [x] Radius slider (50–500m) with visual circle overlay
- [x] Employee multi-select assign in modal
- [x] i18n AR/EN
- [x] 43 tests pass

---

### Task 1.7 — Employees CRUD (2026-05-09)

- [x] Backend 7 endpoints + accept-invite
- [x] Frontend `/employees` list page, `/employees/[id]` detail page (profile + placeholder tabs)
- [x] `/accept-invite?token=` page
- [x] BigInt serialization fix in API main.ts
- [x] i18n AR/EN
- [x] 38 tests pass

---

### Task 1.6 — Departments CRUD (2026-05-09)

- [x] Backend 5 endpoints (list, get, create, update, delete)
- [x] Frontend `/departments` list page + `/departments/new` + `/departments/[id]` edit
- [x] i18n AR/EN

---

### Task 1.5 — Frontend Layout & Navigation (2026-05-09)

- [x] Shell layout with sidebar navigation + top header
- [x] User menu with logout
- [x] Responsive sidebar (collapsible)
- [x] i18n AR/EN for all nav items
- [x] shadcn/ui sidebar component

---

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

- Task 2.6 — CRM: Clients & Contacts (up next)

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

- 2.5 — CRM: Leads Pipeline (Kanban board, pipeline stages, lead-to-client conversion)

---

## 📈 Velocity Metrics

- Average task completion time: [tracked over time]
- Tasks per week: [tracked]
- Bugs found per phase: [tracked]
- Tests written: [tracked]
```
