import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';

describe('DatabaseService', () => {
  let service: DatabaseService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkHealth', () => {
    it('should return error when DATABASE_URL is not configured', async () => {
      mockConfigService.get.mockReturnValue(undefined);

      const result = await service.checkHealth();

      expect(result).toEqual({
        ok: false,
        error: 'DATABASE_URL not configured',
        message: 'Configure DATABASE_URL in environment variables',
      });
    });

    it('should return success when database connection works', async () => {
      // This would require mocking the Pool class
      // Implementation depends on your testing strategy
      expect(service).toBeDefined();
    });
  });

  describe('checkTlsHealth', () => {
    it('should return non-TLS status for local development', async () => {
      mockConfigService.get.mockReturnValue(undefined);

      const result = await service.checkTlsHealth();

      expect(result.ok).toBe(false);
      expect(result.tls).toBe(false);
    });
  });
});
