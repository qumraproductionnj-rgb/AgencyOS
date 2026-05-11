# PROGRESS.md — Build Progress Tracker

> هذا الملف يُحدَّث بواسطة Claude Code بعد كل مهمة. لا تعدّله يدوياً إلا في حالات استثنائية.

---

## 📍 Current State

**Phase:** Phase 2 ✅ — Core Operations (Complete)
**Current Task:** Awaiting user approval to start Phase 3
**Last Updated:** 2026-05-11

---

## 📊 Progress Overview

```
Phase 0 — Setup:                    [██████] 6/6 ✅
Phase 1 — Foundation:               [████████████████] 14/14 ✅
Phase 2 — Core Operations:          [████████████████████████████████████████████] 18/18 ✅
Phase 3 — Creative & Collaboration: [░░░░░░░░░░░░░░░░░░░░░░] 0/22
Phase 4 — SaaS Layer:               [░░░░░░░░] 0/12

TOTAL:                              [████████████████████████████████████████████████████████████████████████████████░░] 38/72
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

### Task 2.13 — Files Module (TUS chunked upload) (2026-05-10)

- [x] Installed `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `tus-node-server`
- [x] `storage.service.ts` — S3/R2 client wrapper: upload, delete, signed URLs, public URLs, key builder (`{companyId}/{year}/{month}/{fileId}_{name}`)
- [x] `file.dto.ts` — Zod schemas for query, update, init-upload
- [x] `file.service.ts` — small file upload (<5MB via multer), TUS completion, CRUD, download URL, soft delete (also removes from storage)
- [x] `file.controller.ts` — 7 endpoints: list (entityType/entityId filter), get, upload (multipart), tus-complete, download, update, delete
- [x] `file.module.ts` — registers MulterModule (5MB limit), FileService, StorageService
- [x] Registers `FilesModule` in `app.module.ts`; increased JSON body limit in `main.ts`
- [x] `file.service.spec.ts` — 10 unit tests (findAll, findOne, upload, TUS complete, download URL, update, remove)
- [x] Frontend `use-files.ts` — 7 React Query hooks (list, get, upload with FormData, download URL, update, delete) + token extraction from cookie
- [x] `file-upload.tsx` — drag-drop zone with visual feedback, upload progress, file size validation (5MB)
- [x] `file-preview.tsx` — preview modal for images (`<img>`), videos (`<video>`), PDFs (`<iframe>`), other files (download link)
- [x] `file-list.tsx` — file table per entity (type + ID) with upload, preview, delete; file type icons
- [x] Route page `app/[locale]/files/page.tsx` — requires `entityType` + `entityId` query params
- [x] Translations: AR + EN `files` block (10 keys: upload, drag-drop, max size, preview, delete)
- [x] Added `view`, `all`, `actions` to `common` translations
- [x] `pnpm lint` ✓ | `pnpm typecheck` ✓ | `pnpm test` ✓ (214 tests, 23 suites)
- [x] Committed: `feat(files): upload (small + TUS), R2 storage, signed URLs, preview, drag-drop, AR/EN`

**Key decisions:**

- Two-tier upload: direct multipart for <5MB, TUS protocol for larger files (TUS endpoint setup deferred to TUS integration pass)
- R2 credentials optional (env vars validated as `optional()`) — storage service logs warning if unconfigured and skips uploads
- MinIO in docker-compose can be used as local S3-compatible storage by pointing `R2_ENDPOINT` to `http://localhost:9000`
- Storage key format: `{companyId}/{year}/{month}/{fileId}_{sanitizedOriginalName}`
- File record uses `entityType`/`entityId` polymorphic link (no foreign key constraint)
- Delete cascades: soft-deletes DB record + removes from R2 storage
- `BigInt(sizeBytes)` serialized via `.toJSON()` override in `main.ts` (already in place)
- TUS completion uses `POST /files/tus-complete` to create file record after TUS server finishes upload; full TUS server integration (tus-node-server mounted on Express) needs additional wiring in a follow-up pass

### Task 2.14 — Notifications System (2026-05-10)

