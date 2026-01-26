import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AuditLog, AuditAction } from '../entities/audit-log.entity';

@Injectable()
export class AuditLogRepository extends Repository<AuditLog> {
  constructor(private dataSource: DataSource) {
    super(AuditLog, dataSource.createEntityManager());
  }

  async findByUserId(userId: string, skip = 0, take = 10) {
    return this.find({
      where: { userId },
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }

  async findByAction(action: AuditAction, skip = 0, take = 10) {
    return this.find({
      where: { action },
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }

  async findByResourceType(resourceType: string, skip = 0, take = 10) {
    return this.find({
      where: { resourceType },
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date, skip = 0, take = 10) {
    return this.createQueryBuilder('audit')
      .where('audit.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .skip(skip)
      .take(take)
      .orderBy('audit.createdAt', 'DESC')
      .getMany();
  }

  async countByAction(action: AuditAction): Promise<number> {
    return this.count({ where: { action } });
  }
}
