import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

export enum DeviceStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  MAINTENANCE = 'MAINTENANCE',
  ERROR = 'ERROR',
}

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  deviceId: string;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column({ type: 'enum', enum: DeviceStatus, default: DeviceStatus.OFFLINE })
  status: DeviceStatus;

  @Column()
  location: string;

  @Column({ nullable: true })
  lastSeen: Date;

  @Column({ type: 'jsonb', default: {} })
  metadata: any;

  @Column({ nullable: true })
  firmware: string;

  @Column({ nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn()
  @Exclude()
  updatedAt: Date;
}

@Entity('telemetry_data')
export class TelemetryData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  deviceId: string;

  @Column()
  metric: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ type: 'jsonb', nullable: true })
  tags: any;

  @CreateDateColumn()
  timestamp: Date;
}
