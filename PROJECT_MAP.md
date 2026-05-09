# PROJECT_MAP.md — Architectural Map for AgencyOS

> Last updated: 2026-05-09T16:04 UTC+3
> System date verified: 2026-05-09
> Runtime: Node v22.14.0 | pnpm 10.33.2 | Docker 29.3.1 / Compose v5.1.1
> Repository: E:\V (git root) | 72 tasks across 5 phases | Current: Phase 1

---

## [TECH_STACK] — Locked Stack with Stable Version Audit

### ✅ Current Stack (Installed & Working)

| Layer              | Technology          | Version          | Status               |
| ------------------ | ------------------- | ---------------- | -------------------- |
| Monorepo           | pnpm workspaces     | 10.33.2          | ✅ operational       |
| Package Manager    | pnpm                | 10.33.2          | ✅                   |
| Node.js Runtime    | Node.js             | 22.14.0 LTS      | ✅                   |
| Container Engine   | Docker              | 29.3.1           | ✅                   |
| Orchestration      | Docker Compose      | v5.1.1           | ✅                   |
| Backend Framework  | NestJS              | 10 (locked)      | ✅ (scaffold 0.4)    |
| Frontend Framework | Next.js + React     | 14 + 18 (locked) | ✅ (scaffold 0.5)    |
| ORM                | Prisma              | 5 (locked)       | ✅ (migration 0.6)   |
| Language           | TypeScript          | 5.7+ strict      | ✅ (escaped `5.7.2`) |
| Validator          | Zod                 | 3 (locked)       | ✅                   |
| Client State       | Zustand             | 4 (locked)       | —                    |
| Server State       | TanStack Query      | 4 (locked)       | ✅ (provider)        |
| i18n               | next-intl           | 3 (locked)       | ✅ (AR + EN RTL)     |
| Styling            | TailwindCSS         | 3 (locked)       | ✅                   |
| Component Lib      | shadcn/ui           | —                | ✅                   |
| Auth Hashing       | argon2              | 0.44.x           | ✅ (Argon2id)        |
| JWT                | jose                | 6.2.x            | ✅ (RS256)           |
| Dates              | date-fns            | 2 (locked)       | —                    |
| Charts             | Recharts            | —                | —                    |
| PWA                | next-pwa            | —                | —                    |
| Queue              | BullMQ              | —                | —                    |
| Uploads            | TUS protocol        | —                | —                    |
| PDF                | Puppeteer           | —                | —                    |
| Object Storage     | Cloudflare R2       | —                | env vars only        |
| Email Dev          | MailHog             | Docker           | ✅                   |
| Email Prod         | Resend              | —                | env vars only        |
| Messaging          | Telegram Bot API    | —                | env vars only        |
| Payment            | Stripe              | —                | env vars only        |
| Monitoring         | Sentry              | —                | env vars only        |
| Analytics          | Plausible           | —                | —                    |
| Payment Local      | FastPay placeholder | —                | env vars only        |

### ⚠️ Version Gap Alert — Latest Stable vs Locked

The CLAUDE.md locks specific versions. The following newer stable releases exist but are NOT adopted without explicit approval:

| Package        | Locked | Latest Stable (2026-05-09) | Gap      | Risk to Upgrade                                                                                                                                                                     |
| -------------- | ------ | -------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js        | 14     | **16.2.6**                 | +2 major | App Router changes, Turbopack migration, `next.config` breaking changes, image optimization API changes. HIGH EFFORT.                                                               |
| React          | 18     | **19.2.6**                 | +1 major | New compiler (React Forget), concurrent features stable by default, hooks API changes, strict mode changes, server component subtle differences. Requires Next.js 15+. HIGH EFFORT. |
| TypeScript     | 5.7    | **6.0.3**                  | +1 major | New type engine, isolated declarations, improved type inference. Some edge cases break. MODERATE EFFORT.                                                                            |
| NestJS         | 10     | **11.1.19**                | +1 major | Standalone apps, better ESM support, major decorator internal changes. HIGH EFFORT if already heavily invested.                                                                     |
| Prisma         | 5      | **7.8.0**                  | +2 major | Accelerate/Pulse built-in, relation queries rewritten, `PrismaClient` initialization changes. MIGRATION NEEDED.                                                                     |
| TailwindCSS    | 3      | **4.3.0**                  | +1 major | CSS-first config (`@import "tailwindcss"` no JS config). All `@apply` and custom configs break. HIGH EFFORT.                                                                        |
| Zustand        | 4      | **5.0.13**                 | +1 major | Improved React 19 compat, minor API changes. LOW EFFORT.                                                                                                                            |
| TanStack Query | 4      | **5.100.9**                | +1 major | Better suspense, `useSuspenseQuery`, infinite query API changes. MODERATE EFFORT.                                                                                                   |
| Zod            | 3      | **4.4.3**                  | +1 major | Pipeline API (`z.pipe()`), improved error messages, transformer changes. MODERATE EFFORT.                                                                                           |
| date-fns       | 2      | **4.1.0**                  | +2 major | Fully tree-shakable, ESM-first, API renames. MODERATE EFFORT.                                                                                                                       |
| next-intl      | 3      | **4.11.1**                 | +1 major | Better RTL support, deep App Router integration, middleware changes. MODERATE EFFORT.                                                                                               |
| Redis (server) | 7      | **5.12.1**                 | +1 major | New RESP3 protocol, improved ACLs, some compatibility breaking. Docker image swap needed. LOW EFFORT.                                                                               |

**Decision Log:** G-AP-01. Version upgrades deferred to Phase 4 (pre-launch audit). Reason: avoiding cascading breaking changes mid-development. If any package is incompatible with installed Node 22 (e.g., NestJS 10 might have ESM issues), file a bug — do NOT upgrade silently.

### Deprecated Packages Explicitly Banned

| Package                           | Reason                                                                   | Ban Source                      |
| --------------------------------- | ------------------------------------------------------------------------ | ------------------------------- |
| pdfkit                            | Arabic RTL rendering broken (tested: فاتورة رقم ١٢٣ بمبلغ 5,000,000 د.ع) | ADR-003, MasterSpec §5          |
| moment.js                         | Bloated, replaced by date-fns                                            | CLAUDE.md §Internationalization |
| redux                             | Excessive boilerplate, replaced by Zustand                               | CLAUDE.md §Tech Stack           |
| axios                             | Replaced by fetch via TanStack Query                                     | Conventions                     |
| request                           | Deprecated upstream                                                      | Security                        |
| class-validator/class-transformer | MasterSpec mentions but CLAUDE.md locks Zod. Zod chosen for consistency. | ADR pending                     |

### 🔴 CRITICAL: MasterSpec vs CLAUDE.md Contradiction on Password Hashing

| Source               | Algorithm             | Config                   |
| -------------------- | --------------------- | ------------------------ |
| MasterSpec §10       | **bcrypt** cost 12    | "bcrypt, cost factor 12" |
| CLAUDE.md §Security  | **Argon2id**          | 64MB memory, t=3, p=4    |
| DECISIONS.md ADR-002 | **Argon2id** (chosen) | OWASP recommended        |

**Resolution:** Argon2id wins. ADR-002 supersedes MasterSpec. The MasterSpec §10 Security table MUST be updated in the next review cycle. Codebase already implements Argon2id (verified in Task 1.2 completion log).

---

## [SYSTEM_FLOW] — Complete User Journeys & Data Flow Diagrams

### Flow 0: Project Architecture Data Flow (Physical)

