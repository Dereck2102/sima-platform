import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MessagingModule } from '@sima/messaging';
import { JwtAuthGuard, RolesGuard } from '@sima/shared';
import { Asset } from './entities/asset.entity';
import { AssetsService } from './services/assets.service';
import { AssetsController } from './controllers/assets.controller';
import { AssetRepository } from './repositories/asset.repository';

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
        entities: [Asset],
        synchronize: process.env.TYPEORM_SYNC === 'true' || process.env.NODE_ENV !== 'production',
        logging: process.env.TYPEORM_LOGGING === 'true',
      }),
    }),
    TypeOrmModule.forFeature([Asset]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '86400s' },
    }),
    MessagingModule,
  ],
  providers: [AssetsService, AssetRepository, JwtAuthGuard, RolesGuard],
  controllers: [AssetsController],
  exports: [AssetsService, AssetRepository],
})
export class AssetsModule {}
