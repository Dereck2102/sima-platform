import { 
  Controller, 
  Get, 
  Query, 
  Headers, 
  UnauthorizedException,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiHeader,
  ApiQuery,
} from '@nestjs/swagger';
import { DashboardService, DashboardData, DashboardStats, AssetSummary } from './dashboard.service';

@ApiTags('Mobile Dashboard')
@ApiBearerAuth('JWT-auth')
@ApiHeader({ name: 'x-tenant-id', required: true, description: 'Tenant identifier' })
@Controller('mobile')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dashboard')
  @ApiOperation({ 
    summary: 'Get complete dashboard',
    description: 'Aggregates user info, stats, recent assets, and notifications in a single request. Optimized for mobile with caching.'
  })
  @ApiResponse({ status: 200, description: 'Dashboard data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getDashboard(
    @Headers('authorization') authorization: string,
    @Headers('x-tenant-id') tenantId: string,
  ): Promise<DashboardData> {
    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID is required');
    }
    
    if (!authorization) {
      throw new UnauthorizedException('Authorization token is required');
    }

    return this.dashboardService.getDashboard(authorization, tenantId);
  }

  @Get('dashboard/stats')
  @ApiOperation({ 
    summary: 'Get quick stats only',
    description: 'Returns only statistics for a lighter payload. Cached for 30 seconds.'
  })
  @ApiResponse({ status: 200, description: 'Dashboard statistics' })
  async getStats(
    @Headers('x-tenant-id') tenantId: string,
  ): Promise<DashboardStats> {
    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID is required');
    }

    return this.dashboardService.getStats(tenantId);
  }

  @Get('assets/recent')
  @ApiOperation({ 
    summary: 'Get recent assets',
    description: 'Returns the most recently updated assets. Cached for 2 minutes.'
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of assets (default: 10, max: 50)' })
  @ApiResponse({ status: 200, description: 'List of recent assets' })
  async getRecentAssets(
    @Headers('x-tenant-id') tenantId: string,
    @Query('limit') limit?: number,
  ): Promise<AssetSummary[]> {
    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID is required');
    }

    const effectiveLimit = Math.min(limit || 10, 50);
    return this.dashboardService.getRecentAssets(tenantId, effectiveLimit);
  }

  @Delete('cache')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Invalidate cache',
    description: 'Force refresh of cached data for the tenant'
  })
  @ApiResponse({ status: 204, description: 'Cache invalidated' })
  async invalidateCache(
    @Headers('x-tenant-id') tenantId: string,
  ): Promise<void> {
    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID is required');
    }

    await this.dashboardService.invalidateCache(tenantId);
  }
}
