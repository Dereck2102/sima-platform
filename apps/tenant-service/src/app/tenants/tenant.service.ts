import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './tenant.entity';
import { CreateTenantDto, UpdateTenantDto, TenantResponseDto } from '@sima/domain';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<TenantResponseDto> {
    // Check if code already exists
    const existingTenant = await this.tenantRepository.findOne({
      where: { code: createTenantDto.code },
    });

    if (existingTenant) {
      throw new ConflictException(`Tenant with code "${createTenantDto.code}" already exists`);
    }

    const tenant = this.tenantRepository.create({
      ...createTenantDto,
      isActive: true,
      settings: createTenantDto.settings || {},
    });

    const savedTenant = await this.tenantRepository.save(tenant);
    return this.toResponseDto(savedTenant);
  }

  async findAll(): Promise<TenantResponseDto[]> {
    const tenants = await this.tenantRepository.find({
      order: { createdAt: 'DESC' },
    });
    return tenants.map(tenant => this.toResponseDto(tenant));
  }

  async findOne(id: string): Promise<TenantResponseDto> {
    const tenant = await this.tenantRepository.findOne({ where: { id } });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID "${id}" not found`);
    }

    return this.toResponseDto(tenant);
  }

  async findByCode(code: string): Promise<TenantResponseDto> {
    const tenant = await this.tenantRepository.findOne({ where: { code } });

    if (!tenant) {
      throw new NotFoundException(`Tenant with code "${code}" not found`);
    }

    return this.toResponseDto(tenant);
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<TenantResponseDto> {
    const tenant = await this.tenantRepository.findOne({ where: { id } });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID "${id}" not found`);
    }

    Object.assign(tenant, updateTenantDto);
    const updatedTenant = await this.tenantRepository.save(tenant);

    return this.toResponseDto(updatedTenant);
  }

  async remove(id: string): Promise<void> {
    const tenant = await this.tenantRepository.findOne({ where: { id } });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID "${id}" not found`);
    }

    // Soft delete: just mark as inactive
    tenant.isActive = false;
    await this.tenantRepository.save(tenant);
  }

  private toResponseDto(tenant: Tenant): TenantResponseDto {
    return {
      id: tenant.id,
      name: tenant.name,
      code: tenant.code,
      description: tenant.description,
      isActive: tenant.isActive,
      settings: tenant.settings,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };
  }
}
