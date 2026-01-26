import { Injectable, BadRequestException, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { IsNull } from 'typeorm';
import { User, UserRole } from '@sima/users';
import { KafkaService, KAFKA_TOPICS } from '@sima/messaging';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly kafkaService: KafkaService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const saved = await this.userRepository.save(user);

    // Emit event (non-blocking best effort)
    this.kafkaService
      .sendMessage(KAFKA_TOPICS.USER_CREATED, {
        id: saved.id,
        email: saved.email,
        role: saved.role,
        timestamp: new Date().toISOString(),
      })
      .catch((err: unknown) => this.logger.warn(`Kafka emit failed USER_CREATED: ${err instanceof Error ? err.message : String(err)}`));

    return saved;
  }

  async findAll(skip = 0, take = 10): Promise<{ users: User[]; total: number }> {
    const [users, total] = await Promise.all([
      this.userRepository.findActiveUsers(skip, take),
      this.userRepository.countActiveUsers(),
    ]);

    return { users, total };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull(), isActive: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    Object.assign(user, updateUserDto);
    const saved = await this.userRepository.save(user);

    this.kafkaService
      .sendMessage(KAFKA_TOPICS.USER_UPDATED, {
        id: saved.id,
        email: saved.email,
        role: saved.role,
        timestamp: new Date().toISOString(),
      })
      .catch((err: unknown) => this.logger.warn(`Kafka emit failed USER_UPDATED: ${err instanceof Error ? err.message : String(err)}`));

    return saved;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.userRepository.softDelete(id);
  }

  async restore(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.restore(id);
    return this.findOne(id);
  }

  async findByRole(role: UserRole, skip = 0, take = 10): Promise<{ users: User[]; total: number }> {
    const users = await this.userRepository.findByRole(role, skip, take);
    const total = await this.userRepository.count({
      where: { role, isActive: true, deletedAt: IsNull() },
    });

    return { users, total };
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { lastLogin: new Date() });
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async changePassword(id: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.findOne(id);

    const isPasswordValid = await this.validatePassword(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid current password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(id, { password: hashedPassword });
  }
}

