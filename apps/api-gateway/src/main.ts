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

  // Proxy for Auth Service (port 3002)
  app.use(
    '/api/auth',
    createProxyMiddleware({
      target: 'http://localhost:3002',
      changeOrigin: true,
      pathRewrite: {
        '^/': '/api/auth/',
      },
    })
  );

  // Proxy for Tenant Service (port 3003)
  app.use(
    '/api/tenants',
    createProxyMiddleware({
      target: 'http://localhost:3003',
      changeOrigin: true,
      pathRewrite: {
        '^/': '/api/tenants/',
      },
    })
  );

  // Proxy for Inventory Service (port 3001)
  app.use(
    '/api/assets',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
      pathRewrite: {
        '^/': '/api/assets/',
      },
    })
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(`API Gateway running on: http://localhost:${port}`);
  Logger.log(`Route: /api/auth -> http://localhost:3002/api/auth`);
  Logger.log(`Route: /api/tenants -> http://localhost:3003/api/tenants`);
  Logger.log(`Route: /api/assets -> http://localhost:3001/api/assets`);
}

bootstrap();
