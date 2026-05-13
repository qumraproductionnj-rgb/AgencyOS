-- Phase 4.5: Allow PLATFORM_ADMIN sessions without a tenant.
ALTER TABLE "sessions" ALTER COLUMN "company_id" DROP NOT NULL;
