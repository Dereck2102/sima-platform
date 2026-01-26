import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ReportsModule } from './reports.module';

async function bootstrap() {
  const app = await NestFactory.create(ReportsModule);
  const logger = new Logger('ReportsService');

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
    .setTitle('Reports Service API')
    .setDescription('Report generation microservice for SIMA Platform')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('reports', 'Report management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.REPORTS_SERVICE_PORT || 3007;
  await app.listen(port);
  logger.log(`Reports Service running on port ${port}`);
}

bootstrap();

