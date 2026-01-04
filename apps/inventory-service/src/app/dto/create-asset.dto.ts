import { IsEnum, IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, IsUUID } from 'class-validator';
import { AssetStatus } from '../entities/asset.entity';

export class CreateAssetDto {
  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  inventoryCode: string;

  @IsNumber()
  @IsNotEmpty()
  purchasePrice: number;

  @IsDateString()
  @IsNotEmpty()
  purchaseDate: string;

  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;

  @IsOptional()
  @IsString()
  description?: string;
  
  @IsOptional()
  @IsString()
  serialNumber?: string;
}