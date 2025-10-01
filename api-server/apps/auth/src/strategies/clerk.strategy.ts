import { CLERK_PROVIDER } from '@app/common/constants/clerk.constant';
import { ClerkClient, User, verifyToken } from '@clerk/backend';
import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-custom';
import { AuthService } from '../auth.service';
import { User as InternalUser } from '@app/common/database/entities';

@Injectable()
export class ClerkStrategy extends PassportStrategy(Strategy, 'clerk') {
  private readonly logger: Logger = new Logger(ClerkStrategy.name);
  constructor(
    @Inject(CLERK_PROVIDER) private readonly clerkClient: ClerkClient,
    private readonly configSevice: ConfigService,
    private readonly authService: AuthService,
  ) {
    super();
  }

  async validate(req: Request): Promise<User> {
    // get Bearer token from Authorization headers
    const token = req.headers.authorization?.split(' ').pop();
    if (!token) {
      throw new UnauthorizedException('No token provided!');
    }
    try {
      const tokenPayload = await verifyToken(token, {
        // secretKey: this.configSevice.getOrThrow<string>('CLERK_SECRET_KEY'),
        jwtKey: this.configSevice.getOrThrow<string>('CLERK_JWKS_PUBLIC_KEY'), // to allow verify in networkless manner
      });
      const clerkUser = await this.clerkClient.users.getUser(tokenPayload.sub);
      let user: InternalUser;
      try {
        user = await this.authService.findUser(clerkUser.id);
      } catch {
        // user does not exist so create a new one
        user = await this.authService.createUser(clerkUser.id);
      }
      clerkUser.publicMetadata.userId = user.id;

      return clerkUser;
    } catch (error) {
      this.logger.error(`ClerkStrategy - Error: ${error}`);
      throw new UnauthorizedException('Invalid token!');
    }
  }
}
