# Phase 01 Final Remediation Migration Review

**Trạng thái apply cloud:** `MIGRATION_APPLIED`

---

## 1. Cloud Migration History Observed
- Cloud database project ref is `mpljxkaxkektcuvnosiq`.
- Migrations `0000` (initial) and `0001` (last mongoose) are currently applied.

## 2. Existing Schema Observed
- `profiles.account_type` was previously defined as NOT NULL.
- 11 system tables exist with full row-level security (RLS) active and default public privileges revoked.

## 3. Migration File
- **File path**: `packages/database/migrations/0002_workable_nekra.sql`

## 4. SQL Summary
- `ALTER TABLE "profiles" ALTER COLUMN "account_type" DROP NOT NULL;`
- Data normalization update.
- 3 Check constraints on `profiles` checking:
  - Client accounts must not be linked with internal departments (`chk_client_no_dept`).
  - Internal staff accounts must not be linked with client organizations (`chk_internal_no_org`).
  - Active profiles must have roles and account types assigned (`chk_active_requirements`).

## 5. Destructive Scan
- **Result**: No destructive statements found (`DROP`, `TRUNCATE`, `DROP COLUMN`).

## 6. Estimated Affected Rows
- 0 rows on production currently, as no users are active. Normalization query safely aligns any existing records with account_type = NULL.

## 7. Rollback Plan
- Revert table column default constraints and drop constraints:
```sql
ALTER TABLE "profiles" DROP CONSTRAINT "chk_client_no_dept";
ALTER TABLE "profiles" DROP CONSTRAINT "chk_internal_no_org";
ALTER TABLE "profiles" DROP CONSTRAINT "chk_active_requirements";
ALTER TABLE "profiles" ALTER COLUMN "account_type" SET NOT NULL;
```
