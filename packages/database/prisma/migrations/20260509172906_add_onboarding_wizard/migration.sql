-- Add bilingual name + contact fields to companies
ALTER TABLE "companies" ADD COLUMN "name_en" TEXT;
ALTER TABLE "companies" ADD COLUMN "logo_url" TEXT;
ALTER TABLE "companies" ADD COLUMN "address" TEXT;
ALTER TABLE "companies" ADD COLUMN "phone" TEXT;
ALTER TABLE "companies" ADD COLUMN "website" TEXT;

-- Create onboarding_progress table
CREATE TABLE "onboarding_progress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "current_step" INTEGER NOT NULL DEFAULT 1,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,
    CONSTRAINT "onboarding_progress_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "onboarding_progress_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "onboarding_progress_company_id_key" ON "onboarding_progress"("company_id");
CREATE INDEX "idx_onboarding_progress_company_id" ON "onboarding_progress"("company_id");

-- RLS
ALTER TABLE "onboarding_progress" ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON "onboarding_progress"
  USING (company_id = NULLIF(current_setting('app.current_company_id', true), '')::uuid);

-- Grants for agencyos_app role
GRANT INSERT, SELECT, UPDATE, DELETE ON "onboarding_progress" TO "agencyos_app";
