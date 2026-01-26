import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { KafkaService, KAFKA_TOPICS } from '@sima/messaging';
import { AuditService } from '../services/audit.service';
import { AuditAction } from '../entities/audit-log.entity';

@Injectable()
export class AuditConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AuditConsumer.name);

  constructor(
    private readonly kafkaService: KafkaService,
    private readonly auditService: AuditService,
  ) {}

  async onModuleInit() {
    await this.kafkaService.connect();

    await this.kafkaService.subscribe(KAFKA_TOPICS.AUDIT_LOG, async (message) => {
      await this.handleAuditEvent(message, AuditAction.CREATE, message.resourceType || 'unknown');
    });

    await this.kafkaService.subscribe(KAFKA_TOPICS.USER_CREATED, async (message) => {
      await this.handleAuditEvent(message, AuditAction.CREATE, 'user');
    });

    await this.kafkaService.subscribe(KAFKA_TOPICS.USER_UPDATED, async (message) => {
      await this.handleAuditEvent(message, AuditAction.UPDATE, 'user');
    });

    await this.kafkaService.subscribe(KAFKA_TOPICS.ASSET_CREATED, async (message) => {
      await this.handleAuditEvent(message, AuditAction.CREATE, 'asset');
    });

    await this.kafkaService.subscribe(KAFKA_TOPICS.ASSET_UPDATED, async (message) => {
      await this.handleAuditEvent(message, AuditAction.UPDATE, 'asset');
    });

    this.logger.log('AuditConsumer subscriptions ready');
  }

  async onModuleDestroy() {
    await this.kafkaService.disconnect();
  }

  private async handleAuditEvent(payload: any, action: AuditAction, resourceType: string) {
    try {
      await this.auditService.logFromEvent({
        action,
        resourceType,
        resourceId: payload.id,
        resourceName: payload.email || payload.assetCode || payload.resourceName,
        userId: payload.userId || 'system',
        userName: payload.userName || payload.email || 'system',
        newValues: payload,
        description: payload.description,
        severity: 'INFO',
      });
    } catch (error) {
      this.logger.warn(`Failed to log audit event for ${resourceType}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
