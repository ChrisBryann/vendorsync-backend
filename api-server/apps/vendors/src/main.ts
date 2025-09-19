import { NestFactory } from '@nestjs/core';
import { VendorsModule } from './vendors.module';

async function bootstrap() {
  const app = await NestFactory.create(VendorsModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
