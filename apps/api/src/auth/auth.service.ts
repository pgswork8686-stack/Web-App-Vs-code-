import { Injectable, UnauthorizedException, UnprocessableEntityException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { profiles, rolePermissions, permissions } from '@pgs/database';
import { eq } from '@pgs/database';
import { AuditService } from '../audit/audit.service';
import { createApiServiceRoleClient } from '@pgs/auth';
import { env } from '../config/env';
import { VerifiedAuthUser, CurrentProfileContext } from './auth.types';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private supabaseAdminClient: SupabaseClient;

  constructor(
    private readonly dbService: DatabaseService,
    private readonly auditService: AuditService
  ) {
    this.supabaseAdminClient = createApiServiceRoleClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  // 1. Verify Access Token Only (No Database creation)
  async verifyAccessToken(token: string): Promise<VerifiedAuthUser> {
    const { data: { user }, error } = await this.supabaseAdminClient.auth.getUser(token);
    if (error || !user) {
      throw new UnauthorizedException('AUTH_TOKEN_INVALID');
    }

    if (!user.email) {
      throw new UnprocessableEntityException('AUTH_EMAIL_REQUIRED');
    }

    return {
      id: user.id,
      email: user.email.toLowerCase(),
      fullName: user.user_metadata?.full_name || null,
      avatarUrl: user.user_metadata?.avatar_url || null,
    };
  }

  // 2. Fetch Profile only (No Mutation)
  async findProfileByAuthUserId(authUserId: string): Promise<CurrentProfileContext | null> {
    const profile = await this.dbService.db.query.profiles.findFirst({
      where: eq(profiles.auth_user_id, authUserId),
      with: {
        role: true,
        department: true,
        customerOrganization: true,
      },
    });

    if (!profile) {
      return null;
    }

    let userPermissions: string[] = [];
    if (profile.role_id) {
      const perms = await this.dbService.db
        .select({ code: permissions.code })
        .from(rolePermissions)
        .innerJoin(permissions, eq(rolePermissions.permission_id, permissions.id))
        .where(eq(rolePermissions.role_id, profile.role_id));
      userPermissions = perms.map((p) => p.code);
    }

    return {
      ...profile,
      account_type: profile.account_type as 'INTERNAL' | 'CLIENT' | null,
      status: profile.status as 'PENDING_ASSIGNMENT' | 'ACTIVE' | 'SUSPENDED' | 'DISABLED',
      role: profile.role ? {
        id: profile.role.id,
        code: profile.role.code as 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'ACCOUNTANT' | 'CLIENT',
        name: profile.role.name,
      } : null,
      department: profile.department ? {
        id: profile.department.id,
        code: profile.department.code,
        name: profile.department.name,
      } : null,
      customerOrganization: profile.customerOrganization ? {
        id: profile.customerOrganization.id,
        code: profile.customerOrganization.code,
        name: profile.customerOrganization.name,
      } : null,
      permissions: userPermissions,
    };
  }

  // 3. Idempotent Profile Bootstrapping inside Transaction
  async bootstrapProfile(authUser: VerifiedAuthUser): Promise<CurrentProfileContext> {
    const existingProfile = await this.findProfileByAuthUserId(authUser.id);
    if (existingProfile) {
      // Idempotency check: only update safe fields like last_login_at
      await this.dbService.db
        .update(profiles)
        .set({
          last_login_at: new Date(),
          updated_at: new Date(),
        })
        .where(eq(profiles.id, existingProfile.id));

      return {
        ...existingProfile,
        last_login_at: new Date(),
      };
    }

    // Attempt insert and audit logging inside a transaction
    try {
      const newProfile = await this.dbService.db.transaction(async (tx) => {
        const [inserted] = await tx
          .insert(profiles)
          .values({
            auth_user_id: authUser.id,
            email: authUser.email,
            full_name: authUser.fullName || authUser.email.split('@')[0],
            avatar_url: authUser.avatarUrl || null,
            account_type: null,
            status: 'PENDING_ASSIGNMENT',
            last_login_at: new Date(),
          })
          .returning();

        await this.auditService.logWithTransaction(tx, {
          actorProfileId: inserted.id,
          action: 'auth.register_profile',
          entityType: 'profiles',
          entityId: inserted.id,
          afterData: inserted as unknown as Record<string, unknown>,
        });

        return inserted;
      });

      return {
        ...newProfile,
        account_type: null,
        status: 'PENDING_ASSIGNMENT',
        role: null,
        department: null,
        customerOrganization: null,
        permissions: [],
      };
    } catch {
      // Fetch it again in case it was created concurrently
      const profile = await this.findProfileByAuthUserId(authUser.id);
      if (!profile) {
        throw new Error('Đăng ký hồ sơ thất bại do lỗi không xác định');
      }
      return profile;
    }
  }

  // 4. Retrieve Profile or throw if missing
  async getRequiredProfile(authUserId: string): Promise<CurrentProfileContext> {
    const profile = await this.findProfileByAuthUserId(authUserId);
    if (!profile) {
      throw new ConflictException('PROFILE_NOT_BOOTSTRAPPED');
    }
    return profile;
  }
}
