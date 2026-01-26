import { Injectable } from '@nestjs/common';
import { DataSource, Repository, UpdateResult, IsNull } from 'typeorm';
import { User, UserRole } from '@sima/users';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findActiveUsers(skip = 0, take = 10) {
    return this.find({
      where: { isActive: true, deletedAt: IsNull() },
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }

  async countActiveUsers(): Promise<number> {
    return this.count({ where: { isActive: true, deletedAt: IsNull() } });
  }

  async findByRole(role: UserRole, skip = 0, take = 10) {
    return this.find({
      where: { role, isActive: true, deletedAt: IsNull() },
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }

  async softDelete(id: string): Promise<UpdateResult> {
    return this.update(id, { deletedAt: new Date() });
  }

  async restore(id: string): Promise<UpdateResult> {
    return this.update(id, { deletedAt: null });
  }
}