```
┌─────────────┐     HTTPS       ┌──────────────┐     Prisma/Raw     ┌──────────────┐
│  Browser     │ ────────────→  │  Next.js Apps  │ ──────────────→  │  NestJS API   │
│  PWA         │                 │  (web:3000)    │                  │  (api:3001)   │
│  Mobile      │                 │  (portal:3003) │                  │               │
└─────────────┘                 │  (admin:3002)  │                  │               │
                                └──────────────┘                   │               │
                                        │                          │               │
                                        │ WebSocket                 │               │
                                        ▼                          ▼               │
                                ┌──────────────┐           ┌──────────────────┐    │
                                │  Redis 7      │ ◄──────→ │  PostgreSQL 16    │    │
                                │  :6379        │           │  :5433           │    │
                                │  Cache/Queue  │           │  + RLS enforced  │    │
                                │  BullMQ Jobs  │           │  audit_logs      │    │
                                └──────────────┘           └──────────────────┘    │
                                        │                          │               │
                                        ▼                          ▼               │
                                ┌──────────────┐           ┌──────────────────┐    │
                                │  MailHog      │           │  Cloudflare R2    │    │
                                │  :8025        │           │  Object Storage   │    │
                                │  Dev Email    │           │  (files/assets)   │    │
                                └──────────────┘           └──────────────────┘    │
                                                                                   │
                                ┌──────────────┐           ┌──────────────────┐    │
                                │  Meilisearch  │           │  Anthropic API    │    │
                                │  :7700        │           │  (AI tools)       │    │
                                │  Search (Ph3) │           └──────────────────┘    │
                                └──────────────┘                                   │
                                                                                   │
                                Services running via: docker-compose.yml            │
                                Persistent volumes: postgres_data, redis_data      │
                                Network: agencyos_network (bridge)                  │
```

### Flow 1: Complete Tenant Lifecycle (Phase 1 → Phase 4)

```
[Anonymous Visitor]
    │
    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  SIGNUP FLOW (1.2)                                                            │
│                                                                               │
│  1. POST /auth/signup → creates companies + users rows                        │
│     - company_id auto-generated via gen_random_uuid()                        │
│     - owner user created with hashed password (Argon2id)                     │
│     - verification token stored in Redis (TTL 24h)                            │
│     - email sent via MailHog (dev) / Resend (prod)                            │
│                                                                               │
│  2. User clicks verification link in email                                    │
│     - POST /auth/verify-email with token                                     │
│     - email_verified_at set on users row                                       │
│     - token consumed (deleted from Redis)                                      │
│                                                                               │
│  3. POST /auth/login (first login)                                            │
│     - Argon2id verify → JWT RS256 access token (15min)                        │
│     - Refresh token (7 day) stored in sessions table (SHA-256 hash)           │
│     - 5 failed attempts → account LOCKED for 15min (HTTP 423)                 │
│                                                                               │
│  4. ONBOARDING WIZARD (1.5, 5 steps) — server-side progress saved             │
│     Step 1: Company profile (name AR/EN, logo upload to R2, address)          │
│     Step 2: GPS work location (Leaflet map picker, radius slider)             │
│     Step 3: Default departments (at least 1 required)                         │
│     Step 4: Invite first employees (email invitations, creates user on accept) │
│     Step 5: Plan selection (14-day trial auto-activated)                      │
│                                                                               │
│  5. ACTIVE state begins                                                       │
│     - 14-day trial on Professional plan                                       │
│     - Feature flags loaded per plan                                           │
│     - Access to Phase 1 features (attendance, employees)                      │
└──────────────────────────────────────────────────────────────────────────────┘
    │
    ▼ (14 days later, if no payment)
┌──────────────────────────────────────────────────────────────────────────────┐
│  TENANT LIFECYCLE STATUS MACHINE (4.4)                                        │
│                                                                               │
│  trial ──(trial expires)──→ past_due ──(14 days grace)──→ read_only           │
│    │                            │                              │               │
│    ├──(pays)──→ active          ├──(pays)──→ active            │               │
│    │                            │                              │               │
│    │                            │                              │               │
│    ▼                            ▼                              ▼               │
│  (3/1 day warning emails)   (warning emails)              suspended           │
│                                                               │               │
│                                                               ├──(pays)──→ act.│
│                                                               │               │
│                                                               ▼ (90 days)      │
│                                                          anonymized            │
│                                                          (data deleted +       │
│                                                           legal retention)     │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Verifiable gates:**

- G1.1: `POST /auth/signup` returns 201 + creates rows in companies + users (Task 1.2 ✅)
- G1.2: Verification email body has correct link with valid token (Task 1.2 ✅)
- G1.3: `POST /auth/login` with 5 wrong passwords → HTTP 423 LOCKED (Task 1.2 ✅)
- G1.4: Onboarding wizard completes all 5 steps → redirect to `/dashboard` (Task 1.5 ❌)
- G1.5: Tenant lifecycle simulates trial → past_due → read_only → suspended → anonymized (Task 4.4 ❌)

### Flow 2: Employee Day (Phase 1 Critical Path — PWA GPS Check-in)

```
[Employee opens PWA on phone]
    │
    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  PWA INSTALL FLOW (1.9)                                                       │
│                                                                               │
│  1. Browser detects PWA capability (manifest.json + service worker)           │
│  2. "Add to Home Screen" banner (Android Chrome / iOS Safari)                  │
│  3. Install → icon on homescreen with Arabic name                              │
│  4. Opens as standalone app (no browser chrome)                                │
│  5. Service worker caches shell for offline loading                            │
│  6. Geolocation permission requested on first check-in attempt                │
└──────────────────────────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  GPS CHECK-IN FLOW (1.10 + 1.11)                                              │
│                                                                               │
│  1. Employee opens PWA → sees large "Check In" / "Check Out" button           │
│  2. App requests GPS position (navigator.geolocation.getCurrentPosition)       │
│     - iOS Safari: requires user gesture (button tap counts)                    │
│     - HTTPS required (PWA enforces)                                           │
│     - Accuracy indicator shown (e.g., "±10m")                                 │
│                                                                               │
│  3. POST /attendance/check-in with { lat, lng, device_info }                  │
│     - device_info: { userAgent, deviceId, appVersion }                        │
│                                                                               │
│  4. Server-side (NestJS): Haversine distance calculation                      │
│     4a. SELECT nearest assigned_work_location for employee                    │
│     4b. d = 2 * R * arcsin(√(hav(Δφ) + cos(φ1)⋅cos(φ2)⋅hav(Δλ)))             │
│     4c. IF d <= allowed_radius → SUCCESS                                      │
│         - Determine status:                                                    │
│           IF check_in_time > scheduled_start + grace_period → 'late'          │
│           ELSE → 'present'                                                     │
│         - INSERT attendance_record                                             │
│         - Return 201 with record                                               │
│     4d. IF d > allowed_radius → BLOCKED                                       │
│         - Return 403 OUT_OF_RANGE                                              │
│         - Payload: { distance_meters, allowed_radius }                         │
│         - Frontend shows: "أنت على بعد X متر من المكتب"                       │
│                                                                               │
│  5. CHECK-OUT                                                                 │
│     - POST /attendance/check-out                                              │
│     - Updates check_out_time, check_out_lat, check_out_lng                    │
│     - work_hours_calculated = check_out - check_in                            │
│                                                                               │
│  6. HR DASHBOARD (1.12) — real-time via WebSocket                             │
│     - "Live who's in" widget                                                   │
│     - Today's status table: present | late | absent | on_leave                │
│     - Filters: department, status                                             │
│     - Monthly calendar view per employee                                      │
│     - Export Excel + PDF                                                      │
│     - Manual override (HR Only): reason text + audit-logged                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Verifiable gates:**

- G2.1: PWA installable from browser (manifest + SW) (Task 1.9 ❌)
- G2.2: `POST /attendance/check-in` returns 201 when within radius (Task 1.10 ❌)
- G2.3: `POST /attendance/check-in` returns 403 when outside radius + useful error (Task 1.10 ❌)
- G2.4: Late detection works (configurable grace period) (Task 1.10 ❌)
- G2.5: HR dashboard shows real-time attendance (Task 1.12 ❌)

