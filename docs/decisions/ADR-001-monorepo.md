# ADR-001: Sử dụng pnpm Monorepo và Turborepo

## Ngữ cảnh (Context)
Dự án PGS Hub bao gồm cả ứng dụng Frontend Web (Next.js) và Backend API (NestJS) cùng nhiều module dùng chung như định nghĩa vai trò, quyền, Zod validation và Drizzle schemas.

## Quyết định (Decision)
Quyết định xây dựng cấu trúc monorepo sử dụng **pnpm workspaces** làm trình quản lý gói duy nhất và **Turborepo** để chạy và đóng gói các pipelines nhằm tăng tốc độ phát triển và chia sẻ thư viện code dùng chung một cách nhanh chóng.

## Hệ quả (Consequences)
- Lợi ích: Tái sử dụng code hiệu quả, kiểm soát kiểu dữ liệu TypeScript đồng bộ trên cả client và server.
- Khó khăn: Cấu hình tsconfig và dependencies trong monorepo đòi hỏi độ chính xác cao để tránh lỗi load paths.
