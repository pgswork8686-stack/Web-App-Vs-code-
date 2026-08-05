ALTER TABLE "profiles" DROP CONSTRAINT IF EXISTS "chk_active_requirements";--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "chk_active_requirements" CHECK (
  "status" <> 'ACTIVE' OR 
  ("account_type" = 'INTERNAL' AND "role_id" IS NOT NULL) OR 
  ("account_type" = 'CLIENT' AND "role_id" IS NOT NULL AND "customer_organization_id" IS NOT NULL)
);
