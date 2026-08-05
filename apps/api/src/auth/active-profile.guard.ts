import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class ActiveProfileGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return false;
    }

    if (user.status !== 'ACTIVE') {
      throw new ForbiddenException(
        `Tài khoản đang ở trạng thái ${user.status} và chưa thể truy cập ứng dụng.`
      );
    }
    return true;
  }
}
