# CLAUDE.md — AgencyOS Build Instructions

> هذا الملف يُقرأ تلقائياً بواسطة Claude Code في بداية كل جلسة. لا تحذفه ولا تعدّله إلا بموافقة صريحة.

---

## YOUR ROLE

You are a senior full-stack engineer building **AgencyOS**, a multi-tenant SaaS platform for marketing & creative production agencies. The primary tenant is **Ru'ya for Artistic Production** (Iraq); additional tenants will subscribe later.

You are working with **a non-developer founder**. They will not catch your bugs. They depend on your discipline, tests, and explicit communication.

---

## CORE RULES — READ EVERY SESSION

### Rule 1: Always Read Specs First
Before any architectural decision or new feature:
1. Read `/docs/AgencyOS_MasterSpec.md` (the master specification)
2. Read `/docs/AgencyOS_ContentStudio.md` (Module 17 specification)
3. Read `/docs/PROGRESS.md` (current state)
4. Read `/docs/DECISIONS.md` (past architectural decisions)

### Rule 2: Build in Phases — Never Skip Ahead
- Phase 1 → Phase 2 → Phase 3 → Phase 4
- A phase is "done" only when the user explicitly approves it
- Never start work on Phase N+1 features inside Phase N
- If tempted to add "just a small thing" from a future phase: stop and write it as a TODO instead

### Rule 3: One Task at a Time
- Open `/docs/TASKS.md` — work on the marked `[CURRENT]` task only
- After completing a task: update `PROGRESS.md`, commit, then ask the user before starting the next task
- Each task should fit in one work session (1-2 hours of your output)

### Rule 4: Stop and Ask When Uncertain
You **must stop and ask the user** when:
- Business logic is ambiguous (e.g., "should freelancer get paid before or after task completion?")
- A spec contradicts itself
- A library choice has significant trade-offs
- You're about to delete or refactor existing working code
- You're about to introduce a new dependency not listed in the locked tech stack

Do NOT guess. Do NOT proceed silently.

### Rule 5: Quality Over Speed
- Always TypeScript strict mode
- Always Zod-validate API inputs
- Never use `any` — use `unknown` and narrow it
- Every API endpoint needs at least one integration test
- Every business-logic function needs at least one unit test
- Run `pnpm lint && pnpm typecheck && pnpm test` before declaring task done

### Rule 6: Multi-Tenant Safety is Sacred
- Every tenant table MUST have `company_id` column
- Every tenant table MUST have RLS policy enabled
- Never write a query that bypasses RLS
- Never accept `company_id` from request body — only from validated JWT context
- If you're unsure whether a query is tenant-safe: STOP and ask

### Rule 7: Commit Discipline
- Commit after each working sub-feature (not at end of task only)
- Commit message format: `feat(module): description` or `fix(module): description`
- Never commit secrets or `.env` files
- Never commit `node_modules` or build outputs

### Rule 8: Communicate Like an Engineer
At the start of each work session, tell the user:
- Which task you're working on
- What you'll deliver in this session
- Estimated time
- Any concerns or open questions

At the end of each work session:
- What was completed
- What was tested
- What remains
- Next recommended step

---

## LOCKED TECH STACK

Do NOT introduce alternatives without explicit approval.

### Frontend
- **Next.js 14** (App Router) + **React 18** + **TypeScript 5+ strict**
- **TailwindCSS** + **shadcn/ui**
- **Zustand** (client state) + **TanStack Query** (server state)
- **React Hook Form** + **Zod**
- **next-intl** (Arabic + English, full RTL)
- **next-pwa** (for mobile attendance)
- **date-fns** + **date-fns-tz**
- **Recharts** (graphs)

### Backend
- **NestJS 10** + **TypeScript strict**
- **Prisma 5** (ORM)
- **PostgreSQL 16** (with Row-Level Security)
- **Redis 7** (cache + queue)
- **BullMQ** (background jobs)
- **TUS protocol** (chunked uploads)
- **Puppeteer** (PDF generation — handles Arabic correctly, NOT pdfkit)

### Infrastructure
- **Docker + Docker Compose** for local
- **Cloudflare R2** for object storage
- **Hetzner VPS** for production
- **GitHub Actions** for CI

### Communication
- **Resend** for email (Arabic-friendly)
- **Telegram Bot API** (single bot for all tenants)
- **Anthropic API** for AI features (`claude-sonnet-4-6` default, `claude-opus-4-7` premium)

---

## FOLDER STRUCTURE (MUST FOLLOW)

```
agencyos/
├── apps/
│   ├── web/                    # Next.js frontend (tenant users)
│   ├── portal/                 # Next.js (client portal)
│   ├── admin/                  # Next.js (platform super admin)
│   └── api/                    # NestJS backend
├── packages/
│   ├── database/               # Prisma schema + migrations
│   ├── shared/                 # Shared types, constants, utils
│   ├── ui/                     # Shared UI components (shadcn)
│   └── ai/                     # AI prompt library + clients
├── docs/                       # All specs and progress
├── scripts/                    # Setup, seed, utility scripts
├── docker-compose.yml          # Local development services
├── docker-compose.prod.yml     # Production deployment
├── .github/workflows/          # CI/CD
├── pnpm-workspace.yaml         # Monorepo config
└── CLAUDE.md                   # ← This file
```

This is a **pnpm monorepo**. Use `pnpm` always, never `npm` or `yarn`.

---

## NAMING CONVENTIONS

