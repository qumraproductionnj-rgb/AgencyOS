# LAUNCH CHECKLIST — AgencyOS Production Deployment

> Last updated: 2026-05-13

---

## ✅ Phase 1–3 Verified

- [x] Unit tests: 387 passing (36 suites)
- [x] Lint: api + web + portal + admin + marketing — zero errors
- [x] Typecheck: all 5 apps — zero errors
- [x] E2E specs written: Phase 1 (3 flows), Phase 2 (4 flows), Phase 3 (4 flows)
- [x] E2E blocked on Docker infra only — ready to run

---

## 🔲 Pre-Launch Checks

### 1. Environment & Secrets

- [ ] `TELEGRAM_BOT_TOKEN` set in production .env
- [ ] `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` set
- [ ] `RESEND_API_KEY` configured
- [ ] `ANTHROPIC_API_KEY` configured
- [ ] `DATABASE_URL` points to production PostgreSQL 16
- [ ] `REDIS_URL` points to production Redis 7
- [ ] `R2_*` credentials set for Cloudflare R2
- [ ] `JWT_PUBLIC_KEY` + `JWT_PRIVATE_KEY` rotated (not using defaults)

### 2. Database

- [ ] Production PostgreSQL 16 provisioned (Hetzner or managed)
- [ ] Run `pnpm db:migrate` to apply all migrations
- [ ] Run `pnpm db:seed` to seed plans + roles + demo data
- [ ] Verify RLS policies enabled on all tenant tables
- [ ] Database backups configured (daily snapshot + WAL archiving)

### 3. Infrastructure

- [ ] Docker Compose or K8s manifests tested on staging
- [ ] Redis 7 provisioned for cache + BullMQ queues
- [ ] Cloudflare R2 bucket created + CORS configured
- [ ] Domain DNS: `agencyos.app`, `*.agencyos.app` pointed to Hetzner VPS
- [ ] SSL certificates via Let's Encrypt / Caddy
- [ ] HSTS headers configured

### 4. Apps Build & Deploy

- [ ] `apps/api` — NestJS backend (port 3001)
- [ ] `apps/web` — Next.js tenant app (port 3000)
- [ ] `apps/portal` — Next.js client portal (port 3003)
- [ ] `apps/admin` — Next.js super admin (port 3002)
- [ ] `apps/marketing` — Next.js marketing site (port 3004)

### 5. Monitoring & Alerting

- [ ] **Sentry** configured for all 5 apps
- [ ] **UptimeRobot** monitoring production URLs
- [ ] Error alerts to Telegram + email
- [ ] Database CPU/memory alerts configured

### 6. Security

- [ ] OWASP Top 10 review passed
- [ ] Rate limiting configured (ThrottlerModule)
- [ ] JWT keys properly managed (not in repo)
- [ ] Argon2id password hashing confirmed
- [ ] Account lockout (5 attempts / 15 min) verified
- [ ] CORS restricted to production domains

### 7. Load Testing

- [ ] k6 script written for critical flows:
  - [ ] Tenant signup
  - [ ] Employee GPS check-in
  - [ ] Lead-to-payment lifecycle
- [ ] Target: 1000 concurrent users
- [ ] P95 response time < 500ms

### 8. Backup & Recovery

- [ ] DB automated backup verified (restore test)
- [ ] R2 object storage versioning enabled
- [ ] Disaster recovery runbook documented

### 9. Legal & Compliance

- [ ] Privacy policy live at `/privacy`
- [ ] Terms of service live at `/terms`
- [ ] Cookie consent banner implemented
- [ ] Data processing agreement (DPA) available

### 10. Final Verification

- [ ] Full E2E test run passes in production-like environment
- [ ] Manual smoke test: signup → onboarding → first user
- [ ] Manual smoke test: create client → project → invoice → payment
- [ ] Manual smoke test: client portal login → file approval
- [ ] Manual smoke test: content plan → pieces → schedule
- [ ] Arabic (RTL) layout verified on all pages
- [ ] English layout verified on all pages
- [ ] Mobile responsive verified

---

## 🚀 Launch Day

1. Database migration
2. Deploy backend
3. Deploy 4 frontend apps
4. Verify health endpoints
5. Enable UptimeRobot monitoring
6. Make marketing site live
7. Announce

---

## 📊 Post-Launch (Week 1)

- Monitor error rates (Sentry)
- Monitor response times
- Watch DB connection pool usage
- Check Redis memory
- Review first tenant onboarding
- Fix any issues promptly

---

## 📁 References

- `docs/AgencyOS_MasterSpec.md` — Full specification
- `docs/PROGRESS.md` — Build progress
- `docs/DECISIONS.md` — Architectural decisions
- `docs/TASKS.md` — Task breakdown
