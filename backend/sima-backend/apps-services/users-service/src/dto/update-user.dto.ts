import { IsEmail, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { UserRole } from '@sima/users';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  phone?: string;

  @IsOptional()
  department?: string;

  @IsOptional()
  avatar?: string;
}
