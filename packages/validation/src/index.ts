import { z } from 'zod';
import { SYSTEM_ROLES } from '@pgs/permissions';

export const UpdateUserAccessSchema = z.object({
  account_type: z.enum(['INTERNAL', 'CLIENT']),
  role_code: z.enum([SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.MANAGER, SYSTEM_ROLES.EMPLOYEE, SYSTEM_ROLES.ACCOUNTANT, SYSTEM_ROLES.CLIENT]),
  department_id: z.string().uuid('department_id must be a valid UUID').nullable().default(null),
  customer_organization_id: z.string().uuid('customer_organization_id must be a valid UUID').nullable().default(null),
}).superRefine((data, ctx) => {
  const { account_type, role_code, department_id, customer_organization_id } = data;

  if (account_type === 'INTERNAL') {
    if (role_code === SYSTEM_ROLES.CLIENT) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'role_code cannot be CLIENT for account_type INTERNAL',
        path: ['role_code'],
      });
    }

    if (customer_organization_id !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'customer_organization_id must be null for account_type INTERNAL',
        path: ['customer_organization_id'],
      });
    }

    if (role_code !== SYSTEM_ROLES.ADMIN && department_id === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'department_id is required for INTERNAL staff roles (except ADMIN)',
        path: ['department_id'],
      });
    }
  }

  if (account_type === 'CLIENT') {
    if (role_code !== SYSTEM_ROLES.CLIENT) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'role_code must be CLIENT for account_type CLIENT',
        path: ['role_code'],
      });
    }

    if (customer_organization_id === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'customer_organization_id is required for account_type CLIENT',
        path: ['customer_organization_id'],
      });
    }

    if (department_id !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'department_id must be null for account_type CLIENT',
        path: ['department_id'],
      });
    }
  }
}).transform((data) => {
  // Normalize unused fields to null
  return {
    account_type: data.account_type,
    role_code: data.role_code,
    department_id: data.account_type === 'CLIENT' ? null : data.department_id,
    customer_organization_id: data.account_type === 'INTERNAL' ? null : data.customer_organization_id,
  };
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
