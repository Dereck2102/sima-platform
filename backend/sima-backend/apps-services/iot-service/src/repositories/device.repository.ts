import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Device, DeviceStatus } from '../entities/device.entity';

@Injectable()
export class DeviceRepository extends Repository<Device> {
  constructor(private dataSource: DataSource) {
    super(Device, dataSource.createEntityManager());
  }

  async findByDeviceId(deviceId: string): Promise<Device | null> {
    return this.findOne({ where: { deviceId } });
  }

  async findByStatus(status: DeviceStatus) {
    return this.find({ where: { status } });
  }

  async findOnlineDevices() {
    return this.find({ where: { status: DeviceStatus.ONLINE } });
  }
}
