import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { profiles, roles, departments, customerOrganizations } from '@pgs/database';
import { eq } from '@pgs/database';
import { AuditService } from '../audit/audit.service';
import { UpdateUserAccessInput, UpdateUserStatusInput } from '@pgs/validation';

@Injectable()
export class UsersService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly auditService: AuditService
  ) {}

  async findAll() {
    return this.dbService.db.query.profiles.findMany({
      with: {
        role: true,
        department: true,
        customerOrganization: true,
      },
    });
  }

  async findOne(id: string) {
    const profile = await this.dbService.db.query.profiles.findFirst({
      where: eq(profiles.id, id),
      with: {
        role: true,
        department: true,
        customerOrganization: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    return profile;
  }

  async updateAccess(id: string, input: UpdateUserAccessInput, actorId: string) {
    const profile = await this.findOne(id);

    // Find the role based on the role code
    const role = await this.dbService.db.query.roles.findFirst({
      where: eq(roles.code, input.role_code),
    });
    if (!role) {
      throw new NotFoundException('Không tìm thấy vai trò đã chọn');
    }

    const updatedData = {
      account_type: input.account_type,
      role_id: role.id,
      department_id: input.department_id || null,
      customer_organization_id: input.customer_organization_id || null,
      updated_at: new Date(),
      updated_by: actorId,
    };

    const [updatedProfile] = await this.dbService.db
      .update(profiles)
      .set(updatedData)
      .where(eq(profiles.id, id))
      .returning();

    await this.auditService.log({
      actorProfileId: actorId,
      action: 'user.assign_role',
      entityType: 'profiles',
      entityId: id,
      beforeData: profile,
      afterData: updatedProfile,
    });

    return updatedProfile;
  }

  async updateStatus(id: string, input: UpdateUserStatusInput, actorId: string) {
    const profile = await this.findOne(id);

    const updatedData = {
      status: input.status,
      updated_at: new Date(),
      updated_by: actorId,
    };

    const [updatedProfile] = await this.dbService.db
      .update(profiles)
      .set(updatedData)
      .where(eq(profiles.id, id))
      .returning();

    await this.auditService.log({
      actorProfileId: actorId,
      action: 'user.update_status',
      entityType: 'profiles',
      entityId: id,
      beforeData: profile,
      afterData: updatedProfile,
    });

    return updatedProfile;
  }
}
