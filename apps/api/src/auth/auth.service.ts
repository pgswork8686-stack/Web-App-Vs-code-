import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { profiles, roles, rolePermissions, permissions } from '@pgs/database';
import { eq } from '@pgs/database';
import { AuditService } from '../audit/audit.service';
import { createApiServiceRoleClient } from '@pgs/auth';

@Injectable()
export class AuthService {
  private supabaseAdminClient: any;

  constructor(
    private readonly dbService: DatabaseService,
    private readonly auditService: AuditService
  ) {
    const supabaseUrl = process.env.SUPABASE_URL || 'https://mpljxkaxkektcuvnosiq.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'service-key';
    this.supabaseAdminClient = createApiServiceRoleClient(supabaseUrl, supabaseServiceKey);
  }

  // Verify Bearer Token and get user profile with permissions
  async verifyAndGetProfile(token: string) {
    const { data: { user }, error } = await this.supabaseAdminClient.auth.getUser(token);
    if (error || !user) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ');
    }

    // 1. Get or create profile
    let profile = await this.dbService.db.query.profiles.findFirst({
      where: eq(profiles.auth_user_id, user.id),
      with: {
        role: true,
        department: true,
        customerOrganization: true,
      },
    });

    if (!profile) {
      // Create new profile with PENDING_ASSIGNMENT status
      const [newProfile] = await this.dbService.db.insert(profiles).values({
        auth_user_id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url || null,
        account_type: 'INTERNAL', // Default account type
        status: 'PENDING_ASSIGNMENT',
      }).returning();

      profile = {
        ...newProfile,
        role: null,
        department: null,
        customerOrganization: null,
      };

      await this.auditService.log({
        actorProfileId: profile.id,
        action: 'auth.register_profile',
        entityType: 'profiles',
        entityId: profile.id,
        afterData: profile,
      });
    }

    // 2. Fetch permissions if role is assigned
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
      permissions: userPermissions,
    };
  }

  async bootstrapProfile(authUserId: string, email: string, fullName?: string, avatarUrl?: string) {
    let profile = await this.dbService.db.query.profiles.findFirst({
      where: eq(profiles.auth_user_id, authUserId),
    });

    if (!profile) {
      const [newProfile] = await this.dbService.db.insert(profiles).values({
        auth_user_id: authUserId,
        email,
        full_name: fullName || null,
        avatar_url: avatarUrl || null,
        account_type: 'INTERNAL',
        status: 'PENDING_ASSIGNMENT',
      }).returning();
      profile = newProfile;
    }
    return profile;
  }
}
