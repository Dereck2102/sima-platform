import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum NotificationType {
  EMAIL = 'EMAIL',
  IN_APP = 'IN_APP',
  PUSH = 'PUSH',
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  READ = 'READ',
}

export class SendNotificationDto {
  @ApiProperty({ description: 'Recipient user ID or email' })
  @IsString()
  @IsNotEmpty()
  recipient: string;

  @ApiProperty({ description: 'Notification subject/title' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'Notification message body' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ enum: NotificationType, default: NotificationType.IN_APP })
  @IsEnum(NotificationType)
  type: NotificationType = NotificationType.IN_APP;

  @ApiPropertyOptional({ enum: NotificationPriority, default: NotificationPriority.NORMAL })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority = NotificationPriority.NORMAL;

  @ApiPropertyOptional({ description: 'Additional data payload' })
  @IsOptional()
  data?: Record<string, unknown>;
}

export class SendEmailDto {
  @ApiProperty({ description: 'Recipient email address' })
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ description: 'Email subject' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'Email body (HTML supported)' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({ description: 'CC recipients' })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  cc?: string[];

  @ApiPropertyOptional({ description: 'Template name to use' })
  @IsOptional()
  @IsString()
  template?: string;

  @ApiPropertyOptional({ description: 'Template variables' })
  @IsOptional()
  templateData?: Record<string, unknown>;
}

export class SendBulkNotificationDto {
  @ApiProperty({ description: 'Recipient user IDs' })
  @IsArray()
  @IsString({ each: true })
  recipients: string[];

  @ApiProperty({ description: 'Notification subject' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'Notification message' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType;
}

export interface NotificationResponse {
  id: string;
  status: NotificationStatus;
  sentAt: Date;
  recipient: string;
}
