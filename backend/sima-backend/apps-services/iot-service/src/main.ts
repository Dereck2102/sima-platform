import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, Logger, ClassSerializerInterceptor } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IotModule } from './iot.module';


async function bootstrap() {
  const app = await NestFactory.create(IotModule);
  const logger = new Logger('IoTService');

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  

  const config = new DocumentBuilder()
    .setTitle('IoT Service API')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.IOT_SERVICE_PORT || 3005;
  await app.listen(port);
  logger.log(`IoT Service running on port ${port}`);
}

bootstrap();



