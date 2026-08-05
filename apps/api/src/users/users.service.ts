import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
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
    return this.dbService.db.transaction(async (tx) => {
      // 1. Verify user profile exists
      const profile = await tx.query.profiles.findFirst({
        where: eq(profiles.id, id),
      });
      if (!profile) {
        throw new NotFoundException('Không tìm thấy người dùng');
      }

      // 2. Find target role ID based on the input role_code
      const role = await tx.query.roles.findFirst({
        where: eq(roles.code, input.role_code),
      });
      if (!role) {
        throw new NotFoundException('Không tìm thấy vai trò đã chọn');
      }

      // 3. Verify department exists if provided
      if (input.department_id) {
        const dept = await tx.query.departments.findFirst({
          where: eq(departments.id, input.department_id),
        });
        if (!dept) {
          throw new NotFoundException('DEPARTMENT_NOT_FOUND');
        }
      }

      // 4. Verify customer organization exists if provided
      if (input.customer_organization_id) {
        const org = await tx.query.customerOrganizations.findFirst({
          where: eq(customerOrganizations.id, input.customer_organization_id),
        });
        if (!org) {
          throw new NotFoundException('CUSTOMER_ORGANIZATION_NOT_FOUND');
        }
      }

      const updatedData = {
        account_type: input.account_type,
        role_id: role.id,
        department_id: input.department_id || null,
        customer_organization_id: input.customer_organization_id || null,
        updated_at: new Date(),
        updated_by: actorId,
      };

      const [updatedProfile] = await tx
        .update(profiles)
        .set(updatedData)
        .where(eq(profiles.id, id))
        .returning();

      await this.auditService.logWithTransaction(tx, {
        actorProfileId: actorId,
        action: 'user.assign_role',
        entityType: 'profiles',
        entityId: id,
        beforeData: profile as any,
        afterData: updatedProfile as any,
      });

      return updatedProfile;
    });
  }

  async updateStatus(id: string, input: UpdateUserStatusInput, actorId: string) {
    return this.dbService.db.transaction(async (tx) => {
      // 1. Verify user profile exists
      const profile = await tx.query.profiles.findFirst({
        where: eq(profiles.id, id),
        with: {
          role: true,
        },
      });
      if (!profile) {
        throw new NotFoundException('Không tìm thấy người dùng');
      }

      // 2. Perform validations when transitioning to ACTIVE
      if (input.status === 'ACTIVE') {
        if (!profile.role_id || !profile.account_type) {
          throw new ConflictException('ACCESS_ASSIGNMENT_INCOMPLETE');
        }

        const roleCode = profile.role?.code;
        if (!roleCode) {
          throw new ConflictException('ACCESS_ASSIGNMENT_INCOMPLETE');
        }

        if (profile.account_type === 'CLIENT') {
          if (roleCode !== 'CLIENT') {
            throw new BadRequestException('Vai trò không hợp lệ cho loại tài khoản CLIENT');
          }
          if (!profile.customer_organization_id) {
            throw new BadRequestException('Khách hàng yêu cầu tổ chức khách hàng');
          }
          if (profile.department_id) {
            throw new BadRequestException('Khách hàng không được có phòng ban');
          }
        }

        if (profile.account_type === 'INTERNAL') {
          if (roleCode === 'CLIENT') {
            throw new BadRequestException('Nhân sự nội bộ không được gán vai trò CLIENT');
          }
          if (profile.customer_organization_id) {
            throw new BadRequestException('Nhân sự nội bộ không được liên kết với tổ chức khách hàng');
          }
          if (roleCode !== 'ADMIN' && !profile.department_id) {
            throw new BadRequestException('Nhân viên nội bộ yêu cầu phòng ban');
          }
        }
      }

      const updatedData = {
        status: input.status,
        updated_at: new Date(),
        updated_by: actorId,
      };

      const [updatedProfile] = await tx
        .update(profiles)
        .set(updatedData)
        .where(eq(profiles.id, id))
        .returning();

      await this.auditService.logWithTransaction(tx, {
        actorProfileId: actorId,
        action: 'user.update_status',
        entityType: 'profiles',
        entityId: id,
        beforeData: profile as any,
        afterData: updatedProfile as any,
      });

      return updatedProfile;
    });
  }
}
