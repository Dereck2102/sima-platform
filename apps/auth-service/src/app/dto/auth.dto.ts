import { IsString, IsNotEmpty, IsEmail, MinLength, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsUUID()
  tenantId: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}