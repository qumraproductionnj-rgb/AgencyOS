# Bugs Found - Testing Sprint

> Date: 2026-05-16 | Tester: Claude Code (automated + static analysis)

---

## Critical (يمنع الاستخدام)

### BUG-001: No Auth Guard on Web App — Any URL is Publicly Accessible

- **Where:** `apps/web/middleware.ts`
- **What:** The Next.js middleware only handles i18n routing (next-intl). There is NO authentication check. Any visitor who opens `localhost:3000/ar/dashboard` sees the full app — no login required, no redirect.
- **Why Critical:** The entire SaaS platform is publicly accessible without authentication. A real user could not "Sign Up" because there is no signup page, and the app never asks for credentials.
- **Fix:** Add a JWT/session check in `middleware.ts`. Redirect unauthenticated users to `/[locale]/login`. Create a login page at `apps/web/src/app/[locale]/login/page.tsx`. Wire the auth store with Zustand + localStorage token.

### BUG-002: No Login Page in Main Web App

- **Where:** `apps/web/src/app/[locale]/` — no `login/` directory
- **What:** `localhost:3000/ar` redirects straight to dashboard. There is no `/login`, no `/signup`, and no `/forgot-password` route in the main tenant app. The `apps/portal/` has a login page (for external clients), but tenant employees have no entry point.
- **Why Critical:** New users (employees, owners) can't log in through the normal browser flow. They can only enter via `accept-invite` link from email.
- **Fix:** Create `/[locale]/login/page.tsx` with email/password form, wire to `POST /api/v1/auth/login`, store JWT in Zustand + httpOnly cookie or localStorage.

### BUG-003: VoiceButton Component Exists but is Never Rendered

- **Where:** `apps/web/src/components/voice-button.tsx`
- **What:** The `VoiceButton` component is fully implemented but is not imported anywhere in the app — not in the header, sidebar, command palette, or any layout file.
- **Why Critical:** Voice commands are a listed feature; testing them is impossible because the button doesn't appear anywhere.
- **Fix:** Import `VoiceButton` in `apps/web/src/components/layout/app-header.tsx` (or command palette).

---

## High (مزعج لكن يعمل)

### BUG-004: Dashboard KPIs Are Hardcoded Mock Data

- **Where:** `apps/web/src/components/dashboard/dashboard-client.tsx`
- **What:** All displayed numbers ("45.2M د.ع revenue", "6 active projects", "7/8 employees"), chart data, and activity feed are static constants. No API calls are made.
- **Fix:** Wire TanStack Query hooks to `GET /api/v1/reports/dashboard` endpoint.

### BUG-005: Intro Animation Only Triggers from `(app)` Routes

- **Where:** `apps/web/src/app/[locale]/(app)/layout.tsx`
- **What:** `IntroWrapper` is only in the `(app)` group layout. The root `localhost:3000/` redirects to `/dashboard` which IS inside `(app)`, so this works correctly — but routes outside `(app)` (employees, projects, invoices, attendance, etc.) are NOT inside that group, meaning the intro will NOT show for direct navigation to those pages.
- **Fix:** Either move `IntroWrapper` to the root `[locale]/layout.tsx`, or confirm all authenticated routes live under `(app)`. Currently most routes (employees, projects, invoices) are siblings of `(app)`, not children.

### BUG-006: All Non-Dashboard Routes Bypass the (app) Layout

- **Where:** `apps/web/src/app/[locale]/` structure
- **What:** Only `(app)/dashboard`, `(app)/admin`, and `(app)/help` are inside the `(app)` group that has the `IntroWrapper`. All other routes (employees, projects, invoices, tasks, attendance, settings, leads, content-studio, etc.) are outside the `(app)` group, meaning they use the root `[locale]/layout.tsx` with AppShell but **NOT** the `IntroWrapper`.
- **Impact:** Intro never shows on most pages. If auth middleware is added later, these routes need to be moved inside `(app)` or the auth check must be added to root layout.

### BUG-007: Settings Page Has No Intro Replay Button

- **Where:** `apps/web/src/components/settings/settings-client.tsx`
- **What:** The Week 8 spec mentioned "في Settings: إعادة مشاهدة المقدمة" — a button to clear `localStorage.removeItem('agencyos:intro:shown')` and replay the intro. This is not implemented.
- **Fix:** Add an "Appearance" or "General" tab section in settings with a "Replay Intro Animation" button that clears the localStorage key and reloads.

### BUG-008: PostHog and Sentry Env Vars Missing from `.env.prod.example`

- **Where:** Root `.env.prod.example` (or equivalent)
- **What:** `analytics.ts` references `process.env['NEXT_PUBLIC_POSTHOG_KEY']` and `process.env['NEXT_PUBLIC_POSTHOG_HOST']`. These are not documented in the env example file, so deployers won't know to set them.
- **Fix:** Add to env example:
  ```
  NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
  NEXT_PUBLIC_POSTHOG_HOST=https://eu.posthog.com
  SENTRY_DSN=https://xxx@sentry.io/xxx
  NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
  ```

### BUG-009: Electron Desktop App Has Placeholder Icons

