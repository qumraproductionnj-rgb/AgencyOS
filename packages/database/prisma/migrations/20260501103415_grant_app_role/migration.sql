-- =============================================================
-- GRANTs for the runtime application role (agencyos_app)
-- =============================================================
-- agencyos_app is a non-owner role used by the API at runtime.
-- It does NOT have BYPASSRLS, so RLS policies on tenant tables
-- are enforced for queries through this role.
--
-- The owner role (agencyos) continues to be used by:
--   - Prisma migrations (DIRECT_DATABASE_URL)
--   - Seed scripts
--   - Auth flows (cross-tenant: signup, login by email, refresh-by-hash)
-- =============================================================

-- Schema usage (was already granted in init-db.sql but re-issuing is idempotent)
GRANT USAGE ON SCHEMA public TO agencyos_app;

-- DML on existing tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO agencyos_app;

-- Sequence usage (Prisma may create some; we use UUIDs but be safe)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO agencyos_app;

-- Default privileges for any future tables and sequences (created by the owner)
ALTER DEFAULT PRIVILEGES FOR ROLE agencyos IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO agencyos_app;

ALTER DEFAULT PRIVILEGES FOR ROLE agencyos IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO agencyos_app;

-- Explicit non-bypass: ensure agencyos_app does NOT have BYPASSRLS.
-- (The default for CREATE ROLE is NOBYPASSRLS, but be explicit.)
ALTER ROLE agencyos_app NOBYPASSRLS;
