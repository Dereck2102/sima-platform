import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class InitialSchema1737851200000 implements MigrationInterface {
  name = 'InitialSchema1737851200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // users
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isUnique: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'email', type: 'varchar', isUnique: true },
          { name: 'name', type: 'varchar' },
          { name: 'lastName', type: 'varchar', isNullable: true },
          { name: 'password', type: 'varchar' },
          { name: 'role', type: 'enum', enum: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER'], default: `'OPERATOR'` },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'phone', type: 'varchar', isNullable: true },
          { name: 'department', type: 'varchar', isNullable: true },
          { name: 'avatar', type: 'varchar', isNullable: true },
          { name: 'lastLogin', type: 'timestamp', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    // assets
    await queryRunner.createTable(
      new Table({
        name: 'assets',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isUnique: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'assetCode', type: 'varchar', isUnique: true },
          { name: 'name', type: 'varchar' },
          { name: 'type', type: 'enum', enum: ['HARDWARE', 'SOFTWARE', 'NETWORK', 'OTHER'] },
          { name: 'status', type: 'enum', enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'RETIRED'], default: `'ACTIVE'` },
          { name: 'description', type: 'varchar' },
          { name: 'location', type: 'varchar', isNullable: true },
          { name: 'assignedTo', type: 'varchar', isNullable: true },
          { name: 'purchasePrice', type: 'decimal', precision: 10, scale: 2 },
          { name: 'purchaseDate', type: 'timestamp', isNullable: true },
          { name: 'warrantyExpiration', type: 'timestamp', isNullable: true },
          { name: 'serialNumber', type: 'varchar', isNullable: true },
          { name: 'model', type: 'varchar', isNullable: true },
          { name: 'manufacturer', type: 'varchar', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
        ],
      }),
      true,
    );

    // devices
    await queryRunner.createTable(
      new Table({
        name: 'devices',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isUnique: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'deviceId', type: 'varchar', isUnique: true },
          { name: 'name', type: 'varchar' },
          { name: 'type', type: 'varchar' },
          { name: 'status', type: 'enum', enum: ['ONLINE', 'OFFLINE', 'MAINTENANCE', 'ERROR'], default: `'OFFLINE'` },
          { name: 'location', type: 'varchar' },
          { name: 'lastSeen', type: 'timestamp', isNullable: true },
          { name: 'metadata', type: 'jsonb', default: `'{}'` },
          { name: 'firmware', type: 'varchar', isNullable: true },
          { name: 'ipAddress', type: 'varchar', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    // telemetry_data
    await queryRunner.createTable(
      new Table({
        name: 'telemetry_data',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isUnique: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'deviceId', type: 'varchar' },
          { name: 'metric', type: 'varchar' },
          { name: 'value', type: 'decimal', precision: 10, scale: 2 },
          { name: 'tags', type: 'jsonb', isNullable: true },
          { name: 'timestamp', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    // audit_logs
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isUnique: true, generationStrategy: 'uuid', default: 'uuid_generate_v4()' },
          { name: 'userId', type: 'varchar' },
          { name: 'userName', type: 'varchar' },
          { name: 'action', type: 'enum', enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT'] },
          { name: 'resourceType', type: 'varchar' },
          { name: 'resourceId', type: 'varchar', isNullable: true },
          { name: 'resourceName', type: 'varchar', isNullable: true },
          { name: 'oldValues', type: 'jsonb', isNullable: true },
          { name: 'newValues', type: 'jsonb', isNullable: true },
          { name: 'ipAddress', type: 'varchar', isNullable: true },
          { name: 'userAgent', type: 'varchar', isNullable: true },
          { name: 'description', type: 'varchar', isNullable: true },
          { name: 'severity', type: 'varchar', default: `'INFO'` },
          { name: 'errorMessage', type: 'varchar', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndices('audit_logs', [
      new TableIndex({ name: 'IDX_audit_user_created', columnNames: ['userId', 'createdAt'] }),
      new TableIndex({ name: 'IDX_audit_action_created', columnNames: ['action', 'createdAt'] }),
      new TableIndex({ name: 'IDX_audit_resource_created', columnNames: ['resourceType', 'createdAt'] }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('audit_logs', 'IDX_audit_user_created');
    await queryRunner.dropIndex('audit_logs', 'IDX_audit_action_created');
    await queryRunner.dropIndex('audit_logs', 'IDX_audit_resource_created');

    await queryRunner.dropTable('audit_logs');
    await queryRunner.dropTable('telemetry_data');
    await queryRunner.dropTable('devices');
    await queryRunner.dropTable('assets');
    await queryRunner.dropTable('users');
  }
}
