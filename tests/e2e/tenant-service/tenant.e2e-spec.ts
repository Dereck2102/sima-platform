import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app/app.module';

describe('Tenant Service E2E Tests', () => {
  let app: INestApplication;
  let createdTenantId: string;

  // Unique tenant code for each test run
  const testTenantCode = `tenant-${Date.now()}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/tenants', () => {
    it('should create a new tenant successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tenants')
        .send({
          name: 'E2E Test Tenant',
          code: testTenantCode,
          description: 'Tenant created during E2E testing',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('code');
      expect(response.body.code).toBe(testTenantCode);
      expect(response.body.isActive).toBe(true);

      createdTenantId = response.body.id;
    });

    it('should reject duplicate tenant code', async () => {
      await request(app.getHttpServer())
        .post('/api/tenants')
        .send({
          name: 'Duplicate Tenant',
          code: testTenantCode,
          description: 'Should fail',
        })
        .expect(409);
    });

    it('should reject missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/tenants')
        .send({
          description: 'Missing name and code',
        })
        .expect(400);
    });
  });

  describe('GET /api/tenants', () => {
    it('should get all tenants', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/tenants')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/tenants/:id', () => {
    it('should get tenant by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/tenants/${createdTenantId}`)
        .expect(200);

      expect(response.body.id).toBe(createdTenantId);
      expect(response.body.code).toBe(testTenantCode);
    });

    it('should return 404 for non-existent ID', async () => {
      await request(app.getHttpServer())
        .get('/api/tenants/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('GET /api/tenants/code/:code', () => {
    it('should get tenant by code', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/tenants/code/${testTenantCode}`)
        .expect(200);

      expect(response.body.code).toBe(testTenantCode);
    });

    it('should return 404 for non-existent code', async () => {
      await request(app.getHttpServer())
        .get('/api/tenants/code/non-existent-code')
        .expect(404);
    });
  });

  describe('PATCH /api/tenants/:id', () => {
    it('should update tenant successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/tenants/${createdTenantId}`)
        .send({
          description: 'Updated description from E2E test',
        })
        .expect(200);

      expect(response.body.description).toBe('Updated description from E2E test');
    });

    it('should update tenant settings (JSONB)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/tenants/${createdTenantId}`)
        .send({
          settings: {
            theme: 'dark',
            language: 'es',
          },
        })
        .expect(200);

      expect(response.body.settings).toEqual({
        theme: 'dark',
        language: 'es',
      });
    });
  });

  describe('DELETE /api/tenants/:id', () => {
    it('should soft delete tenant (set isActive to false)', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/tenants/${createdTenantId}`)
        .expect(200);

      // Verify soft delete
      const checkResponse = await request(app.getHttpServer())
        .get(`/api/tenants/${createdTenantId}`)
        .expect(200);

      expect(checkResponse.body.isActive).toBe(false);
    });
  });

  describe('Health Checks', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
    });
  });
});
