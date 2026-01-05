import { Inject, Injectable, NotFoundException, Logger } from '@nestjs/common'; 
import { ClientKafka } from '@nestjs/microservices'; 
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAssetDto } from '@sima/domain';
import { AssetEntity } from './asset.entity';

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);

  constructor(
    @InjectRepository(AssetEntity)
    private readonly assetRepository: Repository<AssetEntity>,
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka 
  ) {}

  async create(createAssetDto: CreateAssetDto): Promise<AssetEntity> {
    const newAsset = this.assetRepository.create(createAssetDto);
    const savedAsset = await this.assetRepository.save(newAsset);

    this.kafkaClient.emit('asset.created', JSON.stringify(savedAsset));
    
    this.logger.log(` Event emitted: asset.created for ID ${savedAsset.id}`);

    return savedAsset;
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