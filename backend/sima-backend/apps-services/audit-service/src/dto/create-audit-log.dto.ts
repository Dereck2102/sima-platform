import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { AuditAction } from '../entities/audit-log.entity';

export class CreateAuditLogDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsNotEmpty()
  userName: string;

  @IsEnum(AuditAction)
  action: AuditAction;

  @IsNotEmpty()
  resourceType: string;

  @IsOptional()
  resourceId?: string;

  @IsOptional()
  resourceName?: string;

  @IsOptional()
  oldValues?: any;

  @IsOptional()
  newValues?: any;

  @IsOptional()
  ipAddress?: string;

  @IsOptional()
  userAgent?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  severity?: string;

  @IsOptional()
  errorMessage?: string;
}
