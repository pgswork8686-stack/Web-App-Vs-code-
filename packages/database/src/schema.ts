import { pgTable, uuid, text, boolean, timestamp, jsonb, primaryKey, integer, uniqueIndex, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// Enums definitions
export const accountTypeEnum = pgEnum('account_type', ['INTERNAL', 'CLIENT']);
export const profileStatusEnum = pgEnum('profile_status', ['PENDING_ASSIGNMENT', 'ACTIVE', 'SUSPENDED', 'DISABLED']);
export const priorityEnum = pgEnum('notification_priority', ['LOW', 'NORMAL', 'HIGH']);
export const deliveryStatusEnum = pgEnum('delivery_status', ['PENDING', 'SENT', 'FAILED']);

// 1. Departments
export const departments = pgTable('departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  is_demo: boolean('is_demo').default(false).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 2. Customer Organizations
export const customerOrganizations = pgTable('customer_organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  is_demo: boolean('is_demo').default(false).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 3. Roles
export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(), // ADMIN, MANAGER, EMPLOYEE, ACCOUNTANT, CLIENT
  name: text('name').notNull(),
  description: text('description'),
  is_system: boolean('is_system').default(true).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 4. Permissions
export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(), // e.g. user.view, user.manage
  name: text('name').notNull(),
  description: text('description'),
  module: text('module').notNull(), // user, department, project, v.v.
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// 5. Role Permissions Junction
export const rolePermissions = pgTable('role_permissions', {
  role_id: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permission_id: uuid('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.role_id, table.permission_id] }),
  roleIdIdx: index('role_permissions_role_id_idx').on(table.role_id),
  permissionIdIdx: index('role_permissions_permission_id_idx').on(table.permission_id),
}));

// 6. Profiles (Business User profile mapped to Supabase auth.users)
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  auth_user_id: uuid('auth_user_id').notNull().unique(),
  email: text('email').notNull(),
  full_name: text('full_name'),
  avatar_url: text('avatar_url'),
  account_type: accountTypeEnum('account_type').notNull(), // INTERNAL, CLIENT
  role_id: uuid('role_id').references(() => roles.id, { onDelete: 'set null' }),
  department_id: uuid('department_id').references(() => departments.id, { onDelete: 'set null' }),
  customer_organization_id: uuid('customer_organization_id').references(() => customerOrganizations.id, { onDelete: 'set null' }),
  status: profileStatusEnum('status').default('PENDING_ASSIGNMENT').notNull(),
  last_login_at: timestamp('last_login_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  created_by: uuid('created_by'),
  updated_by: uuid('updated_by'),
  is_demo: boolean('is_demo').default(false).notNull(),
}, (table) => ({
  emailLowerIdx: uniqueIndex('profiles_email_lower_idx').on(sql`lower(${table.email})`),
  statusIdx: index('profiles_status_idx').on(table.status),
  roleIdIdx: index('profiles_role_id_idx').on(table.role_id),
  departmentIdIdx: index('profiles_department_id_idx').on(table.department_id),
  custOrgIdIdx: index('profiles_customer_org_id_idx').on(table.customer_organization_id),
}));

// 7. Audit Logs
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actor_profile_id: uuid('actor_profile_id').references(() => profiles.id, { onDelete: 'set null' }),
  action: text('action').notNull(), // e.g. user.assign_role, auth.login
  entity_type: text('entity_type'), // e.g. profiles, departments
  entity_id: uuid('entity_id'),
  before_data: jsonb('before_data'),
  after_data: jsonb('after_data'),
  metadata: jsonb('metadata'),
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  request_id: text('request_id'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  entityTypeIdx: index('audit_logs_entity_type_id_idx').on(table.entity_type, table.entity_id),
  createdAtIdx: index('audit_logs_created_at_idx').on(table.created_at),
  actorProfileIdIdx: index('audit_logs_actor_profile_id_idx').on(table.actor_profile_id),
}));

