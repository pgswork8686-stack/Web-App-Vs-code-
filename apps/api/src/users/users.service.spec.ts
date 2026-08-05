import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UsersService } from './users.service';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let usersService: UsersService;
  let mockDbService: any;
  let mockAuditService: any;

  beforeEach(() => {
    // Mock database transaction and query interface
    mockDbService = {
      db: {
        transaction: vi.fn(async (cb) => {
          return cb(mockDbService.db);
        }),
        query: {
          profiles: {
            findFirst: vi.fn(),
          },
          roles: {
            findFirst: vi.fn(),
          },
          departments: {
            findFirst: vi.fn(),
          },
          customerOrganizations: {
            findFirst: vi.fn(),
          },
        },
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              returning: vi.fn().mockResolvedValue([{
                id: 'profile-123',
                email: 'user@pgsagency.vn',
                status: 'ACTIVE',
                account_type: 'INTERNAL',
                role_id: 'role-123',
              }]),
            }),
          }),
        }),
      },
    };

    mockAuditService = {
      logWithTransaction: vi.fn().mockResolvedValue(true),
    };

    usersService = new UsersService(mockDbService as any, mockAuditService as any);
  });

  describe('updateAccess', () => {
    it('should throw NotFoundException if profile does not exist', async () => {
      mockDbService.db.query.profiles.findFirst.mockResolvedValue(null);

      await expect(
        usersService.updateAccess('profile-123', {
          account_type: 'INTERNAL',
          role_code: 'EMPLOYEE',
          department_id: null,
          customer_organization_id: null,
        }, 'actor-123')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if role does not exist', async () => {
      mockDbService.db.query.profiles.findFirst.mockResolvedValue({ id: 'profile-123' });
      mockDbService.db.query.roles.findFirst.mockResolvedValue(null);

      await expect(
        usersService.updateAccess('profile-123', {
          account_type: 'INTERNAL',
          role_code: 'EMPLOYEE',
          department_id: null,
          customer_organization_id: null,
        }, 'actor-123')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if department does not exist', async () => {
      mockDbService.db.query.profiles.findFirst.mockResolvedValue({ id: 'profile-123' });
      mockDbService.db.query.roles.findFirst.mockResolvedValue({ id: 'role-123' });
      mockDbService.db.query.departments.findFirst.mockResolvedValue(null);

      await expect(
        usersService.updateAccess('profile-123', {
          account_type: 'INTERNAL',
          role_code: 'EMPLOYEE',
          department_id: 'dept-invalid',
          customer_organization_id: null,
        }, 'actor-123')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should throw ConflictException if profile is incomplete when activating', async () => {
      // Missing role_id and account_type
      mockDbService.db.query.profiles.findFirst.mockResolvedValue({
        id: 'profile-123',
        status: 'PENDING_ASSIGNMENT',
        role_id: null,
        account_type: null,
      });

      await expect(
        usersService.updateStatus('profile-123', { status: 'ACTIVE' }, 'actor-123')
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if CLIENT has department assigned', async () => {
      mockDbService.db.query.profiles.findFirst.mockResolvedValue({
        id: 'profile-123',
        status: 'PENDING_ASSIGNMENT',
        role_id: 'role-123',
        account_type: 'CLIENT',
        customer_organization_id: 'org-123',
        department_id: 'dept-123', // Invalid for client
        role: { code: 'CLIENT' },
      });

      await expect(
        usersService.updateStatus('profile-123', { status: 'ACTIVE' }, 'actor-123')
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if Employee has no department', async () => {
      mockDbService.db.query.profiles.findFirst.mockResolvedValue({
        id: 'profile-123',
        status: 'PENDING_ASSIGNMENT',
        role_id: 'role-123',
        account_type: 'INTERNAL',
        customer_organization_id: null,
        department_id: null, // Invalid for employee
        role: { code: 'EMPLOYEE' },
      });

      await expect(
        usersService.updateStatus('profile-123', { status: 'ACTIVE' }, 'actor-123')
      ).rejects.toThrow(BadRequestException);
    });
  });
});
