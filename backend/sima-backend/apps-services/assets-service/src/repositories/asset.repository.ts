import { Injectable } from '@nestjs/common';
import { DataSource, Repository, UpdateResult, IsNull } from 'typeorm';
import { Asset, AssetStatus, AssetType } from '../entities/asset.entity';

@Injectable()
export class AssetRepository extends Repository<Asset> {
  constructor(private dataSource: DataSource) {
    super(Asset, dataSource.createEntityManager());
  }

  async findByAssetCode(assetCode: string): Promise<Asset | null> {
    return this.findOne({ where: { assetCode } });
  }

  async findActiveAssets(skip = 0, take = 10) {
    return this.find({
      where: { deletedAt: IsNull() },
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }

  async findByStatus(status: AssetStatus, skip = 0, take = 10) {
    return this.find({
      where: { status, deletedAt: IsNull() },
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }

  async findByType(type: AssetType, skip = 0, take = 10) {
    return this.find({
      where: { type, deletedAt: IsNull() },
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }

  async softDelete(id: string): Promise<UpdateResult> {
    return this.update(id, { deletedAt: new Date() });
  }

  async restore(id: string): Promise<UpdateResult> {
    return this.update(id, { deletedAt: null });
  }
}
