# PGS Hub - Nền tảng Quản trị PGS Agency

PGS Hub là hệ thống quản lý đại lý, nhân sự nội bộ, chấm công và công việc được thiết kế tối ưu cho PGS Agency (hub.pgsagency.vn).

## Công nghệ sử dụng
- **Quản lý Monorepo**: `pnpm` workspace & `Turborepo`
- **Frontend**: Next.js 14 (React, Tailwind CSS, shadcn/ui)
- **Backend API**: NestJS (Fastify adapter)
- **Cơ sở dữ liệu**: Supabase PostgreSQL & Drizzle ORM
- **Xác thực**: Supabase Auth (Chỉ sử dụng Google OAuth)

## Cấu trúc dự án
```text
apps/
├── web/           # Next.js Web Application duy nhất
└── api/           # NestJS API Backend (Fastify)

packages/
├── database/      # Drizzle schemas, migrations & seeding
├── auth/          # Supabase Auth client factories
├── permissions/   # Phân quyền 5 vai trò & constants
├── validation/    # Zod schemas dùng chung
├── types/         # TypeScript types dùng chung
└── design-tokens/ # Cấu hình Tailwind theme, spacing, radius
```

## Bắt đầu nhanh

### 1. Thiết lập biến môi trường
Sao chép `.env.example` thành `.env.local` ở thư mục root và cập nhật thông tin:
```bash
cp .env.example .env.local
```

### 2. Cài đặt dependencies
Dự án sử dụng pnpm:
```bash
pnpm install --ignore-scripts
```

### 3. Chạy môi trường phát triển local
Khởi động đồng thời cả Next.js và NestJS:
```bash
pnpm dev
```

### 4. Cơ sở dữ liệu & Seed
Để sinh migration:
```bash
pnpm db:generate
```

Để apply migration local:
```bash
pnpm db:migrate:local
```

Để seed dữ liệu danh mục & phòng ban:
```bash
pnpm db:seed
```

### 5. Cấu hình Admin đầu tiên
Sau khi người dùng đăng nhập bằng Google OAuth lần đầu, hồ sơ dạng `PENDING_ASSIGNMENT` sẽ được tạo. Chạy lệnh sau ở terminal để gán quyền Admin:
```bash
pnpm bootstrap:admin --email user@pgsagency.vn --confirm
```
*(Thay `user@pgsagency.vn` bằng email thật của bạn)*
