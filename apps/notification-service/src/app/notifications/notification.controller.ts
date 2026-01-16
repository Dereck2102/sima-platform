import { Controller, Post, Get, Patch, Body, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { SendNotificationDto, SendEmailDto, SendBulkNotificationDto } from './notification.dto';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@ApiHeader({ name: 'x-tenant-id', required: true, description: 'Tenant ID' })
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Send a notification' })
  @ApiResponse({ status: 201, description: 'Notification sent successfully' })
  async sendNotification(
    @Body() dto: SendNotificationDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new UnauthorizedException('Tenant ID is required');
    return this.notificationService.sendNotification(dto, tenantId);
  }

  @Post('email')
  @ApiOperation({ summary: 'Send an email notification' })
  @ApiResponse({ status: 201, description: 'Email sent successfully' })
  async sendEmail(
    @Body() dto: SendEmailDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new UnauthorizedException('Tenant ID is required');
    return this.notificationService.sendEmail(dto, tenantId);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Send bulk notifications' })
  @ApiResponse({ status: 201, description: 'Bulk notifications sent' })
  async sendBulkNotification(
    @Body() dto: SendBulkNotificationDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new UnauthorizedException('Tenant ID is required');
    return this.notificationService.sendBulkNotification(dto, tenantId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get user notifications (in-app)' })
  @ApiResponse({ status: 200, description: 'User notifications list' })
  async getUserNotifications(
    @Param('userId') userId: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new UnauthorizedException('Tenant ID is required');
    return this.notificationService.getUserNotifications(userId, tenantId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) throw new UnauthorizedException('Tenant ID is required');
    const success = await this.notificationService.markAsRead(id, tenantId);
    return { success };
  }
}
