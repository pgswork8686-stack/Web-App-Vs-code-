# Tài liệu Phát triển - PGS Hub Development Guide

Hướng dẫn chi tiết dành cho lập trình viên phát triển PGS Hub.

## 1. Yêu cầu Hệ thống
- **Node.js**: Phiên bản LTS `20.x` hoặc `24.x`.
- **pnpm**: Phiên bản `11.x` trở lên (bắt buộc).

## 2. Thiết lập Dự án
1. Cài đặt dependencies:
   ```bash
   pnpm install --ignore-scripts
   ```
2. Cấu hình biến môi trường local ở file `.env.local` hoặc `.env` tại thư mục root.
3. Sinh SQL database:
   ```bash
   pnpm db:generate
   ```
4. Seed dữ liệu:
   ```bash
   pnpm db:seed
   ```

## 3. Quy chuẩn viết Code
- **TypeScript strict mode**: Bắt buộc bật và vượt qua kiểm thử kiểu dữ liệu.
- **Không dùng any**: Hạn chế tối đa sử dụng kiểu dữ liệu `any`. Sử dụng kiểu dữ liệu rõ ràng trong thư mục `@pgs/types`.
- **Imports**: Sử dụng path aliases `@/*` đã được thiết lập ở Next.js để code trông gọn gàng và tránh lỗi liên kết tương đối.
- **RLS**: Mọi bảng mới phải được thiết lập Row-Level Security.