### Flow 3: Lead-to-Cash (Phase 2 Critical Path — Full Business Cycle)

```
[Sales Rep opens CRM]
    │
    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  1. LEAD CREATION (2.5)                                                       │
│     - Sales adds lead: company_name, contact, phone, email, source            │
│     - Pipeline stage: 'new' (default)                                         │
│     - Kanban board with drag-drop across stages                               │
│     - Stages: new → contacted → meeting_scheduled → proposal_sent →           │
│               negotiation → won / lost                                        │
│                                                                               │
│  2. LEAD → WON → AUTOMATION                                                   │
│     - Creates client record (2.6)                                              │
│     - Creates deal record (status = won)                                       │
│     - Triggers: "Create campaign now?" + "Create quotation now?"               │
│                                                                               │
│  3. QUOTATION CREATION (2.7)                                                   │
│     - Quotation builder: line items, quantity, unit_price, currency           │
│     - Discounts (% or flat), taxes                                            │
│     - Bilingual (AR/EN with Puppeteer PDF)                                    │
│     - Unique portal link generated: `portal.agencyos.app/q/{token}`            │
│     - Status: draft → sent → viewed → accepted/rejected                       │
│     - Validity date + expiration                                               │
│                                                                               │
│  4. CLIENT ACCEPTS VIA PORTAL                                                  │
│     - Client clicks link → views Arabic PDF                                    │
│     - Clicks "Accept" → digital acceptance (IP + timestamp logged)            │
│     - System auto-creates:                                                     │
│       a. Project (status: planning)                                           │
│       b. Invoice (status: draft)                                              │
│                                                                               │
│  5. PROJECT MANAGEMENT (2.11)                                                  │
│     - Production pipeline stages enforced (state machine)                      │
│     - Team assignment (PM + Creative Director + team members)                  │
│     - Revision tracking (revision_limit, revision_count)                       │
│     - Kanban view + detail with tabs                                          │
│                                                                               │
│  6. TASK CREATION (2.12)                                                       │
│     - Tasks under project with subtasks                                        │
│     - @Mentions in comments → notification                                     │
│     - Time tracking with start/stop timer                                      │
│     - Workload view per assignee                                               │
│                                                                               │
│  7. INVOICE → PAYMENT (2.8)                                                    │
│     - Invoice status lifecycle: draft → sent → partially_paid → paid / overdue │
│     - Payment recording (cash, bank transfer, gateway)                         │
│     - Recurring invoices (retainers via cron)                                  │
│     - Aging report (0-30, 31-60, 61-90, 90+ days)                             │
│     - Email reminders for overdue (background job via BullMQ)                  │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Verifiable gate:** Full E2E test covering steps 1-7 passes in CI (Task 2.18 ❌).

### Flow 4: Content Studio Pipeline (Phase 3 Critical Path)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  1. BRAND BRIEF (3.3) — One-time per client                                   │
│     - Brand identity (name AR/EN, story, mission, vision)                     │
│     - Tone of voice (formal/friendly/witty/professional)                       │
│     - Voice dos/donts, brand keywords, banned words                            │
│     - Target personas (1-3, with demographics + psychographics)                │
│     - Visual identity (colors, fonts, logos, mood)                             │
│     - Cultural context (Iraqi/Arab market considerations)                      │
│     - Competitors analysis                                                     │
│                                                                               │
│  2. CONTENT PILLARS (3.4) — 3-5 per client                                    │
│     - Each pillar: name, description, color, icon, % target                    │
│     - Example: "التراث الحضاري" (35%), "تجربة المنتج" (30%)                    │
│                                                                               │
│  3. CONTENT PLAN WIZARD (3.6) — Monthly, 4 steps                              │
│     Step 1: Client + month + campaign (auto-loads Brand Brief + Pillars)      │
│     Step 2: Objectives + distribution (type counts, pillar percentages)       │
│     Step 3: AI generates 50 ideas → select 30                                 │
│     Step 4: Calendar arrangement (drag-drop, auto-distribution)                │
│     → Plan created with 30 Content Pieces in 'idea' stage                     │
│                                                                               │
│  4. CONTENT PIECE EDITOR (3.7) — Universal shell, adapts by type              │
│     - Persistent context sidebar (Brand Brief, Audience, Pillar)               │
│     - Tabs adapt by type (see below)                                          │
│     - Autosave every 2s                                                        │
│     - Stage transition controls                                                │
│     - Comment + revision history sidebar                                       │
│                                                                               │
│     4a. VIDEO / REEL (3.8)                                                     │
│         Tabs: Idea | Hook | Script | Storyboard | Music | Caption              │
│         • Storyboard: shot list with type, angle, movement, duration           │
│         • Script: structured by acts/sections with timing                      │
│                                                                               │
│     4b. STATIC DESIGN (3.9)                                                    │
│         Tabs: Idea | Texts (headline/sub/body/CTA) | Visual Direction | Caption│
│         • Headline tester (AI scoring 1-10)                                    │
│         • Layout selector (F-pattern/Z-pattern/centered)                       │
│         • Color palette generator/extractor                                    │
│                                                                               │
│     4c. STORY (3.10)                                                           │
│         Frame sequence builder (3-7 frames) with per-frame: visual/text/sticker│
│                                                                               │
│     4d. CAROUSEL (3.11)                                                        │
│         Slide builder (2-10 slides) with hook slide + CTA slide                │
│                                                                               │
│  5. AI TOOLS (3.12-3.14) — 20 tools in 4 rounds                               │
│     Round 1 (3.12): Brand Voice Builder, Audience Persona Builder,             │
│                     Content Pillars Designer, Big Idea Generator,              │
│                     Hook Lab, Headline Tester                                  │
│     Round 2 (3.13): Script Writer, Storyboard Builder, Voiceover Polisher,     │
│                     Music Mood Suggester, B-roll Planner,                      │
│                     Thumbnail Concept Generator, Video Prompt Generator         │
│     Round 3 (3.14): Visual Direction, Color Palette, Typography Pair,          │
│                     Image Prompt, Story Sequence, Carousel Outliner,           │
│                     Caption Writer, Hashtag Researcher, CTA Generator,         │
│                     Tone Checker, Cultural Sensitivity Check                   │
│                                                                               │
│  6. FRAMEWORKS LIBRARY (3.15) — 40+ frameworks                                 │
│     - Interactive forms generated from JSON Schema                             │
│     - Framework recommendation engine                                          │
│     - "Use this framework" button on Content Piece editor                      │
│                                                                               │
│  7. SMART INTEGRATIONS (3.16)                                                  │
│     • Plan approval → auto-creates tasks per piece (with lead times)           │
│     • Piece approved → file goes to Asset Library                              │
│     • Piece scheduled → appears on Calendar                                    │
│     • Equipment booking auto-suggested from video pieces                       │
│                                                                               │
│  8. CLIENT PORTAL REVIEW (3.18)                                                │
│     - Video: timestamp comments (e.g., "0:24 أريد تكبير الشعار هنا")          │
│     - Image: x,y region comments                                               │
│     - PDF: page + region comments                                              │
│     - Approve / Request Revision with one click                                │
│                                                                               │
│  9. PUBLISH + ANALYTICS                                                        │
│     - Scheduled → auto-publish (if API connected) or manual                    │
│     - Metrics: reach, impressions, likes, shares, saves, watch_time            │
│     - Monthly report auto-generated                                            │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Verifiable gate:** Full E2E: Brand Brief → Plan → 30 pieces → AI tools → Client approval (Task 3.22 ❌).

### Flow 5: Authentication Token Lifecycle

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  TOKEN LIFECYCLE                                                              │
│                                                                               │
│  Access Token:                                                               │
│  - Type: JWT RS256-signed                                                      │
│  - Payload: { sub, companyId, tier, jti, iss, aud }                            │
│  - TTL: 15 minutes                                                             │
│  - Issuer (iss): 'agencyos-api'                                                │
│  - Audience (aud): 'agencyos:tenant' / 'agencyos:platform' / 'agencyos:ext'    │
│  - Key rotation: 3 separate RSA-2048 keypairs (one per tier)                   │
│                                                                               │
│  Refresh Token:                                                               │
│  - Type: 256-bit random, stored as SHA-256 hash                               │
│  - Table: sessions (id, user_id, company_id, token_hash, device_info,         │
│    ip_address, expires_at, revoked_at, created_at)                             │
│  - TTL: 7 days                                                                 │
│  - Rotation: each /refresh returns new pair, old refresh marked revoked_at     │
│                                                                               │
│  Auth Flow:                                                                    │
│  1. POST /auth/login → { accessToken, refreshToken, expiresIn }               │
│  2. Every API call: Authorization: Bearer {accessToken}                        │
│  3. If 401: client calls POST /auth/refresh { refreshToken }                  │
│     → new { accessToken, refreshToken }                                       │
│  4. If refresh fails: redirect to /login                                       │
│  5. POST /auth/logout → marks refresh token revoked                           │
│                                                                               │
│  Security:                                                                     │
│  - Rotated refresh token invalidates old one (prevents replay)                 │
│  - Session tracking: device, IP, last_active                                   │
│  - Account lockout: 5 failed attempts → account_locked_until set               │
│  - No secrets in logs ever                                                     │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Verifiable gate:** Complete auth flow tested via curl smoke test (Task 1.2 ✅).

### Flow 6: Multi-Tenant Request Lifecycle (Middleware Stack)

```
[Request arrives at NestJS API]
    │
    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  MIDDLEWARE PIPELINE (every request, CLAUDE.md §API Standards)                │
