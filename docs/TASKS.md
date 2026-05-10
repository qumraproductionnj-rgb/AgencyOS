# TASKS.md — Complete Task Breakdown

> هذا الملف يحوي **كل** المهام في كل المراحل. Claude Code يعمل على المهمة المعلّمة بـ `[CURRENT]` فقط.
> بعد إنجاز كل مهمة: حدّث الحالة من `[CURRENT]` إلى `[DONE]` ووسم المهمة التالية بـ `[CURRENT]`.

---

## 📊 Summary

| Phase                              | Tasks  | Est. Sessions | Real Calendar Time (2-4 hrs/day) |
| ---------------------------------- | ------ | ------------- | -------------------------------- |
| Phase 0 — Setup                    | 6      | 6             | 1 week                           |
| Phase 1 — Foundation ✅            | 14/14  | 14            | 3-4 weeks                        |
| Phase 2 — Core Operations          | 18     | 18            | 4-5 weeks                        |
| Phase 3 — Creative & Collaboration | 22     | 22            | 5-6 weeks                        |
| Phase 4 — SaaS Layer               | 12     | 12            | 3 weeks                          |
| **TOTAL**                          | **72** | **72**        | **~16-19 weeks (~4 months)**     |

---

# PHASE 0 — SETUP (Week 1)

**Goal:** A fully running local development environment with all services healthy.

### `[DONE]` 0.1 — Repository Initialization

**Deliverables:**

- Initialize git repo
- Create `pnpm-workspace.yaml` for monorepo
- Folder structure as defined in CLAUDE.md
- Root `package.json` with workspaces
- `.gitignore` (Node, IDE, env, build)
- `.editorconfig`
- `README.md` with setup instructions
- Initial commit pushed to GitHub

**Acceptance:** `pnpm install` runs without errors at root.

---

### `[DONE]` 0.2 — Docker Compose for Local Services

**Deliverables:**

- `docker-compose.yml` with: PostgreSQL 16, Redis 7, MailHog, Meilisearch (for later)
- Health checks on all services
- Persistent volumes
- Network configuration
- `.env.example` with all needed variables documented

**Acceptance:** `docker compose up -d` starts all services healthy. Postgres reachable on 5432.

---

### `[DONE]` 0.3 — TypeScript + Linting Configuration

**Deliverables:**

- Root `tsconfig.json` with strict settings
- ESLint config (typescript-eslint, prettier integration)
- Prettier config (with `prettier-plugin-tailwindcss`)
- Husky pre-commit hooks (lint + typecheck)
- lint-staged config

**Acceptance:** `pnpm lint` and `pnpm typecheck` pass. Pre-commit hook blocks bad commits.

---

### `[DONE]` 0.4 — Backend Scaffold (NestJS)

**Deliverables:**

- `apps/api/` with NestJS 10 scaffold
- Health check endpoint (`/health`)
- Configuration module (env validation with Zod)
- Logging module (pino)
- Standard error handler
- CORS setup
- Helmet (security headers)
- Rate limiting (basic)

**Acceptance:** `pnpm --filter api dev` runs. `curl localhost:3001/health` returns `{ status: "ok" }`.

---

### `[DONE]` 0.5 — Frontend Scaffold (Next.js)

**Deliverables:**

- `apps/web/` with Next.js 14 App Router
- TailwindCSS configured
- shadcn/ui initialized
- next-intl configured (Arabic + English, RTL toggle)
- `app/[locale]/layout.tsx` with HTML dir attribute switching
- Test page demonstrating RTL/LTR
- TanStack Query provider

**Acceptance:** `pnpm --filter web dev` runs. Test page renders correctly in both AR (RTL) and EN (LTR).

---

### `[DONE]` 0.6 — Prisma Setup

**Deliverables:**

- `packages/database/` with Prisma
- `prisma/schema.prisma` with `companies`, `users` tables (minimal)
- Initial migration
- Prisma Client generated
- Database connection from API
- Seed script with 1 demo company + 1 owner user

**Acceptance:** `pnpm db:migrate` works. `pnpm db:seed` creates demo data. API can query the database.

---

# PHASE 1 — FOUNDATION (Weeks 2-5)

**Goal:** A logged-in employee can check in via GPS from a mobile PWA, blocked when outside the radius.

