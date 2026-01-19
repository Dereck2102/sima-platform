import { Injectable, UnauthorizedException, ConflictException, BadRequestException, OnModuleInit, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { LoginDto, RegisterDto, TokenResponseDto, JwtPayload, UserRole } from '@sima/domain';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async onModuleInit() {
    await this.seedSuperAdmin();
  }

  async seedSuperAdmin() {
    const email = 'dsamacoria@uce.edu.ec';
    
    // Demote any existing admin@uce.edu.ec to viewer
    const oldAdmin = await this.userRepository.findOne({ where: { email: 'admin@uce.edu.ec' } });
    if (oldAdmin && oldAdmin.role === UserRole.SUPER_ADMIN) {
      oldAdmin.role = UserRole.VIEWER;
      await this.userRepository.save(oldAdmin);
      this.logger.log('Demoted admin@uce.edu.ec to viewer role');
    }

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      this.logger.log(`Seeding super_admin user: ${email}`);
      const passwordHash = await bcrypt.hash('Admin123!', 10);
      const superAdmin = this.userRepository.create({
        email,
        passwordHash,
        fullName: 'Dereck Amacoria',
        role: UserRole.SUPER_ADMIN,
        tenantId: '123e4567-e89b-12d3-a456-426614174000',
        isActive: true,
      });
      await this.userRepository.save(superAdmin);
      this.logger.log('Super admin user created successfully');
    } else {
      // Ensure role and name are correct even if user exists
      let updated = false;
      if (user.role !== UserRole.SUPER_ADMIN) {
        user.role = UserRole.SUPER_ADMIN;
        updated = true;
      }
      if (user.fullName !== 'Dereck Amacoria') {
        user.fullName = 'Dereck Amacoria';
        updated = true;
      }
      if (updated) {
        await this.userRepository.save(user);
        this.logger.log(`Updated user ${email} to super_admin with correct name`);
      }
    }
  }

  async register(registerDto: RegisterDto): Promise<TokenResponseDto> {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      email: registerDto.email,
      passwordHash,
      fullName: registerDto.fullName,
      role: registerDto.role || UserRole.VIEWER,
      tenantId: registerDto.tenantId,
      isActive: true,
    });

    await this.userRepository.save(user);

    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async refreshToken(refreshToken: string): Promise<TokenResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  async findAllByTenant(tenantId: string) {
    const users = await this.userRepository.find({
      where: { tenantId },
      select: ['id', 'email', 'fullName', 'role', 'isActive', 'tenantId', 'createdAt', 'updatedAt'],
      order: { createdAt: 'DESC' },
    });
    return users;
  }

  private generateTokens(user: User): TokenResponseDto {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'secret-key',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }
}
