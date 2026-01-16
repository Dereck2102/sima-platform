import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS configuration - allow all origins for development
  app.enableCors({
    origin: true,  // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
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

  // Proxy for Inventory Service (port 3004)
  app.use(
    '/api/assets',
    createProxyMiddleware({
      target: 'http://localhost:3004',
      changeOrigin: true,
      pathRewrite: {
        '^/': '/api/assets/',
      },
    })
  );

  // Proxy for Search Service (port 3008)
  app.use(
    '/api/search',
    createProxyMiddleware({
      target: 'http://localhost:3008',
      changeOrigin: true,
      pathRewrite: {
        '^/': '/api/search/',
      },
    })
  );

  // Proxy for Notification Service (port 3006)
  app.use(
    '/api/notifications',
    createProxyMiddleware({
      target: 'http://localhost:3006',
      changeOrigin: true,
      pathRewrite: {
        '^/': '/api/notifications/',
      },
    })
  );

  // Proxy for Storage Service (port 3005)
  app.use(
    '/api/storage',
    createProxyMiddleware({
      target: 'http://localhost:3005',
      changeOrigin: true,
      pathRewrite: {
        '^/': '/api/storage/',
      },
    })
  );

  // Proxy for Report Service (port 3007)
  app.use(
    '/api/reports',
    createProxyMiddleware({
      target: 'http://localhost:3007',
      changeOrigin: true,
      pathRewrite: {
        '^/': '/api/reports/',
      },
    })
  );

  // Proxy for Analytics Engine (port 3010) - Python/FastAPI
  app.use(
    '/api/analytics',
    createProxyMiddleware({
      target: 'http://localhost:3010',
      changeOrigin: true,
      pathRewrite: {
        '^/': '/api/analytics/',
      },
    })
  );

  // Proxy for Mobile BFF (port 3011)
  app.use(
    '/api/mobile',
    createProxyMiddleware({
      target: 'http://localhost:3011',
      changeOrigin: true,
      pathRewrite: {
        '^/': '/api/mobile/',
      },
    })
  );

  // Swagger Configuration - API Gateway Documentation Hub
  const config = new DocumentBuilder()
    .setTitle('SIMA Platform API Gateway')
    .setDescription(`
      ### SIMA - Integrated Asset Management System
      
      This is the main API Gateway for the SIMA Platform, a SaaS Multi-Tenant B2B system for asset management.
      
      **Architecture:** Event-Driven Microservices (12 services + 4 MFEs)
      
      **Individual Service Documentation:**
      - [Auth Service Docs](http://localhost:3002/api/docs) - Authentication & Authorization
      - [Tenant Service Docs](http://localhost:3003/api/docs) - Multi-Tenant Management  
      - [Inventory Service Docs](http://localhost:3001/api/docs) - Asset Inventory
      - [Analytics Engine Docs](http://localhost:3010/docs) - Asset Analytics (Python/FastAPI)
      - [Mobile BFF Docs](http://localhost:3011/api/docs) - Mobile Optimized API
      
      **Available Routes:**
      - \`/api/auth/*\` → Auth Service (port 3002)
      - \`/api/tenants/*\` → Tenant Service (port 3003)
      - \`/api/assets/*\` → Inventory Service (port 3001)
      - \`/api/search/*\` → Search Service (port 3008)
      - \`/api/notifications/*\` → Notification Service (port 3006)
      - \`/api/storage/*\` → Storage Service (port 3005)
      - \`/api/reports/*\` → Report Service (port 3007)
      - \`/api/analytics/*\` → Analytics Engine (port 3010) **NEW**
      - \`/api/mobile/*\` → Mobile BFF (port 3011) **NEW**
    `)
    .setVersion('3.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token from /api/auth/login',
        in: 'header',
      },
      'JWT-auth'
    )
    .addTag('Gateway', 'API Gateway information and health checks')
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

  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(`API Gateway running on: http://localhost:${port}`);
  Logger.log(`Route: /api/auth -> http://localhost:3002/api/auth`);
  Logger.log(`Route: /api/tenants -> http://localhost:3003/api/tenants`);
  Logger.log(`Route: /api/assets -> http://localhost:3004/api/assets`);
  Logger.log(`Route: /api/analytics -> http://localhost:3010/api/analytics`);
  Logger.log(`Route: /api/mobile -> http://localhost:3011/api/mobile`);
}

bootstrap();

