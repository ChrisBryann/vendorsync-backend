import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthGatewayModule } from '@app/common/auth-gateway/auth-gateway.module';
import { ClerkClientProvider } from '@app/common/providers/clerk.provider';
import { ClerkStrategy } from './strategies/clerk.strategy';
import { DatabaseModule } from '@app/common/database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/common/database/entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './apps/auth/env.development',
      isGlobal: true,
    }),
    PassportModule,
    AuthGatewayModule,
    DatabaseModule,
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService, ClerkClientProvider, ClerkStrategy],
})
export class AuthModule {}
