import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseJwtGuard } from './supabase-jwt.guard';
import { ProfileContextGuard } from './profile-context.guard';
import { CurrentProfile } from './current-profile.decorator';
import { CurrentAuthUser } from './current-auth-user.decorator';
import { VerifiedAuthUser, CurrentProfileContext } from './auth.types';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBearerAuth()
  @UseGuards(SupabaseJwtGuard, ProfileContextGuard)
  @Get('me')
  async getMe(@CurrentProfile() profile: CurrentProfileContext) {
    return {
      data: profile,
      meta: {},
      error: null,
    };
  }

  @ApiBearerAuth()
  @UseGuards(SupabaseJwtGuard)
  @Post('bootstrap')
  async bootstrap(@CurrentAuthUser() authUser: VerifiedAuthUser) {
    const profile = await this.authService.bootstrapProfile(authUser);
    return {
      data: profile,
      meta: {},
      error: null,
    };
  }
}
