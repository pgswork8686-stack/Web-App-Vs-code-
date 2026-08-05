# ADR-002: Sử dụng duy nhất Supabase Auth Google OAuth làm nền tảng xác thực

## Ngữ cảnh (Context)
Cần thiết lập hệ thống đăng nhập an toàn, tiện lợi cho cả nhân sự nội bộ của PGS Agency và đối tác khách hàng mà không tốn tài nguyên quản lý mật khẩu hay bảo mật email.

## Quyết định (Decision)
Lựa chọn **Supabase Auth** làm nền tảng xác thực, tích hợp duy nhất **Google OAuth** trên giao diện người dùng. Không hiển thị hay cho phép đăng ký tự do, đăng nhập qua mật khẩu, magic link hay các nhà cung cấp khác.

## Hệ quả (Consequences)
- Lợi ích: Tận dụng trực tiếp tài khoản Google của công ty hoặc cá nhân, giảm thiểu rủi ro rò rỉ mật khẩu.
- Khó khăn: Người dùng đăng nhập lần đầu tiên sẽ phải chờ quản trị viên phê duyệt phân vai trò trước khi có thể truy cập hệ thống nghiệp vụ chính.
