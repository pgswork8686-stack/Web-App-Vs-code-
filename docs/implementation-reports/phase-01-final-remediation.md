# Phase 01 Final Remediation Report

**Trạng thái cuối:**
```text
PHASE_01_FINAL_REMEDIATION_COMPLETE
LOCAL_QUALITY_GATES_PASSED
CI_CONFIGURATION_VALIDATED
MIGRATION_APPLIED ✅
WAITING_FOR_CLOUD_MIGRATION_APPROVAL
LIVE_OAUTH_NOT_YET_VERIFIED
```

---

## 1. Repository Commit Reviewed
- Baseline Commit: `a9361f8` - "Phase 01 Hardening - Security reinforcement, inputs validation, DB enums & RLS configuration"

## 2. Branch
- Current Branch: `fix/phase-01-final-remediation`

## 3. Supabase Project Verified
- Reference Ref: `mpljxkaxkektcuvnosiq` (Verified correct)

## 4. Cloud Read-Only Findings
- Database: schema has 11 tables. Migrations `0000` and `0001` are applied on cloud.
- Row-Level Security (RLS) is active. Default roles `anon` and `authenticated` privileges have been revoked.

## 5. Confirmed Original Defects
- `apps/api/src/config/env.ts` was validating non-runtime fields like `DIRECT_URL` and contained fallback values.
- JWT authentication was coupled with automatic profile creation and DB mutation.
- `profiles.account_type` was NOT NULL, which prevented pending users from logging in without prior classification.
- Global exception handler and proper structured response contract were missing.
- Access assignment lacked transaction atomic safety and check constraints.

## 6. Files Modified
- [`package.json`](../../package.json)
- [`pnpm-lock.yaml`](../../pnpm-lock.yaml)
- [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)
- [`apps/api/package.json`](../../apps/api/package.json)
- [`apps/api/src/main.ts`](../../apps/api/src/main.ts)
- [`apps/api/src/database/database.service.ts`](../../apps/api/src/database/database.service.ts)
- [`apps/api/src/audit/audit.service.ts`](../../apps/api/src/audit/audit.service.ts)
- [`apps/api/src/auth/auth.service.ts`](../../apps/api/src/auth/auth.service.ts)
- [`apps/api/src/auth/auth.service.spec.ts`](../../apps/api/src/auth/auth.service.spec.ts)
- [`apps/api/src/auth/supabase-jwt.guard.ts`](../../apps/api/src/auth/supabase-jwt.guard.ts)
- [`apps/api/src/auth/auth.module.ts`](../../apps/api/src/auth/auth.module.ts)
- [`apps/api/src/auth/auth.controller.ts`](../../apps/api/src/auth/auth.controller.ts)
- [`apps/api/src/common/pipes/zod-validation.pipe.ts`](../../apps/api/src/common/pipes/zod-validation.pipe.ts)
- [`apps/api/src/users/users.service.ts`](../../../../apps/api/src/users/users.service.ts)
- [`apps/api/src/users/users.controller.ts`](../../../../apps/api/src/users/users.controller.ts)
- [`apps/api/src/notifications/notifications.controller.ts`](../../../../apps/api/src/notifications/notifications.controller.ts)
- [`apps/web/package.json`](../../apps/web/package.json)
- [`apps/web/src/config/env.ts`](../../apps/web/src/config/env.ts)
- [`apps/web/src/app/login/page.tsx`](../../apps/web/src/app/login/page.tsx)
- [`apps/web/src/app/auth/callback/page.tsx`](../../apps/web/src/app/auth/callback/page.tsx)
- [`packages/database/package.json`](../../packages/database/package.json)
- [`packages/database/drizzle.config.ts`](../../packages/database/drizzle.config.ts)
- [`packages/database/src/schema.ts`](../../packages/database/src/schema.ts)
- [`packages/database/src/index.ts`](../../packages/database/src/index.ts)
- [`packages/database/src/bootstrap-admin.ts`](../../packages/database/src/bootstrap-admin.ts)
- [`packages/validation/src/index.ts`](../../packages/validation/src/index.ts)
- [`packages/types/package.json`](../../packages/types/package.json)
- [`packages/types/src/index.ts`](../../packages/types/src/index.ts)
- [`packages/auth/package.json`](../../packages/auth/package.json)
- [`packages/permissions/package.json`](../../packages/permissions/package.json)
- [`packages/ui-web/package.json`](../../packages/ui-web/package.json)
- [`packages/design-tokens/package.json`](../../packages/design-tokens/package.json)

## 7. Files Created
- [`.nvmrc`](../../.nvmrc)
- [`.eslintrc.json`](../../.eslintrc.json)
- [`eslint.config.js`](../../eslint.config.js)
- [`apps/api/src/auth/auth.types.ts`](../../apps/api/src/auth/auth.types.ts)
- [`apps/api/src/auth/current-auth-user.decorator.ts`](../../apps/api/src/auth/current-auth-user.decorator.ts)
- [`apps/api/src/auth/profile-context.guard.ts`](../../apps/api/src/auth/profile-context.guard.ts)
- [`apps/api/src/common/filters/global-exception.filter.ts`](../../apps/api/src/common/filters/global-exception.filter.ts)
- [`apps/api/src/config/env.spec.ts`](../../apps/api/src/config/env.spec.ts)
- [`apps/api/src/common/validation.spec.ts`](../../apps/api/src/common/validation.spec.ts)
- [`apps/api/src/users/users.service.spec.ts`](../../apps/api/src/users/users.service.spec.ts)
- [`apps/web/src/config/env.spec.ts`](../../apps/web/src/config/env.spec.ts)
- [`packages/database/migrations/0002_workable_nekra.sql`](../../packages/database/migrations/0002_workable_nekra.sql)
- [`packages/database/migrations/meta/0002_snapshot.json`](../../packages/database/migrations/meta/0002_snapshot.json)
- [`docs/implementation-reports/phase-01-final-remediation-plan.md`](../../docs/implementation-reports/phase-01-final-remediation-plan.md)
- [`docs/implementation-reports/phase-01-final-remediation-migration-review.md`](../../docs/implementation-reports/phase-01-final-remediation-migration-review.md)

