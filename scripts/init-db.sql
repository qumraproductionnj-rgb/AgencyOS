-- =============================================================
-- AgencyOS Database Initialization
-- =============================================================
-- Runs automatically on first PostgreSQL container start
-- =============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";        -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";         -- Cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";          -- Trigram matching (for fuzzy search)
CREATE EXTENSION IF NOT EXISTS "unaccent";         -- For Arabic search normalization
CREATE EXTENSION IF NOT EXISTS "btree_gin";        -- Better indexes for arrays/JSON

-- Create application role for runtime (separate from migration role)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'agencyos_app') THEN
    CREATE ROLE agencyos_app LOGIN PASSWORD 'app_password_change_in_production';
  END IF;
END
$$;

-- Grant privileges (will be refined by Prisma migrations)
GRANT CONNECT ON DATABASE agencyos_dev TO agencyos_app;
GRANT USAGE ON SCHEMA public TO agencyos_app;

-- Configure default text search to be Arabic-aware
-- Note: Native Arabic FTS support is limited in Postgres
-- For production, we use Meilisearch (Phase 3+)
ALTER DATABASE agencyos_dev SET default_text_search_config TO 'simple';

-- Set timezone to UTC (we always store UTC)
ALTER DATABASE agencyos_dev SET timezone TO 'UTC';

-- Comment
COMMENT ON DATABASE agencyos_dev IS 'AgencyOS Development Database';