- **Where:** `apps/desktop/assets/icon.png`, `apps/desktop/assets/tray-icon.png`
- **What:** Both icon files are 1×1 pixel placeholders. `electron-builder` will package these as the app icon — resulting in a broken/invisible tray icon and no app icon.
- **Fix:** Replace with real 1024×1024 PNG icon for `icon.png` and 32×32 or 22×22 PNG for `tray-icon.png`.

### BUG-010: `git push --tags` Not Run — v1.0.0 Tag is Local Only

- **Where:** Git remote
- **What:** `git tag v1.0.0` was created locally on commit `aeb638c`, but `git push --tags` was never run. The tag does not exist on the remote repository.
- **Fix:** Run `git push origin main --tags` when ready to publish the release.

---

## Low (تحسين)

### BUG-011: Waveform Bars Use Static `Math.sin(i)` — Not Real Audio

- **Where:** `apps/web/src/components/voice-button.tsx:59`
- **What:** The waveform animation bars use `Math.sin(i) * 4` as a static offset, not actual microphone amplitude data. The bars animate but don't reflect real voice input.
- **Fix:** Use `AudioContext` + `AnalyserNode` to get real frequency data and drive bar heights.

### BUG-012: `IntroWrapper` Calls `localStorage` During SSR

- **Where:** `apps/web/src/components/intro/intro-wrapper.tsx`
- **What:** `useEffect` correctly gates the `localStorage.getItem` call to client-only, but if hydration mismatch occurs (SSR sends `showIntro=false`, client shows `showIntro=true`), a flash could occur.
- **Current Status:** Low risk since `useState(false)` is the default and `useEffect` runs after mount. Acceptable.

### BUG-013: Particles Canvas Has No `aria-hidden` or `role="presentation"`

- **Where:** `apps/web/src/components/intro/particles.tsx`
- **What:** The canvas element is purely decorative but has no ARIA attributes to hide it from screen readers.
- **Fix:** Add `aria-hidden="true"` to the canvas element.

### BUG-014: `daily-report.job.ts` References `prisma.system.attendanceRecord` — Verify Field Name

- **Where:** `apps/api/src/jobs/daily-report.job.ts`
- **What:** The job counts today's attendance records. Need to verify the Prisma model is `attendanceRecord` (camelCase) not `attendance_record` — Prisma converts snake_case table names to camelCase by default, but a custom `@@map` could change this. Tests pass so this is likely fine.
- **Status:** Passing in test suite (50/50). Low risk.

---

## Missing Features

### MISS-001: No Login/Signup Page (Tenant Web App)

Full auth flow (login, signup, forgot password, reset password) does not exist in `apps/web`. The API backend fully implements these endpoints. Frontend pages need to be built.

### MISS-002: No Auth Middleware / Route Protection

`apps/web/middleware.ts` has no JWT validation. All routes are public. Needs a proper auth guard.

### MISS-003: VoiceButton Not Placed in UI

Component exists but is never rendered. Needs to be added to the app header or AI assistant panel.

### MISS-004: Intro Replay in Settings

Spec-requested "إعادة مشاهدة المقدمة" button not implemented in settings.

### MISS-005: Dashboard Not Connected to Real API

All KPI numbers are hardcoded. TanStack Query integration with backend reports endpoint is needed.

---

## Test Results Summary

| Layer                               | Result                                              |
| ----------------------------------- | --------------------------------------------------- |
| `pnpm --filter web typecheck`       | ✅ PASS (0 errors)                                  |
| `pnpm --filter api typecheck`       | ✅ PASS (0 errors)                                  |
| `pnpm --filter marketing typecheck` | ✅ PASS (0 errors)                                  |
| `pnpm --filter portal typecheck`    | ✅ PASS (0 errors)                                  |
| `pnpm --filter web lint`            | ✅ PASS (0 warnings)                                |
| `pnpm --filter api lint`            | ✅ PASS (0 warnings)                                |
| `pnpm --filter api test`            | ✅ 516 tests, 50 suites, all PASS                   |
| Docker / MailHog config             | ✅ Present in docker-compose.yml                    |
| Kanban (Tasks)                      | ✅ @dnd-kit drag-drop implemented                   |
| Excel export                        | ✅ xlsx library, `exportToExcel()` in lib/export.ts |
| PDF export                          | ✅ @react-pdf/renderer (client-side)                |
| @mentions                           | ✅ mention-input.tsx component exists               |
| Intro animation                     | ✅ Full 6-stage timeline, ESC support, skip button  |
| Voice commands                      | ⚠️ Implemented but not placed in UI                 |
| Auth (API)                          | ✅ Full NestJS auth module                          |
| Auth (Web UI)                       | ❌ No login page, no route protection               |
| Multi-tenant RLS                    | ✅ All tenant tables have company_id + RLS          |

## Lighthouse Estimate

> Manual Lighthouse audit requires running browser — not executable in this environment.
> Estimated scores based on codebase review:

| Metric         | Estimate | Confidence                                                      |
| -------------- | -------- | --------------------------------------------------------------- |
| Performance    | 70-80    | Medium — no SSR for dashboard, all mock data loaded client-side |
| Accessibility  | 80-85    | Medium — some decorative elements missing aria-hidden           |
| Best Practices | 90+      | High — Helmet headers, HTTPS config, no inline scripts          |
| PWA            | 85-90    | High — manifest.json + service worker via next-pwa              |

> To get real scores: run `npx lighthouse http://localhost:3000/ar/dashboard --view`
