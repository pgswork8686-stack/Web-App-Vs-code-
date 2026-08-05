import { getDb } from './index';
import { profiles, roles, auditLogs } from './schema';
import { eq, and } from 'drizzle-orm';

import * as path from 'path';
import * as dotenv from 'dotenv';

// Load env from root workspace
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function main() {
  const emailArgIdx = process.argv.indexOf('--email');
  if (emailArgIdx === -1 || !process.argv[emailArgIdx + 1]) {
    console.error('Lỗi: Yêu cầu cung cấp email qua tham số --email <email>');
    process.exit(1);
  }

  const email = process.argv[emailArgIdx + 1].trim().toLowerCase();
  const connStr = process.env.DATABASE_URL;
  if (!connStr) {
    console.error('Lỗi bảo mật: Biến môi trường DATABASE_URL bị thiếu.');
    process.exit(1);
  }
  const db = getDb(connStr);

  console.log(`Đang kiểm tra cơ sở dữ liệu để phân quyền Admin cho email: ${email}...`);

  // 1. Check if an active ADMIN already exists
  const adminRole = await db.query.roles.findFirst({
    where: eq(roles.code, 'ADMIN'),
  });

  if (!adminRole) {
    console.error('Lỗi: Chưa seed danh mục vai trò. Vui lòng chạy seed hệ thống trước.');
    process.exit(1);
  }

  const existingAdmins = await db.query.profiles.findMany({
    where: and(
      eq(profiles.role_id, adminRole.id),
      eq(profiles.status, 'ACTIVE')
    ),
  });

  if (existingAdmins.length > 0) {
    console.error('Lỗi bảo mật: Đã tồn tại tài khoản ADMIN đang ACTIVE trong hệ thống. Không thể chạy bootstrap.');
    process.exit(1);
  }

  // 2. Check if the profile exists
  const targetProfile = await db.query.profiles.findFirst({
    where: eq(profiles.email, email),
  });

  if (!targetProfile) {
    console.error(`Lỗi: Không tìm thấy hồ sơ với email "${email}". Người dùng cần đăng nhập qua Google OAuth trước để khởi tạo hồ sơ.`);
    process.exit(1);
  }

  console.log('\n--- THÔNG TIN THAY ĐỔI DỰ KIẾN ---');
  console.log(`Hồ sơ: ${targetProfile.full_name} (${targetProfile.email})`);
  console.log(`Trạng thái hiện tại: ${targetProfile.status} (Vai trò: ${targetProfile.role_id || 'Chưa gán'})`);
  console.log(`Trạng thái mới: ACTIVE (Vai trò: ADMIN)`);
  console.log('----------------------------------\n');

  if (process.argv.includes('--confirm')) {
    // Perform update
    await db.transaction(async (tx) => {
      await tx.update(profiles)
        .set({
          role_id: adminRole.id,
          status: 'ACTIVE',
          account_type: 'INTERNAL',
          updated_at: new Date(),
        })
        .where(eq(profiles.id, targetProfile.id));

      await tx.insert(auditLogs)
        .values({
          action: 'system.bootstrap_admin',
          entity_type: 'profiles',
          entity_id: targetProfile.id,
          after_data: { role_code: 'ADMIN', status: 'ACTIVE' },
          metadata: { bootstrapped_by_cli: true },
        });
    });

    console.log(`\nThành công! Đã chuyển đổi người dùng "${email}" thành ADMIN ở trạng thái ACTIVE.`);
  } else {
    console.log('Vui lòng thêm tham số --confirm vào lệnh để thực thi thay đổi.');
  }
}

main().catch((err) => {
  console.error('Lỗi không xác định:', err);
  process.exit(1);
});
