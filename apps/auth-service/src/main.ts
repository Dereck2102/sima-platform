import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error on unknown properties
      transform: true, // Auto-transform payloads to DTO types
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('SIMA Auth Service')
    .setDescription('Authentication and Authorization Service for SIMA Platform')
    .setVersion('2.0.0')
    .setContact(
      'Dereck Amacoria',
      'https://github.com/Dereck2102',
      'amacoriadereck@gmail.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .addTag('Authentication', 'User registration, login, and token management')
    .setContact(
      'Dereck Stevens Amacoria Chávez',
      'https://github.com/Dereck2102',
      'amacoriadereck@gmail.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3002; // Auth Service on port 3002
  await app.listen(port);

  Logger.log(`Auth Service running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
