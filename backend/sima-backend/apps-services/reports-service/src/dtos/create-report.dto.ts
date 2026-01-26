import { IsOptional, IsString, IsEnum, IsObject, MaxLength } from 'class-validator';

export enum ReportType {
  SUMMARY = 'SUMMARY',
  DETAILED = 'DETAILED',
  ANALYTICS = 'ANALYTICS',
}

export class CreateReportDto {
  @IsString()
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsEnum(ReportType)
  type!: ReportType;

  @IsOptional()
  @IsObject()
  parameters?: Record<string, unknown>;
}
