import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { User } from './libs/users/src/entities/user.entity';
import { Asset } from './apps-services/assets-service/src/entities/asset.entity';
import { AuditLog } from './apps-services/audit-service/src/entities/audit-log.entity';
import { Device, TelemetryData } from './apps-services/iot-service/src/entities/device.entity';
import { Report } from './apps-services/reports-service/src/entities/report.entity';
import { FileEntity } from './apps-services/storage-service/src/entities/file.entity';

const host = process.env.DATABASE_HOST || 'localhost';
const port = parseInt(process.env.DATABASE_PORT || '5432', 10);
const username = process.env.DATABASE_USER || 'sima_user';
const password = process.env.DATABASE_PASSWORD || 'change_me_in_production';
const database = process.env.DATABASE_NAME || 'sima_db';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host,
  port,
  username,
  password,
  database,
  entities: [User, Asset, AuditLog, Device, TelemetryData, Report, FileEntity],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: false,
});
