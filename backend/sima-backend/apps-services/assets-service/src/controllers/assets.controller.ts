import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AssetsService } from '../services/assets.service';
import { CreateAssetDto } from '../dto/create-asset.dto';
import { UpdateAssetDto } from '../dto/update-asset.dto';
import { Asset, AssetStatus, AssetType } from '../entities/asset.entity';
import { JwtAuthGuard, RolesGuard, Roles } from '@sima/shared';
import { UserRole } from '@sima/users';

@ApiTags('assets')
@ApiBearerAuth()
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ASSET_MANAGER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new asset' })
  @ApiResponse({ status: 201, description: 'Asset created successfully' })
  async create(@Body() createAssetDto: CreateAssetDto): Promise<Asset> {
    return this.assetsService.create(createAssetDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all assets with pagination' })
  @ApiResponse({ status: 200, description: 'Assets retrieved successfully' })
  async findAll(
    @Query('skip') skip = 0,
    @Query('take') take = 10,
  ): Promise<{ assets: Asset[]; total: number }> {
    return this.assetsService.findAll(skip, take);
  }

  @Get('status/:status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get assets by status' })
  async findByStatus(
    @Param('status') status: AssetStatus,
    @Query('skip') skip = 0,
    @Query('take') take = 10,
  ): Promise<{ assets: Asset[]; total: number }> {
    return this.assetsService.findByStatus(status, skip, take);
  }

  @Get('type/:type')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get assets by type' })
  async findByType(
    @Param('type') type: AssetType,
    @Query('skip') skip = 0,
    @Query('take') take = 10,
  ): Promise<{ assets: Asset[]; total: number }> {
    return this.assetsService.findByType(type, skip, take);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get asset by ID' })
  async findOne(@Param('id') id: string): Promise<Asset> {
    return this.assetsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ASSET_MANAGER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update asset' })
  async update(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto): Promise<Asset> {
    return this.assetsService.update(id, updateAssetDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete asset (soft delete)' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.assetsService.remove(id);
  }

  @Post(':id/restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Restore deleted asset' })
  async restore(@Param('id') id: string): Promise<Asset> {
    return this.assetsService.restore(id);
  }
}
