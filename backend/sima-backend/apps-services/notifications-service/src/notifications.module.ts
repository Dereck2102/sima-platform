import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MessagingModule } from '@sima/messaging';
import { JwtAuthGuard, RolesGuard } from '@sima/shared';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsService } from './services/notifications.service';
import { NotificationsConsumer } from './consumers/notifications.consumer';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '86400s' },
    }),
    MessagingModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsConsumer, JwtAuthGuard, RolesGuard],
})
export class NotificationsModule {}
