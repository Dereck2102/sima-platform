import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ 
    summary: 'Health check endpoint',
    description: 'Returns service health status for monitoring and load balancers'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Service is healthy',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2026-01-12T06:20:00.000Z',
        service: 'tenant-service',
        version: '2.0.0'
      }
    }
  })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'tenant-service',
      version: '2.0.0',
    };
  }

  @Get('ready')
  @ApiOperation({ 
    summary: 'Readiness check',
    description: 'Returns ready when service is ready to accept traffic'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Service is ready'
  })
  ready() {
    return { status: 'ready' };
  }

  @Get('live')
  @ApiOperation({ 
    summary: 'Liveness check',
    description: 'Returns alive if service is running'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Service is alive'
  })
  live() {
    return { status: 'alive' };
  }
}
