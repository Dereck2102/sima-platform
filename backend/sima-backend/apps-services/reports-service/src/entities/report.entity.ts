import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ReportType } from '../dtos/create-report.dto';

export enum ReportStatus {
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  QUEUED = 'queued',
}

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 120 })
  title!: string;

  @Column({ length: 500, nullable: true })
  description?: string | null;

  @Column({ type: 'enum', enum: ReportType })
  type!: ReportType;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PROCESSING })
  status!: ReportStatus;

  @Column({ type: 'jsonb', nullable: true })
  parameters?: Record<string, unknown> | null;

  @Column({ nullable: true })
  requestedBy?: string | null;

  @Column({ nullable: true })
  generatedAt?: Date | null;

  @Column({ nullable: true })
  downloadUrl?: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
