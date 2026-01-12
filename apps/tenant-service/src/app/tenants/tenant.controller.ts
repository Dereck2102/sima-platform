import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto, UpdateTenantDto, TenantResponseDto } from '@sima/domain';

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  async create(@Body() createTenantDto: CreateTenantDto): Promise<TenantResponseDto> {
    return this.tenantService.create(createTenantDto);
  }

  @Get()
  async findAll(): Promise<TenantResponseDto[]> {
    return this.tenantService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<TenantResponseDto> {
    return this.tenantService.findOne(id);
  }

  @Get('code/:code')
  async findByCode(@Param('code') code: string): Promise<TenantResponseDto> {
    return this.tenantService.findByCode(code);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto
  ): Promise<TenantResponseDto> {
    return this.tenantService.update(id, updateTenantDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.tenantService.remove(id);
    return { message: 'Tenant deactivated successfully' };
  }
}
