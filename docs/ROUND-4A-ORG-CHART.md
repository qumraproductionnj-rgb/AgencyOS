# ROUND 4A — Dynamic Org Chart

**Delivered:** 2026-05-16
**Status:** Complete — awaiting approval before 4B
**typecheck:** pass (api + web + database) | **lint:** pass | **tests:** 522/522 (was 511, +11 new department tests)

---

## Scope

Foundation layer for the dynamic org structure feature set. Adds the data model
and a 3-step setup wizard for picking a company's structure type and
populating it with departments and employees.

Per agreement, this round did **not** include:

- Skills / capacity (4B)
- Role-based dashboards (4C)
- Smart task assignment (4D)
- GPS attendance overhaul (4E)
- AI performance reviews (4F)
- Drag-and-drop on the wizard (deferred polish)

---

## Database changes

**Migration:** `packages/database/prisma/migrations/20260516000000_round4a_org_chart/migration.sql`

> ⚠ Migration written but **not executed**. Run `pnpm db:migrate` manually when ready.

| Change     | Table                          | Detail                                                    |
| ---------- | ------------------------------ | --------------------------------------------------------- |
| New enum   | `org_structure_type`           | `FLAT \| HIERARCHICAL \| HYBRID`                          |
| New column | `companies.org_structure_type` | NOT NULL, default `FLAT`                                  |
| New column | `users.is_manager`             | BOOLEAN, NOT NULL, default `FALSE`                        |
| New column | `departments.parent_id`        | UUID, nullable, FK → `departments(id)` ON DELETE SET NULL |
| New column | `departments.icon`             | TEXT, nullable                                            |
| New column | `departments.color`            | TEXT, nullable                                            |
| New index  | `idx_departments_parent_id`    | for hierarchy traversal                                   |

Per the agreement, `Employee.departmentId` remains the source of truth for
department membership (already existed). `User.isManager` is a derived flag
maintained automatically by the service when a user is set or cleared as a
department manager.

---

## Backend

**New endpoints** (all under `/api/v1/departments`):

| Method | Path                                 | Roles                    | Purpose                      |
| ------ | ------------------------------------ | ------------------------ | ---------------------------- |
| GET    | `/departments/tree`                  | owner, admin, hr_manager | Departments as a nested tree |
| GET    | `/departments/org-structure/current` | owner, admin, hr_manager | Read current structure type  |
| PATCH  | `/departments/org-structure/current` | owner, admin             | Set FLAT/HIERARCHICAL/HYBRID |

**Extended endpoints** — `POST/PUT /departments` now accept `parentId`, `icon`,
`color` in addition to the existing fields.

**Service hardening:**

- `assertParentInCompany` — parent must exist in the same tenant
- `assertNoCycle` — refuses moves that would create a cycle in the hierarchy
- `syncManagerFlag` / `recomputeManagerFlag` — `User.isManager` is recomputed
  whenever a manager is assigned, replaced, or has their last department
  removed (counts active managed depts)

**Modified files:**

- `apps/api/src/departments/department.dto.ts`
- `apps/api/src/departments/department.service.ts` (+ getOrgStructure / setOrgStructure / findTree / cycle + manager-flag logic)
- `apps/api/src/departments/department.controller.ts` (+ 3 new routes)
- `apps/api/src/departments/department.service.spec.ts` (+ 8 new tests covering tree, cycle, manager flag, structure type)

---

## Frontend

**New route:** `/{locale}/settings/org-structure`

**New components:**

- `apps/web/src/components/org-structure/org-wizard.tsx`
  - 3 steps with persistent state in the chosen structure type (server-backed)
  - Step 1 — three cards (Flat / Hierarchical / Hybrid) with a confirmation badge
  - Step 2 — department list rendered as a tree (children indented under parents); skipped automatically for `FLAT` companies
  - Step 3 — employee table with an inline department dropdown per row; surfaces unassigned count
- `apps/web/src/components/org-structure/department-editor.tsx`
  - Modal with: name AR/EN, description, icon picker (12 emoji presets), color swatch (8 presets), manager dropdown (all users), parent dropdown (HYBRID only; filters self)
  - Soft delete in-modal with confirm

**Hook layer:** `apps/web/src/hooks/use-departments.ts`

- Extended `Department` type with `parentId`, `icon`, `color`, `_count`
- New `useDepartmentTree`, `useOrgStructure`, `useSetOrgStructure`
- Existing create/update/delete hooks invalidate the new tree key

---

## Seed: three demo tenants

Added `seedRound4ADemoTenants` to `packages/database/prisma/seed.ts`. Runs after
the existing Ru'ya seed so demo data is additive.

| Tenant          | Slug              | Structure    | Users | Departments                                                                                                                                            |
| --------------- | ----------------- | ------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Spark Studio    | `spark-studio`    | FLAT         | 4     | 0 (no departments)                                                                                                                                     |
| Pixel House     | `pixel-house`     | HIERARCHICAL | 10    | 3 top-level, all with managers                                                                                                                         |
| Crescent Agency | `crescent-agency` | HYBRID       | 15    | 1 top-level `Creative` + 3 sub-depts (Photography has no manager) + 1 unmanaged top-level `Writing`; 1 employee deliberately unassigned (general pool) |

All demo users share password `Demo1234!`. Owner accounts: `owner@spark.iq`,
`owner@pixel.iq`, `owner@crescent.iq`.

---

## Acceptance criteria checked

| Criterion                                              | Status                                                                                                                     |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Setup wizard works for 3 hierarchies                   | ✓ Same wizard adapts: FLAT skips dept step, HIERARCHICAL warns when a dept lacks a manager, HYBRID exposes parent dropdown |
| Seed produces 3 tenants (flat / hierarchical / hybrid) | ✓ See table above                                                                                                          |
| `typecheck` clean across api + web + database          | ✓                                                                                                                          |
| `lint` clean across api + web                          | ✓                                                                                                                          |
| Tests pass                                             | ✓ 522/522 (+11 new department tests)                                                                                       |
| Migration SQL written but not executed                 | ✓ Per agreement                                                                                                            |

---

## Follow-ups (intentionally deferred)

- Drag-and-drop on the wizard tree and employee assignment (UX polish)
- Surfacing the wizard from the existing Settings shell (currently reachable only by direct URL)
- E2E test for the wizard flow
- Backfill: any production tenants would default to `FLAT` after the migration runs; if the user wants a different default for existing tenants they'll need a one-time data migration

---

## Files changed (full list)

```
modified   packages/database/prisma/schema.prisma
new        packages/database/prisma/migrations/20260516000000_round4a_org_chart/migration.sql
modified   packages/database/prisma/seed.ts
modified   apps/api/src/departments/department.dto.ts
modified   apps/api/src/departments/department.service.ts
modified   apps/api/src/departments/department.controller.ts
modified   apps/api/src/departments/department.service.spec.ts
modified   apps/web/src/hooks/use-departments.ts
new        apps/web/src/app/[locale]/(app)/settings/org-structure/page.tsx
new        apps/web/src/components/org-structure/org-wizard.tsx
new        apps/web/src/components/org-structure/department-editor.tsx
new        docs/ROUND-4A-ORG-CHART.md
modified   CHANGELOG.md
```
