import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SupabaseJwtGuard } from './supabase-jwt.guard';
import { ActiveProfileGuard } from './active-profile.guard';
import { PermissionGuard } from './permission.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, SupabaseJwtGuard, ActiveProfileGuard, PermissionGuard],
  exports: [AuthService, SupabaseJwtGuard, ActiveProfileGuard, PermissionGuard],
})
export class AuthModule {}
