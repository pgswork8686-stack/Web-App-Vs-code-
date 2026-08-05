import { z } from 'zod';
import { SYSTEM_ROLES } from '@pgs/permissions';

export const UpdateUserAccessSchema = z.object({
  account_type: z.enum(['INTERNAL', 'CLIENT']),
  role_code: z.enum([SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.MANAGER, SYSTEM_ROLES.EMPLOYEE, SYSTEM_ROLES.ACCOUNTANT, SYSTEM_ROLES.CLIENT]),
  department_id: z.string().nullable().optional(),
  customer_organization_id: z.string().nullable().optional(),
}).refine((data) => {
  if (data.account_type === 'CLIENT') {
    return data.role_code === SYSTEM_ROLES.CLIENT && !!data.customer_organization_id;
  } else {
    // Internal user
    if (data.role_code === SYSTEM_ROLES.ADMIN) {
      return true; // Admin doesn't strictly need a department
    }
    return data.role_code !== SYSTEM_ROLES.CLIENT && !!data.department_id;
  }
}, {
  message: 'Ràng buộc phân quyền không hợp lệ (ví dụ: vai trò CLIENT yêu cầu tổ chức khách hàng; nhân sự nội bộ yêu cầu phòng ban)',
  path: ['role_code'],
});

export type UpdateUserAccessInput = z.infer<typeof UpdateUserAccessSchema>;

export const UpdateUserStatusSchema = z.object({
  status: z.enum(['PENDING_ASSIGNMENT', 'ACTIVE', 'SUSPENDED', 'DISABLED']),
});

export type UpdateUserStatusInput = z.infer<typeof UpdateUserStatusSchema>;

export const UuidSchema = z.string().uuid('ID không đúng định dạng UUID');

export const NotificationPreferenceSchema = z.object({
  channel: z.enum(['IN_APP', 'EMAIL']),
  enabled: z.boolean(),
});

export type NotificationPreferenceInput = z.infer<typeof NotificationPreferenceSchema>;

export const NotificationFilterSchema = z.object({
  status: z.enum(['ALL', 'UNREAD', 'READ', 'ARCHIVED']).default('ALL'),
});

export type NotificationFilterInput = z.infer<typeof NotificationFilterSchema>;

export const UpdateNotificationPreferencesSchema = z.object({
  preferences: z.array(z.object({
    event_type: z.string().min(1),
    channel: z.enum(['IN_APP', 'EMAIL']),
    enabled: z.boolean(),
  })),
});

export type UpdateNotificationPreferencesInput = z.infer<typeof UpdateNotificationPreferencesSchema>;

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  WEB_PORT: z.string().default('3000'),
  API_PORT: z.string().default('3001'),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  EMAIL_PROVIDER: z.string().optional(),
  EMAIL_FROM: z.string().email().optional(),
});

export type Env = z.infer<typeof EnvSchema>;