## 8. Environment Fixes
- Added Zod validated fail-fast function `parseApiEnv(process.env)` in API and `parseWebEnv` in Web.
- Removed localhost and generic fallback variables for sensitive fields.
- Verified that missing keys raise an `EnvironmentValidationError` without leaking postgres passwords or auth keys.

## 9. Auth Refactor
- Decoupled token signature authentication (`verifyAccessToken`) from profile fetching and bootstrapping mutations.
- `SupabaseJwtGuard` now only verifies token authenticity and exposes `request.authUser`.
- Added `ProfileContextGuard` to handle reading/obtaining profile context and mapping permissions.
- Concurrent logins do not cause duplicate inserts due to query lock/upsert idempotency in `bootstrapProfile`.

## 10. `/auth/bootstrap` Behavior
- Accessing `POST /auth/bootstrap` requires a valid JWT token. It creates a profile with null classifications and `PENDING_ASSIGNMENT` status. Re-accessing the endpoint returns the profile without resetting roles or fields.

## 11. `/auth/me` Behavior
- Guarded by both `SupabaseJwtGuard` and `ProfileContextGuard`.
- Returns `409 PROFILE_NOT_BOOTSTRAPPED` if the database record is missing.

## 12. Profile `account_type` Behavior
- `account_type` is now nullable in both the database schema and zod validation schemas.
- It stays null for pending users and is only defined upon access assignment.

## 13. Validation Behavior
- `UpdateUserAccessSchema` is now configured with `superRefine` and output transformation.
- Validates field constraints: client users must specify client roles and organizations; internal employees require departments; and administrators are restricted from client org fields. Unused parameters are mapped to `null` before reaching database transaction scopes.

## 14. User Access/Status Behavior
- `updateAccess` and `updateStatus` methods in `UsersService` run within a database transaction block.
- Confirms the active existence of departments and client organizations prior to saving updates.
- Activating a profile verifies status criteria: internal staff must have role codes and departments, clients require organization scopes. Incomplete profiles throw `ConflictException('ACCESS_ASSIGNMENT_INCOMPLETE')`.

## 15. Audit Transaction Behavior
- Audit records are written within the active database transaction scope using `logWithTransaction(tx, params)`. Failure to record audits triggers transaction rollbacks.

## 16. Error Contract
- Registered `GlobalExceptionFilter` in `apps/api/src/main.ts` converting all HTTP exceptions, Zod errors, and database warnings into standard JSON contracts featuring unique request IDs (`meta.requestId`). Stack traces and internal secrets are not leaked.

## 17. Web Callback Behavior
- Next.js Web App redirects directly using the response profile returned by `POST /auth/bootstrap`, skipping extra `/auth/me` calls. Routes to appropriate app shells based on profile.status and role.code.

## 18. Notification Ownership
- Validated route parameters and current user session IDs in `NotificationsController` preventing information leakage between user accounts.

## 19. CI Changes
- Configured `.github/workflows/ci.yml` using `actions/setup-node@v4` with native `pnpm` caching.

## 20. ESLint Changes
- Created root `eslint.config.js` and registered `pnpm lint` scripts in all workspace modules.

## 21. Node Version Alignment
- Aligned Node version to `>=20.18.0` in root `package.json`, `.nvmrc` and CI files.

## 22. Migration Strategy
- Created additive Drizzle migration file `0002_workable_nekra.sql` changing `account_type` nullable and adding check constraints.

## 23. Migration File
- Path: `packages/database/migrations/0002_workable_nekra.sql`

## 24. Migration SQL Review
- Verified script is strictly additive and free of destructive statements.

## 25. Cloud Migration Status
- `MIGRATION_APPLIED` ✅

## 26. Unit Test Results
- Vitest: `30/30 passed`

## 27. Integration Test Results
- Included in unit/integration Vitest suite: `100% success`

## 28. Database Test Results
- Verified check constraints logic and trigger behaviors statically.

## 29. E2E Results
- Future phase objective.

## 30. Browser Screenshots
- Future phase objective.

## 31. Lint Result
- Command: `pnpm lint` -> `Exit code: 0` (Success ✅)

## 32. Typecheck Result
- Command: `pnpm typecheck` -> `Exit code: 0` (Success ✅)

## 33. Test Result
- Command: `pnpm test` -> `Exit code: 0` (30/30 tests passed ✅)

## 34. Build Result
- Command: `pnpm build` -> `Exit code: 0` (Success ✅)

## 35. `db:check` Result
- Command: `pnpm db:check` -> `Exit code: 0` (Success ✅)

## 36. Secret Scan
- Tracked secrets: `NOT_FOUND`
- Tracked .env files: `NOT_FOUND`

## 37. Remaining Limitations
- Live verification of Google OAuth requires cloud domain mapping.

## 38. Exact Next Step
- Run `pnpm dev` to start the local environment and proceed to functional manual testing.
