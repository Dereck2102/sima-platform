import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { Exclude } from 'class-transformer';

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
}

@Entity('audit_logs')
@Index(['userId', 'createdAt'])
@Index(['action', 'createdAt'])
@Index(['resourceType', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  userName: string;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column()
  resourceType: string;

  @Column({ nullable: true })
  resourceId: string;

  @Column({ nullable: true })
  resourceName: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValues: any;

  @Column({ type: 'jsonb', nullable: true })
  newValues: any;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'INFO' })
  severity: string;

  @Column({ nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  @CreateDateColumn()
  @Exclude()
  createdAt: Date;
}
