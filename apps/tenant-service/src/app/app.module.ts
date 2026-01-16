import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Tenant } from './tenants/tenant.entity';
import { TenantController } from './tenants/tenant.controller';
import { TenantService } from './tenants/tenant.service';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'sima',
      password: process.env.DB_PASSWORD || 'password123',
      database: process.env.DB_NAME || 'sima_core',
      entities: [Tenant],
      synchronize: true,
      logging: false,
    }),
    TypeOrmModule.forFeature([Tenant]),
  ],
  controllers: [AppController, TenantController, HealthController],
  providers: [AppService, TenantService],
  exports: [TenantService],
})
export class AppModule {}

