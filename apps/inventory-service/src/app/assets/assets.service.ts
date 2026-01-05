import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAssetDto } from '@sima/domain';
import { AssetEntity } from './asset.entity';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(AssetEntity)
    private readonly assetRepository: Repository<AssetEntity>
  ) {}

  async create(createAssetDto: CreateAssetDto): Promise<AssetEntity> {
    const newAsset = this.assetRepository.create(createAssetDto);
    return await this.assetRepository.save(newAsset);
  }

  async findAll(): Promise<AssetEntity[]> {
    return await this.assetRepository.find();
  }

  async findOne(id: string): Promise<AssetEntity> {
    const asset = await this.assetRepository.findOneBy({ id });
    if (!asset) throw new NotFoundException(`Asset with ID ${id} not found`);
    return asset;
  }
}