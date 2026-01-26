import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, Logger, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AssetsModule } from './assets.module';


async function bootstrap() {
  const app = await NestFactory.create(AssetsModule);
  const logger = new Logger('AssetsService');

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

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  

  const config = new DocumentBuilder()
    .setTitle('Assets Service API')
    .setDescription('Asset management microservice for SIMA Platform')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('assets', 'Asset management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.ASSETS_SERVICE_PORT || 3003;
  await app.listen(port);
  logger.log(`Assets Service running on port ${port}`);
}

bootstrap();



