import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>(`DB_HOST`),
        port: +configService.getOrThrow<string>(`DB_PORT`),
        username: configService.getOrThrow<string>(`DB_USER`),
        password: configService.getOrThrow<string>(`DB_PASSWORD`),
        database: configService.getOrThrow<string>(`DB_NAME`),
        entities: ['dist/**/*.entity{.ts,.js}'],
        migrations: ['dist/migrations/*{.ts, .js}'],
        autoLoadEntities: true,
        synchronize:
          configService.getOrThrow<string>('NODE_ENV') !== 'production', // set to false in production
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
