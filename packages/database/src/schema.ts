import { pgTable, uuid, text, boolean, timestamp, jsonb, primaryKey, integer, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Departments
export const departments = pgTable('departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  is_demo: boolean('is_demo').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Customer Organizations
export const customerOrganizations = pgTable('customer_organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  is_demo: boolean('is_demo').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Roles
export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(), // ADMIN, MANAGER, EMPLOYEE, ACCOUNTANT, CLIENT
  name: text('name').notNull(),
  description: text('description'),
  is_system: boolean('is_system').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// 4. Permissions
export const permissions = pgTable('permissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(), // e.g. user.view, user.manage
  name: text('name').notNull(),
  description: text('description'),
  module: text('module').notNull(), // user, department, project, v.v.
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// 5. Role Permissions Junction
export const rolePermissions = pgTable('role_permissions', {
  role_id: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  permission_id: uuid('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.role_id, table.permission_id] }),
}));

// 6. Profiles (Business User profile mapped to Supabase auth.users)
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  auth_user_id: uuid('auth_user_id').notNull().unique(),
  email: text('email').notNull().unique(),
  full_name: text('full_name'),
  avatar_url: text('avatar_url'),
  account_type: text('account_type').notNull(), // INTERNAL, CLIENT
  role_id: uuid('role_id').references(() => roles.id, { onDelete: 'set null' }),
  department_id: uuid('department_id').references(() => departments.id, { onDelete: 'set null' }),
  customer_organization_id: uuid('customer_organization_id').references(() => customerOrganizations.id, { onDelete: 'set null' }),
  status: text('status').default('PENDING_ASSIGNMENT').notNull(), // PENDING_ASSIGNMENT, ACTIVE, SUSPENDED, DISABLED
  last_login_at: timestamp('last_login_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  created_by: uuid('created_by'),
  updated_by: uuid('updated_by'),
  is_demo: boolean('is_demo').default(false).notNull(),
});

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
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// 8. Notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  event_type: text('event_type').notNull(), // e.g. task.assigned, leave.approved
  title: text('title').notNull(),
  body: text('body').notNull(),
  priority: text('priority').default('NORMAL').notNull(), // LOW, NORMAL, HIGH
  actor_profile_id: uuid('actor_profile_id').references(() => profiles.id, { onDelete: 'set null' }),
  entity_type: text('entity_type'),
  entity_id: uuid('entity_id'),
  action_url: text('action_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// 9. Notification Recipients
export const notificationRecipients = pgTable('notification_recipients', {
  id: uuid('id').primaryKey().defaultRandom(),
  notification_id: uuid('notification_id').notNull().references(() => notifications.id, { onDelete: 'cascade' }),
  profile_id: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  read_at: timestamp('read_at'),
  handled_at: timestamp('handled_at'),
  archived_at: timestamp('archived_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// 10. Notification Preferences
export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  profile_id: uuid('profile_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  event_type: text('event_type').notNull(),
  channel: text('channel').notNull(), // in_app, email
  enabled: boolean('enabled').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  uniq_pref: uniqueIndex('uniq_profile_event_channel').on(table.profile_id, table.event_type, table.channel),
}));

// 11. Notification Deliveries
export const notificationDeliveries = pgTable('notification_deliveries', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipient_id: uuid('recipient_id').notNull().references(() => notificationRecipients.id, { onDelete: 'cascade' }),
  channel: text('channel').notNull(), // in_app, email
  delivery_status: text('delivery_status').notNull(), // PENDING, SENT, FAILED
  failure_reason: text('failure_reason'),
  retry_count: integer('retry_count').default(0).notNull(),
  sent_at: timestamp('sent_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
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
