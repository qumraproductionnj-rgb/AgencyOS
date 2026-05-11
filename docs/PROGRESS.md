# PROGRESS.md — Build Progress Tracker

> هذا الملف يُحدَّث بواسطة Claude Code بعد كل مهمة. لا تعدّله يدوياً إلا في حالات استثنائية.

---

## 📍 Current State

**Phase:** Phase 3 — Creative & Collaboration
**Current Task:** 3.14 — AI Tools Library (Round 3: Design + Story + Carousel + Final)
**Last Updated:** 2026-05-11

---

## 📊 Progress Overview

```
Phase 0 — Setup:                    [██████] 6/6 ✅
Phase 1 — Foundation:               [████████████████] 14/14 ✅
Phase 2 — Core Operations:          [████████████████████████████████████████████] 18/18 ✅
Phase 3 — Creative & Collaboration: [██████████████████████████████████████████████████████░░] 13/22
Phase 4 — SaaS Layer:               [░░░░░░░░] 0/12

TOTAL:                              [██████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████████] 51/72
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

## ✅ Recently Completed

- **3.1 — Database Schema for Phase 3**: 20 new Prisma models + 14 enums added; Company/Client/Campaign/Project/User/Employee models updated with new relations; Prisma client generated; migration SQL created with 19 tables, indexes, RLS policies, and GRANT statements. Pending: apply migration when Docker is running (`pnpm db:migrate`).

- **3.2 — Asset Library (backend API)**: Created `apps/api/src/assets/` module: DTO, service, controller, module, 29 unit tests. `pnpm lint` ✓ | `pnpm typecheck` ✓ | `pnpm test` ✓

- **3.3 — Brand Briefs (backend API)**: Created `apps/api/src/brand-briefs/` module with 4 files:
  - `brand-brief.dto.ts` — Zod schemas for BrandBrief (21 field groups incl. nested personas, fonts JSON, competitors, postingFrequency), AudiencePersona (14 fields), query filters
  - `brand-brief.service.ts` — CRUD with one-per-client enforcement (ConflictException), nested persona creation on brief create, independent persona CRUD
  - `brand-brief.controller.ts` — 9 REST endpoints at `v1/brand-briefs/*` with role guards (write: owner/admin/creative_director/account_manager, read: +designer/video_editor/project_manager)
  - `brand-brief.module.ts` — registered in `app.module.ts`
  - `brand-brief.service.spec.ts` — 15 unit tests
  - `pnpm lint` ✓ | `pnpm typecheck` ✓ | `pnpm test` ✓ (27 suites, 275 tests)

- **3.4 — Content Pillars (backend API)**: Created `apps/api/src/content-pillars/` module. `pnpm lint` ✓ | `pnpm typecheck` ✓ | `pnpm test` ✓

### Task 3.10 — Content Editor: Story (2026-05-11)

- [x] TabFrames rewritten as frame sequence builder (3-7 frames)
- [x] Per-frame editing: visual, text, sticker, interactive element, duration
- [x] AI story sequence generation button using `/v1/ai/generate`
- [x] AR/EN translations: 8 new keys (addFrame, noFrames, frame, frameText, sticker, interactive, interactivePlaceholder, aiStorySequence)
- [x] `pnpm lint` ✓ | `pnpm typecheck` ✓ | `pnpm test` ✓ (32 suites, 324 tests)

**Key decisions:**

- Story frames stored in `components.frames` array: `{ visual, text, sticker, interactive, duration }`
- Parent call updated to pass `_patch`, `_tCommon`, `components`, `setComponent`, `aiGenerate`
- Same `setComponent(key, value)` pattern as other type tabs

---

### Task 3.11 — Content Editor: Carousel (2026-05-11)

- [x] TabSlides rewritten as slide builder (2-10 slides)
- [x] Per-slide: headline, body, visual brief
- [x] Hook slide badge (first) + CTA slide badge (last) with colored labels
- [x] AI carousel outline generator using `/v1/ai/generate`
- [x] AR/EN translations: 9 new keys (addSlide, noSlides, slide, hookSlide, ctaSlide, cta, visualBrief, visualBriefPlaceholder, aiCarouselOutline)
- [x] `pnpm lint` ✓ | `pnpm typecheck` ✓ | `pnpm test` ✓ (32 suites, 324 tests)

**Key decisions:**

- Slides stored in `components.slides` array: `{ headline, body, visualBrief }`
- First slide auto-tagged as HOOK, last slide as CTA (auto-detected by position)
- Same `components`/`setComponent` pattern as other structural tabs

---

### Task 3.12 — AI Tools Library Round 1: Strategic + Ideation (2026-05-11)

- [x] `use-ai-tool` hook wrapping `/v1/ai/generate` API call
- [x] `AiToolPanel` shared layout component (title, icon, generate/reset, output display, error display)
- [x] 6 standalone tool components:
  - BrandVoiceBuilder (brand name, industry, audience, keywords → brand voice guide)
  - AudiencePersonaBuilder (brand, industry, demographics, goals → detailed persona)
  - ContentPillarsDesigner (brand, industry, audience, goals → 3-5 pillars with descriptions)
  - BigIdeaGenerator (brand, objective, pillar, count → creative ideas)
  - HookLab (topic, tone, platform, pattern → 5 hooks with explanations)
  - HeadlineTester (headlines, context → scores with improvement suggestions)
- [x] `AiToolsList` container with tool selection grid + individual tool views
- [x] Route page at `/ai-tools` with `next-intl` locale support
- [x] AR/EN translations: 40+ keys covering tool names, descriptions, labels, placeholders, hook patterns
- [x] `pnpm lint` ✓ | `pnpm typecheck` ✓ | `pnpm test` ✓ (32 suites, 324 tests)

**Key decisions:**

- Each tool is a standalone component using shared `AiToolPanel` + `useAiTool` hook
- `useAiTool` hook manages busy/error/output state per tool instance
- Tools accessible at `/ai-tools` route; later integration into Content Studio sidebar deferred to 3.14
- `systemPrompt` typed as `string | undefined` for `exactOptionalPropertyTypes` compliance
- Hook pattern translations duplicated in `aiTools` namespace (separate from `contentPieces` namespace)
- New toolType names (`audience_persona_builder`, `content_pillars_designer`, `hook_lab`, `headline_tester`) used for non-registry tools

---

### Task 3.13 — AI Tools Library Round 2: Video (2026-05-11)

- [x] 7 standalone video tool components leveraging `<AiToolPanel>` + `useAiTool`:
  - ScriptWriter (topic, duration, tone, hook, framework selector with 8 frameworks)
  - StoryboardBuilder (script, mood, shot count → shot-by-shot breakdown)
  - VoiceoverPolisher (script, tone, duration → polished delivery with pacing notes)
  - MusicMoodSuggester (content type, mood, pace, duration → 3-5 track suggestions)
  - BRollPlanner (topic, script, available locations → per-section B-roll coverage)
  - ThumbnailConceptGenerator (title, topic, style → 3 concepts with composition details)
  - VideoPromptGenerator (scene description, duration, style → Seedance-compatible JSON prompt)
- [x] `AiToolsList` updated to include 7 new tools in grid + routing
- [x] AR/EN translations: 30+ new keys (tool names, descriptions, framework labels, field labels/placeholders)
- [x] `pnpm lint` ✓ | `pnpm typecheck` ✓ | `pnpm test` ✓ (32 suites, 324 tests)

**Key decisions:**

- ScriptWriter includes 8 common video frameworks (AIDA, PAS, Hook-Story-Offer, etc.) selectable from dropdown
- `SHOT_TYPES` constant omitted from StoryboardBuilder to keep component lean (AI handles shot type suggestions)
- VideoPromptGenerator system prompt requests bilingual JSON (EN + ZH) per Seedance spec
- Framework labels use `framework_` prefix in aiTools namespace (no conflict with contentPieces)
- Polish button label used for VoiceoverPolisher (semantically clearer than "Generate")
- Existing prompt registry templates matched where available (script_writer, video_prompt_generator)

---

- **3.5 — AI Service Layer**: Created `packages/ai/` shared package + `apps/api/src/ai/` NestJS module:
  - `packages/ai/src/anthropic-client.ts` — Anthropic SDK wrapper (sonnet/opus, error handling)
  - `packages/ai/src/cost-calculator.ts` — Token-based cost estimation
  - `packages/ai/src/prompt-registry.ts` — In-memory registry with 7 default prompts
  - `packages/ai/src/types.ts` — Shared types
  - `apps/api/src/ai/ai.dto.ts` — Zod schema for generate request
  - `apps/api/src/ai/ai-generation.service.ts` — Calls AI, logs to `ai_generations`, monthly rate limit (1000)
  - `apps/api/src/ai/ai.controller.ts` — 3 endpoints: `POST /v1/ai/generate`, `GET /v1/ai/history`, `PATCH /v1/ai/generations/:id/mark-used`
  - `apps/api/src/ai/ai.module.ts` — registered in `app.module.ts`
  - 6 unit tests
  - `pnpm lint` ✓ | `pnpm typecheck` ✓ | `pnpm test` ✓ (29 suites, 289 tests)

---

### Task 3.6 — Content Plan Wizard (Frontend + API) (2026-05-11)

- [x] Backend API: DTO (11 Zod schemas), service (CRUD, status state machine with VALID_TRANSITIONS map, duplicate `(companyId, clientId, year, month)` enforcement, AI idea generation via `AiGenerationService`, bulk piece creation on finalize), controller (10 endpoints matching wizard steps), module
- [x] React Query hooks: `use-content-plans.ts` (7 hooks: list, get, create, update, updateStatus, delete, generateIdeas, finalize), `use-brand-briefs.ts` (2 hooks), `use-content-pillars.ts` (2 hooks)
- [x] 4-step Content Plan Wizard component:
  - Step 1: Context — client, month, year, optional campaign/title — POST creates plan
  - Step 2: Objectives + Distribution — objectives array, pillar distribution dropdowns, content type counts
  - Step 3: AI Ideas — direction textarea → generate 50 ideas → select up to 30 via checkbox cards
  - Step 4: Calendar — monthly calendar grid + day assignment dropdown per piece → POST finalize
- [x] Route page: `app/[locale]/content-plans/page.tsx`
- [x] Translations: AR + EN `contentPlans` block (60 keys: wizard labels, months, piece type names)
- [x] `pnpm lint` ✓ | `pnpm typecheck` ✓ | `pnpm test` ✓ (30 suites, 300 tests)

**Key decisions:**

- Wizard is self-contained: creates plan on step 1 submit, updates on step 2, generates AI ideas on step 3, finalizes on step 4
- Calendar step uses a simple day grid + per-piece day dropdown (no drag-and-drop) since no DnD library installed
- Brand Brief and Content Pillars loaded automatically when client is selected in step 1
- AI ideas limited to 30 selections (per spec: 50 generated, select 30)

---

### Task 3.7 — Content Piece Editor (Backend + Frontend Shell) (2026-05-11)

- [x] Backend DTO: `UpdateContentPieceSchema` (all fields), `UpdateStageSchema` with `VALID_CONTENT_STAGE_TRANSITIONS` map (11 stages, explicit allowed-next arrays), `CreateRevisionSchema`, `UpdateRevisionSchema`
- [x] `content-piece.service.ts` — `findOne`, `update` (partial update with null handling), `updateStage` (validates transitions, auto-sets approval timestamps), `findRevisions`, `createRevision`, `updateRevision` (auto-sets resolver on COMPLETED)
- [x] `content-piece.controller.ts` — 6 REST endpoints: GET/PUT /:id, PATCH /:id/stage, GET/POST /:id/revisions, PUT /:id/revisions/:revisionId
- [x] `content-piece.module.ts` — registered in `app.module.ts`
- [x] React Query hooks (`use-content-pieces.ts`): 6 hooks — `useContentPiece`, `useUpdateContentPiece`, `useUpdateContentPieceStage`, `useContentRevisions`, `useCreateContentRevision`, `useUpdateContentRevision`
- [x] Frontend editor component (`content-piece-editor.tsx`): three-column layout (context sidebar, main tab area, stage+revision sidebar), type-driven tab system (PIECE_TYPE_TABS map: each piece type gets different tabs), autosave every 2s
- [x] Route page: `app/[locale]/content-pieces/[id]/page.tsx`
- [x] Service spec: 18 unit tests (findOne, update, updateStage with all transitions, findRevisions, createRevision, updateRevision)
- [x] Controller spec: 6 unit tests (all 6 endpoints delegate to service with correct parameters)
- [x] `pnpm lint` ✓ | `pnpm typecheck` ✓ | `pnpm test` ✓ (32 suites, 324 tests)

**Key decisions:**

- Editor tabs are type-driven: each piece type gets a different set of tabs; universal shell can be extended per type via PIECE_TYPE_TABS map
- No comments model — revisions serve as the feedback/comment mechanism
- Revision requester/resolver names fetched via `User.employee.fullNameAr` (User model has no fullNameAr directly)
- `patch` callback typed as `(key: string, value: unknown) => void` for compatibility across all tab components
- Tab component props simplified: `draft` removed from all 10 tab signatures; only `piece`, `patch`, `t` passed

---

### Task 3.8 — Content Editor: Video / Reel (2026-05-11)

- [x] Added `storyboard` + `music` tabs to VIDEO_LONG and REEL tab sets
- [x] **TabHook**: Full Hook-Hold-Payoff framework editor with hook pattern selector (Pattern Interrupt, Bold Claim, Curiosity Gap, etc.), three color-coded sections (Hook 0-3s, Hold 3-20s, Payoff 20-30s), AI buttons for hook generation and full structure generation
- [x] **TabScript**: Structured acts/sections editor with add/remove, AI script generation that returns structured acts via JSON
- [x] **TabStoryboard**: Shot list with shot type, duration, description, notes per shot; add/remove shots; total duration summary; AI storyboard generation
- [x] **TabMusic**: Track list with track name, artist, mood, notes, reference URL; add/remove tracks; AI music suggestion
- [x] **TabIdea**: Enhanced with AI expand button to generate richer ideas
- [x] AI assistant buttons on all tabs using `POST /v1/ai/generate` endpoint with tool-specific prompts and system prompts
- [x] AR/EN translations for all new keys: hook patterns, shot types, storyboard/music UI, AI button labels, tab names
- [x] Fixed type errors: `null` safety with `| undefined` cast, bracket notation for index-signature access (`components['key']`), non-null assertions for array spreads (`updated[index]!`)
- [x] `pnpm lint` ✓ | `pnpm typecheck` ✓ | `pnpm test` ✓ (32 suites, 324 tests)

**Key decisions:**

- All structural data (hook, script, storyboard, music) stored in `components` JSON field as sub-keys to keep ContentPiece model generic
- Each tab receives `components` (merged piece+draft) + `setComponent(key, value)` helper instead of direct `patch` access
- AI buttons use inline async handlers with loading state; content parsed as JSON when API returns structured data, falls back to raw string
- Shared `aiGenerate` callback in parent prevents duplicate API client setup per tab
- `_patch` prefix used for unused `patch` prop in tabs that use `setComponent` instead

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

- 3.14 — AI Tools Library (Round 3: Design + Story + Carousel + Final)
- 3.15 — Frameworks Library

---

## 📈 Velocity Metrics

- Average task completion time: [tracked over time]
- Tasks per week: [tracked]
- Bugs found per phase: [tracked]
- Tests written: 324

```

```
