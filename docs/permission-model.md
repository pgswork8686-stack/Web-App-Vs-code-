# Mô hình Phân quyền - PGS Hub Authorization Model

Mô hình kiểm soát truy cập (Access Control) dựa trên vai trò (Role-Based Access Control) phối hợp với quyền cụ thể (Permission-Based Access Control) tại API backend.

## 1. 5 Vai trò Hệ thống chính xác
Hệ thống PGS Hub quy định chính xác 5 vai trò (không tạo thêm):
- `ADMIN`: Quản trị viên hệ thống có toàn quyền cấu hình, phân vai trò, xem audit log.
- `MANAGER`: Trưởng phòng ban quản lý chấm công, nghỉ phép của nhân sự nội bộ, quản lý deliverables dự án.
- `EMPLOYEE`: Nhân sự thực hiện chấm công, nộp nghỉ phép, báo cáo công việc của cá nhân.
- `ACCOUNTANT`: Kế toán viên theo dõi tính lương, kỳ công, công nợ hóa đơn.
- `CLIENT`: Khách hàng đại lý theo dõi tiến độ dự án, duyệt deliverables.

## 2. Kiểm soát Quyền hạn (Access Control Enforcement)
- **Kiểm tra ở Backend**: Quyền hạn được kiểm tra tại API bằng Decorator `@RequirePermissions(...)` phối hợp với `PermissionGuard`.
- **Query Scopes**: Bên cạnh kiểm tra quyền tĩnh, NestJS API thực hiện lọc dữ liệu theo ngữ cảnh của user (ví dụ: `EMPLOYEE` chỉ xem thông báo và thông tin lương của chính họ; `MANAGER` xem dữ liệu của phòng ban được gán).
- **Frontend**: Web App sử dụng permissions trả về từ `/auth/me` để điều khiển hiển thị menu trên App Shell (ẩn/hiện liên kết điều hướng).
