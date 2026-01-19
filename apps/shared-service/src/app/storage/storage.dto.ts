import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum StorageBucket {
  ASSETS = 'assets',
  DOCUMENTS = 'documents',
  IMAGES = 'images',
  TEMP = 'temp',
}

export class UploadFileDto {
  @ApiProperty({ enum: StorageBucket, description: 'Target bucket' })
  @IsEnum(StorageBucket)
  bucket: StorageBucket;

  @ApiPropertyOptional({ description: 'Custom file path/name' })
  @IsOptional()
  @IsString()
  path?: string;
}

export class GetFileDto {
  @ApiProperty({ description: 'File key/path' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ enum: StorageBucket })
  @IsEnum(StorageBucket)
  bucket: StorageBucket;
}

export class DeleteFileDto {
  @ApiProperty({ description: 'File key/path' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ enum: StorageBucket })
  @IsEnum(StorageBucket)
  bucket: StorageBucket;
}

export interface FileMetadata {
  key: string;
  bucket: string;
  size: number;
  contentType: string;
  uploadedAt: Date;
  url: string;
}

export interface PresignedUrlResponse {
  url: string;
  expiresAt: Date;
  key: string;
}
