import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('files')
export class FileEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  filename!: string;

  @Column({ length: 120 })
  mimeType!: string;

  @Column('bigint')
  size!: number;

  @Column({ length: 255, nullable: true })
  description?: string | null;

  @Column({ length: 512, nullable: true })
  url?: string | null;

  @Column({ nullable: true })
  uploadedBy?: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
