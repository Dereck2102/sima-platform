import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DeviceStatus } from '../entities/device.entity';

export class UpdateDeviceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsEnum(DeviceStatus)
  status?: DeviceStatus;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  firmware?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}
