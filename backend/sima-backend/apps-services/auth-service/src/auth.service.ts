import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { KafkaService, KAFKA_TOPICS } from '@sima/messaging';
import { Repository, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '@sima/users';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
  type: 'access' | 'refresh';
};

@Injectable()
export class AuthService {
  private readonly accessExpiresIn = process.env.JWT_EXPIRATION || '900s';
  private readonly refreshExpiresIn = process.env.REFRESH_TOKEN_EXPIRATION || '604800s';
  private readonly jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly kafkaService: KafkaService,
  ) {}

  async login({ email, password }: LoginDto) {
    const user = await this.validateUser(email, password);
    await this.usersRepository.update(user.id, { lastLogin: new Date() });
    return this.buildAuthResponse(user);
  }

  async register(payload: RegisterDto) {
    await this.ensureEmailAvailable(payload.email);

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = this.usersRepository.create({
      ...payload,
      role: payload.role || UserRole.OPERATOR,
      password: passwordHash,
      isActive: true,
    });

    const saved = await this.usersRepository.save(user);
    await this.emitUserEvent(KAFKA_TOPICS.USER_CREATED, saved);

    return this.buildAuthResponse(saved);
  }

  async refreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, { secret: this.jwtSecret });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token type');
      }

      const user = await this.findActiveUser(payload.sub);
      return this.buildAuthResponse(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userId: string) {
    const user = await this.findActiveUser(userId);
    return this.sanitizeUser(user);
  }

  private async ensureEmailAvailable(email: string) {
    const existing = await this.usersRepository.findOne({ where: { email, deletedAt: IsNull() } });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }
  }

  private async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email, isActive: true, deletedAt: IsNull() } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  private async findActiveUser(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id, isActive: true, deletedAt: IsNull() } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private buildPayload(user: User, type: 'access' | 'refresh'): JwtPayload {
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      type,
    };
  }

  private buildTokens(user: User) {
    const accessPayload = this.buildPayload(user, 'access');
    const refreshPayload = this.buildPayload(user, 'refresh');

    return {
      accessToken: this.jwtService.sign(accessPayload, {
        secret: this.jwtSecret,
        expiresIn: this.accessExpiresIn,
      }),
      refreshToken: this.jwtService.sign(refreshPayload, {
        secret: this.jwtSecret,
        expiresIn: this.refreshExpiresIn,
      }),
      expiresIn: this.accessExpiresIn,
    };
  }

  private sanitizeUser(user: User) {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  private buildAuthResponse(user: User) {
    const tokens = this.buildTokens(user);
    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  private async emitUserEvent(topic: KAFKA_TOPICS, user: User) {
    try {
      await this.kafkaService.sendMessage(topic, {
        id: user.id,
        email: user.email,
        role: user.role,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // Avoid breaking the request on messaging errors; log and continue
      // eslint-disable-next-line no-console
      console.warn(`Kafka emit failed for ${topic}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
