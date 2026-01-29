import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  ASSET_MANAGER = 'ASSET_MANAGER',
  ANALYST = 'ANALYST',
  MANAGER = 'MANAGER',
  OPERATOR = 'OPERATOR',
  VIEWER = 'VIEWER',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  lastName?: string | null;

  @Column()
  @Exclude()
  password!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.OPERATOR })
  role!: UserRole;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  phone?: string | null;

  @Column({ nullable: true })
  department?: string | null;

  @Column({ nullable: true })
  avatar?: string | null;

  @Column({ nullable: true })
  lastLogin?: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  @Exclude()
  deletedAt?: Date | null;
}
