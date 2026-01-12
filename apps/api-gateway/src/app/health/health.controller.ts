import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('Health')
@Controller('health')
@SkipThrottle() // Health checks should not be rate limited
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  check() {
    return {
      status: 'ok',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe - checks if service can handle traffic' })
  @ApiResponse({ status: 200, description: 'Service is ready to handle traffic' })
  ready() {
    // Add downstream service checks here if needed
    return {
      status: 'ready',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      checks: {
        self: 'ok',
        // TODO: Add checks for auth-service, tenant-service, inventory-service
      },
    };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe - checks if service is running' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  live() {
    return {
      status: 'alive',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
