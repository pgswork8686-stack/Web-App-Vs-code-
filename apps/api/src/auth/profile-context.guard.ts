import { Injectable, CanActivate, ExecutionContext, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class ProfileContextGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authUser = request.authUser;
    if (!authUser) {
      return false;
    }

    const profile = await this.authService.findProfileByAuthUserId(authUser.id);
    if (!profile) {
      throw new ConflictException('PROFILE_NOT_BOOTSTRAPPED');
    }

    request.user = profile;
    return true;
  }
}
