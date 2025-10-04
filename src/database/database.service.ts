import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { DatabaseConfig } from '../config/database.config';
import { DatabaseHealthResponseDto } from '../health/dto/health-response.dto';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool;

  constructor(private configService: ConfigService) {
    this.initializePool();
  }

  private initializePool(): void {
    const dbConfig = this.configService.get<DatabaseConfig>('database');

    if (!dbConfig?.url) {
      this.logger.warn('DATABASE_URL not configured. Database endpoints will not work.');
      return;
    }

    this.pool = new Pool({
      connectionString: dbConfig.url,
      ssl: { rejectUnauthorized: false }, // Supabase maneja SSL automáticamente
      max: dbConfig.pool.max,
      idleTimeoutMillis: dbConfig.pool.idleTimeoutMillis,
      connectionTimeoutMillis: dbConfig.pool.connectionTimeoutMillis,
    });

    this.pool.on('error', (err) => {
      this.logger.error('Unexpected error on idle client', err);
    });

    this.logger.log('Database pool initialized successfully');
  }

  getPool(): Pool {
    return this.pool;
  }

  async checkHealth(): Promise<DatabaseHealthResponseDto> {
    try {
      if (!this.pool) {
        return {
          ok: false,
          error: 'DATABASE_URL not configured',
          message: 'Configure DATABASE_URL in environment variables'
        };
      }

      const { rows } = await this.pool.query(`
        SELECT
          NOW() as now,
          CURRENT_USER as role,
          CURRENT_DATABASE() as db,
          VERSION() as version
      `);

      return {
        ok: true,
        connection: 'successful',
        ...rows[0]
      };
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return {
        ok: false,
        error: 'Database connection failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.logger.log('Database pool closed');
    }
  }
}
