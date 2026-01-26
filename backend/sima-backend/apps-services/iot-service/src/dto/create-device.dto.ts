import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DeviceStatus } from '../entities/device.entity';

export class CreateDeviceDto {
  @IsNotEmpty()
  @IsString()
  deviceId!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  type!: string;

  @IsEnum(DeviceStatus)
  @IsOptional()
  status?: DeviceStatus = DeviceStatus.OFFLINE;

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
