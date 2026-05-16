-- Round 4A: Dynamic Org Structure (Department hierarchy + Company structure type + User.isManager)

-- 1. Org structure type enum (per-company)
CREATE TYPE "org_structure_type" AS ENUM ('FLAT', 'HIERARCHICAL', 'HYBRID');

ALTER TABLE "companies"
  ADD COLUMN "org_structure_type" "org_structure_type" NOT NULL DEFAULT 'FLAT';

-- 2. User.isManager flag
ALTER TABLE "users"
  ADD COLUMN "is_manager" BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. Department hierarchy + presentation fields
ALTER TABLE "departments"
  ADD COLUMN "parent_id" UUID,
  ADD COLUMN "icon" TEXT,
  ADD COLUMN "color" TEXT;

ALTER TABLE "departments"
  ADD CONSTRAINT "departments_parent_id_fkey"
    FOREIGN KEY ("parent_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "idx_departments_parent_id" ON "departments"("parent_id");
