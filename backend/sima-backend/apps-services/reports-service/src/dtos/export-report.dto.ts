import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum ExportFormat {
  PDF = 'pdf',
  CSV = 'csv',
  XLSX = 'xlsx',
}

export class ExportReportDto {
  @IsEnum(ExportFormat)
  format!: ExportFormat;

  @IsOptional()
  @IsString()
  @MaxLength(254)
  deliveryEmail?: string;
}
