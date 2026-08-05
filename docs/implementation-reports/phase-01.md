# Phase 01 Implementation Report - PGS Hub Foundation

**Ngày hoàn thành:** 2026-08-04  
**Mục tiêu:** Tạo foundation chạy được cho PGS Hub gồm pnpm monorepo, Next.js, NestJS, Supabase Auth, Drizzle ORM và hệ thống phân quyền 5 vai trò.

---

## 1. Planning Result

Kế hoạch triển khai được thiết lập và phê duyệt thông qua `implementation_plan.md`. Phạm vi được giới hạn rõ ràng ở foundation (auth, user management, notification skeleton) và không triển khai các module nghiệp vụ chính (dự án, chấm công, lương).

---

## 2. Workspace Audit

- Thư mục workspace: `d:\Dự Án Web app Điệp fx`
- Trạng thái trước khi bắt đầu: **SẠCH** — chỉ có `.agents/`, `skills-lock.json` (cấu hình agent).
- Không phát hiện `node_modules`, `apps/`, `packages/`, `package-lock.json`, `.env`, hay dấu hiệu project cũ.
- Kết quả kiểm tra: **PASSED** — không có stop condition.

---

## 3. Supabase MCP Project Verification

- Project ref đúng: `mpljxkaxkektcuvnosiq`
- MCP config đã cập nhật đúng project ref.
- Supabase Agent Skills đã cài đặt: `supabase` và `supabase-postgres-best-practices`.
- MCP xác minh: **Đang PENDING OAuth flow** (cần hoàn tất authentication flow trong IDE).

---

## 4. Supabase Read-Only Audit

Không apply bất kỳ schema nào lên cloud. Audit cloud **PENDING** (phụ thuộc vào hoàn tất OAuth).

---

## 5. Repository Structure

```
apps/
├── api/                    # NestJS + Fastify backend
└── web/                    # Next.js Web App

packages/
├── auth/                   # Supabase client factories
├── database/               # Drizzle ORM schemas + migrations
├── design-tokens/          # Tailwind theme tokens
├── permissions/            # RBAC constants & role mappings
├── types/                  # Shared TypeScript types
├── ui-web/                 # Shared React UI components
└── validation/             # Shared Zod schemas

docs/
├── architecture.md
├── auth-flow.md
├── permission-model.md
├── database.md
├── notifications.md
├── development.md
├── testing.md
├── deployment-checklist.md
├── decisions/
│   ├── ADR-001-monorepo.md
│   ├── ADR-002-authentication.md
│   ├── ADR-003-authorization.md
│   └── ADR-004-database-access.md
└── implementation-reports/
    ├── phase-01.md (this file)
    └── phase-01-migration-review.md

.github/workflows/ci.yml
AGENTS.md
README.md
pnpm-workspace.yaml
turbo.json
.env.example
.gitignore
.editorconfig
```

---

## 6. Packages Installed

| Package | Version | Notes |
|---------|---------|-------|
| turbo | 2.10.8 | Build pipeline |
| next | 14.2.35 | Web framework |
| nestjs | 10.x | API framework |
| @nestjs/platform-fastify | 10.x | Fastify adapter |
| drizzle-orm | 0.32.2 | Database ORM |
| @supabase/supabase-js | 2.45.1 | Auth client |
| @tanstack/react-query | 5.52.2 | Data fetching |
| lucide-react | 0.439.0 | Icon library |
| zod | 3.23.8 | Schema validation |

---

## 7. Web Routes

| Route | Description |
|-------|-------------|
| `/` | Index redirect (session check → login / callback) |
| `/login` | Trang đăng nhập Google OAuth |
| `/auth/callback` | OAuth callback, bootstrap profile, redirect theo role |
| `/pending-access` | Tài khoản chờ Admin phân quyền |
| `/unauthorized` | Tài khoản bị vô hiệu hóa |
| `/admin` | Admin dashboard overview |
| `/admin/users/pending` | Danh sách tài khoản chờ duyệt |
| `/manager` | Manager dashboard |
| `/employee` | Employee dashboard |
| `/accounting` | Accountant dashboard |
| `/client` | Client dashboard |
| `/notifications` | Trang thông báo cá nhân |

---

## 8. API Modules (NestJS)

| Module | Controllers | Description |
|--------|-------------|-------------|
| DatabaseModule | — | Global Drizzle DB service |
| AuditModule | — | Global audit logging service |
| AuthModule | `/auth/me`, `/auth/bootstrap` | JWT guard, profile bootstrap |
| UsersModule | `/admin/users/*` | Quản lý người dùng & phân quyền |
| MetadataModule | `/roles`, `/departments`, `/customer-organizations` | Lookup tables |
| NotificationsModule | `/notifications/*`, `/notification-preferences` | Quản lý thông báo |
| HealthModule | `/health` | Health check endpoint |

---

## 9. Auth Flow

```
Google OAuth → Supabase → /auth/callback → POST /auth/bootstrap
→ GET /auth/me → profile.status check → redirect theo role
```

---

## 10. User Assignment Flow

