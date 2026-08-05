# Workspace Rules for PGS Hub

Các quy tắc kỹ thuật và nghiệp vụ bắt buộc đối với tất cả AI Agents làm việc trên dự án PGS Hub.

## Tech Stack & Tooling
- **Package Manager**: Chỉ sử dụng `pnpm`. Tuyệt đối không dùng `npm` hoặc `yarn`. Không sinh file `package-lock.json` hay `yarn.lock`.
- **Database**: Sử dụng **Drizzle ORM** kết hợp **Supabase PostgreSQL**. Không cài đặt hay sử dụng Prisma.
- **Backend API**: NestJS chạy trên **Fastify adapter**. Không dùng Express adapter.
- **Frontend**: Next.js Web App duy nhất tại `apps/web`. Không chia nhỏ thành nhiều apps riêng biệt cho Admin/Client.
- **Authentication**: Chỉ sử dụng **Supabase Auth** làm nền tảng xác thực duy nhất. Phía Client chỉ hiển thị nút đăng nhập qua **Google OAuth**. Không hỗ trợ email/password, magic link hay các provider khác trong Web App.

## Business Rules & Access Control
- **Roles**: Chỉ có 5 vai trò chính xác: `ADMIN`, `MANAGER`, `EMPLOYEE`, `ACCOUNTANT`, `CLIENT`. Không tạo `SUPER_ADMIN`, `CLIENT_OWNER`, `CLIENT_MEMBER` hay `VIEWER`.
- **Workspace Model**: Không triển khai multi-workspace switcher trong MVP. Người dùng đăng nhập chỉ được liên kết trực tiếp với vai trò của mình.
- **User Activation Flow**:
  1. Google OAuth đăng nhập.
  2. Tạo profile mới có trạng thái `PENDING_ASSIGNMENT` (vai trò, phòng ban, tổ chức đều là null).
  3. User bị chặn và chuyển hướng về `/pending-access`.
  4. Admin gán vai trò (`role_id`), phòng ban (`department_id` cho nhân sự nội bộ) hoặc tổ chức khách hàng (`customer_organization_id` cho khách hàng), và chuyển trạng thái sang `ACTIVE`.
- **Authorization**:
  - Không kiểm tra vai trò đơn lẻ trực tiếp tại React components.
  - Phải kiểm tra quyền dựa trên permission mapping được quản lý tại backend.
  - Mỗi REST query phải được kiểm tra scope (ví dụ: chỉ xem dữ liệu phòng ban của mình, chỉ xem dự án liên quan).

## Database Security
- RLS (Row-Level Security) phải được bật trên tất cả các bảng public trong Supabase.
- Không viết các policy dạng `USING (true)` cho bảng nhạy cảm.
- JWT role metadata không được dùng làm nguồn phân quyền duy nhất. Mọi truy vấn từ backend phải dựa trên permissions thực tế trong DB.
- **Không tự động apply migrations** trực tiếp lên production cloud. Các migration chỉ được chạy local và chờ review/approval.
