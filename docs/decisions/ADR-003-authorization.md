# ADR-003: Quản lý và kiểm soát phân quyền dựa trên Backend Permissions

## Ngữ cảnh (Context)
Các vai trò khác nhau cần có các phạm vi truy cập dữ liệu nghiệp vụ khác nhau (ví dụ: Employee không thể xem bảng lương của người khác, Client chỉ xem được dự án của mình).

## Quyết định (Decision)
Thiết lập hệ thống phân quyền tĩnh dựa trên permission code được định nghĩa tập trung ở package `@pgs/permissions`. API Backend NestJS đóng vai trò là chốt chặn cuối cùng kiểm tra quyền hạn bằng Guards trước khi trả về dữ liệu. Frontend chỉ đóng vai trò ẩn/hiện các phần tử giao diện dựa trên quyền để tăng trải nghiệm người dùng.

## Hệ quả (Consequences)
- Lợi ích: Tránh việc kiểm tra vai trò cứng nhắc rải rác ở frontend, đảm bảo bảo mật chặt chẽ ở cấp độ API.
- Khó khăn: Cần quản lý đồng bộ danh sách permissions khi phát triển thêm các module nghiệp vụ mới ở các phase tiếp theo.
