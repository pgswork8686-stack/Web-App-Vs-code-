import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseJwtGuard } from './supabase-jwt.guard';
import { CurrentProfile } from './current-profile.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBearerAuth()
  @UseGuards(SupabaseJwtGuard)
  @Get('me')
  async getMe(@CurrentProfile() profile: any) {
    return {
      data: profile,
      meta: {},
      error: null,
    };
  }

  @Post('bootstrap')
  async bootstrap(@Body() body: { auth_user_id: string; email: string; full_name?: string; avatar_url?: string }) {
    const profile = await this.authService.bootstrapProfile(
      body.auth_user_id,
      body.email,
      body.full_name,
      body.avatar_url
    );
    return {
      data: profile,
      meta: {},
      error: null,
    };
  }
}
