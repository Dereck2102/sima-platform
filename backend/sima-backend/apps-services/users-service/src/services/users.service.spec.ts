import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRepository } from '../repositories/user.repository';
import { User, UserRole } from '@sima/users';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { KafkaService } from '@sima/messaging';

describe('UsersService', () => {
  let service: UsersService;
  let repository: UserRepository;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    lastName: 'User',
    password: 'hashed_password',
    role: UserRole.OPERATOR,
    isActive: true,
    phone: '1234567890',
    department: 'IT',
    avatar: null,
    lastLogin: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findActiveUsers: jest.fn(),
            countActiveUsers: jest.fn(),
            findOne: jest.fn(),
            findByRole: jest.fn(),
            softDelete: jest.fn(),
            restore: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: KafkaService,
          useValue: {
            sendMessage: jest.fn().mockResolvedValue(undefined),
            disconnect: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      jest.spyOn(repository, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(mockUser);
      jest.spyOn(repository, 'save').mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);
      expect(result).toEqual(mockUser);
      expect(repository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw ConflictException if user already exists', async () => {
      const createUserDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      jest.spyOn(repository, 'findByEmail').mockResolvedValue(mockUser);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);

      const result = await service.findOne('1');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all users with pagination', async () => {
      jest.spyOn(repository, 'findActiveUsers').mockResolvedValue([mockUser]);
      jest.spyOn(repository, 'countActiveUsers').mockResolvedValue(1);

      const result = await service.findAll(0, 10);
      expect(result.users).toEqual([mockUser]);
      expect(result.total).toBe(1);
    });
  });

  describe('remove', () => {
    it('should soft delete a user', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(repository, 'softDelete').mockResolvedValue({} as any);

      await service.remove('1');
      expect(repository.softDelete).toHaveBeenCalledWith('1');
    });
  });
});
