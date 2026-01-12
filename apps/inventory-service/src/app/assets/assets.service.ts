import { Inject, Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common'; 
import { ClientKafka } from '@nestjs/microservices'; 
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAssetDto, AssetStatus } from '@sima/domain';
import { AssetEntity } from './asset.entity';

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);

  constructor(
    @InjectRepository(AssetEntity)
    private readonly assetRepository: Repository<AssetEntity>,
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka 
  ) {}

  async create(createAssetDto: CreateAssetDto, tenantId: string): Promise<AssetEntity> {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    const newAsset = this.assetRepository.create({
      ...createAssetDto,
      tenantId, // Inject tenantId from authenticated user
    });
    
    const savedAsset = await this.assetRepository.save(newAsset);

    this.kafkaClient.emit('asset.created', JSON.stringify(savedAsset));
    
    this.logger.log(`✅ Event emitted: asset.created for ID ${savedAsset.id} (Tenant: ${tenantId})`);

    return savedAsset;
  }

  async findAll(tenantId: string): Promise<AssetEntity[]> {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    // Automatically filter by tenant
    return await this.assetRepository.find({ where: { tenantId } });
  }

  async findOne(id: string, tenantId: string): Promise<AssetEntity> {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    // Ensure asset belongs to the tenant
    const asset = await this.assetRepository.findOne({ 
      where: { id, tenantId } 
    });
    
    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found or access denied`);
    }
    
    return asset;
  }

  async update(id: string, updateAssetDto: Partial<AssetEntity>, tenantId: string): Promise<AssetEntity> {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    // First verify the asset exists and belongs to the tenant
    const asset = await this.findOne(id, tenantId);

    // Merge the updates
    const updatedAsset = this.assetRepository.merge(asset, updateAssetDto);
    const savedAsset = await this.assetRepository.save(updatedAsset);

    // Emit Kafka event
    this.kafkaClient.emit('asset.updated', JSON.stringify(savedAsset));
    this.logger.log(`✅ Event emitted: asset.updated for ID ${savedAsset.id} (Tenant: ${tenantId})`);

    return savedAsset;
  }

  async softDelete(id: string, tenantId: string): Promise<{ message: string }> {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    // First verify the asset exists and belongs to the tenant
    const asset = await this.findOne(id, tenantId);

    // Soft delete by setting status to DECOMMISSIONED
    asset.status = AssetStatus.DECOMMISSIONED;
    await this.assetRepository.save(asset);

    // Emit Kafka event
    this.kafkaClient.emit('asset.deleted', JSON.stringify({ id, tenantId }));
    this.logger.log(`✅ Event emitted: asset.deleted for ID ${id} (Tenant: ${tenantId})`);

    return { message: `Asset ${id} has been deactivated successfully` };
  }
}