import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class SupabaseJwtGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Thiếu token xác thực');
    }

    const token = authHeader.split(' ')[1];
    try {
      const profile = await this.authService.verifyAndGetProfile(token);
      request.user = profile;
      return true;
    } catch (err) {
      throw new UnauthorizedException(err.message || 'Xác thực thất bại');
    }
  }
}
