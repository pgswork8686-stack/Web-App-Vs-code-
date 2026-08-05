import { describe, it, expect } from 'vitest';
import { UpdateUserAccessSchema } from '@pgs/validation';
import { v4 as uuidv4 } from 'uuid';

describe('UpdateUserAccessSchema validation rules', () => {
  const validDeptId = uuidv4();
  const validOrgId = uuidv4();

  it('should accept valid INTERNAL ADMIN access with optional department', () => {
    const input = {
      account_type: 'INTERNAL',
      role_code: 'ADMIN',
      department_id: null,
      customer_organization_id: null,
    };
    const parsed = UpdateUserAccessSchema.safeParse(input);
    expect(parsed.success).toBe(true);
  });

  it('should reject INTERNAL ADMIN access if customer_organization_id is set', () => {
    const input = {
      account_type: 'INTERNAL',
      role_code: 'ADMIN',
      department_id: null,
      customer_organization_id: validOrgId,
    };
    const parsed = UpdateUserAccessSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it('should reject INTERNAL with CLIENT role', () => {
    const input = {
      account_type: 'INTERNAL',
      role_code: 'CLIENT',
      department_id: validDeptId,
      customer_organization_id: null,
    };
    const parsed = UpdateUserAccessSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it('should reject INTERNAL if customer_organization_id is provided', () => {
    const input = {
      account_type: 'INTERNAL',
      role_code: 'EMPLOYEE',
      department_id: validDeptId,
      customer_organization_id: validOrgId,
    };
    const parsed = UpdateUserAccessSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it('should reject INTERNAL (except ADMIN) if department_id is missing', () => {
    const input = {
      account_type: 'INTERNAL',
      role_code: 'EMPLOYEE',
      department_id: null,
      customer_organization_id: null,
    };
    const parsed = UpdateUserAccessSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it('should accept valid CLIENT access', () => {
    const input = {
      account_type: 'CLIENT',
      role_code: 'CLIENT',
      department_id: null,
      customer_organization_id: validOrgId,
    };
    const parsed = UpdateUserAccessSchema.safeParse(input);
    expect(parsed.success).toBe(true);
  });

  it('should reject CLIENT if role_code is not CLIENT', () => {
    const input = {
      account_type: 'CLIENT',
      role_code: 'EMPLOYEE',
      department_id: null,
      customer_organization_id: validOrgId,
    };
    const parsed = UpdateUserAccessSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it('should reject CLIENT if customer_organization_id is missing', () => {
    const input = {
      account_type: 'CLIENT',
      role_code: 'CLIENT',
      department_id: null,
      customer_organization_id: null,
    };
    const parsed = UpdateUserAccessSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it('should reject CLIENT if department_id is set', () => {
    const input = {
      account_type: 'CLIENT',
      role_code: 'CLIENT',
      department_id: validDeptId,
      customer_organization_id: validOrgId,
    };
    const parsed = UpdateUserAccessSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });
});
