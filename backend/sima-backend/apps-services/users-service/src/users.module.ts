import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { MessagingModule } from '@sima/messaging';
import { User } from '@sima/users';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { HealthController } from './controllers/health.controller';
import { UserRepository } from './repositories/user.repository';
import { JwtAuthGuard, RolesGuard } from '@sima/shared';

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
        entities: [User],
        synchronize: process.env.TYPEORM_SYNC === 'true' || process.env.NODE_ENV !== 'production',
        logging: process.env.TYPEORM_LOGGING === 'true',
      }),
    }),
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '86400s' },
    }),
    MessagingModule,
  ],
  providers: [UsersService, UserRepository, JwtAuthGuard, RolesGuard],
  controllers: [UsersController, HealthController],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
