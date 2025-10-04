import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  url: string;
  pool: {
    max: number;
    idleTimeoutMillis: number;
    connectionTimeoutMillis: number;
  };
}

export default registerAs('database', (): DatabaseConfig => ({
  url: process.env.DATABASE_URL || '',
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || '10', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10),
  },
}));
