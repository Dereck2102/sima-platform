import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 3,
    }),
    CacheModule.register({
      ttl: 60, // 60 seconds default TTL
      max: 100, // Maximum items in cache
      isGlobal: true,
    }),
    DashboardModule,
    HealthModule,
  ],
})
export class AppModule {}
