import { Controller, Get, Query, Headers, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchAssetsDto } from './search.dto';

@ApiTags('Search')
@ApiBearerAuth('JWT-auth')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('assets')
  @ApiOperation({ 
    summary: 'Search assets',
    description: 'Full-text search with filters, pagination, and sorting'
  })
  @ApiResponse({ status: 200, description: 'Search results with pagination metadata' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'query', required: false, description: 'Search text' })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'MAINTENANCE', 'DECOMMISSIONED', 'LOST'] })
  @ApiQuery({ name: 'condition', required: false, enum: ['NEW', 'GOOD', 'FAIR', 'POOR'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async searchAssets(
    @Query() searchDto: SearchAssetsDto,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID is required');
    }
    return this.searchService.searchAssets(searchDto, tenantId);
  }

  @Get('suggestions')
  @ApiOperation({ 
    summary: 'Get search suggestions',
    description: 'Auto-complete suggestions based on partial query'
  })
  @ApiResponse({ status: 200, description: 'Array of suggestions' })
  @ApiQuery({ name: 'q', required: true, description: 'Partial search query (min 2 characters)' })
  async getSuggestions(
    @Query('q') query: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID is required');
    }
    return this.searchService.getSuggestions(query, tenantId);
  }
}
