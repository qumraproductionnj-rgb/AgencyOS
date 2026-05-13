-- Phase 4.4: Tenant Lifecycle Management
-- Extends subscription_status enum + adds lifecycle timestamp fields.

ALTER TYPE "subscription_status" ADD VALUE 'READ_ONLY';
ALTER TYPE "subscription_status" ADD VALUE 'SUSPENDED';
ALTER TYPE "subscription_status" ADD VALUE 'ANONYMIZED';

ALTER TABLE "subscriptions"
  ADD COLUMN "read_only_at"        TIMESTAMPTZ,
  ADD COLUMN "suspended_at"        TIMESTAMPTZ,
  ADD COLUMN "anonymized_at"       TIMESTAMPTZ,
  ADD COLUMN "last_warning_stage"  INTEGER;

CREATE INDEX "idx_subscriptions_status" ON "subscriptions"("status");
