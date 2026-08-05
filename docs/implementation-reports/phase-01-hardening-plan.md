# Phase 01 Hardening Plan

This plan details the implementation steps to harden the PGS Hub foundation codebase, addressing security, reliability, validation, database constraints, and test coverage.

## 1. Current Repository Audit
- **Git status**: Clean, currently on local branch `fix/phase-01-hardening`.
- **Secrets in Git**: Verified `.env.example` has been cleaned from the Supabase service role key.
- **Tech Stack**: Next.js (Web), NestJS + Fastify (API), Supabase Auth & DB, Drizzle ORM.
- **Authentication**: `POST /auth/bootstrap` is unprotected and accepts user details via request body. `SupabaseJwtGuard` uses `verifyAndGetProfile` which automatically registers a user.

## 2. Confirmed Findings
- `POST /auth/bootstrap` lacks JWT verification guard.
- `PermissionGuard` contains admin-bypass logic `if (user.role?.code === 'ADMIN') { return true; }`.
- Lack of strict runtime input validations using Zod.
- Missing environment variable validations.
- Database constraints (such as `timestamptz`, unique composite indexes, enums/check constraints) need to be explicitly configured.
- Row-Level Security (RLS) is not verified, and direct anonymous/authenticated client access to database public tables needs to be locked down.

## 3. Authentication Changes
- Protect `POST /auth/bootstrap` using a new custom `SupabaseJwtRawGuard` or update `SupabaseJwtGuard` to verify token signature via `supabase.auth.getUser()`, extract email and metadata, and bootstrap the profile idempotently.
- Return `422 AUTH_EMAIL_REQUIRED` if the authenticated user has no email.
- Ensure the profile is created as `PENDING_ASSIGNMENT` with `role_id = null`, `department_id = null`, and `customer_organization_id = null`.
- Make bootstrapping idempotent: do not override roles, status, etc., if they are already set.

## 4. Authorization Changes
- Remove the `ADMIN` bypass in `PermissionGuard`.
- Ensure all roles (including `ADMIN`) must have the required permission inside their permission list/mappings.
- Check profile status (`ACTIVE`) on protected routes.
- Add scopes mapping (Foundation for data scopes).

## 5. Runtime Validation Changes
- Create `ZodValidationPipe` and use it on NestJS controllers.
- Define strict validation schemas for:
  - `UpdateUserAccessSchema`
  - `UpdateUserStatusSchema`
  - `NotificationPreferenceSchema`
  - `NotificationFilterSchema`
  - `PaginationSchema`
  - UUID parameter validation.
- Implement business rules validation for role assignments (e.g. `MANAGER` needs `department_id`, `CLIENT` needs `customer_organization_id` and must have `department_id = null`, etc.).

## 6. Environment Changes
- Create a configuration loader and fail-fast environment schema using Zod for both API (`apps/api/src/config/env.ts`) and Web (`apps/web/src/config/env.ts`).
- Block server startup if required variables are missing.
- Prevent loading server-side secrets in the web client build.

## 7. Database Schema Changes
- Modify Drizzle schemas in `packages/database/src/schema.ts` to:
  - Use `pgEnum` for `account_type` (`INTERNAL`, `CLIENT`) and `profile_status` (`PENDING_ASSIGNMENT`, `ACTIVE`, `SUSPENDED`, `DISABLED`).
  - Use `timestamptz` for all timestamps.
  - Enforce `profiles.auth_user_id` unique and `profiles.email` normalized (lowercase) unique.
  - Enforce composite unique index on `notification_recipients(notification_id, profile_id)`.
  - Add appropriate FK constraints and delete actions.
  - Add indexes for foreign keys, statuses, and search columns.

## 8. RLS and Grants Strategy
- Apply Row-Level Security (RLS) policies on all tables.
- Grant `SELECT/INSERT/UPDATE/DELETE` only to the backend role (admin/service_role), denying anonymous and default authenticated direct table access.

## 9. Audit Log Protection
- Audit logs will be append-only.
- Implement database triggers or strict API access checks preventing `UPDATE` and `DELETE` queries on the `audit_logs` table.
- Log action details including `actor_profile_id`, action type, payload (before/after), and audit fields (`ip_address`, `user_agent`, `request_id`).

## 10. Migration Strategy
- Since we have local migrations and haven't deployed to production, we can regenerate a clean initial migration or add an additive migration.
- Verify migrations do not contain destructive operations like `DROP DATABASE`.

## 11. Test Strategy
- Set up unit tests, integration tests, and Playwright browser tests.
- Verify JWT verification, permissions, validation pipe, error formatting, and constraints.

## 12. Browser Verification Strategy
- Test the login, pending access, unauthorized page, and app shells using local mock configurations/test environments.

## 13. Files to Create/Modify
- **Create**:
  - `apps/api/src/config/env.ts`
  - `apps/web/src/config/env.ts`
  - `apps/api/src/common/pipes/zod-validation.pipe.ts`
  - `docs/implementation-reports/phase-01-hardening-migration-review.md`
  - `docs/implementation-reports/phase-01-hardening.md`
- **Modify**:
  - `packages/database/src/schema.ts`
  - `apps/api/src/auth/auth.controller.ts`
  - `apps/api/src/auth/auth.service.ts`
  - `apps/api/src/auth/supabase-jwt.guard.ts`
  - `apps/api/src/auth/permission.guard.ts`
  - `apps/api/src/users/users.controller.ts`
  - `apps/api/src/main.ts`
  - `apps/web/src/lib/supabase.ts`

## 14. Risks & Stop Conditions
- If the Supabase project ref is mismatching, stop immediately.
- If database credentials are leaked, rotate immediately.
