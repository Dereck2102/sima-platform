import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard, RolesGuard } from '@sima/shared';
import { ReportsController } from './controllers/reports.controller';
import { ReportsService } from './services/reports.service';
import { Report } from './entities/report.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432', 10),
        username: process.env.DATABASE_USER || 'sima_user',
        password: process.env.DATABASE_PASSWORD || 'change_me_in_production',
        database: process.env.DATABASE_NAME || 'sima_db',
        entities: [Report],
        synchronize: process.env.TYPEORM_SYNC === 'true' || process.env.NODE_ENV !== 'production',
        logging: process.env.TYPEORM_LOGGING === 'true',
      }),
    }),
    TypeOrmModule.forFeature([Report]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '86400s' },
    }),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, JwtAuthGuard, RolesGuard],
})
export class ReportsModule {}