│                                                                               │
│  1. RequestIdMiddleware                                                        │
│     - Injects X-Request-Id header (UUID v4)                                   │
│     - Logged in every audit entry and log line                                │
│                                                                               │
│  2. RateLimiterMiddleware (Redis-backed)                                      │
│     - Per IP + per user                                                       │
│     - Default: 100 req/min per user                                           │
│     - Auth endpoints: 10 req/min per IP                                       │
│     - Returns 429 TOO_MANY_REQUESTS if exceeded                               │
│                                                                               │
│  3. JwtAuthGuard                                                               │
│     - Validates RS256 signature against tier-specific public key              │
│     - Checks expiry (15min access token)                                       │
│     - Decodes payload → attaches { sub, companyId, tier } to request           │
│     - Returns 401 UNAUTHORIZED if invalid/missing                              │
│                                                                               │
│  4. TenantContextGuard (CRITICAL for RLS)                                     │
│     - Extracts company_id from JWT payload                                     │
│     - Executes: SET app.current_company_id = '{company_id}'                   │
│     - Done via Prisma $queryRaw or raw SQL                                    │
│     - PostgreSQL RLS policy checks this setting on every query                │
│     - Defense in depth: even if app-layer filter omitted, DB blocks           │
│     - Returns 401 if no company_id in token (Tier 2 only)                     │
│                                                                               │
│  5. PermissionGuard (@RequireRole / @RequirePermission)                       │
│     - Checks user.roles against required permission matrix                     │
│     - Checks subscription plan feature flags                                   │
│     - Returns 403 FORBIDDEN or 403 PLAN_LIMIT_EXCEEDED                         │
│                                                                               │
│  6. ZodValidationPipe (body/query/param validation)                           │
│     - Validates request body against Zod schema                                │
│     - Validates query params, path params                                      │
│     - Returns 400 BAD_REQUEST with RFC 7807 Problem Details                    │
│                                                                               │
│  7. Handler (business logic)                                                   │
│     - All Prisma queries include WHERE company_id filter (app layer)           │
│     - RLS at DB layer provides defense-in-depth                                │
│     - Never accepts company_id from request body                               │
│                                                                               │
│  8. AuditInterceptor (post-handler)                                            │
│     - Captures: user_id, action, entity_type, entity_id,                      │
│                 old_values, new_values, IP, user_agent                         │
│     - Sensitive fields (passwords, tokens, credit cards) masked               │
│     - Only logs write operations (POST/PUT/PATCH/DELETE)                       │
│     - Non-blocking (fire-and-forget)                                           │
│                                                                               │
│  9. AllExceptionsFilter → RFC 7807 Problem Details                             │
│     - All uncaught exceptions → structured error response                     │
│     - Format: { type, title, status, detail, instance, timestamp }            │
│     - Development: includes stack trace (suppressed in production)             │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Verifiable gates:**

- G6.1: Middleware pipeline tested via integration test (Task 1.3 ❌)
- G6.2: Cross-tenant query returns 403 (RLS verified) (Task 1.3 ❌)

---

## [ARCHITECTURE] — Complete System Architecture

### Package Dependency Graph (Strict)

```
┌─────────────────────────────────────────────────────────────────────┐
│                          MONOREPO ROOT                              │
│  package.json | pnpm-workspace.yaml | tsconfig.json                 │
│  eslint.config.mjs | .prettierrc                                    │
│  docker-compose.yml | .env.example                                  │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         │ pnpm workspaces:
                         │
     ┌───────────────────┼───────────────────────┐
     │                   │                       │
     ▼                   ▼                       ▼
┌────────────┐   ┌────────────┐         ┌────────────┐
│  apps/     │   │  apps/     │         │  apps/     │
│  web       │   │  portal    │         │  admin     │
│  Next.js   │   │  Next.js   │         │  Next.js   │
│  :3000     │   │  :3003     │         │  :3002     │
└─────┬──────┘   └─────┬──────┘         └─────┬──────┘
      │                │                      │
      └──────────┬─────┼──────────────────────┘
                 │     │
                 ▼     ▼
           ┌──────────────────────┐
           │  apps/api            │
           │  NestJS 10           │
           │  :3001               │
           │                     │
           │  Module structure:   │
           │  auth/               │
           │  companies/          │
           │  hr/                 │
           │  attendance/         │
           │  crm/                │
           │  sales/              │
           │  projects/           │
           │  tasks/              │
           │  content/            │
           │  assets/             │
           │  equipment/          │
           │  exhibitions/        │
           │  calendar/           │
           │  portal/             │
           │  notifications/      │
           │  reports/            │
           │  files/              │
           │  audit/              │
           │  search/             │
           │  billing/            │
           │  admin/              │
           └─────┬──────────┬────┘
                 │          │
                 ▼          ▼
       ┌──────────────────┐   ┌──────────────────┐
       │ packages/shared  │   │ packages/ui      │
       │ Types, constants │   │ shadcn/ui comps  │
       │ helpers, Zod     │   │ shared frontend  │
       │ ZERO deps        │   │ depends: shared  │
       └──────────────────┘   └──────────────────┘
                 │
                 ▼
       ┌──────────────────┐   ┌──────────────────┐
       │ packages/database│   │ packages/ai      │
       │ Prisma schema    │   │ Anthropic client  │
       │ migrations       │   │ Prompt registry   │
       │ seed             │   │ Model manager     │
       │ depends: shared  │   │ depends: shared   │
       └──────────────────┘   └──────────────────┘
```

**Rules:**

- `packages/shared` has ZERO internal dependencies — must always remain leaf package
- `packages/database` depends only on `packages/shared`
- `packages/ai` depends only on `packages/shared`
- `packages/ui` depends only on `packages/shared`
- All `apps/*` depend on packages but never on sibling apps
- No circular dependencies allowed — enforce via ESLint import/no-cycle if needed

