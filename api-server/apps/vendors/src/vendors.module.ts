import { forwardRef, Module } from '@nestjs/common';
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';
import { VendorInvoiceModule } from './vendor-invoice/vendor-invoice.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthGatewayModule } from '@app/common/auth-gateway/auth-gateway.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Vendor } from '@app/common/database/entities';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGatewayGuard } from '@app/common/auth-gateway/auth-gateway.guard';
import { DatabaseModule } from '@app/common/database/database.module';
import { PaymentsModule } from './payments/payments.module';
import { ScheduleModule } from '@nestjs/schedule';
import { VendorPerformanceModule } from './vendor-performance/vendor-performance.module';

@Module({
  imports: [
    forwardRef(() => VendorInvoiceModule),
    forwardRef(() => VendorPerformanceModule),
    ConfigModule.forRoot({
      envFilePath: './apps/vendors/env.development',
      isGlobal: true,
    }),
    ClientsModule.registerAsync({
      isGlobal: true,
      clients: [
        {
          name: 'OCR_PACKAGE',
          useFactory: (configService: ConfigService) => ({
            transport: Transport.GRPC,
            options: {
              url: `${configService.getOrThrow<string>('PROTO_HOST')}:${configService.getOrThrow<string>('PROTO_PORT')}`,
              package: configService.getOrThrow<string>('PROTO_PACKAGE_NAME'),
              protoPath: configService.getOrThrow<string>('PROTO_PATH'),
            },
          }),
          inject: [ConfigService],
        },
        {
          name: 'WEBSOCKETS_SERVICE',
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            transport: Transport.TCP,
            options: {
              host: configService.getOrThrow<string>('WEBSOCKETS_HOST'),
              port: +configService.getOrThrow<string>('WEBSOCKETS_PORT'),
            },
          }),
        },
      ],
    }),
    AuthGatewayModule,
    DatabaseModule,
    TypeOrmModule.forFeature([User, Vendor]),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) => ({
        stores: [
          new KeyvRedis(
            `redis://:${configService.getOrThrow<string>('REDIS_PASSWORD')}@${configService.getOrThrow<string>('REDIS_HOST')}:${configService.getOrThrow<string>('REDIS_PORT')}`,
          
          ),
        ],
        ttl: 10 * 60,
        max: 1000,
      }),
      inject: [ConfigService],
    }),
    PaymentsModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [VendorsController],
  providers: [
    VendorsService,
    {
      provide: APP_GUARD,
      useClass: AuthGatewayGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
  exports: [VendorsService],
})
export class VendorsModule {}
