import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

const configService = new ConfigService();

// const dbName: string = process.env.npm_config_db_name ?? 'USERS'; // --db_name=Users

const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.getOrThrow<string>(`DB_HOST`),
  port: +configService.getOrThrow<string>(`DB_PORT`),
  username: configService.getOrThrow<string>(`DB_USER`),
  password: configService.getOrThrow<string>(`DB_PASSWORD`),
  database: configService.getOrThrow<string>(`DB_NAME`),
  synchronize: configService.getOrThrow<string>('NODE_ENV') !== 'production', // set to false in production
  entities:
    configService.getOrThrow('NODE_ENV') === 'production'
      ? ['dist/entities/**/*.js']
      : ['libs/common/src/database/entities/**/*.ts'],
  migrations:
    configService.getOrThrow('NODE_ENV') === 'production'
      ? ['dist/migrations/**/*.js']
      : ['database/migrations/**/*.ts'],
  migrationsRun: false,
  logging: true,
});

export default AppDataSource;
