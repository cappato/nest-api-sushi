import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { DatabaseService } from '../database/database.service';

describe('HealthController', () => {
  let controller: HealthController;
  let databaseService: DatabaseService;

  const mockDatabaseService = {
    checkHealth: jest.fn(),
    checkTlsHealth: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('healthz', () => {
    it('should return ok status', () => {
      const result = controller.healthz();
      expect(result).toEqual({ ok: true });
    });
  });

  describe('checkDatabase', () => {
    it('should return database health status', async () => {
      const mockResponse = {
        ok: true,
        connection: 'successful',
        now: '2025-09-07T17:06:47.784Z',
        role: 'nest_user',
        db: 'nest_sushi_db',
      };

      mockDatabaseService.checkHealth.mockResolvedValue(mockResponse);

      const result = await controller.checkDatabase();

      expect(databaseService.checkHealth).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should handle database connection errors', async () => {
      const mockErrorResponse = {
        ok: false,
        error: 'Database connection failed',
        message: 'Connection timeout',
      };

      mockDatabaseService.checkHealth.mockResolvedValue(mockErrorResponse);

      const result = await controller.checkDatabase();

      expect(databaseService.checkHealth).toHaveBeenCalled();
      expect(result).toEqual(mockErrorResponse);
    });
  });

  describe('checkDatabaseTls', () => {
    it('should return TLS status for local development', async () => {
      const mockResponse = {
        ok: true,
        tls: false,
        message: 'Non-TLS connection (local development)',
      };

      mockDatabaseService.checkTlsHealth.mockResolvedValue(mockResponse);

      const result = await controller.checkDatabaseTls();

      expect(databaseService.checkTlsHealth).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should return TLS certificate info for production', async () => {
      const mockResponse = {
        ok: true,
        tls: true,
        certificate: {
          subject: 'CN=example.com',
          issuer: 'CN=CA',
          validFrom: '2025-01-01T00:00:00.000Z',
          validTo: '2026-01-01T00:00:00.000Z',
          fingerprint: 'AA:BB:CC',
          serialNumber: '123456789',
        },
        connection: {
          protocol: 'TLSv1.3',
          cipher: { name: 'AES256-GCM-SHA384' },
          authorized: true,
        },
      };

      mockDatabaseService.checkTlsHealth.mockResolvedValue(mockResponse);

      const result = await controller.checkDatabaseTls();

      expect(databaseService.checkTlsHealth).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });
});
