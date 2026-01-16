import { Inject, Injectable, NotFoundException, Logger, BadRequestException, OnModuleInit, Optional } from '@nestjs/common'; 
import { ClientKafka } from '@nestjs/microservices'; 
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAssetDto, AssetStatus } from '@sima/domain';
import { AssetEntity } from './asset.entity';

@Injectable()
export class AssetsService implements OnModuleInit {
  private readonly logger = new Logger(AssetsService.name);
  private kafkaConnected = false;

  constructor(
    @InjectRepository(AssetEntity)
    private readonly assetRepository: Repository<AssetEntity>,
    @Inject('KAFKA_CLIENT') @Optional() private readonly kafkaClient?: ClientKafka 
  ) {}

  async onModuleInit() {
    if (this.kafkaClient) {
      try {
        await this.kafkaClient.connect();
        this.kafkaConnected = true;
        this.logger.log('✅ Kafka client connected successfully');
      } catch (error) {
        this.logger.warn('⚠️ Kafka client connection failed - events will not be emitted');
        this.kafkaConnected = false;
      }
    }
  }

  private emitEvent(topic: string, data: any) {
    if (this.kafkaConnected && this.kafkaClient) {
      try {
        this.kafkaClient.emit(topic, JSON.stringify(data));
        this.logger.log(`✅ Event emitted: ${topic}`);
      } catch (error) {
        this.logger.warn(`⚠️ Failed to emit event: ${topic}`);
      }
    }
  }

  async create(createAssetDto: CreateAssetDto, tenantId: string): Promise<AssetEntity> {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    const newAsset = this.assetRepository.create({
      ...createAssetDto,
      tenantId, // Inject tenantId from authenticated user
    });
    
    const savedAsset = await this.assetRepository.save(newAsset);

    this.emitEvent('asset.created', savedAsset);

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

    this.emitEvent('asset.updated', savedAsset);

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

    this.emitEvent('asset.deleted', { id, tenantId });

    return { message: `Asset ${id} has been deactivated successfully` };
  }
}