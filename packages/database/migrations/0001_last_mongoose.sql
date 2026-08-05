DO $$ BEGIN
 CREATE TYPE "public"."account_type" AS ENUM('INTERNAL', 'CLIENT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."delivery_status" AS ENUM('PENDING', 'SENT', 'FAILED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."notification_priority" AS ENUM('LOW', 'NORMAL', 'HIGH');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."profile_status" AS ENUM('PENDING_ASSIGNMENT', 'ACTIVE', 'SUSPENDED', 'DISABLED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_email_unique";--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "customer_organizations" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "customer_organizations" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "departments" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "departments" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notification_deliveries" ALTER COLUMN "delivery_status" SET DATA TYPE delivery_status USING delivery_status::text::delivery_status;--> statement-breakpoint
ALTER TABLE "notification_deliveries" ALTER COLUMN "sent_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notification_deliveries" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notification_preferences" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notification_preferences" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notification_recipients" ALTER COLUMN "read_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notification_recipients" ALTER COLUMN "handled_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notification_recipients" ALTER COLUMN "archived_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notification_recipients" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "priority" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "priority" SET DATA TYPE notification_priority USING priority::text::notification_priority;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "priority" SET DEFAULT 'NORMAL'::notification_priority;--> statement-breakpoint
ALTER TABLE "notifications" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "permissions" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "account_type" SET DATA TYPE account_type USING account_type::text::account_type;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "status" SET DATA TYPE profile_status USING status::text::profile_status;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "status" SET DEFAULT 'PENDING_ASSIGNMENT'::profile_status;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "last_login_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "role_permissions" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_entity_type_id_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_actor_profile_id_idx" ON "audit_logs" USING btree ("actor_profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uniq_notification_recipient" ON "notification_recipients" USING btree ("notification_id","profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_recipients_profile_read_idx" ON "notification_recipients" USING btree ("profile_id","read_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notification_recipients_profile_handled_idx" ON "notification_recipients" USING btree ("profile_id","handled_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "profiles_email_lower_idx" ON "profiles" USING btree (lower("email"));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "profiles_status_idx" ON "profiles" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "profiles_role_id_idx" ON "profiles" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "profiles_department_id_idx" ON "profiles" USING btree ("department_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "profiles_customer_org_id_idx" ON "profiles" USING btree ("customer_organization_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "role_permissions_role_id_idx" ON "role_permissions" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "role_permissions_permission_id_idx" ON "role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE OR REPLACE FUNCTION protect_audit_logs()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are append-only. Mutation (UPDATE/DELETE) is not allowed.';
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'protect_audit_logs_trigger') THEN
    CREATE TRIGGER protect_audit_logs_trigger
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION protect_audit_logs();
  END IF;
END $$;--> statement-breakpoint
ALTER TABLE "departments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "customer_organizations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "roles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "permissions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "role_permissions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notification_recipients" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notification_preferences" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notification_deliveries" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;