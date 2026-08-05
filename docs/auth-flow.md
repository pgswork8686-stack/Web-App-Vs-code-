# Quy trình Xác thực - PGS Hub Authentication Flow

Tài liệu mô tả luồng xác thực người dùng sử dụng Supabase Auth kết hợp Google OAuth.

## 1. Biểu đồ Quy trình (Authentication Flow)

```mermaid
sequenceDiagram
  autonumber
  User->>Web: Bấm "Đăng nhập bằng Google"
  Web->>Supabase: Yêu cầu đăng nhập Google OAuth
  Supabase->>Google: Chuyển hướng xác thực Google
  Google-->>Supabase: Trả về OAuth Code/Session
  Supabase-->>Web: Trả về Session (Access Token JWT)
  Web->>API: Gửi POST /auth/bootstrap (Token)
  API->>API: Kiểm tra/Tạo profile (PENDING_ASSIGNMENT)
  API-->>Web: Hoàn tất bootstrap
  Web->>API: Gọi GET /auth/me (Bearer Token)
  API->>API: Lấy vai trò & permissions thực tế
  API-->>Web: Trả về Profile chi tiết
  alt Trạng thái PENDING_ASSIGNMENT
    Web->>User: Redirect về /pending-access
  else Trạng thái ACTIVE
    Web->>User: Redirect về Dashboard tương ứng vai trò
  end
```

## 2. Các điểm lưu ý quan trọng
- **Xác thực Google OAuth**: Phương thức duy nhất được hiển thị trên giao diện.
- **Trạng thái Mặc định**: Bất kỳ người dùng nào đăng ký mới đều nhận trạng thái `PENDING_ASSIGNMENT`. Admin phải phê duyệt trước khi họ có thể xem bất kỳ dữ liệu nào của công ty.
- **Xác minh JWT**: API NestJS sử dụng JWT Key của Supabase để kiểm tra tính hợp lệ của token trong Header `Authorization: Bearer <token>`.
