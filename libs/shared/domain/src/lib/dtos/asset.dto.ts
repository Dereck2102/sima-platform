import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { AssetStatus, AssetCondition } from '../interfaces/asset.interface';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  internalCode!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(AssetStatus)
  status!: AssetStatus;

  @IsEnum(AssetCondition)
  condition!: AssetCondition;

  @IsDateString()
  @IsOptional()
  acquisitionDate?: Date;

  @IsNumber()
  price!: number;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsString()
  @IsOptional()
  custodianId?: string;
}

export class UpdateAssetDto {
  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @IsOptional()
  @IsString()
  custodianId?: string;
  
  @IsOptional()
  @IsString()
  locationId?: string;
}