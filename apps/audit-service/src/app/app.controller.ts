import { Controller, Get, Logger, Query } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    @InjectModel(AuditLog.name) private auditModel: Model<AuditLogDocument>
  ) {}

  @EventPattern('asset.created')
  async handleAssetCreated(@Payload() data: any) {
    this.logger.log('Saving Audit Log to MongoDB...');

    
    const newLog = new this.auditModel({
      entityId: data.id,
      entityType: 'ASSET',
      action: 'CREATED',
      payload: data,
    });

    
    await newLog.save();

    this.logger.log(`Audit Saved! ID: ${newLog._id}`);
  }

  @Get('logs')
  async getLogs(
    @Query('action') action?: string,
    @Query('entity') entity?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    this.logger.log('Fetching audit logs...');
    
    const query: Record<string, unknown> = {};
    if (action) query.action = action;
    if (entity) query.entityType = entity;

    const limitNum = parseInt(limit || '100', 10);
    const offsetNum = parseInt(offset || '0', 10);

    const logs = await this.auditModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(offsetNum)
      .limit(limitNum)
      .exec();

    return logs.map(log => ({
      id: log._id,
      action: log.action,
      entity: log.entityType,
      entityId: log.entityId,
      userId: log.payload?.userId || 'system',
      userEmail: log.payload?.userEmail,
      oldValue: log.payload?.oldValue,
      newValue: log.payload?.newValue,
      tenantId: log.payload?.tenantId || 'default',
      timestamp: log.createdAt,
    }));
  }
}
