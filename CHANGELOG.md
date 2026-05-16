# Changelog

All notable changes to AgencyOS are documented here.

---

## [Unreleased]

### ROUND 3 — Data Quality & Validation (2026-05-16)

#### Added

- Zod validation schemas for all 6 major forms (projects, tasks, employees, clients, invoices, quotations)
- `FieldError` component for inline form validation messages
- `ConfirmDialog` component with `requireTyping` prop for destructive actions
- `RouteError` component as shared error boundary UI
- `OfflineBanner` component — fixed top banner shown when network is offline
- `use-online` hook — listens to browser `online`/`offline` events
- 21 `error.tsx` Next.js error boundaries across all app routes
- Audit logs page: "Changes" column with expandable JSON diff view

#### Changed

- `invoice-form.tsx` — rewritten with React Hook Form + Zod (was manual `useState`)
- `quotation-form.tsx` — rewritten with React Hook Form + Zod
- `project-modal.tsx` — rewritten with React Hook Form + Zod; deadline > startDate cross-field validation
- `task-modal.tsx` — rewritten with React Hook Form + Zod
- `employee-create-modal.tsx` — rewritten with RHF + Zod; Iraqi phone regex validation
- `client-modal.tsx` — rewritten with RHF + Zod; VIP/blacklist mutual exclusion
- `use-tasks.ts` — optimistic updates with snapshot rollback on `useUpdateTask` and `useUpdateTaskStatus`
- `use-projects.ts` — optimistic updates with rollback on `useUpdateProjectStage`
- `api.ts` — exponential backoff retry (up to 3×) on server errors; single retry on network failure
- `app-shell.tsx` — integrated `OfflineBanner` and `OfflineStatus`
- `project.dto.ts` (API) — added `deadline > startDate` refinement, currency enum, name min=3
- `invoice.dto.ts` (API) — added `total > 0` refinement, currency enum
- Replaced all `window.confirm()` calls with `ConfirmDialog` across employee, project, task, client, and invoice views
- Audit logs page: replaced loading spinner with `SkeletonTable`

---

## ROUND 2 — UX & Workflows (prior session)

### Added

- `InlineEdit` component — click-to-edit for text, number, date, and select fields
- `DetailDrawer` component — right-side drawer for detail views
- `EmptyState` component — icon + title + description + CTA buttons
- `SkeletonTable`, `SkeletonCards`, `SkeletonStat` — skeleton loaders replacing all "Loading..." text
- `ShortcutsHelp` modal — opened by `?` key, shows all keyboard shortcuts
- `use-keyboard-shortcuts` hook — G+letter navigation, ⌘B sidebar toggle
- Keyboard shortcut `?` opens help modal; `G` + letter navigates to routes
- Inline editing on task titles (kanban + list)
- Inline editing on project name and stage (project list)

---

## [1.0.0] — 2026-05-01 (Vision OS v1.0.0 Public Launch)

Initial production release. See git log for full feature list.
