import { Injectable, Logger } from '@nestjs/common';
import { 
  SendNotificationDto, 
  SendEmailDto, 
  SendBulkNotificationDto,
  NotificationResponse,
  NotificationStatus,
  NotificationType,
} from './notification.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  
  // In-memory store for demo (in production: database + message queue)
  private notifications: Map<string, NotificationResponse & { 
    subject: string; 
    message: string;
    type: NotificationType;
    tenantId: string;
  }> = new Map();

  async sendNotification(
    dto: SendNotificationDto, 
    tenantId: string
  ): Promise<NotificationResponse> {
    const id = uuidv4();
    
    this.logger.log(`📨 Sending ${dto.type} notification to ${dto.recipient}`);
    
    // Simulate sending based on type
    switch (dto.type) {
      case NotificationType.EMAIL:
        await this.simulateEmailSend(dto.recipient, dto.subject, dto.message);
        break;
      case NotificationType.PUSH:
        await this.simulatePushSend(dto.recipient, dto.subject, dto.message);
        break;
      case NotificationType.IN_APP:
      default:
        // Store for in-app retrieval
        break;
    }

    const notification = {
      id,
      status: NotificationStatus.SENT,
      sentAt: new Date(),
      recipient: dto.recipient,
      subject: dto.subject,
      message: dto.message,
      type: dto.type,
      tenantId,
    };

    this.notifications.set(id, notification);

    return {
      id,
      status: NotificationStatus.SENT,
      sentAt: notification.sentAt,
      recipient: dto.recipient,
    };
  }

  async sendEmail(dto: SendEmailDto, tenantId: string): Promise<NotificationResponse> {
    const id = uuidv4();
    
    this.logger.log(`📧 Sending email to ${dto.to}: ${dto.subject}`);
    
    // In production: use nodemailer or SendGrid
    await this.simulateEmailSend(dto.to, dto.subject, dto.body);

    const notification = {
      id,
      status: NotificationStatus.SENT,
      sentAt: new Date(),
      recipient: dto.to,
      subject: dto.subject,
      message: dto.body,
      type: NotificationType.EMAIL,
      tenantId,
    };

    this.notifications.set(id, notification);

    return {
      id,
      status: NotificationStatus.SENT,
      sentAt: notification.sentAt,
      recipient: dto.to,
    };
  }

  async sendBulkNotification(
    dto: SendBulkNotificationDto, 
    tenantId: string
  ): Promise<{ sent: number; failed: number; results: NotificationResponse[] }> {
    this.logger.log(`📤 Sending bulk ${dto.type} notification to ${dto.recipients.length} recipients`);

    const results: NotificationResponse[] = [];
    let sent = 0;
    let failed = 0;

    for (const recipient of dto.recipients) {
      try {
        const result = await this.sendNotification({
          recipient,
          subject: dto.subject,
          message: dto.message,
          type: dto.type,
        }, tenantId);
        results.push(result);
        sent++;
      } catch {
        failed++;
      }
    }

    return { sent, failed, results };
  }

  async getUserNotifications(userId: string, tenantId: string): Promise<Array<{
    id: string;
    subject: string;
    message: string;
    sentAt: Date;
    status: NotificationStatus;
  }>> {
    const userNotifications = Array.from(this.notifications.values())
      .filter(n => n.recipient === userId && n.tenantId === tenantId && n.type === NotificationType.IN_APP)
      .map(n => ({
        id: n.id,
        subject: n.subject,
        message: n.message,
        sentAt: n.sentAt,
        status: n.status,
      }));

    return userNotifications;
  }

  async markAsRead(notificationId: string, tenantId: string): Promise<boolean> {
    const notification = this.notifications.get(notificationId);
    if (notification && notification.tenantId === tenantId) {
      notification.status = NotificationStatus.READ;
      return true;
    }
    return false;
  }

  // Simulation methods (replace with real implementations)
  private async simulateEmailSend(to: string, subject: string, body: string): Promise<void> {
    // In production: nodemailer.sendMail({ to, subject, html: body })
    this.logger.debug(`[SIMULATED] Email to ${to}: "${subject}"`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async simulatePushSend(userId: string, title: string, body: string): Promise<void> {
    // In production: firebase.messaging().send({ token, notification: { title, body } })
    this.logger.debug(`[SIMULATED] Push to ${userId}: "${title}"`);
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}
