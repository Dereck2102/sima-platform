import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, IsEmail } from 'class-validator';

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  IN_APP = 'IN_APP',
}

export class SendNotificationDto {
  @IsUUID()
  @IsOptional()
  userId?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(NotificationChannel)
  channel!: NotificationChannel;

  @IsNotEmpty()
  @IsString()
  template!: string;

  @IsNotEmpty()
  @IsString()
  subject!: string;

  @IsNotEmpty()
  @IsString()
  message!: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
