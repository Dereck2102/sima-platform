import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { AssetRepository } from '../repositories/asset.repository';
import { CreateAssetDto } from '../dto/create-asset.dto';
import { UpdateAssetDto } from '../dto/update-asset.dto';
import { Asset, AssetStatus, AssetType } from '../entities/asset.entity';
import { KafkaService, KAFKA_TOPICS } from '@sima/messaging';

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);

  constructor(
    private readonly assetRepository: AssetRepository,
    private readonly kafkaService: KafkaService,
  ) {}

  async create(createAssetDto: CreateAssetDto): Promise<Asset> {
    const existingAsset = await this.assetRepository.findByAssetCode(createAssetDto.assetCode);
    if (existingAsset) {
      throw new ConflictException('Asset with this code already exists');
    }

    const asset = this.assetRepository.create(createAssetDto);
    const saved = await this.assetRepository.save(asset);

    this.emitEvent(KAFKA_TOPICS.ASSET_CREATED, saved).catch((err) =>
      this.logger.warn(`Kafka emit failed ASSET_CREATED: ${err instanceof Error ? err.message : String(err)}`),
    );

    return saved;
  }

  async findAll(skip = 0, take = 10): Promise<{ assets: Asset[]; total: number }> {
    const [assets, total] = await Promise.all([
      this.assetRepository.findActiveAssets(skip, take),
      this.assetRepository.count({ where: { deletedAt: null } }),
    ]);

    return { assets, total };
  }

  async findOne(id: string): Promise<Asset> {
    const asset = await this.assetRepository.findOne({
      where: { id, deletedAt: null },
    });

    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    return asset;
  }

  async update(id: string, updateAssetDto: UpdateAssetDto): Promise<Asset> {
    const asset = await this.findOne(id);
    Object.assign(asset, updateAssetDto);
    const saved = await this.assetRepository.save(asset);

    this.emitEvent(KAFKA_TOPICS.ASSET_UPDATED, saved).catch((err) =>
      this.logger.warn(`Kafka emit failed ASSET_UPDATED: ${err instanceof Error ? err.message : String(err)}`),
    );

    return saved;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.assetRepository.softDelete(id);
  }

  async restore(id: string): Promise<Asset> {
    const asset = await this.assetRepository.findOne({ where: { id } });
    if (!asset) {
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    await this.assetRepository.restore(id);
    return this.findOne(id);
  }

  async findByStatus(status: AssetStatus, skip = 0, take = 10): Promise<{ assets: Asset[]; total: number }> {
    const assets = await this.assetRepository.findByStatus(status, skip, take);
    const total = await this.assetRepository.count({ where: { status, deletedAt: null } });

    return { assets, total };
  }

  async findByType(type: AssetType, skip = 0, take = 10): Promise<{ assets: Asset[]; total: number }> {
    const assets = await this.assetRepository.findByType(type, skip, take);
    const total = await this.assetRepository.count({ where: { type, deletedAt: null } });

    return { assets, total };
  }

  private async emitEvent(topic: KAFKA_TOPICS, asset: Asset) {
    await this.kafkaService.sendMessage(topic, {
      id: asset.id,
      assetCode: asset.assetCode,
      status: asset.status,
      type: asset.type,
      assignedTo: asset.assignedTo,
      timestamp: new Date().toISOString(),
    });
  }
}