### Module Map (21 NestJS Modules)

```
apps/api/src/
├── auth/               AuthModule
│   ├── auth.controller.ts       — POST /auth/signup, /login, /refresh, /logout, /verify-email, /forgot-password, /reset-password
│   ├── auth.service.ts          — Business logic: Argon2id hash, JWT sign, session management
│   ├── jwt.strategy.ts          — Passport strategy for RS256 JWT validation (3 tiers)
│   ├── jwt-auth.guard.ts        — Guard decorator @UseGuards(JwtAuthGuard)
│   ├── roles.guard.ts           — @RequireRole('owner') decorator
│   ├── permissions.guard.ts     — @RequirePermission('employees.write') decorator
│   ├── dto/                     — Zod schemas for all auth endpoints
│   └── __tests__/               — Integration tests
│
├── companies/          CompaniesModule
│   ├── companies.controller.ts  — CRUD for company profile
│   └── companies.service.ts     — Tenant profile management, settings
│
├── hr/                 HrModule
│   ├── employees/              — CRUD + invitation flow
│   ├── departments/            — CRUD
│   ├── leaves/                 — Leave requests, approvals, balances
│   ├── payroll/                — Payroll runs, entries, PDF payslips
│   ├── performance/            — Reviews, KPIs
│   └── documents/              — Contract management
│
├── attendance/         AttendanceModule
│   ├── attendance.controller.ts — POST /check-in, /check-out, GET /today, /all
│   ├── attendance.service.ts   — Haversine calc, status determination, override
│   ├── attendance.gateway.ts   — WebSocket for real-time dashboard
│   └── __tests__/              — GPS range tests (critical!)
│
├── crm/                CrmModule
│   ├── leads/                  — Pipeline CRUD, Kanban, conversion
│   ├── clients/                — Client CRUD, contacts, portal toggle
│   ├── deals/                  — Deal tracking, probability
│   └── campaigns/              — Campaign CRUD, budget tracking
│
├── sales/              SalesModule
│   ├── quotations/             — Builder, PDF generation, accept flow
│   ├── invoices/               — CRUD, recurring, aging, reminders
│   ├── payments/               — Record, reconcile
│   └── expenses/               — Submission, approval flow
│
├── projects/           ProjectsModule
│   ├── projects.controller.ts  — CRUD, stage transitions (state machine)
│   ├── projects.service.ts     — Business logic, revision limit enforcement
│   ├── revisions/              — Revision tracking
│   └── __tests__/              — Pipeline state machine tests
│
├── tasks/              TasksModule
│   ├── tasks.controller.ts     — CRUD, subtasks, status transitions
│   ├── tasks.service.ts        — Assignment, workload, @mention parsing
│   ├── comments/               — Task comments with @mentions
│   ├── time-logs/              — Start/stop timer, manual entry
│   └── __tests__/
│
├── content/            ContentModule (Phase 3)
│   ├── brand-briefs/           — Brand brief CRUD
│   ├── personas/               — Audience personas
│   ├── pillars/                — Content pillars
│   ├── plans/                  — Content plan CRUD + wizard
│   ├── pieces/                 — Content piece CRUD + universal editor
│   ├── frameworks/             — Frameworks library, JSON Schema driven
│   ├── ai-tools/               — 20 AI tool wrappers
│   ├── templates/              — Content templates
│   └── generations/            — AI generation history, cost tracking
│
├── assets/             AssetsModule
│   ├── assets.controller.ts    — CRUD, version management
│   ├── assets.service.ts       — Versioning, tag system, visibility
│   ├── folders/                — Folder hierarchy
│   └── __tests__/
│
├── equipment/          EquipmentModule
│   ├── equipment.controller.ts — CRUD, QR code generation
│   ├── bookings/               — Conflict detection, calendar
│   ├── maintenance/            — Maintenance logs
│   └── __tests__/              — Booking overlap tests
│
├── exhibitions/        ExhibitionsModule
│   ├── exhibitions.controller.ts — CRUD
│   ├── booths/                 — Booth management, multiple brands
│   ├── inventory/              — Booth inventory tracking
│   ├── financials/             — Income/expense tracking
│   └── settlement/             — Settlement report generation
│
├── calender/           CalendarModule
│   ├── calendar.controller.ts  — Monthly/weekly views
│   ├── calendar.service.ts     — Drag-drop scheduling, conflict detection
│   └── __tests__/
│
├── portal/             PortalModule (Phase 3)
│   ├── portal.controller.ts    — Client-facing endpoints
│   ├── review/                 — File annotation, approve/revision
│   └── collaboration/          — Client messaging, request submission
│
├── notifications/      NotificationsModule
│   ├── notifications.controller.ts — GET /notifications, mark read, preferences
│   ├── notifications.gateway.ts    — WebSocket stream
│   ├── email/                 — Resend integration, Arabic templates
│   ├── telegram/              — Single bot (@AgencyOSBot), deep-link linking
│   ├── in-app/               — In-app bell + dropdown
│   └── notification.service.ts — Unified trigger system
│
├── reports/            ReportsModule
│   ├── reports.controller.ts  — All report categories
│   ├── financial/             — Revenue, profitability, aging
│   ├── operations/            — Completion rate, delivery time
│   ├── hr/                    — Attendance, leaves, performance
│   ├── sales/                 — Conversion, pipeline, win/loss
│   └── export/               — Excel + PDF export
│
├── files/              FilesModule
│   ├── files.controller.ts     — Upload, download, TUS endpoints
│   ├── files.service.ts        — R2 storage, signed URLs
│   ├── tus/                    — TUS protocol handler
│   └── __tests__/             — Chunked upload tests
│
├── audit/              AuditModule
│   ├── audit.controller.ts     — GET /audit-logs with filters
│   ├── audit.interceptor.ts   — Auto-capture interceptor
│   └── __tests__/
│
├── search/             SearchModule
│   ├── search.controller.ts    — GET /search?q=
│   ├── search.service.ts       — PostgreSQL FTS (Phase 2), Meilisearch (Phase 3)
│   └── __tests__/
│
├── billing/            BillingModule (Phase 4)
│   ├── plans/                 — Subscription plans CRUD
│   ├── subscriptions/         — Tenant subscription lifecycle
│   ├── stripe/                — Stripe integration + webhooks
│   ├── local-payment/         — FastPay/ZainCash/FIB integration
│   └── feature-gating/        — Plan limit enforcement middleware
│
├── admin/              AdminModule (Phase 4)
│   ├── admin.controller.ts     — Super admin endpoints
│   ├── tenants/               — Per-tenant management
│   └── platform/              — Platform-wide health, MRR, churn
│
├── common/             Shared infrastructure
│   ├── filters/               — AllExceptionsFilter (RFC 7807)
│   ├── interceptors/          — AuditInterceptor, RequestIdInterceptor
│   ├── guards/                — JwtAuthGuard, RolesGuard, PermissionGuard
│   ├── pipes/                 — ZodValidationPipe
│   ├── middleware/             — TenantContextMiddleware, RateLimiterMiddleware
│   ├── decorators/            — @CurrentUser, @RequireRole, @RequirePermission
│   └── health/               — Health controller (database, redis, R2, AI)
│
└── app.module.ts
```

### State Machine: Content Piece Stages (Phase 3)

