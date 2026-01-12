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
    allowedHeaders: ['Content-Type', 'Authorization'],
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

  // Swagger Configuration - API Gateway Documentation Hub
  const config = new DocumentBuilder()
    .setTitle('SIMA Platform API Gateway')
    .setDescription(`
      ### SIMA - Integrated Asset Management System
      
      This is the main API Gateway for the SIMA Platform, a SaaS Multi-Tenant B2B system for asset management.
      
      **Architecture:** Event-Driven Microservices
      
      **Individual Service Documentation:**
      - [Auth Service Docs](http://localhost:3002/api/docs) - Authentication & Authorization
      - [Tenant Service Docs](http://localhost:3003/api/docs) - Multi-Tenant Management  
      - [Inventory Service Docs](http://localhost:3001/api/docs) - Asset Inventory
      
      **Available Routes:**
      - \`/api/auth/*\` → Auth Service (port 3002)
      - \`/api/tenants/*\` → Tenant Service (port 3003)
      - \`/api/assets/*\` → Inventory Service (port 3001)
    `)
    .setVersion('2.0.0')
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
  Logger.log(`Route: /api/assets -> http://localhost:3001/api/assets`);
}

bootstrap();
