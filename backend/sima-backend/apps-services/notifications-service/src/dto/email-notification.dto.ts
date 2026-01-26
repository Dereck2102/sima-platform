import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EmailNotificationDto {
  @IsEmail()
  to!: string;

  @IsNotEmpty()
  subject!: string;

  @IsNotEmpty()
  message!: string;

  @IsOptional()
  template?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