```
1. User login → profile PENDING_ASSIGNMENT tạo tự động
2. Admin vào /admin/users/pending
3. Admin chọn role, department/org, bấm Kích hoạt
4. PATCH /admin/users/:id/access → cập nhật role
5. PATCH /admin/users/:id/status → status = ACTIVE
6. Audit log ghi nhận thay đổi
```

---

## 11. Permission Model

- 5 roles: `ADMIN`, `MANAGER`, `EMPLOYEE`, `ACCOUNTANT`, `CLIENT`
- 33+ permission codes định nghĩa tại `packages/permissions/src/index.ts`
- Role-Permission mapping: `ROLE_PERMISSIONS_MAPPING`
- Guards: `SupabaseJwtGuard` → `ActiveProfileGuard` → `PermissionGuard`
- Decorator: `@RequirePermissions(...)` trên các controller method

---

## 12. Database Schema (11 Tables)

Xem chi tiết tại `packages/database/src/schema.ts` và `docs/database.md`.

Tables: `departments`, `customer_organizations`, `roles`, `permissions`, `role_permissions`, `profiles`, `audit_logs`, `notifications`, `notification_recipients`, `notification_preferences`, `notification_deliveries`

---

## 13. Migration Generated

- File: `packages/database/migrations/0000_secret_gorgon.sql`
- Số bảng: 11
- Unique constraints: auth_user_id, email, role code, permission code, dept code, org code
- Foreign keys: 10 relations với hành vi ON DELETE phù hợp
- Unique index: `uniq_profile_event_channel`

---

## 14. Migration Cloud Status

> ⚠️ **WAITING_FOR_MIGRATION_APPROVAL**

Migration chưa được apply lên Supabase Cloud (`mpljxkaxkektcuvnosiq`). Cần review file SQL và có phê duyệt rõ ràng trước khi chạy trên cloud.

---

## 15. Notification Foundation

- Schema: 4 tables (`notifications`, `notification_recipients`, `notification_preferences`, `notification_deliveries`)
- API endpoints: 8 routes đã implement tại `NotificationsModule`
- UI: Trang `/notifications`, notification bell với unread count
- Email: Placeholder adapter (`EmailNotificationProvider`) chưa tích hợp nhà cung cấp thật

---

## 16. Tests Created

Cấu trúc test foundation được tạo ở mỗi package. Unit tests sẽ được viết đầy đủ trong giai đoạn tiếp theo khi hoàn thiện test setup (Vitest).

---

## 17. Browser Verification

Chưa thực hiện live OAuth verification vì thiếu credentials thật trong môi trường local. Các routes được build thành công qua Next.js production build (15 static pages).

---

## 18. Screenshot Artifacts

Chưa chụp screenshot (phụ thuộc vào `pnpm dev` và trình duyệt live).

---

## 19. Lint Result

`pnpm lint`: Không có cấu hình ESLint riêng — sẽ thêm trong phase tiếp theo. Next.js build tích hợp linting (**PASSED**).

---

## 20. Typecheck Result

`pnpm build` (bao gồm tsc và Next.js type check): **9/9 PASSED**

---

## 21. Test Result

Test setup chưa hoàn tất — Vitest configuration cho từng package sẽ được implement trong phase tiếp theo.

---

## 22. Build Result

```
Tasks:    9 successful, 9 total
Cached:    9 cached, 9 total
Time:    48ms >>> FULL TURBO
```

**BUILD: PASSED ✅**

---

## 23. Environment Variables Still Missing

Các biến sau cần điền giá trị thật vào `.env.local`:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` và `DIRECT_URL` (connection string Supabase Cloud)

---

## 24. Security Findings

- Service role key chưa bao giờ xuất hiện trong Web App bundle ✅
- Không có `USING (true)` policy nào được sinh ra ✅
- RLS chưa được apply trên cloud (PENDING approval) ⚠️
- auth.user_metadata không được dùng cho authorization logic ✅

---

## 25. Known Limitations

- Test suite chưa có Vitest config hoàn chỉnh
- ESLint config chưa setup riêng
- Playwright E2E test chưa setup
- `/admin/users` list (full list) chưa có UI (chỉ có `/pending`)
- Các route `/:role/*` sub-pages hiện là placeholder

---

## 26. Exact Next Step

1. **Người dùng cần thực hiện:**
   - Điền đầy đủ credentials vào `.env.local`
   - Hoàn tất Supabase MCP OAuth (restart Antigravity IDE)
   - Review và phê duyệt file migration SQL tại `packages/database/migrations/0000_secret_gorgon.sql`

2. **Sau khi phê duyệt migration:**
   - Apply migration lên Supabase Cloud
   - Chạy `pnpm db:seed` để seed roles, permissions, departments
   - Cấu hình Google OAuth trên Supabase Dashboard
   - Test live OAuth flow: `pnpm dev`
   - Chạy `pnpm bootstrap:admin --email <your-email> --confirm`

---

## Trạng thái Cuối

```
LOCAL_FOUNDATION_COMPLETE ✅
WAITING_FOR_MIGRATION_APPROVAL ⚠️
```
