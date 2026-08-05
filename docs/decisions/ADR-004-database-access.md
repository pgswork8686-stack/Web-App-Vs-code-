# ADR-004: Phân tách tầng truy cập Database giữa API và Web

## Ngữ cảnh (Context)
Supabase PostgREST API cho phép client gọi trực tiếp database. Cần quyết định giữa client-side data fetching (gọi database qua Supabase JS SDK) và server-side API fetching (đi qua NestJS API).

## Quyết định (Decision)
**Web App không được phép gọi trực tiếp vào bảng nghiệp vụ** (profiles, projects, tasks, attendance...) bằng Supabase JS client. Toàn bộ truy vấn nghiệp vụ phải đi qua NestJS API với Bearer token xác thực.

Supabase JS client ở phía Web chỉ được dùng để:
- Khởi chạy Google OAuth flow
- Nhận session callback và quản lý session cookies
- Lấy access token để gắn vào header khi gọi API

## Hệ quả (Consequences)
- Lợi ích: Toàn bộ business logic và access control nằm trong một lớp duy nhất (API), dễ audit, test và bảo mật.
- Khó khăn: Mỗi tính năng đều cần route ở cả hai phía (Next.js page và NestJS controller), tăng khối lượng code boilerplate.
