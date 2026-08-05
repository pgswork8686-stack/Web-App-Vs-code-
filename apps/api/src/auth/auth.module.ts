import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseJwtGuard } from './supabase-jwt.guard';
import { ActiveProfileGuard } from './active-profile.guard';
import { PermissionGuard } from './permission.guard';
import { ProfileContextGuard } from './profile-context.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, SupabaseJwtGuard, ActiveProfileGuard, PermissionGuard, ProfileContextGuard],
  exports: [AuthService, SupabaseJwtGuard, ActiveProfileGuard, PermissionGuard, ProfileContextGuard],
})
export class AuthModule {}
