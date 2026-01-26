import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';

import { AuthModule } from './auth.module';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  

  const config = new DocumentBuilder()
    .setTitle('Auth Service')
    .setDescription('Authentication and JWT token management')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = 3001;
  await app.listen(port);
  console.log(`Auth Service running on http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error('Failed to start Auth Service:', err);
  process.exit(1);
});