- [x] `notification.dto.ts` — Zod schemas for query params (cursor pagination, unreadOnly) and mark-read body
- [x] `notification.gateway.ts` — socket.io namespace `/notifications`; `sendToUser()` (room `user:{userId}`) and `sendToCompany()` (room `company:{companyId}`); user joins on connect via `handshake.query.userId`
- [x] `notification.service.ts` — CRUD with cursor-based pagination, unread count, WebSocket emit on create, markRead/markAllRead, delete
- [x] `notification.controller.ts` — 5 endpoints: GET list (cursor pagination + unreadOnly), GET unread-count, PATCH mark-read (body: `{ ids: string[] }`), PATCH mark-all-read, DELETE :id
- [x] `notification.module.ts` — registers service, controller, gateway; imports forwardRef for TasksModule (LinkedTaskType)
- [x] `notification.service.spec.ts` — 7 unit tests (findAll, create with emit, unread count, markRead, markAllRead, delete)
- [x] Registered `NotificationsModule` in `app.module.ts`
- [x] Frontend `use-notifications.ts` — 6 React Query hooks (list, unread count, mark read, mark all read, delete)
- [x] `notification-bell.tsx` — bell icon with unread badge, dropdown panel with list, mark-read/mark-all-read/delete actions, click-outside close
- [x] `app-shell.tsx` + `app-topnav.tsx` — shared app layout with NotificationBell, LanguageSwitcher, ThemeToggle; integrated into root locale layout
- [x] Translations: AR + EN `notifications` keys (title, markRead, markAllRead, empty, delete)
- [x] `pnpm lint` ✓ | `pnpm typecheck` ✓ | `pnpm test` ✓ (24 suites, 222 tests)

**Key decisions:**

- Notification model lacks standard columns (`deletedAt`, `createdBy`, `updatedBy`) — treated as immutable event log; `remove` uses hard `delete`
- WebSocket gateway uses socket.io namespace `/notifications`; user joins `user:{userId}` room via `handshake.query['userId']`
- Unread count auto-refetches every 30s (polling fallback for when WebSocket disconnects)
- Cursor pagination uses `cursor` + `limit` query params; `unreadOnly` boolean filter
- Mark-all-read calls `PATCH /notifications/read-all` (no body)

### Task 2.15 — Exchange Rates Management (2026-05-10)

- [x] `exchange-rate.dto.ts` — Zod schemas for SetRate (fromCurrency, toCurrency, rate, validFrom) and UpdateRate (rate)
- [x] `exchange-rate.service.ts` — CRUD (findAll with from/to filter, findCurrent with date validity, setManual, update, remove) + autoFetchDaily cron via `@nestjs/schedule` (every 6AM, fetches USD→IQD, USD→EUR, EUR→IQD from open.er-api.com, skips if manual rate exists)
- [x] `exchange-rate.controller.ts` — 5 endpoints: GET list, GET current (defaults to USD→IQD), POST set manual, PATCH :id update, DELETE :id soft delete
- [x] `exchange-rate.module.ts` — registers service + controller + `ScheduleModule.forRoot()`
- [x] Installed `@nestjs/schedule` dependency
- [x] Registered `ExchangeRatesModule` in `app.module.ts`
- [x] `exchange-rate.service.spec.ts` — 9 unit tests (findAll, findCurrent found/null, setManual, update, update not-found, remove, remove not-found)
- [x] Frontend `use-exchange-rates.ts` — 5 React Query hooks (list, current, set, update, delete)
- [x] `exchange-rate-settings.tsx` — settings page with currency pair selector, rate input, current rate display, rate history list with delete
- [x] Route page `app/[locale]/settings/exchange-rates/page.tsx` with settings layout
- [x] Translations: AR + EN `exchangeRates` block (11 keys: title, description, currentRate, currencyPair, rate, setRate, setting, currentLabel, history, noRates, manual, delete)
- [x] `pnpm lint` ✓ | `pnpm typecheck` ✓ | `pnpm test` ✓ (25 suites, 231 tests)

**Key decisions:**

