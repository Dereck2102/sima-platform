import { Controller, Get, Post, Body, Param, Request, UnauthorizedException } from '@nestjs/common';
import { CreateAssetDto, getCurrentTenantId } from '@sima/domain';
import { AssetsService } from './assets.service';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  create(@Body() createAssetDto: CreateAssetDto, @Request() req) {
    const tenantId = getCurrentTenantId(req);
    if (!tenantId) {
      throw new UnauthorizedException('Tenant context not found. Please authenticate.');
    }
    return this.assetsService.create(createAssetDto, tenantId);
  }

  @Get()
  findAll(@Request() req) {
    const tenantId = getCurrentTenantId(req);
    if (!tenantId) {
      throw new UnauthorizedException('Tenant context not found. Please authenticate.');
    }
    return this.assetsService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const tenantId = getCurrentTenantId(req);
    if (!tenantId) {
      throw new UnauthorizedException('Tenant context not found. Please authenticate.');
    }
    return this.assetsService.findOne(id, tenantId);
  }
}