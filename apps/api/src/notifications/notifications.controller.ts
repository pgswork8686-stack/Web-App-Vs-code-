import { Controller, Get, Patch, Post, Body, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SupabaseJwtGuard } from '../auth/supabase-jwt.guard';
import { ProfileContextGuard } from '../auth/profile-context.guard';
import { ActiveProfileGuard } from '../auth/active-profile.guard';
import { CurrentProfile } from '../auth/current-profile.decorator';
import { CurrentProfileContext } from '../auth/auth.types';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UuidSchema, UpdateNotificationPreferencesSchema, UpdateNotificationPreferencesInput } from '@pgs/validation';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(SupabaseJwtGuard, ProfileContextGuard, ActiveProfileGuard)
@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('notifications')
  async getNotifications(@CurrentProfile() profile: CurrentProfileContext) {
    const list = await this.notificationsService.findAllForProfile(profile.id);
    return {
      data: list,
      meta: {},
      error: null,
    };
  }

  @Get('notifications/unread-count')
  async getUnreadCount(@CurrentProfile() profile: CurrentProfileContext) {
    const count = await this.notificationsService.getUnreadCount(profile.id);
    return {
      data: { count },
      meta: {},
      error: null,
    };
  }

  @Patch('notifications/:id/read')
  async markAsRead(
    @Param('id', new ZodValidationPipe(UuidSchema)) id: string,
    @CurrentProfile() profile: CurrentProfileContext
  ) {
    const recipient = await this.notificationsService.markAsRead(id, profile.id);
    return {
      data: recipient,
      meta: {},
      error: null,
    };
  }

  @Patch('notifications/:id/handled')
  async markAsHandled(
    @Param('id', new ZodValidationPipe(UuidSchema)) id: string,
    @CurrentProfile() profile: CurrentProfileContext
  ) {
    const recipient = await this.notificationsService.markAsHandled(id, profile.id);
    return {
      data: recipient,
      meta: {},
      error: null,
    };
  }

  @Patch('notifications/:id/archive')
  async markAsArchived(
    @Param('id', new ZodValidationPipe(UuidSchema)) id: string,
    @CurrentProfile() profile: CurrentProfileContext
  ) {
    const recipient = await this.notificationsService.markAsArchived(id, profile.id);
    return {
      data: recipient,
      meta: {},
      error: null,
    };
  }

  @Post('notifications/read-all')
  async markAllAsRead(@CurrentProfile() profile: CurrentProfileContext) {
    const list = await this.notificationsService.markAllAsRead(profile.id);
    return {
      data: list,
      meta: {},
      error: null,
    };
  }

  @Get('notification-preferences')
  async getPreferences(@CurrentProfile() profile: CurrentProfileContext) {
    const list = await this.notificationsService.getPreferences(profile.id);
    return {
      data: list,
      meta: {},
      error: null,
    };
  }

  @Patch('notification-preferences')
  async updatePreferences(
    @CurrentProfile() profile: CurrentProfileContext,
    @Body(new ZodValidationPipe(UpdateNotificationPreferencesSchema)) body: UpdateNotificationPreferencesInput
  ) {
    const list = await this.notificationsService.updatePreferences(profile.id, body.preferences);
    return {
      data: list,
      meta: {},
      error: null,
    };
  }
}
