import { Injectable, UnauthorizedException, UnprocessableEntityException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { profiles, roles, rolePermissions, permissions } from '@pgs/database';
import { eq } from '@pgs/database';
import { AuditService } from '../audit/audit.service';
import { createApiServiceRoleClient } from '@pgs/auth';
import { env } from '../config/env';
import { VerifiedAuthUser, CurrentProfileContext } from './auth.types';

@Injectable()
export class AuthService {
  private supabaseAdminClient: any;

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
      account_type: profile.account_type as any,
      status: profile.status as any,
      role: profile.role as any,
      department: profile.department as any,
      customerOrganization: profile.customerOrganization as any,
      permissions: userPermissions,
    };
  }

  // 3. Idempotent Profile Bootstrapping
  async bootstrapProfile(authUser: VerifiedAuthUser): Promise<CurrentProfileContext> {
    let existingProfile = await this.findProfileByAuthUserId(authUser.id);
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

    // Attempt insert with conflict fallback to avoid duplicate race conditions
    try {
      const [newProfile] = await this.dbService.db
        .insert(profiles)
        .values({
          auth_user_id: authUser.id,
          email: authUser.email,
          full_name: authUser.fullName || authUser.email.split('@')[0],
          avatar_url: authUser.avatarUrl || null,
          account_type: null, // nullable initially
          status: 'PENDING_ASSIGNMENT',
          last_login_at: new Date(),
        })
        .returning();

      await this.auditService.log({
        actorProfileId: newProfile.id,
        action: 'auth.register_profile',
        entityType: 'profiles',
        entityId: newProfile.id,
        afterData: newProfile,
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
    } catch (err) {
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
