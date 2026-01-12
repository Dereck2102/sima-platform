import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app/app.module';

describe('Auth Service E2E Tests', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;

  // Unique email for each test run to avoid conflicts
  const testEmail = `test-${Date.now()}@e2e.test`;
  const testPassword = 'Test123!';

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

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          fullName: 'E2E Test User',
          role: 'operator',
          tenantId: 'test-tenant-001',
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testEmail);
      expect(response.body.user).not.toHaveProperty('passwordHash');

      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    it('should reject duplicate email registration', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: testEmail,
          password: testPassword,
          fullName: 'Duplicate User',
          role: 'viewer',
          tenantId: 'test-tenant-001',
        })
        .expect(409);

      expect(response.body.message).toContain('already');
    });

    it('should reject invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: testPassword,
          fullName: 'Invalid Email User',
          role: 'viewer',
          tenantId: 'test-tenant-001',
        })
        .expect(400);
    });

    it('should reject missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'missing@fields.com',
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(testEmail);

      // Update tokens for subsequent tests
      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;
    });

    it('should reject invalid password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should reject non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: testPassword,
        })
        .expect(401);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get profile with valid JWT token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('fullName');
      expect(response.body).toHaveProperty('role');
      expect(response.body).toHaveProperty('tenantId');
      expect(response.body.email).toBe(testEmail);
    });

    it('should reject request without token', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/profile')
        .expect(401);
    });

    it('should reject request with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({
          refreshToken: refreshToken,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should reject invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid-refresh-token',
        })
        .expect(401);
    });
  });

  describe('Health Checks', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
    });

    it('should return readiness status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health/ready')
        .expect(200);

      expect(response.body.status).toBe('ready');
    });

    it('should return liveness status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health/live')
        .expect(200);

      expect(response.body.status).toBe('alive');
    });
  });
});