```
                    ┌──────────────────────────────────────────────────────────────────┐
                    │               CONTENT PIECE STATE MACHINE                         │
                    │                                                                   │
                    │  [idea] ──→ [in_writing] ──→ [in_design] ──→ [in_production]     │
                    │    │           │                 │                 │               │
                    │    │           ▼                 ▼                 ▼               │
                    │    │      (video/reel)     (static_design)    (story/carousel)    │
                    │    │           │                 │                 │               │
                    │    │           ▼                 ▼                 ▼               │
                    │    └────→ [internal_review] ←───────────────────────────────────┘  │
                    │                       │                                            │
                    │                       ▼                                            │
                    │              [client_review] ──→ [revision] ──┐                    │
                    │                       │                        │                    │
                    │                       ▼                        │                    │
                    │              [approved] ←───────────────────────┘                   │
                    │                       │                                            │
                    │                       ▼                                            │
                    │              [scheduled] ──→ [published] ──→ [failed]              │
                    │                                                                   │
                    │  Rules:                                                            │
                    │  - No stage skipping (must go through each)                        │
                    │  - revision_count tracked per piece                                │
                    │  - revision_count >= revision_limit → BLOCK client portal          │
                    │  - Account Manager override required to exceed limit               │
                    │  - Internal review can request revision (loops to in_writing)      │
                    └──────────────────────────────────────────────────────────────────┘
```

### State Machine: Project Pipeline Stages (Phase 2)

```
[idea] → [concept] → [script] → [storyboard] → [pre_production]
    → [production] → [editing] → [client_review] → [revision] → (loop)
    → [delivery] → [completed]
                ↓
            [cancelled]
```

### State Machine: Invoice Status Lifecycle (Phase 2)

```
[draft] → [sent] → [partially_paid] → [paid]
    ↓                            ↓
[overdue] ←───────────────── [overdue] → [cancelled]
```

### Database: Row Estimation Per Tenant (at scale)

| Entity             | Est. Rows/Year       | Growth/Month | Index Strategy                        |
| ------------------ | -------------------- | ------------ | ------------------------------------- |
| attendance_records | 60K (250 emp × 240d) | 5K           | (company_id, created_at DESC)         |
| audit_logs         | 250K                 | 20K          | (company_id, created_at DESC)         |
| content_pieces     | 3K (250/month)       | 250          | (company_id, content_plan_id)         |
| content_revisions  | 6K (2/piece avg)     | 500          | (company_id, content_piece_id)        |
| ai_generations     | 12K (50/employee/mo) | 1K           | (company_id, user_id, created_at)     |
| tasks              | 10K                  | 800          | (company_id, project_id, assigned_to) |
| task_comments      | 30K                  | 2.5K         | (task_id, created_at)                 |
| task_time_logs     | 15K                  | 1.2K         | (user_id, task_id)                    |
| invoices           | 500                  | 40           | (company_id, client_id, status)       |
| payments           | 400                  | 35           | (invoice_id, payment_date)            |
| quotations         | 600                  | 50           | (company_id, client_id)               |
| leads              | 2K                   | 150          | (company_id, assigned_to, stage)      |
| clients            | 100                  | 8            | (company_id)                          |
| projects           | 200                  | 16           | (company_id, client_id, status)       |
| equipment_bookings | 1K                   | 80           | (equipment_id, booking_start)         |
| leaves             | 500                  | 40           | (company_id, employee_id, year)       |
| notifications      | 100K                 | 8K           | (user_id, read_at, created_at)        |
| files              | 5K                   | 400          | (company_id, mime_type)               |
| assets             | 3K                   | 250          | (company_id, type, folder_id)         |
| exhibitions        | 12                   | 1            | (company_id)                          |

**Composite index rule:** Every tenant table has at minimum `(company_id, created_at DESC)`. Heavily queried tables add function-specific indexes (e.g., `(equipment_id, booking_start)` for conflict detection).

### CRITICAL: RLS Defense in Depth Architecture

```sql
-- Layer 1: Application-level (Prisma)
-- Every Prisma query MUST include:
WHERE company_id = current_company_id_from_jwt

-- Layer 2: Database-level (PostgreSQL RLS)
-- Every tenant table has:
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON {table}
  USING (company_id = current_setting('app.current_company_id')::uuid);

-- Layer 3: Separate DB roles
-- migration role (agencyos): full access, used for migrations only
-- app role (agencyos_app): restricted, RLS-enforced, used for runtime queries
-- This prevents accidental RLS bypass from Prisma's default connection
```

**VERIFIED in Task 1.1:** RLS enabled on 12 tenant tables. `permissions` table left unrestricted (platform reference data). The `agencyos_app` role created in `init-db.sql` with `GRANT CONNECT` + `GRANT USAGE`. Task 1.3 must wire the middleware to switch to `agencyos_app` for runtime queries.

---

## [ORPHANS & PENDING] — Gaps, Debt, Decisions, Coverage

### 🔴 CRITICAL BLOCKERS

| ID   | Gap                                                                                                                                                         | Impact                                                                     | Blocking                | Source                              | Mitigation                                                                                                                                                                           |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ----------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| G-01 | **RLS not wired to app layer** — Prisma connects as table owner (bypasses RLS). The `agencyos_app` role exists in `init-db.sql` but is NOT used by the API. | ALL tenant data is exposed. RLS provides zero protection.                  | Task 1.3 (CURRENT)      | PROGRESS.md Task 1.1 log            | NestJS TenantContextMiddleware must switch to `agencyos_app` role at request start. Implement via Prisma `$queryRaw` to `SET ROLE agencyos_app; SET app.current_company_id = '...';` |
| G-02 | **No CI pipeline running** — GitHub Actions workflow exists in `scripts/github-actions-ci.yml` but not deployed to `.github/workflows/`.                    | All lint/typecheck/tests manual. No guard against bad commits.             | Task 0.3, 0.4, 0.5, 0.6 | Repo inspection                     | Copy to `.github/workflows/ci.yml`. _Status: scripts/github-actions-ci.yml exists but .github/workflows/ does NOT exist._                                                            |
| G-03 | **TUS upload not implemented** — No chunked upload capability.                                                                                              | Large video files (1GB+) cannot be uploaded. Blocks media-heavy Phase 2/3. | Task 2.13               | MasterSpec §14, TASKS.md 2.13       | Implement TUS protocol in files module. Use `@tus/server` or `tus-node-server`. Need Docker service for temp storage.                                                                |
| G-04 | **No antivirus for uploads** — ClamAV not in Docker stack, no file scanning.                                                                                | Risk of malware upload through file endpoints.                             | Phase 4 (deferred)      | MasterSpec §14, CLAUDE.md §Security | Add ClamAV container in Phase 4. Document as known gap.                                                                                                                              |
| G-05 | **Tenant lifecycle not implemented** — No trial expiry cron, no read-only mode, no suspension logic.                                                        | Trials never expire. Unpaid tenants keep full access indefinitely.         | Phase 4.4               | MasterSpec §4 (Tenant Deactivation) | BullMQ cron job for daily expiry check. Lifecycle status machine in `companies.status`.                                                                                              |
| G-06 | **MasterSpec vs CLAUDE.md contradiction on password hashing** — MasterSpec says bcrypt, CLAUDE.md + ADR-002 say Argon2id (already implemented).             | Document inconsistency could cause confusion in future additions.          | —                       | DECISIONS.md ADR-002                | UPDATE MasterSpec §10 Security table to reflect Argon2id. Task for next review cycle.                                                                                                |

### 🟡 CRITICAL TECHNICAL DEBT (must fix before Phase 2)

