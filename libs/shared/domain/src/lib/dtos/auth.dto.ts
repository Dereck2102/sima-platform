import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserRole {
  ADMIN = 'admin',
  AUDITOR = 'auditor',
  OPERATOR = 'operator',
  VIEWER = 'viewer',
}

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'admin@uce.edu.ec',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'Juan Pérez García',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({
    description: 'User role in the system',
    enum: UserRole,
    default: UserRole.VIEWER,
    example: UserRole.ADMIN,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({
    description: 'Tenant ID (organization identifier)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  tenantId: string;
}

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'admin@uce.edu.ec',
    format: 'email',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePass123!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class TokenResponseDto {
  @ApiProperty({
    description: 'JWT access token (valid for 15 minutes)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token (valid for 7 days)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Access token expiration time in seconds',
    example: 900,
  })
  expiresIn: number;

  @ApiProperty({
    description: 'User information',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'admin@uce.edu.ec',
      fullName: 'Juan Pérez García',
      role: 'admin',
      tenantId: '123e4567-e89b-12d3-a456-426614174000',
    },
  })
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    tenantId: string;
  };
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token obtained from login or previous refresh',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  tenantId: string;
  iat?: number;
  exp?: number;
}
