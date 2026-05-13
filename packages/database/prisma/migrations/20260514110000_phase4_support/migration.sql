-- Phase 4.10: Help Center + Support Tickets

CREATE TYPE "support_ticket_status" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_USER', 'RESOLVED', 'CLOSED');
CREATE TYPE "support_ticket_priority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

CREATE TABLE "help_articles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "body_ar" TEXT NOT NULL,
    "body_en" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[] NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT TRUE,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "help_articles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "help_articles_slug_key" UNIQUE ("slug")
);
CREATE INDEX "help_articles_category_idx" ON "help_articles"("category");
CREATE INDEX "help_articles_slug_idx" ON "help_articles"("slug");
GRANT SELECT ON "help_articles" TO "agencyos_app";

CREATE TABLE "support_tickets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "support_ticket_status" NOT NULL DEFAULT 'OPEN',
    "priority" "support_ticket_priority" NOT NULL DEFAULT 'NORMAL',
    "category" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "support_tickets"
  ADD CONSTRAINT "support_tickets_company_id_fkey"
    FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "idx_support_tickets_company_id" ON "support_tickets"("company_id");
CREATE INDEX "idx_support_tickets_status" ON "support_tickets"("status");

ALTER TABLE "support_tickets" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "support_tickets"
  USING (company_id = current_setting('app.current_company_id')::uuid);
GRANT SELECT, INSERT, UPDATE, DELETE ON "support_tickets" TO "agencyos_app";

CREATE TABLE "support_ticket_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ticket_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "is_from_staff" BOOLEAN NOT NULL DEFAULT FALSE,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "support_ticket_messages_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "support_ticket_messages"
  ADD CONSTRAINT "support_ticket_messages_ticket_id_fkey"
    FOREIGN KEY ("ticket_id") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "idx_support_msgs_ticket_id" ON "support_ticket_messages"("ticket_id");
GRANT SELECT, INSERT, UPDATE, DELETE ON "support_ticket_messages" TO "agencyos_app";
