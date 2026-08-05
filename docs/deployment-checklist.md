# Danh mục Triển khai - PGS Hub Deployment Checklist

Danh sách các bước kiểm tra chất lượng & kỹ thuật bắt buộc trước khi triển khai hệ thống lên môi trường Staging/Production.

## 1. Môi trường Cơ sở dữ liệu (Supabase Cloud)
- [ ] Xác nhận dự án Supabase chính xác là `mpljxkaxkektcuvnosiq`.
- [ ] Bật tính năng Row-Level Security (RLS) trên toàn bộ bảng public.
- [ ] Áp dụng migrations SQL bằng cách review và chạy thông qua Supabase CLI hoặc giao diện SQL Editor.
- [ ] Seed các bảng vai trò hệ thống (`roles`) và quyền hạn (`permissions`) thành công.

## 2. Cấu hình Google OAuth
- [ ] Đăng ký ứng dụng trên Google Cloud Console.
- [ ] Cấu hình URI Redirect chính xác trong Supabase Dashboard (`https://mpljxkaxkektcuvnosiq.supabase.co/auth/v1/callback`).
- [ ] Cấu hình Callback URL local (`http://localhost:3000/auth/callback`) và production (`https://hub.pgsagency.vn/auth/callback`).

## 3. Web & API Backend Configuration
- [ ] Điền đầy đủ biến môi trường production ở server hosting.
- [ ] Kiểm tra CORS chỉ cho phép domain `hub.pgsagency.vn`.
- [ ] Bảo mật: Khóa API `service_role` chỉ tồn tại ở NestJS API backend và không bao giờ xuất hiện ở Next.js bundle.
