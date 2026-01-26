import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SmsNotificationDto {
  @IsNotEmpty()
  @IsString()
  phone!: string;

  @IsNotEmpty()
  message!: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
