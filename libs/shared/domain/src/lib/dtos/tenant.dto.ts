import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({
    description: 'Tenant organization name',
    example: 'Facultad de Ingeniería',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Unique tenant code identifier',
    example: 'engineering',
    pattern: '^[a-z0-9-]+$',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({
    description: 'Tenant description',
    example: 'Engineering Faculty - UCE',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Custom JSON settings for tenant configuration',
    example: { theme: 'dark', locale: 'es-EC' },
  })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
}

export class UpdateTenantDto {
  @ApiPropertyOptional({
    description: 'Updated tenant name',
    example: 'Facultad de Ingeniería y Ciencias Aplicadas',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated tenant description',
    example: 'Engineering and Applied Sciences Faculty - UCE',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Active status flag (soft delete)',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Updated custom settings',
    example: { theme: 'light', notifications: true },
  })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
}

export class TenantResponseDto {
  @ApiProperty({
    description: 'Tenant unique identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Tenant organization name',
    example: 'Facultad de Ingeniería',
  })
  name!: string;

  @ApiProperty({
    description: 'Unique tenant code',
    example: 'engineering',
  })
  code!: string;

  @ApiPropertyOptional({
    description: 'Tenant description',
    example: 'Engineering Faculty - UCE',
  })
  description?: string;

  @ApiProperty({
    description: 'Active status',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Custom tenant settings',
    example: { theme: 'dark', locale: 'es-EC' },
  })
  settings!: Record<string, any>;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-20T14:45:00Z',
  })
  updatedAt!: Date;
}
