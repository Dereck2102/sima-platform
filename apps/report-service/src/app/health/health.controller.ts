import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  check() {
    return { status: 'ok', service: 'report-service', timestamp: new Date().toISOString() };
  }

  @Get('ready')
  ready() {
    return { status: 'ready', service: 'report-service' };
  }

  @Get('live')
  live() {
    return { status: 'alive', uptime: process.uptime() };
  }
}
