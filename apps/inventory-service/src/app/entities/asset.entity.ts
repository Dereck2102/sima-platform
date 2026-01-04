import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum AssetStatus {
  OPERATIONAL = 'OPERATIONAL',
  MAINTENANCE = 'MAINTENANCE',
  DAMAGED = 'DAMAGED',
  WRITTEN_OFF = 'WRITTEN_OFF',
  MISSING = 'MISSING',
}

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string; // Critical for Multi-Tenancy

  @Column({ name: 'inventory_code', unique: true })
  inventoryCode: string; // e.g., UCE-MUE-2024-001

  @Column({ name: 'bar_code', nullable: true })
  barCode: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'brand_id', nullable: true })
  brandId: string;

  @Column({ name: 'model_id', nullable: true })
  modelId: string;

  @Column({ name: 'serial_number', nullable: true })
  serialNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'purchase_price' })
  purchasePrice: number;

  @Column({ type: 'date', name: 'purchase_date' })
  purchaseDate: Date;

  @Column({ type: 'enum', enum: AssetStatus, default: AssetStatus.OPERATIONAL })
  status: AssetStatus;

  @Column({ name: 'custodian_id', type: 'uuid', nullable: true })
  custodianId: string; // Relational link to User (Auth Service)

  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId: string;

  @Column({ type: 'jsonb', nullable: true })
  specifications: Record<string, any>; // Flexible attributes (EAV pattern replacement)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}