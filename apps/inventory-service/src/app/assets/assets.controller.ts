import { Controller, Get, Post, Patch, Delete, Body, Param, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateAssetDto, UpdateAssetDto, getCurrentTenantId } from '@sima/domain';
import { JwtAuthGuard } from '@sima-platform/auth-lib';
import { AssetsService } from './assets.service';

@ApiTags('Assets')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new asset' })
  @ApiResponse({ status: 201, description: 'Asset created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT required' })
  create(@Body() createAssetDto: CreateAssetDto, @Request() req) {
    const tenantId = getCurrentTenantId(req);
    if (!tenantId) {
      throw new UnauthorizedException('Tenant context not found. Please authenticate.');
    }
    return this.assetsService.create(createAssetDto, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all assets for current tenant' })
  @ApiResponse({ status: 200, description: 'List of assets' })
  findAll(@Request() req) {
    const tenantId = getCurrentTenantId(req);
    if (!tenantId) {
      throw new UnauthorizedException('Tenant context not found. Please authenticate.');
    }
    return this.assetsService.findAll(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get asset by ID' })
  @ApiResponse({ status: 200, description: 'Asset details' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  findOne(@Param('id') id: string, @Request() req) {
    const tenantId = getCurrentTenantId(req);
    if (!tenantId) {
      throw new UnauthorizedException('Tenant context not found. Please authenticate.');
    }
    return this.assetsService.findOne(id, tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an asset' })
  @ApiResponse({ status: 200, description: 'Asset updated successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  update(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto, @Request() req) {
    const tenantId = getCurrentTenantId(req);
    if (!tenantId) {
      throw new UnauthorizedException('Tenant context not found. Please authenticate.');
    }
    return this.assetsService.update(id, updateAssetDto, tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete an asset (changes status to DISPOSED)' })
  @ApiResponse({ status: 200, description: 'Asset deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Asset not found' })
  remove(@Param('id') id: string, @Request() req) {
    const tenantId = getCurrentTenantId(req);
    if (!tenantId) {
      throw new UnauthorizedException('Tenant context not found. Please authenticate.');
    }
    return this.assetsService.softDelete(id, tenantId);
  }
}