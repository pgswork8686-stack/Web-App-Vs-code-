export interface VerifiedAuthUser {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export interface CurrentProfileContext {
  id: string;
  auth_user_id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  account_type: 'INTERNAL' | 'CLIENT' | null;
  status: 'PENDING_ASSIGNMENT' | 'ACTIVE' | 'SUSPENDED' | 'DISABLED';
  last_login_at: Date | null;
  role_id: string | null;
  department_id: string | null;
  customer_organization_id: string | null;
  is_demo: boolean;
  created_at: Date;
  updated_at: Date;
  role: {
    id: string;
    code: 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'ACCOUNTANT' | 'CLIENT';
    name: string;
  } | null;
  department: {
    id: string;
    code: string;
    name: string;
  } | null;
  customerOrganization: {
    id: string;
    code: string;
    name: string;
  } | null;
  permissions: string[];
}
