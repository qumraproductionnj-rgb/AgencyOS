-- =============================================================
-- Enable Row-Level Security on all tenant-owned tables
-- =============================================================
-- The NestJS request middleware (Task 1.3) sets
--   SET app.current_company_id = '<uuid>'
-- on every connection prior to running tenant queries. RLS then
-- enforces tenant isolation at the database level.
--
-- The current setting is read with `current_setting(name, missing_ok=true)`
-- so unset → NULL → policy fails closed (no rows visible).
--
-- Note: table owner (agencyos) bypasses RLS by default (no FORCE).
-- Migrations and seeds can run unimpeded. The app must connect as a
-- non-owner role (e.g. agencyos_app) for RLS to take effect — wired
-- in Task 1.3.
--
-- `permissions` is intentionally excluded — it is platform-wide
-- reference data with no tenant scope.
-- =============================================================

-- ---------------------------------------------------------------
-- companies — special: policy uses `id` not `company_id`
-- ---------------------------------------------------------------
ALTER TABLE "companies" ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON "companies"
  USING (id = current_setting('app.current_company_id', true)::uuid)
  WITH CHECK (id = current_setting('app.current_company_id', true)::uuid);

-- ---------------------------------------------------------------
-- users — uses company_id; nullable rows (platform admins) are
-- implicitly hidden from tenant queries (NULL ≠ uuid).
-- ---------------------------------------------------------------
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON "users"
  USING (company_id = current_setting('app.current_company_id', true)::uuid)
  WITH CHECK (company_id = current_setting('app.current_company_id', true)::uuid);

-- ---------------------------------------------------------------
-- Standard tenant tables (company_id NOT NULL)
-- ---------------------------------------------------------------
ALTER TABLE "roles" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "roles"
  USING (company_id = current_setting('app.current_company_id', true)::uuid)
  WITH CHECK (company_id = current_setting('app.current_company_id', true)::uuid);

ALTER TABLE "role_permissions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "role_permissions"
  USING (company_id = current_setting('app.current_company_id', true)::uuid)
  WITH CHECK (company_id = current_setting('app.current_company_id', true)::uuid);

ALTER TABLE "user_roles" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "user_roles"
  USING (company_id = current_setting('app.current_company_id', true)::uuid)
  WITH CHECK (company_id = current_setting('app.current_company_id', true)::uuid);

ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "sessions"
  USING (company_id = current_setting('app.current_company_id', true)::uuid)
  WITH CHECK (company_id = current_setting('app.current_company_id', true)::uuid);

ALTER TABLE "departments" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "departments"
  USING (company_id = current_setting('app.current_company_id', true)::uuid)
  WITH CHECK (company_id = current_setting('app.current_company_id', true)::uuid);

ALTER TABLE "employees" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "employees"
  USING (company_id = current_setting('app.current_company_id', true)::uuid)
  WITH CHECK (company_id = current_setting('app.current_company_id', true)::uuid);

ALTER TABLE "work_locations" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "work_locations"
  USING (company_id = current_setting('app.current_company_id', true)::uuid)
  WITH CHECK (company_id = current_setting('app.current_company_id', true)::uuid);

ALTER TABLE "work_location_employees" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "work_location_employees"
  USING (company_id = current_setting('app.current_company_id', true)::uuid)
  WITH CHECK (company_id = current_setting('app.current_company_id', true)::uuid);

ALTER TABLE "attendance_records" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "attendance_records"
  USING (company_id = current_setting('app.current_company_id', true)::uuid)
  WITH CHECK (company_id = current_setting('app.current_company_id', true)::uuid);

-- ---------------------------------------------------------------
-- audit_logs — company_id is nullable for system-level events;
-- those rows are visible only when RLS is bypassed (platform admins).
-- ---------------------------------------------------------------
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "audit_logs"
  USING (company_id = current_setting('app.current_company_id', true)::uuid)
  WITH CHECK (company_id = current_setting('app.current_company_id', true)::uuid);
