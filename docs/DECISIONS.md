# DECISIONS.md — Architectural Decision Records (ADRs)

> هذا الملف يحوي القرارات المعمارية المهمة وأسبابها. كل قرار يُكتب كـ ADR.
> Claude Code يضيف هنا قبل أي قرار غير قياسي. المستخدم يضيف قرارات الأعمال هنا.

---

## ADR Template

```
## ADR-XXX: [Title]

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated | Superseded
**Deciders:** [names]
**Phase/Task:** [reference]

### Context
What is the issue we're seeing that motivates this decision?

### Decision
What we decided to do.

### Alternatives Considered
1. Option A — pros/cons
2. Option B — pros/cons

### Consequences
What becomes easier or harder because of this change?

### References
Links, related decisions, etc.
```

---

# DECISIONS

---

## ADR-001: Use pnpm Monorepo (Not Nx, Not Turborepo)

**Date:** [start date]
**Status:** Accepted
**Phase/Task:** Phase 0

### Context

We need a monorepo to manage 4 apps (web, portal, admin, api) and 4 packages (database, shared, ui, ai).

### Decision

Use plain pnpm workspaces without Nx or Turborepo.

### Alternatives Considered

1. **Nx** — too heavy for our needs, steeper learning curve
2. **Turborepo** — good caching but adds complexity; we'll add it later if build times become an issue
3. **pnpm workspaces (chosen)** — simple, fast, sufficient for our scale

### Consequences

- ✅ Simpler mental model
- ✅ Faster setup
- ❌ Manual orchestration of build order
- ⚠️ May need to add Turborepo in Phase 4 if CI gets slow

---

## ADR-002: Argon2id Instead of bcrypt for Password Hashing

**Date:** [start date]
**Status:** Accepted

### Context

The MasterSpec originally specified bcrypt. We need to choose final hash algorithm.

### Decision

Use Argon2id (winner of Password Hashing Competition 2015).

### Alternatives Considered

1. **bcrypt** — battle-tested, but slower modern hardware = weaker resistance to GPU attacks
2. **Argon2id (chosen)** — modern, memory-hard, recommended by OWASP
3. **scrypt** — good but Argon2id is its successor

### Consequences

- ✅ Better security against modern attacks
- ✅ OWASP-recommended
- ❌ Slightly slower hashing (still under 100ms with our params)

### Parameters

- Memory: 64MB
- Iterations: 3
- Parallelism: 4

---

## ADR-003: Puppeteer for PDF Generation (Not pdfkit)

**Date:** [start date]
**Status:** Accepted

### Context

We need to generate Arabic PDFs for invoices, quotations, payslips. PDFkit (commonly recommended) renders Arabic incorrectly (broken letter joining, wrong direction).

### Decision

Use Puppeteer with HTML+CSS templates.

### Alternatives Considered

1. **pdfkit** — fails on Arabic RTL
2. **PDFKit + bidi.js** — partial solution, fragile
3. **wkhtmltopdf** — outdated, deprecated
4. **Puppeteer (chosen)** — full HTML/CSS support, perfect Arabic rendering
5. **react-pdf** — also fails on complex Arabic

### Consequences

- ✅ Perfect Arabic rendering
- ✅ Easy to template (HTML + Tailwind)
- ❌ Heavier dependency (Chrome bundled)
- ❌ Slower than pdfkit (~500ms vs 50ms)
- ⚠️ Need to manage Chrome installation in production Docker

### Test sentence (must render perfectly)

```
فاتورة رقم ١٢٣ بمبلغ 5,000,000 د.ع
```

---

## ADR-004: Single Telegram Bot for All Tenants

**Date:** [start date]
**Status:** Accepted

### Context

The MasterSpec originally suggested per-tenant Telegram bots. This is operationally complex (each tenant manages BotFather, tokens, webhooks).

### Decision

Use one master Telegram bot (@AgencyOSBot) for the entire platform. Users link their Telegram accounts via deep-link with a one-time token.

### Alternatives Considered

1. **Per-tenant bot** — each tenant configures their own bot
2. **Single platform bot (chosen)** — one bot, users link individually

### Consequences

- ✅ Simpler operations
- ✅ Faster onboarding (no BotFather steps)
- ✅ Single webhook endpoint to maintain
- ❌ Less brand control for tenants (Agency plan can request custom bot in Phase 4)
- ⚠️ Single point of failure (mitigate with monitoring)

---

## ADR-005: Cloudflare R2 (Not S3) for Object Storage

**Date:** [start date]
**Status:** Accepted

### Context

Need to choose storage provider. AWS S3 charges egress fees that can become significant with video files.

### Decision

Use Cloudflare R2 (S3-compatible API, zero egress fees).

### Alternatives Considered

