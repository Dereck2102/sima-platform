import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { MqttService } from '../mqtt/mqtt.service';

@Module({
  imports: [ConfigModule],
  controllers: [NotificationController],
  providers: [NotificationService, MqttService],
  exports: [NotificationService, MqttService],
})
export class NotificationModule {}
