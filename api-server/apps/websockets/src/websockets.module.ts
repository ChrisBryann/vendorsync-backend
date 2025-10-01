import { Module } from '@nestjs/common';
import { WebsocketsController } from './websockets.controller';
import { WebsocketsService } from './websockets.service';
import { EventsGateway } from './events/events.gateway';
import { AuthGatewayModule } from '@app/common/auth-gateway/auth-gateway.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './apps/websockets/env.development',
      isGlobal: true,
    }),
    AuthGatewayModule,
  ],
  controllers: [WebsocketsController],
  providers: [WebsocketsService, EventsGateway],
})
export class WebsocketsModule {}