| ID   | Debt                                                                                                                                                     | Module   | Priority | Fix                                                                      |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------- | ------------------------------------------------------------------------ |
| D-01 | **No E2E tests** — Playwright suite not configured. CI workflow references `pnpm test:e2e` but no test files exist.                                      | All      | HIGH     | Implement Playwright in Task 1.14. Start with tenant signup flow.        |
| D-02 | **Kitchen sink issue** — Some packages not used yet but imported. `packages/ai` has no code. `packages/ui` has only `.gitkeep`.                          | ai, ui   | LOW      | Expected early stage. Will fill in Phase 3.                              |
| D-03 | **.env file exists** — Contains actual passwords/keys (gitignored but risky). If this machine is shared, secrets are exposed.                            | Root     | HIGH     | Ensure .env is never committed. Consider `.env.local` for local secrets. |
| D-04 | **No pagination on audit_logs** — GET /audit-logs will return ALL rows. At 250K rows/year, this will become a problem fast.                              | audit    | MEDIUM   | Implement cursor-based pagination before production.                     |
| D-05 | **R2 integration not wired** — `env.example` has R2 vars but no code reads them. First usage will be profile photo upload in Task 1.7.                   | files    | MEDIUM   | Implement S3 client wrapper in files module. Configure in Task 1.7.      |
| D-06 | **No health check for R2 nor Anthropic** — `/health` endpoint currently checks database + Redis only.                                                    | common   | LOW      | Add health indicators for R2 connectivity and Anthropic API.             |
| D-07 | **`packages/database` exports** — Re-exports everything from `@prisma/client`. This could expose internal Prisma types. Better to expose typed services. | database | LOW      | Acceptable for Phase 1. Revisit in Phase 3.                              |

### 📌 PENDING ARCHITECTURAL DECISIONS

| ID    | Decision                           | Needed By  | Current Status               | Options                                                                                                                                             |
| ----- | ---------------------------------- | ---------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| PD-01 | **Iraqi payment gateway choice**   | Phase 4.3  | Research pending             | FastPay vs ZainCash vs FIB. Need research on: API quality, documentation in English/Arabic, transaction fees, settlement time, developer community. |
| PD-02 | **Search engine choice**           | Phase 3    | PostgreSQL FTS for Phase 2   | Meilisearch (already in Docker compose) vs Algolia (SaaS) vs Typesense. Decision deferred to Phase 2 completion.                                    |
| PD-03 | **SMS provider**                   | Phase 4    | Deferred                     | Twilio (expensive, works in Iraq), local provider (cheaper, needs research), or skip for Phase 4.                                                   |
| PD-04 | **Kubernetes migration threshold** | Phase 4.12 | Defined: 1000 active tenants | Single Hetzner VPS with Docker Compose until 1000 tenants. Then migrate to k8s on Hetzner Cloud. ADR-006.                                           |
| PD-05 | **2FA implementation detail**      | Phase 2+   | Deferred                     | TOTP mandatory for Owner role. Implementation: speakeasy or otplib. Not in current task scope.                                                      |
| PD-06 | **Offline check-in queue**         | Phase 1    | Deferred                     | PWA queues check-in if offline; syncs when back online. GPS required. Not in Phase 1 deliverables — marked "Phase 1.5".                             |

### 🧪 TEST COVERAGE GAPS

| Module               | Unit Tests | Integration Tests | E2E Tests | Risk                                           |
| -------------------- | ---------- | ----------------- | --------- | ---------------------------------------------- |
| Auth (1.2)           | ❌         | ✅ (curl smoke)   | ❌        | HIGH — auth is critical security boundary      |
| Companies            | ❌         | ❌                | ❌        | MEDIUM — low complexity                        |
| Employees (1.7)      | ❌         | ❌                | ❌        | HIGH — invitation flow has many edge cases     |
| Departments (1.6)    | ❌         | ❌                | ❌        | LOW — simple CRUD                              |
| Work Locations (1.8) | ❌         | ❌                | ❌        | MEDIUM — map + GPS test challenging            |
| Attendance (1.10)    | ❌         | ❌                | ❌        | CRITICAL — Haversine calc is business-critical |
| PWA (1.9)            | ❌         | ❌                | ❌        | MEDIUM — geolocation permission flow           |
| All Phase 2+ modules | ❌         | ❌                | ❌        | HIGH — need to add as built                    |

**Planned test addition schedule:**

- Phase 1.14: First E2E suite (Playwright, critical flows)
- Every Phase 2+ task: Unit + Integration tests required per CLAUDE.md Rule 5
- Before Phase 1 approval: All Phase 1 modules must have at minimum integration tests

### 📁 FILES NOT YET CREATED (from Folder Structure)

From CLAUDE.md folder structure, these are expected but missing:

| Expected Path                      | Status           | Needed By                |
| ---------------------------------- | ---------------- | ------------------------ |
| `apps/portal/` (Next.js)           | ❌ not created   | Phase 3                  |
| `apps/admin/` (Next.js)            | ❌ not created   | Phase 4                  |
| `packages/ui/` (shadcn components) | ❌ empty/gitkeep | Phase 1 (as used)        |
| `packages/ai/` (Anthropic client)  | ❌ empty/gitkeep | Phase 3                  |
| `.github/workflows/ci.yml`         | ❌ not deployed  | Now (exists as scripts/) |
| `docker-compose.prod.yml`          | ❌ not created   | Phase 4                  |

### ✅ COMPLETED VS PENDING TASKS (Current State)

```
Phase 0 (6/6 ✅):
  0.1 ✅ Repository Initialization
  0.2 ✅ Docker Compose for Local Services
  0.3 ✅ TypeScript + Linting Configuration
  0.4 ✅ Backend Scaffold (NestJS)
  0.5 ✅ Frontend Scaffold (Next.js)
  0.6 ✅ Prisma Setup

Phase 1 (2/14):
  1.1 ✅ Database Schema for Phase 1
  1.2 ✅ Authentication Tier 2 (Tenant Users)
  1.3 🔴 [CURRENT] Tenant Context Middleware + RLS Wiring
  1.4 ❌ Roles & Permissions System
  1.5 ❌ Tenant Onboarding Wizard
  1.6 ❌ Departments CRUD
  1.7 ❌ Employees CRUD
  1.8 ❌ Work Locations CRUD with Map
  1.9 ❌ PWA Setup
  1.10 ❌ GPS Check-In API
  1.11 ❌ Check-In UI (Mobile PWA)
  1.12 ❌ Attendance Dashboard
  1.13 ❌ Audit Logging Infrastructure
  1.14 ❌ Phase 1 Acceptance Tests

Phase 2 (0/18): All ❌
Phase 3 (0/22): All ❌
Phase 4 (0/12): All ❌

TOTAL: 8/72 (11.1%)  [████░░░░░░░░░░░░░░░░░░░░░░░]
```

---

## [MILESTONES] — Verifiable Goals

