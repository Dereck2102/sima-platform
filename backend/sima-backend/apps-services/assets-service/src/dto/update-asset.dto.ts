import { IsOptional, IsEnum, IsNumber, IsDateString, IsUUID, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { AssetStatus, AssetType } from '../entities/asset.entity';

export class UpdateAssetDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsEnum(AssetType)
  type?: AssetType;

  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @IsOptional()
  description?: string;

  @IsOptional()
  location?: string;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  purchasePrice?: number;

  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  purchaseDate?: Date;

  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  warrantyExpiration?: Date;

  @IsOptional()
  serialNumber?: string;

  @IsOptional()
  model?: string;

  @IsOptional()
  manufacturer?: string;
}
