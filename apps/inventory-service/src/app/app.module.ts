import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthLibModule } from '@sima-platform/auth-lib';

import { AssetEntity } from './assets/asset.entity';
import { AssetsController } from './assets/assets.controller';
import { AssetsService } from './assets/assets.service';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    AuthLibModule,
    HealthModule,

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        entities: [AssetEntity],
        synchronize: true, 
      }),
      inject: [ConfigService],
    }),

    TypeOrmModule.forFeature([AssetEntity]),

     ClientsModule.register([
      {
        name: 'KAFKA_CLIENT',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'inventory',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'inventory-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AppModule {}