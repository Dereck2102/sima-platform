import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum UserRole {
  ADMIN = 'ADMIN',
  CUSTODIAN = 'CUSTODIAN',
  AUDITOR = 'AUDITOR',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Hashed!

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string; // The organization they belong to

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTODIAN })
  role: UserRole;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}