import { NestFactory } from '@nestjs/core';
import { WebsocketsModule } from './websockets.module';
import {
  MicroserviceOptions,
  TcpOptions,
  Transport,
} from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(WebsocketsModule);
  await app.connectMicroservice<TcpOptions>(
    {
      transport: Transport.TCP,
      options: {
        port: 3001,
      }
    },
    {
      inheritAppConfig: true,
    },
  );
  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
