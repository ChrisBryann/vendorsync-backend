import { createClerkClient } from '@clerk/backend';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CLERK_PROVIDER } from '../constants/clerk.constant';

export const ClerkClientProvider: Provider = {
  provide: CLERK_PROVIDER,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return createClerkClient({
      publishableKey: configService.getOrThrow<string>('CLERK_PUBLISHABLE_KEY'),
      secretKey: configService.getOrThrow<string>('CLERK_SECRET_KEY'),
    });
  },
};
