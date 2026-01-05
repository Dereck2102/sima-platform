import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app/app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('AuditService');

  
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: ['localhost:9092'],
        },
        consumer: {
          groupId: 'audit-consumer-group',
        },
      },
    }
  );

  await app.listen();
  logger.log(' Audit Service is listening for Kafka events (Pure Microservice)...');
}

bootstrap();