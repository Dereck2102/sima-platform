import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const globalPrefix = 'api';
  const defaultPort = 3001; // Inventory Service Port
  const port = process.env.PORT || defaultPort;

  app.setGlobalPrefix(globalPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  await app.listen(port);
  
  Logger.log(
    `Inventory Service is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();