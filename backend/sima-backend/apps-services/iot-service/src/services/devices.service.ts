import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { KafkaService, KAFKA_TOPICS } from '@sima/messaging';
import { DeviceRepository } from '../repositories/device.repository';
import { CreateDeviceDto } from '../dto/create-device.dto';
import { UpdateDeviceDto } from '../dto/update-device.dto';
import { TelemetryDto } from '../dto/telemetry.dto';
import { Device, DeviceStatus, TelemetryData } from '../entities/device.entity';

@Injectable()
export class DevicesService {
  private readonly logger = new Logger(DevicesService.name);

  constructor(
    private readonly deviceRepository: DeviceRepository,
    private readonly kafkaService: KafkaService,
  ) {}

  async registerDevice(dto: CreateDeviceDto): Promise<Device> {
    const existing = await this.deviceRepository.findByDeviceId(dto.deviceId);
    if (existing) {
      throw new ConflictException('Device with this deviceId already exists');
    }

    const device = this.deviceRepository.create(dto);
    const saved = await this.deviceRepository.save(device);

    this.emitDeviceEvent(KAFKA_TOPICS.TELEMETRY, {
      id: saved.id,
      deviceId: saved.deviceId,
      status: saved.status,
      type: saved.type,
      event: 'DEVICE_REGISTERED',
      timestamp: new Date().toISOString(),
    }).catch((err) => this.logger.warn(`Kafka emit failed DEVICE_REGISTERED: ${err instanceof Error ? err.message : String(err)}`));

    return saved;
  }

  async findAll(): Promise<{ devices: Device[]; total: number }> {
    const [devices, total] = await Promise.all([
      this.deviceRepository.find(),
      this.deviceRepository.count(),
    ]);
    return { devices, total };
  }

  async findOne(id: string): Promise<Device> {
    const device = await this.deviceRepository.findOne({ where: { id } });
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    return device;
  }

  async update(id: string, dto: UpdateDeviceDto): Promise<Device> {
    const device = await this.findOne(id);
    Object.assign(device, dto);
    const saved = await this.deviceRepository.save(device);

    this.emitDeviceEvent(KAFKA_TOPICS.TELEMETRY, {
      id: saved.id,
      deviceId: saved.deviceId,
      status: saved.status,
      type: saved.type,
      event: 'DEVICE_UPDATED',
      timestamp: new Date().toISOString(),
    }).catch((err) => this.logger.warn(`Kafka emit failed DEVICE_UPDATED: ${err instanceof Error ? err.message : String(err)}`));

    return saved;
  }

  async recordTelemetry(id: string, dto: TelemetryDto): Promise<TelemetryData> {
    const device = await this.findOne(id);

    await this.emitDeviceEvent(KAFKA_TOPICS.TELEMETRY, {
      id: device.id,
      deviceId: device.deviceId,
      metric: dto.metric,
      value: dto.value,
      tags: dto.tags,
      event: 'TELEMETRY',
      timestamp: new Date().toISOString(),
    });

    return {
      id: `telemetry-${Date.now()}`,
      deviceId: device.deviceId,
      metric: dto.metric,
      value: dto.value,
      tags: dto.tags,
      timestamp: new Date(),
    } as TelemetryData;
  }

  private async emitDeviceEvent(topic: KAFKA_TOPICS, payload: any) {
    await this.kafkaService.sendMessage(topic, payload);
  }
}
