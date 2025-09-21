import { User } from '@clerk/backend';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserDecorator = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    (context.getType() === 'http'
      ? context.switchToHttp().getRequest().user
      : context.getType() === 'rpc'
        ? context.switchToRpc().getData().user
        : context.switchToWs().getClient().user) as User,
);
