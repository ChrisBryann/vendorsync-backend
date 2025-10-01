import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { catchError, Observable, tap } from 'rxjs';
import { AUTH_RMQ } from '../constants/rmq.constant';
import { ClientProxy } from '@nestjs/microservices';
import { Socket } from 'socket.io';

@Injectable()
export class AuthGatewayGuard implements CanActivate {
  private readonly logger: Logger = new Logger(AuthGatewayGuard.name);
  constructor(@Inject(AUTH_RMQ) private readonly authClient: ClientProxy) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    let authentication: string;
    if (context.getType() === 'rpc') {
      authentication = context.switchToRpc().getData().Authentication;
    } else if (context.getType() === 'http') {
      authentication = context.switchToHttp().getRequest()
        .headers.authorization;
    } else if (context.getType() === 'ws') {
      const client: Socket = context.switchToWs().getClient();
      authentication = client.handshake.headers.authorization;
    }

    if (!authentication) {
      this.logger.error('No value was provided for Authentication!');
      throw new UnauthorizedException(
        'No value was provided for Authentication!',
      );
    }

    return this.authClient
      .send('validate_user', {
        headers: {
          authorization: authentication,
        },
      })
      .pipe(
        tap((user) => {
          if (context.getType() === 'rpc') {
            context.switchToRpc().getData().user = user;
          } else if (context.getType() === 'http') {
            context.switchToHttp().getRequest().user = user;
          } else if (context.getType() === 'ws') {
            context.switchToWs().getClient().user = user;
          }
        }),
        catchError((err) => {
          this.logger.error(
            `Unauthorized request through Auth Gateway: ${JSON.stringify(err)}`,
          );
          throw new UnauthorizedException(err);
        }),
      );
  }
}
