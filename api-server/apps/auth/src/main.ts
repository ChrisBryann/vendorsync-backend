import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { RmqService } from '@app/common/rmq/rmq.service';
import { AUTH_RMQ } from '@app/common/constants/rmq.constant';
import { HttpInterceptor } from '@app/common/http/http.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  // app.useGlobalInterceptors(new HttpInterceptor());
  const rmqService = app.get<RmqService>(RmqService);
  app.connectMicroservice(rmqService.getOptions(AUTH_RMQ, true));
  app.startAllMicroservices();
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
