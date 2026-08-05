import { SystemRole } from '@pgs/permissions';

export type ProfileStatus = 'PENDING_ASSIGNMENT' | 'ACTIVE' | 'SUSPENDED' | 'DISABLED';
export type AccountType = 'INTERNAL' | 'CLIENT';

export interface UserProfile {
  id: string;
  auth_user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  account_type: AccountType;
  role_id: string | null;
  role_code?: SystemRole | null;
  department_id: string | null;
  customer_organization_id: string | null;
  status: ProfileStatus;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  is_demo: boolean;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_demo: boolean;
  created_at: string;
}

export interface CustomerOrganization {
  id: string;
  code: string;
  name: string;
  description: string | null;
  is_demo: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_profile_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  before_data: Record<string, any> | null;
  after_data: Record<string, any> | null;
  metadata: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  request_id: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  event_type: string;
  title: string;
  body: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  actor_profile_id: string | null;
  entity_type: string | null;
  entity_id: string | null;
  action_url: string | null;
  created_at: string;
}

export interface NotificationRecipient {
  id: string;
  notification_id: string;
  profile_id: string;
  read_at: string | null;
  handled_at: string | null;
  archived_at: string | null;
}
