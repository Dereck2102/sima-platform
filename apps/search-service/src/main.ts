import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global prefix
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  
  // Validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  // Swagger
  const config = new DocumentBuilder()
    .setTitle('SIMA Search Service')
    .setDescription('Asset search with full-text, filters, and pagination')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'x-tenant-id', in: 'header' }, 'tenant-id')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  const port = process.env.PORT || 3008;
  await app.listen(port);
  Logger.log(`🔍 Search Service running on: http://localhost:${port}/${globalPrefix}`);
  Logger.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();

