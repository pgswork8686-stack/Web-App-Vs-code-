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

  @ApiBearerAuth()
  @UseGuards(SupabaseJwtGuard)
  @Post('bootstrap')
  async bootstrap(@CurrentProfile() profile: any) {
    return {
      data: profile,
      meta: {},
      error: null,
    };
  }
}