// 8. Notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  event_type: text('event_type').notNull(), // e.g. task.assigned, leave.approved
  title: text('title').notNull(),
  body: text('body').notNull(),
  priority: priorityEnum('priority').default('NORMAL').notNull(), // LOW, NORMAL, HIGH
  actor_profile_id: uuid('actor_profile_id').references(() => profiles.id, { onDelete: 'set null' }),
  entity_type: text('entity_type'),
  entity_id: uuid('entity_id'),
  action_url: text('action_url'),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  createdAtIdx: index('notifications_created_at_idx').on(table.created_at),
}));

// 9. Notification Recipients
export const notificationRecipients = pgTable('notification_recipients', {
  id: uuid('id').primaryKey().defaultRandom(),
  notification_id: uuid('notification_id').notNull().references(() => notifications.id, { onDelete: 'cascade' }),
  profile_id: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  read_at: timestamp('read_at', { withTimezone: true }),
  handled_at: timestamp('handled_at', { withTimezone: true }),
  archived_at: timestamp('archived_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniqRecipient: uniqueIndex('uniq_notification_recipient').on(table.notification_id, table.profile_id),
  profileReadIdx: index('notification_recipients_profile_read_idx').on(table.profile_id, table.read_at),
  profileHandledIdx: index('notification_recipients_profile_handled_idx').on(table.profile_id, table.handled_at),
}));

// 10. Notification Preferences
export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  profile_id: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  event_type: text('event_type').notNull(),
  channel: text('channel').notNull(), // IN_APP, EMAIL
  enabled: boolean('enabled').default(true).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  uniq_pref: uniqueIndex('uniq_profile_event_channel').on(table.profile_id, table.event_type, table.channel),
}));

// 11. Notification Deliveries
export const notificationDeliveries = pgTable('notification_deliveries', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipient_id: uuid('recipient_id').notNull().references(() => notificationRecipients.id, { onDelete: 'cascade' }),
  channel: text('channel').notNull(), // IN_APP, EMAIL
  delivery_status: deliveryStatusEnum('delivery_status').notNull(), // PENDING, SENT, FAILED
  failure_reason: text('failure_reason'),
  retry_count: integer('retry_count').default(0).notNull(),
  sent_at: timestamp('sent_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Relations Definitions
export const departmentsRelations = relations(departments, ({ many }) => ({
  profiles: many(profiles),
}));

export const customerOrganizationsRelations = relations(customerOrganizations, ({ many }) => ({
  profiles: many(profiles),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  rolePermissions: many(rolePermissions),
  profiles: many(profiles),
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, { fields: [rolePermissions.role_id], references: [roles.id] }),
  permission: one(permissions, { fields: [rolePermissions.permission_id], references: [permissions.id] }),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  role: one(roles, { fields: [profiles.role_id], references: [roles.id] }),
  department: one(departments, { fields: [profiles.department_id], references: [departments.id] }),
  customerOrganization: one(customerOrganizations, { fields: [profiles.customer_organization_id], references: [customerOrganizations.id] }),
  auditLogs: many(auditLogs),
  notificationsSent: many(notifications),
  notificationRecipients: many(notificationRecipients),
  notificationPreferences: many(notificationPreferences),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(profiles, { fields: [auditLogs.actor_profile_id], references: [profiles.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one, many }) => ({
  actor: one(profiles, { fields: [notifications.actor_profile_id], references: [profiles.id] }),
  recipients: many(notificationRecipients),
}));

export const notificationRecipientsRelations = relations(notificationRecipients, ({ one, many }) => ({
  notification: one(notifications, { fields: [notificationRecipients.notification_id], references: [notifications.id] }),
  profile: one(profiles, { fields: [notificationRecipients.profile_id], references: [profiles.id] }),
  deliveries: many(notificationDeliveries),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  profile: one(profiles, { fields: [notificationPreferences.profile_id], references: [profiles.id] }),
}));

export const notificationDeliveriesRelations = relations(notificationDeliveries, ({ one }) => ({
  recipient: one(notificationRecipients, { fields: [notificationDeliveries.recipient_id], references: [notificationRecipients.id] }),
}));
