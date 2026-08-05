import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import { UnauthorizedException, UnprocessableEntityException, ConflictException } from '@nestjs/common';

describe('AuthService (Refactored)', () => {
  let authService: AuthService;
  let mockDbService: any;
  let mockAuditService: any;

  beforeEach(() => {
    mockDbService = {
      db: {
        query: {
          profiles: {
            findFirst: vi.fn(),
          },
        },
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{
              id: 'profile-123',
              auth_user_id: 'user-123',
              email: 'test@pgsagency.vn',
              full_name: 'Test User',
              avatar_url: null,
              account_type: null,
              status: 'PENDING_ASSIGNMENT',
            }]),
          }),
        }),
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([{}]),
          }),
        }),
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      },
    };

    mockAuditService = {
      log: vi.fn().mockResolvedValue(true),
      logWithTransaction: vi.fn().mockResolvedValue(true),
    };

    authService = new AuthService(mockDbService as any, mockAuditService as any);

    authService['supabaseAdminClient'] = {
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: 'user-123',
              email: 'TEST@PGSAgency.vn', // Uppercase to test normalization
              user_metadata: {
                full_name: 'Test User',
              },
            },
          },
          error: null,
        }),
      } as any,
    } as any;
  });

  describe('verifyAccessToken', () => {
    it('should throw UnauthorizedException if token verification fails', async () => {
      authService['supabaseAdminClient'].auth.getUser = vi.fn().mockResolvedValue({
        data: { user: null },
        error: new Error('Invalid token'),
      });

      await expect(authService.verifyAccessToken('invalid-token')).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw UnprocessableEntityException if user has no email', async () => {
      authService['supabaseAdminClient'].auth.getUser = vi.fn().mockResolvedValue({
        data: {
          user: { id: 'user-123', email: undefined },
        },
        error: null,
      });

      await expect(authService.verifyAccessToken('valid-token')).rejects.toThrow(
        UnprocessableEntityException
      );
    });

    it('should return VerifiedAuthUser details with lowercase email', async () => {
      const result = await authService.verifyAccessToken('valid-token');
      expect(result.id).toBe('user-123');
      expect(result.email).toBe('test@pgsagency.vn');
    });
  });

  describe('findProfileByAuthUserId', () => {
    it('should query only and return profile with permissions', async () => {
      mockDbService.db.query.profiles.findFirst.mockResolvedValue({
        id: 'profile-123',
        auth_user_id: 'user-123',
        email: 'test@pgsagency.vn',
        account_type: 'INTERNAL',
        status: 'ACTIVE',
        role_id: 'role-123',
      });

      const result = await authService.findProfileByAuthUserId('user-123');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('profile-123');
      expect(mockDbService.db.insert).not.toHaveBeenCalled();
    });
  });

  describe('bootstrapProfile', () => {
    it('should be idempotent and not reset role/status if profile exists', async () => {
      // Simulate profile exists
      mockDbService.db.query.profiles.findFirst.mockResolvedValue({
        id: 'profile-123',
        auth_user_id: 'user-123',
        email: 'test@pgsagency.vn',
        account_type: 'INTERNAL',
        status: 'ACTIVE',
        role_id: 'role-123',
      });

      const verifiedUser = {
        id: 'user-123',
        email: 'test@pgsagency.vn',
        fullName: 'Test User',
        avatarUrl: null,
      };

      const result = await authService.bootstrapProfile(verifiedUser);
      expect(result.status).toBe('ACTIVE');
      expect(mockDbService.db.insert).not.toHaveBeenCalled();
      expect(mockDbService.db.update).toHaveBeenCalled();
    });
  });

  describe('getRequiredProfile', () => {
    it('should throw ConflictException if profile is not bootstrapped', async () => {
      mockDbService.db.query.profiles.findFirst.mockResolvedValue(null);

      await expect(authService.getRequiredProfile('user-123')).rejects.toThrow(
        ConflictException
      );
    });
  });
});
