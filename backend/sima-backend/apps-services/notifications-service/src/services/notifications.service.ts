import { Injectable, Logger } from '@nestjs/common';
import { KafkaService, KAFKA_TOPICS } from '@sima/messaging';
import { EmailNotificationDto } from '../dto/email-notification.dto';
import { SmsNotificationDto } from '../dto/sms-notification.dto';
import { SendNotificationDto, NotificationChannel } from '../dto/send-notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly kafkaService: KafkaService) {}

  async send(dto: SendNotificationDto) {
    // Route to channel-specific sender
    switch (dto.channel) {
      case NotificationChannel.EMAIL:
        await this.sendEmail({ to: dto.email || '', subject: dto.subject, message: dto.message, template: dto.template, metadata: dto.metadata });
        break;
      case NotificationChannel.SMS:
        await this.sendSms({ phone: dto.phone || '', message: dto.message, metadata: dto.metadata });
        break;
      case NotificationChannel.IN_APP:
      default:
        this.logger.log(`IN_APP notification queued for user ${dto.userId || 'unknown'}`);
        break;
    }

    await this.emitNotificationEvent(dto);

    return {
      id: `notif-${Date.now()}`,
      status: 'sent',
      channel: dto.channel,
      timestamp: new Date().toISOString(),
    };
  }

  async sendEmail(dto: EmailNotificationDto) {
    // Placeholder for SendGrid/SES integration
    this.logger.log(`Sending email to ${dto.to}: ${dto.subject}`);
    return { sent: true, to: dto.to, provider: 'sendgrid' };
  }

  async sendSms(dto: SmsNotificationDto) {
    // Placeholder for Twilio integration
    this.logger.log(`Sending SMS to ${dto.phone}`);
    return { sent: true, phone: dto.phone, provider: 'twilio' };
  }

  private async emitNotificationEvent(dto: SendNotificationDto) {
    try {
      await this.kafkaService.sendMessage(KAFKA_TOPICS.NOTIFICATION, {
        channel: dto.channel,
        userId: dto.userId,
        email: dto.email,
        phone: dto.phone,
        subject: dto.subject,
        template: dto.template,
        metadata: dto.metadata,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.warn(`Kafka emit failed NOTIFICATION: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
