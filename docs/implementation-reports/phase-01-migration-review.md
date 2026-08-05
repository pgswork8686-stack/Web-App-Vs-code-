# Phase 01 - Migration Review Report

Bản báo cáo đánh giá cấu trúc migration cơ sở dữ liệu PGS Hub (Phase 01).

## 1. Các bảng cơ sở dữ liệu sẽ tạo
- `departments`: Phòng ban nội bộ.
- `customer_organizations`: Tổ chức khách hàng.
- `roles`: Danh mục vai trò hệ thống.
- `permissions`: Danh mục quyền chi tiết.
- `role_permissions`: Bảng trung gian phân quyền vai trò.
- `profiles`: Thông tin người dùng liên kết với Supabase Auth.
- `audit_logs`: Lịch sử hoạt động.
- `notifications`: Nội dung thông báo hệ thống.
- `notification_recipients`: Người nhận thông báo.
- `notification_preferences`: Cấu hình nhận thông báo.
- `notification_deliveries`: Trạng thái gửi thông báo (email, in_app).

## 2. Các ràng buộc và Index quan trọng
- Ràng buộc Unique trên:
  - `departments.code`
  - `customer_organizations.code`
  - `roles.code`
  - `permissions.code`
  - `profiles.auth_user_id` và `profiles.email`
- Khóa chính tổng hợp (Compound Primary Key) trên `role_permissions (role_id, permission_id)`.
- Unique Index `uniq_profile_event_channel` trên `notification_preferences (profile_id, event_type, channel)`.
- Khóa ngoại có hành vi xử lý an toàn:
  - `ON DELETE cascade` cho các bảng cấu hình phụ thuộc (`role_permissions`, `notification_preferences`, `notification_recipients`, `notification_deliveries`).
  - `ON DELETE set null` cho các trường tham chiếu (`profiles.role_id`, `profiles.department_id`, `profiles.customer_organization_id`, `audit_logs.actor_profile_id`).

## 3. Các cấu hình bảo mật RLS dự kiến
- Tất cả các bảng nghiệp vụ sẽ được bật **Row-Level Security (RLS)** trên cloud database.
- Không cho phép vai trò `anon` hoặc `authenticated` truy cập trực tiếp các bảng nhạy cảm (như `profiles`, `audit_logs`) thông qua REST API Supabase (PostgREST), trừ khi được thực hiện gián tiếp thông qua NestJS API (sử dụng service role key được quản lý tập trung ở API backend).

## 4. Chiến lược phục hồi (Rollback Strategy)
Trong trường hợp cần rollback local, ta có thể dùng lệnh drop schema hoặc drop các table cụ thể theo thứ tự phụ thuộc khóa ngoại ngược:
```sql
DROP TABLE IF EXISTS "notification_deliveries";
DROP TABLE IF EXISTS "notification_preferences";
DROP TABLE IF EXISTS "notification_recipients";
DROP TABLE IF EXISTS "notifications";
DROP TABLE IF EXISTS "audit_logs";
DROP TABLE IF EXISTS "role_permissions";
DROP TABLE IF EXISTS "profiles";
DROP TABLE IF EXISTS "permissions";
DROP TABLE IF EXISTS "roles";
DROP TABLE IF EXISTS "departments";
DROP TABLE IF EXISTS "customer_organizations";
```

## 5. Trạng thái migration
- **Local Status**: Đã sinh file thành công (`0000_secret_gorgon.sql`).
- **Cloud Status**: **PENDING** (Chờ Admin phê duyệt). Tuyệt đối không tự động chạy migration trên cloud.
