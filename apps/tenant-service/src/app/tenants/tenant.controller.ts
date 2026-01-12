import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { CreateTenantDto, UpdateTenantDto, TenantResponseDto } from '@sima/domain';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @ApiOperation({ summary: 'Create new tenant', description: 'Creates a new organization tenant' })
  @ApiResponse({ status: 201, description: 'Tenant created successfully', type: TenantResponseDto })
  @ApiResponse({ status: 409, description: 'Tenant code already exists' })
  async create(@Body() createTenantDto: CreateTenantDto): Promise<TenantResponseDto> {
    return this.tenantService.create(createTenantDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all tenants', description: 'Returns all active tenants' })
  @ApiResponse({ status: 200, description: 'Tenants retrieved successfully', type: [TenantResponseDto] })
  async findAll(): Promise<TenantResponseDto[]> {
    return this.tenantService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant by ID', description: 'Returns tenant information by UUID' })
  @ApiParam({ name: 'id', description: 'Tenant UUID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ status: 200, description: 'Tenant found', type: TenantResponseDto })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async findOne(@Param('id') id: string): Promise<TenantResponseDto> {
    return this.tenantService.findOne(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get tenant by code', description: 'Returns tenant information by unique code' })
  @ApiParam({ name: 'code', description: 'Tenant unique code', example: 'engineering' })
  @ApiResponse({ status: 200, description: 'Tenant found', type: TenantResponseDto })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async findByCode(@Param('code') code: string): Promise<TenantResponseDto> {
    return this.tenantService.findByCode(code);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tenant', description: 'Updates tenant information (partial update)' })
  @ApiParam({ name: 'id', description: 'Tenant UUID' })
  @ApiResponse({ status: 200, description: 'Tenant updated successfully', type: TenantResponseDto })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto
  ): Promise<TenantResponseDto> {
    return this.tenantService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate tenant', description: 'Soft deletes a tenant (sets isActive to false)' })
  @ApiParam({ name: 'id', description: 'Tenant UUID' })
  @ApiResponse({ status: 200, description: 'Tenant deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.tenantService.remove(id);
    return { message: 'Tenant deactivated successfully' };
  }
}
