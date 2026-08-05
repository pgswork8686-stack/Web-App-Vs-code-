import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentAuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.authUser;
  },
);
