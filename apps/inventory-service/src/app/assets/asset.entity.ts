import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { IAsset, AssetStatus, AssetCondition } from '@sima/domain';

@Entity('assets')
@Index(['tenantId'])
@Index(['tenantId', 'internalCode'], { unique: true })
export class AssetEntity implements IAsset {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  tenantId!: string;

  @Column()
  internalCode!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: AssetStatus,
    default: AssetStatus.ACTIVE
  })
  status!: AssetStatus;

  @Column({
    type: 'enum',
    enum: AssetCondition,
    default: AssetCondition.NEW
  })
  condition!: AssetCondition;

  @Column({ type: 'timestamp' })
  acquisitionDate!: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column()
  locationId!: string;

  @Column({ nullable: true })
  custodianId?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}