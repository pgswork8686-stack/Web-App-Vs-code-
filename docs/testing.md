# Tài liệu Kiểm thử - PGS Hub Testing Guide

Quy định và cấu trúc kiểm thử cho dự án PGS Hub.

## 1. Các cấp độ kiểm thử
- **Unit test**: Kiểm thử logic biệt lập cho permissions, validation schemas, controllers và services.
- **Integration test**: Kiểm thử luồng trao đổi dữ liệu API thực tế (như đăng nhập, cập nhật phân quyền, lấy danh sách thông báo).
- **Smoke test**: Kiểm thử kiểm tra giao diện bằng Playwright/Vitest (như trang đăng nhập, shell giao diện).

## 2. Lệnh chạy kiểm thử
Chạy toàn bộ test suites trong các workspaces:
```bash
pnpm test
```

## 3. Quy chuẩn kiểm thử
- Không skipped hoặc bỏ qua (mocking cẩu thả) các bài test kiểm thử bảo mật phân quyền.
- Test case phân quyền phải kiểm tra cả trường hợp thành công (Admin truy cập được) và thất bại (Employee gọi Admin API bị từ chối 403).
