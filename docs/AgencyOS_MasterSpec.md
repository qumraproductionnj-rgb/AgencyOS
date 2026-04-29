# AgencyOS — Master Specification for Claude Code

**Version:** 2.0 (Final)
**Owner:** Ru'ya for Artistic Production (رؤية للإنتاج الفني)
**Purpose:** Complete, unambiguous build specification. Claude Code must follow this document strictly. Any deviation requires explicit human approval.

---

## 0. HOW CLAUDE CODE MUST USE THIS DOCUMENT

1. Build in phases (Section 17). Never start Phase N+1 before Phase N is verified working.
2. Before coding any module, re-read its section in this spec.
3. After each phase, produce: working code + tests + a short status report.
4. If a requirement is ambiguous, STOP and ask. Do not invent business logic.
5. Never delete data. Always soft-delete via `deleted_at`.
6. Every database table inherits the standard columns (Section 16.1).
7. Every API endpoint inherits the standard middleware (Section 15.1).

---

## 1. PLATFORM IDENTITY

| Field | Value |
|---|---|
| Product Name | AgencyOS |
| Tagline | Operating System for Marketing & Creative Production Agencies |
| Primary Tenant | Ru'ya for Artistic Production (Iraq) |
| Business Model | Multi-tenant SaaS (Ru'ya is tenant #1, others sign up after) |
| Default Languages | Arabic (ar-IQ) + English (en-US) |
| Default Currencies | IQD (Iraqi Dinar) + USD |
| Default Timezone | Asia/Baghdad (UTC+3) |
| Default Calendar | Gregorian (Hijri optional display) |

---

## 2. THREE-TIER USER MODEL

This is critical — the SaaS has three distinct user tiers, each with separate auth contexts:

### Tier 1: Platform Admin (Super Admin)
- Operates the SaaS platform itself
- Manages all tenant companies, subscriptions, billing
- Has access to platform-wide analytics
- Lives in a separate admin panel: `admin.agencyos.app`
- This is **you** (Ru'ya leadership) when wearing the SaaS-operator hat

### Tier 2: Tenant Users (Agency Staff)
- Belong to one tenant company (`company_id`)
- Roles: owner, admin, hr_manager, project_manager, creative_director, designer, video_editor, account_manager, sales, freelancer
- Live in: `app.agencyos.app` or custom subdomain `{company}.agencyos.app`
- Ru'ya employees fall here

### Tier 3: External Users
- **Clients**: linked to one or more tenants via client portal access
- **Freelancers**: can work for multiple tenants, each with separate access scope
- Live in: `portal.agencyos.app`
- Limited to specific projects/files only

> Authentication uses three separate JWT signing contexts so a Platform Admin token cannot accidentally access tenant data, and vice versa.

---

## 3. TECH STACK (LOCKED)

### Frontend
- **Framework:** Next.js 14 (App Router) + React 18 + TypeScript
- **Styling:** TailwindCSS + shadcn/ui components
- **State:** Zustand (client) + TanStack Query (server state)
- **Forms:** React Hook Form + Zod validation
- **i18n:** next-intl (full RTL/LTR switching)
- **PWA:** next-pwa for mobile attendance app
- **Charts:** Recharts
- **Date handling:** date-fns + date-fns-tz (with Hijri plugin optional)

### Backend
- **Framework:** NestJS 10 + TypeScript
- **API style:** REST (versioned at `/api/v1`) + WebSockets for real-time
- **Validation:** class-validator + class-transformer
- **ORM:** Prisma (PostgreSQL)
- **Queue:** BullMQ (Redis-backed) for async jobs
- **File handling:** TUS protocol for chunked uploads
- **PDF generation:** Puppeteer (handles Arabic RTL correctly, unlike pdfkit)

### Database
- **Primary:** PostgreSQL 16
- **Cache/Queue:** Redis 7
- **Search (Phase 3+):** Meilisearch (Arabic-friendly)

### Storage
- **Object Storage:** Cloudflare R2 (S3-compatible, cheap egress, works in Iraq)
- **CDN:** Cloudflare CDN for asset delivery
- **Backup:** Daily automated snapshots, 30-day retention

### Infrastructure
- **Container:** Docker + Docker Compose for local dev
- **Deployment:** Phase 1: single VPS (Hetzner). Phase 4: Kubernetes if needed.
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry (errors) + Plausible (analytics, GDPR-friendly)

---

## 4. MULTI-TENANT STRATEGY

### Isolation Model: Shared DB + Row-Level Security (RLS)

Every tenant-owned table includes `company_id`. PostgreSQL RLS policies enforce isolation at the database level so even a buggy query cannot leak data across tenants.

**Standard RLS pattern for each tenant table:**

```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON projects
  USING (company_id = current_setting('app.current_company_id')::uuid);
```

The NestJS request middleware sets `app.current_company_id` per-request from the validated JWT.

### Tenant Onboarding Flow

1. Visitor signs up at `agencyos.app/signup`
2. Creates company record + owner account (linked to Tier 2)
3. 14-day trial on Professional plan auto-activated
4. Wizard guides owner through:
   - Company profile (name in AR + EN, logo, address)
   - GPS work location setup
   - Default departments
   - Invite first 3 employees
   - Subscription plan selection (after trial)
5. Tenant becomes active

### Tenant Deactivation
- If subscription expires → tenant goes read-only for 14 days
- After 14 days → suspended (no access, data preserved)
- After 90 days → data anonymized, kept for legal retention only

---

## 5. LOCALIZATION STANDARDS

### Languages
- **Arabic (default for Ru'ya):** Full RTL layout, Arabic UI strings, Arabic-first ordering
- **English:** LTR, fallback for missing AR strings

### Per-User Setting
Each user can independently toggle language. The app remembers preference per device.

### Per-Tenant Setting
Tenants set default language for new users + invoice/quotation language per client.

### Numerals
- Default: Western Arabic numerals (0123456789) for compatibility
- Optional toggle: Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩) for display only — never for storage

### Calendar
- Storage: Always ISO 8601 UTC
- Display: Gregorian default; Hijri available as secondary display under date

### PDF Documents (Critical)
- Arabic invoices/quotations MUST render correctly with RTL
- Use Puppeteer with HTML+CSS templates, not pdfkit
- Test with the sentence: "فاتورة رقم ١٢٣ بمبلغ 5,000,000 د.ع"

---

## 6. SUBSCRIPTION PLANS

| Plan | Users | Storage | AI Generations/mo | Modules | Price |
|---|---|---|---|---|---|
| Starter | 5 | 10 GB | 0 | Core (Projects, Tasks, Attendance, HR-light) | TBD |
| Professional | 20 | 100 GB | 50 | All except Exhibition + Equipment | TBD |
| Agency | Unlimited | 1 TB | Unlimited | All modules | TBD |
| Enterprise | Custom | Custom | Custom | All + custom integrations + white-label | Custom |

### Trial
- 14 days on Professional
- No credit card required
- Auto-downgrade to read-only on expiry

### Payment Gateways
- **Stripe** for international tenants (USD)
- **Local Iraqi gateways** (FastPay, ZainCash, FIB) for IQD — research integration in Phase 4
- **Bank transfer + manual activation** as fallback

### Feature Gating
Implement via a `subscription.features` JSON field. Frontend checks before rendering locked UI; backend enforces on every API call. Locked actions return `403 PLAN_LIMIT_EXCEEDED` with the plan required.

---

## 7. ROLES & PERMISSIONS MATRIX

Permissions are role-based with optional per-user overrides.

| Module | Owner | Admin | HR Mgr | PM | Creative Dir | Designer | Editor | Acct Mgr | Sales | Freelancer | Client |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Billing/Subscription | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Company Settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Employees (read) | ✅ | ✅ | ✅ | partial | partial | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Employees (write) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Attendance | ✅ | ✅ | ✅ | own team | own team | own | own | own | own | ❌ | ❌ |
| Payroll | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| CRM/Leads | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Clients | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | self |
| Projects | ✅ | ✅ | ❌ | ✅ | ✅ | assigned | assigned | ✅ | ❌ | assigned | own |
| Tasks | ✅ | ✅ | ❌ | ✅ | ✅ | assigned | assigned | ✅ | ❌ | assigned | ❌ |
| Asset Library | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | assigned | ❌ |
| Content Calendar | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | own |
| AI Tools | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Equipment | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Exhibitions | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Quotations/Invoices | ✅ | ✅ | ❌ | view | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | own |
| Expenses | ✅ | ✅ | ❌ | submit | submit | submit | submit | submit | submit | submit | ❌ |
| Reports | ✅ | ✅ | HR only | own | own | ❌ | ❌ | own | own | ❌ | ❌ |
| Audit Logs | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

`partial` = read-only, names only. `assigned` = only records they're assigned to. `own` = only records they created/owned. `self` = client sees only their own data.

---

## 8. MODULES

### MODULE 1 — Authentication & Identity

**Endpoints:**
- `POST /auth/signup` (tenant creation, Tier 2 only)
- `POST /auth/login` (returns access + refresh tokens)
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/verify-email`
- `POST /auth/2fa/enable` (TOTP)
- `POST /auth/2fa/verify`

**Security:**
- Passwords: bcrypt, cost factor 12
- JWT access token: 15 min expiry
- Refresh token: 7 days, rotated on each use
- Failed login: lock account after 5 attempts in 15 min
- All sessions tracked in `sessions` table (device, IP, last_active)

---

### MODULE 2 — Attendance & GPS Check-In

**Critical: PWA-based, mobile-first.**

**Setup (Owner/HR):**
```
work_locations:
  id, company_id
  name (e.g., "Main Office", "Studio")
  latitude, longitude
  radius_meters (default 100)
  is_active
  assigned_employees: [employee_id] (or all)
```

**Check-in Logic:**
1. Employee opens PWA → grants geolocation permission
2. App fetches GPS → calls `POST /attendance/check-in` with lat/lng
3. Backend: calculates distance from any of employee's assigned work_locations
4. If distance ≤ radius → SUCCESS, recorded
5. If distance > radius → BLOCKED with message "أنت على بعد X متر من المكتب"
6. iOS Safari note: PWA geolocation needs HTTPS + user gesture. Handle gracefully with helpful error.

**Late Detection:**
- Each employee has `scheduled_start_time` (e.g., 09:00) and `grace_period_minutes` (default 15)
- If `check_in_time > scheduled_start + grace_period` → status = `late`
- Notification fires to HR Manager

**Manual Override (HR Only):**
- HR can record check-in for absent/remote employee
- Required: reason text (audit logged)

**Schema:**
```
attendance_records:
  id, company_id, employee_id, work_location_id
  check_in_time, check_out_time
  check_in_lat, check_in_lng, check_in_distance_m
  check_out_lat, check_out_lng
  device_info (JSON: user_agent, device_id, app_version)
  status: present | late | absent | remote | manual_override
  override_reason, override_by_employee_id
  work_hours_calculated (decimal)
  notes
  + standard columns
```

**Offline Support (Phase 1.5):**
PWA queues check-in if offline; syncs when back online with original timestamp. GPS still required.

---

### MODULE 3 — Human Resources

**Sub-modules:**
1. Employees
2. Departments
3. Leave management
4. Payroll
5. Performance reviews
6. Documents (contracts)

**Schema highlights:**
```
employees:
  id, company_id, user_id (linked to users table)
  full_name_ar, full_name_en
  employee_code (auto: EMP-2026-001)
  email, phone, national_id
  position, department_id
  employment_type: full_time | part_time | freelancer | intern | contract
  salary_amount (integer, lowest unit)
  salary_currency: IQD | USD
  salary_type: monthly | daily | hourly | per_project
  start_date, end_date
  scheduled_start_time, scheduled_end_time
  weekly_off_days (e.g., [Friday, Saturday])
  status: active | on_leave | terminated | suspended
  profile_photo_url
  notes_internal
  + standard columns

leaves:
  id, company_id, employee_id
  leave_type: annual | sick | emergency | unpaid | maternity | bereavement
  start_date, end_date, days_count
  reason
  status: pending | approved | rejected | cancelled
  approved_by, approved_at
  attachment_url (e.g., medical certificate)

leave_balances:
  id, company_id, employee_id, year
  annual_total, annual_used, annual_remaining
  sick_total, sick_used

payroll_runs:
  id, company_id, month, year
  status: draft | finalized | paid
  total_amount_iqd, total_amount_usd
  generated_by, finalized_at

payroll_entries:
  id, payroll_run_id, employee_id
  base_salary
  additions: [{type, amount, currency, note}] // overtime, bonuses
  deductions: [{type, amount, currency, note}] // late, absence, advance
  net_amount, currency
  paid_at, payment_reference

performance_reviews:
  id, company_id, employee_id
  period_start, period_end
  kpis: [{name, target, actual, score_1_to_5, weight}]
  overall_score, manager_comments, employee_comments
  reviewed_by, reviewed_at
```

**Approval chains:**
- Leave > 5 days → HR Manager + Owner approval required
- Salary changes → Owner approval required (audit-logged)

---

### MODULE 4 — CRM (Leads, Deals, Clients)

```
leads:
  id, company_id
  company_name, contact_name
  email, phone, source
  industry, country, city
  estimated_value, currency
  pipeline_stage: new | contacted | meeting_scheduled | proposal_sent | negotiation | won | lost
  lost_reason (if lost)
  assigned_to (user_id)
  next_follow_up_date
  notes (rich text)
  + standard columns

clients:
  id, company_id
  company_name_ar, company_name_en
  industry, logo_url
  primary_contact_name, email, phone
  billing_address (JSON: street, city, country, postal_code)
  tax_id
  account_manager_id
  client_since
  total_revenue_iqd, total_revenue_usd (calculated)
  status: active | inactive | vip | blacklisted
  portal_access_enabled (bool)
  + standard columns

contacts:
  id, company_id, client_id
  full_name, role_title, email, phone
  is_primary, notes

deals:
  id, company_id, client_id, lead_id (nullable)
  title, value, currency
  status: active | won | lost | on_hold
  probability_pct, close_date
  notes
```

**Lead → Won automation:**
- Creates `client` record (if not exists)
- Creates `deal` (status=won)
- Triggers prompt: "Create campaign now?" + "Create quotation now?"

---

### MODULE 5 — Quotations & Invoices

**Quotations:**
```
quotations:
  id, company_id, client_id, deal_id (nullable)
  quotation_number (auto: QUO-2026-001, per-tenant counter)
  language: ar | en
  title, description
  line_items: [{
    description, quantity, unit_price, currency, total
  }]
  subtotal_iqd, subtotal_usd
  discount_type: none | pct | flat
  discount_value, discount_amount
  tax_pct, tax_amount
  total_amount, currency
  exchange_rate_used (if mixed currency)
  validity_date
  status: draft | sent | viewed | accepted | rejected | expired
  pdf_url
  terms_and_conditions
  notes
  sent_at, viewed_at, decision_at
  + standard columns
```

**Quotation → Acceptance flow:**
- PDF includes a unique link `portal.agencyos.app/q/{token}`
- Client clicks link → views quotation
- Client clicks "Accept" → digital acceptance recorded with IP + timestamp
- System auto-creates project + invoice draft

**Invoices:**
```
invoices:
  id, company_id, client_id, project_id, quotation_id
  invoice_number (auto: INV-2026-001)
  language, line_items, subtotal, discount, tax, total, currency
  due_date
  status: draft | sent | partially_paid | paid | overdue | cancelled
  is_recurring (bool), recurrence_rule (RRULE for retainers)
  pdf_url
  + standard columns

payments:
  id, company_id, invoice_id
  amount, currency
  payment_method: cash | bank_transfer | fastpay | zaincash | fib | stripe | other
  payment_date, reference_number
  notes, attachment_url
  recorded_by

expenses:
  id, company_id, project_id (nullable)
  category: production | equipment_rental | advertising | freelancer_payment |
            operational | travel | software | other
  description, amount, currency, expense_date
  vendor_name, receipt_url
  approval_status: pending | approved | rejected
  approved_by, approval_date
  reimbursable_to_employee_id (nullable)
  paid (bool)
```

**Approval chain for expenses:**
- < $100 / 150,000 IQD → auto-approved
- $100-$500 → PM approval
- > $500 → Owner/Admin approval

**Recurring invoices (retainers):**
- A scheduled job runs daily; if `is_recurring` and next_date is today → clone as new invoice in `draft` state and notify Account Manager.

---

### MODULE 6 — Project Management

```
projects:
  id, company_id, client_id, campaign_id (nullable), quotation_id (nullable)
  title_ar, title_en, description
  type: video_production | photography | brand_design | social_content |
        advertising_campaign | exhibition_booth | other
  status: planning | active | on_hold | review | completed | cancelled
  current_stage: idea | concept | script | storyboard | pre_production |
                 production | editing | client_review | revision | delivery
  start_date, deadline, delivered_date
  budget_amount, budget_currency
  project_manager_id, creative_director_id
  team_member_ids: [employee_id]
  freelancer_ids: [user_id]
  client_portal_enabled (bool)
  revision_limit (default 3)
  revision_count (current, calculated)
  priority: low | medium | high | urgent
  + standard columns

revisions:
  id, project_id, round_number
  requested_by_user_id (client or internal)
  feedback_text, attached_file_urls
  affected_deliverable_ids
  status: pending | in_progress | completed
  resolved_by, resolved_at
  notes
```

**Revision business logic:**
- When `revision_count` reaches `revision_limit - 1` → warn PM
- When exceeded → block client portal submission, require Account Manager intervention
- AM can approve extra paid revision → creates supplementary invoice line item

**Campaigns:**
```
campaigns:
  id, company_id, client_id
  name, goal, platforms: [instagram, facebook, ...]
  budget_amount, budget_currency
  start_date, end_date
  manager_id
  status: draft | active | paused | completed
```

---

### MODULE 7 — Task Management

```
tasks:
  id, company_id, project_id (nullable for standalone)
  title, description (markdown)
  parent_task_id (for subtasks)
  assigned_to_user_id, created_by_user_id
  priority: low | medium | high | urgent
  status: backlog | planned | in_progress | review | approved | completed | blocked
  due_date, completed_date
  estimated_hours, actual_hours
  attachments: [file_id]
  tags: [string]
  + standard columns

task_comments:
  id, task_id, user_id
  body (markdown, supports @mentions)
  attachments
  created_at

task_time_logs:
  id, task_id, user_id
  started_at, ended_at, duration_minutes
  description
```

**Workload board:**
- Drag-drop interface
- Filter by assignee, project, status, due date
- Heatmap showing employee load per week

---

### MODULE 8 — Client Portal

**URL:** `portal.agencyos.app/{tenant-slug}` or `{tenant}.agencyos.app/portal`

**Client capabilities:**
1. View their active projects with current stage
2. Review files awaiting approval (with timestamp comments on video, area annotations on images)
3. Approve or request revision (with text feedback)
4. View content calendar entries pending their approval
5. View invoices and pay (online if gateway connected)
6. Submit new requests (creates a lead in agency CRM)

**Notification triggers (to client):**
- New file ready for review
- Invoice issued
- Project stage advanced
- Reply on their feedback

**File annotation:**
- Video: comments tied to timestamp (e.g., 0:24)
- Image: comments with x,y coordinates
- PDF: comments on page number + region
- Library: react-pdf-viewer + a custom video annotation component

---

### MODULE 9 — Asset Library

```
asset_folders:
  id, company_id, parent_folder_id, name, path

assets:
  id, company_id, folder_id
  name, description
  type: image | video | logo | brand_kit | music | font | template | document
  file_url, thumbnail_url, preview_url
  file_size_bytes, mime_type
  duration_seconds (for video/audio)
  width_px, height_px (for image/video)
  tags: [string]
  linked_project_ids: [project_id]
  linked_client_ids: [client_id]
  is_visible_to_clients (bool)
  current_version_id
  + standard columns

asset_versions:
  id, asset_id, version_number
  file_url, file_size, uploaded_by, uploaded_at, change_notes
```

**Search:**
- Phase 1: PostgreSQL full-text on name + tags
- Phase 3+: Meilisearch with Arabic analyzer

---

### MODULE 10 — Content Calendar

```
content_posts:
  id, company_id, campaign_id, client_id
  platform: instagram | facebook | tiktok | youtube | twitter | linkedin | snapchat
  caption_ar, caption_en, hashtags
  media_asset_ids: [asset_id]
  scheduled_at (datetime)
  status: draft | internal_review | client_review | approved | scheduled | published | rejected | failed
  approval_history: [{by, at, decision, comment}]
  publish_result (after going live: success/error)
  notes
```

**Views:**
- Monthly calendar grid
- Weekly timeline
- Filter: client, platform, status

**Phase 4 stretch:** auto-publish to platforms via their APIs (Meta Graph, etc.).

---

### MODULE 11 — AI Creative Tools

**Backend uses Anthropic API.**
- **Default model:** `claude-sonnet-4-6` (balance of cost + quality)
- **Premium tier:** `claude-opus-4-7` for top-tier output
- **Rate limit:** Per subscription plan

**Tools:**

1. **Ad Idea Generator**
   - Input: product, audience, platform, objective, tone, language (ar/en)
   - Output: 3 concepts, each with hook + message + CTA + visual direction

2. **Script Generator**
   - Input: concept, duration (15s/30s/60s/90s), platform, tone, language
   - Output: full script with scene-by-scene narration + dialogue

3. **Storyboard Generator**
   - Input: script
   - Output: shot list with shot type, camera angle, duration, visual notes

4. **Image Prompt Generator** (for Midjourney / DALL-E / Stable Diffusion)
   - Input: scene description, style, mood, aspect ratio
   - Output: optimized English prompt

5. **Video Prompt Generator** (for Seedance 2.0, Kling, Runway)
   - **CRITICAL:** Output JSON in bilingual EN+ZH format per Ru'ya's existing `Seedance_2_Skill.md`
   - All constraints embedded in the prompt body (no separate negative prompt)
   - References uploaded images and logos as primary anchors
   - Multiple shots treated as one continuous sequence with smooth transitions

```
ai_generations:
  id, company_id, user_id, project_id (nullable)
  tool_type
  input_data (JSON), output_data (JSON or text)
  model_used, tokens_used, cost_estimate
  saved_to_library (bool), title, tags
  + standard columns
```

---

### MODULE 12 — Equipment Management

```
equipment:
  id, company_id
  name, category: camera | lens | lighting | audio | grip | computer | other
  brand, model, serial_number
  purchase_date, purchase_price, currency
  current_status: available | in_use | maintenance | retired | lost
  condition: excellent | good | fair | poor
  current_holder_id (employee or null)
  current_project_id (nullable)
  qr_code_url (for scan-to-checkout)
  + standard columns

equipment_bookings:
  id, equipment_id, project_id, booked_by_user_id
  booking_start, booking_end
  status: pending | confirmed | checked_out | returned | overdue
  checkout_at, return_at, return_condition_notes
  return_photos: [url]

equipment_maintenance:
  id, equipment_id
  maintenance_date, type: routine | repair | calibration
  description, cost, currency
  performed_by, next_maintenance_date
  receipt_url
```

**Conflict detection:**
- Booking overlaps blocked at API level
- Calendar view shows availability

---

### MODULE 13 — Exhibition & Booth Management
*(Specific to Ru'ya based on Najaf Industries Exhibition experience)*

```
exhibitions:
  id, company_id
  name, location_address, city, country
  start_date, end_date
  organizing_client_id (the company hosting)
  manager_id
  status: planning | active | concluded | settled
  + standard columns

exhibition_booths:
  id, exhibition_id, brand_name, brand_logo_url
  booth_number, booth_size
  client_company_id (nullable - if multiple sub-brands of one client like ماس / أحمد / العطاء)
  design_status: pending | designing | ready
  setup_status: pending | in_setup | live | dismantled
  daily_visitors_count: [{date, count}]
  notes

booth_inventory:
  id, booth_id
  item_name, category: signage | giveaway | display | electronics | furniture | consumable
  quantity_sent, quantity_consumed, quantity_returned, quantity_damaged
  unit_cost, currency, total_cost
  notes

exhibition_financials:
  id, exhibition_id
  type: income | expense
  category: client_payment | venue_rental | construction | logistics | staff |
            consumables | freelancer | other
  description, amount, currency, transaction_date
  receipt_url, recorded_by

exhibition_settlement:
  id, exhibition_id
  total_income_iqd, total_income_usd
  total_expense_iqd, total_expense_usd
  net_profit_iqd, net_profit_usd
  client_outstanding (per client)
  settled_at, settled_by
  settlement_document_url
```

---

### MODULE 14 — File Management

Centralized, used by all modules:

```
files:
  id, company_id
  original_name, stored_name
  url, mime_type, size_bytes
  uploaded_by_user_id
  linked_to: {entity_type, entity_id}  // 'project', 'task', 'invoice', 'asset', etc.
  is_public (bool)
  signed_url_expires_at
  + standard columns
```

**Upload flow:**
- Small files (<5MB): direct multipart
- Large files (>5MB up to 10GB): TUS chunked protocol
- Antivirus scan via ClamAV daemon (Phase 4)

**Storage layout in R2:**
```
/{company_id}/{year}/{month}/{file_id}_{original_name}
```

---

### MODULE 15 — Notifications

**Channels:**
1. In-app (WebSocket, real-time)
2. Email (Resend API — supports Arabic well)
3. Telegram (single platform-wide bot, users link via `/start {token}`)
4. SMS (Phase 4, via local Iraqi provider)

**Telegram architecture:**
- ONE master bot for the platform: `@AgencyOSBot`
- Users link their Telegram account via deep-link with one-time token
- Per-user notification preferences stored
- This is simpler than per-tenant bots and works fine

**Triggers (configurable per user):**

| Trigger | Default Channels |
|---|---|
| Task assigned | in-app + email |
| Task overdue | in-app + telegram |
| Client approved deliverable | in-app + email |
| Client rejected deliverable | in-app + email + telegram |
| Revision requested | in-app + email |
| New file uploaded for review | in-app |
| Invoice paid | in-app + email |
| Invoice overdue | email + telegram |
| Late check-in (to HR) | telegram |
| Leave request | in-app + email |
| Project deadline 48h | in-app + telegram |
| Subscription expiring | email |
| Equipment booking conflict | in-app |

```
notifications:
  id, company_id, user_id
  type, title, body
  link (deep link)
  related_entity: {type, id}
  channel: in_app | email | telegram | sms
  read_at
  sent_at, delivery_status
```

---

### MODULE 16 — Reports & Analytics

**Categories:**

**Financial:**
- Revenue by month (IQD + USD breakdown)
- Revenue by client
- Outstanding invoices aging (0-30, 31-60, 61-90, 90+)
- Expense breakdown by category
- Project profitability (revenue − expenses − labor cost)
- Cash flow projection

**Operations:**
- Project completion rate
- Average project duration by type
- Revision rate (avg rounds per project, per client)
- On-time delivery rate
- Client portal engagement

**HR:**
- Attendance rate (per employee, department, month)
- Late arrival frequency
- Leave usage vs. balance
- Performance score distribution
- Headcount over time

**Sales:**
- Lead conversion rate by source
- Pipeline value by stage
- Win/loss ratio
- Average deal size
- Sales cycle length

**All reports:**
- Date range filter
- Drill-down on data points
- Export: Excel, PDF
- Scheduled email delivery (weekly/monthly)

---

## 9. CROSS-CUTTING CONCERNS

### 9.1 Settings Module

Per-tenant settings panel:
- Company profile (name AR/EN, logo, address, tax info)
- Working hours and weekly off-days (default for new employees)
- GPS work locations
- Departments
- Default currency, exchange rate (manual or via API)
- Notification preferences (tenant-wide defaults)
- Invoice/quotation templates (header, footer, terms)
- Email templates (welcome, invoice, reminder)
- Integrations (Telegram bot, Stripe, payment gateways)
- API keys for external integrations
- Data export and account deletion (GDPR-compliant)

### 9.2 Audit Logs

Every write operation logged:

```
audit_logs:
  id, company_id, user_id
  action: create | update | delete | approve | reject | login | logout | export | login_failed
  entity_type, entity_id
  changes (JSON: {field: {old, new}})
  ip_address, user_agent
  + created_at
```

- Visible to Owner + Admin only
- Retention: 2 years online, archived afterward
- Filterable by user, action, entity, date range

### 9.3 Global Search

- Phase 1: PostgreSQL full-text per module
- Phase 3+: Meilisearch with Arabic analyzer
- Searchable: clients, projects, tasks, files, employees, invoices

### 9.4 Tags System

Reusable tags across entities:
```
tags:
  id, company_id, name, color
  scope: tasks | assets | content_posts | all
```

### 9.5 Templates System

Reusable templates for:
- Project (with default tasks, stages, team)
- Quotation (line items, terms)
- Invoice (line items, terms)
- Email
- Content post

```
templates:
  id, company_id, type, name, body (JSON), is_default
```

### 9.6 @Mentions

Anywhere with rich text (comments, descriptions, notes):
- `@username` triggers notification to mentioned user
- `@team` mentions all project team members
- `@client` mentions client (if portal enabled)

---

## 10. SECURITY REQUIREMENTS

| Requirement | Implementation |
|---|---|
| Password hashing | bcrypt cost 12 |
| JWT signing | RS256 (asymmetric), separate keys per tier |
| HTTPS only | Enforced via HSTS header |
| CSRF protection | Double-submit cookie pattern for non-API forms |
| XSS protection | React auto-escaping + sanitize-html for rich text |
| SQL injection | Prisma parameterized queries (no raw SQL except RLS policies) |
| Rate limiting | Redis-backed, per IP + per user, configurable per endpoint |
| Brute force | Account lock after 5 failed logins in 15 min |
| 2FA | TOTP via authenticator app (optional per user, mandatory for Owner) |
| File upload validation | MIME sniffing, max sizes per type, antivirus (Phase 4) |
| Sensitive logging | Never log passwords, tokens, full credit cards |
| Data encryption at rest | PostgreSQL TDE + R2 default encryption |
| Data encryption in transit | TLS 1.3 |
| Secrets management | Environment variables; Vault for production (Phase 4) |
| GDPR compliance | Right to export (JSON dump), right to deletion (anonymization) |

---

## 11. PERFORMANCE REQUIREMENTS

| Metric | Target |
|---|---|
| API response p95 | < 300ms |
| API response p99 | < 1000ms |
| Page load (LCP) | < 2.5s |
| Database query p95 | < 100ms |
| File upload speed | Limited only by user bandwidth |
| Concurrent users per tenant | 100 (Phase 1), 1000+ (Phase 4) |
| Real-time notification latency | < 2s |

**Caching strategy:**
- Redis caches: dashboard aggregates (60s TTL), permission lookups (5 min), public assets (CDN)
- Database: indexed by `company_id` first on every tenant table
- N+1 prevention: Prisma `include` discipline, query analysis in CI

---

## 12. API STANDARDS

### 12.1 Conventions
- Base URL: `/api/v1`
- All endpoints return JSON
- Errors follow RFC 7807 Problem Details
- Pagination: cursor-based (`?cursor=xxx&limit=20`)
- Filtering: `?filter[field]=value`
- Sorting: `?sort=field,-other_field`
- Field selection: `?fields=id,name`

### 12.2 Standard Middleware (in order)
1. Request ID injection
2. Rate limiter
3. JWT validator
4. Tenant context setter (sets `app.current_company_id`)
5. Permission checker
6. Validation (Zod schema)
7. Handler
8. Audit logger (post-handler)
9. Error handler

### 12.3 Standard Error Codes
- `400 BAD_REQUEST` — validation failure
- `401 UNAUTHORIZED` — no valid token
- `403 FORBIDDEN` — valid token, insufficient permission
- `403 PLAN_LIMIT_EXCEEDED` — needs subscription upgrade
- `404 NOT_FOUND`
- `409 CONFLICT` — e.g., duplicate quotation number
- `422 UNPROCESSABLE` — business rule violation
- `429 TOO_MANY_REQUESTS`
- `500 INTERNAL_ERROR`

---

## 13. DATABASE STANDARDS

### 13.1 Standard Columns (every tenant table)
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
company_id      UUID NOT NULL REFERENCES companies(id)
created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
deleted_at      TIMESTAMPTZ NULL
created_by      UUID REFERENCES users(id)
updated_by      UUID REFERENCES users(id)
```

### 13.2 Standard Indexes
```sql
CREATE INDEX idx_{table}_company_id ON {table}(company_id);
CREATE INDEX idx_{table}_company_created ON {table}(company_id, created_at DESC);
```

### 13.3 Money Storage
- Always integer in lowest unit (fils for IQD, cents for USD)
- Always paired with currency code
- Display formatting in frontend only

### 13.4 Currency Exchange
```
exchange_rates:
  id, base_currency, target_currency
  rate (decimal 10,4)
  effective_date, set_by_user_id, source: manual | api
```
- For mixed-currency invoices: lock rate at invoice creation time
- Daily refresh via API (Phase 3+)

### 13.5 Soft Delete
- Set `deleted_at = now()`
- Default queries filter `WHERE deleted_at IS NULL`
- Background job hard-deletes records after 1 year (configurable)

---

## 14. BUILD PHASES FOR CLAUDE CODE

### PHASE 1 — Foundation (Week 1-3)
**Goal:** A logged-in user can check in via GPS.

Deliverables:
- Project scaffolding (Next.js + NestJS + PostgreSQL + Redis via Docker)
- Database migration system (Prisma)
- Authentication (Tier 1, 2, 3 separate)
- RLS policies on all tenant tables
- Companies + Users + Roles + Permissions
- Employees + Departments + Work Locations
- Attendance with GPS check-in (PWA)
- Basic dashboard
- Admin panel skeleton

**Acceptance:**
- Sign up new tenant
- Owner creates 3 employees
- Owner sets office GPS location
- Employee logs in on phone, checks in (and is blocked when outside radius)
- Late detection works

---

### PHASE 2 — Core Operations (Week 4-7)
**Goal:** Run a real project end-to-end.

Deliverables:
- HR full module (leaves, payroll basic, performance review)
- CRM (leads, deals, clients, contacts)
- Projects + Campaigns + Revisions
- Tasks with comments, time tracking, workload board
- Quotations + Invoices + Payments + Expenses (with PDF generation)
- Files module (with TUS chunked upload)
- Notifications (in-app + email)

**Acceptance:**
- Create lead → win → become client → create project → assign tasks → deliver
- Generate quotation PDF in Arabic and English
- Convert quotation to invoice on acceptance
- Record expense and link to project

---

### PHASE 3 — Creative & Collaboration (Week 8-11)
**Goal:** Full agency creative workflow.

Deliverables:
- Asset Library with versions
- Content Calendar
- Client Portal (review, approve, comment with annotations)
- AI Creative Tools (5 generators)
- Equipment Management
- Exhibition Management
- Telegram notifications
- Global search (Meilisearch)
- Reports + Analytics dashboard

**Acceptance:**
- Client logs in to portal, approves a video with timestamp comments
- AI generates a Seedance prompt in JSON format
- Equipment booking detects conflicts
- Exhibition closes with full settlement report

---

### PHASE 4 — SaaS Layer (Week 12-15)
**Goal:** Sell to other agencies.

Deliverables:
- Subscription plans + feature gating
- Billing integration (Stripe + at least one Iraqi gateway)
- Trial management + lifecycle (active → read-only → suspended → anonymized)
- Tenant onboarding wizard
- Platform Admin panel (super admin)
- Audit logs UI
- Customer support ticketing
- Knowledge base
- API rate limiting per plan
- Webhook system for external integrations
- Public marketing site
- White-label option (Agency plan)

**Acceptance:**
- New tenant signs up, runs trial, pays, becomes paying customer
- Failed payment → graceful lifecycle
- Platform Admin can see all tenants and their health metrics

---

## 15. TESTING REQUIREMENTS

| Test Type | Coverage Target | Tool |
|---|---|---|
| Unit (backend services) | 80% | Jest |
| Unit (frontend components) | 60% | Vitest + React Testing Library |
| Integration (API) | All endpoints | Jest + Supertest |
| E2E | Critical flows | Playwright |
| Visual regression | Phase 3+ | Chromatic |
| Load testing | Phase 4 | k6 |

**Critical E2E flows:**
1. Tenant signup → onboarding → first check-in
2. Lead → won → client → quotation → project → invoice → payment
3. Client portal: file approval with revision request
4. Late check-in → HR notification

---

## 16. DEPLOYMENT & DEVOPS

- **Environments:** local (Docker Compose) → staging → production
- **CI:** GitHub Actions runs tests + lint + type check on every PR
- **CD:** Automated deploy to staging on merge to `main`; manual promotion to production
- **Migrations:** Run automatically on deploy; never edit applied migrations
- **Backups:** PostgreSQL daily snapshot + WAL archiving; R2 versioning enabled
- **Monitoring:** Sentry for errors, Plausible for usage, UptimeRobot for availability
- **On-call:** Phase 4

---

## 17. INSTRUCTIONS FOR CLAUDE CODE — START HERE

```
You are building AgencyOS based on this specification. 

Your first task: ONLY Phase 1.

Step 1: Read this entire document.
Step 2: Confirm understanding by listing all Phase 1 deliverables back to me.
Step 3: Propose a folder structure and confirm with me.
Step 4: Begin scaffolding. Run all setup commands. Verify each works.
Step 5: Build features in this order:
   a. Database schema for Phase 1 tables
   b. Authentication (Tier 2)
   c. Tenant signup + onboarding wizard
   d. Companies, Users, Employees, Departments
   e. Work Locations + GPS check-in (PWA)
   f. Attendance dashboard
   g. Tests for all of the above
Step 6: Run all tests. Report results.
Step 7: Demo Phase 1 to me. Wait for approval.
Step 8: Do NOT begin Phase 2 until I approve.

Rules:
- Always use TypeScript strict mode.
- Always validate input with Zod.
- Never bypass RLS.
- Never log secrets.
- Never use `any` type.
- Commit after each working feature with a descriptive message.
- If stuck, ask. Don't guess business logic.
```

---

## END OF SPECIFICATION
