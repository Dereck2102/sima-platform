import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@sima/shared';
import { NotificationsService } from '../services/notifications.service';
import { SendNotificationDto, NotificationChannel } from '../dto/send-notification.dto';
import { EmailNotificationDto } from '../dto/email-notification.dto';
import { SmsNotificationDto } from '../dto/sms-notification.dto';
import { UserRole } from '@sima/users';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Send a notification' })
  async send(@Body() sendNotificationDto: SendNotificationDto) {
    return this.notificationsService.send(sendNotificationDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all notifications' })
  async findAll() {
    return { notifications: [], total: 0 };
  }

  @Post('email')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Send email notification' })
  async sendEmail(@Body() emailDto: EmailNotificationDto) {
    return this.notificationsService.send({
      channel: NotificationChannel.EMAIL,
      email: emailDto.to,
      subject: emailDto.subject,
      message: emailDto.message,
      template: emailDto.template,
      metadata: emailDto.metadata,
    });
  }

  @Post('sms')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Send SMS notification' })
  async sendSms(@Body() smsDto: SmsNotificationDto) {
    return this.notificationsService.send({
      channel: NotificationChannel.SMS,
      phone: smsDto.phone,
      subject: 'SMS Notification',
      message: smsDto.message,
      metadata: smsDto.metadata,
      template: 'sms_generic',
    });
  }
}