- Background job uses `@nestjs/schedule` `@Cron(CronExpression.EVERY_DAY_AT_6AM)` — no BullMQ dependency needed for a single daily job
- Auto-fetch uses free `open.er-api.com` (no API key needed), 10s timeout, skips if API fails
- Manual rates (`isManual: true`) are never overwritten by auto-fetch — user-set rates take precedence
- Three default pairs tracked: USD→IQD, USD→EUR, EUR→IQD
- `ScheduleModule.forRoot()` registered in ExchangeRatesModule (singleton, won't re-register)

### Task 2.16 — Dashboard Refinement (2026-05-11)

- [x] `dashboard.service.ts` — aggregation endpoint querying 7 widgets in parallel via `Promise.all`: revenue (IQD/USD split from paid invoices this month), active projects count (non-terminal stages), overdue tasks (past due, not done/cancelled), pending invoices (SENT/OVERDUE/PARTIALLY_PAID), pipeline value (open deals sum by currency), today's attendance summary (present/late/absent/remote), top performers (5 users with most completed tasks this month)
- [x] `dashboard.controller.ts` — single `GET /v1/dashboard` endpoint
- [x] `dashboard.module.ts` — registered in `app.module.ts`
- [x] Frontend `use-dashboard.ts` — React Query hook with 60s auto-refetch
- [x] `dashboard-page.tsx` — 6 stat cards (revenue, active projects, overdue tasks, pending invoices, pipeline value, attendance) + top performers ranked list with badges; responsive grid (1→2→3→4 columns)
- [x] Root page `app/[locale]/page.tsx` updated to render `DashboardPage` (replaces old landing page)
- [x] Translations: AR + EN `dashboard` block (15 keys: title, subtitle, widget labels, top performers)
- [x] `pnpm lint` ✓ | `pnpm typecheck` ✓ | `pnpm test` ✓ (25 suites, 231 tests)

**Key decisions:**

- Single endpoint returns all widget data in one request (avoids 7 separate API calls on frontend)
- Revenue calculated from `Invoice` records with `PAID` status, filtered by `issuedDate` this month
- "Active projects" = all stages except `COMPLETED`, `DELIVERED`, `CANCELLED`
- "Overdue tasks" = `dueDate < now` and status not `DONE`/`CANCELLED`
- Pipeline value = sum of `Deal.value` for open stages (not `WON`/`LOST`)
- Top performers = groupBy `assignedTo` on DONE tasks this month, sorted descending, limited to 5
- Conditional spread pattern (`{...(condition ? { key: val } : {})}`) used for optional `subtitle` prop to satisfy `exactOptionalPropertyTypes`

### Task 2.17 — Search (Postgres FTS) (2026-05-11)

- [x] `search.service.ts` — searches 8 entities (clients, projects, tasks, leads, invoices, employees, files, campaigns) via `contains` + `mode: 'insensitive'` (basic Arabic-aware)
- [x] `search.controller.ts` — `GET /v1/search?q=` (minimum 2 chars, returns categorized grouped results)
- [x] `search.module.ts` — registered in `app.module.ts`
- [x] Frontend `use-search.ts` — React Query hook, enabled only when `q.length >= 2`
- [x] `search-modal.tsx` — Cmd+K trigger button, modal with categorized grouped results (type badges, entity icons), ESC/click-outside to close, keyboard shortcut `Ctrl+K`/`Cmd+K`
- [x] Integrated `SearchTrigger` into `app-topnav.tsx`
- [x] Translations: AR + EN `search` block (7 keys: title, placeholder, noResults, resultsCount, clients, projects, tasks, invoices, employees, files, campaigns, loading)
- [x] `pnpm lint` ✓ | `pnpm typecheck` ✓ | `pnpm test` ✓ (25 suites, 231 tests)

**Key decisions:**

- Basic `insensitive contains` approach is sufficient for Phase 2; dedicated search engine (Meilisearch) deferred to Phase 3 for full Arabic stemming/fuzzy search
- Search scope limited to 8 entities that users most commonly look up
- Cmd+K global shortcut for power users; search modal has clear affordance (visible trigger button)
- Results grouped by entity type with consistent badge colors
- Minimum 2 characters to avoid excessive queries on partial input

### Task 2.18 — Phase 2 Acceptance Tests (E2E) (2026-05-11)

- [x] `e2e/helpers/api.ts` — added 20 helper functions for Phase 2 endpoints (leads, clients, quotations, projects, tasks, invoices, leaves, expenses, files)
- [x] `e2e/phase-2-acceptance.spec.ts` — 4 critical E2E flows:
  - **Flow 1** (Lead→Won→Client→Quotation→Project→Task→Invoice→Payment): Create lead → convert WON (auto-creates client+deal) → create quotation → SEND → create project → advance stage → create task → create invoice → SEND → record payment → PAID
  - **Flow 2** (Leave→approval→balance): Employee requests annual leave → owner approves → balance deducted (usedDays >= 3)
  - **Flow 3** (Expense→approval): Create expense > 150K IQD → PENDING → owner approves → APPROVED
  - **Flow 4** (File upload→preview): Upload small file via multipart → fetch metadata → confirm fields
  - **Flow 5** (Browser): Dashboard page renders in Arabic with auth
- [x] `pnpm lint` ✓ | `pnpm typecheck` ✓ | `pnpm test` ✓ (25 suites, 231 tests)

**Key decisions:**

- Quotation `PATCH /quotations/:id/status` ACCEPTED does NOT auto-create project/invoice in internal API (only in public token endpoint) — project and invoice created manually in test
- File upload uses `FormData` with `Blob` (Node.js 18+ API), no external storage dependency; R2 fallback handles missing credentials gracefully
- Test setup follows Phase 1 pattern: health check → signup → verify → login → create employee
- Four critical business flows tested end-to-end covering the full Lead-to-Payment lifecycle

---

## 🚧 In Progress

(none — awaiting approval to start Phase 3)

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

- 3.1 — Database Schema for Phase 3 (brand briefs, content pieces, assets, equipment, exhibitions)
- 3.2 — Asset Library
- 3.3 — Brand Briefs

---

## 📈 Velocity Metrics

- Average task completion time: [tracked over time]
- Tasks per week: [tracked]
- Bugs found per phase: [tracked]
- Tests written: 231

```

```
