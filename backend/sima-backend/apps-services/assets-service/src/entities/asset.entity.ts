import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

export enum AssetStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
  RETIRED = 'RETIRED',
}

export enum AssetType {
  HARDWARE = 'HARDWARE',
  SOFTWARE = 'SOFTWARE',
  NETWORK = 'NETWORK',
  OTHER = 'OTHER',
}

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  assetCode: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: AssetType })
  type: AssetType;

  @Column({ type: 'enum', enum: AssetStatus, default: AssetStatus.ACTIVE })
  status: AssetStatus;

  @Column()
  description: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  assignedTo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  purchasePrice: number;

  @Column({ nullable: true })
  purchaseDate: Date;

  @Column({ nullable: true })
  warrantyExpiration: Date;

  @Column({ nullable: true })
  serialNumber: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  manufacturer: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  @Exclude()
  deletedAt: Date | null;
}
