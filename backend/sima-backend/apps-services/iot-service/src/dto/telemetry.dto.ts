import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class TelemetryDto {
  @IsNotEmpty()
  @IsString()
  metric!: string;

  @IsNotEmpty()
  @IsNumber()
  value!: number;

  @IsOptional()
  tags?: Record<string, any>;
}
