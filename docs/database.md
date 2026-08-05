# Cơ sở dữ liệu - PGS Hub Database Schema

Mô tả cấu trúc bảng cơ sở dữ liệu và quy định phát triển.

## 1. Thiết kế Schema (Drizzle ORM)
Tất cả các định nghĩa bảng cơ sở dữ liệu nằm tập trung tại `packages/database/src/schema.ts`.

### Các bảng cốt lõi (Core Tables)
- **`profiles`**: Liên kết tài khoản auth.users của Supabase với metadata nghiệp vụ (họ tên, vai trò, phòng ban, tổ chức khách hàng, trạng thái hoạt động).
- **`departments`**: Lưu danh mục phòng ban nội bộ PGS.
- **`customer_organizations`**: Lưu danh mục khách hàng doanh nghiệp.
- **`roles` / `permissions` / `role_permissions`**: Lưu vai trò hệ thống, quyền và liên kết phân quyền.
- **`audit_logs`**: Lịch sử hoạt động ghi nhận thay đổi nhạy cảm (phân quyền, đổi trạng thái).
- **`notifications` / `notification_recipients` / `notification_preferences` / `notification_deliveries`**: Hệ thống lưu và phân phối thông báo.

## 2. Quy trình Cập nhật Database
1. Sửa đổi schema tại file `packages/database/src/schema.ts`.
2. Chạy `pnpm db:generate` tại thư mục root để sinh file sql migration mới.
3. Review kỹ tệp `.sql` được sinh ra.
4. Chạy `pnpm db:migrate:local` để cập nhật database kiểm thử local.
5. **Tuyệt đối không tự động chạy migration lên production cloud** khi chưa có phê duyệt từ quản trị hệ thống.
