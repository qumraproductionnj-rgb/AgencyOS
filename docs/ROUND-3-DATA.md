# ROUND 3 — Data Quality & Validation

**Delivered:** 2026-05-16  
**Status:** Complete ✓  
**typecheck:** pass | **lint:** pass

---

## Summary

ROUND 3 hardened data integrity across the full stack — from user input through API contracts to error recovery. No new endpoints, no schema changes.

---

## Phase A — Form Validation (Zod + React Hook Form)

**New files:**

- `apps/web/src/lib/schemas/project.schema.ts`
- `apps/web/src/lib/schemas/invoice.schema.ts`
- `apps/web/src/lib/schemas/employee.schema.ts`
- `apps/web/src/lib/schemas/client.schema.ts`
- `apps/web/src/lib/schemas/task.schema.ts`
- `apps/web/src/lib/schemas/quotation.schema.ts`
- `apps/web/src/components/FieldError.tsx`

**Rewritten with `useForm` + `zodResolver`:**

- `project-modal.tsx` — deadline > startDate cross-field refinement
- `task-modal.tsx` — dueDate >= startDate refinement
- `employee-create-modal.tsx` — Iraqi phone regex, Arabic name detection
- `client-modal.tsx` — VIP/blacklist mutual exclusion via `.refine()`
- `invoice-form.tsx` — dueDate ≥ today, total > 0, item price validation
- `quotation-form.tsx` — validUntil must be future date

**Key decisions:**

- Line item arrays (invoices, quotations) remain as `useState` because dynamic arrays in RHF add complexity without benefit here; the Zod schema still validates them at submit time
- `exactOptionalPropertyTypes` requires spreading optional fields conditionally before passing to API hooks

---

## Phase B — Optimistic Updates with Rollback

**Modified:**

- `apps/web/src/hooks/use-tasks.ts` — `useUpdateTask`, `useUpdateTaskStatus`
- `apps/web/src/hooks/use-projects.ts` — `useUpdateProjectStage`

**Pattern used:**

```typescript
onMutate: async (vars) => {
  await queryClient.cancelQueries({ queryKey })
  const snapshot = queryClient.getQueriesData({ queryKey })
  queryClient.setQueriesData(...)  // optimistic update
  return { snapshot }
},
onError: (_, __, ctx) => {
  ctx?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data))
},
onSettled: () => queryClient.invalidateQueries({ queryKey }),
```

---

## Phase C — Error Recovery

**New files:**

- `apps/web/src/hooks/use-online.ts` — `online`/`offline` event listener
- `apps/web/src/components/OfflineBanner.tsx` — fixed red banner when offline
- `apps/web/src/components/RouteError.tsx` — shared error boundary UI
- 21× `error.tsx` files across all app routes

**Modified:**

- `apps/web/src/lib/api.ts` — exponential backoff retry (up to 3×) on 5xx, single retry on network failure
- `apps/web/src/components/app-shell.tsx` — added `OfflineBanner`

---

## Phase D — Backend DTO Validation

**Modified:**

- `apps/api/src/projects/project.dto.ts` — deadline > startDate `.refine()`, currency enum, name min=3
- `apps/api/src/invoices/invoice.dto.ts` — total > 0 `.refine()`, currency enum

---

## Phase E — Confirm Dialogs

Replaced all `window.confirm()` calls with `<ConfirmDialog requireTyping="delete">`.

**New file:** `apps/web/src/components/ConfirmDialog.tsx`  
**Applied to:** `employee-table`, `project-list`, `task-list`, `client-table`, `invoice-list`

Notable warnings:

- **Clients:** "this will also delete all contacts linked to this client"
- **Invoices:** `variant="warning"` + accounting impact notice
- **Employees:** standard danger variant

---

## Phase F — Audit Trail

**Modified:** `apps/web/src/app/[locale]/admin/audit-logs/page.tsx`

- Replaced spinner with `SkeletonTable`
- Added "Changes" column with expandable `<details>` / `<pre>` JSON diff
- Fixed colSpan 5 → 6

(Backend audit trail was already fully implemented via `AuditInterceptor`.)

---

## Files Changed — Complete List

| File                                                 | Change                              |
| ---------------------------------------------------- | ----------------------------------- |
| `src/lib/schemas/*.ts` (×6)                          | New Zod schemas                     |
| `src/components/FieldError.tsx`                      | New inline error display            |
| `src/components/ConfirmDialog.tsx`                   | New destructive action confirmation |
| `src/components/RouteError.tsx`                      | New error boundary UI               |
| `src/components/OfflineBanner.tsx`                   | New offline indicator               |
| `src/hooks/use-online.ts`                            | New network status hook             |
| `src/hooks/use-tasks.ts`                             | Optimistic updates                  |
| `src/hooks/use-projects.ts`                          | Optimistic updates                  |
| `src/lib/api.ts`                                     | Retry + backoff logic               |
| `src/components/app-shell.tsx`                       | OfflineBanner integration           |
| `src/components/projects/project-modal.tsx`          | RHF + Zod                           |
| `src/components/tasks/task-modal.tsx`                | RHF + Zod                           |
| `src/components/employees/employee-create-modal.tsx` | RHF + Zod                           |
| `src/components/clients/client-modal.tsx`            | RHF + Zod                           |
| `src/components/invoices/invoice-form.tsx`           | RHF + Zod                           |
| `src/components/quotations/quotation-form.tsx`       | RHF + Zod                           |
| `src/components/invoices/invoice-list.tsx`           | ConfirmDialog                       |
| `src/components/clients/client-table.tsx`            | ConfirmDialog                       |
| `src/components/employees/employee-table.tsx`        | ConfirmDialog                       |
| `src/components/projects/project-list.tsx`           | ConfirmDialog + EmptyState          |
| `src/components/tasks/task-list.tsx`                 | ConfirmDialog                       |
| `src/app/[locale]/admin/audit-logs/page.tsx`         | Skeleton + Changes column           |
| 21× `src/app/**/error.tsx`                           | Error boundaries                    |
| `apps/api/src/projects/project.dto.ts`               | Business rule refinements           |
| `apps/api/src/invoices/invoice.dto.ts`               | Business rule refinements           |
| `apps/web/messages/en.json` + `ar.json`              | New i18n keys                       |
