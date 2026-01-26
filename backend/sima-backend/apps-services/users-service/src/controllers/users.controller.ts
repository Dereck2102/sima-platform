import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  BadRequestException,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { User, UserRole } from '@sima/users';
import { JwtAuthGuard, RolesGuard, Roles } from '../guards/auth.guard';
import { ChangePasswordDto } from '../dto/change-password.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(
    @Query('skip') skip = 0,
    @Query('take') take = 10,
  ): Promise<{ users: User[]; total: number }> {
    if (skip < 0 || take < 1 || take > 100) {
      throw new BadRequestException('Invalid pagination parameters');
    }
    return this.usersService.findAll(skip, take);
  }

  @Get('role/:role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get users by role' })
  @ApiResponse({ status: 200, description: 'Users by role retrieved' })
  async findByRole(
    @Param('role') role: UserRole,
    @Query('skip') skip = 0,
    @Query('take') take = 10,
  ): Promise<{ users: User[]; total: number }> {
    return this.usersService.findByRole(role, skip, take);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  async findOne(@Param('id') id: string, @Req() req: any): Promise<User> {
    const requester = req.user;

    const isSelf = requester?.sub === id;
    const isAdmin = [UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(requester?.role);

    if (!isSelf && !isAdmin) {
      throw new ForbiddenException('You cannot access this user');
    }

    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Restore deleted user' })
  @ApiResponse({ status: 200, description: 'User restored successfully' })
  async restore(@Param('id') id: string): Promise<User> {
    return this.usersService.restore(id);
  }

  @Post(':id/change-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  async changePassword(
    @Param('id') id: string,
    @Body() { oldPassword, newPassword }: ChangePasswordDto,
    @Req() req: any,
  ): Promise<{ message: string }> {
    const requester = req.user;
    const isSelf = requester?.sub === id;
    const isAdmin = [UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(requester?.role);

    if (!isSelf && !isAdmin) {
      throw new ForbiddenException('You cannot change this password');
    }

    await this.usersService.changePassword(id, oldPassword, newPassword);
    return { message: 'Password changed successfully' };
  }
}
