import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard';
import { ActiveProfileGuard } from '../auth/active-profile.guard';
import { PermissionGuard } from '../auth/permission.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import { CurrentProfile } from '../auth/current-profile.decorator';
import { PERMISSIONS } from '@pgs/permissions';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  UpdateUserAccessSchema,
  UpdateUserStatusSchema,
  UuidSchema,
  UpdateUserAccessInput,
  UpdateUserStatusInput,
} from '@pgs/validation';

@ApiTags('Admin Users')
@ApiBearerAuth()
@UseGuards(SupabaseJwtGuard, ActiveProfileGuard, PermissionGuard)
@Controller('admin/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @RequirePermissions(PERMISSIONS.USER_VIEW)
  @Get()
  async getAllUsers() {
    const list = await this.usersService.findAll();
    return {
      data: list,
      meta: {},
      error: null,
    };
  }

  @RequirePermissions(PERMISSIONS.USER_VIEW)
  @Get(':id')
  async getUserById(@Param('id', new ZodValidationPipe(UuidSchema)) id: string) {
    const user = await this.usersService.findOne(id);
    return {
      data: user,
      meta: {},
      error: null,
    };
  }

  @RequirePermissions(PERMISSIONS.USER_ASSIGN_ROLE)
  @Patch(':id/access')
  async updateAccess(
    @Param('id', new ZodValidationPipe(UuidSchema)) id: string,
    @Body(new ZodValidationPipe(UpdateUserAccessSchema)) body: UpdateUserAccessInput,
    @CurrentProfile() actor: any
  ) {
    const user = await this.usersService.updateAccess(id, body, actor.id);
    return {
      data: user,
      meta: {},
      error: null,
    };
  }

  @RequirePermissions(PERMISSIONS.USER_MANAGE)
  @Patch(':id/status')
  async updateStatus(
    @Param('id', new ZodValidationPipe(UuidSchema)) id: string,
    @Body(new ZodValidationPipe(UpdateUserStatusSchema)) body: UpdateUserStatusInput,
    @CurrentProfile() actor: any
  ) {
    const user = await this.usersService.updateStatus(id, body, actor.id);
    return {
      data: user,
      meta: {},
      error: null,
    };
  }
}