| ID     | Phase | Milestone                     | Verification Criteria                                                                                                                                                             | Status            |
| ------ | ----- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| M0     | Setup | Development Environment Ready | `pnpm install` ✓, `docker compose up -d` all services healthy ✓, `curl /health` returns 200 with all services up ✓                                                                | ✅ COMPLETE       |
| M1.0   | 1     | Database Foundation           | All migrations apply ✓, seed creates demo company ✓, RLS policies on all tenant tables ✓, cross-tenant query blocked ✓                                                            | ✅ (1.1, 0.6)     |
| M1.1   | 1     | Authentication                | Signup → verify → login → refresh → logout flow works ✓, lockout after 5 failures ✓, refresh token rotation ✓, 9 audit events logged ✓                                            | ✅ (1.2)          |
| M1.2   | 1     | RLS Enforcement               | TenantContextMiddleware sets `app.current_company_id` ✓, `agencyos_app` role used for runtime queries ✓, cross-tenant access returns 403 ✓                                        | 🔴 CURRENT (1.3)  |
| M1.3   | 1     | Roles & Permissions           | 11 default roles seeded ✓, permission matrix enforced ✓, `@RequireRole()` and `@RequirePermission()` decorators work ✓, frontend `useCan()` hook works ✓                          | ❌ (1.4)          |
| M1.4   | 1     | Tenant Onboarding             | 5-step wizard completes ✓, owner profile saved to R2 ✓, GPS location set ✓, departments created ✓, first employee invited ✓, plan selected ✓                                      | ❌ (1.5)          |
| M1.5   | 1     | Employee Management           | Departments CRUD ✓, Employees CRUD ✓, invitation email sent ✓, employee sets password and logs in ✓, profile photo uploaded ✓                                                     | ❌ (1.6, 1.7)     |
| M1.6   | 1     | PWA GPS Check-in              | PWA installable ✓, geolocation granted ✓, POST /attendance/check-in within radius → 201 ✓, outside radius → 403 with distance error ✓, late detection ✓, HR real-time dashboard ✓ | ❌ (1.8-1.12)     |
| M1.7   | 1     | Audit Logging                 | Every write operation logged ✓, audit viewer for Owner/Admin ✓, sensitive fields never logged ✓                                                                                   | ❌ (1.13)         |
| M1.8   | 1     | Phase 1 E2E                   | Full Playwright suite passes: signup → onboarding → invite → check-in (success + failure) ✓                                                                                       | ❌ (1.14)         |
| **M1** | **1** | **Foundation Complete**       | **User approves Phase 1, signs off, we move to Phase 2**                                                                                                                          | **❌ (awaiting)** |
| M2     | 2     | Core Operations               | Lead → Won → Quotation → Project → Invoice → Payment E2E ✓, HR leaves + payroll ✓, expenses ✓, notifications ✓                                                                    | ❌                |
| M3     | 3     | Creative Studio               | Brand Brief → Plan → 30 pieces → AI tools → Client approval ✓, equipment booking ✓, exhibition settlement ✓                                                                       | ❌                |
| M4     | 4     | SaaS Layer                    | New tenant signup → trial → paid → lifecycle → super admin ✓                                                                                                                      | ❌                |
| M5     | 4     | Production Launch             | 1000 concurrent users (k6) ✓, security audit (OWASP) ✓, production on Hetzner ✓, monitoring (Sentry + UptimeRobot) ✓, backup verification ✓, first external tenant signs up ✓     | ❌                |

---

## [APPENDICES]

### A. Key Configuration Files Reference

| File                            | Purpose                                      | Location |
| ------------------------------- | -------------------------------------------- | -------- |
| `.env.example`                  | All environment variables with documentation | Root     |
| `.env`                          | Actual secrets (gitignored)                  | Root     |
| `.nvmrc`                        | Node version pin                             | Root     |
| `.editorconfig`                 | Editor settings                              | Root     |
| `.prettierrc`                   | Code formatter                               | Root     |
| `eslint.config.mjs`             | ESLint flat config                           | Root     |
| `pnpm-workspace.yaml`           | Monorepo workspaces                          | Root     |
| `tsconfig.json`                 | TypeScript strict config                     | Root     |
| `docker-compose.yml`            | Local dev services                           | Root     |
| `scripts/init-db.sql`           | Postgres initialization                      | scripts/ |
| `scripts/generate-jwt-keys.sh`  | JWT key generation                           | scripts/ |
| `scripts/github-actions-ci.yml` | CI workflow (Not deployed)                   | scripts/ |

### B. Environment Variable Categories

| Category      | Count   | Vars                                                                                               |
| ------------- | ------- | -------------------------------------------------------------------------------------------------- |
| General       | 5       | NODE_ENV, APP_NAME, APP_URL, API_URL, ADMIN_URL, PORTAL_URL                                        |
| Database      | 8       | DATABASE_URL, DB_HOST/PORT/USER/PASSWORD/NAME/POOL_SIZE, DIRECT_DATABASE_URL, APP_DATABASE_URL     |
| Redis         | 4       | REDIS_URL/HOST/PORT/PASSWORD                                                                       |
| JWT           | 9       | JWT*{TIER}*{PUB/PRIV}\_KEY (6), JWT_ACCESS/REFRESH_EXPIRY, ENCRYPTION_KEY                          |
| Cloudflare R2 | 5       | R2_ACCOUNT_ID/ACCESS_KEY_ID/SECRET_ACCESS_KEY/BUCKET/ENDPOINT/PUBLIC_URL                           |
| Anthropic     | 3       | ANTHROPIC_API_KEY, ANTHROPIC_MODEL_DEFAULT/PREMIUM                                                 |
| Email         | 4       | RESEND_API_KEY, EMAIL_FROM/NAME/REPLY_TO                                                           |
| Telegram      | 3       | TELEGRAM_BOT_TOKEN/USERNAME/WEBHOOK_SECRET                                                         |
| Stripe        | 5       | STRIPE*SECRET/PUBLISHABLE/WEBHOOK_SECRET, STRIPE_PRICE*\* (3)                                      |
| Iraqi Payment | 3       | FASTPAY_MERCHANT_ID/API_KEY/WEBHOOK_SECRET                                                         |
| Monitoring    | 3       | SENTRY_DSN/ENVIRONMENT/RELEASE                                                                     |
| Other         | 12      | Rate limiting, feature flags, defaults, file limits, subscriptions, jobs, logging, CORS, dev tools |
| **Total**     | **~60** |                                                                                                    |

### C. Dependency: Package Manager Scripts

```jsonc
// Root package.json scripts
{
  "dev": "pnpm --parallel run dev", // Run all dev servers
  "dev:api": "pnpm --filter api dev", // API only
  "dev:web": "pnpm --filter web dev", // Web only
  "build": "pnpm --recursive run build", // Build all
  "lint": "pnpm --recursive run lint", // Lint all
  "typecheck": "pnpm --recursive run typecheck", // Typecheck all
  "test": "pnpm --recursive run test", // Test all
  "test:e2e": "pnpm --recursive run test:e2e", // E2E tests
  "db:migrate": "pnpm --filter database migrate:dev", // Dev migration
  "db:migrate:prod": "pnpm --filter database migrate:deploy", // Production migration
  "db:seed": "pnpm --filter database seed", // Seed database
  "db:reset": "pnpm --filter database migrate:reset", // Reset database
  "db:studio": "pnpm --filter database studio", // Prisma Studio
  "db:generate": "pnpm --filter database generate", // Generate Prisma client
  "docker:up": "docker compose up -d", // Start services
  "docker:down": "docker compose down", // Stop services
  "docker:logs": "docker compose logs -f", // View logs
  "docker:reset": "docker compose down -v", // Reset + delete volumes
}
```

### D. Docker Services

| Service     | Image                           | Port                       | Purpose                                                           |
| ----------- | ------------------------------- | -------------------------- | ----------------------------------------------------------------- |
| postgres    | postgres:16-alpine              | 5433:5432                  | Primary database (host port 5433 conflicts avoided with local PG) |
| redis       | redis:7-alpine                  | 6379                       | Cache + BullMQ queue                                              |
| mailhog     | mailhog/mailhog                 | 8025 (UI), 1025 (SMTP)     | Dev email capture                                                 |
| meilisearch | getmeilisearch/meilisearch:v1.6 | 7700                       | Search (Phase 3+)                                                 |
| minio       | minio/minio                     | 9000 (API), 9001 (Console) | S3-compatible storage for offline dev                             |
| adminer     | adminer                         | 8080                       | Database admin UI                                                 |

---

## [MAP LEGEND]

| Symbol | Meaning                     |
| ------ | --------------------------- |
| ✅     | Completed and verified      |
| 🔴     | IN PROGRESS / CURRENT       |
| ❌     | Not started                 |
| 📅     | Planned / future phase      |
| ⚠️     | Risk / attention needed     |
| G-XX   | Critical gap identifier     |
| D-XX   | Technical debt identifier   |
| PD-XX  | Pending decision identifier |

---

## [END OF PROJECT_MAP.md]