1. **AWS S3** — most reliable, but expensive egress (~$0.09/GB)
2. **Cloudflare R2 (chosen)** — S3-compatible, free egress, cheaper storage
3. **Backblaze B2** — cheap, but worse CDN integration
4. **Self-hosted MinIO** — operational burden

### Consequences

- ✅ Massive cost savings on video traffic
- ✅ S3-compatible (easy migration if needed)
- ✅ Built-in CDN via Cloudflare
- ❌ Slightly less mature than S3
- ⚠️ Vendor lock-in mitigated by S3 compatibility

---

## ADR-006: Hetzner VPS for Production Hosting

**Date:** [start date]
**Status:** Accepted

### Context

Need production hosting that:

- Accepts international payment cards (Iraqi market constraint)
- Reasonable cost (early-stage SaaS)
- Good performance for European/Middle East users

### Decision

Hetzner Cloud (Germany or Finland) on a single VPS (CCX13 or larger) with Docker Compose.

### Alternatives Considered

1. **AWS** — expensive, overkill for early stage
2. **DigitalOcean** — good but Hetzner is cheaper for similar specs
3. **Hetzner (chosen)** — best price/performance, EU-based
4. **Local Iraqi hosting** — unreliable infrastructure
5. **Vercel + Supabase** — vendor lock-in, monthly costs scale steeply

### Consequences

- ✅ Predictable costs (~$30/month for 4 vCPU + 16GB RAM)
- ✅ Good network performance to Middle East
- ❌ More operational responsibility (we manage updates, backups)
- ⚠️ Need a runbook for incidents (Phase 4 deliverable)

### Migration plan

If we exceed 1000 active tenants → migrate to managed Kubernetes on Hetzner Cloud.

---

## ADR-007: Multi-Tenant via RLS (Not Schema-Per-Tenant)

**Date:** [start date]
**Status:** Accepted

### Context

Three options for multi-tenancy: shared DB shared schema (RLS), shared DB schema-per-tenant, or DB-per-tenant.

### Decision

Shared DB + shared schema + Postgres RLS for isolation.

### Alternatives Considered

1. **DB-per-tenant** — strongest isolation, but operational nightmare at scale
2. **Schema-per-tenant** — compromise, but migrations get complex
3. **RLS (chosen)** — single schema, defense-in-depth via DB policies

### Consequences

- ✅ Single migration to maintain
- ✅ Easier cross-tenant analytics (super admin)
- ✅ DB-level isolation (defense in depth)
- ❌ A buggy query without RLS bypass = catastrophic leak
- ⚠️ MUST test RLS in CI for every new tenant table

### Mandatory enforcement

- Every tenant table has RLS policy
- Code review must verify RLS for new tables
- Integration tests must verify cross-tenant isolation

---

## ADR-008: FIB First for Iraqi Payments; ZainCash + FastPay as Stubs

**Date:** 2026-05-13
**Status:** Accepted
**Phase/Task:** Phase 4.3

### Context

MasterSpec §6 lists three Iraqi payment gateways for IQD subscription billing: FastPay, ZainCash, FIB. We need at least one production-ready integration plus a fallback. Implementing all three at once would be wasted effort given uneven documentation and commercial-access requirements.

### Decision

Implement **FIB (First Iraqi Bank)** Payment Initiation API fully (with mock mode for dev). Ship **ZainCash** and **FastPay** as interface-compatible **stubs** that throw `NotImplementedException`. Add **manual bank transfer** as the universal fallback with super-admin verification.

### Alternatives Considered

1. **Implement all three** — wasted effort; FastPay docs are scarce, ZainCash requires commercial agreement before testing
2. **Implement one only, no scaffolding** — future integrations would touch every caller
3. **FIB + stubs (chosen)** — full FIB flow + interface contract that lets us drop in real ZainCash/FastPay later without changing callers

### Consequences

- ✅ Full subscription flow works in IQD today via FIB sandbox or mock mode
- ✅ Manual bank transfer always available as fallback (super-admin verifies receipts)
- ✅ Adding ZainCash/FastPay later is a 1-file swap, no caller changes
- ❌ Tenants choosing ZainCash/FastPay see "Coming soon" until commercial agreements close
- ⚠️ FIB webhook signature scheme assumed to be HMAC-SHA256 over raw body; verify against final FIB merchant docs before production

### References

- `apps/api/src/billing/local/gateways/local-gateway.interface.ts` — the contract
- `apps/api/src/billing/local/gateways/fib.service.ts` — full implementation
- `apps/api/src/billing/local/gateways/{zaincash,fastpay}.service.ts` — stubs

---

# Future Decisions (Likely)

These will be documented as ADRs when needed:

- ADR-XXX: Migration to Meilisearch for search (Phase 3)
- ADR-XXX: Migration to k8s (when scale demands)
- ADR-XXX: Choice of analytics stack (Plausible vs PostHog)
- ADR-XXX: Custom domain handling for Agency plan
