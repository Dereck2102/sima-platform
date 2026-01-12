import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportType {
  ASSET_INVENTORY = 'ASSET_INVENTORY',
  ASSET_BY_LOCATION = 'ASSET_BY_LOCATION',
  ASSET_BY_CUSTODIAN = 'ASSET_BY_CUSTODIAN',
  ASSET_VALUATION = 'ASSET_VALUATION',
  MAINTENANCE_HISTORY = 'MAINTENANCE_HISTORY',
  AUDIT_LOG = 'AUDIT_LOG',
}

export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
  JSON = 'JSON',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export class GenerateReportDto {
  @ApiProperty({ enum: ReportType, description: 'Type of report to generate' })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiProperty({ enum: ReportFormat, default: ReportFormat.PDF })
  @IsEnum(ReportFormat)
  format: ReportFormat = ReportFormat.PDF;

  @ApiPropertyOptional({ description: 'Filter by location ID' })
  @IsOptional()
  @IsString()
  locationId?: string;

  @ApiPropertyOptional({ description: 'Filter by custodian ID' })
  @IsOptional()
  @IsString()
  custodianId?: string;

  @ApiPropertyOptional({ description: 'Start date for date range filter' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for date range filter' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Custom report title' })
  @IsOptional()
  @IsString()
  title?: string;
}

export interface ReportJob {
  id: string;
  type: ReportType;
  format: ReportFormat;
  status: ReportStatus;
  tenantId: string;
  createdAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
  error?: string;
}

export interface ReportData {
  title: string;
  generatedAt: Date;
  tenantId: string;
  summary: Record<string, unknown>;
  data: unknown[];
}
