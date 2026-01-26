import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('getHealth', () => {
    it('should return gateway health info', () => {
      const appController = app.get<AppController>(AppController);
      const result = appController.getHealth();

      expect(result.status).toBe('ok');
      expect(result.service).toBe('api-gateway');
      expect(typeof result.timestamp).toBe('string');
    });
  });
});
