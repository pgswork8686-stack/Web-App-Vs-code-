import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import { DatabaseService } from '../database/database.service';
import { AuditService } from '../audit/audit.service';
import { UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';

describe('AuthService verifyAndGetProfile', () => {
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
              account_type: 'INTERNAL',
              status: 'PENDING_ASSIGNMENT',
            }]),
          }),
        }),
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([{ code: 'user.view' }]),
            }),
          }),
        }),
      },
    };

    mockAuditService = {
      log: vi.fn().mockResolvedValue(true),
    };

    authService = new AuthService(mockDbService as any, mockAuditService as any);

    // Mock Supabase admin client auth.getUser
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
      },
    };
  });

  it('should throw UnauthorizedException if token verification fails', async () => {
    authService['supabaseAdminClient'].auth.getUser = vi.fn().mockResolvedValue({
      data: { user: null },
      error: new Error('Invalid token'),
    });

    await expect(authService.verifyAndGetProfile('invalid-token')).rejects.toThrow(
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

    await expect(authService.verifyAndGetProfile('valid-token')).rejects.toThrow(
      UnprocessableEntityException
    );
  });

  it('should normalize email to lowercase when creating a profile', async () => {
    mockDbService.db.query.profiles.findFirst.mockResolvedValue(null);

    const result = await authService.verifyAndGetProfile('valid-token');

    expect(result.email).toBe('test@pgsagency.vn');
    expect(mockDbService.db.insert).toHaveBeenCalled();
  });
});
