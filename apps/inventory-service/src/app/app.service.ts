import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from './entities/asset.entity';
import { CreateAssetDto } from './dto/create-asset.dto';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepo: Repository<Asset>,
  ) {}

  async createAsset(dto: CreateAssetDto): Promise<Asset> {
    const newAsset = this.assetRepo.create(dto);
    return await this.assetRepo.save(newAsset);
  }

  async getHello(): Promise<string> {
    return 'Inventory Service Operational';
  }
}