---

### `[DONE]` 1.1 — Database Schema for Phase 1

**Deliverables:**

- Migrations for: `companies`, `users`, `roles`, `permissions`, `user_roles`, `sessions`, `departments`, `employees`, `work_locations`, `attendance_records`, `audit_logs`
- All tables follow standard column rules (Section "Database Standards" in CLAUDE.md)
- RLS policies on all tenant tables
- Indexes on `company_id` and frequently queried fields
- Seed script extended with: 1 company, owner + HR + employee, 1 department, 1 work_location

**Acceptance:** All migrations apply. Seed runs. RLS verified by attempting cross-tenant query (must fail).

---

### `[DONE]` 1.2 — Authentication Tier 2 (Tenant Users)

**Deliverables:**

- `POST /auth/signup` (creates company + owner user, sends verification email)
- `POST /auth/verify-email`
- `POST /auth/login` (returns access + refresh tokens)
- `POST /auth/refresh` (rotates refresh token)
- `POST /auth/logout` (invalidates session)
- `POST /auth/forgot-password` + `POST /auth/reset-password`
- Argon2id password hashing
- JWT with RS256 (separate keys for tenant tier)
- Account lock after 5 failed attempts
- Session tracking (device, IP, last_active)
- Email templates (Arabic + English) sent via Resend

**Acceptance:**

- Can sign up new company → receives verification email → verifies → logs in
- Failed login 5 times → account locked
- Refresh token rotates correctly
- All endpoints have integration tests

---

### `[DONE]` 1.3 — Tenant Context Middleware + RLS Wiring

**Deliverables:**

- NestJS middleware that extracts `company_id` from JWT
- Sets `app.current_company_id` on every Prisma query (via `$queryRaw` or extension)
- Permission guard decorator for routes
- Test: forbid request with valid token but accessing different `company_id` resource

**Acceptance:** RLS isolation tested with two tenant accounts. Cross-tenant access returns 403.

---

### `[DONE]` 1.4 — Roles & Permissions System

**Deliverables:**

- 11 default roles seeded (owner, admin, hr_manager, project_manager, creative_director, designer, video_editor, account_manager, sales, freelancer, client)
- Permission matrix from MasterSpec implemented
- `@RequireRole()` decorator
- `@RequirePermission()` decorator
- Helper service: `permissionService.userCan(userId, action, resource)`
- Frontend hook: `useCan(action, resource)`

**Acceptance:** API endpoints respect permission matrix. Tests cover both grant and deny cases.

---

### `[DONE]` 1.5 — Frontend Layout & Navigation

**Deliverables:**

- 5-step wizard at `/onboarding`:
  1. Company profile (name AR/EN, logo upload, address)
  2. GPS work location setup (map picker with Leaflet)
  3. Default departments
  4. Invite first employees (sends email invitations)
  5. Plan selection (with 14-day trial active)
- Progress saved between steps (server-side)
- Skip/come-back-later option
- Success → redirect to dashboard

**Acceptance:** New owner completes wizard end-to-end. Data correctly saved. Can skip and return.

---

### `[DONE]` 1.6 — Departments CRUD

**Deliverables:**

- API: `GET/POST/PUT/DELETE /departments`
- Frontend: `/settings/departments` with table + create/edit modal
- Soft delete preserves history
- Permission: HR Manager + above

**Acceptance:** Full CRUD works. Cross-tenant isolation verified.

---

### `[DONE]` 1.7 — Employees CRUD

**Deliverables:**

- API: `GET/POST/PUT/DELETE /employees` with all fields from spec
- Includes employee invitation email flow (creates user account on accept)
- Frontend: `/employees` table with filters (department, status, employment_type)
- Frontend: `/employees/[id]` detail page (profile, attendance, leaves, performance — last 3 are placeholders)
- Frontend: `/employees/create` form
- Profile photo upload (to R2)
- Bilingual fields (AR + EN names)

**Acceptance:** HR can create employee, employee receives invite, sets password, logs in.

---

### `[DONE]` 1.8 — Work Locations CRUD with Map

**Deliverables:**

