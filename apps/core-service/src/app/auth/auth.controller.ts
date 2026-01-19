import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, TokenResponseDto } from '@sima/domain';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ 
    summary: 'Register new user',
    description: 'Creates a new user account and returns JWT tokens'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully registered',
    type: TokenResponseDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Email already registered'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input data'
  })
  async register(@Body() registerDto: RegisterDto): Promise<TokenResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticates user credentials and returns JWT tokens'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    type: TokenResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials or inactive user'
  })
  async login(@Body() loginDto: LoginDto): Promise<TokenResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({ 
    summary: 'Refresh access token',
    description: 'Generates new JWT tokens using a valid refresh token'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refreshed successfully',
    type: TokenResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid or expired refresh token'
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<TokenResponseDto> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get current user profile',
    description: 'Returns the authenticated user information (requires JWT token)'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile retrieved successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'admin@uce.edu.ec',
        fullName: 'Juan Pérez García',
        role: 'admin',
        tenantId: '123e4567-e89b-12d3-a456-426614174000'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token'
  })
  async getProfile(@Request() req) {
    return {
      id: req.user.id,
      email: req.user.email,
      fullName: req.user.fullName,
      role: req.user.role,
      tenantId: req.user.tenantId,
    };
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get all users for tenant',
    description: 'Returns all users for the authenticated user tenant. Requires admin role.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of users retrieved successfully'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin role required'
  })
  async getUsers(@Request() req) {
    const allowedRoles = ['super_admin', 'admin'];
    if (!allowedRoles.includes(req.user.role)) {
      return { error: 'Forbidden', message: 'Admin role required' };
    }
    return this.authService.findAllByTenant(req.user.tenantId);
  }
}
