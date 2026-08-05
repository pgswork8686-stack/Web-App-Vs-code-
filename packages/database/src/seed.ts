import * as path from 'path';
import * as dotenv from 'dotenv';

// Load env từ root workspace
dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { getDb } from './index';
import { roles, permissions, rolePermissions, departments, customerOrganizations } from './schema';
import { eq } from 'drizzle-orm';
import { PERMISSIONS, SYSTEM_ROLES, ROLE_PERMISSIONS_MAPPING } from '@pgs/permissions';

async function main() {
  const connStr = process.env.DIRECT_URL ||
                  process.env.DATABASE_URL ||
                  'postgresql://postgres:postgres@localhost:54322/postgres';
  const db = getDb(connStr);

  console.log('Đang chạy seed danh mục PGS Hub...');

  // 1. Seed Roles
  console.log('Seeding roles...');
  const roleIds: Record<string, string> = {};
  for (const roleCode of Object.values(SYSTEM_ROLES)) {
    const existing = await db.query.roles.findFirst({
      where: eq(roles.code, roleCode),
    });

    if (!existing) {
      const [inserted] = await db.insert(roles).values({
        code: roleCode,
        name: `Vai trò ${roleCode}`,
        description: `Hệ thống vai trò ${roleCode} PGS Hub`,
        is_system: true,
      }).returning();
      roleIds[roleCode] = inserted.id;
    } else {
      roleIds[roleCode] = existing.id;
    }
  }

  // 2. Seed Permissions
  console.log('Seeding permissions...');
  const permissionIds: Record<string, string> = {};
  for (const permCode of Object.values(PERMISSIONS)) {
    const existing = await db.query.permissions.findFirst({
      where: eq(permissions.code, permCode),
    });

    const moduleName = permCode.split('.')[0] || 'general';

    if (!existing) {
      const [inserted] = await db.insert(permissions).values({
        code: permCode,
        name: `Quyền ${permCode}`,
        description: `Cho phép thực hiện ${permCode}`,
        module: moduleName,
      }).returning();
      permissionIds[permCode] = inserted.id;
    } else {
      permissionIds[permCode] = existing.id;
    }
  }

  // 3. Map Permissions to Roles
  console.log('Mapping permissions to roles...');
  for (const [roleCode, permCodes] of Object.entries(ROLE_PERMISSIONS_MAPPING)) {
    const roleId = roleIds[roleCode];
    if (!roleId) continue;

    for (const permCode of permCodes) {
      const permissionId = permissionIds[permCode];
      if (!permissionId) continue;

      const existingMapping = await db.query.rolePermissions.findFirst({
        where: (rp, { eq, and }) => and(eq(rp.role_id, roleId), eq(rp.permission_id, permissionId)),
      });

      if (!existingMapping) {
        await db.insert(rolePermissions).values({
          role_id: roleId,
          permission_id: permissionId,
        });
      }
    }
  }

  // 4. Seed Demo Departments
  console.log('Seeding demo departments...');
  const demoDepts = [
    { code: 'WEB_DESIGN', name: 'Thiết kế Website' },
    { code: 'SEO', name: 'SEO' },
    { code: 'FB_ADMIN', name: 'Quản trị Facebook' },
    { code: 'YT_ADMIN', name: 'Quản trị YouTube' },
  ];

  for (const dept of demoDepts) {
    const existing = await db.query.departments.findFirst({
      where: eq(departments.code, dept.code),
    });

    if (!existing) {
      await db.insert(departments).values({
        code: dept.code,
        name: dept.name,
        is_demo: true,
      });
    }
  }

  // 5. Seed Demo Customer Organization
  console.log('Seeding demo customer organization...');
  const existingOrg = await db.query.customerOrganizations.findFirst({
    where: eq(customerOrganizations.code, 'DEMO_CLIENT'),
  });

  if (!existingOrg) {
    await db.insert(customerOrganizations).values({
      code: 'DEMO_CLIENT',
      name: 'Khách hàng Demo',
      is_demo: true,
    });
  }

  console.log('Hoàn thành seed dữ liệu hệ thống thành công!');
}

main().catch((err) => {
  console.error('Lỗi khi seed dữ liệu:', err);
  process.exit(1);
});
