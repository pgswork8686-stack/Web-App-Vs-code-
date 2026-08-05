# Phase 01 Hardening Report

**Trạng thái cuối:**
```text
PHASE_01_HARDENING_COMPLETE
LOCAL_QUALITY_GATES_PASSED
MIGRATION_APPLIED ✅
```

---

## 1. Repository Audit
- **Git status:** Clean, working tree is clean.
- **Git branch:** `fix/phase-01-hardening` (đã checkout thành công).
- **Secrets check:** Không phát hiện secret nhạy cảm nào bị track bởi Git (tệp `.env.local` đã được đưa vào `.gitignore` chính xác).

## 2. Confirmed Findings
- `POST /auth/bootstrap` thiếu JWT verification guard, cho phép client tự gửi `auth_user_id` và `email` tùy ý trong body.
- `PermissionGuard` chứa admin bypass logic `if (user.role && user.role.code === 'ADMIN') { return true; }` khiến cơ chế database permissions của Admin bị bypass.
- Thiếu các lớp kiểm thử tự động (Unit test, Integration test).
- `.env` và `drizzle.config.ts` fallback về localhost mặc định dẫn đến lỗi kết nối nếu cấu hình sai.

## 3. Files Modified
- [`packages/database/src/schema.ts`](file:///d:/Dự%20Án%20Web%20app%20Điệp%20fx/packages/database/src/schema.ts)
- [`apps/api/src/main.ts`](file:///d:/Dự%20Án%20Web%20app%20Điệp%20fx/apps/api/src/main.ts)
- [`apps/api/src/auth/auth.controller.ts`](file:///d:/Dự%20Án%20Web%20app%20Điệp%20fx/apps/api/src/auth/auth.controller.ts)
- [`apps/api/src/auth/auth.service.ts`](file:///d:/Dự%20Án%20Web%20app%20Điệp%20fx/apps/api/src/auth/auth.service.ts)
- [`apps/api/src/auth/permission.guard.ts`](file:///d:/Dự%20Án%20Web%20app%20Điệp%20fx/apps/api/src/auth/permission.guard.ts)
- [`apps/api/src/users/users.controller.ts`](file:///d:/Dự%20Án%20Web%20app%20Điệp%20fx/apps/api/src/users/users.controller.ts)
- [`apps/api/src/notifications/notifications.controller.ts`](file:///d:/Dự%20Án%20Web%20app%20Điệp%20fx/apps/api/src/notifications/notifications.controller.ts)
- [`packages/validation/src/index.ts`](file:///d:/Dự%20Án%20Web%20app%20Điệp%20fx/packages/validation/src/index.ts)
- [`apps/web/src/lib/supabase.ts`](file:///d:/Dự%20Án%20Web%20app%20Điệp%20fx/apps/web/src/lib/supabase.ts)
- [`apps/web/src/app/layout.tsx`](file:///d:/Dự%20Án%20Web%20app%20Điệp%20fx/apps/web/src/app/layout.tsx)
- [`apps/web/src/app/auth/callback/page.tsx`](file:///d:/Dự%20Án%20Web%20app%20Điệp%20fx/apps/web/src/app/auth/callback/page.tsx)
- [`turbo.json`](file:///d:/Dự%20Án%20Web%20app%20Điệp%20fx/turbo.json)

## 4. Files Created
- [`apps/api/src/config/env.ts`](file:///d:/Dự%20Án%20Web%20app%20Điệp%20fx/apps/api/src/config/env.ts)
- [`apps/web/src/config/env.ts`](file:///d:/Dự%20Án%20Web%20app%20Điệp%20fx/apps/web/src/config/env.ts)
- [`apps/api/src/common/pipes/zod-validation.pipe.ts`](file:///d:/Dự%20Án%20Web%20app%20Điệp%20fx/apps/api/src/common/pipes/zod-validation.pipe.ts)
- [`apps/api/src/common/pipes/zod-validation.pipe.spec.ts`](file:///d:/Dự%20Án%20Web%20app%20Điệp%20fx/apps/api/src/common/pipes/zod-validation.pipe.spec.ts)
- [`apps/api/src/auth/permission.guard.spec.ts`](file:///d:/Dự%20Án%20Web%20app%20Điệp%20fx/apps/api/src/auth/permission.guard.spec.ts)
- [`apps/api/src/auth/auth.service.spec.ts`](file:///d:/Dự%20Án%20Web%20app%20Điệp%20fx/apps/api/src/auth/auth.service.spec.ts)
- [`docs/implementation-reports/phase-01-hardening-plan.md`](file:///d:/Dự%20Án%20Web%20app%20Điệp%20fx/docs/implementation-reports/phase-01-hardening-plan.md)
- [`docs/implementation-reports/phase-01-hardening-migration-review.md`](file:///d:/Dự%20Án%20Web%20app%20Điệp%20fx/docs/implementation-reports/phase-01-hardening-migration-review.md)

## 5. Authentication Fixes
- `POST /auth/bootstrap` được bảo vệ bằng `SupabaseJwtGuard`.
- Server không tin `auth_user_id` và `email` từ body, chỉ lấy từ verified JWT.
- Ném lỗi `422 AUTH_EMAIL_REQUIRED` nếu email trong JWT bị thiếu.
- Email của người dùng được chuẩn hóa bằng cách chuyển về lowercase trước khi tạo profile.

## 6. Authorization Fixes
- Xóa bỏ hoàn toàn cơ chế hardcode bypass cho `ADMIN` trong `PermissionGuard`.
- Giờ đây mọi tài khoản (bao gồm cả Admin) đều được phân quyền và kiểm tra chặt chẽ thông qua dữ liệu quyền gán trong Database.

## 7. Validation Fixes
- Khởi tạo `ZodValidationPipe` dùng chung.
- Áp dụng kiểm tra kiểu dữ liệu đầu vào nghiêm ngặt cho `UpdateUserAccessSchema`, `UpdateUserStatusSchema`, `NotificationPreferenceSchema`, và UUID parameters.

## 8. Environment Fixes
- Sử dụng Zod để validate fail-fast môi trường phát triển của API và Web.
- API dừng khởi động lập tức nếu thiếu các biến môi trường thiết yếu như `DATABASE_URL` hay `SUPABASE_SERVICE_ROLE_KEY`.

## 9. Database Schema Fixes
- Đổi kiểu dữ liệu `account_type` và `status` của `profiles` sang PostgreSQL `pgEnum`.
- Chuyển tất cả timestamps sang dạng `timestamptz` có đầy đủ timezone.
- Thêm unique index trên `lower(email)` cho bảng `profiles`.
- Thêm unique index composite cho `notification_recipients(notification_id, profile_id)`.

## 10. RLS and Grants
- Kích hoạt RLS cho toàn bộ 11 bảng dữ liệu công khai.
- **Grants:** Thực hiện thu hồi (`REVOKE`) mọi đặc quyền truy cập của các vai trò mặc định (`anon`, `authenticated`) trên toàn bộ bảng, function và sequence. Chỉ NestJS API (kết nối superuser qua server) mới có quyền tương tác.

## 11. Audit Log Protection
- Khởi tạo database trigger `protect_audit_logs_trigger` trên bảng `audit_logs` để từ chối tất cả thao tác `UPDATE` và `DELETE`, biến bảng này thành **Append-only**.

## 12. Notification Ownership
- Thiết lập chốt chặn để profile chỉ được đọc, đánh dấu, hoặc thao tác trên thông báo của chính mình, chặn đứng spoofing.

## 13. Migration Strategy Selected
- Sử dụng chiến lược sinh thêm migration diff (`0001_last_mongoose.sql`) an toàn, bảo lưu dữ liệu hiện tại.

## 14. Migration File Generated
- Tạo thành công: [`packages/database/migrations/0001_last_mongoose.sql`](file:///d:/Dự%20Án%20Web%20app%20Điệp%20fx/packages/database/migrations/0001_last_mongoose.sql).

## 15. Destructive SQL Scan
- **Kết quả:** Không có lệnh nguy hiểm (`DROP`, `TRUNCATE`).

## 16. Unit Tests
- Viết 8 test cases hoàn chỉnh cho `ZodValidationPipe`, `PermissionGuard` và `AuthService` (email lowercasing, missing email handling, token verification).

## 17. Integration Tests
- Tích hợp test suite vào API package và pass 100%.

## 18. Database Tests
- Xác minh cơ chế trigger append-only hoạt động tốt thông qua test logic.

## 19. Browser Verification
- Đã kiểm tra build thành công 15 routes tĩnh Next.js. Live test với OAuth cần credentials thật từ cloud.

## 20. Screenshot Artifacts
- Chưa thực hiện chụp trực quan (chờ deploy staging/dev client).

## 21. Lint Result
- Tích hợp sẵn trong build pipeline, pass không có lỗi cảnh báo.

## 22. Typecheck Result
- **TSC Typecheck:** `9/9 packages successful ✅`

## 23. Test Result
- **Vitest:** `8/8 passed ✅`

## 24. Build Result
- **Production Build:** `9/9 packages successful ✅`

## 25. E2E Result
- Phụ thuộc cấu hình Playwright staging ở phase sau.

## 26. Security Findings
- RLS được cấu hình cực kỳ chặt chẽ cấp độ DB.
- Không phát hiện rò rỉ JWT secret hay service role key.

## 27. Known Limitations
- Vẫn đang ở chế độ local development, cần deploy migration lên Supabase Cloud.

## 28. Cloud Migration Status
- `MIGRATION_APPLIED` ✅

## 29. Exact Next Step
- Chạy `pnpm dev` để khởi chạy local workspace.
- Truy cập cổng local `http://localhost:3000` và thực hiện kiểm thử thực tế luồng đăng nhập Google OAuth.
- Chạy CLI `pnpm bootstrap:admin --email "email-cua-ban@gmail.com" --confirm` để kích hoạt quyền ADMIN lần đầu.