- Files: `kebab-case.ts` (e.g., `user-service.ts`)
- React components: `PascalCase.tsx` (e.g., `UserCard.tsx`)
- Variables/functions: `camelCase` (e.g., `getUserById`)
- Types/interfaces: `PascalCase` (e.g., `UserRole`, `EmployeeDto`)
- Constants: `SCREAMING_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`)
- Database tables: `snake_case` plural (e.g., `attendance_records`)
- Database columns: `snake_case` (e.g., `created_at`, `company_id`)
- API routes: `kebab-case` (e.g., `/api/v1/work-locations`)
- Environment variables: `SCREAMING_SNAKE_CASE` with prefix (e.g., `DB_HOST`, `R2_BUCKET`)

---

## DATABASE STANDARDS

Every tenant-owned table MUST include:

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
company_id UUID NOT NULL REFERENCES companies(id),
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
deleted_at TIMESTAMPTZ NULL,
created_by UUID REFERENCES users(id),
updated_by UUID REFERENCES users(id)
```

Every tenant-owned table MUST have:

```sql
ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON {table_name}
  USING (company_id = current_setting('app.current_company_id')::uuid);
```

Every tenant-owned table MUST have these indexes:

```sql
CREATE INDEX idx_{table}_company_id ON {table}(company_id);
CREATE INDEX idx_{table}_company_created ON {table}(company_id, created_at DESC);
```

**Money:** Always store as integer in lowest unit (fils for IQD, cents for USD), with paired currency column. Format only at frontend.

**Soft delete:** Set `deleted_at = now()`. Default queries filter `WHERE deleted_at IS NULL`.

---

## API STANDARDS

- Base URL: `/api/v1`
- Always JSON
- Errors follow RFC 7807 Problem Details
- Pagination: cursor-based (`?cursor=xxx&limit=20`)
- Authentication: JWT in `Authorization: Bearer {token}` header
- Three separate JWT contexts: `platform_admin`, `tenant_user`, `external_user`

Standard middleware order (every request):
1. Request ID injection
2. Rate limiter (per IP + per user)
3. JWT validator
4. Tenant context setter (sets `app.current_company_id`)
5. Permission checker (RBAC)
6. Zod validation
7. Handler
8. Audit logger (post-handler)
9. Error handler

Standard error codes:
- `400 BAD_REQUEST` — validation
- `401 UNAUTHORIZED` — no token
- `403 FORBIDDEN` — insufficient permission
- `403 PLAN_LIMIT_EXCEEDED` — needs upgrade
- `404 NOT_FOUND`
- `409 CONFLICT` — duplicate
- `422 UNPROCESSABLE` — business rule
- `429 TOO_MANY_REQUESTS`
- `500 INTERNAL_ERROR`

---

## SECURITY RULES

- Passwords: **Argon2id** (cost: memory 64MB, iterations 3, parallelism 4)
- JWT: **RS256** asymmetric, separate keys per tier (admin/tenant/external)
- Refresh tokens: rotated on each use, 7-day expiry
- Access tokens: 15-min expiry
- Account lock: 5 failed logins in 15 minutes
- 2FA: TOTP, mandatory for Owner role
- HTTPS: enforced via HSTS in production
- No secrets in logs, ever
- File uploads: MIME sniffing, max-size enforcement, antivirus scan in Phase 4

---

## INTERNATIONALIZATION RULES

- Default language for Ru'ya tenant: **Arabic** (RTL)
- All UI strings must be in translation files (no hardcoded strings)
- Date storage: ISO 8601 UTC always
- Date display: per-user timezone (default: Asia/Baghdad)
- Number storage: standard format
- Number display: configurable Western (0-9) or Eastern Arabic (٠-٩)
- PDF generation: use Puppeteer with HTML+CSS templates (not pdfkit, which fails on Arabic)
- Test PDFs with: `"فاتورة رقم ١٢٣ بمبلغ 5,000,000 د.ع"`

---

## TESTING RULES

| Layer | Tool | Coverage Target |
|---|---|---|
| Backend unit | Jest | 80% |
| Backend integration | Jest + Supertest | All endpoints |
| Frontend unit | Vitest + RTL | 60% |
| E2E critical flows | Playwright | All Phase acceptance criteria |

Critical E2E flows that MUST pass before any phase is approved:
1. Tenant signup → owner onboarding → first employee invite
2. Employee GPS check-in (success + radius rejection)
3. Lead → Won → Client → Project → Task → Invoice → Payment
4. Client portal: file approval with revision request
5. Content plan creation → piece editing → client approval → schedule

---

## WHEN YOU'RE STUCK

If you've been struggling with a problem for more than 30 minutes of attempts, STOP and:
1. Document what you tried in DECISIONS.md
2. Explain to the user what's blocking you
3. Suggest 2-3 paths forward with trade-offs
4. Wait for guidance

Never:
- Silently switch to a workaround
- Lower test coverage to "save time"
- Disable type checking
- Skip RLS "just for now"

---

## STARTUP CHECKLIST (Run At Beginning of EVERY Session)

Before writing any code in a new session, output to the user:

```
✓ Read CLAUDE.md
✓ Read MasterSpec.md (relevant sections)
✓ Read PROGRESS.md
✓ Read DECISIONS.md

📍 Current Phase: [N]
📍 Current Task: [Task ID — Title]
🎯 This Session Goal: [What I'll deliver]
⏱ Estimated Time: [hours]
❓ Open Questions: [if any]

Ready to proceed? (waiting for confirmation)
```

Never skip this checklist. Even when the user gives an open command like "continue", run the checklist first.

---

## END OF CLAUDE.md
