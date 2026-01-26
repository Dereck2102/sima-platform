import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, Logger, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { UsersModule } from './users.module';

async function bootstrap() {
  const app = await NestFactory.create(UsersModule);
  const logger = new Logger('UsersService');

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
    .setTitle('Users Service API')
    .setDescription('User management microservice for SIMA Platform')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('users', 'User management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.USERS_SERVICE_PORT || 3002;
  await app.listen(port);
  logger.log(`Users Service running on port ${port}`);
}

bootstrap();

