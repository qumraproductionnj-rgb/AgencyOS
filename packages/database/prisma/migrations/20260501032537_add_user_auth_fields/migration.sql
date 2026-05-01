-- AlterTable
ALTER TABLE "users" ADD COLUMN     "account_locked_until" TIMESTAMPTZ,
ADD COLUMN     "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_login_at" TIMESTAMPTZ,
ADD COLUMN     "preferred_language" TEXT NOT NULL DEFAULT 'ar',
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'Asia/Baghdad';
