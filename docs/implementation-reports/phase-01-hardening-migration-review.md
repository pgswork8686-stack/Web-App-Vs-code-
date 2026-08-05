# Phase 01 Hardening Migration Review

**Trạng thái apply cloud:** `MIGRATION_APPLIED`

---

## 1. Tables Affected
- **profiles**: Thay đổi kiểu dữ liệu `account_type` và `status` sang custom Postgres enums. Đổi kiểu timestamp của last_login_at, created_at, updated_at sang `timestamptz`.
- **departments**, **customer_organizations**, **roles**, **permissions**, **role_permissions**, **notifications**, **notification_recipients**, **notification_preferences**, **notification_deliveries**: Cập nhật tất cả các timestamp sang `timestamptz` với múi giờ đầy đủ.

## 2. Enums Created
- `account_type`: `'INTERNAL', 'CLIENT'`
- `profile_status`: `'PENDING_ASSIGNMENT', 'ACTIVE', 'SUSPENDED', 'DISABLED'`
- `notification_priority`: `'LOW', 'NORMAL', 'HIGH'`
- `delivery_status`: `'PENDING', 'SENT', 'FAILED'`

## 3. Constraints Added
- Loại bỏ unique constraint trực tiếp trên cột `profiles(email)`.
- Thêm unique index chuẩn hóa lowercase `profiles_email_lower_idx` trên `lower(email)`.
- Thêm unique index composite `uniq_notification_recipient` trên `notification_recipients(notification_id, profile_id)` tránh unread count bị sai lệch.

## 4. Indexes Created
- `audit_logs_entity_type_id_idx` ON `audit_logs(entity_type, entity_id)`
- `audit_logs_created_at_idx` ON `audit_logs(created_at)`
- `audit_logs_actor_profile_id_idx` ON `audit_logs(actor_profile_id)`
- `notification_recipients_profile_read_idx` ON `notification_recipients(profile_id, read_at)`
- `notification_recipients_profile_handled_idx` ON `notification_recipients(profile_id, handled_at)`
- `notifications_created_at_idx` ON `notifications(created_at)`
- `profiles_status_idx` ON `profiles(status)`
- `profiles_role_id_idx` ON `profiles(role_id)`
- `profiles_department_id_idx` ON `profiles(department_id)`
- `profiles_customer_org_id_idx` ON `profiles(customer_organization_id)`
- `role_permissions_role_id_idx` ON `role_permissions(role_id)`
- `role_permissions_permission_id_idx` ON `role_permissions(permission_id)`

## 5. Security & Row-Level Security (RLS)
- Bật RLS thành công trên toàn bộ 11 bảng public nhạy cảm.
- **Grants isolation:** Thực thi lệnh `REVOKE ALL PRIVILEGES` đối với các role `anon` và `authenticated`. Mọi kết nối trực tiếp từ Web Client (PostgREST) sẽ lập tức bị từ chối truy cập các bảng nghiệp vụ, bảo vệ tuyệt đối dữ liệu. NestJS API kết nối qua PostgreSQL client nâng cao (`postgres` superuser/owner) vẫn hoạt động bình thường.

## 6. Audit Log Protection
- Khởi tạo trigger `protect_audit_logs_trigger` trên bảng `audit_logs`.
- Mọi câu lệnh `UPDATE` hoặc `DELETE` tác động lên bảng `audit_logs` sẽ ném ngoại lệ hệ thống: `Audit logs are append-only. Mutation (UPDATE/DELETE) is not allowed.`

## 7. Destructive SQL Scan
- Quét tệp SQL: Không phát hiện câu lệnh `DROP DATABASE`, `DROP SCHEMA`, `DROP TABLE`, `TRUNCATE`, hay `ALTER TABLE ... DROP COLUMN`.
- Quá trình chuyển đổi kiểu dữ liệu (ALTER COLUMN SET DATA TYPE) diễn ra an toàn.

---

## Trạng thái Cuối
```
MIGRATION_APPLIED ✅
```
