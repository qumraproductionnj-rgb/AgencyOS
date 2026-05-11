CREATE TYPE "content_plan_status" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "content_piece_type" AS ENUM ('VIDEO_LONG', 'REEL', 'STORY', 'STATIC_DESIGN', 'CAROUSEL', 'GIF', 'PODCAST', 'BLOG_POST');

-- CreateEnum
CREATE TYPE "content_piece_stage" AS ENUM ('IDEA', 'IN_WRITING', 'IN_DESIGN', 'IN_PRODUCTION', 'INTERNAL_REVIEW', 'CLIENT_REVIEW', 'REVISION', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'FAILED');

-- CreateEnum
CREATE TYPE "content_revision_status" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "asset_type" AS ENUM ('IMAGE', 'VIDEO', 'LOGO', 'BRAND_KIT', 'MUSIC', 'FONT', 'TEMPLATE', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "equipment_category" AS ENUM ('CAMERA', 'LENS', 'LIGHTING', 'AUDIO', 'GRIP', 'COMPUTER', 'OTHER');

-- CreateEnum
CREATE TYPE "equipment_status" AS ENUM ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED', 'LOST');

-- CreateEnum
CREATE TYPE "equipment_condition" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR');

-- CreateEnum
CREATE TYPE "booking_status" AS ENUM ('PENDING', 'CONFIRMED', 'CHECKED_OUT', 'RETURNED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "maintenance_type" AS ENUM ('ROUTINE', 'REPAIR', 'CALIBRATION');

-- CreateEnum
CREATE TYPE "exhibition_status" AS ENUM ('PLANNING', 'ACTIVE', 'CONCLUDED', 'SETTLED');

-- CreateEnum
CREATE TYPE "booth_inventory_category" AS ENUM ('SIGNAGE', 'GIVEAWAY', 'DISPLAY', 'ELECTRONICS', 'FURNITURE', 'CONSUMABLE');

-- CreateEnum
CREATE TYPE "financial_type" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "exhibition_financial_category" AS ENUM ('CLIENT_PAYMENT', 'VENUE_RENTAL', 'CONSTRUCTION', 'LOGISTICS', 'STAFF', 'CONSUMABLES', 'FREELANCER', 'OTHER');
CREATE TABLE "brand_briefs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "brand_name_ar" TEXT,
    "brand_name_en" TEXT,
    "brand_story" TEXT,
    "mission" TEXT,
    "vision" TEXT,
    "tone_of_voice" TEXT[],
    "voice_dos" TEXT[],
    "voice_donts" TEXT[],
    "brand_keywords" TEXT[],
    "banned_words" TEXT[],
    "primary_colors" TEXT[],
    "secondary_colors" TEXT[],
    "fonts" JSONB,
    "visual_style" TEXT[],
    "mood_keywords" TEXT[],
    "cultural_context" TEXT,
    "religious_considerations" TEXT,
    "active_platforms" TEXT[],
    "posting_frequency" JSONB,
    "competitors" JSONB,
    "default_pillar_ids" TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "brand_briefs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audience_personas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "brand_brief_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "age_range" TEXT,
    "gender" TEXT,
    "location" TEXT,
    "occupation" TEXT,
    "income_level" TEXT,
    "interests" TEXT[],
    "pain_points" TEXT[],
    "goals" TEXT[],
    "objections" TEXT[],
    "motivations" TEXT[],
    "preferred_platforms" TEXT[],
    "content_consumption_habits" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "audience_personas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_pillars" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "percentage_target" INTEGER,
    "example_topics" TEXT[],
    "recommended_formats" TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "content_pillars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "campaign_id" UUID,
    "title" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "content_plan_status" NOT NULL DEFAULT 'DRAFT',
    "monthly_objectives" JSONB,
    "pillar_distribution" JSONB,
    "content_type_distribution" JSONB,
    "client_approval_status" TEXT,
    "client_approved_at" TIMESTAMPTZ,
    "client_approved_by" UUID,
    "client_revision_count" INTEGER NOT NULL DEFAULT 0,
    "client_revision_limit" INTEGER NOT NULL DEFAULT 2,
    "total_pieces_planned" INTEGER NOT NULL DEFAULT 0,
    "total_pieces_published" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "content_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_pieces" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "content_plan_id" UUID NOT NULL,
    "pillar_id" UUID,
    "client_id" UUID NOT NULL,
    "project_id" UUID,
    "title" TEXT NOT NULL,
    "type" "content_piece_type" NOT NULL,
    "platforms" TEXT[],
    "big_idea" TEXT,
    "framework_used" TEXT,
    "framework_data" JSONB,
    "components" JSONB,
    "caption_ar" TEXT,
    "caption_en" TEXT,
    "hashtags" TEXT[],
    "cta_text" TEXT,
    "cta_link" TEXT,
    "linked_assets" TEXT[],
    "inspiration_refs" JSONB,
    "stage" "content_piece_stage" NOT NULL DEFAULT 'IDEA',
    "scheduled_at" TIMESTAMPTZ,
    "published_at" TIMESTAMPTZ,
    "internal_approver_id" UUID,
    "internal_approved_at" TIMESTAMPTZ,
    "client_approval_status" TEXT,
    "client_approved_at" TIMESTAMPTZ,
    "metrics" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "content_pieces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_revisions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "content_piece_id" UUID NOT NULL,
    "round_number" INTEGER NOT NULL,
    "requested_by_user_id" UUID NOT NULL,
    "requested_by_role" TEXT,
    "feedback_text" TEXT,
    "feedback_annotations" JSONB,
    "attached_files" TEXT[],
    "status" "content_revision_status" NOT NULL DEFAULT 'PENDING',
    "resolved_by" UUID,
    "resolved_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "content_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frameworks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "name_ar" TEXT,
    "name_en" TEXT,
    "description" TEXT,
    "category" TEXT,
    "best_for_content_types" TEXT[],
    "fields_schema" JSONB,
    "example_input" JSONB,
    "example_output" TEXT,
    "is_global" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "frameworks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "framework_used" TEXT,
    "framework_data_template" JSONB,
    "components_template" JSONB,
    "use_count" INTEGER NOT NULL DEFAULT 0,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "created_from_piece_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "content_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_generations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content_piece_id" UUID,
    "tool_type" TEXT NOT NULL,
    "framework_used" TEXT,
    "input_data" JSONB NOT NULL,
    "output_data" JSONB NOT NULL,
    "model_used" TEXT,
    "tokens_input" INTEGER,
    "tokens_output" INTEGER,
    "cost_estimate_usd" DECIMAL(10,6),
    "user_rating" INTEGER,
    "was_used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "ai_generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_folders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "parent_folder_id" UUID,
    "name" TEXT NOT NULL,
    "path" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "asset_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "folder_id" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "asset_type" NOT NULL,
    "file_url" TEXT,
    "thumbnail_url" TEXT,
    "preview_url" TEXT,
    "file_size_bytes" BIGINT,
    "mime_type" TEXT,
    "duration_seconds" DECIMAL(8,2),
    "width_px" INTEGER,
    "height_px" INTEGER,
    "tags" TEXT[],
    "linked_project_ids" TEXT[],
    "linked_client_ids" TEXT[],
    "is_visible_to_clients" BOOLEAN NOT NULL DEFAULT false,
    "current_version_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_versions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "uploaded_by" UUID NOT NULL,
    "uploaded_at" TIMESTAMPTZ NOT NULL,
    "change_notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "asset_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" "equipment_category" NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "serial_number" TEXT,
    "purchase_date" DATE,
    "purchase_price" BIGINT,
    "currency" TEXT DEFAULT 'IQD',
    "current_status" "equipment_status" NOT NULL DEFAULT 'AVAILABLE',
    "condition" "equipment_condition" NOT NULL DEFAULT 'GOOD',
    "current_holder_id" UUID,
    "current_project_id" UUID,
    "qr_code_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_bookings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "equipment_id" UUID NOT NULL,
    "project_id" UUID,
    "booked_by_user_id" UUID NOT NULL,
    "booking_start" TIMESTAMPTZ NOT NULL,
    "booking_end" TIMESTAMPTZ NOT NULL,
    "status" "booking_status" NOT NULL DEFAULT 'PENDING',
    "checkout_at" TIMESTAMPTZ,
    "return_at" TIMESTAMPTZ,
    "return_condition_notes" TEXT,
    "return_photos" TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "equipment_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_maintenance" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "equipment_id" UUID NOT NULL,
    "maintenance_date" DATE NOT NULL,
    "type" "maintenance_type" NOT NULL,
    "description" TEXT,
    "cost" BIGINT,
    "currency" TEXT DEFAULT 'IQD',
    "performed_by" TEXT,
    "next_maintenance_date" DATE,
    "receipt_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "equipment_maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exhibitions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "location_address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "organizing_client_id" UUID,
    "manager_id" UUID,
    "status" "exhibition_status" NOT NULL DEFAULT 'PLANNING',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "exhibitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exhibition_booths" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "exhibition_id" UUID NOT NULL,
    "brand_name" TEXT NOT NULL,
    "brand_logo_url" TEXT,
    "booth_number" TEXT,
    "booth_size" TEXT,
    "client_company_id" UUID,
    "design_status" TEXT NOT NULL DEFAULT 'pending',
    "setup_status" TEXT NOT NULL DEFAULT 'pending',
    "daily_visitors_count" JSONB,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "exhibition_booths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booth_inventory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "booth_id" UUID NOT NULL,
    "item_name" TEXT NOT NULL,
    "category" "booth_inventory_category" NOT NULL,
    "quantity_sent" INTEGER NOT NULL DEFAULT 0,
    "quantity_consumed" INTEGER NOT NULL DEFAULT 0,
    "quantity_returned" INTEGER NOT NULL DEFAULT 0,
    "quantity_damaged" INTEGER NOT NULL DEFAULT 0,
    "unit_cost" BIGINT,
    "currency" TEXT DEFAULT 'IQD',
    "total_cost" BIGINT,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "booth_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exhibition_financials" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "exhibition_id" UUID NOT NULL,
    "type" "financial_type" NOT NULL,
    "category" "exhibition_financial_category" NOT NULL,
    "description" TEXT,
    "amount" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IQD',
    "transaction_date" DATE NOT NULL,
    "receipt_url" TEXT,
    "recorded_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "exhibition_financials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exhibition_settlements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "company_id" UUID NOT NULL,
    "exhibition_id" UUID NOT NULL,
    "total_income_iqd" BIGINT NOT NULL DEFAULT 0,
    "total_income_usd" BIGINT NOT NULL DEFAULT 0,
    "total_expense_iqd" BIGINT NOT NULL DEFAULT 0,
    "total_expense_usd" BIGINT NOT NULL DEFAULT 0,
    "net_profit_iqd" BIGINT NOT NULL DEFAULT 0,
    "net_profit_usd" BIGINT NOT NULL DEFAULT 0,
    "client_outstanding" JSONB,
    "settled_at" TIMESTAMPTZ,
    "settled_by" UUID,
    "settlement_document_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "exhibition_settlements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_slug_key" ON "companies"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_users_company_id" ON "users"("company_id");

-- CreateIndex
CREATE INDEX "idx_users_email" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_resource_action_scope_key" ON "permissions"("resource", "action", "scope");

-- CreateIndex
CREATE INDEX "idx_roles_company_id" ON "roles"("company_id");

-- CreateIndex
CREATE INDEX "idx_roles_company_created" ON "roles"("company_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "roles_company_id_name_key" ON "roles"("company_id", "name");

-- CreateIndex
CREATE INDEX "idx_role_permissions_company_id" ON "role_permissions"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE INDEX "idx_user_roles_company_id" ON "user_roles"("company_id");

-- CreateIndex
CREATE INDEX "idx_user_roles_user_id" ON "user_roles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");

-- CreateIndex
CREATE INDEX "idx_sessions_company_id" ON "sessions"("company_id");

-- CreateIndex
CREATE INDEX "idx_sessions_user_id" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "idx_sessions_refresh_token_hash" ON "sessions"("refresh_token_hash");

-- CreateIndex
CREATE INDEX "idx_departments_company_id" ON "departments"("company_id");

-- CreateIndex
CREATE INDEX "idx_departments_company_created" ON "departments"("company_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "employees_user_id_key" ON "employees"("user_id");

-- CreateIndex
CREATE INDEX "idx_employees_company_id" ON "employees"("company_id");

-- CreateIndex
CREATE INDEX "idx_employees_company_created" ON "employees"("company_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_employees_department_id" ON "employees"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_company_id_employee_code_key" ON "employees"("company_id", "employee_code");

-- CreateIndex
CREATE INDEX "idx_work_locations_company_id" ON "work_locations"("company_id");

-- CreateIndex
CREATE INDEX "idx_work_locations_company_created" ON "work_locations"("company_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_work_location_employees_company_id" ON "work_location_employees"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "work_location_employees_work_location_id_employee_id_key" ON "work_location_employees"("work_location_id", "employee_id");

-- CreateIndex
CREATE INDEX "idx_attendance_records_company_id" ON "attendance_records"("company_id");

-- CreateIndex
CREATE INDEX "idx_attendance_records_employee_time" ON "attendance_records"("company_id", "employee_id", "check_in_time" DESC);

-- CreateIndex
CREATE INDEX "idx_attendance_records_company_created" ON "attendance_records"("company_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_onboarding_progress_company_id" ON "onboarding_progress"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_progress_company_id_key" ON "onboarding_progress"("company_id");

-- CreateIndex
CREATE INDEX "idx_audit_logs_company_created" ON "audit_logs"("company_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_audit_logs_entity" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "idx_audit_logs_user_created" ON "audit_logs"("user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_leaves_company_id" ON "leaves"("company_id");

-- CreateIndex
CREATE INDEX "idx_leaves_company_employee" ON "leaves"("company_id", "employee_id");

-- CreateIndex
CREATE INDEX "idx_leave_balances_company_id" ON "leave_balances"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "leave_balances_company_id_employee_id_leave_type_year_key" ON "leave_balances"("company_id", "employee_id", "leave_type", "year");

-- CreateIndex
CREATE INDEX "idx_payroll_runs_company_id" ON "payroll_runs"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_runs_company_id_month_year_key" ON "payroll_runs"("company_id", "month", "year");

-- CreateIndex
CREATE INDEX "idx_payroll_entries_company_id" ON "payroll_entries"("company_id");

-- CreateIndex
CREATE INDEX "idx_payroll_entries_run_id" ON "payroll_entries"("payroll_run_id");

-- CreateIndex
CREATE INDEX "idx_performance_reviews_company_id" ON "performance_reviews"("company_id");

-- CreateIndex
CREATE INDEX "idx_performance_reviews_employee" ON "performance_reviews"("company_id", "employee_id");

-- CreateIndex
CREATE INDEX "idx_leads_company_id" ON "leads"("company_id");

-- CreateIndex
CREATE INDEX "idx_leads_company_status" ON "leads"("company_id", "status");

-- CreateIndex
CREATE INDEX "idx_clients_company_id" ON "clients"("company_id");

-- CreateIndex
CREATE INDEX "idx_clients_company_created" ON "clients"("company_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_contacts_company_id" ON "contacts"("company_id");

-- CreateIndex
CREATE INDEX "idx_contacts_client_id" ON "contacts"("client_id");

-- CreateIndex
CREATE INDEX "idx_deals_company_id" ON "deals"("company_id");

-- CreateIndex
CREATE INDEX "idx_deals_company_stage" ON "deals"("company_id", "stage");

-- CreateIndex
CREATE UNIQUE INDEX "quotations_number_key" ON "quotations"("number");

-- CreateIndex
CREATE INDEX "idx_quotations_company_id" ON "quotations"("company_id");

-- CreateIndex
CREATE INDEX "idx_quotations_company_status" ON "quotations"("company_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_number_key" ON "invoices"("number");

-- CreateIndex
CREATE INDEX "idx_invoices_company_id" ON "invoices"("company_id");

-- CreateIndex
CREATE INDEX "idx_invoices_company_status" ON "invoices"("company_id", "status");

-- CreateIndex
CREATE INDEX "idx_invoices_company_due_date" ON "invoices"("company_id", "due_date");

-- CreateIndex
CREATE INDEX "idx_payments_company_id" ON "payments"("company_id");

-- CreateIndex
CREATE INDEX "idx_payments_invoice_id" ON "payments"("invoice_id");

-- CreateIndex
CREATE INDEX "idx_expenses_company_id" ON "expenses"("company_id");

-- CreateIndex
CREATE INDEX "idx_expenses_company_status" ON "expenses"("company_id", "status");

-- CreateIndex
CREATE INDEX "idx_campaigns_company_id" ON "campaigns"("company_id");

-- CreateIndex
CREATE INDEX "idx_projects_company_id" ON "projects"("company_id");

-- CreateIndex
CREATE INDEX "idx_projects_company_stage" ON "projects"("company_id", "stage");

-- CreateIndex
CREATE INDEX "idx_revisions_company_id" ON "revisions"("company_id");

-- CreateIndex
CREATE INDEX "idx_revisions_project_id" ON "revisions"("project_id");

-- CreateIndex
CREATE INDEX "idx_tasks_company_id" ON "tasks"("company_id");

-- CreateIndex
CREATE INDEX "idx_tasks_company_project" ON "tasks"("company_id", "project_id");

-- CreateIndex
CREATE INDEX "idx_tasks_assigned_to" ON "tasks"("assigned_to");

-- CreateIndex
CREATE INDEX "idx_task_comments_company_id" ON "task_comments"("company_id");

-- CreateIndex
CREATE INDEX "idx_task_comments_task_id" ON "task_comments"("task_id");

-- CreateIndex
CREATE INDEX "idx_task_time_logs_company_id" ON "task_time_logs"("company_id");

-- CreateIndex
CREATE INDEX "idx_task_time_logs_task_id" ON "task_time_logs"("task_id");

-- CreateIndex
CREATE INDEX "idx_task_time_logs_user_id" ON "task_time_logs"("user_id");

-- CreateIndex
CREATE INDEX "idx_files_company_id" ON "files"("company_id");

-- CreateIndex
CREATE INDEX "idx_files_entity" ON "files"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "idx_notifications_user_created" ON "notifications"("company_id", "user_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_notifications_unread" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "idx_exchange_rates_company_id" ON "exchange_rates"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "brand_briefs_client_id_key" ON "brand_briefs"("client_id");

-- CreateIndex
CREATE INDEX "idx_brand_briefs_company_id" ON "brand_briefs"("company_id");

-- CreateIndex
CREATE INDEX "idx_brand_briefs_company_created" ON "brand_briefs"("company_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_audience_personas_company_id" ON "audience_personas"("company_id");

-- CreateIndex
CREATE INDEX "idx_audience_personas_brief_id" ON "audience_personas"("brand_brief_id");

-- CreateIndex
CREATE INDEX "idx_content_pillars_company_id" ON "content_pillars"("company_id");

-- CreateIndex
CREATE INDEX "idx_content_pillars_company_client" ON "content_pillars"("company_id", "client_id");

-- CreateIndex
CREATE INDEX "idx_content_plans_company_id" ON "content_plans"("company_id");

-- CreateIndex
CREATE INDEX "idx_content_plans_company_client_month" ON "content_plans"("company_id", "client_id", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "content_plans_company_id_client_id_year_month_key" ON "content_plans"("company_id", "client_id", "year", "month");

-- CreateIndex
CREATE INDEX "idx_content_pieces_company_id" ON "content_pieces"("company_id");

-- CreateIndex
CREATE INDEX "idx_content_pieces_plan_id" ON "content_pieces"("content_plan_id");

-- CreateIndex
CREATE INDEX "idx_content_pieces_company_stage" ON "content_pieces"("company_id", "stage");

-- CreateIndex
CREATE INDEX "idx_content_revisions_company_id" ON "content_revisions"("company_id");

-- CreateIndex
CREATE INDEX "idx_content_revisions_piece_id" ON "content_revisions"("content_piece_id");

-- CreateIndex
CREATE UNIQUE INDEX "frameworks_code_key" ON "frameworks"("code");

-- CreateIndex
CREATE INDEX "idx_content_templates_company_id" ON "content_templates"("company_id");

-- CreateIndex
CREATE INDEX "idx_ai_generations_company_id" ON "ai_generations"("company_id");

-- CreateIndex
CREATE INDEX "idx_ai_generations_user_id" ON "ai_generations"("user_id");

-- CreateIndex
CREATE INDEX "idx_asset_folders_company_id" ON "asset_folders"("company_id");

-- CreateIndex
CREATE INDEX "idx_assets_company_id" ON "assets"("company_id");

-- CreateIndex
CREATE INDEX "idx_assets_folder_id" ON "assets"("folder_id");

-- CreateIndex
CREATE INDEX "idx_asset_versions_company_id" ON "asset_versions"("company_id");

-- CreateIndex
CREATE INDEX "idx_asset_versions_asset_id" ON "asset_versions"("asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "asset_versions_asset_id_version_number_key" ON "asset_versions"("asset_id", "version_number");

-- CreateIndex
CREATE INDEX "idx_equipment_company_id" ON "equipment"("company_id");

-- CreateIndex
CREATE INDEX "idx_equipment_company_status" ON "equipment"("company_id", "current_status");

-- CreateIndex
CREATE INDEX "idx_equipment_bookings_company_id" ON "equipment_bookings"("company_id");

-- CreateIndex
CREATE INDEX "idx_equipment_bookings_equipment_id" ON "equipment_bookings"("equipment_id");

-- CreateIndex
CREATE INDEX "idx_equipment_bookings_project_id" ON "equipment_bookings"("project_id");

-- CreateIndex
CREATE INDEX "idx_equipment_maintenance_company_id" ON "equipment_maintenance"("company_id");

-- CreateIndex
CREATE INDEX "idx_equipment_maintenance_equipment_id" ON "equipment_maintenance"("equipment_id");

-- CreateIndex
CREATE INDEX "idx_exhibitions_company_id" ON "exhibitions"("company_id");

-- CreateIndex
CREATE INDEX "idx_exhibition_booths_company_id" ON "exhibition_booths"("company_id");

-- CreateIndex
CREATE INDEX "idx_exhibition_booths_exhibition_id" ON "exhibition_booths"("exhibition_id");

-- CreateIndex
CREATE INDEX "idx_booth_inventory_company_id" ON "booth_inventory"("company_id");

-- CreateIndex
CREATE INDEX "idx_booth_inventory_booth_id" ON "booth_inventory"("booth_id");

-- CreateIndex
CREATE INDEX "idx_exhibition_financials_company_id" ON "exhibition_financials"("company_id");

-- CreateIndex
CREATE INDEX "idx_exhibition_financials_exhibition_id" ON "exhibition_financials"("exhibition_id");

-- CreateIndex
CREATE UNIQUE INDEX "exhibition_settlements_exhibition_id_key" ON "exhibition_settlements"("exhibition_id");

-- CreateIndex
CREATE INDEX "idx_exhibition_settlements_company_id" ON "exhibition_settlements"("company_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_manager_user_id_fkey" FOREIGN KEY ("manager_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_locations" ADD CONSTRAINT "work_locations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_location_employees" ADD CONSTRAINT "work_location_employees_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_location_employees" ADD CONSTRAINT "work_location_employees_work_location_id_fkey" FOREIGN KEY ("work_location_id") REFERENCES "work_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_location_employees" ADD CONSTRAINT "work_location_employees_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_work_location_id_fkey" FOREIGN KEY ("work_location_id") REFERENCES "work_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_override_by_user_id_fkey" FOREIGN KEY ("override_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_progress" ADD CONSTRAINT "onboarding_progress_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_entries" ADD CONSTRAINT "payroll_entries_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_entries" ADD CONSTRAINT "payroll_entries_payroll_run_id_fkey" FOREIGN KEY ("payroll_run_id") REFERENCES "payroll_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_entries" ADD CONSTRAINT "payroll_entries_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revisions" ADD CONSTRAINT "revisions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revisions" ADD CONSTRAINT "revisions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revisions" ADD CONSTRAINT "revisions_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parent_task_id_fkey" FOREIGN KEY ("parent_task_id") REFERENCES "tasks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_time_logs" ADD CONSTRAINT "task_time_logs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_time_logs" ADD CONSTRAINT "task_time_logs_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_time_logs" ADD CONSTRAINT "task_time_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_rates" ADD CONSTRAINT "exchange_rates_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_briefs" ADD CONSTRAINT "brand_briefs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_briefs" ADD CONSTRAINT "brand_briefs_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audience_personas" ADD CONSTRAINT "audience_personas_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audience_personas" ADD CONSTRAINT "audience_personas_brand_brief_id_fkey" FOREIGN KEY ("brand_brief_id") REFERENCES "brand_briefs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_pillars" ADD CONSTRAINT "content_pillars_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_pillars" ADD CONSTRAINT "content_pillars_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_plans" ADD CONSTRAINT "content_plans_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_plans" ADD CONSTRAINT "content_plans_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_plans" ADD CONSTRAINT "content_plans_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_pieces" ADD CONSTRAINT "content_pieces_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_pieces" ADD CONSTRAINT "content_pieces_content_plan_id_fkey" FOREIGN KEY ("content_plan_id") REFERENCES "content_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_pieces" ADD CONSTRAINT "content_pieces_pillar_id_fkey" FOREIGN KEY ("pillar_id") REFERENCES "content_pillars"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_pieces" ADD CONSTRAINT "content_pieces_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_pieces" ADD CONSTRAINT "content_pieces_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_content_piece_id_fkey" FOREIGN KEY ("content_piece_id") REFERENCES "content_pieces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_requested_by_user_id_fkey" FOREIGN KEY ("requested_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_templates" ADD CONSTRAINT "content_templates_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_generations" ADD CONSTRAINT "ai_generations_content_piece_id_fkey" FOREIGN KEY ("content_piece_id") REFERENCES "content_pieces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_folders" ADD CONSTRAINT "asset_folders_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_folders" ADD CONSTRAINT "asset_folders_parent_folder_id_fkey" FOREIGN KEY ("parent_folder_id") REFERENCES "asset_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "asset_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_versions" ADD CONSTRAINT "asset_versions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_versions" ADD CONSTRAINT "asset_versions_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_current_holder_id_fkey" FOREIGN KEY ("current_holder_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_bookings" ADD CONSTRAINT "equipment_bookings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_bookings" ADD CONSTRAINT "equipment_bookings_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_bookings" ADD CONSTRAINT "equipment_bookings_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_bookings" ADD CONSTRAINT "equipment_bookings_booked_by_user_id_fkey" FOREIGN KEY ("booked_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_maintenance" ADD CONSTRAINT "equipment_maintenance_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_maintenance" ADD CONSTRAINT "equipment_maintenance_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exhibitions" ADD CONSTRAINT "exhibitions_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exhibitions" ADD CONSTRAINT "exhibitions_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exhibition_booths" ADD CONSTRAINT "exhibition_booths_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exhibition_booths" ADD CONSTRAINT "exhibition_booths_exhibition_id_fkey" FOREIGN KEY ("exhibition_id") REFERENCES "exhibitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booth_inventory" ADD CONSTRAINT "booth_inventory_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booth_inventory" ADD CONSTRAINT "booth_inventory_booth_id_fkey" FOREIGN KEY ("booth_id") REFERENCES "exhibition_booths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exhibition_financials" ADD CONSTRAINT "exhibition_financials_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exhibition_financials" ADD CONSTRAINT "exhibition_financials_exhibition_id_fkey" FOREIGN KEY ("exhibition_id") REFERENCES "exhibitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exhibition_financials" ADD CONSTRAINT "exhibition_financials_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exhibition_settlements" ADD CONSTRAINT "exhibition_settlements_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey

-- Enable RLS
ALTER TABLE brand_briefs ENABLE ROW LEVEL SECURITY;

-- Enable RLS
ALTER TABLE brand_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_booths ENABLE ROW LEVEL SECURITY;
ALTER TABLE booth_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_settlements ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policies
CREATE POLICY tenant_isolation ON brand_briefs USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY tenant_isolation ON audience_personas USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY tenant_isolation ON content_pillars USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY tenant_isolation ON content_plans USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY tenant_isolation ON content_pieces USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY tenant_isolation ON content_revisions USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY tenant_isolation ON content_templates USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY tenant_isolation ON ai_generations USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY tenant_isolation ON asset_folders USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY tenant_isolation ON assets USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY tenant_isolation ON asset_versions USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY tenant_isolation ON equipment USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY tenant_isolation ON equipment_bookings USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY tenant_isolation ON equipment_maintenance USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY tenant_isolation ON exhibitions USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY tenant_isolation ON exhibition_booths USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY tenant_isolation ON booth_inventory USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY tenant_isolation ON exhibition_financials USING (company_id = current_setting('app.current_company_id')::uuid);
CREATE POLICY tenant_isolation ON exhibition_settlements USING (company_id = current_setting('app.current_company_id')::uuid);

-- Grant permissions to app role
GRANT ALL ON brand_briefs TO agencyos_app;
GRANT ALL ON audience_personas TO agencyos_app;
GRANT ALL ON content_pillars TO agencyos_app;
GRANT ALL ON content_plans TO agencyos_app;
GRANT ALL ON content_pieces TO agencyos_app;
GRANT ALL ON content_revisions TO agencyos_app;
GRANT ALL ON content_templates TO agencyos_app;
GRANT ALL ON ai_generations TO agencyos_app;
GRANT ALL ON asset_folders TO agencyos_app;
GRANT ALL ON assets TO agencyos_app;
GRANT ALL ON asset_versions TO agencyos_app;
GRANT ALL ON equipment TO agencyos_app;
GRANT ALL ON equipment_bookings TO agencyos_app;
GRANT ALL ON equipment_maintenance TO agencyos_app;
GRANT ALL ON exhibitions TO agencyos_app;
GRANT ALL ON exhibition_booths TO agencyos_app;
GRANT ALL ON booth_inventory TO agencyos_app;
GRANT ALL ON exhibition_financials TO agencyos_app;
GRANT ALL ON exhibition_settlements TO agencyos_app;
