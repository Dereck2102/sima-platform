import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, Logger, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AuditModule } from './audit.module';


async function bootstrap() {
  const app = await NestFactory.create(AuditModule);
  const logger = new Logger('AuditService');

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
    .setTitle('Audit Service API')
    .setDescription('Event logging and compliance microservice for SIMA Platform')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('audit', 'Audit log management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.AUDIT_SERVICE_PORT || 3004;
  await app.listen(port);
  logger.log(`Audit Service running on port ${port}`);
}

bootstrap();