- API: `GET/POST/PUT/DELETE /work-locations`
- Frontend: `/settings/work-locations` with Leaflet map for setting GPS coords
- Configurable radius (slider: 50m - 500m)
- Assign/unassign employees per location
- Multiple locations supported

**Acceptance:** Owner sets office at exact coordinates. Radius shown as circle on map.

---

### `[DONE]` 1.9 — PWA Setup

**Deliverables:**

- `next-pwa` configured for `apps/web/`
- Manifest with Arabic name, icons (192, 512, maskable)
- Service worker for offline caching of shell
- Install prompt UI (banner)
- Apple Touch Icon + iOS metadata
- Geolocation permission flow

**Acceptance:** App can be installed on Android (Chrome) and iOS (Safari add-to-home). Loads offline (shell only).

---

### `[DONE]` 1.10 — GPS Check-In API

**Deliverables:**

- `POST /attendance/check-in` (body: `lat`, `lng`, `device_info`)
- `POST /attendance/check-out`
- Server calculates Haversine distance to nearest assigned work_location
- If `distance > radius` → `403 OUT_OF_RANGE` with payload `{ distance_meters, allowed_radius }`
- If success → record created with status (`present` | `late` based on `scheduled_start_time`)
- `GET /attendance/today` (current user's status)
- `GET /attendance/today/all` (HR view: all employees today)

**Acceptance:**

- Successful check-in within radius
- Blocked check-in outside radius (with helpful error)
- Late detection works (config grace period)
- Comprehensive integration tests

---

### `[DONE]` 1.11 — Check-In UI (Mobile PWA)

**Deliverables:**

- `/check-in` page (mobile-first design)
- Big "Check In" / "Check Out" button (state-aware)
- Real-time location accuracy indicator
- Distance to office indicator (with success/error styling)
- "Why is check-in blocked?" help modal
- Today's attendance summary
- Works in Arabic (RTL) and English

**Acceptance:** Employee opens PWA on phone, allows location, sees button, taps, gets feedback. Tested on Android Chrome and iOS Safari.

---

### `[DONE]` 1.12 — Attendance Dashboard (Web)

**Deliverables:**

- `/attendance` page for HR/Owner
- Live "who's in" widget (real-time via WebSocket)
- Today's status table: present, late, absent, on leave
- Filters: department, status
- Per-employee monthly view (calendar with daily status)
- Export to Excel + PDF
- Manual override for HR with reason logging

**Acceptance:** HR sees real-time status. Can drill into any employee. Manual override audited.

---

### `[DONE]` 1.13 — Audit Logging Infrastructure

**Deliverables:**

- `audit_logs` table populated automatically via NestJS interceptor
- Captures: user, action, entity, old_value, new_value, IP, user_agent
- API: `GET /audit-logs` with filters (Owner/Admin only)
- Frontend: `/admin/audit-logs` viewer with filters

**Acceptance:** Every write operation logged. Logs viewable. Sensitive fields (passwords, tokens) never logged.

---

### `[DONE]` 1.14 — Phase 1 Acceptance Tests

**Deliverables:**

- Playwright E2E suite covering:
  - Tenant signup flow
  - Owner invites employee
  - Employee logs in on simulated mobile
  - Employee checks in (success + range failure)
  - HR sees employee in dashboard
- All 8 tests pass

**Acceptance:** Full E2E green. **Demo session with user. User signs Phase 1 approval before starting Phase 2.**

---

### `[DONE]` 1.15 — Finalize Phase 1

**Deliverables:**

- Verify all Phase 1 tasks complete
- Demo with user
- Fix any remaining issues
- User approval to start Phase 2

**Acceptance:** User signs off. Phase 1 complete.

---

# PHASE 2 — CORE OPERATIONS (Weeks 6-10)

**Goal:** Run a real project end-to-end — from lead capture to invoice payment.

---

### `[DONE]` 2.1 — Database Schema for Phase 2

**Deliverables:**

- Migrations for: `leaves`, `leave_balances`, `payroll_runs`, `payroll_entries`, `performance_reviews`, `leads`, `clients`, `contacts`, `deals`, `quotations`, `invoices`, `payments`, `expenses`, `campaigns`, `projects`, `revisions`, `task_comments`, `task_time_logs`, `files`, `notifications`, `exchange_rates`
- All standard columns + RLS policies + indexes
- Seed extended with sample lead, deal, project, task

**Acceptance:** Migrations clean. Seed creates realistic demo data.

---

### `[DONE]` 2.2 — HR: Leaves Management

**Deliverables:**

- [x] API: leave request CRUD, approve/reject endpoints
- [x] Leave balance calculation (annual reset, accrual)
- [x] Approval chain (>5 days requires Owner approval)
- [x] Frontend: employee leave request form, HR approval queue
- [x] 22 unit tests, full lint + typecheck + test suite (84 passing)

**Acceptance:** Employee submits leave, HR approves, balance updated, calendar reflects.

---

### `[CURRENT]` 2.3 — HR: Payroll

**Deliverables:**

- API: generate monthly payroll run, calculate based on attendance + leaves + overrides
- Per-employee entry with additions/deductions
- Dual currency support (IQD + USD)
- Frontend: payroll dashboard, individual entry view, finalize button
- Export: PDF payslip per employee, Excel summary
- Audit logged

**Acceptance:** Generate payroll for current month. Verify deductions for late days. Export payslip in Arabic.

---

### `[ ]` 2.4 — HR: Performance Reviews

**Deliverables:**

- API: create review with KPIs, score, comments
- Frontend: manager creates review, employee sees their reviews
- KPI templates (reusable)
- History view per employee

**Acceptance:** Manager creates review with 3 KPIs, employee sees it on their profile.

---

### `[ ]` 2.5 — CRM: Leads Pipeline

**Deliverables:**

- API: leads CRUD with pipeline stage transitions
- Frontend: Kanban board (drag-drop between stages)
- Lead detail with notes, follow-up date, activity log
- Conversion: lead → won creates client + deal automatically
- Filters and search

**Acceptance:** Sales adds lead, drags through stages, marks won, client auto-created.

---

### `[ ]` 2.6 — CRM: Clients & Contacts

**Deliverables:**

- API: clients CRUD, multiple contacts per client
- Frontend: clients table, client detail with tabs (overview, contacts, projects, invoices, files)
- VIP/blacklist flagging
- Total revenue calculated from invoices

**Acceptance:** Full CRUD works. Client detail page comprehensive.

---

### `[ ]` 2.7 — Quotations

**Deliverables:**

- API: quotations CRUD, send (generates PDF + unique link), accept (creates project + invoice)
- Line items with quantity, unit price, currency
- Discounts and taxes
- Bilingual templates (Arabic RTL with Puppeteer)
- Validity date and expiration
- Frontend: quotation builder, list, detail
- Email to client with link

**Acceptance:** Create quotation, generate Arabic PDF correctly, send to client, client accepts via link.

---

### `[ ]` 2.8 — Invoices & Payments

**Deliverables:**

- API: invoices CRUD with status lifecycle, record payment, mark overdue
- Recurring invoices (cron job clones)
- Frontend: invoice builder, list, detail, payment recording modal
- PDF generation (Arabic + English)
- Aging report (0-30, 31-60, etc.)
- Email reminders for overdue (background job)

**Acceptance:** Create invoice from quotation, record partial payment, see status change, generate PDF.

---

### `[ ]` 2.9 — Expenses

**Deliverables:**

- API: expense CRUD, approval workflow
- Receipt upload (R2)
- Approval chain by amount thresholds
- Categorization
- Frontend: expense submission form, approval queue, list with filters
- Link to project for project profitability

**Acceptance:** Employee submits expense with receipt, manager approves based on amount.

---

### `[ ]` 2.10 — Campaigns

**Deliverables:**

- API: campaign CRUD
- Frontend: campaigns list per client, detail with linked projects + content plan placeholder
- Budget tracking

**Acceptance:** Create campaign for client, link projects to it.

---

### `[ ]` 2.11 — Projects (Core)

**Deliverables:**

- API: project CRUD with stage transitions, team assignment
- Production pipeline stages enforced (state machine)
- Revision tracking with limit warnings
- Frontend: projects list (filterable), Kanban view, detail with tabs
- Project deliverable upload area

**Acceptance:** Create project, advance through stages, hit revision limit, see warning.

---

### `[ ]` 2.12 — Tasks (Core)

**Deliverables:**

- API: tasks CRUD with subtasks, status transitions, comments, time logs
- @Mentions in comments → notification
- Frontend: tasks list, Kanban board, detail page
- Time tracking with start/stop timer
- Workload view (tasks per assignee)

**Acceptance:** Create tasks under project, assign, comment with @mention, log time.

---

### `[ ]` 2.13 — Files Module (with TUS chunked upload)

**Deliverables:**

- API: file upload (small + chunked TUS), download with signed URLs
- Frontend: file picker, drag-drop, progress bar
- Generic linkage: any entity can attach files
- File preview (image/video/PDF)
- Permissions per file (visible to client toggle)

**Acceptance:** Upload 1GB video file via chunked, file accessible, preview works.

---

### `[ ]` 2.14 — Notifications System (in-app + email)

**Deliverables:**

- API: notifications stream via WebSocket, REST `GET /notifications`, mark read
- Email channel via Resend (Arabic templates)
- Per-user preference panel
- Backend: notification trigger service used by all modules
- Frontend: bell icon with unread count, notification dropdown, settings page

**Acceptance:** Task assignment fires in-app + email notification. User marks as read. Preferences respected.

---

### `[ ]` 2.15 — Exchange Rates Management

**Deliverables:**

- API: set manual rate, get current rate
- Background job: fetch from public API daily (configurable on/off)
- Frontend: settings page for rate management

**Acceptance:** Set rate IQD→USD, used in invoice currency conversion.

---

### `[ ]` 2.16 — Dashboard Refinement

**Deliverables:**

- Owner/Admin dashboard widgets:
  - Revenue this month (IQD + USD split)
  - Active projects count
  - Overdue tasks
  - Today's attendance summary
  - Pending invoices total
  - Pipeline value
  - Top performers
- Role-based widget visibility
- Responsive layout

**Acceptance:** Dashboard loads in <2s. All widgets accurate.

---

### `[ ]` 2.17 — Search (Postgres FTS)

**Deliverables:**

- Backend: full-text search across clients, projects, tasks, files, employees, invoices
- Arabic-aware (basic — Meilisearch comes in Phase 3)
- API: `GET /search?q=`
- Frontend: global search bar with categorized results
- Keyboard shortcut: Cmd+K

**Acceptance:** Search "ahmad" returns matching client, employee, project. Arabic search works.

---

### `[ ]` 2.18 — Phase 2 Acceptance Tests

**Deliverables:**

- Playwright E2E:
  - Lead → Won → Client → Quotation → Project → Tasks → Invoice → Payment
  - Leave request → approval → balance updated
  - Expense submission → approval
  - File upload (large) → preview
- All tests green in CI

**Acceptance:** Full E2E suite passes. **Demo with user. Phase 2 approved before starting Phase 3.**

---

# PHASE 3 — CREATIVE & COLLABORATION (Weeks 11-16)

**Goal:** Full agency creative workflow with Content Studio, AI tools, client portal, and equipment management.

---

### `[ ]` 3.1 — Database Schema for Phase 3

**Deliverables:**

- Migrations: `brand_briefs`, `audience_personas`, `content_pillars`, `content_plans`, `content_pieces`, `content_revisions`, `frameworks`, `content_templates`, `ai_generations`, `assets`, `asset_folders`, `asset_versions`, `equipment`, `equipment_bookings`, `equipment_maintenance`, `exhibitions`, `exhibition_booths`, `booth_inventory`, `exhibition_financials`, `exhibition_settlement`
- Seed Frameworks library (40+ frameworks from ContentStudio spec)

**Acceptance:** All migrations apply. Frameworks seeded.

---

### `[ ]` 3.2 — Asset Library

**Deliverables:**

- API: folders + assets CRUD, version history
- Frontend: asset library with grid/list view, folder navigation, drag-drop upload
- Tags + filters
- Preview pane (image/video/PDF/audio)
- Version comparison
- "Visible to clients" flag

**Acceptance:** Upload, organize, find, preview, version-control assets.

---

### `[ ]` 3.3 — Brand Briefs

**Deliverables:**

- API: brand brief CRUD per client
- Frontend: rich brand brief editor with all sections (voice, personas, visual, cultural)
- Persona builder sub-form (1-N personas per brief)
- Color picker, font selector

**Acceptance:** Create complete Brand Brief for "معسل أحمد", all fields saved.

---

### `[ ]` 3.4 — Content Pillars

**Deliverables:**

- API: pillars CRUD per client
- Frontend: pillars manager with color, icon, percentage target

**Acceptance:** Define 4 pillars for client with percentage distribution.

---

### `[ ]` 3.5 — AI Service Layer

**Deliverables:**

- `packages/ai/` with Anthropic client wrapper
- Centralized prompt registry (loaded from DB, editable)
- Model selection logic (sonnet for default, opus for premium)
- Token counting + cost tracking
- Rate limiting per subscription plan
- All AI calls logged to `ai_generations` table

**Acceptance:** Test prompt call works, logged correctly, cost calculated.

---

### `[ ]` 3.6 — Content Plan Wizard

**Deliverables:**

- 4-step wizard:
  1. Context (client + month + campaign)
  2. Objectives + distribution
  3. Idea generation (50 ideas, select 30)
  4. Calendar arrangement
- Loads Brand Brief + Pillars automatically
- AI generation in step 3 (uses Idea Generator tool)
- Drag-drop calendar in step 4

**Acceptance:** Create monthly plan in one sitting, all data saved.

---

### `[ ]` 3.7 — Content Piece Editor (Universal Shell)

**Deliverables:**

- `/content-pieces/[id]` page
- Persistent context sidebar (Brand Brief, Audience, Pillar)
- Tab system that adapts to piece type
- Autosave every 2s
- Stage transition controls
- Comment + revision history sidebar

**Acceptance:** Open any content piece, see appropriate editor for its type.

---

### `[ ]` 3.8 — Content Editor: Video / Reel

**Deliverables:**

- Tabs: Idea, Hook, Script, Storyboard, Music, Caption
- Each tab has appropriate AI assistant
- Storyboard: shot list with shot type, duration, notes
- Script: structured by acts/sections

**Acceptance:** Create complete reel content piece using all tabs.

---

### `[ ]` 3.9 — Content Editor: Static Design

**Deliverables:**

- Tabs: Idea, Texts (headline/sub/body/CTA), Visual Direction, Caption
- Headline tester (AI scoring 1-10)
- Layout selector (F-pattern/Z-pattern/centered)
- Color palette generator/extractor

**Acceptance:** Create complete static design brief.

---

### `[ ]` 3.10 — Content Editor: Story

**Deliverables:**

- Frame sequence builder (3-7 frames)
- Per-frame: visual, text, sticker, interactive element
- Duration per frame

**Acceptance:** Build 5-frame story sequence.

---

### `[ ]` 3.11 — Content Editor: Carousel

**Deliverables:**

- Slide builder (2-10 slides)
- Per-slide: headline, body, visual brief
- Special hook slide + CTA slide

**Acceptance:** Build 7-slide carousel.

---

### `[ ]` 3.12 — AI Tools Library (Round 1: Strategic + Ideation)

**Deliverables (each as a standalone tool with prompt template):**

- Brand Voice Builder
- Audience Persona Builder
- Content Pillars Designer
- Big Idea Generator
- Hook Lab
- Headline Tester

**Acceptance:** Each tool produces useful, brand-aligned output.

---

### `[ ]` 3.13 — AI Tools Library (Round 2: Video)

**Deliverables:**

- Script Writer (with framework selection)
- Storyboard Builder
- Voiceover Polisher
- Music Mood Suggester
- B-roll Planner
- Thumbnail Concept Generator
- Video Prompt Generator (Seedance bilingual JSON per Ru'ya skill)

**Acceptance:** Each tool tested with real Ru'ya scenarios.

---

### `[ ]` 3.14 — AI Tools Library (Round 3: Design + Story + Carousel + Final)

**Deliverables:**

- Visual Direction Generator
- Color Palette Extractor + Generator
- Typography Pair Suggester
- Image Prompt Generator (Midjourney/DALL-E)
- Story Sequence Builder
- Carousel Outliner
- Caption Writer (brand voice enforced)
- Hashtag Researcher (categorized: mass/niche/branded)
- CTA Generator
- Tone Checker
- Cultural Sensitivity Check (Iraqi/Arab market)

**Acceptance:** Full toolkit available in Content Studio sidebar.

---

### `[ ]` 3.15 — Frameworks Library (Interactive)

**Deliverables:**

- Frameworks catalog (40+ from spec) loaded from DB
- Each framework as interactive form (fields generated from JSON Schema)
- "Use this framework" button on Content Piece editor
- Framework recommendation engine (suggests best framework for content type + objective)

**Acceptance:** Select AIDA framework, fill fields, generate full content from filled framework.

---

### `[ ]` 3.16 — Smart Integrations (Phase 3 cross-module)

**Deliverables:**

- Content Plan approval → auto-creates tasks per piece (with proper roles + lead times)
- Content Piece "approved" → file goes to Asset Library
- Content Piece "scheduled" → appears on Calendar module
- Equipment booking auto-suggested from video pieces

**Acceptance:** End-to-end flow tested.

---

### `[ ]` 3.17 — Content Calendar (Module replacement)

**Deliverables:**

- Monthly + weekly views
- Drag-drop scheduling
- Filters: client, platform, status
- Preview popovers

**Acceptance:** Full calendar working with content pieces.

---

### `[ ]` 3.18 — Client Portal (Tier 3 auth + UI)

**Deliverables:**

- Separate Next.js app at `apps/portal/`
- Auth Tier 3 (external user)
- Client dashboard: their projects, files awaiting approval, invoices
- File annotation tool:
  - Video: timestamp comments
  - Image: x,y region comments
  - PDF: page + region
- Approve / Request Revision flow

**Acceptance:** Client logs in, reviews video with timestamp comment, requests revision, sees status update.

---

### `[ ]` 3.19 — Telegram Notifications

**Deliverables:**

- Single platform-wide bot (@AgencyOSBot)
- User linking: deep-link with one-time token
- Per-user notification preference includes Telegram channel
- Background sender with queue

**Acceptance:** User links Telegram, receives task assignment in chat.

---

### `[ ]` 3.20 — Equipment Management

**Deliverables:**

- API: equipment CRUD, bookings (with conflict detection), maintenance log
- QR code generation per equipment item
- Frontend: equipment library, calendar view, booking form, maintenance log
- "Suggest equipment" for video projects

**Acceptance:** Book camera for project, conflict prevented, return logged.

---

### `[ ]` 3.21 — Exhibition Management (Ru'ya specific)

**Deliverables:**

- API: exhibitions, booths, inventory, financials, settlement
- Frontend: exhibition setup, booth management, inventory tracking, financial entries, settlement report
- Multi-brand booth support (like Najaf experience)

**Acceptance:** Full exhibition lifecycle from planning to settlement.

---

### `[ ]` 3.22 — Phase 3 Acceptance Tests + Demo

**Deliverables:**

- E2E tests for:
  - Brand Brief creation → Plan creation → Pieces → Approval → Schedule
  - Client portal: video annotation + revision request
  - Equipment booking with conflict
  - AI tool outputs validated
- Demo session

**Acceptance:** All tests green. **Phase 3 approved.**

---

# PHASE 4 — SAAS LAYER (Weeks 17-19)

**Goal:** Sell to other agencies. Subscription, billing, super admin, white-label.

---

### `[ ]` 4.1 — Subscription Plans

**Deliverables:**

- DB tables: `subscription_plans`, `subscriptions`, `plan_features`
- Plans seeded: Starter, Professional, Agency, Enterprise
- Feature flags loaded per tenant
- Backend enforcement: every API call checks plan limits
- Frontend: locked features show upgrade prompt with comparison

**Acceptance:** Starter tenant blocked from creating 6th employee; sees upgrade prompt.

---

### `[ ]` 4.2 — Stripe Integration

**Deliverables:**

- Stripe customer + subscription creation
- Webhook handlers (subscription.created/updated/deleted, invoice.paid/failed)
- Frontend: payment method form, plan selection, change plan, cancel
- Trial → paid conversion

**Acceptance:** Sign up, start trial, add card, convert to paid, change plan, cancel.

---

### `[ ]` 4.3 — Local Payment Gateway (Iraqi market)

**Deliverables:**

- Research + integration of one of: FastPay, ZainCash, FIB
- Manual bank transfer flow as fallback (admin marks as paid)
- Frontend: payment method selector

**Acceptance:** Local Iraqi tenant pays via local method.

---

### `[ ]` 4.4 — Tenant Lifecycle Management

**Deliverables:**

- Background job: trial expiry warnings (3 days, 1 day, expiry)
- Status transitions: trial → active → past_due → read_only → suspended → anonymized
- Email notifications at each transition
- Grace periods configured per stage

**Acceptance:** Simulate trial expiry, verify status transitions and notifications.

---

### `[ ]` 4.5 — Platform Admin Panel

**Deliverables:**

- Separate Next.js app at `apps/admin/`
- Auth Tier 1 (super admin)
- Dashboards: total tenants, MRR, churn, active users
- Per-tenant view: status, subscription, usage stats
- Manual actions: extend trial, change plan, suspend, refund

**Acceptance:** Super admin can manage entire platform.

---

### `[ ]` 4.6 — Billing UI for Tenants

**Deliverables:**

- `/settings/billing` page for Owner role only
- Current plan + usage meters
- Invoice history (Stripe invoices)
- Payment method management
- Plan comparison + upgrade flow

**Acceptance:** Tenant Owner sees billing, upgrades plan.

---

### `[ ]` 4.7 — Reports & Analytics (Tenant-level)

**Deliverables:**

- All reports from MasterSpec Module 16:
  - Financial: revenue, profitability, expenses, aging
  - Operations: completion rate, delivery time, revisions
  - HR: attendance, leaves, performance
  - Sales: conversion, pipeline, win/loss
- Date range filters, export Excel/PDF
- Scheduled email delivery (weekly/monthly)

**Acceptance:** Each report category functional with export.

---

### `[ ]` 4.8 — Webhook System (External Integrations)

**Deliverables:**

- Tenants can register webhooks for events
- Signature verification (HMAC-SHA256)
- Retry logic with exponential backoff
- Webhook delivery log

**Acceptance:** Register webhook, trigger event, verify delivery.

---

### `[ ]` 4.9 — White-Label Option (Agency plan)

**Deliverables:**

- Custom subdomain support (`{tenant}.agencyos.app` or own domain)
- Custom logo, colors in tenant settings
- "Powered by AgencyOS" toggle (only on Agency plan)
- White-labeled emails

**Acceptance:** Agency-plan tenant uses own branding throughout.

---

### `[ ]` 4.10 — Customer Support

**Deliverables:**

- In-app help center (markdown articles)
- Contact form → ticket system
- Knowledge base seeded with 20+ articles in AR + EN

**Acceptance:** User finds answer in help center; submits support ticket.

---

### `[ ]` 4.11 — Marketing Site

**Deliverables:**

- Public site at `agencyos.app/` (separate Next.js app or pages in `web`)
- Pages: home, features, pricing, about, contact, privacy, terms
- Bilingual (AR + EN with detected default)
- SEO optimization
- Sign-up CTA throughout

**Acceptance:** Visitor can land, learn, sign up.

---

### `[ ]` 4.12 — Phase 4 Acceptance + Production Launch

**Deliverables:**

- Full E2E covering signup-to-payment
- Load testing (k6, target: 1000 concurrent users)
- Security audit checklist (OWASP top 10)
- Production deployment to Hetzner VPS
- Monitoring (Sentry + UptimeRobot)
- Backup verification
- Documentation finalization

**Acceptance:** Live production. First external tenant signs up successfully. **Project complete.**

---

# 🎯 HOW TO USE THIS FILE

1. Find the task marked `[CURRENT]`
2. Tell Claude Code: "اشتغل على المهمة [CURRENT] في TASKS.md. اقرأها كاملة، ابدأ بـ checklist، ثم نفّذ."
3. After each task: update `[CURRENT]` → `[DONE]`, then mark next task as `[CURRENT]`
4. Update `PROGRESS.md` at end of each task
5. Don't skip tasks. Don't combine tasks.

---

# 🚨 EMERGENCY HALT CONDITIONS

Stop development immediately if:

- Cross-tenant data leak detected
- Authentication bypass discovered
- Data loss incident
- More than 3 tasks in a row failing acceptance

Notify user and document in `DECISIONS.md` before resuming.
