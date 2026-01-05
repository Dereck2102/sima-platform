import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const globalPrefix = 'api';
  app.use(
    '/api/assets',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      pathRewrite: {
        '^/': '/api/assets/', // Re-agrega el prefijo al inicio
      },
    })
  );
  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(`API Gateway running on: http://localhost:${port}`);
  Logger.log(`Route Active: /api/assets -> http://localhost:3001/api/assets`);
}

bootstrap();
