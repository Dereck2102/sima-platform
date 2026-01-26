import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Between } from 'typeorm';
import { KafkaService, KAFKA_TOPICS } from '@sima/messaging';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import { CreateAuditLogDto } from '../dto/create-audit-log.dto';
import { AuditLog, AuditAction } from '../entities/audit-log.entity';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    private readonly auditLogRepository: AuditLogRepository,
    private readonly kafkaService: KafkaService,
  ) {}

  async log(createAuditLogDto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(createAuditLogDto);
    const saved = await this.auditLogRepository.save(auditLog);

    this.emitAuditEvent(saved).catch((err) =>
      this.logger.warn(`Kafka emit failed AUDIT_LOG: ${err instanceof Error ? err.message : String(err)}`),
    );

    return saved;
  }

  async findAll(skip = 0, take = 10): Promise<{ logs: AuditLog[]; total: number }> {
    const [logs, total] = await Promise.all([
      this.auditLogRepository.find({
        skip,
        take,
        order: { createdAt: 'DESC' },
      }),
      this.auditLogRepository.count(),
    ]);

    return { logs, total };
  }

  async findOne(id: string): Promise<AuditLog> {
    const auditLog = await this.auditLogRepository.findOne({ where: { id } });

    if (!auditLog) {
      throw new NotFoundException(`Audit log with ID ${id} not found`);
    }

    return auditLog;
  }

  async findByUserId(userId: string, skip = 0, take = 10): Promise<{ logs: AuditLog[]; total: number }> {
    const logs = await this.auditLogRepository.findByUserId(userId, skip, take);
    const total = await this.auditLogRepository.count({ where: { userId } });

    return { logs, total };
  }

  async findByAction(action: AuditAction, skip = 0, take = 10): Promise<{ logs: AuditLog[]; total: number }> {
    const logs = await this.auditLogRepository.findByAction(action, skip, take);
    const total = await this.auditLogRepository.countByAction(action);

    return { logs, total };
  }

  async findByResourceType(resourceType: string, skip = 0, take = 10): Promise<{ logs: AuditLog[]; total: number }> {
    const logs = await this.auditLogRepository.findByResourceType(resourceType, skip, take);
    const total = await this.auditLogRepository.count({ where: { resourceType } });

    return { logs, total };
  }

  async findByDateRange(startDate: Date, endDate: Date, skip = 0, take = 10): Promise<{ logs: AuditLog[]; total: number }> {
    const logs = await this.auditLogRepository.findByDateRange(startDate, endDate, skip, take);
    const total = await this.auditLogRepository.count({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    return { logs, total };
  }

  async generateReport(startDate: Date, endDate: Date): Promise<any> {
    const logs = await this.auditLogRepository.findByDateRange(startDate, endDate, 0, 1000);
    
    const summary = {
      totalActions: logs.length,
      actionsByType: {},
      actionsByUser: {},
      criticalActions: 0,
    };

    logs.forEach((log) => {
      summary.actionsByType[log.action] = (summary.actionsByType[log.action] || 0) + 1;
      summary.actionsByUser[log.userId] = (summary.actionsByUser[log.userId] || 0) + 1;
      if (log.severity === 'CRITICAL') {
        summary.criticalActions++;
      }
    });

    return { summary, logs };
  }

  async logFromEvent(payload: Partial<CreateAuditLogDto> & { action?: AuditAction; resourceType?: string }) {
    const auditLog: CreateAuditLogDto = {
      userId: payload.userId || 'system',
      userName: payload.userName || 'system',
      action: payload.action || AuditAction.CREATE,
      resourceType: payload.resourceType || 'unknown',
      resourceId: payload.resourceId,
      resourceName: payload.resourceName,
      oldValues: payload.oldValues,
      newValues: payload.newValues,
      description: payload.description,
      severity: payload.severity || 'INFO',
      ipAddress: payload.ipAddress,
      userAgent: payload.userAgent,
      errorMessage: payload.errorMessage,
    };

    return this.log(auditLog);
  }

  private async emitAuditEvent(log: AuditLog) {
    await this.kafkaService.sendMessage(KAFKA_TOPICS.AUDIT_LOG, {
      id: log.id,
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      userId: log.userId,
      userName: log.userName,
      severity: log.severity,
      createdAt: log.createdAt,
    });
  }
}

