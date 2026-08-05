ALTER TABLE "profiles" ALTER COLUMN "account_type" DROP NOT NULL;--> statement-breakpoint

UPDATE "profiles"
SET "account_type" = NULL
WHERE "status" = 'PENDING_ASSIGNMENT'
  AND "role_id" IS NULL
  AND "department_id" IS NULL
  AND "customer_organization_id" IS NULL;--> statement-breakpoint

ALTER TABLE "profiles" ADD CONSTRAINT "chk_client_no_dept" CHECK ("account_type" <> 'CLIENT' OR "department_id" IS NULL);--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "chk_internal_no_org" CHECK ("account_type" <> 'INTERNAL' OR "customer_organization_id" IS NULL);--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "chk_active_requirements" CHECK ("status" <> 'ACTIVE' OR ("account_type" IS NOT NULL AND "role_id" IS NOT NULL));