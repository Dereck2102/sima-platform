import { Controller, Logger } from '@nestjs/common';
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
}
