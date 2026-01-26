import { Exclude } from 'class-transformer';
import { UserRole } from '@sima/users';

export class UserResponseDto {
  id!: string;
  email!: string;
  name!: string;
  lastName?: string | null;
  role!: UserRole;
  isActive!: boolean;
  phone?: string | null;
  department?: string | null;
  avatar?: string | null;
  lastLogin?: Date | null;
  createdAt!: Date;
  updatedAt!: Date;

  @Exclude()
  password!: string;

  @Exclude()
  deletedAt?: Date | null;
}
