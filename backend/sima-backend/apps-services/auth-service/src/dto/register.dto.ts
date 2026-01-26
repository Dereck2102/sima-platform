import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { UserRole } from '@sima/users';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @MinLength(3)
  name!: string;

  @IsOptional()
  lastName?: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole = UserRole.OPERATOR;

  @IsOptional()
  phone?: string;

  @IsOptional()
  department?: string;
}
