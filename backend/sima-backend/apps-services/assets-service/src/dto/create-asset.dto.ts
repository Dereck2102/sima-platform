import { IsNotEmpty, IsEnum, IsOptional, IsNumber, IsDateString, IsUUID, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { AssetStatus, AssetType } from '../entities/asset.entity';

export class CreateAssetDto {
  @IsNotEmpty()
  assetCode: string;

  @IsNotEmpty()
  name: string;

  @IsEnum(AssetType)
  type: AssetType;

  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus = AssetStatus.ACTIVE;

  @IsNotEmpty()
  description: string;

  @IsOptional()
  location?: string;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  purchasePrice: number;

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
