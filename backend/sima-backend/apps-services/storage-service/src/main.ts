import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { StorageModule } from './storage.module';

async function bootstrap() {
  const app = await NestFactory.create(StorageModule);
  const logger = new Logger('StorageService');

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Storage Service API')
    .setDescription('File storage and management microservice for SIMA Platform')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('storage', 'Storage management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.STORAGE_SERVICE_PORT || 3008;
  await app.listen(port);
  logger.log(`Storage Service running on port ${port}`);
}

bootstrap();



