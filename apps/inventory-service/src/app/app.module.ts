import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices'; 
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Asset } from './entities/asset.entity';
import { AuthLibModule } from '@sima-platform/auth-lib';

@Module({
  imports: [
    AuthLibModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'sima',
      password: 'password123',
      database: 'sima_core',
      entities: [Asset],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Asset]),
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}