import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard, RolesGuard } from '@sima/shared';
import { StorageController } from './controllers/storage.controller';
import { StorageService } from './services/storage.service';
import { FileEntity } from './entities/file.entity';

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
        entities: [FileEntity],
        synchronize: process.env.TYPEORM_SYNC === 'true' || process.env.NODE_ENV !== 'production',
        logging: process.env.TYPEORM_LOGGING === 'true',
      }),
    }),
    TypeOrmModule.forFeature([FileEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '86400s' },
    }),
  ],
  controllers: [StorageController],
  providers: [StorageService, JwtAuthGuard, RolesGuard],
})
export class StorageModule {}
