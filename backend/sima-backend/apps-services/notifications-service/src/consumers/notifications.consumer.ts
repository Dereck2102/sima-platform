import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { KafkaService, KAFKA_TOPICS } from '@sima/messaging';
import { NotificationsService } from '../services/notifications.service';
import { NotificationChannel } from '../dto/send-notification.dto';

@Injectable()
export class NotificationsConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsConsumer.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async onModuleInit() {
    await this.kafkaService.connect();

    await this.kafkaService.subscribe(KAFKA_TOPICS.NOTIFICATION, async (message) => {
      await this.handleNotification(message);
    });

    await this.kafkaService.subscribe(KAFKA_TOPICS.USER_CREATED, async (message) => {
      if (message.email) {
        await this.handleNotification({
          channel: NotificationChannel.EMAIL,
          email: message.email,
          subject: 'Welcome to SIMA',
          message: 'Your account has been created.',
          template: 'user_welcome',
          userId: message.id,
        });
      }
    });

    this.logger.log('NotificationsConsumer subscriptions ready');
  }

  async onModuleDestroy() {
    await this.kafkaService.disconnect();
  }

  private async handleNotification(payload: any) {
    try {
      await this.notificationsService.send({
        channel: payload.channel,
        email: payload.email,
        phone: payload.phone,
        subject: payload.subject || payload.title || 'Notification',
        message: payload.message || payload.body || '',
        template: payload.template,
        userId: payload.userId,
        metadata: payload.metadata,
      });
    } catch (error) {
      this.logger.warn(`Failed to process notification: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
