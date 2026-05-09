# PROGRESS.md — Build Progress Tracker

> هذا الملف يُحدَّث بواسطة Claude Code بعد كل مهمة. لا تعدّله يدوياً إلا في حالات استثنائية.

---

## 📍 Current State

**Phase:** Phase 1 — Foundation
**Current Task:** 1.7 — Employees CRUD
**Last Updated:** 2026-05-09

---

## 📊 Progress Overview

```
Phase 0 — Setup:                    [██████] 6/6 ✅
Phase 1 — Foundation:               [████░░░░░░░░░░] 4/14
Phase 2 — Core Operations:          [░░░░░░░░░░░░░░░░░░] 0/18
Phase 3 — Creative & Collaboration: [░░░░░░░░░░░░░░░░░░░░░░] 0/22
Phase 4 — SaaS Layer:               [░░░░░░░░░░░░] 0/12

TOTAL:                              [██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 10/72
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

### Phase 1 — Foundation (4/14)

- **1.1** — Database Schema for Phase 1 (all tables + RLS policies + indexes + seed)
- **1.2** — Authentication Tier 2 (Argon2id, JWT RS256, signup/login/refresh/verify/reset, lockout, sessions, email templates AR+EN)
- **1.3** — Tenant Context Middleware + RLS Wiring (PrismaService dual clients, TenantContext, RLS policies, GRANTs, isolation tests)
- **1.4** — Roles & Permissions System (35 permissions, 11 roles, seed, guards, decorators, PermissionService, 26 tests)
- **1.5** — Tenant Onboarding Wizard (5-step wizard, backend endpoints, progress save/resume, skip flow, RTL AR/EN frontend)
- **1.6** — Departments CRUD (NestJS API, frontend table+modal, soft delete, 5 unit tests)

---

## 🚧 In Progress

**Task 1.7 — Employees CRUD**

- Not yet started

---

## 🚫 Blockers

None currently.

---

## 📝 Decisions Made

- **Argon2id over bcrypt** — ADR-002 confirmed; MasterSpec §10 superseded. Implemented in auth.service.ts.
- **RLS defense in depth** — DB-layer (RLS) + app-layer (Prisma `WHERE company_id`). Both used.
- **pnpm over Nx** — ADR-001. Simple monorepo.
- **Versions locked** — Upgrades deferred to Phase 4 despite newer releases.

---

## 🔄 Last Session Summary

- Completed Task 1.6 — Departments CRUD (backend 4 endpoints + frontend table/modal + 5 unit tests)
- Added `api.del()` method to fetch wrapper
- All 31 tests pass, web + api typecheck/lint clean
- Ready to execute Task 1.7: Employees CRUD backend + frontend

---

## ⏭ Next Up

- 1.7 — Employees CRUD
- 1.8 — Work Locations CRUD with Map
- 1.9 — PWA Setup

---

## 📈 Velocity Metrics

- Tasks complete: 10/72 (13.9%)
- Phase 0: 100% ✅
- Phase 1: 4/14 (28.6%)
