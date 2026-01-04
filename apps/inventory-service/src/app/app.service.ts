import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from './entities/asset.entity';
import { CreateAssetDto } from './dto/create-asset.dto';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepo: Repository<Asset>,
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
  ) {}

  async createAsset(dto: CreateAssetDto): Promise<Asset> {
    const newAsset = this.assetRepo.create(dto);
    const savedAsset = await this.assetRepo.save(newAsset);
    this.kafkaClient.emit('asset.created', JSON.stringify(savedAsset));

    return savedAsset;
  }

  async getHello(): Promise<string> {
    return 'Inventory Service Operational';
  }
}