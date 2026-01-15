/**
 * SIMA Mobile BFF (Backend for Frontend)
 * Optimized API for mobile applications with data aggregation and caching.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global prefix
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // CORS
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('SIMA Mobile BFF')
    .setDescription(`
      Backend for Frontend optimized for mobile applications.
      
      **Features:**
      - Data aggregation from multiple services
      - Response caching for faster mobile experience
      - Optimized payloads for mobile network bandwidth
      
      **Endpoints:**
      - \`/api/mobile/dashboard\` - Complete dashboard (1 request = all data)
      - \`/api/mobile/dashboard/stats\` - Quick stats only
      - \`/api/mobile/assets/recent\` - Recent assets
      - \`/api/health\` - Health checks
    `)
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT-auth',
    )
    .addApiKey(
      { type: 'apiKey', name: 'x-tenant-id', in: 'header' },
      'tenant-id',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start server
  const port = process.env.PORT || 3011;
  await app.listen(port);

  Logger.log(`🚀 Mobile BFF running on: http://localhost:${port}/${globalPrefix}`);
  Logger.log(`📚 Swagger docs: http://localhost:${port}/${globalPrefix}/docs`);
}

bootstrap();
