# PROGRESS.md — Build Progress Tracker

> هذا الملف يُحدَّث بواسطة Claude Code بعد كل مهمة. لا تعدّله يدوياً إلا في حالات استثنائية.

---

## 📍 Current State

**Phase:** Phase 1 — Foundation
**Current Task:** 1.9 — PWA Setup
**Last Updated:** 2026-05-09

---

## 📊 Progress Overview

```
Phase 0 — Setup:                    [██████] 6/6 ✅
Phase 1 — Foundation:               [██████░░░░░░░░] 6/14
Phase 2 — Core Operations:          [░░░░░░░░░░░░░░░░░░] 0/18
Phase 3 — Creative & Collaboration: [░░░░░░░░░░░░░░░░░░░░░░] 0/22
Phase 4 — SaaS Layer:               [░░░░░░░░░░░░] 0/12

TOTAL:                              [███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 12/72
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

### Phase 1 — Foundation (6/14)

- **1.1** — Database Schema for Phase 1 (all tables + RLS policies + indexes + seed)
- **1.2** — Authentication Tier 2 (Argon2id, JWT RS256, signup/login/refresh/verify/reset, lockout, sessions, email templates AR+EN)
- **1.3** — Tenant Context Middleware + RLS Wiring (PrismaService dual clients, TenantContext, RLS policies, GRANTs, isolation tests)
- **1.4** — Roles & Permissions System (35 permissions, 11 roles, seed, guards, decorators, PermissionService, 26 tests)
- **1.5** — Tenant Onboarding Wizard (5-step wizard, backend endpoints, progress save/resume, skip flow, RTL AR/EN frontend)
- **1.6** — Departments CRUD (NestJS API, frontend table+modal, soft delete, 5 unit tests)
- **1.7** — Employees CRUD (NestJS API, frontend table+modal+detail+accept-invite, 7 unit tests, 38 total)
- **1.8** — Work Locations CRUD (NestJS API + Leaflet map + assign employees, 5 unit tests, 43 total)

---

## 🚧 In Progress

**Task 1.9 — PWA Setup**

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

- Completed Task 1.8 — Work Locations CRUD: backend API (6 endpoints + assign/unassign employees) + Leaflet map picker + radius slider + employee multi-select + i18n AR/EN
- Added `leaflet` + `react-leaflet@4` (compatible with React 18) + `@types/leaflet`
- All 43 tests pass, web + api typecheck/lint clean
- Ready to execute Task 1.9: PWA Setup

---

## ⏭ Next Up

- 1.9 — PWA Setup
- 1.10 — GPS Check-In API
- 1.11 — Check-In UI (Mobile PWA)

---

## 📈 Velocity Metrics

- Tasks complete: 12/72 (16.7%)
- Phase 0: 100% ✅
- Phase 1: 6/14 (42.9%)
