import { NestFactory } from '@nestjs/core';
import { VendorsModule } from './vendors.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(VendorsModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, //enables class transformation
    }),
  );
  app.enableCors({
    origin: 'http://localhost:3000', // or "*" for all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
