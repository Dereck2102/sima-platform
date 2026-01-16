import { UserRole } from '../dtos/auth.dto';

export interface IUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  tenantId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
