import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app/app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('AuditService');
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'audit-consumer',
      },
    },
  });

  await app.startAllMicroservices();
  
  const port = process.env.PORT || 3002;
  await app.listen(port);
  
  logger.log(`Audit Service running on: http://localhost:${port}`);
}

bootstrap();
