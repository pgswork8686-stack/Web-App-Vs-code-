# Phase 01 Final Remediation Plan

This remediation plan addresses the final security vulnerabilities, environment loading constraints, test configurations, and database schemas for the PGS Hub foundation codebase.

## 1. Git/Workspace Audit
- Check git status and current branch `fix/phase-01-final-remediation`.
- Ensure no secret keys or sensitive configuration values are tracked.

## 2. Supabase Read-Only Audit
- Project ref is verified as `mpljxkaxkektcuvnosiq`.
- Database schema currently has initial schema and migration `0000_secret_gorgon` / `0001_last_mongoose` on cloud.
- Confirm RLS status, enums, triggers on cloud via drizzle-kit check / migration history.

## 3. Confirmed Original Defects
- `apps/api/src/config/env.ts` forces non-runtime vars like `DIRECT_URL` and contains fallback defaults.
- JWT verification is coupled with DB profile bootstrap.
- `profiles.account_type` is marked `.notNull()`, but it should be nullable when status is `PENDING_ASSIGNMENT`.
- Global error exception filter is missing or inconsistent.
- No `UserAccess` validation and assignment checks in API service transaction.
- Lack of complete ESLint configuration and proper package lint scripts.
- CI pipeline in GitHub Actions uses custom cache steps instead of native setup-node caching.

## 4. Environment Fail-Fast Refactoring
- **API Environment**: Create `parseApiEnv(source: NodeJS.ProcessEnv): ApiEnv` exporting validated variables: `NODE_ENV`, `API_PORT`, `WEB_ORIGIN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`. Remove unnecessary variables from API runtime validation (`DIRECT_URL`, `NEXT_PUBLIC_*`).
- **Web Environment**: Create `parseWebEnv(source: Record<string, string | undefined>): WebEnv` for browser variables.
- Remove fallbacks for all environment credentials.

## 5. Auth Verification & Bootstrap Separation
- Create `apps/api/src/auth/auth.types.ts` defining `VerifiedAuthUser` and `CurrentProfileContext`.
- Refactor `AuthService`:
  - `verifyAccessToken(token)`: verifies token and returns `VerifiedAuthUser`.
  - `findProfileByAuthUserId(authUserId)`: query only.
  - `bootstrapProfile(authUser)`: idempotent profile creation.
  - `getRequiredProfile(authUserId)`: throws if not found.
- Update `SupabaseJwtGuard` to only set `request.authUser` after successful validation.
- Implement `ProfileContextGuard` to fetch and attach database profile to `request.user`.

## 6. Database Schema & RLS Changes
- Make `profiles.account_type` nullable in the schema definition.
- Generate a new additive migration (`0002_phase_01_final_remediation.sql` or similar).
- Add constraints that ensure `account_type` is specified only when `status = 'ACTIVE'`.
- Verify trigger `protect_audit_logs_trigger` is active.

## 7. Global Error Contract & Zod validation
- Create `apps/api/src/common/filters/global-exception.filter.ts` to map and output standard error structure with request IDs.
- Refactor `ZodValidationPipe` to throw clean errors format without stack trace or database paths.

## 8. Web Callback and Login Adjustments
- Use validated `env` configuration values in Next.js.
- Ensure callback page correctly fetches profile and routes to appropriate app shell based on role status.

## 9. CI & Code Quality Setup
- Update `.github/workflows/ci.yml` using `actions/setup-node@v4` built-in `pnpm` caching.
- Add `.nvmrc` file specifying Node.js version.
- Implement ESLint configs and scripts in packages and application scopes.

## 10. Automated Testing
- Add environment loading test, auth guard/service tests, validation tests, and notification ownership tests.

## 11. Stop Conditions
- Stop immediately if the Supabase project Ref is mismatching or if credentials exposure is detected.
