# PROGRESS.md — Build Progress Tracker

> هذا الملف يُحدَّث بواسطة Claude Code بعد كل مهمة. لا تعدّله يدوياً إلا في حالات استثنائية.

---

## 📍 Current State

**Phase:** Phase 1 — Foundation
**Current Task:** 1.3 — Tenant Context Middleware + RLS Wiring
**Last Updated:** 2026-05-09

---

## 📊 Progress Overview

```
Phase 0 — Setup:                    [██████] 6/6 ✅
Phase 1 — Foundation:               [██░░░░░░░░░░░░] 2/14
Phase 2 — Core Operations:          [░░░░░░░░░░░░░░░░░░] 0/18
Phase 3 — Creative & Collaboration: [░░░░░░░░░░░░░░░░░░░░░░] 0/22
Phase 4 — SaaS Layer:               [░░░░░░░░░░░░] 0/12

TOTAL:                              [██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 8/72
```

---

## ✅ Completed Tasks

### Phase 0 — Setup (6/6 ✅)

- **0.1** — Repository Initialization (git, pnpm-workspace, folder structure)
- **0.2** — Docker Compose for Local Services (PostgreSQL 16, Redis 7, MailHog)
- **0.3** — TypeScript + Linting Configuration (strict, ESLint, Prettier, Husky)
- **0.4** — Backend Scaffold NestJS (/health, env validation, Pino, Helmet, CORS, Swagger)
- **0.5** — Frontend Scaffold Next.js (TailwindCSS, shadcn/ui, next-intl AR/EN RTL, TanStack Query)
- **0.6** — Prisma Setup (schema, migrations, seed, dual clients)

### Phase 1 — Foundation (2/14)

- **1.1** — Database Schema for Phase 1 (all tables + RLS policies + indexes + seed)
- **1.2** — Authentication Tier 2 (Argon2id, JWT RS256, signup/login/refresh/verify/reset, lockout, sessions, email templates AR+EN)

---

## 🚧 In Progress

**Task 1.3 — Tenant Context Middleware + RLS Wiring**

- RLS infrastructure EXISTS: PrismaService (dual clients), TenantContextService (AsyncLocalStorage), TenantContextInterceptor
- Missing: DB table GRANTs for `agencyos_app` role → permission errors on tenant queries
- Missing: RLS isolation integration test

---

## 🚫 Blockers

**G-01 (Critical):** `agencyos_app` PostgreSQL role lacks `GRANT SELECT, INSERT, UPDATE, DELETE` on tenant tables. Without this, the tenant Prisma client (`PrismaService.tenant`) fails with permission denied errors.

---

## 📝 Decisions Made

- **Argon2id over bcrypt** — ADR-002 confirmed; MasterSpec §10 superseded. Implemented in auth.service.ts.
- **RLS defense in depth** — DB-layer (RLS) + app-layer (Prisma `WHERE company_id`). Both used.
- **pnpm over Nx** — ADR-001. Simple monorepo.
- **Versions locked** — Upgrades deferred to Phase 4 despite newer releases.

---

## 🔄 Last Session Summary

- Explored full codebase: confirmed tasks 0.1 → 1.2 complete
- Updated TASKS.md and PROGRESS.md to reflect actual state (were showing 0/72)
- Identified G-01 blocker: missing GRANT privileges for `agencyos_app` role
- Ready to execute Task 1.3: create migration with table GRANTs, write RLS isolation test

---

## ⏭ Next Up

After 1.3:

- 1.4 — Roles & Permissions System
- 1.5 — Tenant Onboarding Wizard
- 1.6 — Departments CRUD
- 1.7 — Employees CRUD

---

## 📈 Velocity Metrics

- Tasks complete: 8/72 (11.1%)
- Phase 0: 100% ✅
- Phase 1: 2/14 (14.3%)
