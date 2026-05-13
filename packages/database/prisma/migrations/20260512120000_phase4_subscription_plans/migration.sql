-- CreateEnum
CREATE TYPE "subscription_status" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED');

-- CreateTable: subscription_plans
CREATE TABLE "subscription_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "description" TEXT,
    "max_users" INTEGER NOT NULL DEFAULT 5,
    "max_storage_mb" INTEGER NOT NULL DEFAULT 10240,
    "max_ai_generations_per_month" INTEGER NOT NULL DEFAULT 0,
    "max_clients" INTEGER NOT NULL DEFAULT 10,
    "max_projects" INTEGER NOT NULL DEFAULT 20,
    "features" JSONB NOT NULL DEFAULT '{}',
    "price_monthly" BIGINT NOT NULL DEFAULT 0,
    "price_yearly" BIGINT NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "subscription_plans_key_key" UNIQUE ("key")
);

-- CreateTable: subscriptions
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "status" "subscription_status" NOT NULL DEFAULT 'TRIAL',
    "trial_ends_at" TIMESTAMPTZ,
    "current_period_start" TIMESTAMPTZ,
    "current_period_end" TIMESTAMPTZ,
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "cancelled_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "deleted_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "subscriptions_company_id_key" UNIQUE ("company_id")
);

-- Add foreign keys
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Indexes
CREATE INDEX "idx_subscriptions_company_id" ON "subscriptions"("company_id");

-- Enable RLS
ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;

-- RLS policy: tenant isolation on subscriptions
CREATE POLICY tenant_isolation ON "subscriptions"
  USING (company_id = current_setting('app.current_company_id')::uuid);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON "subscriptions" TO "agencyos_app";
